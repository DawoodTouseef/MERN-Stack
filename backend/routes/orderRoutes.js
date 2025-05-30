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

import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

// Create order (authenticated user) & Get all orders (admin)
router
  .route("/")
  .post(authenticate, createOrder)
  .get(authenticate, authorizeAdmin, getAllOrders);

// Get orders of logged-in user
router.route("/mine").get(authenticate, getUserOrders);

// Get total number of orders
router.route("/total-orders").get(authenticate, authorizeAdmin, countTotalOrders);

// Get total sales amount
router.route("/total-sales").get(authenticate, authorizeAdmin, calculateTotalSales);

// Get total sales grouped by date
router.route("/total-sales-by-date").get(authenticate, authorizeAdmin, calculateTotalSalesByDate);

// Get total sales grouped by category
router.route("/total-sales-by-category").get(authenticate, authorizeAdmin, calculateSalesByCategory);

// Get order by ID
router.route("/:id").get(authenticate, findOrderById);

// Mark order as paid
router.route("/:id/pay").put(authenticate, markOrderAsPaid);

// Mark order as delivered (admin only)
router.route("/:id/deliver").put(authenticate, authorizeAdmin, markOrderAsDelivered);

// Delete order (admin only)
router.route("/:id").delete(authenticate, authorizeAdmin, deleteOrder);

export default router;
