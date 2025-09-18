import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import Vendor from '../models/vendorModel.js';
import axios from 'axios';

// @desc    Get current user location data
// @route   GET /api/location/current
// @access  Private
const getCurrentLocation = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.location && req.headers['x-forwarded-for']) {
      // Get location from IP if not set
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      try {
        const response = await axios.get(`http://ip-api.com/json/${ip}`);
        if (response.data.status === 'success') {
          user.location = {
            latitude: response.data.lat,
            longitude: response.data.lon,
            city: response.data.city,
            country: response.data.country,
            timezone: response.data.timezone
          };
          await user.save();
        }
      } catch (error) {
        console.log('IP geolocation failed:', error);
      }
    }

    res.json({
      location: user.location,
      city: user.location?.city,
      country: user.location?.country,
      timezone: user.location?.timezone
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get location data' });
  }
});

// @desc    Update user location
// @route   POST /api/location/update
// @access  Private
const updateUserLocation = asyncHandler(async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    // Reverse geocoding to get city and country
    let locationData = { latitude, longitude };
    
    try {
      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${process.env.OPENCAGE_API_KEY}`
      );
      
      if (response.data.results.length > 0) {
        const result = response.data.results[0];
        locationData = {
          ...locationData,
          city: result.components.city || result.components.town || result.components.village,
          country: result.components.country,
          state: result.components.state,
          timezone: result.annotations.timezone.name
        };
      }
    } catch (error) {
      console.log('Reverse geocoding failed:', error);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { location: locationData },
      { new: true }
    );

    res.json({
      message: 'Location updated successfully',
      location: user.location
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update location' });
  }
});

// @desc    Get location-based products
// @route   GET /api/location/products
// @access  Public
const getLocationBasedProducts = asyncHandler(async (req, res) => {
  try {
    const { latitude, longitude, limit = 12, category, priceRange } = req.query;
    
    let query = {};
    
    // Add category filter if specified
    if (category) {
      query.category = category;
    }
    
    // Add price range filter if specified
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      query.price = { $gte: min, $lte: max };
    }

    // Get products with location-based scoring
    let products;
    
    if (latitude && longitude) {
      // Find products from nearby vendors
      const nearbyVendors = await Vendor.find({
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            $maxDistance: 50000 // 50km radius
          }
        }
      }).select('_id');
      
      const vendorIds = nearbyVendors.map(v => v._id);
      if (vendorIds.length > 0) {
        query.vendor = { $in: vendorIds };
      }
    }

    products = await Product.find(query)
      .populate('category', 'name')
      .populate('brand', 'name')
      .populate('vendor', 'name location')
      .sort({ createdAt: -1, numReviews: -1 })
      .limit(parseInt(limit));

    // If no location-specific products found, return popular products
    if (products.length === 0) {
      products = await Product.find(query)
        .populate('category', 'name')
        .populate('brand', 'name')
        .sort({ numReviews: -1, rating: -1 })
        .limit(parseInt(limit));
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get location-based products' });
  }
});

// @desc    Get location-based offers
// @route   GET /api/location/offers
// @access  Public
const getLocationOffers = asyncHandler(async (req, res) => {
  try {
    const { latitude, longitude, limit = 10 } = req.query;
    
    // For now, return general offers
    // In a full implementation, you would have location-specific offers
    const offers = await Product.find({
      $or: [
        { discount: { $gt: 0 } },
        { 'pricing.compareAtPrice': { $gt: '$pricing.price' } }
      ]
    })
    .populate('category', 'name')
    .populate('brand', 'name')
    .sort({ discount: -1 })
    .limit(parseInt(limit));

    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get location offers' });
  }
});

// @desc    Get trending products by location
// @route   GET /api/location/trending
// @access  Public
const getTrendingByLocation = asyncHandler(async (req, res) => {
  try {
    const { latitude, longitude, timeframe = '7d', limit = 12 } = req.query;
    
    // Calculate date range for trending analysis
    const days = timeframe === '1d' ? 1 : timeframe === '7d' ? 7 : 30;
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    let products;
    
    if (latitude && longitude) {
      // Get trending products from recent orders in the area
      const recentOrders = await Order.find({
        createdAt: { $gte: dateFrom },
        'shippingAddress.location': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            $maxDistance: 100000 // 100km radius
          }
        }
      }).populate('orderItems.product');

      // Count product frequency
      const productCounts = {};
      recentOrders.forEach(order => {
        order.orderItems.forEach(item => {
          if (item.product) {
            productCounts[item.product._id] = (productCounts[item.product._id] || 0) + item.qty;
          }
        });
      });

      // Get top trending products
      const trendingProductIds = Object.entries(productCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, parseInt(limit))
        .map(([id]) => id);

      products = await Product.find({ _id: { $in: trendingProductIds } })
        .populate('category', 'name')
        .populate('brand', 'name');
    }

    // Fallback to general trending products
    if (!products || products.length === 0) {
      products = await Product.find({})
        .populate('category', 'name')
        .populate('brand', 'name')
        .sort({ numReviews: -1, rating: -1 })
        .limit(parseInt(limit));
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get trending products' });
  }
});

// @desc    Get nearby vendors
// @route   GET /api/location/vendors
// @access  Public
const getNearbyVendors = asyncHandler(async (req, res) => {
  try {
    const { latitude, longitude, radius = 10, limit = 20 } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Location coordinates required' });
    }

    const vendors = await Vendor.find({
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(radius) * 1000 // Convert km to meters
        }
      }
    })
    .select('name description location rating totalOrders')
    .limit(parseInt(limit));

    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get nearby vendors' });
  }
});

// @desc    Get delivery options for location
// @route   GET /api/location/delivery-options
// @access  Public
const getDeliveryOptions = asyncHandler(async (req, res) => {
  try {
    const { latitude, longitude, productIds } = req.query;
    
    // Mock delivery options based on location
    const deliveryOptions = [
      {
        id: 'standard',
        name: 'Standard Delivery',
        estimatedDays: '3-5',
        cost: 0,
        available: true
      },
      {
        id: 'express',
        name: 'Express Delivery',
        estimatedDays: '1-2',
        cost: 9.99,
        available: true
      },
      {
        id: 'sameday',
        name: 'Same Day Delivery',
        estimatedDays: 'Today',
        cost: 19.99,
        available: latitude && longitude // Only available if location provided
      }
    ];

    res.json(deliveryOptions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get delivery options' });
  }
});

// @desc    Get regional preferences
// @route   GET /api/location/preferences
// @access  Public
const getRegionalPreferences = asyncHandler(async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    
    // Mock regional preferences
    const preferences = {
      popularCategories: [
        { name: 'Electronics', popularity: 0.85 },
        { name: 'Fashion', popularity: 0.72 },
        { name: 'Home & Garden', popularity: 0.68 },
        { name: 'Books', popularity: 0.45 }
      ],
      averageOrderValue: 65.50,
      preferredPaymentMethods: ['Credit Card', 'PayPal', 'Digital Wallet'],
      deliveryPreferences: ['Express', 'Standard'],
      shoppingTimes: {
        peak: '18:00-21:00',
        moderate: '12:00-15:00'
      }
    };

    res.json(preferences);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get regional preferences' });
  }
});

// @desc    Get location-based pricing
// @route   GET /api/location/pricing
// @access  Public
const getLocationPricing = asyncHandler(async (req, res) => {
  try {
    const { latitude, longitude, productIds } = req.query;
    
    if (!productIds) {
      return res.status(400).json({ message: 'Product IDs required' });
    }

    const ids = JSON.parse(productIds);
    const products = await Product.find({ _id: { $in: ids } });
    
    // Apply location-based pricing adjustments
    const pricingData = products.map(product => ({
      productId: product._id,
      basePrice: product.price,
      locationPrice: product.price, // For now, no adjustment
      shipping: 0, // Free shipping for nearby locations
      tax: product.price * 0.08, // 8% tax
      total: product.price * 1.08
    }));

    res.json(pricingData);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get location pricing' });
  }
});

// @desc    Get weather-based products
// @route   GET /api/location/weather-products
// @access  Public
const getWeatherBasedProducts = asyncHandler(async (req, res) => {
  try {
    const { latitude, longitude, limit = 8 } = req.query;
    
    // Mock weather-based recommendations
    // In a real implementation, you would call a weather API
    const weatherProducts = await Product.find({
      $or: [
        { tags: { $in: ['winter', 'warm', 'coat', 'jacket'] } },
        { name: { $regex: /(winter|warm|coat|jacket|sweater)/i } }
      ]
    })
    .populate('category', 'name')
    .populate('brand', 'name')
    .limit(parseInt(limit));

    res.json(weatherProducts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get weather-based products' });
  }
});

// @desc    Track location event
// @route   POST /api/location/track-event
// @access  Private
const trackLocationEvent = asyncHandler(async (req, res) => {
  try {
    const { eventType, location, metadata } = req.body;
    
    // Store location-based analytics
    // In a real implementation, you would save this to an analytics collection
    console.log('Location Event:', {
      userId: req.user._id,
      eventType,
      location,
      metadata,
      timestamp: new Date()
    });

    res.json({ message: 'Event tracked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to track location event' });
  }
});

export {
  getCurrentLocation,
  updateUserLocation,
  getLocationBasedProducts,
  getLocationOffers,
  getTrendingByLocation,
  getNearbyVendors,
  getDeliveryOptions,
  getRegionalPreferences,
  getLocationPricing,
  getWeatherBasedProducts,
  trackLocationEvent
};