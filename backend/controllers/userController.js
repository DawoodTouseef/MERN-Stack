import User from "../models/userModel.js";
import Vendor from "../models/vendorModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import bcrypt from "bcryptjs";
import createToken from "../utils/createToken.js";
import Token from "../models/tokenModel.js";
import { randomBytes } from "crypto";
import { createAuthLog } from "./authController.js";

// Create new user (Register)
const createUser = asyncHandler(async (req, res) => {
  const {
    username,
    email,
    password,
    role,
    status,
    addresses,
    wishlist,
    recentlyViewed,
    newsletterSubscribed,
    VendorProfile
  } = req.body;

  if (!username || !email || !password) {
    res.status(400);
    throw new Error("Please fill all the required fields: username, email, password.");
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  let default_status = "active";
  if (role === "vendor") {
    default_status = "inactive"; 
  }

  // Build new user object
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    role: role || "customer",
    status: default_status,
    addresses: Array.isArray(addresses) ? addresses : [],
    wishlist: Array.isArray(wishlist) ? wishlist : [],
    recentlyViewed: Array.isArray(recentlyViewed) ? recentlyViewed : [],
    newsletterSubscribed: newsletterSubscribed === true,
    ...(role === "vendor" && { vendorVerified: false }) // Vendors are unverified by default
  });

  // Save user and create token cookie
  const savedUser = await newUser.save();
  
  // If user is a vendor, create a vendor profile
  let vendorProfile = null;
  if (role === "vendor" && VendorProfile) {
    const vendor = new Vendor({
      name: VendorProfile.companyName || username,
      email: email,
      phone: VendorProfile.phone || "",
      address: {
        street: VendorProfile.address || "",
        city: "",
        state: "",
        zipCode: "",
        country: "USA"
      },
      businessType: "Individual",
      taxId: VendorProfile.taxId || "",
      contactPerson: {
        name: username,
        email: email
      },
      user: savedUser._id // Link to the user account
    });
    
    vendorProfile = await vendor.save();
  }
  
  // Log successful registration
  await createAuthLog(savedUser._id, "login", req);
  
  createToken(res, savedUser._id);

  // Include vendor profile in response if it exists
  const responseUser = savedUser.toObject();
  if (vendorProfile) {
    responseUser.vendorProfile = {
      _id: vendorProfile._id,
      isVerified: vendorProfile.isVerified,
      isActive: vendorProfile.isActive
    };
  }

  res.status(201).json(responseUser);
});

// Login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    // Log failed login attempt due to missing credentials
    await createAuthLog(null, "failed_login", req, false, "Missing email or password");
    
    res.status(400);
    throw new Error("Please provide email and password");
  }

  const user = await User.findOne({ email });

  if (!user) {
    // Log failed login attempt due to user not found
    await createAuthLog(null, "failed_login", req, false, "User not found");
    
    res.status(404);
    throw new Error("User not found");
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    // Log failed login attempt due to invalid password
    await createAuthLog(user._id, "failed_login", req, false, "Invalid password");
    
    // Optionally, increment loginAttempts here and lock account after threshold
    res.status(401);
    throw new Error("Invalid password");
  }

  // For vendors, check if they are verified
  if (user.role === "vendor" && !user.vendorVerified) {
    // Log failed login attempt due to unverified vendor
    await createAuthLog(user._id, "failed_login", req, false, "Vendor not verified");
    
    res.status(401);
    throw new Error("Vendor account is not verified yet. Please contact admin.");
  }

  // Update last login and reset login attempts on successful login
  user.lastLoginAt = new Date();
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

  // Log successful login
  await createAuthLog(user._id, "login", req);
  
  createToken(res, user._id);

  res.status(200).json(user);
});

// Logout user (clear cookie)
const logoutCurrentUser = asyncHandler(async (req, res) => {
  // Log logout action
  if (req.user) {
    await createAuthLog(req.user._id, "logout", req);
  }
  
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production', // Secure in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // SameSite for cross-site cookies
    domain: process.env.NODE_ENV === 'production' ? '.vercel.app' : undefined, // Set domain for production
  });

  res.status(200).json({ message: "Logged out successfully" });
});

// Get all users (admin only)
const getAllUsers = asyncHandler(async (req, res) => {
  // Get query parameters for search and filtering
  const { search, role, status, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = req.query;
  
  // Build filter object
  let filter = {};
  
  // Search by username or email
  if (search) {
    filter.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Filter by role
  if (role && role !== 'all') {
    filter.role = role;
  }
  
  // Filter by status
  if (status && status !== 'all') {
    filter.status = status;
  }
  
  // Pagination
  const skip = (page - 1) * limit;
  
  // Sorting
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
  
  const users = await User.find(filter)
    .select("-password")
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));
    
  const totalUsers = await User.countDocuments(filter);
  
  // For vendors, also fetch their vendor profile information
  for (let i = 0; i < users.length; i++) {
    if (users[i].role === 'vendor') {
      const vendorProfile = await Vendor.findOne({ user: users[i]._id });
      if (vendorProfile) {
        users[i].vendorProfile = {
          isVerified: vendorProfile.isVerified,
          isActive: vendorProfile.isActive
        };
      }
    }
  }
  
  res.json({
    users,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
      hasNext: page < Math.ceil(totalUsers / limit),
      hasPrev: page > 1
    }
  });
});

// Get current logged-in user profile
const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(user);
});

