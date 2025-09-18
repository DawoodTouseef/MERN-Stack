import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const dynamicPricingSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  pricingType: {
    type: String,
    enum: [
      'flash_sale',       // Limited time flash sales
      'surge_pricing',    // Demand-based pricing
      'quantity_tier',    // Volume discounts
      'time_based',       // Time-of-day pricing
      'location_based',   // Geographic pricing
      'bundle_offer',     // Bundle deals
      'loyalty_pricing',  // Loyalty member pricing
      'clearance',        // Clearance pricing
      'seasonal',         // Seasonal pricing
      'competitor_match', // Price matching
      'dynamic_demand'    // AI-driven demand pricing
    ],
    required: true
  },
  
  // Target criteria
  targets: {
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    brands: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Brand' }],
    vendors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    userSegments: [{
      type: String,
      enum: ['new_customer', 'returning_customer', 'vip', 'bulk_buyer', 'loyalty_member', 'all']
    }],
    locations: [{
      country: String,
      state: String,
      city: String,
      zipCode: String
    }]
  },
  
  // Pricing rules
  pricingRules: {
    discountType: {
      type: String,
      enum: ['percentage', 'fixed_amount', 'buy_x_get_y', 'tiered'],
      required: true
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0
    },
    
    // Tiered pricing
    tiers: [{
      minQuantity: { type: Number, min: 1 },
      maxQuantity: { type: Number },
      discountValue: { type: Number, min: 0 },
      discountType: { type: String, enum: ['percentage', 'fixed_amount'] }
    }],
    
    // Bundle rules
    bundleRules: {
      minItems: { type: Number, min: 2 },
      buyQuantity: { type: Number },
      getQuantity: { type: Number },
      freeProductIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
    },
    
    // Maximum discount limits
    maxDiscountAmount: { type: Number },
    maxDiscountPercentage: { type: Number, max: 100 },
    
    // Minimum requirements
    minOrderValue: { type: Number, default: 0 },
    minQuantity: { type: Number, default: 1 },
    
    // Surge pricing factors
    surgeFactor: { type: Number, min: 1, max: 5 }, // Multiplier for high demand
    demandThreshold: { type: Number } // Demand level to trigger surge
  },
  
  // Time constraints
  schedule: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    
    // Specific time windows
    timeWindows: [{
      dayOfWeek: { type: Number, min: 0, max: 6 }, // 0 = Sunday
      startTime: { type: String }, // Format: "HH:MM"
      endTime: { type: String },   // Format: "HH:MM"
      timezone: { type: String, default: 'UTC' }
    }],
    
    // Flash sale specific
    flashSaleConfig: {
      duration: { type: Number }, // Duration in minutes
      maxQuantity: { type: Number }, // Max items on sale
      soldQuantity: { type: Number, default: 0 },
      isActive: { type: Boolean, default: false },
      countdownTimer: { type: Boolean, default: true }
    }
  },
  
  // Conditions and triggers
  conditions: {
    // Stock level conditions
    stockThreshold: {
      minStock: { type: Number },
      maxStock: { type: Number }
    },
    
    // Demand conditions
    demandMetrics: {
      viewCount: { type: Number },
      cartAdditions: { type: Number },
      searchFrequency: { type: Number }
    },
    
    // Weather conditions (for seasonal items)
    weatherConditions: [{
      condition: { type: String, enum: ['sunny', 'rainy', 'snowy', 'hot', 'cold'] },
      locations: [String]
    }],
    
    // Competitor pricing
    competitorPricing: {
      enabled: { type: Boolean, default: false },
      targetCompetitors: [String],
      matchingStrategy: { 
        type: String, 
        enum: ['match_exactly', 'beat_by_percentage', 'beat_by_amount'],
        default: 'match_exactly'
      },
      beatBy: { type: Number } // Percentage or amount to beat competitor
    }
  },
  
  // Usage limits
  usageLimits: {
    maxUsagePerCustomer: { type: Number },
    maxTotalUsage: { type: Number },
    currentUsage: { type: Number, default: 0 },
    maxUsagePerDay: { type: Number },
    dailyUsage: [{
      date: { type: Date },
      count: { type: Number }
    }]
  },
  
  // Performance tracking
  performance: {
    totalSales: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    clickThroughRate: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 }
  },
  
  // Status and priority
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'expired'],
    default: 'draft'
  },
  priority: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  
  // Auto-management
  autoManagement: {
    autoActivate: { type: Boolean, default: false },
    autoDeactivate: { type: Boolean, default: true },
    autoExtend: { type: Boolean, default: false },
    extendConditions: {
      minConversionRate: { type: Number },
      minRevenue: { type: Number }
    }
  },
  
  // Notifications
  notifications: {
    alertBeforeStart: { type: Number }, // Minutes before start
    alertBeforeEnd: { type: Number },   // Minutes before end
    alertOnThreshold: { type: Number }, // Usage percentage to alert
    notifyStakeholders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  
  // A/B Testing
  abTesting: {
    enabled: { type: Boolean, default: false },
    variants: [{
      name: String,
      trafficPercentage: { type: Number, min: 0, max: 100 },
      pricingRules: mongoose.Schema.Types.Mixed,
      performance: {
        conversions: { type: Number, default: 0 },
        revenue: { type: Number, default: 0 }
      }
    }]
  },
  
  // Metadata
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags: [String],
  notes: String
}, {
  timestamps: true
});

