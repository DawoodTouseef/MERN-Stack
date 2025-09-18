import mongoose from "mongoose";

// Enhanced Offer Schema with advanced features
const offerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    
    // Offer Classification
    offerType: {
      type: String,
      enum: ["flash", "percentage", "flat", "bank", "bundle", "today", "Festival", "Lightning", "surge", "clearance", "seasonal", "loyalty"],
      required: true,
    },
    
    // Discount Configuration
    discountValue: Number,
    discountUnit: { type: String, enum: ["percent", "flat"], default: "percent" },
    maxDiscountAmount: { type: Number }, // Cap for percentage discounts
    
    // Advanced Pricing Rules
    pricingRules: {
      // Tiered discounts based on quantity
      quantityTiers: [{
        minQuantity: { type: Number, required: true },
        maxQuantity: { type: Number },
        discountPercent: { type: Number, required: true }
      }],
      
      // Time-based dynamic pricing
      timeSlots: [{
        startTime: { type: String }, // HH:MM format
        endTime: { type: String },
        multiplier: { type: Number, default: 1 }, // Price multiplier
        isActive: { type: Boolean, default: true }
      }],
      
      // Surge pricing based on demand
      surgePricing: {
        isEnabled: { type: Boolean, default: false },
        baseThreshold: { type: Number, default: 100 }, // Base demand threshold
        maxMultiplier: { type: Number, default: 3 }, // Maximum surge multiplier
        currentDemand: { type: Number, default: 0 },
        surgeMultiplier: { type: Number, default: 1 }
      }
    },
    
    // Target Scope
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    
    // Geographic and Customer Targeting
    targetAudience: {
      countries: [{ type: String }],
      states: [{ type: String }],
      cities: [{ type: String }],
      customerSegments: [{
        type: String,
        enum: ["new", "returning", "vip", "bulk_buyer", "seasonal"]
      }],
      minOrderValue: { type: Number, default: 0 },
      maxOrderValue: { type: Number }
    },
    
    // Special Offer Configurations
    bankName: String,
    promoCode: String,
    
    // Usage Limits
    usageRestrictions: {
      totalUsageLimit: { type: Number }, // Global usage limit
      perUserLimit: { type: Number, default: 1 }, // Per user usage limit
      currentUsage: { type: Number, default: 0 },
      minCartValue: { type: Number, default: 0 },
      
      // Product restrictions
      excludeProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
      excludeCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
      
      // User restrictions
      eligibleUserRoles: [{
        type: String,
        enum: ["customer", "vendor", "seller", "admin"]
      }]
    },
    
    // Time Management
    startTime: Date,
    endTime: Date,
    timezone: { type: String, default: "UTC" },
    
    // Flash Sale Specific
    flashSaleConfig: {
      isFlashSale: { type: Boolean, default: false },
      flashDuration: { type: Number }, // Duration in minutes
      stockLimit: { type: Number }, // Limited stock for flash sale
      currentStock: { type: Number, default: 0 },
      maxQuantityPerUser: { type: Number, default: 1 },
      
      // Pre-sale configuration
      hasPreSale: { type: Boolean, default: false },
      preSaleStart: { type: Date },
      preSaleDiscount: { type: Number, default: 0 },
      
      // Countdown and urgency
      showCountdown: { type: Boolean, default: true },
      urgencyMessage: { type: String }
    },
    
    // Bundle Offers
    bundleConfig: {
      isBundle: { type: Boolean, default: false },
      bundleType: {
        type: String,
        enum: ["buy_x_get_y", "fixed_bundle", "mix_match"],
        default: "fixed_bundle"
      },
      buyQuantity: { type: Number, default: 1 },
      getQuantity: { type: Number, default: 1 },
      bundleProducts: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 },
        isRequired: { type: Boolean, default: false }
      }]
    },
    
    // Status and Visibility
    isActive: { type: Boolean, default: true },
    isVisible: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    
    // Priority and Stacking
    priority: { type: Number, default: 1 }, // Higher number = higher priority
    canStackWithOther: { type: Boolean, default: false },
    exclusiveOffers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Offer" }],
    
    // Analytics and Performance
    analytics: {
      views: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      
      // Conversion tracking by time
      hourlyStats: [{
        hour: { type: Number }, // 0-23
        views: { type: Number, default: 0 },
        conversions: { type: Number, default: 0 }
      }]
    },
    
    // Notifications and Communication
    notifications: {
      sendStartNotification: { type: Boolean, default: false },
      sendEndNotification: { type: Boolean, default: false },
      reminderBeforeEnd: { type: Number, default: 0 }, // Minutes before end
      
      // Notification templates
      startMessage: { type: String },
      endMessage: { type: String },
      reminderMessage: { type: String }
    },
    
    // A/B Testing
    abTesting: {
      isEnabled: { type: Boolean, default: false },
      variants: [{
        name: { type: String },
        discountValue: { type: Number },
        trafficPercentage: { type: Number }, // 0-100
        conversions: { type: Number, default: 0 },
        revenue: { type: Number, default: 0 }
      }]
    },
    
    // Approval Workflow
    approval: {
      status: {
        type: String,
        enum: ["draft", "pending", "approved", "rejected", "expired"],
        default: "draft"
      },
      requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      approvedAt: { type: Date },
      rejectionReason: { type: String }
    },
    
    // User Interaction Tracking
    userInteractions: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      action: {
        type: String,
        enum: ["view", "click", "add_to_cart", "purchase", "share"]
      },
      timestamp: { type: Date, default: Date.now },
      metadata: { type: mongoose.Schema.Types.Mixed }
    }],
    
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Price History Schema for dynamic pricing tracking
const priceHistorySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  originalPrice: { type: Number, required: true },
  currentPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  
  // Price change reason
  reason: {
    type: String,
    enum: ["flash_sale", "surge_pricing", "clearance", "seasonal", "manual", "algorithm"],
    required: true
  },
  
  // Associated offer
  offer: { type: mongoose.Schema.Types.ObjectId, ref: "Offer" },
  
  // Time-based data
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  
  // Performance metrics
  salesCount: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

// Flash Sale Session Schema for managing concurrent flash sales
const flashSaleSessionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  
  // Session timing
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  
  // Session configuration
  maxConcurrentOffers: { type: Number, default: 5 },
  intervalBetweenOffers: { type: Number, default: 30 }, // Minutes
  
  // Offers in this session
  offers: [{
    offer: { type: mongoose.Schema.Types.ObjectId, ref: "Offer" },
    scheduledStart: { type: Date },
    scheduledEnd: { type: Date },
    status: {
      type: String,
      enum: ["scheduled", "active", "completed", "cancelled"],
      default: "scheduled"
    }
  }],
  
  // Session analytics
  totalViews: { type: Number, default: 0 },
  totalConversions: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

const Offer = mongoose.model("Offer", offerSchema);
const PriceHistory = mongoose.model("PriceHistory", priceHistorySchema);
const FlashSaleSession = mongoose.model("FlashSaleSession", flashSaleSessionSchema);

export default Offer;
export { PriceHistory, FlashSaleSession };
