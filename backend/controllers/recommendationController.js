import asyncHandler from '../middlewares/asyncHandler.js';
import recommendationService from '../services/recommendationService.js';
import { UserBehavior, Recommendation, ModelPerformance } from '../models/recommendationModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import { v4 as uuidv4 } from 'uuid';

// Track user behavior events
export const trackBehavior = asyncHandler(async (req, res) => {
  try {
    const { type, productId, categoryId, brandId, searchQuery, duration, source, metadata } = req.body;
    const userId = req.user._id;

    // Generate session ID if not provided
    let sessionId = req.sessionID || req.headers['x-session-id'] || uuidv4();

    const eventData = {
      type,
      productId,
      categoryId,
      brandId,
      searchQuery,
      sessionId,
      duration: duration || 0,
      source: source || 'unknown',
      deviceType: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop',
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      location: req.body.location,
      metadata: metadata || {}
    };

    const behavior = await recommendationService.trackUserBehavior(userId, eventData);

    res.status(200).json({
      success: true,
      message: 'Behavior tracked successfully',
      sessionId,
      totalEvents: behavior.events.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to track behavior',
      error: error.message
    });
  }
});

// Get personalized recommendations
export const getRecommendations = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 'homepage', cartItems, forceRefresh = false } = req.query;

    const context = {
      page,
      cartItems: cartItems ? JSON.parse(cartItems) : [],
      forceRefresh: forceRefresh === 'true',
      userSegment: req.user.role || 'customer'
    };

    const recommendations = await recommendationService.generateRecommendations(userId, context);

    // Populate product details
    const populatedRecommendations = await populateRecommendations(recommendations);

    res.status(200).json({
      success: true,
      data: populatedRecommendations,
      context: {
        userId,
        page,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message
    });
  }
});

// Get recommendations for specific product (similar products)
export const getProductRecommendations = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 8 } = req.query;

    // Get product details
    const product = await Product.findById(productId).populate('category brand');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Find similar products based on category, brand, and price range
    const priceRange = {
      min: product.price * 0.7,
      max: product.price * 1.3
    };

    const similarProducts = await Product.find({
      _id: { $ne: productId },
      $or: [
        { category: product.category._id },
        { brand: product.brand._id },
        { price: { $gte: priceRange.min, $lte: priceRange.max } }
      ],
      countInStock: { $gt: 0 }
    })
    .populate('category brand')
    .sort({ rating: -1, numReviews: -1 })
    .limit(parseInt(limit));

    // Score similarity
    const scoredProducts = similarProducts.map(p => {
      let score = 0;
      if (p.category._id.toString() === product.category._id.toString()) score += 0.4;
      if (p.brand._id.toString() === product.brand._id.toString()) score += 0.3;
      if (p.price >= priceRange.min && p.price <= priceRange.max) score += 0.2;
      score += (p.rating / 5) * 0.1;
      
      return {
        ...p.toObject(),
        similarityScore: score,
        reason: generateSimilarityReason(p, product)
      };
    });

    res.status(200).json({
      success: true,
      data: scoredProducts.sort((a, b) => b.similarityScore - a.similarityScore),
      baseProduct: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get product recommendations',
      error: error.message
    });
  }
});

// Get cart-based recommendations
export const getCartRecommendations = asyncHandler(async (req, res) => {
  try {
    const { cartItems } = req.body;
    const { limit = 6 } = req.query;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart items are required'
      });
    }

    const productIds = cartItems.map(item => item.productId || item._id);
    const recommendations = await recommendationService.frequentlyBoughtTogether(productIds, parseInt(limit));

    // Populate product details
    const populatedRecs = await Product.populate(recommendations, {
      path: 'product',
      populate: { path: 'category brand' }
    });

    res.status(200).json({
      success: true,
      data: populatedRecs,
      cartItems: productIds
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get cart recommendations',
      error: error.message
    });
  }
});

// Get trending products
export const getTrendingProducts = asyncHandler(async (req, res) => {
  try {
    const { limit = 10, category, priceRange } = req.query;

    let trendingProducts = await recommendationService.trendingRecommendations(parseInt(limit) * 2);

    // Filter by category if specified
    if (category) {
      const categoryProducts = await Product.find({
        _id: { $in: trendingProducts.map(tp => tp.product) },
        category: category
      });
      
      trendingProducts = trendingProducts.filter(tp => 
        categoryProducts.some(cp => cp._id.toString() === tp.product.toString())
      );
    }

    // Filter by price range if specified
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      const priceFilteredProducts = await Product.find({
        _id: { $in: trendingProducts.map(tp => tp.product) },
        price: { $gte: min, $lte: max }
      });
      
      trendingProducts = trendingProducts.filter(tp => 
        priceFilteredProducts.some(cp => cp._id.toString() === tp.product.toString())
      );
    }

    // Populate product details
    const populatedTrending = await Product.populate(trendingProducts.slice(0, parseInt(limit)), {
      path: 'product',
      populate: { path: 'category brand' }
    });

    res.status(200).json({
      success: true,
      data: populatedTrending,
      filters: { category, priceRange }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get trending products',
      error: error.message
    });
  }
});

