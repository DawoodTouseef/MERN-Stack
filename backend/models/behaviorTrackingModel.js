import mongoose from 'mongoose';

const behaviorTrackingSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    enum: [
      'page_view', 'product_view', 'category_view', 'search', 'add_to_cart', 
      'remove_from_cart', 'add_to_wishlist', 'remove_from_wishlist', 
      'purchase', 'review_product', 'share_product', 'compare_products',
      'filter_products', 'sort_products', 'view_recommendations',
      'click_recommendation', 'cart_abandonment', 'checkout_start',
      'checkout_complete', 'return_request', 'support_interaction',
      'location_detected', 'weather_check', 'vendor_view'
    ],
    required: true
  },
  source: {
    type: String,
    enum: [
      'homepage', 'category_page', 'product_page', 'search_page', 
      'cart_page', 'wishlist_page', 'checkout_page', 'profile_page',
      'recommendations_section', 'trending_section', 'deals_section',
      'personalized_section', 'location_section', 'vendor_page',
      'mobile_app', 'email_campaign', 'push_notification', 'social_media'
    ],
    required: true
  },
  metadata: {
    // Product-related data
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    
    // Search data
    searchQuery: String,
    searchFilters: mongoose.Schema.Types.Mixed,
    searchResults: Number,
    
    // Interaction data
    clickPosition: Number, // position in list/grid
    duration: Number, // time spent in seconds
    scrollDepth: Number, // percentage of page scrolled
    price: Number,
    quantity: Number,
    
    // Location data
    location: {
      latitude: Number,
      longitude: Number,
      city: String,
      country: String
    },
    
    // Device/Browser data
    userAgent: String,
    deviceType: String, // mobile, desktop, tablet
    browserName: String,
    screenResolution: String,
    
    // Additional context
    referrer: String,
    campaignSource: String,
    campaignMedium: String,
    campaignName: String,
    
    // Recommendation data
    recommendationType: String, // collaborative, content-based, hybrid, location
    recommendationScore: Number,
    recommendationRank: Number,
    
    // Cart/Purchase data
    cartValue: Number,
    cartItemCount: Number,
    purchaseValue: Number,
    paymentMethod: String,
    shippingMethod: String,
    
    // Weather data (for weather-based recommendations)
    weather: {
      temperature: Number,
      condition: String, // sunny, rainy, snowy, etc.
      humidity: Number
    },
    
    // Time-based data
    dayOfWeek: Number, // 0-6
    hourOfDay: Number, // 0-23
    isWeekend: Boolean,
    isHoliday: Boolean,
    
    // A/B Testing
    experiments: [{
      experimentId: String,
      variant: String
    }],
    
    // Custom fields for future use
    customData: mongoose.Schema.Types.Mixed
  },
  
  // Performance metrics
  performance: {
    pageLoadTime: Number,
    apiResponseTime: Number,
    renderTime: Number
  },
  
  // Engagement metrics
  engagement: {
    isNewUser: Boolean,
    sessionDuration: Number,
    pageViews: Number,
    bounced: Boolean, // single page session
    converted: Boolean, // made a purchase
    returnVisitor: Boolean
  },
  
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // IP and security
  ipAddress: String,
  fingerprint: String, // browser fingerprint for security
  
  // Data quality
  isBot: { type: Boolean, default: false },
  isValid: { type: Boolean, default: true },
  qualityScore: { type: Number, min: 0, max: 1, default: 1 }
}, {
  timestamps: true,
  // Automatic cleanup of old data (30 days)
  expireAfterSeconds: 30 * 24 * 60 * 60
});

// Indexes for performance
behaviorTrackingSchema.index({ userId: 1, eventType: 1, timestamp: -1 });
behaviorTrackingSchema.index({ sessionId: 1 });
behaviorTrackingSchema.index({ eventType: 1, timestamp: -1 });
behaviorTrackingSchema.index({ source: 1, eventType: 1 });
behaviorTrackingSchema.index({ 'metadata.productId': 1, eventType: 1 });
behaviorTrackingSchema.index({ 'metadata.categoryId': 1, eventType: 1 });
behaviorTrackingSchema.index({ 'metadata.location.city': 1, eventType: 1 });
behaviorTrackingSchema.index({ timestamp: -1 });

// Compound indexes for complex queries
behaviorTrackingSchema.index({ 
  userId: 1, 
  eventType: 1, 
  'metadata.productId': 1, 
  timestamp: -1 
});

behaviorTrackingSchema.index({ 
  userId: 1, 
  'metadata.location.city': 1, 
  timestamp: -1 
});

// Methods for data aggregation
behaviorTrackingSchema.statics.getUserInsights = function(userId, days = 30) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        timestamp: { $gte: dateThreshold }
      }
    },
    {
      $group: {
        _id: null,
        totalEvents: { $sum: 1 },
        uniqueSessions: { $addToSet: '$sessionId' },
        topCategories: { $push: '$metadata.categoryId' },
        topBrands: { $push: '$metadata.brandId' },
        avgSessionDuration: { $avg: '$engagement.sessionDuration' },
        conversionEvents: {
          $sum: {
            $cond: [{ $eq: ['$eventType', 'purchase'] }, 1, 0]
          }
        }
      }
    }
  ]);
};

behaviorTrackingSchema.statics.getLocationInsights = function(city, days = 7) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        'metadata.location.city': city,
        timestamp: { $gte: dateThreshold }
      }
    },
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

const BehaviorTracking = mongoose.model('BehaviorTracking', behaviorTrackingSchema);

export default BehaviorTracking;