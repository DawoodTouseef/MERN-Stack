import express from "express";
import {
  createBrand,
  getAllBrands,
  getUserBrandes,
  getBrandById,
  updateBrandById,
  deleteBrand,
} from "../controllers/brandController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.use(authenticate);

// Create a brand & get all brands (admin or for listing)
router.route("/").post(createBrand).get(getAllBrands);

// Get all brands for the logged-in user
router.route("/user/all").get(getUserBrandes);

// Get, update, or delete a single brand by ID (for the owner)
router
  .route("/:id")
  .get(getBrandById)
  .put(updateBrandById)
  .delete(deleteBrand);

export default router;