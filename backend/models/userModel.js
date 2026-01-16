import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  emailVerified: { type: Boolean, default: false },
  phone: { type: String },

  password: { type: String, required: true, minlength: 8 },
  passwordChangedAt: { type: Date },

  role: {
    type: String,
    enum: ["customer", "admin", "vendor", "seller", "organization_member"],
    default: "customer"
  },
  status: { type: String, enum: ["active", "inactive", "banned"], default: "active" },

  // Organization & RBAC
  organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
  userGroup: { type: String }, // Slug of the group within the organization
  permissions: [{ type: String }], // Direct permissions overrides

  addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],

  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  recentlyViewed: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

  // Location data for personalized recommendations
  location: {
    latitude: Number,
    longitude: Number,
    city: String,
    state: String,
    country: String,
    timezone: String,
    lastUpdated: { type: Date, default: Date.now }
  },

  // Behavioral tracking for recommendations
  behaviorData: {
    viewHistory: [{
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
      timestamp: { type: Date, default: Date.now },
      duration: Number, // seconds spent viewing
      source: String // homepage, search, category, etc.
    }],
    searchHistory: [{
      query: String,
      timestamp: { type: Date, default: Date.now },
      resultsCount: Number,
      clickedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }]
    }],
    purchaseHistory: [{
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
      products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
        brandId: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
        price: Number,
        quantity: Number
      }],
      totalAmount: Number,
      timestamp: { type: Date, default: Date.now }
    }],
    preferences: {
      favoriteCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
      favoriteBrands: [{ type: mongoose.Schema.Types.ObjectId, ref: "Brand" }],
      priceRange: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 10000 }
      },
      shoppingTimes: [{
        hour: Number, // 0-23
        frequency: Number
      }],
      deviceTypes: [{
        type: String, // mobile, desktop, tablet
        frequency: Number
      }]
    },
    sessionData: {
      lastActive: { type: Date, default: Date.now },
      sessionCount: { type: Number, default: 0 },
      averageSessionDuration: Number,
      bounceRate: Number,
      cartAbandonmentCount: { type: Number, default: 0 }
    }
  },

  newsletterSubscribed: { type: Boolean, default: false },

  // Security fields
  otp: { type: String },
  otpExpiresAt: { type: Date },
  lastLoginAt: { type: Date },
  loginAttempts: { type: Number, default: 0, max: 5 },
  lockUntil: { type: Date },
  failedLoginIPs: [{ ip: String, attempts: Number, lastAttempt: Date }],

  // Email verification fields
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },

  // Password reset fields
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  passwordResetAttempts: { type: Number, default: 0, max: 3 },

  // Security settings
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  backupCodes: [String],

  // Account security
  UserVerified: { type: Boolean, default: false },
  suspiciousActivity: [{
    type: { type: String, enum: ['login', 'password_change', 'email_change', 'suspicious_order'] },
    details: String,
    ip: String,
    userAgent: String,
    timestamp: { type: Date, default: Date.now }
  }],

  // Vendor verification
  vendorVerified: { type: Boolean, default: false }

}, { timestamps: true });

// Virtual for checking if account is locked
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to handle password changes
userSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();

  // Set password changed timestamp
  if (!this.isNew) {
    this.passwordChangedAt = new Date();
  }

  next();
});

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }

  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if password was changed after JWT was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Add index for better performance
userSchema.index({ email: 1 });
userSchema.index({ organization: 1 });
userSchema.index({ status: 1 });
userSchema.index({ role: 1 });
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ passwordResetToken: 1 });
userSchema.index({ vendorVerified: 1 });

const User = mongoose.model("User", userSchema);
export default User;