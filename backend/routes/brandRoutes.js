import express from "express";
import {
  createBrand,
  getAllBrands,
  getUserBrandes,
  getBrandById,
  updateBrandById,
  deleteBrand,
} from "../controllers/brandController.js";
import { authenticate, IsAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.route("/").get(getAllBrands);

router.use(authenticate);

// Create a brand (admin only)
router.route("/").post(IsAdmin, createBrand);

// Get all brands for the logged-in user
router.route("/user/all").get(getUserBrandes);

// Get, update, or delete a single brand by ID (for the owner)
router
  .route("/:id")
  .get(getBrandById)
  .put(updateBrandById)
  .delete(deleteBrand);

export default router;