import express from "express";
const router = express.Router();
import {
  createCategory,
  updateCategory,
  removeCategory,
  listCategory,
  readCategory,
} from "../controllers/categoryController.js";

import { authenticate, authorizeVendor } from "../middlewares/authMiddleware.js";

// Create category
router.route("/").post(authenticate, authorizeVendor, createCategory);

// Update and delete category by ID
router
  .route("/:categoryId")
  .put(authenticate, authorizeVendor, updateCategory)
  .delete(authenticate, authorizeVendor, removeCategory);

// Get all categories
router.route("/categories").get(listCategory);

// Get a single category by ID
router.route("/single/:id").get(readCategory);

export default router;