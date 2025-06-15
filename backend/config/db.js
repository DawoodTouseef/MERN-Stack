import mongoose from "mongoose";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

const MONGO_URI = "mongodb://localhost:27017/huxnStors";
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`Successfully connnected to mongoDB 👍`);
    const username=process.env.ADMIN_EMAIL || "admin07@gmail.com";
    const password=process.env.ADMIN_PASSWORD || "admin";
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userExists = await User.findOne({ email:username,role:"admin"});
    if (!userExists) {
        const newadmin=User({
          username:"Admin",
          email:username,
          password: hashedPassword,
          role: "admin",
          status: "active",
          addresses:  [],
          wishlist:  [],
          recentlyViewed:  [],
          newsletterSubscribed: false,  
        })
        await newadmin.save();
        console.log("Admin Created Succesfully")
    }

  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
