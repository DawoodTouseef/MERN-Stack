import Offer, { PriceHistory, FlashSaleSession } from "../models/offersModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import notificationManager from "../services/notificationService.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// Dynamic Pricing Engine
class DynamicPricingEngine {
  static async calculateSurgePrice(productId, basePrice, demand = 0) {
    try {
      // Get recent sales data for demand calculation
      const recentOrders = await Order.find({
        'orderItems.product': productId,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      });
      
      const currentDemand = recentOrders.reduce((sum, order) => {
        const item = order.orderItems.find(item => item.product.toString() === productId);
        return sum + (item ? item.qty : 0);
      }, 0);
      
      // Basic surge pricing algorithm
      const surgeThreshold = 10; // Orders in last 24 hours
      const maxSurgeMultiplier = 2.5;
      
      if (currentDemand > surgeThreshold) {
        const surgeMultiplier = Math.min(
          1 + (currentDemand - surgeThreshold) * 0.1,
          maxSurgeMultiplier
        );
        return {
          originalPrice: basePrice,
          surgePrice: Math.round(basePrice * surgeMultiplier * 100) / 100,
          surgeMultiplier: surgeMultiplier,
          demand: currentDemand,
          isSurgeActive: true
        };
      }
      
      return {
        originalPrice: basePrice,
        surgePrice: basePrice,
        surgeMultiplier: 1,
        demand: currentDemand,
        isSurgeActive: false
      };
    } catch (error) {
      console.error('Surge pricing calculation error:', error);
      return {
        originalPrice: basePrice,
        surgePrice: basePrice,
        surgeMultiplier: 1,
        demand: 0,
        isSurgeActive: false
      };
    }
  }
  
  static async applyTimeBasedPricing(productId, basePrice, timeSlots) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since midnight
    
    for (const slot of timeSlots) {
      if (!slot.isActive) continue;
      
      const [startHour, startMin] = slot.startTime.split(':').map(Number);
      const [endHour, endMin] = slot.endTime.split(':').map(Number);
      
      const slotStart = startHour * 60 + startMin;
      const slotEnd = endHour * 60 + endMin;
      
      if (currentTime >= slotStart && currentTime <= slotEnd) {
        return {
          originalPrice: basePrice,
          adjustedPrice: Math.round(basePrice * slot.multiplier * 100) / 100,
          multiplier: slot.multiplier,
          activeSlot: slot,
          isTimeBasedActive: true
        };
      }
    }
    
    return {
      originalPrice: basePrice,
      adjustedPrice: basePrice,
      multiplier: 1,
      activeSlot: null,
      isTimeBasedActive: false
    };
  }
}

// Enhanced create offer with advanced features
export const createOffer = asyncHandler(async (req, res) => {
  try {
    const offerData = req.body;
    offerData.createdBy = req.user._id;
    
    // Set approval status based on user role
    if (req.user.role === 'admin') {
      offerData.approval = {
        status: 'approved',
        approvedBy: req.user._id,
        approvedAt: new Date()
      };
    } else {
      offerData.approval = {
        status: 'pending',
        requestedBy: req.user._id
      };
    }
    
    // Initialize analytics
    offerData.analytics = {
      views: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      hourlyStats: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        views: 0,
        conversions: 0
      }))
    };
    
    // Validate flash sale configuration
    if (offerData.flashSaleConfig?.isFlashSale) {
      if (!offerData.flashSaleConfig.flashDuration) {
        return res.status(400).json({ message: "Flash sale duration is required" });
      }
      
      // Auto-calculate end time if not provided
      if (!offerData.endTime && offerData.startTime) {
        const endTime = new Date(offerData.startTime);
        endTime.setMinutes(endTime.getMinutes() + offerData.flashSaleConfig.flashDuration);
        offerData.endTime = endTime;
      }
    }
    
    const offer = new Offer(offerData);
    const savedOffer = await offer.save();
    
    // If it's a flash sale, schedule notifications
    if (savedOffer.flashSaleConfig?.isFlashSale && savedOffer.notifications?.sendStartNotification) {
      // Schedule start notification (this would integrate with a job scheduler)
      console.log(`Flash sale notification scheduled for ${savedOffer.title}`);
    }
    
    res.status(201).json(savedOffer);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to create offer" });
  }
});

