import mongoose from 'mongoose';

const communityForumSchema = new mongoose.Schema({
  // Forum category/topic
  category: {
    type: String,
    enum: [
      'general',
      'product_discussions',
      'tech_support',
      'announcements',
      'feedback',
      'marketplace',
      'deals_and_offers',
      'tutorials',
      'reviews_and_recommendations',
      'off_topic'
    ],
    required: true,
    index: true
  },
  
  // Main post details
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
    index: 'text'
  },
  
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000,
    index: 'text'
  },
  
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Post metadata
  isSticky: {
    type: Boolean,
    default: false
  },
  
  isLocked: {
    type: Boolean,
    default: false
  },
  
  isPinned: {
    type: Boolean,
    default: false
  },
  
  isAnnouncement: {
    type: Boolean,
    default: false
  },
  
  // Tags for better organization
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Related products (if any)
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  
  // Media attachments
  attachments: [{
    type: { type: String, enum: ['image', 'video', 'document'] },
    url: String,
    filename: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Engagement metrics
  views: {
    count: { type: Number, default: 0 },
    uniqueUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  
  likes: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    likedAt: { type: Date, default: Date.now }
  }],
  
  likesCount: { type: Number, default: 0 },
  
  // Replies/Comments
  replies: [{
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    createdAt: {
      type: Date,
      default: Date.now
    },
    
    updatedAt: Date,
    
    isEdited: {
      type: Boolean,
      default: false
    },
    
    // Reply-specific engagement
    likes: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      likedAt: { type: Date, default: Date.now }
    }],
    
    likesCount: { type: Number, default: 0 },
    
    // Nested replies (one level deep)
    nestedReplies: [{
      content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
      },
      
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      
      createdAt: {
        type: Date,
        default: Date.now
      },
      
      likes: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        likedAt: { type: Date, default: Date.now }
      }],
      
      likesCount: { type: Number, default: 0 }
    }],
    
    // Moderation
    moderationStatus: {
      type: String,
      enum: ['approved', 'pending', 'rejected', 'flagged'],
      default: 'approved'
    },
    
    reports: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reason: {
        type: String,
        enum: ['spam', 'inappropriate', 'harassment', 'misinformation', 'other']
      },
      description: String,
      reportedAt: { type: Date, default: Date.now }
    }],
    
    reportCount: { type: Number, default: 0 }
  }],
  
  repliesCount: { type: Number, default: 0 },
  
  // Last activity tracking
  lastActivity: {
    type: Date,
    default: Date.now
  },
  
  lastReply: {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: Date
  },
  
  // Followers for notifications
  followers: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    followedAt: { type: Date, default: Date.now },
    notificationPreferences: {
      newReplies: { type: Boolean, default: true },
      mentions: { type: Boolean, default: true }
    }
  }],
  
  followersCount: { type: Number, default: 0 },
  
  // Moderation
  moderationStatus: {
    type: String,
    enum: ['approved', 'pending', 'rejected', 'flagged'],
    default: 'approved'
  },
  
  moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  moderatedAt: Date,
  
  // Reports
  reports: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'harassment', 'misinformation', 'duplicate', 'other']
    },
    description: String,
    reportedAt: { type: Date, default: Date.now }
  }],
  
  reportCount: { type: Number, default: 0 },
  
  // SEO and search optimization
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  
  searchKeywords: [String],
  
  // Analytics
  analytics: {
    dailyViews: [{
      date: Date,
      views: { type: Number, default: 0 },
      uniqueUsers: { type: Number, default: 0 }
    }],
    
    engagementScore: { type: Number, default: 0 },
    popularityScore: { type: Number, default: 0 },
    
    // Trending metrics
    trendingScore: { type: Number, default: 0 },
    hotScore: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
communityForumSchema.index({ category: 1, createdAt: -1 });
communityForumSchema.index({ author: 1 });
communityForumSchema.index({ isSticky: 1, isPinned: 1, createdAt: -1 });
communityForumSchema.index({ tags: 1 });
communityForumSchema.index({ lastActivity: -1 });
communityForumSchema.index({ 'analytics.popularityScore': -1 });
communityForumSchema.index({ 'analytics.trendingScore': -1 });
communityForumSchema.index({ likesCount: -1 });
communityForumSchema.index({ repliesCount: -1 });

// Text search index
communityForumSchema.index({ 
  title: 'text', 
  content: 'text',
  tags: 'text'
});

// Compound indexes for common queries
communityForumSchema.index({ category: 1, moderationStatus: 1, createdAt: -1 });
communityForumSchema.index({ category: 1, isSticky: 1, isPinned: 1, lastActivity: -1 });

// Virtual for calculating post age
communityForumSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Virtual for calculating engagement rate
communityForumSchema.virtual('engagementRate').get(function() {
  if (this.views.count === 0) return 0;
  return ((this.likesCount + this.repliesCount) / this.views.count) * 100;
});

// Pre-save middleware
communityForumSchema.pre('save', function(next) {
  // Update replies count
  this.repliesCount = this.replies.length;
  
  // Update likes count
  this.likesCount = this.likes.length;
  
  // Update followers count
  this.followersCount = this.followers.length;
  
  // Update last activity
  if (this.replies.length > 0) {
    const lastReply = this.replies[this.replies.length - 1];
    this.lastActivity = lastReply.createdAt;
    this.lastReply = {
      author: lastReply.author,
      createdAt: lastReply.createdAt
    };
  }
  
  // Generate slug if title changed
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')
      .substring(0, 50);
  }
  
  // Calculate analytics scores
  this.calculateAnalyticsScores();
  
  next();
});

