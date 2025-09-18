import express from "express";
import {
  getSalesAnalytics,
  getProductAnalytics,
  getCustomerAnalytics,
  getTaxAnalytics,
  getShippingAnalytics,
  getFlashSalesAnalytics,
  getDashboardOverview
} from "../controllers/analyticsController.js";
import { authenticate as protect, IsAdmin as adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Dashboard Overview
router.get("/dashboard", protect, adminOnly, getDashboardOverview);

// Sales Analytics
router.get("/sales", protect, adminOnly, getSalesAnalytics);

// Product Analytics
router.get("/products", protect, adminOnly, getProductAnalytics);

// Customer Analytics
router.get("/customers", protect, adminOnly, getCustomerAnalytics);

// Tax Analytics
router.get("/tax", protect, adminOnly, getTaxAnalytics);    

// Shipping Analytics
router.get("/shipping", protect, adminOnly, getShippingAnalytics);

// Flash Sales Analytics
router.get("/flash-sales", protect, adminOnly, getFlashSalesAnalytics);

export default router;
