
import mongoose from "mongoose";

const parentOrderSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    parentOrderNumber: { type: String, unique: true },

    // References to child orders (vendor specific)
    subOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],

    shippingAddress: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Address" },

    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, default: "Pending" },
    paymentResult: {
        id: String,
        status: String,
        update_time: String,
        email_address: String,
    },

    // Aggregated totals
    totalPrice: { type: Number, required: true, default: 0.0 },
    totalTaxPrice: { type: Number, required: true, default: 0.0 },
    totalShippingPrice: { type: Number, required: true, default: 0.0 },
    currency: { type: String, required: true, default: "USD" },

    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },

    params: { type: Map, of: String } // For flexibility
}, { timestamps: true });

// Indexes
parentOrderSchema.index({ user: 1 });
parentOrderSchema.index({ parentOrderNumber: 1 }, { unique: true });
parentOrderSchema.index({ createdAt: -1 });

const ParentOrder = mongoose.model("ParentOrder", parentOrderSchema);
export default ParentOrder;
