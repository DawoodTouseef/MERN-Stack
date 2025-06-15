import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },

  orderNumber: { type: String, unique: true },
  
  orderItems: [
    {
      name: { type: String, required: true },
      qty: { type: Number, required: true },
      media: [
    { type: { type: String, enum: ["image", "video"], default: "image" }, url: String }
  ],
      price: { type: Number, required: true },
      product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Product" },
    }
  ],

  shippingAddress: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Address" },

  paymentMethod: {
    type: String,
    enum: ["COD", "Razorpay", "Stripe", "PayPal", "UPI"],
    required: true
  },

  paymentStatus: {
    type: String,
    enum: ["Pending", "Completed", "Failed", "Refunded"],
    default: "Pending"
  },

  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String,
  },

  itemsPrice: { type: Number, required: true, default: 0.0 },
  taxPrice: { type: Number, required: true, default: 0.0 },
  shippingPrice: { type: Number, required: true, default: 0.0 },
  totalPrice: { type: Number, required: true, default: 0.0 },

  isPaid: { type: Boolean, required: true, default: false },
  paidAt: { type: Date },

  orderStatus: {
    type: String,
    enum: ["Placed", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled", "Returned"],
    default: "Placed"
  },
  deliveredAt: { type: Date },

  trackingNumber: String,
  shippingCarrier: String,
  trackingUrl: String,

  notes: String,

}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;
