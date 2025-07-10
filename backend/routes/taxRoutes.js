import express from "express";
import {
  createOrUpdateTax,
  calculateTax,
  getAllTaxRules,
  deleteTaxRule,
} from "../controllers/taxController.js";
import { authenticate as protect,  IsAdmin as adminOnly} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, adminOnly, createOrUpdateTax);
router.post("/calculate", protect, calculateTax);
router.get("/", protect, adminOnly, getAllTaxRules);
router.delete("/:id", protect, adminOnly, deleteTaxRule);

export default router;
