import express from "express";
import {
  createPage,
  getPages,
  getPageById,
  updatePage,
  deletePage,
} from "../controllers/PagesController.js";
import { authenticate, IsAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Routes for pages
router.post("/", authenticate, IsAdmin, createPage); // Create a new page
router.get("/", getPages); // Get all pages
router.get("/:id", getPageById); // Get a single page by ID
router.put("/:id", authenticate, IsAdmin, updatePage); // Update a page
router.delete("/:id", authenticate, IsAdmin, deletePage); // Delete a page

export default router;