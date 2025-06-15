import mongoose from "mongoose";

const pageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true }, // e.g., "summer-sale"
    route: { type: String, required: true },              // e.g., "/summer-sale"
    content: { type: mongoose.Schema.Types.Mixed, required: true }, // JSON blocks
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    publishDate: { type: Date, default: Date.now },
    expiryDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Page", pageSchema);
