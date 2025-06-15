import express from "express";
import { getConfig, updateConfig } from "../controllers/configController.js";
import { authenticate, IsAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get configuration settings (Admin only)
router.get("/", authenticate, IsAdmin, getConfig);

// Update configuration settings (Admin only)
router.put("/", authenticate, IsAdmin, updateConfig);

export default router;