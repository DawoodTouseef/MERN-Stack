import asyncHandler from 'express-async-handler';
import DynamicPricing from '../models/dynamicPricingModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import BehaviorTracking from '../models/behaviorTrackingModel.js';

// @desc    Create dynamic pricing rule
// @route   POST /api/pricing
// @access  Private/Admin
const createDynamicPricing = asyncHandler(async (req, res) => {
  try {
    const pricingData = {
      ...req.body,
      createdBy: req.user._id
    };

    const pricing = new DynamicPricing(pricingData);
    const savedPricing = await pricing.save();

    await savedPricing.populate([
      { path: 'targets.products', select: 'name price' },
      { path: 'targets.categories', select: 'name' },
      { path: 'targets.brands', select: 'name' },
      { path: 'createdBy', select: 'username email' }
    ]);

    res.status(201).json({
      success: true,
      data: savedPricing,
      message: 'Dynamic pricing rule created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create pricing rule',
      error: error.message
    });
  }
});

// @desc    Get all dynamic pricing rules
// @route   GET /api/pricing
// @access  Private/Admin
const getAllDynamicPricings = asyncHandler(async (req, res) => {
  try {
    const {
      status,
      pricingType,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (pricingType) query.pricingType = pricingType;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      populate: [
        { path: 'targets.products', select: 'name price' },
        { path: 'targets.categories', select: 'name' },
        { path: 'targets.brands', select: 'name' },
        { path: 'createdBy', select: 'username email' }
      ]
    };

    const result = await DynamicPricing.paginate(query, options);

    res.json({
      success: true,
      data: result.docs,
      pagination: {
        total: result.totalDocs,
        pages: result.totalPages,
        page: result.page,
        limit: result.limit
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pricing rules',
      error: error.message
    });
  }
});

// @desc    Get active flash sales
// @route   GET /api/pricing/flash-sales
// @access  Public
const getActiveFlashSales = asyncHandler(async (req, res) => {
  try {
    const { limit = 10, category, brand } = req.query;
    const now = new Date();

    let query = {
      pricingType: 'flash_sale',
      status: 'active',
      'schedule.startDate': { $lte: now },
      'schedule.endDate': { $gte: now },
      'schedule.flashSaleConfig.isActive': true
    };

    const flashSales = await DynamicPricing.find(query)
      .populate([
        { path: 'targets.products', select: 'name price image countInStock rating numReviews category brand' },
        { path: 'targets.categories', select: 'name' },
        { path: 'targets.brands', select: 'name' }
      ])
      .sort({ priority: -1, 'schedule.endDate': 1 })
      .limit(parseInt(limit));

    // Flatten products from all flash sales
    const flashSaleProducts = [];
    
    for (const sale of flashSales) {
      const products = sale.targets.products || [];
      
      for (const product of products) {
        // Apply filters
        if (category && product.category.toString() !== category) continue;
        if (brand && product.brand.toString() !== brand) continue;
        
        const pricingInfo = sale.calculateDiscount(product.price, 1);
        
        flashSaleProducts.push({
          ...product.toObject(),
          flashSale: {
            id: sale._id,
            name: sale.name,
            endDate: sale.schedule.endDate,
            timeRemaining: sale.timeRemaining,
            originalPrice: product.price,
            discountedPrice: pricingInfo.finalPrice,
            discount: pricingInfo.discount,
            savingsPercentage: pricingInfo.savingsPercentage,
            maxQuantity: sale.schedule.flashSaleConfig.maxQuantity,
            soldQuantity: sale.schedule.flashSaleConfig.soldQuantity,
            remainingQuantity: sale.schedule.flashSaleConfig.maxQuantity - sale.schedule.flashSaleConfig.soldQuantity
          }
        });
      }
    }

    // Sort by savings percentage and limit results
    flashSaleProducts.sort((a, b) => b.flashSale.savingsPercentage - a.flashSale.savingsPercentage);

    res.json({
      success: true,
      data: flashSaleProducts.slice(0, parseInt(limit)),
      total: flashSaleProducts.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch flash sales',
      error: error.message
    });
  }
});

// @desc    Calculate dynamic price for product
// @route   POST /api/pricing/calculate
// @access  Public
const calculateDynamicPrice = asyncHandler(async (req, res) => {
  try {
    const { productId, quantity = 1, userSegment = 'all', location } = req.body;

    const product = await Product.findById(productId).populate('category brand');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Find all active pricing rules for this product
    const activePricings = await DynamicPricing.findActivePricingsForProduct(
      productId,
      product.category._id,
      product.brand._id,
      product.user // vendor
    );

    let bestPrice = product.price;
    let appliedPricing = null;
    let maxDiscount = 0;

    // Apply the best pricing rule (highest discount)
    for (const pricing of activePricings) {
      // Check location targeting
      if (pricing.targets.locations.length > 0 && location) {
        const locationMatch = pricing.targets.locations.some(loc => {
          return (!loc.country || loc.country === location.country) &&
                 (!loc.state || loc.state === location.state) &&
                 (!loc.city || loc.city === location.city);
        });
        if (!locationMatch) continue;
      }

      // Check minimum order requirements
      const orderValue = product.price * quantity;
      if (orderValue < pricing.pricingRules.minOrderValue) continue;
      if (quantity < pricing.pricingRules.minQuantity) continue;

      const pricingResult = pricing.calculateDiscount(product.price, quantity, userSegment);
      
      if (pricingResult.discount > maxDiscount) {
        maxDiscount = pricingResult.discount;
        bestPrice = pricingResult.finalPrice;
        appliedPricing = {
          id: pricing._id,
          name: pricing.name,
          type: pricing.pricingType,
          discount: pricingResult.discount,
          savingsPercentage: pricingResult.savingsPercentage
        };
      }
    }

    res.json({
      success: true,
      data: {
        productId,
        originalPrice: product.price,
        dynamicPrice: bestPrice,
        totalDiscount: maxDiscount,
        totalPrice: bestPrice * quantity,
        appliedPricing,
        quantity,
        savings: (product.price - bestPrice) * quantity
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to calculate dynamic price',
      error: error.message
    });
  }
});

// @desc    Get surge pricing recommendations
// @route   GET /api/pricing/surge-recommendations
// @access  Private/Admin
const getSurgePricingRecommendations = asyncHandler(async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - parseInt(days));

    // Analyze demand patterns
    const demandAnalysis = await BehaviorTracking.aggregate([
      {
        $match: {
          eventType: { $in: ['product_view', 'add_to_cart', 'purchase'] },
          timestamp: { $gte: dateFrom }
        }
      },
      {
        $group: {
          _id: {
            productId: '$metadata.productId',
            hour: { $hour: '$timestamp' },
            dayOfWeek: { $dayOfWeek: '$timestamp' }
          },
          eventCount: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $group: {
          _id: '$_id.productId',
          demandPatterns: {
            $push: {
              hour: '$_id.hour',
              dayOfWeek: '$_id.dayOfWeek',
              demand: '$eventCount',
              uniqueUsers: { $size: '$uniqueUsers' }
            }
          },
          totalDemand: { $sum: '$eventCount' },
          avgDemand: { $avg: '$eventCount' }
        }
      },
      {
        $match: {
          totalDemand: { $gte: 50 } // Minimum demand threshold
        }
      },
      { $sort: { totalDemand: -1 } },
      { $limit: 20 }
    ]);

    // Get product details and current stock
    const productIds = demandAnalysis.map(item => item._id);
    const products = await Product.find({ _id: { $in: productIds } })
      .populate('category brand')
      .select('name price countInStock category brand');

    const recommendations = demandAnalysis.map(analysis => {
      const product = products.find(p => p._id.toString() === analysis._id.toString());
      if (!product) return null;

      // Calculate demand surge factor
      const maxDemand = Math.max(...analysis.demandPatterns.map(p => p.demand));
      const surgeFactor = Math.min(3, 1 + (maxDemand / analysis.avgDemand - 1) * 0.5);
      
      // Check if low stock (scarcity pricing)
      const isLowStock = product.countInStock < 10;
      const scarcityMultiplier = isLowStock ? 1.2 : 1;
      
      const recommendedSurgeFactor = surgeFactor * scarcityMultiplier;
      const recommendedPrice = product.price * recommendedSurgeFactor;

      return {
        product: {
          id: product._id,
          name: product.name,
          currentPrice: product.price,
          stock: product.countInStock,
          category: product.category.name,
          brand: product.brand.name
        },
        demand: {
          total: analysis.totalDemand,
          average: analysis.avgDemand,
          patterns: analysis.demandPatterns
        },
        recommendation: {
          surgeFactor: recommendedSurgeFactor,
          recommendedPrice: Math.round(recommendedPrice * 100) / 100,
          priceIncrease: Math.round((recommendedPrice - product.price) * 100) / 100,
          increasePercentage: Math.round(((recommendedPrice / product.price) - 1) * 100),
          reasoning: [
            `High demand detected (${analysis.totalDemand} events)`,
            isLowStock ? 'Low stock creates scarcity' : 'Normal stock levels',
            `Peak demand ${maxDemand}x average`
          ]
        }
      };
    }).filter(Boolean);

    res.json({
      success: true,
      data: recommendations,
      analysis: {
        periodDays: parseInt(days),
        totalProductsAnalyzed: productIds.length,
        recommendationsGenerated: recommendations.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate surge pricing recommendations',
      error: error.message
    });
  }
});

// @desc    Update pricing rule
// @route   PUT /api/pricing/:id
// @access  Private/Admin
const updateDynamicPricing = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      lastModifiedBy: req.user._id
    };

    const pricing = await DynamicPricing.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'targets.products', select: 'name price' },
      { path: 'targets.categories', select: 'name' },
      { path: 'targets.brands', select: 'name' },
      { path: 'createdBy', select: 'username email' },
      { path: 'lastModifiedBy', select: 'username email' }
    ]);

    if (!pricing) {
      return res.status(404).json({
        success: false,
        message: 'Pricing rule not found'
      });
    }

    res.json({
      success: true,
      data: pricing,
      message: 'Pricing rule updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update pricing rule',
      error: error.message
    });
  }
});

