import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import { Shipment } from "../models/courierModel.js";
import notificationManager from "../services/notificationService.js";
import { findVariantById, hasSufficientStock } from "../utils/variantUtils.js";

// Utility Function


function generateOrderNumber() {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, notes } = req.body;
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ error: "No order items provided" });
    }

    // Fetch product details from the database
    const itemsFromDB = await Product.find({ _id: { $in: orderItems.map((x) => x.productId || x._id) } });

    const dbOrderItems = [];
    
    // Process each order item
    for (const clientItem of orderItems) {
      const productId = clientItem.productId || clientItem._id;
      const dbItem = itemsFromDB.find((p) => p._id.toString() === productId);
      
      if (!dbItem) {
        throw new Error(`Product not found: ${productId}`);
      }
      
      // Check if this is a variant order
      if (clientItem.variantId) {
        // Find the specific variant using utility function
        const variant = findVariantById(dbItem, clientItem.variantId);
        
        if (!variant) {
          throw new Error(`Variant not found: ${clientItem.variantId}`);
        }
        
        // Check stock for the variant using utility function
        if (!hasSufficientStock(variant, clientItem.qty)) {
          throw new Error(`Insufficient stock for variant: ${variant.sku}`);
        }
        
        // Add variant details to order item
        dbOrderItems.push({
          name: dbItem.name,
          qty: clientItem.qty,
          media: variant.images || dbItem.media, // Use variant images if available
          price: variant.price,
          product: dbItem._id,
          variantId: variant._id,
          sku: variant.sku,
          selectedOptions: {
            color: variant.color,
            size: variant.size,
            storage: variant.storage
          }
        });
      } else {
        // Regular product order (no variant)
        dbOrderItems.push({
          name: dbItem.name,
          qty: clientItem.qty,
          media: dbItem.media,
          price: dbItem.price,
          product: dbItem._id,
        });
      }
    }

    const {  itemsPrice ,
        shippingPrice ,
        taxPrice,
        totalPrice
      } = req.body
    const order = new Order({
      user: req.user._id,
      orderNumber: generateOrderNumber(),
      orderItems: dbOrderItems,
      shippingAddress,
      paymentMethod,
      notes,
      itemsPrice,
  taxPrice,
  shippingPrice,
  totalPrice,
    });

    const createdOrder = await order.save();

    // Update product stock
    for (const item of dbOrderItems) {
      if (item.variantId) {
        // Reduce stock from the specific variant
        await Product.updateOne(
          { _id: item.product, "variants._id": item.variantId },
          { $inc: { "variants.$.countInStock": -item.qty } }
        );
      } else {
        // Reduce stock from the main product
        await Product.updateOne({ _id: item.product }, { $inc: { countInStock: -item.qty } });
      }
    }

    res.status(201).json(createdOrder);
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
    const order = await Order.findById(req.params.id)
      .populate("user", "username email")
      .populate("shippingAddress");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
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
    if (order.tracking?.trackingNumber) {
      shipmentDetails = await Shipment.findOne({ 
        trackingNumber: order.tracking.trackingNumber 
      }).populate('courier', 'name displayName code logo');
    }
    
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
  submitOrderFeedback
};
