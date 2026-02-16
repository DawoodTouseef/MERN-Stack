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
  brand: { type: ObjectId, ref: "Brand" },
  category: { type: ObjectId, ref: "Category" },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  // Multi-currency pricing
  currency: { type: String, default: "USD" },
  variants: [
    {
      sku: String,
      color: String,
      size: String,
      storage: String,
      price: Number,
      prices: {
        type: Map,
        of: Number,
        default: {}
      },
      countInStock: Number,
      images: [String],
      // Shipping information
      shippingWeight: { type: Number },
      shippingLength: { type: Number },
      shippingWidth: { type: Number },
      shippingHeight: { type: Number },
      shippingClass: { type: String },
    }
  ],
  countInStock: { type: Number, required: true },
  quantity: { type: Number, required: true },
  specifications: mongoose.Schema.Types.Mixed,
  tags: [String],
  warrantyPeriod: String,
  returnPolicy: String,
  reviews: [reviewSchema],
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  taxProductCode: { type: String }, // e.g., "MOB123" for tax classification
  countryOfOrigin: { type: String }, // Optional: for international rules

  // New fields for tax and shipping
  isTaxable: { type: Boolean, default: true },
  taxCategory: { type: String },
  taxExempt: { type: Boolean, default: false },

  // Shipping information
  shippingWeight: { type: Number },
  shippingLength: { type: Number },
  shippingWidth: { type: Number },
  shippingHeight: { type: Number },
  shippingClass: { type: String },

  user: { type: ObjectId, required: true, ref: "User" },
  vendor: { type: ObjectId, ref: "Organization" },

  isActive: { type: Boolean, default: true },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

// Add indexes for performance
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ user: 1 });
productSchema.index({ vendor: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ price: 1 });
productSchema.index({ countInStock: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

const Product = mongoose.model("Product", productSchema);
export default Product;