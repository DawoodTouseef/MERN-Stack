import { 
  UserBehavior, 
  ProductSimilarity, 
  UserSimilarity, 
  Recommendation 
} from '../models/recommendationModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import Category from '../models/categoryModel.js';

class EnhancedRecommendationService {
  constructor() {
    this.modelWeights = {
      contentBased: 0.25,
      collaborative: 0.25,
      trending: 0.15,
      seasonal: 0.1,
      deepLearning: 0.15,
      realTime: 0.05,
      behavioralPatterns: 0.05
    };
    
    // Amazon-like algorithm configurations
    this.algorithms = {
      frequentlyBoughtTogether: {
        minSupport: 0.01,
        minConfidence: 0.5,
        windowDays: 30,
        minOccurrences: 3
      },
      customersWhoViewed: {
        similarityThreshold: 0.3,
        maxRecommendations: 20,
        timeDecayFactor: 0.1,
        maxLookbackDays: 60
      },
      browsingHistory: {
        weightRecent: 0.7,
        weightFrequent: 0.3,
        maxHistoryDays: 90,
        sessionWeight: 0.4
      },
      categoryAffinity: {
        primaryWeight: 0.5,
        secondaryWeight: 0.3,
        tertiaryWeight: 0.2,
        crossCategoryBonus: 0.1
      }
    };

    this.userSegments = {
      newUser: { minInteractions: 0, maxInteractions: 5 },
      casual: { minInteractions: 6, maxInteractions: 20 },
      engaged: { minInteractions: 21, maxInteractions: 100 },
      power: { minInteractions: 101, maxInteractions: Infinity }
    };
  }

  // Build comprehensive user profile
  async buildUserProfile(userId) {
    try {
      const [userBehavior, userOrders, userBasicInfo] = await Promise.all([
        UserBehavior.findOne({ user: userId }).populate([
          'events.product',
          'events.category',
          'events.brand',
          'preferences.categories.category',
          'preferences.brands.brand'
        ]),
        Order.find({ user: userId, isPaid: true }).populate('orderItems.product'),
        User.findById(userId)
      ]);

      if (!userBehavior) {
        return {
          userId,
          segment: 'newUser',
          totalInteractions: 0,
          preferences: { categories: [], brands: [], priceRange: {} },
          patterns: {},
          loyaltyScores: {},
          affinityScores: {}
        };
      }

      const totalInteractions = userBehavior.events.length;
      const segment = this.getUserSegment(totalInteractions);
      const loyaltyScores = this.calculateBrandLoyalty(userBehavior, userOrders);
      const categoryAffinity = this.calculateCategoryAffinity(userBehavior, userOrders);
      const priceAffinity = this.calculatePriceAffinity(userOrders);

      return {
        userId,
        segment,
        totalInteractions,
        preferences: {
          categories: userBehavior.preferences.categories || [],
          brands: userBehavior.preferences.brands || [],
          priceRange: priceAffinity.preferredRange
        },
        loyaltyScores,
        affinityScores: {
          category: categoryAffinity,
          price: priceAffinity,
          brand: loyaltyScores
        },
        lastActive: userBehavior.updatedAt,
        totalOrders: userOrders.length,
        lifetimeValue: userOrders.reduce((sum, order) => sum + order.totalPrice, 0)
      };
    } catch (error) {
      console.error('Error building user profile:', error);
      return null;
    }
  }

  // Amazon's frequently bought together algorithm
  async getFrequentlyBoughtTogetherRecommendations(userId, userProfile, limit = 10) {
    try {
      const recentOrders = await Order.find({
        user: userId,
        isPaid: true,
        createdAt: { $gte: new Date(Date.now() - this.algorithms.frequentlyBoughtTogether.windowDays * 24 * 60 * 60 * 1000) }
      }).populate('orderItems.product');

      const purchasedProducts = new Set();
      recentOrders.forEach(order => {
        order.orderItems.forEach(item => {
          if (item.product) {
            purchasedProducts.add(item.product._id.toString());
          }
        });
      });

      if (purchasedProducts.size === 0) {
        return [];
      }

      // Market basket analysis
      const productCombinations = await Order.aggregate([
        {
          $match: {
            isPaid: true,
            createdAt: { $gte: new Date(Date.now() - this.algorithms.frequentlyBoughtTogether.windowDays * 24 * 60 * 60 * 1000) },
            'orderItems.product': { $in: Array.from(purchasedProducts) }
          }
        },
        { $unwind: '$orderItems' },
        {
          $group: {
            _id: '$_id',
            products: { $push: '$orderItems.product' },
            orderDate: { $first: '$createdAt' }
          }
        },
        {
          $match: {
            'products.1': { $exists: true }
          }
        }
      ]);

      const associationRules = this.calculateAssociationRules(productCombinations, purchasedProducts);
      const recommendationCandidates = [];
      
      for (const rule of associationRules) {
        if (rule.confidence >= this.algorithms.frequentlyBoughtTogether.minConfidence) {
          const product = await Product.findById(rule.consequent)
            .populate('category')
            .populate('brand');
          
          if (product && product.countInStock > 0) {
            recommendationCandidates.push({
              product: product._id,
              score: rule.confidence * rule.lift * 0.8 + rule.support * 0.2,
              confidence: rule.confidence,
              reason: `${Math.round(rule.confidence * 100)}% of customers who bought your items also bought this`,
              algorithm: 'frequently_bought_together'
            });
          }
        }
      }

      return recommendationCandidates
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error('Error in frequently bought together recommendations:', error);
      return [];
    }
  }

