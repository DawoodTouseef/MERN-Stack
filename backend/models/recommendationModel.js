import mongoose from "mongoose";

// User Behavior Tracking Schema
const userBehaviorSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  // Behavior Events
  events: [{
    type: {
      type: String,
      enum: [
        "view", "click", "add_to_cart", "purchase", "like", "share", "search", "filter",
        "page_view", "view_section", "product_click", "favorite", "feedback"
      ],
      required: true
    },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    searchQuery: { type: String },
    timestamp: { type: Date, default: Date.now },
    sessionId: { type: String, required: true },
    duration: { type: Number }, // Time spent in seconds
    source: { 
      type: String, 
      enum: ["homepage", "search", "category", "product_page", "cart", "recommendations"],
      default: "homepage"
    },
    metadata: { type: mongoose.Schema.Types.Mixed }
  }],
  
  // Session Information
  sessions: [{
    sessionId: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    deviceType: { type: String, enum: ["desktop", "mobile", "tablet"] },
    userAgent: { type: String },
    ipAddress: { type: String },
    location: {
      country: String,
      state: String,
      city: String
    },
    pageViews: { type: Number, default: 0 },
    totalDuration: { type: Number, default: 0 } // in seconds
  }],
  
  // Preferences (learned from behavior)
  preferences: {
    categories: [{
      category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
      score: { type: Number, default: 0 }, // Interest score 0-100
      lastInteraction: { type: Date }
    }],
    brands: [{
      brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
      score: { type: Number, default: 0 },
      lastInteraction: { type: Date }
    }],
    priceRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 10000 },
      average: { type: Number, default: 0 }
    },
    tags: [{
      tag: { type: String },
      score: { type: Number, default: 0 }
    }]
  },
  
  // Behavioral Patterns
  patterns: {
    shoppingTimes: [{
      hour: { type: Number }, // 0-23
      dayOfWeek: { type: Number }, // 0-6 (Sunday-Saturday)
      frequency: { type: Number, default: 0 }
    }],
    averageSessionDuration: { type: Number, default: 0 },
    purchaseFrequency: { type: Number, default: 0 }, // purchases per month
    cartAbandonmentRate: { type: Number, default: 0 },
    searchPatterns: [{ type: String }] // Common search terms
  }
}, { timestamps: true });

// Product Similarity Schema
const productSimilaritySchema = mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  
  // Similar products with similarity scores
  similarProducts: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    similarityScore: { type: Number, min: 0, max: 1 }, // Cosine similarity score
    similarityType: {
      type: String,
      enum: ["content_based", "collaborative", "hybrid"],
      default: "hybrid"
    },
    features: {
      category: { type: Number, default: 0 },
      brand: { type: Number, default: 0 },
      price: { type: Number, default: 0 },
      tags: { type: Number, default: 0 },
      specifications: { type: Number, default: 0 },
      userBehavior: { type: Number, default: 0 }
    }
  }],
  
  // Metadata
  lastCalculated: { type: Date, default: Date.now },
  totalSimilarProducts: { type: Number, default: 0 },
  version: { type: String, default: "1.0" } // For algorithm versioning
}, { timestamps: true });

// User Similarity Schema (for collaborative filtering)
const userSimilaritySchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  // Similar users
  similarUsers: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    similarityScore: { type: Number, min: 0, max: 1 },
    sharedProducts: { type: Number, default: 0 },
    sharedCategories: { type: Number, default: 0 },
    sharedBrands: { type: Number, default: 0 }
  }],
  
  lastCalculated: { type: Date, default: Date.now }
}, { timestamps: true });