// @desc    Delete pricing rule
// @route   DELETE /api/pricing/:id
// @access  Private/Admin
const deleteDynamicPricing = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const pricing = await DynamicPricing.findByIdAndDelete(id);

    if (!pricing) {
      return res.status(404).json({
        success: false,
        message: 'Pricing rule not found'
      });
    }

    res.json({
      success: true,
      message: 'Pricing rule deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete pricing rule',
      error: error.message
    });
  }
});

// @desc    Activate/Deactivate pricing rule
// @route   PATCH /api/pricing/:id/toggle
// @access  Private/Admin
const togglePricingStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'activate' or 'deactivate'

    const pricing = await DynamicPricing.findById(id);
    if (!pricing) {
      return res.status(404).json({
        success: false,
        message: 'Pricing rule not found'
      });
    }

    pricing.status = action === 'activate' ? 'active' : 'paused';
    pricing.lastModifiedBy = req.user._id;
    await pricing.save();

    res.json({
      success: true,
      data: pricing,
      message: `Pricing rule ${action}d successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle pricing status',
      error: error.message
    });
  }
});

// @desc    Get pricing analytics
// @route   GET /api/pricing/analytics
// @access  Private/Admin
const getPricingAnalytics = asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate, pricingType } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    let query = { ...dateFilter };
    if (pricingType) query.pricingType = pricingType;

    // Aggregate pricing performance
    const analytics = await DynamicPricing.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$pricingType',
          totalRules: { $sum: 1 },
          activeRules: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          totalRevenue: { $sum: '$performance.totalRevenue' },
          totalSales: { $sum: '$performance.totalSales' },
          avgConversionRate: { $avg: '$performance.conversionRate' },
          avgClickThroughRate: { $avg: '$performance.clickThroughRate' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    // Overall stats
    const overallStats = await DynamicPricing.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalRules: { $sum: 1 },
          totalRevenue: { $sum: '$performance.totalRevenue' },
          totalSales: { $sum: '$performance.totalSales' },
          avgConversionRate: { $avg: '$performance.conversionRate' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        byType: analytics,
        overall: overallStats[0] || {
          totalRules: 0,
          totalRevenue: 0,
          totalSales: 0,
          avgConversionRate: 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pricing analytics',
      error: error.message
    });
  }
});

export {
  createDynamicPricing,
  getAllDynamicPricings,
  getActiveFlashSales,
  calculateDynamicPrice,
  getSurgePricingRecommendations,
  updateDynamicPricing,
  deleteDynamicPricing,
  togglePricingStatus,
  getPricingAnalytics
};