  // Customers who viewed this also viewed
  async getCustomersWhoViewedRecommendations(userId, userProfile, limit = 10) {
    try {
      const userBehavior = await UserBehavior.findOne({ user: userId });
      if (!userBehavior || userBehavior.events.length === 0) {
        return [];
      }

      const recentViews = userBehavior.events
        .filter(e => ['view', 'product_view', 'click'].includes(e.type))
        .slice(-20)
        .map(e => e.product)
        .filter(Boolean);

      if (recentViews.length === 0) {
        return [];
      }

      const similarViewingSessions = await UserBehavior.aggregate([
        {
          $match: {
            user: { $ne: userId },
            'events.product': { $in: recentViews },
            'events.type': { $in: ['view', 'product_view', 'click'] }
          }
        },
        {
          $unwind: '$events'
        },
        {
          $match: {
            'events.product': { $in: recentViews },
            'events.type': { $in: ['view', 'product_view', 'click'] }
          }
        },
        {
          $group: {
            _id: '$user',
            viewedProducts: { $addToSet: '$events.product' },
            totalViews: { $sum: 1 }
          }
        },
        {
          $match: {
            viewedProducts: { $size: { $gte: 2 } }
          }
        },
        {
          $sort: { totalViews: -1 }
        },
        {
          $limit: 100
        }
      ]);

      const similarUserIds = similarViewingSessions.map(s => s._id);
      const otherViewedProducts = await UserBehavior.aggregate([
        {
          $match: {
            user: { $in: similarUserIds },
            'events.type': { $in: ['view', 'product_view', 'click'] }
          }
        },
        {
          $unwind: '$events'
        },
        {
          $match: {
            'events.type': { $in: ['view', 'product_view', 'click'] },
            'events.product': { $nin: recentViews }
          }
        },
        {
          $group: {
            _id: '$events.product',
            viewCount: { $sum: 1 },
            uniqueUsers: { $addToSet: '$user' }
          }
        },
        {
          $addFields: {
            uniqueUserCount: { $size: '$uniqueUsers' }
          }
        },
        {
          $match: {
            viewCount: { $gte: 3 }
          }
        },
        {
          $sort: { viewCount: -1 }
        },
        {
          $limit: limit * 3
        }
      ]);

      const recommendations = [];
      
      for (const productStat of otherViewedProducts) {
        const product = await Product.findById(productStat._id)
          .populate('category')
          .populate('brand');
        
        if (product && product.countInStock > 0) {
          const viewFrequencyScore = Math.min(productStat.viewCount / 50, 1);
          const userOverlapScore = Math.min(productStat.uniqueUserCount / 20, 1);
          const qualityScore = product.rating / 5;
          
          const finalScore = (
            viewFrequencyScore * 0.4 +
            userOverlapScore * 0.4 +
            qualityScore * 0.2
          );

          recommendations.push({
            product: product._id,
            score: finalScore,
            viewCount: productStat.viewCount,
            reason: `Viewed by ${productStat.uniqueUserCount} customers who looked at similar items`,
            algorithm: 'customers_who_viewed'
          });
        }
      }

      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error('Error in customers who viewed recommendations:', error);
      return [];
    }
  }

  // Generate advanced personalized recommendations
  async generateAdvancedPersonalizedRecommendations(userId, options = {}) {
    try {
      const { limit = 20, context = 'homepage' } = options;
      
      const userProfile = await this.buildUserProfile(userId);
      
      if (!userProfile || userProfile.totalInteractions === 0) {
        return await this.getOnboardingRecommendations(limit, context);
      }

      const [
        frequentlyBought,
        customersViewed,
        categoryAffinity,
        trending
      ] = await Promise.all([
        this.getFrequentlyBoughtTogetherRecommendations(userId, userProfile, Math.ceil(limit * 0.3)),
        this.getCustomersWhoViewedRecommendations(userId, userProfile, Math.ceil(limit * 0.4)),
        this.getCategoryAffinityRecommendations(userId, userProfile, Math.ceil(limit * 0.2)),
        this.getTrendingRecommendations(Math.ceil(limit * 0.1), context)
      ]);

      const combinedRecommendations = [
        ...frequentlyBought,
        ...customersViewed,
        ...categoryAffinity,
        ...trending
      ];

      return this.applyDiversityFilters(combinedRecommendations, limit);
    } catch (error) {
      console.error('Error generating advanced personalized recommendations:', error);
      return await this.getOnboardingRecommendations(limit, context);
    }
  }

