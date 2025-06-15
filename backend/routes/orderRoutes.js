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
} from "../controllers/orderController.js";

import { authenticate, authorizeVendor } from "../middlewares/authMiddleware.js";

// Create order (authenticated user) & Get all orders (admin)
router
  .route("/")
  .post(authenticate, createOrder)
  .get(authenticate, authorizeVendor, getAllOrders);

// Get orders of logged-in user
router.route("/mine").get(authenticate, getUserOrders);

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

export default router;
