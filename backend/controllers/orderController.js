import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";

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
    const itemsFromDB = await Product.find({ _id: { $in: orderItems.map((x) => x._id) } });

    const dbOrderItems = orderItems.map((clientItem) => {
      const dbItem = itemsFromDB.find((p) => p._id.toString() === clientItem._id);
      if (!dbItem) {
        throw new Error(`Product not found: ${clientItem._id}`);
      }
      return {
        name: dbItem.name,
        qty: clientItem.qty,
        media: dbItem.media, // Ensure this field is populated
        price: dbItem.price,
        product: dbItem._id,
      };
    });

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
      await Product.updateOne({ _id: item.product }, { $inc: { countInStock: -item.qty } });
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

    order.orderStatus = "Delivered";
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();
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
};
