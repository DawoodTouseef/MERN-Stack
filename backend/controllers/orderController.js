import Order from "../models/orderModel.js";
import ParentOrder from "../models/parentOrderModel.js";
import Shipment from "../models/courierModel.js";
import Organization from "../models/organizationModel.js";
import Product from "../models/productModel.js";
import taxServiceManager from "../services/thirdPartyTaxService.js";
import PaymentService from "../services/paymentService.js";
import logisticsService from "../services/logisticsService.js";
import notificationManager from "../services/notificationService.js";
import { findVariantById, hasSufficientStock } from "../utils/variantUtils.js";
import { calculatePlatformFee, distributeTaxAndShipping } from "../utils/orderUtils.js";

const paymentService = new PaymentService();

// Utility Function


function generateOrderNumber() {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, notes, taxPrice, shippingPrice, currency } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ error: "No order items provided" });
    }

    // Fetch product details from DB and populate vendor
    const itemsFromDB = await Product.find({
      _id: { $in: orderItems.map((x) => x.productId || x._id) }
    }).populate('vendor');

    if (itemsFromDB.length === 0) {
      return res.status(404).json({ error: "No products found for order" });
    }

    // Validate products and group by vendor
    const vendorMap = new Map(); // vendorId -> [orderItems]
    const dbOrderItems = [];

    // Temporary totals (we will recalculate strictly)
    let calculatedItemsPrice = 0;

    for (const clientItem of orderItems) {
      const productId = clientItem.productId || clientItem._id;
      const dbItem = itemsFromDB.find((p) => p._id.toString() === productId);

      if (!dbItem) {
        throw new Error(`Product not found: ${productId}`);
      }

      // Verify Vendor
      const vendorId = dbItem.vendor ? dbItem.vendor._id.toString() : 'admin'; // 'admin' or null if direct sale

      let finalPrice = dbItem.price;
      let orderItemData = {
        name: dbItem.name,
        qty: clientItem.qty,
        media: dbItem.media,
        product: dbItem._id,
        vendor: dbItem.vendor ? dbItem.vendor._id : null
      };

      // Variant Logic
      if (clientItem.variantId) {
        const variant = findVariantById(dbItem, clientItem.variantId);
        if (!variant) throw new Error(`Variant not found: ${clientItem.variantId}`);
        if (!hasSufficientStock(variant, clientItem.qty)) throw new Error(`Insufficient stock for variant: ${variant.sku}`);

        finalPrice = variant.price;
        orderItemData = {
          ...orderItemData,
          price: finalPrice,
          media: variant.images || dbItem.media,
          variantId: variant._id,
          sku: variant.sku,
          selectedOptions: {
            color: variant.color,
            size: variant.size,
            storage: variant.storage
          }
        };
      } else {
        if (dbItem.countInStock < clientItem.qty) throw new Error(`Insufficient stock for ${dbItem.name}`);
        orderItemData.price = finalPrice;
      }

      calculatedItemsPrice += finalPrice * clientItem.qty;
      dbOrderItems.push(orderItemData);

      // Group by vendor
      // If vendor is null/undefined (admin owned), use 'platform'
      const key = vendorId;
      if (!vendorMap.has(key)) {
        vendorMap.set(key, { vendorId: dbItem.vendor ? dbItem.vendor._id : null, items: [], amount: 0 });
      }

      const group = vendorMap.get(key);
      group.items.push(orderItemData);
      group.amount += finalPrice * clientItem.qty;
    }

    // Calculate Financials (Simplistic split of tax/shipping for now)
    // In strict mode, tax/shipping should be calculated per-vendor.
    // We will use the client provided shipping/tax proportionally or as total for now, 
    // but ideally backend should recalculate this using TaxService + ShippingService.

    // For MVP transparency: We TRUST the client tax/shipping distribution or we split it proportionally?
    // Let's rely on total passed but validate items price.
    // Ideally user sends estimated Tax/Shipping. We will use them for now.

    // Calculate Taxes via TaxService if configured
    let totalTax = Number(taxPrice) || 0;
    try {
      const taxResult = await taxServiceManager.calculateTax({
        customerCode: req.user._id,
        shipTo: {
          line1: shippingAddress.street, // Assuming shippingAddress has these fields
          city: shippingAddress.city,
          region: shippingAddress.state,
          country: shippingAddress.country,
          postalCode: shippingAddress.zipCode
        },
        // We'll pass the simplified line items for now
        lineItems: dbOrderItems.map(item => ({
          amount: item.price * item.qty,
          quantity: item.qty,
          description: item.name,
          taxCode: item.product.taxProductCode || 'P0000000'
        }))
      });

      if (taxResult.success) {
        totalTax = taxResult.totalTax;
      }
    } catch (taxError) {
      console.warn("Tax calculation service failed, falling back to estimated tax:", taxError.message);
    }

    const totalShipping = Number(shippingPrice) || 0;
    const grandTotal = calculatedItemsPrice + totalTax + totalShipping;

    // 1. Create Parent Order
    const parentOrder = new ParentOrder({
      user: req.user._id,
      parentOrderNumber: generateOrderNumber(),
      shippingAddress,
      paymentMethod,
      totalPrice: grandTotal,
      totalTaxPrice: totalTax,
      totalShippingPrice: totalShipping,
      currency: currency || 'USD',
      isPaid: false
    });

    const savedParent = await parentOrder.save();

    // 2. Create Sub-Orders per Vendor
    const subOrderIds = [];

    for (const [vKey, vData] of vendorMap.entries()) {
      const subItemsPrice = vData.amount;

      // Fetch Vendor Organization for Fee and settings
      const vendorOrg = vData.vendorId ? await Organization.findById(vData.vendorId) : null;
      const feePercentage = vendorOrg?.settings?.platformFeePercentage || 10;

      const { allocatedTax, allocatedShipping } = distributeTaxAndShipping(
        subItemsPrice,
        calculatedItemsPrice,
        totalTax,
        totalShipping
      );

      const subTotal = subItemsPrice + allocatedTax + allocatedShipping;
      const fee = calculatePlatformFee(subItemsPrice, feePercentage);
      const earnings = subItemsPrice - fee;

      const subOrder = new Order({
        user: req.user._id,
        parentOrder: savedParent._id,
        vendor: vData.vendorId,
        orderNumber: `${savedParent.parentOrderNumber}-${vKey.slice(-4)}`,
        orderItems: vData.items,
        shippingAddress,
        paymentMethod,
        notes,
        itemsPrice: subItemsPrice,
        taxPrice: allocatedTax,
        shippingPrice: allocatedShipping,
        totalPrice: subTotal,
        currency: currency || 'USD',
        vendorEarnings: earnings,
        platformFee: fee,
        isPaid: false
      });

      const savedSub = await subOrder.save();
      subOrderIds.push(savedSub._id);

      // Update Stock
      for (const item of vData.items) {
        if (item.variantId) {
          await Product.updateOne(
            { _id: item.product, "variants._id": item.variantId },
            { $inc: { "variants.$.countInStock": -item.qty } }
          );
        } else {
          await Product.updateOne({ _id: item.product }, { $inc: { countInStock: -item.qty } });
        }
      }
    }

    // Link sub-orders to parent
    savedParent.subOrders = subOrderIds;
    await savedParent.save();

    // 3. Create Payment Intent for Parent Order
    let paymentIntent = null;
    if (paymentMethod !== 'COD') {
      try {
        paymentIntent = await paymentService.createPaymentIntent({
          amount: grandTotal,
          currency: currency || 'USD', // Now dynamic
          gateway: paymentMethod.toLowerCase(), // Frontend sends "Razorpay", "Stripe", etc.
          paymentMethod: 'card', // Should be dynamic
          orderId: savedParent._id,
          userId: req.user._id,
          customerInfo: {
            email: req.user.email,
            name: req.user.username
          }
        });
      } catch (payError) {
        console.error("Payment intent creation failed:", payError);
        // We still created the order, but payment intent failed. 
        // User can retry payment from order details.
      }
    }

    res.status(201).json({
      ...savedParent.toObject(),
      paymentIntent
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "id username")
      .populate("shippingAddress");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserOrders = async (req, res) => {

  try {
    const orders = await Order.find({ user: req.user._id }).populate("shippingAddress");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const countTotalOrders = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    res.json({ totalOrders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const calculateTotalSales = async (req, res) => {
  try {
    const orders = await Order.find();
    const totalSales = orders.reduce((sum, order) => sum + Number(order.totalPrice), 0);
    res.json({ totalSales });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const calculateTotalSalesByDate = async (req, res) => {
  try {
    const salesByDate = await Order.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt" } },
          totalSales: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json(salesByDate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const calculateSalesByCategory = async (req, res) => {
  try {
    const salesByCategory = await Order.aggregate([
      { $unwind: "$orderItems" },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $lookup: {
          from: "categories",
          localField: "productDetails.category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" },
      {
        $group: {
          _id: "$categoryDetails.name",
          totalSales: { $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] } },
        },
      },
      { $sort: { totalSales: -1 } },
    ]);
    res.json(salesByCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const findOrderById = async (req, res) => {
  try {
    // Try to find as a regular Order
    let order = await Order.findById(req.params.id)
      .populate("user", "username email")
      .populate("shippingAddress");

    if (order) {
      return res.json(order);
    }

    // If not found, check if it's a ParentOrder
    const parentOrder = await ParentOrder.findById(req.params.id)
      .populate("user", "username email")
      .populate("shippingAddress")
      .populate({
        path: 'subOrders',
        populate: { path: 'vendor', select: 'name' }
      });

    if (!parentOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Construct a composite object for frontend compatibility
    // Aggregate all items from sub-orders
    const allItems = [];
    parentOrder.subOrders.forEach(sub => {
      allItems.push(...sub.orderItems);
    });

    const responseOrder = {
      _id: parentOrder._id,
      user: parentOrder.user,
      orderItems: allItems,
      shippingAddress: parentOrder.shippingAddress,
      paymentMethod: parentOrder.paymentMethod,
      paymentResult: parentOrder.paymentResult,
      itemsPrice: parentOrder.totalPrice - parentOrder.totalTaxPrice - parentOrder.totalShippingPrice, // approx
      taxPrice: parentOrder.totalTaxPrice,
      shippingPrice: parentOrder.totalShippingPrice,
      totalPrice: parentOrder.totalPrice,
      isPaid: parentOrder.isPaid,
      paidAt: parentOrder.paidAt,
      isParentOrder: true,
      subOrders: parentOrder.subOrders, // Include sub-orders for advanced UI
      orderStatus: parentOrder.isPaid ? 'Placed' : 'Pending', // Global status
      createdAt: parentOrder.createdAt
    };

    res.json(responseOrder);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markOrderAsPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ error: "Order not found" });

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentStatus = "Completed";
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markOrderAsDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Update order status
    order.orderStatus = "Delivered";
    order.deliveredAt = Date.now();

    // Update tracking information
    if (order.tracking) {
      order.tracking.actualDelivery = new Date();
      order.tracking.events.push({
        timestamp: new Date(),
        status: 'Delivered',
        description: 'Package has been delivered',
        isSystemGenerated: true
      });
    }

    const updatedOrder = await order.save();

    // Send delivery notification
    await notificationManager.sendDeliveryNotification(order._id, {
      deliveredAt: order.deliveredAt,
      signedBy: req.body.signedBy || 'Customer'
    });

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Enhanced Order Tracking Functions

// Update order status with notifications
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, location } = req.body;

    const order = await Order.findById(id).populate('user', 'username email phone');
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Validate status transition
    const validStatuses = ["Placed", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled", "Returned", "Refunded"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid order status" });
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = status;

    // Add tracking event
    if (!order.tracking) {
      order.tracking = { events: [] };
    }

    order.tracking.events.push({
      timestamp: new Date(),
      status: status,
      location: location || {},
      description: notes || `Order status updated to ${status}`,
      isSystemGenerated: false,
      updatedBy: req.user._id
    });

    // Update specific fields based on status
    if (status === 'Confirmed') {
      // Automatically create shipment
      try {
        const shipment = await logisticsService.createShipment({
          order_id: order.orderNumber,
          destination_zip: order.shippingAddress.zipCode,
          destination_name: order.user.username,
          destination_phone: order.user.phone
        }, 'shiprocket');

        if (shipment) {
          if (!order.tracking) order.tracking = {};
          order.tracking.shipmentId = shipment.shipment_id;
          order.tracking.trackingNumber = shipment.tracking_id;
          order.tracking.trackingUrl = shipment.label_url;
          order.tracking.carrier = 'Shiprocket';

          // Legacy fields
          order.trackingNumber = shipment.tracking_id;
          order.shippingCarrier = 'Shiprocket';
          order.trackingUrl = shipment.label_url;

          order.tracking.events.push({
            timestamp: new Date(),
            status: 'Shipment Created',
            description: `Automated shipment created via Shiprocket. Tracking ID: ${shipment.tracking_id}`,
            isSystemGenerated: true
          });
        }
      } catch (logisticsError) {
        console.error("Automated shipment creation failed:", logisticsError.message);
      }
    }

    if (status === 'Delivered') {
      order.deliveredAt = new Date();
      if (order.tracking) {
        order.tracking.actualDelivery = new Date();
      }
    }

    if (status === 'Shipped' && req.body.trackingNumber) {
      if (!order.tracking) order.tracking = {};
      order.tracking.trackingNumber = req.body.trackingNumber;
      order.tracking.carrier = req.body.carrier;
      order.tracking.estimatedDelivery = req.body.estimatedDelivery;

      // Legacy fields for backward compatibility
      order.trackingNumber = req.body.trackingNumber;
      order.shippingCarrier = req.body.carrier;
      order.trackingUrl = req.body.trackingUrl;
    }

    const updatedOrder = await order.save();

    // Send notifications
    await notificationManager.sendOrderNotification(id, status, {
      previousStatus: previousStatus,
      notes: notes,
      location: location,
      trackingNumber: order.tracking?.trackingNumber
    });

    res.json({
      message: "Order status updated successfully",
      order: updatedOrder
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get detailed order tracking information
const getOrderTracking = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('user', 'username email')
      .populate('shippingAddress');

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Get shipment details if available
    let shipmentDetails = null;
    // TODO: Implement Shipment model and uncomment this code
    // if (order.tracking?.trackingNumber) {
    //   shipmentDetails = await Shipment.findOne({
    //     trackingNumber: order.tracking.trackingNumber
    //   }).populate('courier', 'name displayName code logo');
    // }

    const trackingInfo = {
      orderNumber: order.orderNumber,
      status: order.orderStatus,
      tracking: order.tracking || {},
      shipment: shipmentDetails,
      timeline: order.tracking?.events || [],
      deliveryPreferences: order.deliveryPreferences || {},
      estimatedDelivery: order.tracking?.estimatedDelivery,
      actualDelivery: order.tracking?.actualDelivery || order.deliveredAt
    };

    res.json(trackingInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Track order by order number (public endpoint)
const trackOrderByNumber = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { email } = req.query; // For verification

    const order = await Order.findOne({ orderNumber })
      .populate('user', 'email')
      .select('orderNumber orderStatus tracking deliveredAt createdAt');

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Verify email if provided (for guest tracking)
    if (email && order.user.email !== email) {
      return res.status(403).json({ error: "Invalid email for this order" });
    }

    const publicTrackingInfo = {
      orderNumber: order.orderNumber,
      status: order.orderStatus,
      estimatedDelivery: order.tracking?.estimatedDelivery,
      timeline: order.tracking?.events?.map(event => ({
        timestamp: event.timestamp,
        status: event.status,
        description: event.description,
        location: event.location
      })) || [],
      lastUpdated: order.tracking?.lastTrackedAt || order.updatedAt
    };

    res.json(publicTrackingInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add tracking event
const addTrackingEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, description, location } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (!order.tracking) {
      order.tracking = { events: [] };
    }

    order.tracking.events.push({
      timestamp: new Date(),
      status: status,
      location: location || {},
      description: description,
      isSystemGenerated: false,
      updatedBy: req.user._id
    });

    order.tracking.lastTrackedAt = new Date();

    await order.save();

    // Send tracking update notification
    if (order.tracking.trackingNumber) {
      await notificationManager.sendTrackingNotification(
        order.tracking.trackingNumber,
        {
          status: status,
          location: location,
          message: description,
          estimatedDelivery: order.tracking.estimatedDelivery
        }
      );
    }

    res.json({
      message: "Tracking event added successfully",
      event: order.tracking.events[order.tracking.events.length - 1]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update delivery preferences
const updateDeliveryPreferences = async (req, res) => {
  try {
    const { id } = req.params;
    const preferences = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Check if user owns the order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to update this order" });
    }

    order.deliveryPreferences = {
      ...order.deliveryPreferences,
      ...preferences
    };

    await order.save();

    res.json({
      message: "Delivery preferences updated successfully",
      preferences: order.deliveryPreferences
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get orders for the logged-in vendor's organization
const getVendorOrders = async (req, res) => {
  try {
    if (!req.user.organization) {
      return res.status(403).json({ error: "User is not part of an organization" });
    }

    const pageSize = 20;
    const page = Number(req.query.page) || 1;

    const filter = { vendor: req.user.organization };

    // Optional status filtering
    if (req.query.status) {
      filter.orderStatus = req.query.status;
    }

    const count = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate("user", "username email")
      .populate("shippingAddress")
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      orders,
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get orders with advanced filtering and real-time status
const getOrdersWithFilters = async (req, res) => {
  try {
    const {
      status,
      startDate,
      endDate,
      userId,
      orderNumber,
      trackingNumber,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (status) filter.orderStatus = status;
    if (userId) filter.user = userId;
    if (orderNumber) filter.orderNumber = new RegExp(orderNumber, 'i');
    if (trackingNumber) filter['tracking.trackingNumber'] = trackingNumber;

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const orders = await Order.find(filter)
      .populate('user', 'username email')
      .populate('shippingAddress')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Order.countDocuments(filter);

    // Add real-time status indicators
    const ordersWithStatus = orders.map(order => ({
      ...order.toObject(),
      isLate: order.tracking?.estimatedDelivery &&
        new Date() > new Date(order.tracking.estimatedDelivery) &&
        order.orderStatus !== 'Delivered',
      daysSinceOrder: Math.floor((new Date() - order.createdAt) / (1000 * 60 * 60 * 24)),
      lastActivity: order.tracking?.lastTrackedAt || order.updatedAt
    }));

    res.json({
      orders: ordersWithStatus,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      filters: {
        status,
        startDate,
        endDate,
        userId,
        orderNumber,
        trackingNumber
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit order feedback
const submitOrderFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review, isPublic = false } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Check if user owns the order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to review this order" });
    }

    // Check if order is delivered
    if (order.orderStatus !== 'Delivered') {
      return res.status(400).json({ error: "Can only review delivered orders" });
    }

    order.feedback = {
      rating: rating,
      review: review,
      feedbackDate: new Date(),
      isPublic: isPublic
    };

    await order.save();

    res.json({
      message: "Feedback submitted successfully",
      feedback: order.feedback
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Cancel order (Customer only, for pending orders)
// @route   PUT /api/orders/:id/cancel
// @access  Private (Customer)
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Check if user owns the order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to cancel this order" });
    }

    // Only allow cancellation of pending/placed orders
    if (!['Placed', 'Confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({
        error: `Cannot cancel order with status: ${order.orderStatus}. Only pending orders can be cancelled.`
      });
    }

    // Restore stock for cancelled items
    for (const item of order.orderItems) {
      if (item.variantId) {
        await Product.updateOne(
          { _id: item.product, "variants._id": item.variantId },
          { $inc: { "variants.$.countInStock": item.qty } }
        );
      } else {
        await Product.updateOne(
          { _id: item.product },
          { $inc: { countInStock: item.qty } }
        );
      }
    }

    // Update order status
    order.orderStatus = "Cancelled";
    order.cancelledAt = new Date();
    order.cancellationReason = req.body.reason || "Customer requested cancellation";

    // Add tracking event
    if (!order.tracking) {
      order.tracking = { events: [] };
    }
    order.tracking.events.push({
      timestamp: new Date(),
      status: 'Cancelled',
      description: order.cancellationReason,
      isSystemGenerated: false,
      updatedBy: req.user._id
    });

    await order.save();

    // Send cancellation notification
    try {
      await notificationManager.sendOrderNotification(order._id, 'Cancelled', {
        reason: order.cancellationReason
      });
    } catch (notifError) {
      console.error('Notification failed:', notifError.message);
    }

    res.json({
      message: "Order cancelled successfully",
      order
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin
// @access  Private (Admin)
const getAdminOrders = async (req, res) => {
  try {
    const {
      status,
      startDate,
      endDate,
      vendor,
      customer,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (status) filter.orderStatus = status;
    if (vendor) filter.vendor = vendor;
    if (customer) filter.user = customer;

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'username email')
        .populate('vendor', 'name')
        .populate('shippingAddress')
        .sort(sortOptions)
        .limit(parseInt(limit))
        .skip(skip),
      Order.countDocuments(filter)
    ]);

    // Calculate summary statistics
    const stats = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
          averageOrderValue: { $avg: '$totalPrice' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      stats: stats[0] || { totalRevenue: 0, averageOrderValue: 0, totalOrders: 0 }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  createOrder,
  getAllOrders,
  getUserOrders,
  countTotalOrders,
  calculateTotalSales,
  calculateTotalSalesByDate,
  calculateSalesByCategory,
  findOrderById,
  markOrderAsPaid,
  markOrderAsDelivered,
  deleteOrder,
  // Enhanced tracking functions
  updateOrderStatus,
  getOrderTracking,
  trackOrderByNumber,
  addTrackingEvent,
  updateDeliveryPreferences,
  getOrdersWithFilters,
  submitOrderFeedback,
  getVendorOrders,
  // New role-based functions
  cancelOrder,
  getAdminOrders
};
