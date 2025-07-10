import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

const productSchema = mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: ObjectId, ref: "Brand", required: true },
  category: { type: ObjectId, ref: "Category", required: true },
  description: { type: String, required: true },
  price:{type:Number,required:true},
  variants: [
    {
      sku: String,
      color: String,
      size: String,
      storage: String,
      price: Number,
      countInStock: Number,
      images: [String]
    }
  ],
  countInStock:{type:Number,required:true},
  quantity:{type:Number,required:true},
  media: [
    { type: { type: String, enum: ["image", "video"], default: "image" }, url: String }
  ],

  specifications: mongoose.Schema.Types.Mixed,
  tags: [String],
  warrantyPeriod: String,
  returnPolicy: String,
  reviews: [reviewSchema],
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  taxProductCode: { type: String }, // e.g., "MOB123" for tax classification
  countryOfOrigin: { type: String }, // Optional: for international rules

  user: { type: ObjectId, required: true, ref: "User" },
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
export default Product;