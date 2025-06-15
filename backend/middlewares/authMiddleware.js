import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import asyncHandler from "./asyncHandler.js";

const JWT_SECRET="admin123";
const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // Read JWT from the 'jwt' cookie
  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.userId).select("-password");
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed.");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token.");
  }
});

const authorizeVendor = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "vendor")) {
    next();
  } else {
    res.status(401).send("Not authorized as an admin.");
  }
};
const IsAdmin = (req, res, next) => {
  if (req.user && (req.user.role === "admin")) {
    next();
  } else {
    res.status(401).send("Not authorized as an admin.");
  }
};
export { authenticate, authorizeVendor,IsAdmin };
