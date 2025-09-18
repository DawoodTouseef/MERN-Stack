import express from 'express';
import {
  createDynamicPricing,
  getAllDynamicPricings,
  getActiveFlashSales,
  calculateDynamicPrice,
  getSurgePricingRecommendations,
  updateDynamicPricing,
  deleteDynamicPricing,
  togglePricingStatus,
  getPricingAnalytics
} from '../controllers/dynamicPricingController.js';
import { authenticate as protect,IsAdmin as  admin } from '../middlewares/authMiddleware.js';
import { searchLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

// Public routes
router.get('/flash-sales', getActiveFlashSales);
router.post('/calculate', searchLimiter, calculateDynamicPrice);

// Admin routes
router.use(protect, admin); // All routes below require admin access

router.route('/')
  .get(getAllDynamicPricings)
  .post(createDynamicPricing);

router.route('/:id')
  .put(updateDynamicPricing)
  .delete(deleteDynamicPricing);

router.patch('/:id/toggle', togglePricingStatus);
router.get('/analytics/overview', getPricingAnalytics);
router.get('/surge/recommendations', getSurgePricingRecommendations);

export default router;