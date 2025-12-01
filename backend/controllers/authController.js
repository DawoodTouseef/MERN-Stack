import asyncHandler from "../middlewares/asyncHandler.js";
import User from "../models/userModel.js";
import Auth from "../models/AuthModel.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/createToken.js";
import { validationResult } from "express-validator";

// Helper function to get client IP
const getClientIP = (req) => {
  return (
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null)
  );
};

// Helper function to create auth log
const createAuthLog = async (userId, action, req, success = true, failureReason = null) => {
  try {
    await Auth.create({
      user: userId,
      action,
      ipAddress: getClientIP(req),
      userAgent: req.get("User-Agent"),
      success,
      failureReason,
      sessionId: req.sessionID,
    });
  } catch (error) {
    console.error("Failed to create auth log:", error);
  }
};

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Log failed login attempt due to validation errors
    await createAuthLog(null, "failed_login", req, false, "Validation failed");
    
    return res.status(400).json({
      success: false,
      message: "Invalid input data",
      errors: errors.array(),
    });
  }

  try {
    const user = await User.findOne({ email }).select("+password");

    if (user && (await user.matchPassword(password))) {
      // Log successful login
      await createAuthLog(user._id, "login", req);
      
      generateToken(res, user._id);

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      });
    } else {
      // Log failed login attempt
      const userId = user ? user._id : null;
      await createAuthLog(userId, "failed_login", req, false, "Invalid email or password");
      
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    // Log failed login attempt due to server error
    await createAuthLog(null, "failed_login", req, false, "Server error");
    
    res.status(500).json({
      success: false,
      message: "Server error occurred during login",
    });
  }
});

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Invalid input data",
      errors: errors.array(),
    });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const user = await User.create({
      username,
      email,
      password,
    });

    if (user) {
      // Log successful registration (which includes login)
      await createAuthLog(user._id, "login", req);
      
      generateToken(res, user._id);

      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid user data",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error occurred during registration",
    });
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  try {
    // Log logout action
    if (req.user) {
      await createAuthLog(req.user._id, "logout", req);
    }
    
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error occurred during logout",
    });
  }
});

// Get auth logs for a user
const getUserAuthLogs = asyncHandler(async (req, res) => {
  try {
    const logs = await Auth.find({ user: req.user._id })
      .sort({ timestamp: -1 })
      .limit(50); // Limit to last 50 logs

    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error occurred while fetching auth logs",
    });
  }
});

// Get all auth logs (admin only)
const getAllAuthLogs = asyncHandler(async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const logs = await Auth.find()
      .populate("user", "username email role")
      .sort({ timestamp: -1 })
      .limit(100); // Limit to last 100 logs

    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error occurred while fetching auth logs",
    });
  }
});

export {
  loginUser,
  registerUser,
  logoutUser,
  getUserAuthLogs,
  getAllAuthLogs,
  createAuthLog,
};