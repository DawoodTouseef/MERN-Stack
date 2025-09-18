import express from 'express';
import {
  trackBehavior,
  getRecommendations,
  getProductRecommendations,
  getCartRecommendations,
  getTrendingProducts,
  getUserBehaviorAnalytics,
  getRecommendationMetrics,
  refreshRecommendations,
  submitRecommendationFeedback
} from '../controllers/recommendationController.js';
import { authenticate as protect, IsAdmin as admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes (trending products)
router.get('/trending', getTrendingProducts);
router.get('/product/:productId/similar', getProductRecommendations);

// Protected routes (require authentication)
router.use(protect);

// User behavior tracking
router.post('/track-behavior', trackBehavior);

// Personalized recommendations
router.get('/personalized', getRecommendations);
router.post('/cart-recommendations', getCartRecommendations);
router.post('/refresh', refreshRecommendations);

// User analytics
router.get('/user-analytics', getUserBehaviorAnalytics);

// Feedback system
router.post('/feedback', submitRecommendationFeedback);

// Admin routes (require admin privileges)
router.get('/metrics', admin, getRecommendationMetrics);

export default router;