// Get all offers
export const getOffers = asyncHandler(async (req, res) => {
  try {
    const offers = await Offer.find()
    .populate('products')
    .populate('categories')
    .populate('brand');
    
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch offers" });
  }
});

// Get a single offer by ID
export const getOfferById = asyncHandler(async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id)
    .populate('products')
    .populate('categories');
    if (!offer) {
      res.status(404).json({ message: "Offer not found" });
      return;
    }
    res.status(200).json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch offer" });
  }
});

// Update an offer
export const updateOffer = asyncHandler(async (req, res) => {
  try {
    const {
      title,
      description,
      offerType,
      discountValue,
      discountUnit,
      products,
      categories,
      brand,
      bankName,
      promoCode,
      minCartValue,
      startTime,
      endTime,
    } = req.body;

    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      res.status(404).json({ message: "Offer not found" });
      return;
    }

    offer.title = title || offer.title;
    offer.description = description || offer.description;
    offer.offerType = offerType || offer.offerType;
    offer.discountValue = discountValue || offer.discountValue;
    offer.discountUnit = discountUnit || offer.discountUnit;
    offer.products = products || offer.products;
    offer.categories = categories || offer.categories;
    offer.brand = brand || offer.brand;
    offer.bankName = bankName || offer.bankName;
    offer.promoCode = promoCode || offer.promoCode;
    offer.minCartValue = minCartValue || offer.minCartValue;
    offer.startTime = startTime || offer.startTime;
    offer.endTime = endTime || offer.endTime;

    const updatedOffer = await offer.save();
    res.status(200).json(updatedOffer);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to update offer" });
  }
});

// Delete an offer
export const deleteOffer = asyncHandler(async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      res.status(404).json({ message: "Offer not found" });
      return;
    }

    await Offer.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Offer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete offer" });
  }
});

// Advanced Dynamic Pricing Functions

// Calculate dynamic price for a product
export const calculateDynamicPrice = asyncHandler(async (req, res) => {
  try {
    const { productId, quantity = 1, userId, location } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    let finalPrice = product.price;
    let appliedOffers = [];
    let pricing = {
      originalPrice: product.price,
      finalPrice: product.price,
      totalDiscount: 0,
      appliedOffers: [],
      pricingFactors: []
    };
    
    // Get applicable offers
    const now = new Date();
    const applicableOffers = await Offer.find({
      isActive: true,
      isVisible: true,
      startTime: { $lte: now },
      endTime: { $gte: now },
      'approval.status': 'approved',
      $or: [
        { products: productId },
        { categories: product.category },
        { brand: product.brand }
      ]
    }).sort({ priority: -1 });
    
    // Apply surge pricing if enabled
    for (const offer of applicableOffers) {
      if (offer.pricingRules?.surgePricing?.isEnabled) {
        const surgeResult = await DynamicPricingEngine.calculateSurgePrice(
          productId,
          finalPrice,
          offer.pricingRules.surgePricing.currentDemand
        );
        
        if (surgeResult.isSurgeActive) {
          finalPrice = surgeResult.surgePrice;
          pricing.pricingFactors.push({
            type: 'surge',
            multiplier: surgeResult.surgeMultiplier,
            demand: surgeResult.demand,
            priceChange: surgeResult.surgePrice - surgeResult.originalPrice
          });
        }
      }
      
      // Apply time-based pricing
      if (offer.pricingRules?.timeSlots?.length > 0) {
        const timeResult = await DynamicPricingEngine.applyTimeBasedPricing(
          productId,
          finalPrice,
          offer.pricingRules.timeSlots
        );
        
        if (timeResult.isTimeBasedActive) {
          finalPrice = timeResult.adjustedPrice;
          pricing.pricingFactors.push({
            type: 'time_based',
            multiplier: timeResult.multiplier,
            activeSlot: timeResult.activeSlot,
            priceChange: timeResult.adjustedPrice - timeResult.originalPrice
          });
        }
      }
      
      // Apply quantity-based discounts
      if (offer.pricingRules?.quantityTiers?.length > 0) {
        const applicableTier = offer.pricingRules.quantityTiers
          .filter(tier => quantity >= tier.minQuantity && 
                         (!tier.maxQuantity || quantity <= tier.maxQuantity))
          .sort((a, b) => b.discountPercent - a.discountPercent)[0];
        
        if (applicableTier) {
          const discount = (finalPrice * applicableTier.discountPercent) / 100;
          finalPrice -= discount;
          pricing.pricingFactors.push({
            type: 'quantity_tier',
            tier: applicableTier,
            discount: discount
          });
        }
      }
      
      // Apply regular discount
      if (offer.discountValue > 0) {
        let discount = 0;
        if (offer.discountUnit === 'percent') {
          discount = (finalPrice * offer.discountValue) / 100;
          if (offer.maxDiscountAmount) {
            discount = Math.min(discount, offer.maxDiscountAmount);
          }
        } else {
          discount = offer.discountValue;
        }
        
        finalPrice -= discount;
        appliedOffers.push({
          id: offer._id,
          title: offer.title,
          discountValue: offer.discountValue,
          discountUnit: offer.discountUnit,
          discount: discount
        });
      }
    }
    
    pricing.finalPrice = Math.max(0, Math.round(finalPrice * 100) / 100);
    pricing.totalDiscount = pricing.originalPrice - pricing.finalPrice;
    pricing.appliedOffers = appliedOffers;
    
    res.json(pricing);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to calculate dynamic price" });
  }
});