  // Helper methods
  getUserSegment(totalInteractions) {
    for (const [segment, range] of Object.entries(this.userSegments)) {
      if (totalInteractions >= range.minInteractions && totalInteractions <= range.maxInteractions) {
        return segment;
      }
    }
    return 'casual';
  }

  calculateAssociationRules(transactions, userProducts) {
    const rules = [];
    const productSupport = new Map();
    const totalTransactions = transactions.length;

    transactions.forEach(transaction => {
      const products = transaction.products;
      products.forEach(product => {
        productSupport.set(product.toString(), (productSupport.get(product.toString()) || 0) + 1);
      });
    });

    userProducts.forEach(userProduct => {
      const userProductSupport = productSupport.get(userProduct) || 0;
      
      productSupport.forEach((support, product) => {
        if (product !== userProduct) {
          let coOccurrences = 0;
          transactions.forEach(transaction => {
            const products = transaction.products.map(p => p.toString());
            if (products.includes(userProduct) && products.includes(product)) {
              coOccurrences++;
            }
          });

          if (coOccurrences >= this.algorithms.frequentlyBoughtTogether.minOccurrences) {
            const confidence = coOccurrences / userProductSupport;
            const supportValue = coOccurrences / totalTransactions;
            const lift = confidence / (support / totalTransactions);

            rules.push({
              antecedents: [userProduct],
              consequent: product,
              confidence,
              support: supportValue,
              lift
            });
          }
        }
      });
    });

    return rules.sort((a, b) => b.confidence * b.lift - a.confidence * a.lift);
  }

  calculateBrandLoyalty(userBehavior, userOrders) {
    const brandInteractions = {};
    const brandPurchases = {};

    userBehavior.events.forEach(event => {
      if (event.brand) {
        const brandId = event.brand.toString();
        brandInteractions[brandId] = (brandInteractions[brandId] || 0) + 1;
      }
    });

    userOrders.forEach(order => {
      order.orderItems.forEach(item => {
        if (item.product && item.product.brand) {
          const brandId = item.product.brand.toString();
          brandPurchases[brandId] = (brandPurchases[brandId] || 0) + item.qty;
        }
      });
    });

    const loyaltyScores = {};
    Object.keys(brandInteractions).forEach(brandId => {
      const interactions = brandInteractions[brandId];
      const purchases = brandPurchases[brandId] || 0;
      
      loyaltyScores[brandId] = {
        interactionCount: interactions,
        purchaseCount: purchases,
        loyaltyScore: Math.min((interactions * 0.3 + purchases * 0.7) / 10, 1)
      };
    });

    return loyaltyScores;
  }

  calculateCategoryAffinity(userBehavior, userOrders) {
    const categoryScores = {};

    userBehavior.events.forEach(event => {
      if (event.category) {
        const categoryId = event.category.toString();
        const eventWeight = this.getEventWeight(event.type);
        categoryScores[categoryId] = (categoryScores[categoryId] || 0) + eventWeight;
      }
    });

    userOrders.forEach(order => {
      order.orderItems.forEach(item => {
        if (item.product && item.product.category) {
          const categoryId = item.product.category.toString();
          categoryScores[categoryId] = (categoryScores[categoryId] || 0) + item.qty * 5;
        }
      });
    });

    const maxScore = Math.max(...Object.values(categoryScores), 1);
    Object.keys(categoryScores).forEach(categoryId => {
      categoryScores[categoryId] = categoryScores[categoryId] / maxScore;
    });

    return categoryScores;
  }

  calculatePriceAffinity(userOrders) {
    if (userOrders.length === 0) {
      return { preferredRange: { min: 0, max: 1000 }, tendency: 'unknown' };
    }

    const orderValues = userOrders.map(order => order.totalPrice);
    orderValues.sort((a, b) => a - b);
    const q25 = orderValues[Math.floor(orderValues.length * 0.25)];
    const q75 = orderValues[Math.floor(orderValues.length * 0.75)];

    return {
      preferredRange: { min: q25, max: q75 },
      tendency: 'balanced'
    };
  }

  getEventWeight(eventType) {
    const weights = {
      view: 1,
      click: 2,
      add_to_cart: 4,
      purchase: 8,
      like: 3,
      share: 5
    };
    return weights[eventType] || 1;
  }

  async getCategoryAffinityRecommendations(userId, userProfile, limit) {
    // Implementation for category affinity recommendations
    return [];
  }

  async getTrendingRecommendations(limit, context) {
    // Implementation for trending recommendations
    return [];
  }

  async getOnboardingRecommendations(limit, context) {
    // Implementation for onboarding recommendations
    return [];
  }

  applyDiversityFilters(recommendations, limit) {
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

export default new EnhancedRecommendationService();