import express from "express";
import {
  createBanner,
  getBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
} from "../controllers/bannerController.js";
import { authenticate, IsAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Routes for banners
router.post("/", authenticate, IsAdmin, createBanner); // Create a new banner
router.get("/", getBanners); // Get all banners
router.get("/:id", getBannerById); // Get a single banner by ID
router.put("/:id", authenticate, IsAdmin, updateBanner); // Update a banner
router.delete("/:id", authenticate, IsAdmin, deleteBanner); // Delete a banner

export default router;