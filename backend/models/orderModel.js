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
      // Variant information
      variantId: { type: mongoose.Schema.Types.ObjectId },
      sku: { type: String },
      selectedOptions: {
        color: { type: String },
        size: { type: String },
        storage: { type: String }
      },
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
    enum: ["Placed", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled", "Returned", "Refunded"],
    default: "Placed"
  },
  
  // Enhanced tracking information
  tracking: {
    trackingNumber: { type: String },
    carrier: { type: String },
    trackingUrl: { type: String },
    shipmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Shipment" },
    estimatedDelivery: { type: Date },
    actualDelivery: { type: Date },
    lastTrackedAt: { type: Date },
    
    // Tracking events timeline
    events: [{
      timestamp: { type: Date, required: true },
      status: { type: String, required: true },
      location: {
        city: String,
        state: String,
        country: String,
        coordinates: {
          latitude: Number,
          longitude: Number
        }
      },
      description: { type: String, required: true },
      isSystemGenerated: { type: Boolean, default: false },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    }]
  },
  
  deliveredAt: { type: Date },

  // Legacy tracking fields (for backward compatibility)
  trackingNumber: String,
  shippingCarrier: String,
  trackingUrl: String,
  
  // Enhanced order features
  priority: {
    type: String,
    enum: ["low", "normal", "high", "urgent"],
    default: "normal"
  },
  
  // Delivery preferences
  deliveryPreferences: {
    preferredTimeSlot: {
      start: String, // e.g., "09:00"
      end: String   // e.g., "17:00"
    },
    deliveryInstructions: String,
    signatureRequired: { type: Boolean, default: false },
    leaveAtDoor: { type: Boolean, default: false },
    securityCode: String
  },
  
  // Communication preferences
  notifications: {
    sms: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    whatsapp: { type: Boolean, default: false }
  },
  
  // Customer communication log
  communications: [{
    type: {
      type: String,
      enum: ["sms", "email", "push", "call", "whatsapp"],
      required: true
    },
    message: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["sent", "delivered", "read", "failed"],
      default: "sent"
    },
    templateId: String,
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  }],

  notes: String,
  
  // Return and refund information
  returnInfo: {
    isReturned: { type: Boolean, default: false },
    returnReason: String,
    returnDate: Date,
    refundAmount: Number,
    refundDate: Date,
    returnTrackingNumber: String
  },
  
  // Customer feedback
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    review: String,
    feedbackDate: Date,
    isPublic: { type: Boolean, default: false }
  }

}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;
