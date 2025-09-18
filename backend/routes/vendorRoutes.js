import express from 'express';
import {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
  getVendorDashboard,
  getVendorSalesAnalytics,
  getVendorProductAnalytics,
  getVendorCustomerAnalytics,
  getVendorInventoryAnalytics
} from '../controllers/vendorController.js';
import { authenticate, authorizeVendor, IsAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
// ...

// Vendor routes (vendor access)
router.route('/dashboard')
  .get(authenticate, authorizeVendor, getVendorDashboard);

router.route('/analytics/sales')
  .get(authenticate, authorizeVendor, getVendorSalesAnalytics);

router.route('/analytics/products')
  .get(authenticate, authorizeVendor, getVendorProductAnalytics);

router.route('/analytics/customers')
  .get(authenticate, authorizeVendor, getVendorCustomerAnalytics);

router.route('/analytics/inventory')
  .get(authenticate, authorizeVendor, getVendorInventoryAnalytics);

// Admin routes (admin access)
router.route('/')
  .get(authenticate, IsAdmin, getVendors)
  .post(authenticate, IsAdmin, createVendor);

router.route('/:id')
  .get(authenticate, IsAdmin, getVendorById)
  .put(authenticate, IsAdmin, updateVendor)
  .delete(authenticate, IsAdmin, deleteVendor);

export default router;