// Start flash sale
export const startFlashSale = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }
    
    if (!offer.flashSaleConfig?.isFlashSale) {
      return res.status(400).json({ message: "This is not a flash sale offer" });
    }
    
    // Update offer status
    offer.isActive = true;
    offer.startTime = new Date();
    
    if (offer.flashSaleConfig.flashDuration) {
      const endTime = new Date();
      endTime.setMinutes(endTime.getMinutes() + offer.flashSaleConfig.flashDuration);
      offer.endTime = endTime;
    }
    
    await offer.save();
    
    // Send notifications to subscribers
    if (offer.notifications?.sendStartNotification) {
      await notificationManager.broadcastToAll('flash_sale_started', {
        offer: {
          id: offer._id,
          title: offer.title,
          discountValue: offer.discountValue,
          endTime: offer.endTime
        },
        message: offer.notifications.startMessage || `Flash sale started: ${offer.title}!`
      });
    }
    
    res.json({ message: "Flash sale started successfully", offer });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to start flash sale" });
  }
});

// End flash sale
export const endFlashSale = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }
    
    offer.isActive = false;
    offer.endTime = new Date();
    
    await offer.save();
    
    // Send end notifications
    if (offer.notifications?.sendEndNotification) {
      await notificationManager.broadcastToAll('flash_sale_ended', {
        offer: {
          id: offer._id,
          title: offer.title
        },
        message: offer.notifications.endMessage || `Flash sale ended: ${offer.title}`
      });
    }
    
    res.json({ message: "Flash sale ended successfully", offer });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to end flash sale" });
  }
});

// Get active flash sales
export const getActiveFlashSales = asyncHandler(async (req, res) => {
  try {
    const now = new Date();
    
    const activeFlashSales = await Offer.find({
      isActive: true,
      isVisible: true,
      'flashSaleConfig.isFlashSale': true,
      startTime: { $lte: now },
      endTime: { $gte: now },
      'approval.status': 'approved'
    })
    .populate('products', 'name price media')
    .populate('categories', 'name')
    .populate('brand', 'name')
    .sort({ priority: -1, createdAt: -1 });
    
    // Add countdown information
    const flashSalesWithCountdown = activeFlashSales.map(sale => ({
      ...sale.toObject(),
      timeRemaining: Math.max(0, new Date(sale.endTime) - now),
      isEndingSoon: (new Date(sale.endTime) - now) < 60 * 60 * 1000, // Less than 1 hour
      percentageSold: sale.flashSaleConfig.stockLimit > 0 ? 
        ((sale.flashSaleConfig.stockLimit - sale.flashSaleConfig.currentStock) / sale.flashSaleConfig.stockLimit * 100) : 0
    }));
    
    res.json(flashSalesWithCountdown);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch active flash sales" });
  }
});