// Update current logged-in user profile
const updateCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.username = req.body.username || user.username;
  user.email = req.body.email || user.email;
  user.newsletterSubscribed =
    req.body.newsletterSubscribed !== undefined
      ? req.body.newsletterSubscribed
      : user.newsletterSubscribed;
  
  user.UserVerified =
    req.body.UserVerified !== undefined
      ? req.body.UserVerified
      : false;
  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    user.password = hashedPassword;
  }

  // Optional: Update addresses if provided (replace entire array)
  if (Array.isArray(req.body.addresses)) {
    user.addresses = req.body.addresses;
  }

  const updatedUser = await user.save();

  res.json(updatedUser);
});

// Delete user by ID (admin only)
const deleteUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.role === "admin") {
    res.status(400);
    throw new Error("Cannot delete admin user");
  }

  // If user is a vendor, also delete the vendor profile
  if (user.role === "vendor") {
    await Vendor.deleteOne({ user: user._id });
  }

  await User.deleteOne({ _id: user._id });

  res.json({ message: "User removed" });
});

// Get user by ID (admin only)
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(user);
});

// Update user by ID (admin only)
const updateUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.username = req.body.username || user.username;
  user.email = req.body.email || user.email;

  // Only admin can update role and status
  if (req.body.role && ["customer", "admin", "vendor"].includes(req.body.role)) {
    user.role = req.body.role;
  }
  if (req.body.status && ["active", "inactive", "banned"].includes(req.body.status)) {
    user.status = req.body.status;
  }

  // Only admin can update vendor verification status
  if (req.body.vendorVerified !== undefined) {
    user.vendorVerified = req.body.vendorVerified;
  }

  // Only admin can update newsletter subscription
  if (req.body.newsletterSubscribed !== undefined) {
    user.newsletterSubscribed = req.body.newsletterSubscribed;
  }

  if (req.body.isAdmin !== undefined) {
    // Deprecated: role should be used now, but support old isAdmin flag for compatibility
    user.isAdmin = Boolean(req.body.isAdmin);
  }

  const updatedUser = await user.save();

  res.json(updatedUser);
});

// Verify vendor (admin only)
const verifyVendor = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.role !== "vendor") {
    res.status(400);
    throw new Error("User is not a vendor");
  }

  user.vendorVerified = true;
  user.status = "active"; // Activate the vendor account when verified
  const updatedUser = await user.save();

  // Also verify the vendor profile
  await Vendor.updateOne({ user: user._id }, { isVerified: true, isActive: true });

  res.json({ message: "Vendor verified successfully", user: updatedUser });
});

// Reject vendor (admin only)
const rejectVendor = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.role !== "vendor") {
    res.status(400);
    throw new Error("User is not a vendor");
  }

  user.vendorVerified = false;
  user.status = "banned"; // Ban the vendor account when rejected
  const updatedUser = await user.save();

  // Also reject the vendor profile
  await Vendor.updateOne({ user: user._id }, { isVerified: false, isActive: false });

  res.json({ message: "Vendor rejected successfully", user: updatedUser });
});

const bcryptSalt = 10;

// Upgrade seller to vendor
const upgradeSellerToVendor = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Check if user is a seller
    if (user.role !== "seller") {
      res.status(400);
      throw new Error("Only sellers can upgrade to vendors");
    }

    // Get vendor information from request body
    const {
      companyName,
      phone,
      address,
      businessType,
      taxId,
      bankAccountNumber,
      bankRoutingNumber,
      contactPersonName,
      contactPersonEmail
    } = req.body;

    // Validate required fields
    if (!companyName || !phone || !address || !businessType || !contactPersonName || !contactPersonEmail) {
      res.status(400);
      throw new Error("Please provide all required vendor information");
    }

    // Update user role to vendor
    user.role = "vendor";
    user.vendorVerified = false; // Vendors need to be verified by admin
    user.status = "inactive"; // Vendors are inactive until verified
    
    const updatedUser = await user.save();

    // Create vendor profile
    const vendor = new Vendor({
      name: companyName,
      email: user.email,
      phone,
      address: {
        street: address,
        city: "",
        state: "",
        zipCode: "",
        country: "USA"
      },
      businessType,
      taxId: taxId || "",
      bankDetails: {
        accountNumber: bankAccountNumber || "",
        routingNumber: bankRoutingNumber || ""
      },
      contactPerson: {
        name: contactPersonName,
        email: contactPersonEmail
      },
      user: user._id,
      isVerified: false,
      isActive: false
    });

    const vendorProfile = await vendor.save();

    res.status(200).json({
      message: "Seller upgraded to vendor successfully. Awaiting admin verification.",
      user: updatedUser,
      vendor: vendorProfile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ data: { message: "Email not found" } });
    }

    await Token.deleteMany({ userId: user._id });

    const resetToken = randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(resetToken, bcryptSalt);
    await new Token({
      userId: user._id,
      token: hashedToken,
      createdAt: Date.now(),
    }).save();

    const link = `/passwordReset?token=${resetToken}&id=${user._id}`;
    console.log("Password Reset Link:", link);

    res.status(200).json({
        message: "Reset link generated",
      });
  } catch (error) {
    console.error("Reset error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const changePassword = async (req, res) => {
  const { userId, token, newPassword } = req.body;

  try {
    // Get token record for the user
    const tokenDoc = await Token.findOne({ userId: userId });
    if (!tokenDoc || !tokenDoc.token) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Compare provided token with hashed token
    const isValid = await bcrypt.compare(token, tokenDoc.token);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Find user and update password
    const user = await User.findById(tokenDoc.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Delete token after successful password change
    await Token.deleteOne({ _id: tokenDoc._id });
    res.status(200).json({ message: "Password reset successful",role:user.role });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export {
  createUser,
  loginUser,
  logoutCurrentUser,
  getAllUsers,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  deleteUserById,
  getUserById,
  updateUserById,
  verifyVendor,
  rejectVendor,
  upgradeSellerToVendor,
  requestPasswordReset,
  changePassword
};
