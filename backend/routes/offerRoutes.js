import express from "express";
import {
  createOffer,
  getOffers,
  getOfferById,
  updateOffer,
  deleteOffer,
} from "../controllers/offerController.js";
import { authenticate, IsAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Routes for offers
router.post("/", authenticate, IsAdmin, createOffer); // Create a new offer
router.get("/", getOffers); // Get all offers
router.get("/:id", getOfferById); // Get a single offer by ID
router.put("/:id", authenticate, IsAdmin, updateOffer); // Update an offer
router.delete("/:id", authenticate, IsAdmin, deleteOffer); // Delete an offer

export default router;