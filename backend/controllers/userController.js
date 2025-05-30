import User from "../models/userModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import bcrypt from "bcryptjs";
import createToken from "../utils/createToken.js";

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
    isAdmin, // Deprecated, use role instead
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

  // Build new user object
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    role: role || "customer",
    status: status || "active",
    addresses: Array.isArray(addresses) ? addresses : [],
    wishlist: Array.isArray(wishlist) ? wishlist : [],
    recentlyViewed: Array.isArray(recentlyViewed) ? recentlyViewed : [],
    newsletterSubscribed: newsletterSubscribed === true,
    isAdmin: isAdmin === true, // Deprecated, use role instead
  });

  // Save user and create token cookie
  await newUser.save();
  createToken(res, newUser._id);

  res.status(201).json(newUser);
});

// Login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    // Optionally, increment loginAttempts here and lock account after threshold
    res.status(401);
    throw new Error("Invalid password");
  }

  // Update last login and reset login attempts on successful login
  user.lastLoginAt = new Date();
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

  createToken(res, user._id);

  res.status(200).json(user);
});

// Logout user (clear cookie)
const logoutCurrentUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged out successfully" });
});

// Get all users (admin only)
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");
  res.json(users);
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
};
