import express from "express";
import {
  createOffer,
  getOffers,
  getOfferById,
  updateOffer,
  deleteOffer,
  // Advanced dynamic pricing functions
  calculateDynamicPrice,
  startFlashSale,
  endFlashSale,
  getActiveFlashSales,
  trackOfferInteraction,
  createFlashSaleSession,
  getFlashSaleSessions,
  approveOffer,
  getOfferAnalytics,
  createPriceHistory,
  getPriceHistory
} from "../controllers/offerController.js";
import { authenticate, IsAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Basic CRUD Routes
router.post("/", authenticate, IsAdmin, createOffer); // Create a new offer
router.get("/", getOffers); // Get all offers
router.get("/:id", getOfferById); // Get a single offer by ID
router.put("/:id", authenticate, IsAdmin, updateOffer); // Update an offer
router.delete("/:id", authenticate, IsAdmin, deleteOffer); // Delete an offer

// Dynamic Pricing Routes
router.post("/calculate-price", authenticate, calculateDynamicPrice); // Calculate dynamic price

// Flash Sale Management
router.post("/flash-sales", authenticate, IsAdmin, createFlashSaleSession); // Create flash sale session
router.get("/flash-sales", getFlashSaleSessions); // Get flash sale sessions
router.get("/flash-sales/active", getActiveFlashSales); // Get active flash sales
router.post("/:id/start-flash-sale", authenticate, IsAdmin, startFlashSale); // Start flash sale
router.post("/:id/end-flash-sale", authenticate, IsAdmin, endFlashSale); // End flash sale

// Offer Management
router.post("/:id/approve", authenticate, IsAdmin, approveOffer); // Approve/reject offer
router.post("/:id/track", authenticate, trackOfferInteraction); // Track offer interaction

// Analytics and Reporting
router.get("/:id/analytics", authenticate, IsAdmin, getOfferAnalytics); // Get offer analytics

// Price History
router.post("/price-history", authenticate, IsAdmin, createPriceHistory); // Create price history
router.get("/price-history/:productId", getPriceHistory); // Get price history for product

export default router;