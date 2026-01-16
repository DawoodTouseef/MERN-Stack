import express from "express";
import {
  createOrUpdateTax,
  calculateTax,
  calculateAdvancedTax,
  getAllTaxRules,
  deleteTaxRule,
  bulkUploadTaxRules,
  createTaxExemption,
  updateTaxExemption,
  deleteTaxExemption,
  getTaxExemptions,
  createOrUpdateTaxConfig,
  getTaxConfig,
  getTaxReport,
  testTaxServiceConnection,
  validateAddress,
  getTaxRatesForLocation,
  initializeTaxServices,
  syncTaxRulesFromService
} from "../controllers/taxController.js";
import { authenticate as protect, IsAdmin as adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Tax Rules Management
router.post("/create", protect, adminOnly, createOrUpdateTax);
router.post("/bulk-upload", protect, adminOnly, bulkUploadTaxRules);
router.get("/", protect, adminOnly, getAllTaxRules);
router.delete("/:id", protect, adminOnly, deleteTaxRule);

// Tax Calculation
router.post("/calculate", protect, calculateTax); // Legacy endpoint
router.post("/calculate-advanced", calculateAdvancedTax); // Enhanced calculation (Public for guest estimates)

// Tax Exemptions
router.post("/exemptions", protect, adminOnly, createTaxExemption);
router.put("/exemptions/:id", protect, adminOnly, updateTaxExemption);
router.delete("/exemptions/:id", protect, adminOnly, deleteTaxExemption);
router.get("/exemptions", protect, adminOnly, getTaxExemptions);

// Tax Configuration
router.post("/config", protect, adminOnly, createOrUpdateTaxConfig);
router.get("/config", protect, adminOnly, getTaxConfig);

// Tax Reporting
router.get("/reports", protect, adminOnly, getTaxReport);

// Third-party Service Testing
router.post("/test-service", protect, adminOnly, testTaxServiceConnection);

// Enhanced third-party features
router.post("/validate-address", protect, adminOnly, validateAddress);
router.get("/rates-lookup", protect, getTaxRatesForLocation);
router.post("/initialize-services", protect, adminOnly, initializeTaxServices);
router.post("/sync-rules", protect, adminOnly, syncTaxRulesFromService);

export default router;
