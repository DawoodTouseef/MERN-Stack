import mongoose from "mongoose";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const MONGO_URI = process.env.MONGODB_URL || "mongodb://localhost:27017/huxnStors";

const connectDB = async () => {
  try {
    // Enhanced MongoDB connection options for security
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true,
      retryReads: true
    };

    await mongoose.connect(MONGO_URI, options);
    console.log(`✓ Successfully connected to MongoDB 👍`);
    
    // Create default admin with secure password
    await createDefaultAdmin();
    
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

const createDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin07@gmail.com";
    let adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    
    // Generate secure random password if not provided
    if (!adminPassword || adminPassword === "admin") {
      adminPassword = crypto.randomBytes(16).toString('hex');
      console.warn(`⚠️  Generated random admin password: ${adminPassword}`);
      console.warn('⚠️  Please save this password and set ADMIN_PASSWORD environment variable');
    }
    
    // Check if admin already exists
    const adminExists = await User.findOne({ email: adminEmail, role: "admin" });
    
    if (!adminExists) {
      // Hash password with secure salt rounds
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      const newAdmin = new User({
        username: "Administrator",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        status: "active",
        emailVerified: true, // Admin account is pre-verified
        addresses: [],
        wishlist: [],
        recentlyViewed: [],
        newsletterSubscribed: false,
      });
      
      await newAdmin.save();
      console.log(`✓ Default admin account created successfully`);
      
      // Log security event
      console.log(`🔒 Admin account security info:`);
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password complexity: ${adminPassword.length} characters`);
      console.log(`   Account ID: ${newAdmin._id}`);
    } else {
      console.log(`✓ Admin account already exists`);
    }
  } catch (error) {
    console.error(`❌ Error creating default admin: ${error.message}`);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('⚠️  Received SIGINT. Graceful shutdown...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('⚠️  Received SIGTERM. Graceful shutdown...');
  await mongoose.connection.close();
  process.exit(0);
});

export default connectDB;
