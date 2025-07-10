import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  emailVerified: { type: Boolean, default: false },
  phone: { type: String },

  password: { type: String, required: true },

  role: { type: String, enum: ["customer", "admin", "vendor","seller"], default: "customer" },
  status: { type: String, enum: ["active", "inactive", "banned"], default: "active" },

  addresses: [
    {
      fullName: String,
      phone: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
      isDefault: { type: Boolean, default: false },
    }
  ],

  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  recentlyViewed: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

  newsletterSubscribed: { type: Boolean, default: false },

  otp: { type: String },
  otpExpiresAt: { type: Date },
  lastLoginAt: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },

}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;