// Indexes for performance
dynamicPricingSchema.index({ status: 1, 'schedule.startDate': 1, 'schedule.endDate': 1 });
dynamicPricingSchema.index({ pricingType: 1, status: 1 });
dynamicPricingSchema.index({ 'targets.products': 1, status: 1 });
dynamicPricingSchema.index({ 'targets.categories': 1, status: 1 });
dynamicPricingSchema.index({ priority: -1, status: 1 });
dynamicPricingSchema.index({ 'schedule.flashSaleConfig.isActive': 1 });

// Virtual for checking if pricing is currently active
dynamicPricingSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  return this.status === 'active' && 
         this.schedule.startDate <= now && 
         this.schedule.endDate >= now;
});

// Virtual for remaining time
dynamicPricingSchema.virtual('timeRemaining').get(function() {
  if (!this.isCurrentlyActive) return 0;
  return Math.max(0, this.schedule.endDate - new Date());
});

// Pre-save middleware to handle auto-management
dynamicPricingSchema.pre('save', function(next) {
  const now = new Date();
  
  // Auto-activate if conditions met
  if (this.autoManagement.autoActivate && 
      this.status === 'draft' && 
      this.schedule.startDate <= now) {
    this.status = 'active';
  }
  
  // Auto-deactivate if expired
  if (this.autoManagement.autoDeactivate && 
      this.status === 'active' && 
      this.schedule.endDate <= now) {
    this.status = 'completed';
  }
  
  next();
});

// Methods for pricing calculations
dynamicPricingSchema.methods.calculateDiscount = function(originalPrice, quantity = 1, userSegment = 'all') {
  // Check if user segment matches
  if (this.targets.userSegments.length > 0 && 
      !this.targets.userSegments.includes(userSegment) && 
      !this.targets.userSegments.includes('all')) {
    return { discount: 0, finalPrice: originalPrice };
  }
  
  let discount = 0;
  
  switch (this.pricingRules.discountType) {
    case 'percentage':
      discount = (originalPrice * this.pricingRules.discountValue) / 100;
      break;
      
    case 'fixed_amount':
      discount = this.pricingRules.discountValue;
      break;
      
    case 'tiered':
      const tier = this.pricingRules.tiers.find(t => 
        quantity >= t.minQuantity && (!t.maxQuantity || quantity <= t.maxQuantity)
      );
      if (tier) {
        discount = tier.discountType === 'percentage' 
          ? (originalPrice * tier.discountValue) / 100
          : tier.discountValue;
      }
      break;
  }
  
  // Apply limits
  if (this.pricingRules.maxDiscountAmount) {
    discount = Math.min(discount, this.pricingRules.maxDiscountAmount);
  }
  
  if (this.pricingRules.maxDiscountPercentage) {
    const maxDiscount = (originalPrice * this.pricingRules.maxDiscountPercentage) / 100;
    discount = Math.min(discount, maxDiscount);
  }
  
  const finalPrice = Math.max(0, originalPrice - discount);
  
  return { discount, finalPrice, savingsPercentage: (discount / originalPrice) * 100 };
};

// Method to check if pricing applies to product
dynamicPricingSchema.methods.appliesTo = function(productId, categoryId, brandId, vendorId) {
  // Check product targeting
  if (this.targets.products.length > 0) {
    return this.targets.products.some(p => p.toString() === productId.toString());
  }
  
  // Check category targeting
  if (this.targets.categories.length > 0 && categoryId) {
    return this.targets.categories.some(c => c.toString() === categoryId.toString());
  }
  
  // Check brand targeting
  if (this.targets.brands.length > 0 && brandId) {
    return this.targets.brands.some(b => b.toString() === brandId.toString());
  }
  
  // Check vendor targeting
  if (this.targets.vendors.length > 0 && vendorId) {
    return this.targets.vendors.some(v => v.toString() === vendorId.toString());
  }
  
  return false;
};

// Static method to find active pricings for product
dynamicPricingSchema.statics.findActivePricingsForProduct = function(productId, categoryId, brandId, vendorId) {
  const now = new Date();
  
  return this.find({
    status: 'active',
    'schedule.startDate': { $lte: now },
    'schedule.endDate': { $gte: now },
    $or: [
      { 'targets.products': productId },
      { 'targets.categories': categoryId },
      { 'targets.brands': brandId },
      { 'targets.vendors': vendorId }
    ]
  }).sort({ priority: -1 });
};

// Add pagination plugin
dynamicPricingSchema.plugin(mongoosePaginate);

const DynamicPricing = mongoose.model('DynamicPricing', dynamicPricingSchema);

export default DynamicPricing;