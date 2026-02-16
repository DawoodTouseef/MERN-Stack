import express from 'express';
import {
  getCurrentLocation,
  updateOrganizationLocation,
  getLocationBasedProducts,
  getLocationOffers,
  getTrendingByLocation,
  getNearbyVendors,
  getDeliveryOptions,
  getRegionalPreferences,
  getLocationPricing,
  getWeatherBasedProducts,
  trackLocationEvent
} from '../controllers/locationController.js';
import { authenticate as protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get current user location
router.get('/current', protect, getCurrentLocation);

// Update organization location
router.post('/update', protect, updateOrganizationLocation);

// Get location-based products
router.get('/products', getLocationBasedProducts);

// Get location-based offers
router.get('/offers', getLocationOffers);

// Get trending products by location
router.get('/trending', getTrendingByLocation);

// Get nearby vendors
router.get('/vendors', getNearbyVendors);

// Get delivery options for location
router.get('/delivery-options', getDeliveryOptions);

// Get regional preferences
router.get('/preferences', getRegionalPreferences);

// Get location-based pricing
router.get('/pricing', getLocationPricing);

// Get weather-based products
router.get('/weather-products', getWeatherBasedProducts);

// Track location event
router.post('/track-event', protect, trackLocationEvent);

export default router;