import express from "express";
import {
  getCurrencies,
  getEnabledCurrencies,
  getCurrencyByCode,
  createOrUpdateCurrency,
  deleteCurrency,
  setDefaultCurrency,
  updateExchangeRates,
  convertCurrency
} from "../controllers/currencyController.js";
import { authenticate, IsAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getEnabledCurrencies);
router.get("/all", authenticate, IsAdmin, getCurrencies);
router.get("/:code", getCurrencyByCode);

// Admin routes
router.post("/", authenticate, IsAdmin, createOrUpdateCurrency);
router.put("/:code", authenticate, IsAdmin, createOrUpdateCurrency);
router.delete("/:code", authenticate, IsAdmin, deleteCurrency);
router.put("/default", authenticate, IsAdmin, setDefaultCurrency);
router.post("/update-rates", authenticate, IsAdmin, updateExchangeRates);
router.post("/convert", convertCurrency);

export default router;