// Track offer interaction
export const trackOfferInteraction = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { action, metadata = {} } = req.body;
    
    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }
    
    // Add user interaction
    offer.userInteractions.push({
      user: req.user._id,
      action: action,
      timestamp: new Date(),
      metadata: metadata
    });
    
    // Update analytics
    const currentHour = new Date().getHours();
    const hourlyStatsIndex = offer.analytics.hourlyStats.findIndex(stat => stat.hour === currentHour);
    
    switch (action) {
      case 'view':
        offer.analytics.views++;
        if (hourlyStatsIndex >= 0) {
          offer.analytics.hourlyStats[hourlyStatsIndex].views++;
        }
        break;
      case 'click':
        offer.analytics.clicks++;
        break;
      case 'purchase':
        offer.analytics.conversions++;
        if (hourlyStatsIndex >= 0) {
          offer.analytics.hourlyStats[hourlyStatsIndex].conversions++;
        }
        if (metadata.orderValue) {
          offer.analytics.revenue += metadata.orderValue;
        }
        
        // Update flash sale stock
        if (offer.flashSaleConfig?.isFlashSale && metadata.quantity) {
          offer.flashSaleConfig.currentStock -= metadata.quantity;
        }
        break;
    }
    
    await offer.save();
    
    res.json({ message: "Interaction tracked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to track interaction" });
  }
});

// Create flash sale session
export const createFlashSaleSession = asyncHandler(async (req, res) => {
  try {
    const sessionData = req.body;
    sessionData.createdBy = req.user._id;
    
    const session = new FlashSaleSession(sessionData);
    const savedSession = await session.save();
    
    res.status(201).json(savedSession);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to create flash sale session" });
  }
});

// Get flash sale sessions
export const getFlashSaleSessions = asyncHandler(async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    const filter = {};
    if (status) filter['offers.status'] = status;
    
    if (startDate && endDate) {
      filter.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const sessions = await FlashSaleSession.find(filter)
      .populate('offers.offer')
      .sort({ startTime: -1 });
    
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch flash sale sessions" });
  }
});

// Approve offer (admin only)
export const approveOffer = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { approve, rejectionReason } = req.body;
    
    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }
    
    if (approve) {
      offer.approval.status = 'approved';
      offer.approval.approvedBy = req.user._id;
      offer.approval.approvedAt = new Date();
    } else {
      offer.approval.status = 'rejected';
      offer.approval.rejectionReason = rejectionReason;
    }
    
    await offer.save();
    
    res.json({ 
      message: `Offer ${approve ? 'approved' : 'rejected'} successfully`, 
      offer 
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to process offer approval" });
  }
});

// Get offer analytics
export const getOfferAnalytics = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '24h' } = req.query;
    
    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }
    
    // Calculate conversion rate
    const conversionRate = offer.analytics.views > 0 ? 
      (offer.analytics.conversions / offer.analytics.views * 100) : 0;
    
    const analytics = {
      basic: {
        views: offer.analytics.views,
        clicks: offer.analytics.clicks,
        conversions: offer.analytics.conversions,
        revenue: offer.analytics.revenue,
        conversionRate: Math.round(conversionRate * 100) / 100
      },
      hourly: offer.analytics.hourlyStats,
      interactions: offer.userInteractions.length,
      performance: {
        averageOrderValue: offer.analytics.conversions > 0 ? 
          (offer.analytics.revenue / offer.analytics.conversions) : 0,
        clickThroughRate: offer.analytics.views > 0 ? 
          (offer.analytics.clicks / offer.analytics.views * 100) : 0
      }
    };
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch offer analytics" });
  }
});

// Create price history entry
export const createPriceHistory = asyncHandler(async (req, res) => {
  try {
    const historyData = req.body;
    historyData.createdBy = req.user._id;
    
    const priceHistory = new PriceHistory(historyData);
    const savedHistory = await priceHistory.save();
    
    res.status(201).json(savedHistory);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to create price history" });
  }
});

// Get price history for a product
export const getPriceHistory = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.params;
    const { startDate, endDate, limit = 50 } = req.query;
    
    const filter = { product: productId };
    
    if (startDate && endDate) {
      filter.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const history = await PriceHistory.find(filter)
      .populate('offer', 'title offerType')
      .sort({ startTime: -1 })
      .limit(parseInt(limit));
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch price history" });
  }
});