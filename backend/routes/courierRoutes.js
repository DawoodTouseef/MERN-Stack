import express from "express";
import {
  createCourierPartner,
  updateCourierPartner,
  getCourierPartners,
  deleteCourierPartner,
  calculateShippingRates,
  createShipment,
  trackShipment,
  createVendorCourierMapping,
  updateVendorCourierMapping,
  getVendorCourierMappings,
  createBulkShipments,
  getShipments
} from "../controllers/courierController.js";
import { authenticate as protect, IsAdmin as adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Courier Partner Management (Admin only)
router.post("/partners", protect, adminOnly, createCourierPartner);
router.put("/partners/:id", protect, adminOnly, updateCourierPartner);
router.get("/partners", protect, getCourierPartners);
router.delete("/partners/:id", protect, adminOnly, deleteCourierPartner);

// Shipping Rate Calculation
router.post("/calculate-rates", protect, calculateShippingRates);

// Shipment Management
router.post("/shipments", protect, createShipment);
router.post("/shipments/bulk", protect, createBulkShipments);
router.get("/shipments", protect, getShipments);
router.get("/track/:trackingNumber", trackShipment); // Public endpoint for tracking

// Vendor-Courier Mapping
router.post("/vendor-mappings", protect, adminOnly, createVendorCourierMapping);
router.put("/vendor-mappings/:id", protect, adminOnly, updateVendorCourierMapping);
router.get("/vendor-mappings", protect, getVendorCourierMappings);

export default router;