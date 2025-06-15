import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    offerType: {
      type: String,
      enum: ["flash", "percentage", "flat",  "bank", "bundle","today",'Festival','Lightning'],
      required: true,
    },
    discountValue: Number,
    discountUnit: { type: String, enum: ["percent", "flat"], default: "percent" },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    categories: [{ type: mongoose.Schema.Types.ObjectId,ref:"Category" }],
    brand: {type:mongoose.Schema.Types.ObjectId,ref:"Brand"},
    bankName: String,
    promoCode: String,
    minCartValue: Number,
    startTime: Date,
    endTime: Date,
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Offer", offerSchema);
