import express from "express";
const router = express.Router();

import {
  createOrder,
  getAllOrders,
  getUserOrders,
  countTotalOrders,
  calculateTotalSales,
  calculateTotalSalesByDate,
  calculateSalesByCategory,
  findOrderById,
  markOrderAsPaid,
  markOrderAsDelivered,
  deleteOrder,
  // Enhanced tracking functions
  updateOrderStatus,
  getOrderTracking,
  trackOrderByNumber,
  addTrackingEvent,
  updateDeliveryPreferences,
  getOrdersWithFilters,
  submitOrderFeedback,
  getVendorOrders,
  // Role-based functions
  cancelOrder,
  getAdminOrders
} from "../controllers/orderController.js";

import { authenticate, authorizeVendor } from "../middlewares/authMiddleware.js";

// Create order (authenticated user) & Get all orders (admin)
router
  .route("/")
  .post(authenticate, createOrder)
  .get(authenticate, authorizeVendor, getAllOrders);

// Get orders of logged-in user
router.route("/mine").get(authenticate, getUserOrders);

// Get orders of logged-in vendor
router.route("/vendor-orders").get(authenticate, authorizeVendor, getVendorOrders);

// Get total number of orders
router.route("/total-orders").get(authenticate, authorizeVendor, countTotalOrders);

// Get total sales amount
router.route("/total-sales").get(authenticate, authorizeVendor, calculateTotalSales);

// Get total sales grouped by date
router.route("/total-sales-by-date").get(authenticate, authorizeVendor, calculateTotalSalesByDate);

// Get total sales grouped by category
router.route("/total-sales-by-category").get(authenticate, authorizeVendor, calculateSalesByCategory);

// Get order by ID
router.route("/:id").get(authenticate, findOrderById);

// Mark order as paid
router.route("/:id/pay").put(authenticate, markOrderAsPaid);

// Mark order as delivered (admin only)
router.route("/:id/deliver").put(authenticate, authorizeVendor, markOrderAsDelivered);

// Delete order (admin only)
router.route("/:id").delete(authenticate, authorizeVendor, deleteOrder);

// Enhanced tracking routes
router.route("/advanced/filters").get(authenticate, authorizeVendor, getOrdersWithFilters);
router.route("/:id/status").put(authenticate, authorizeVendor, updateOrderStatus);
router.route("/:id/tracking").get(authenticate, getOrderTracking);
router.route("/:id/tracking/events").post(authenticate, authorizeVendor, addTrackingEvent);
router.route("/:id/delivery-preferences").put(authenticate, updateDeliveryPreferences);
router.route("/:id/feedback").post(authenticate, submitOrderFeedback);

// Public tracking route (no authentication required)
router.route("/track/:orderNumber").get(trackOrderByNumber);

// Cancel order (customer only)
router.route("/:id/cancel").put(authenticate, cancelOrder);

// Get all orders (admin only)
router.route("/admin/all").get(authenticate, authorizeVendor, getAdminOrders);

export default router;