// Method to calculate analytics scores
communityForumSchema.methods.calculateAnalyticsScores = function() {
  const ageInHours = (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60);
  const ageFactor = Math.max(0.1, 1 / (1 + ageInHours * 0.05)); // Decay over time
  
  // Engagement Score (0-100)
  this.analytics.engagementScore = Math.min(100, 
    (this.likesCount * 2) + 
    (this.repliesCount * 3) + 
    (this.views.count * 0.1) +
    (this.followersCount * 1.5)
  );
  
  // Popularity Score (with age decay)
  this.analytics.popularityScore = Math.round(this.analytics.engagementScore * ageFactor);
  
  // Trending Score (recent activity weighted heavily)
  const recentActivityBonus = ageInHours < 24 ? 2 : ageInHours < 72 ? 1.5 : 1;
  this.analytics.trendingScore = Math.round(this.analytics.popularityScore * recentActivityBonus);
  
  // Hot Score (combination of engagement and recency)
  this.analytics.hotScore = Math.round(
    (this.likesCount + this.repliesCount * 2) * Math.pow(ageFactor, 0.8)
  );
};

// Method to add view
communityForumSchema.methods.addView = function(userId = null) {
  this.views.count += 1;
  
  // Track unique users if userId provided
  if (userId && !this.views.uniqueUsers.includes(userId)) {
    this.views.uniqueUsers.push(userId);
  }
  
  // Add to daily analytics
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let todayAnalytics = this.analytics.dailyViews.find(
    day => day.date.getTime() === today.getTime()
  );
  
  if (todayAnalytics) {
    todayAnalytics.views += 1;
    if (userId && !todayAnalytics.uniqueUsers) {
      todayAnalytics.uniqueUsers = 1;
    }
  } else {
    this.analytics.dailyViews.push({
      date: today,
      views: 1,
      uniqueUsers: userId ? 1 : 0
    });
  }
  
  // Keep only last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  this.analytics.dailyViews = this.analytics.dailyViews.filter(
    day => day.date >= thirtyDaysAgo
  );
  
  // Recalculate scores
  this.calculateAnalyticsScores();
};

// Method to toggle like
communityForumSchema.methods.toggleLike = function(userId) {
  const existingLikeIndex = this.likes.findIndex(
    like => like.user.toString() === userId.toString()
  );
  
  if (existingLikeIndex !== -1) {
    // Remove like
    this.likes.splice(existingLikeIndex, 1);
    return false; // Unliked
  } else {
    // Add like
    this.likes.push({ user: userId });
    return true; // Liked
  }
};

const CommunityForum = mongoose.model('CommunityForum', communityForumSchema);

export default CommunityForum;