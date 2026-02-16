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
  getVendorInventoryAnalytics,
  checkVendorProducts,
  verifyVendor,
  rejectVendor,
  getVendorProfile
} from '../controllers/vendorController.js';
import { authenticate, authorizeVendor, IsAdmin } from '../middlewares/authMiddleware.js';
import { requireVerifiedOrganization } from '../middlewares/verificationMiddleware.js';

const router = express.Router();

// Public routes
// ...

// Vendor routes (vendor access)
router.route('/dashboard')
  .get(authenticate, authorizeVendor, requireVerifiedOrganization, getVendorDashboard);

router.route('/profile')
  .get(authenticate, authorizeVendor, getVendorProfile);

router.route('/analytics/sales')
  .get(authenticate, authorizeVendor, requireVerifiedOrganization, getVendorSalesAnalytics);

router.route('/analytics/products')
  .get(authenticate, authorizeVendor, requireVerifiedOrganization, getVendorProductAnalytics);

router.route('/analytics/customers')
  .get(authenticate, authorizeVendor, requireVerifiedOrganization, getVendorCustomerAnalytics);

router.route('/analytics/inventory')
  .get(authenticate, authorizeVendor, requireVerifiedOrganization, getVendorInventoryAnalytics);

// Debug routes
router.route('/debug/products')
  .get(authenticate, authorizeVendor, checkVendorProducts);

// Admin routes (admin access)
router.route('/')
  .get(authenticate, IsAdmin, getVendors)
  .post(authenticate, IsAdmin, createVendor);

router.route('/:id')
  .get(authenticate, IsAdmin, getVendorById)
  .put(authenticate, IsAdmin, updateVendor)
  .delete(authenticate, IsAdmin, deleteVendor);

// Admin verification routes
router.route('/:id/verify')
  .put(authenticate, IsAdmin, verifyVendor);

router.route('/:id/reject')
  .put(authenticate, IsAdmin, rejectVendor);

export default router;