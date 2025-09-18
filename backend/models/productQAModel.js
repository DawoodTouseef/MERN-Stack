import mongoose from 'mongoose';

const productQASchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  
  // Question details
  question: {
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    askedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    askedAt: {
      type: Date,
      default: Date.now
    },
    isAnonymous: {
      type: Boolean,
      default: false
    },
    category: {
      type: String,
      enum: [
        'general',
        'specifications',
        'compatibility',
        'availability',
        'shipping',
        'warranty',
        'pricing',
        'usage',
        'installation',
        'troubleshooting'
      ],
      default: 'general'
    },
    tags: [String],
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date
  },
  
  // Answers array
  answers: [{
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    answeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    answeredAt: {
      type: Date,
      default: Date.now
    },
    answerType: {
      type: String,
      enum: ['customer', 'vendor', 'admin', 'verified_buyer'],
      default: 'customer'
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false
    },
    isOfficialAnswer: {
      type: Boolean,
      default: false
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    
    // Voting system for answers
    votes: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      isHelpful: { type: Boolean }, // true for helpful, false for not helpful
      votedAt: { type: Date, default: Date.now }
    }],
    helpfulCount: { type: Number, default: 0 },
    notHelpfulCount: { type: Number, default: 0 },
    
    // Media attachments
    attachments: [{
      type: { type: String, enum: ['image', 'video', 'document'] },
      url: String,
      filename: String,
      size: Number
    }],
    
    // Moderation
    moderationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'flagged'],
      default: 'approved'
    },
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    moderatedAt: Date,
    
    // Reports
    reports: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reason: {
        type: String,
        enum: ['spam', 'inappropriate', 'misinformation', 'offensive', 'other']
      },
      description: String,
      reportedAt: { type: Date, default: Date.now }
    }],
    reportCount: { type: Number, default: 0 }
  }],
  
  // Question status and metrics
  status: {
    type: String,
    enum: ['open', 'answered', 'closed'],
    default: 'open'
  },
  
  totalAnswers: {
    type: Number,
    default: 0
  },
  
  hasOfficialAnswer: {
    type: Boolean,
    default: false
  },
  
  // Question voting and engagement
  questionVotes: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isHelpful: { type: Boolean }, // Is this question helpful/relevant?
    votedAt: { type: Date, default: Date.now }
  }],
  
  questionHelpfulCount: { type: Number, default: 0 },
  questionNotHelpfulCount: { type: Number, default: 0 },
  
  viewCount: { type: Number, default: 0 },
  
  // Notifications
  followers: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    followedAt: { type: Date, default: Date.now },
    notificationPreferences: {
      newAnswers: { type: Boolean, default: true },
      bestAnswer: { type: Boolean, default: true }
    }
  }],
  
  // Best answer (marked by question asker or admin)
  bestAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductQA.answers'
  },
  
  // Moderation
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'approved'
  },
  
  moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  moderatedAt: Date,
  
  // Reports for the question
  reports: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'duplicate', 'off-topic', 'other']
    },
    description: String,
    reportedAt: { type: Date, default: Date.now }
  }],
  
  reportCount: { type: Number, default: 0 },
  
  // SEO and search
  searchKeywords: [String],
  
  // Analytics
  analytics: {
    dailyViews: [{
      date: Date,
      views: { type: Number, default: 0 }
    }],
    popularityScore: { type: Number, default: 0 },
    engagementScore: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
productQASchema.index({ product: 1, createdAt: -1 });
productQASchema.index({ 'question.askedBy': 1 });
productQASchema.index({ status: 1 });
productQASchema.index({ 'question.category': 1 });
productQASchema.index({ questionHelpfulCount: -1 });
productQASchema.index({ totalAnswers: -1 });
productQASchema.index({ viewCount: -1 });
productQASchema.index({ hasOfficialAnswer: 1 });

// Text search index
productQASchema.index({ 
  'question.text': 'text', 
  'answers.text': 'text',
  'question.tags': 'text'
});

// Virtual for getting the question age
productQASchema.virtual('questionAge').get(function() {
  return Date.now() - this.question.askedAt.getTime();
});

// Pre-save middleware to update counters
productQASchema.pre('save', function(next) {
  // Update total answers count
  this.totalAnswers = this.answers.length;
  
  // Check if there's an official answer
  this.hasOfficialAnswer = this.answers.some(answer => answer.isOfficialAnswer);
  
  // Update status based on answers
  if (this.answers.length > 0) {
    this.status = 'answered';
  } else {
    this.status = 'open';
  }
  
  // Calculate popularity score
  this.analytics.popularityScore = this.calculatePopularityScore();
  
  next();
});

// Method to calculate popularity score
productQASchema.methods.calculatePopularityScore = function() {
  const ageInDays = (Date.now() - this.question.askedAt.getTime()) / (1000 * 60 * 60 * 24);
  const ageFactor = Math.max(0.1, 1 / (1 + ageInDays * 0.1)); // Decay over time
  
  const baseScore = (
    this.viewCount * 0.1 +
    this.questionHelpfulCount * 2 +
    this.totalAnswers * 3 +
    (this.hasOfficialAnswer ? 10 : 0)
  );
  
  return Math.round(baseScore * ageFactor);
};

// Method to add view
productQASchema.methods.addView = function() {
  this.viewCount += 1;
  
  // Add to daily views analytics
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayView = this.analytics.dailyViews.find(
    view => view.date.getTime() === today.getTime()
  );
  
  if (todayView) {
    todayView.views += 1;
  } else {
    this.analytics.dailyViews.push({
      date: today,
      views: 1
    });
  }
  
  // Keep only last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  this.analytics.dailyViews = this.analytics.dailyViews.filter(
    view => view.date >= thirtyDaysAgo
  );
};

const ProductQA = mongoose.model('ProductQA', productQASchema);

export default ProductQA;