// Recommendation Results Schema
const recommendationSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  // Different types of recommendations
  recommendations: {
    // For you - personalized based on behavior
    forYou: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      score: { type: Number, min: 0, max: 1 },
      reason: { type: String }, // "Based on your interest in Electronics"
      algorithm: { 
        type: String, 
        enum: ["content_based", "collaborative", "hybrid", "trending", "popular"],
        default: "hybrid"
      }
    }],
    
    // Recently viewed based
    basedOnViewed: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      score: { type: Number, min: 0, max: 1 },
      baseProduct: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, // What it's based on
      reason: { type: String }
    }],
    
    // Category-based
    categoryBased: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      score: { type: Number, min: 0, max: 1 },
      category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
      reason: { type: String }
    }],
    
    // Trending products
    trending: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      score: { type: Number, min: 0, max: 1 },
      trendingFactor: { type: String } // "High demand", "Fast selling", etc.
    }],
    
    // Frequently bought together
    frequentlyBoughtTogether: [{
      baseProduct: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      recommendedProducts: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        coOccurrenceScore: { type: Number, min: 0, max: 1 }
      }]
    }],
    
    // Cart recommendations (for checkout)
    cartBased: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      score: { type: Number, min: 0, max: 1 },
      complementaryTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
      reason: { type: String }
    }]
  },
  
  // Metadata
  generatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }, // 24 hours
  version: { type: String, default: "1.0" },
  context: {
    timeOfDay: { type: String },
    dayOfWeek: { type: String },
    season: { type: String },
    userSegment: { type: String }
  },
  performance: {
    generationTime: { type: Number }, // Time taken to generate in ms
    totalRecommendations: { type: Number, default: 0 },
    confidence: { type: Number, min: 0, max: 1, default: 0.5 }
  }
}, { timestamps: true });

// ML Model Performance Tracking
const modelPerformanceSchema = mongoose.Schema({
  modelName: { type: String, required: true },
  version: { type: String, required: true },
  
  // Performance metrics
  metrics: {
    precision: { type: Number, min: 0, max: 1 },
    recall: { type: Number, min: 0, max: 1 },
    f1Score: { type: Number, min: 0, max: 1 },
    clickThroughRate: { type: Number, min: 0, max: 1 },
    conversionRate: { type: Number, min: 0, max: 1 },
    diversityScore: { type: Number, min: 0, max: 1 },
    noveltyScore: { type: Number, min: 0, max: 1 }
  },
  
  // Training data info
  trainingData: {
    totalUsers: { type: Number },
    totalProducts: { type: Number },
    totalInteractions: { type: Number },
    timeRange: {
      start: { type: Date },
      end: { type: Date }
    }
  },
  
  // Test results
  testResults: [{
    testDate: { type: Date, default: Date.now },
    sampleSize: { type: Number },
    successRate: { type: Number, min: 0, max: 1 },
    avgResponseTime: { type: Number }, // in ms
    errorCount: { type: Number, default: 0 }
  }],
  
  status: { 
    type: String, 
    enum: ["training", "active", "deprecated", "testing"],
    default: "training"
  },
  deployedAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

// Indexes for performance
userBehaviorSchema.index({ user: 1, "events.timestamp": -1 });
userBehaviorSchema.index({ "events.product": 1, "events.type": 1 });
userBehaviorSchema.index({ "sessions.sessionId": 1 });

productSimilaritySchema.index({ product: 1 });
productSimilaritySchema.index({ "similarProducts.product": 1 });

userSimilaritySchema.index({ user: 1 });
userSimilaritySchema.index({ "similarUsers.user": 1 });

recommendationSchema.index({ user: 1 });
recommendationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
recommendationSchema.index({ generatedAt: -1 });

modelPerformanceSchema.index({ modelName: 1, version: 1 });
modelPerformanceSchema.index({ status: 1 });

// Create models
const UserBehavior = mongoose.model("UserBehavior", userBehaviorSchema);
const ProductSimilarity = mongoose.model("ProductSimilarity", productSimilaritySchema);
const UserSimilarity = mongoose.model("UserSimilarity", userSimilaritySchema);
const Recommendation = mongoose.model("Recommendation", recommendationSchema);
const ModelPerformance = mongoose.model("ModelPerformance", modelPerformanceSchema);

export { UserBehavior, ProductSimilarity, UserSimilarity, Recommendation, ModelPerformance };