// Get user behavior analytics
export const getUserBehaviorAnalytics = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { days = 30 } = req.query;

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const userBehavior = await UserBehavior.findOne({ user: userId })
      .populate('preferences.categories.category')
      .populate('preferences.brands.brand');

    if (!userBehavior) {
      return res.status(404).json({
        success: false,
        message: 'No behavior data found'
      });
    }

    // Filter events by date range
    const recentEvents = userBehavior.events.filter(event => 
      event.timestamp >= startDate
    );

    // Analyze behavior patterns
    const analytics = {
      totalEvents: recentEvents.length,
      eventBreakdown: {},
      topCategories: userBehavior.preferences.categories.slice(0, 5),
      topBrands: userBehavior.preferences.brands.slice(0, 5),
      sessionStats: {
        totalSessions: userBehavior.sessions.length,
        averageSessionDuration: userBehavior.patterns.averageSessionDuration,
        recentSessions: userBehavior.sessions.slice(-10)
      },
      shoppingPattern: userBehavior.patterns.shoppingTimes,
      searchPatterns: userBehavior.patterns.searchPatterns.slice(-20)
    };

    // Count event types
    recentEvents.forEach(event => {
      analytics.eventBreakdown[event.type] = (analytics.eventBreakdown[event.type] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: analytics,
      period: { days, startDate, endDate: new Date() }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user behavior analytics',
      error: error.message
    });
  }
});

// Get recommendation performance metrics
export const getRecommendationMetrics = asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate, modelName } = req.query;

    const filter = {};
    if (startDate) filter.createdAt = { $gte: new Date(startDate) };
    if (endDate) filter.createdAt = { ...filter.createdAt, $lte: new Date(endDate) };
    if (modelName) filter.modelName = modelName;

    const metrics = await ModelPerformance.find(filter)
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate aggregate metrics
    const totalRecommendations = await Recommendation.countDocuments(filter);
    const avgGenerationTime = await Recommendation.aggregate([
      { $match: filter },
      { $group: { _id: null, avgTime: { $avg: '$performance.generationTime' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        modelMetrics: metrics,
        aggregateStats: {
          totalRecommendations,
          averageGenerationTime: avgGenerationTime[0]?.avgTime || 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendation metrics',
      error: error.message
    });
  }
});

// Refresh user recommendations
export const refreshRecommendations = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    // Clear existing recommendations
    await Recommendation.deleteMany({ user: userId });

    // Generate fresh recommendations
    const recommendations = await recommendationService.generateRecommendations(userId, { forceRefresh: true });

    res.status(200).json({
      success: true,
      message: 'Recommendations refreshed successfully',
      data: recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to refresh recommendations',
      error: error.message
    });
  }
});

// Feedback on recommendations (for ML improvement)
export const submitRecommendationFeedback = asyncHandler(async (req, res) => {
  try {
    const { recommendationId, productId, feedback, action } = req.body;
    const userId = req.user._id;

    // Track feedback for ML model improvement
    await UserBehavior.updateOne(
      { user: userId },
      {
        $push: {
          events: {
            type: 'feedback',
            product: productId,
            sessionId: req.sessionID || uuidv4(),
            source: 'recommendations',
            metadata: {
              recommendationId,
              feedback, // 'like', 'dislike', 'not_interested'
              action // 'clicked', 'purchased', 'ignored'
            }
          }
        }
      },
      { upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Feedback recorded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message
    });
  }
});

// Helper functions
async function populateRecommendations(recommendations) {
  const populated = {};
  
  for (const [key, recs] of Object.entries(recommendations)) {
    if (Array.isArray(recs)) {
      populated[key] = await Product.populate(recs, {
        path: 'product',
        populate: { path: 'category brand' }
      });
    } else {
      populated[key] = recs;
    }
  }
  
  return populated;
}

function generateSimilarityReason(similarProduct, baseProduct) {
  const reasons = [];
  
  if (similarProduct.category._id.toString() === baseProduct.category._id.toString()) {
    reasons.push(`Same category: ${similarProduct.category.name}`);
  }
  
  if (similarProduct.brand._id.toString() === baseProduct.brand._id.toString()) {
    reasons.push(`Same brand: ${similarProduct.brand.name}`);
  }
  
  const priceDiff = Math.abs(similarProduct.price - baseProduct.price) / baseProduct.price;
  if (priceDiff <= 0.3) {
    reasons.push('Similar price range');
  }
  
  if (similarProduct.rating >= 4.0) {
    reasons.push('Highly rated');
  }
  
  return reasons.length > 0 ? reasons.join(', ') : 'You might also like this';
}