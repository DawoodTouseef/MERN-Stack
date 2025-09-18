import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 2000 },
    title: { type: String, maxlength: 200 },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    
    // Purchase Verification
    isVerifiedPurchase: { type: Boolean, default: false },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    purchaseDate: { type: Date },
    
    // Review Media
    images: [{
      url: { type: String },
      caption: { type: String },
      isApproved: { type: Boolean, default: true }
    }],
    videos: [{
      url: { type: String },
      thumbnail: { type: String },
      caption: { type: String },
      isApproved: { type: Boolean, default: true }
    }],
    
    // Review Quality & Moderation
    isApproved: { type: Boolean, default: true },
    moderationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "flagged"],
      default: "approved"
    },
    moderationReason: { type: String },
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    moderatedAt: { type: Date },
    
    // Helpfulness Voting
    helpfulVotes: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      isHelpful: { type: Boolean }, // true for helpful, false for not helpful
      votedAt: { type: Date, default: Date.now }
    }],
    helpfulCount: { type: Number, default: 0 },
    notHelpfulCount: { type: Number, default: 0 },
    
    // Review Metrics
    viewCount: { type: Number, default: 0 },
    reportCount: { type: Number, default: 0 },
    reports: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reason: {
        type: String,
        enum: ["spam", "inappropriate", "fake", "offensive", "other"]
      },
      description: { type: String },
      reportedAt: { type: Date, default: Date.now }
    }],
    
    // Review Features
    pros: [{ type: String }],
    cons: [{ type: String }],
    
    // Product Usage Context
    usageContext: {
      howLongUsed: {
        type: String,
        enum: ["less_than_week", "1_to_4_weeks", "1_to_3_months", "3_to_6_months", "6_months_to_year", "more_than_year"]
      },
      useCase: { type: String }, // "gaming", "work", "casual", etc.
      recommendation: {
        type: String,
        enum: ["highly_recommend", "recommend", "neutral", "not_recommend", "strongly_not_recommend"]
      }
    },
    
    // Quality Indicators
    qualityScore: { type: Number, default: 0, min: 0, max: 100 },
    isEdited: { type: Boolean, default: false },
    editHistory: [{
      editedAt: { type: Date },
      previousComment: { type: String },
      previousRating: { type: Number },
      reason: { type: String }
    }],
    
    // Retailer Response
    vendorResponse: {
      comment: { type: String },
      respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      respondedAt: { type: Date },
      isPublic: { type: Boolean, default: true }
    }
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
  vendor: { type: ObjectId, ref: "Vendor" }, // Add vendor reference
}, { timestamps: true });

// Add index for vendor field
productSchema.index({ vendor: 1 });

const Product = mongoose.model("Product", productSchema);
export default Product;