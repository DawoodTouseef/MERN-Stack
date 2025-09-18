import { 
  UserBehavior, 
  ProductSimilarity, 
  UserSimilarity, 
  Recommendation, 
  ModelPerformance 
} from '../models/recommendationModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import Category from '../models/categoryModel.js';
import  BrandModel  from '../models/BrandModel.js';

class RecommendationService {
  constructor() {
    this.algorithms = {
      contentBased: this.contentBasedRecommendations.bind(this),
      collaborative: this.collaborativeFiltering.bind(this),
      hybrid: this.hybridRecommendations.bind(this),
      trending: this.trendingRecommendations.bind(this),
      frequentlyBought: this.frequentlyBoughtTogether.bind(this)
    };
    
    // Configuration
    this.config = {
      maxRecommendations: 20,
      similarityThreshold: 0.1,
      cacheExpiry: 24 * 60 * 60 * 1000, // 24 hours
      minInteractions: 3,
      diversityWeight: 0.3,
      recencyWeight: 0.2
    };
  }

  // Track user behavior
  async trackUserBehavior(userId, eventData) {
    try {
      let userBehavior = await UserBehavior.findOne({ user: userId });
      
      if (!userBehavior) {
        userBehavior = new UserBehavior({
          user: userId,
          events: [],
          sessions: [],
          preferences: { categories: [], brands: [], tags: [] },
          patterns: { shoppingTimes: [], searchPatterns: [] }
        });
      }

      // Add new event
      userBehavior.events.push({
        type: eventData.type,
        product: eventData.productId,
        category: eventData.categoryId,
        brand: eventData.brandId,
        searchQuery: eventData.searchQuery,
        sessionId: eventData.sessionId,
        duration: eventData.duration,
        source: eventData.source,
        metadata: eventData.metadata
      });

      // Update session if exists
      const sessionIndex = userBehavior.sessions.findIndex(
        s => s.sessionId === eventData.sessionId
      );
      
      if (sessionIndex === -1) {
        userBehavior.sessions.push({
          sessionId: eventData.sessionId,
          startTime: new Date(),
          deviceType: eventData.deviceType,
          userAgent: eventData.userAgent,
          ipAddress: eventData.ipAddress,
          location: eventData.location,
          pageViews: 1
        });
      } else {
        userBehavior.sessions[sessionIndex].pageViews += 1;
        userBehavior.sessions[sessionIndex].totalDuration += eventData.duration || 0;
      }

      // Update preferences based on interaction
      await this.updateUserPreferences(userBehavior, eventData);

      await userBehavior.save();
      
      // Trigger real-time recommendation update for frequent users
      const totalEvents = userBehavior.events.length;
      if (totalEvents > 0 && totalEvents % 10 === 0) {
        this.generateRecommendationsAsync(userId);
      }

      return userBehavior;
    } catch (error) {
      console.error('Error tracking user behavior:', error);
      throw error;
    }
  }

  // Update user preferences based on behavior
  async updateUserPreferences(userBehavior, eventData) {
    const scoreWeights = {
      view: 1,
      click: 2,
      add_to_cart: 4,
      purchase: 8,
      like: 3,
      share: 5
    };

    const score = scoreWeights[eventData.type] || 1;

    // Update category preference
    if (eventData.categoryId) {
      const categoryIndex = userBehavior.preferences.categories.findIndex(
        c => c.category.toString() === eventData.categoryId.toString()
      );
      
      if (categoryIndex === -1) {
        userBehavior.preferences.categories.push({
          category: eventData.categoryId,
          score: score,
          lastInteraction: new Date()
        });
      } else {
        userBehavior.preferences.categories[categoryIndex].score += score;
        userBehavior.preferences.categories[categoryIndex].lastInteraction = new Date();
      }
    }

    // Update brand preference
    if (eventData.brandId) {
      const brandIndex = userBehavior.preferences.brands.findIndex(
        b => b.brand.toString() === eventData.brandId.toString()
      );
      
      if (brandIndex === -1) {
        userBehavior.preferences.brands.push({
          brand: eventData.brandId,
          score: score,
          lastInteraction: new Date()
        });
      } else {
        userBehavior.preferences.brands[brandIndex].score += score;
        userBehavior.preferences.brands[brandIndex].lastInteraction = new Date();
      }
    }

    // Sort preferences by score
    userBehavior.preferences.categories.sort((a, b) => b.score - a.score);
    userBehavior.preferences.brands.sort((a, b) => b.score - a.score);
  }

  // Content-based recommendations
  async contentBasedRecommendations(userId, limit = 10) {
    try {
      const userBehavior = await UserBehavior.findOne({ user: userId })
        .populate('preferences.categories.category')
        .populate('preferences.brands.brand');

      if (!userBehavior || userBehavior.events.length < this.config.minInteractions) {
        return await this.fallbackRecommendations(limit);
      }

      // Get user's recent product interactions
      const recentProducts = userBehavior.events
        .filter(e => e.product && e.type !== 'search')
        .slice(-20)
        .map(e => e.product);

      // Get preferred categories and brands
      const preferredCategories = userBehavior.preferences.categories
        .slice(0, 3)
        .map(c => c.category._id);
      
      const preferredBrands = userBehavior.preferences.brands
        .slice(0, 3)
        .map(b => b.brand._id);

      // Find similar products
      const recommendations = await Product.find({
        _id: { $nin: recentProducts }, // Exclude recently viewed
        $or: [
          { category: { $in: preferredCategories } },
          { brand: { $in: preferredBrands } }
        ],
        countInStock: { $gt: 0 }
      })
      .populate('category')
      .populate('brand')
      .sort({ rating: -1, numReviews: -1 })
      .limit(limit * 2); // Get more to allow for filtering

      // Score products based on user preferences
      const scoredProducts = recommendations.map(product => {
        let score = 0;
        
        // Category score
        const categoryPref = userBehavior.preferences.categories.find(
          c => c.category._id.toString() === product.category._id.toString()
        );
        if (categoryPref) {
          score += categoryPref.score * 0.4;
        }

        // Brand score
        const brandPref = userBehavior.preferences.brands.find(
          b => b.brand._id.toString() === product.brand._id.toString()
        );
        if (brandPref) {
          score += brandPref.score * 0.3;
        }

        // Rating score
        score += product.rating * 0.2;

        // Review count score
        score += Math.log(product.numReviews + 1) * 0.1;

        return {
          product: product._id,
          score: score / 100, // Normalize
          reason: this.generateReason('content', product, categoryPref, brandPref),
          algorithm: 'content_based'
        };
      });

      return scoredProducts
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    } catch (error) {
      console.error('Error in content-based recommendations:', error);
      return await this.fallbackRecommendations(limit);
    }
  }

  // Collaborative filtering recommendations
  async collaborativeFiltering(userId, limit = 10) {
    try {
      // Find users with similar behavior
      const userSimilarity = await UserSimilarity.findOne({ user: userId })
        .populate('similarUsers.user');

      if (!userSimilarity || userSimilarity.similarUsers.length === 0) {
        // Calculate similarities if not available
        await this.calculateUserSimilarities(userId);
        return await this.contentBasedRecommendations(userId, limit);
      }

      // Get top similar users
      const similarUsers = userSimilarity.similarUsers
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, 10)
        .map(su => su.user);

      // Get products liked by similar users but not by current user
      const userOrders = await Order.find({ 
        user: userId, 
        isPaid: true 
      }).distinct('orderItems.product');

      const similarUserProducts = await Order.find({
        user: { $in: similarUsers },
        isPaid: true,
        'orderItems.product': { $nin: userOrders }
      }).populate('orderItems.product');

      // Score products based on similar user preferences
      const productScores = {};
      
      similarUserProducts.forEach(order => {
        const userSim = userSimilarity.similarUsers.find(
          su => su.user.toString() === order.user.toString()
        );
        
        order.orderItems.forEach(item => {
          if (item.product) {
            const productId = item.product._id.toString();
            if (!productScores[productId]) {
              productScores[productId] = {
                product: item.product,
                score: 0,
                similarUsers: 0
              };
            }
            productScores[productId].score += userSim?.similarityScore || 0.5;
            productScores[productId].similarUsers += 1;
          }
        });
      });

      // Convert to array and sort
      const recommendations = Object.values(productScores)
        .map(ps => ({
          product: ps.product._id,
          score: ps.score / ps.similarUsers, // Average score
          reason: `Recommended by ${ps.similarUsers} similar users`,
          algorithm: 'collaborative'
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return recommendations;

    } catch (error) {
      console.error('Error in collaborative filtering:', error);
      return await this.contentBasedRecommendations(userId, limit);
    }
  }

  // Hybrid recommendations (combining content-based and collaborative)
  async hybridRecommendations(userId, limit = 10) {
    try {
      const contentWeight = 0.6;
      const collaborativeWeight = 0.4;

      // Get recommendations from both algorithms
      const contentRecs = await this.contentBasedRecommendations(userId, Math.ceil(limit * 1.5));
      const collaborativeRecs = await this.collaborativeFiltering(userId, Math.ceil(limit * 1.5));

      // Combine and score
      const combinedScores = {};

      // Add content-based scores
      contentRecs.forEach(rec => {
        combinedScores[rec.product] = {
          product: rec.product,
          score: rec.score * contentWeight,
          reasons: [rec.reason],
          algorithm: 'hybrid'
        };
      });

      // Add collaborative scores
      collaborativeRecs.forEach(rec => {
        if (combinedScores[rec.product]) {
          combinedScores[rec.product].score += rec.score * collaborativeWeight;
          combinedScores[rec.product].reasons.push(rec.reason);
        } else {
          combinedScores[rec.product] = {
            product: rec.product,
            score: rec.score * collaborativeWeight,
            reasons: [rec.reason],
            algorithm: 'hybrid'
          };
        }
      });

      // Sort and format
      const hybridRecommendations = Object.values(combinedScores)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(rec => ({
          product: rec.product,
          score: Math.min(rec.score, 1), // Ensure score doesn't exceed 1
          reason: rec.reasons.join(' & '),
          algorithm: rec.algorithm
        }));

      return hybridRecommendations;

    } catch (error) {
      console.error('Error in hybrid recommendations:', error);
      return await this.contentBasedRecommendations(userId, limit);
    }
  }

  // Trending products recommendations
  async trendingRecommendations(limit = 10) {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      // Get trending products based on recent orders and views
      const trendingProducts = await Order.aggregate([
        {
          $match: {
            isPaid: true,
            createdAt: { $gte: thirtyDaysAgo }
          }
        },
        { $unwind: '$orderItems' },
        {
          $group: {
            _id: '$orderItems.product',
            totalSold: { $sum: '$orderItems.qty' },
            totalOrders: { $sum: 1 },
            avgPrice: { $avg: '$orderItems.price' },
            recentSales: {
              $sum: {
                $cond: [
                  { $gte: ['$createdAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
                  '$orderItems.qty',
                  0
                ]
              }
            }
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $match: {
            'product.countInStock': { $gt: 0 }
          }
        },
        {
          $addFields: {
            trendingScore: {
              $add: [
                { $multiply: ['$recentSales', 0.5] },
                { $multiply: ['$totalSold', 0.3] },
                { $multiply: ['$product.rating', 0.2] }
              ]
            }
          }
        },
        { $sort: { trendingScore: -1 } },
        { $limit: limit }
      ]);

      return trendingProducts.map(tp => ({
        product: tp._id,
        score: Math.min(tp.trendingScore / 100, 1),
        reason: `Trending: ${tp.recentSales} recent sales`,
        algorithm: 'trending',
        trendingFactor: tp.recentSales > 10 ? 'High demand' : 'Fast selling'
      }));

    } catch (error) {
      console.error('Error in trending recommendations:', error);
      return [];
    }
  }

  // Frequently bought together
  async frequentlyBoughtTogether(productIds, limit = 5) {
    try {
      if (!productIds || productIds.length === 0) return [];

      const coOccurrences = await Order.aggregate([
        {
          $match: {
            isPaid: true,
            'orderItems.product': { $in: productIds.map(id => id) }
          }
        },
        {
          $unwind: '$orderItems'
        },
        {
          $match: {
            'orderItems.product': { $nin: productIds.map(id => id) }
          }
        },
        {
          $group: {
            _id: '$orderItems.product',
            count: { $sum: 1 },
            totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.qty'] } }
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $match: {
            'product.countInStock': { $gt: 0 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: limit }
      ]);

      return coOccurrences.map(co => ({
        product: co._id,
        score: Math.min(co.count / 10, 1),
        coOccurrenceScore: co.count,
        reason: `Often bought with your items (${co.count} times)`
      }));

    } catch (error) {
      console.error('Error in frequently bought together:', error);
      return [];
    }
  }

  // Generate personalized recommendations
  async generateRecommendations(userId, context = {}) {
    try {
      const startTime = Date.now();

      // Check for cached recommendations
      const cached = await Recommendation.findOne({
        user: userId,
        expiresAt: { $gt: new Date() }
      });

      if (cached && !context.forceRefresh) {
        return cached.recommendations;
      }

      // Generate new recommendations
      const recommendations = {
        forYou: await this.hybridRecommendations(userId, 15),
        basedOnViewed: await this.getViewBasedRecommendations(userId, 10),
        categoryBased: await this.getCategoryBasedRecommendations(userId, 10),
        trending: await this.trendingRecommendations(10),
        frequentlyBoughtTogether: [],
        cartBased: []
      };

      // Add cart-based recommendations if cart context provided
      if (context.cartItems && context.cartItems.length > 0) {
        recommendations.frequentlyBoughtTogether = await this.frequentlyBoughtTogether(
          context.cartItems, 8
        );
        recommendations.cartBased = await this.getCartBasedRecommendations(
          context.cartItems, 8
        );
      }

      // Save to cache
      const newRecommendation = new Recommendation({
        user: userId,
        recommendations,
        context: {
          timeOfDay: this.getTimeOfDay(),
          dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
          season: this.getSeason(),
          userSegment: context.userSegment || 'general'
        },
        performance: {
          generationTime: Date.now() - startTime,
          totalRecommendations: Object.values(recommendations).reduce(
            (sum, recs) => sum + (Array.isArray(recs) ? recs.length : 0), 0
          ),
          confidence: this.calculateConfidence(recommendations)
        }
      });

      await newRecommendation.save();

      // Clean up old recommendations
      await Recommendation.deleteMany({
        user: userId,
        _id: { $ne: newRecommendation._id }
      });

      return recommendations;

    } catch (error) {
      console.error('Error generating recommendations:', error);
      return await this.getFallbackRecommendations(userId);
    }
  }

  // Async recommendation generation for background updates
  async generateRecommendationsAsync(userId) {
    setImmediate(async () => {
      try {
        await this.generateRecommendations(userId, { forceRefresh: true });
      } catch (error) {
        console.error('Error in async recommendation generation:', error);
      }
    });
  }

  // Helper methods
  generateReason(type, product, categoryPref, brandPref) {
    if (type === 'content') {
      if (categoryPref && brandPref) {
        return `Based on your interest in ${product.category.name} and ${product.brand.name}`;
      } else if (categoryPref) {
        return `You seem to like ${product.category.name}`;
      } else if (brandPref) {
        return `You prefer ${product.brand.name} products`;
      }
      return `Popular in your interests`;
    }
    return 'Recommended for you';
  }

  async fallbackRecommendations(limit) {
    try {
      const products = await Product.find({ countInStock: { $gt: 0 } })
        .populate('category')
        .populate('brand')
        .sort({ rating: -1, numReviews: -1 })
        .limit(limit);

      return products.map((product, index) => ({
        product: product._id,
        score: (limit - index) / limit,
        reason: 'Popular product',
        algorithm: 'fallback'
      }));
    } catch (error) {
      console.error('Error in fallback recommendations:', error);
      return [];
    }
  }

  getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }

  getSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  calculateConfidence(recommendations) {
    const totalRecs = Object.values(recommendations).reduce(
      (sum, recs) => sum + (Array.isArray(recs) ? recs.length : 0), 0
    );
    return Math.min(totalRecs / 50, 1); // Higher confidence with more recommendations
  }

  // Calculate user similarities for collaborative filtering
  async calculateUserSimilarities(userId) {
    try {
      console.log(`Calculating user similarities for user: ${userId}`);
      
      // Get current user's behavior
      const currentUserBehavior = await UserBehavior.findOne({ user: userId })
        .populate('events.product')
        .populate('events.category')
        .populate('events.brand');

      if (!currentUserBehavior || currentUserBehavior.events.length < this.config.minInteractions) {
        console.log('Insufficient user behavior data for similarity calculation');
        return null;
      }

      // Get all other users with sufficient behavior data
      const otherUsers = await UserBehavior.find({
        user: { $ne: userId },
        'events.2': { $exists: true } // At least 3 events
      }).populate('events.product').populate('events.category').populate('events.brand');

      const similarities = [];

      for (const otherUser of otherUsers) {
        const similarity = this.calculateSimilarityScore(currentUserBehavior, otherUser);
        
        if (similarity.score > this.config.similarityThreshold) {
          similarities.push({
            user: otherUser.user,
            similarityScore: similarity.score,
            sharedProducts: similarity.sharedProducts,
            sharedCategories: similarity.sharedCategories,
            sharedBrands: similarity.sharedBrands
          });
        }
      }

      // Sort by similarity score and keep top 50
      similarities.sort((a, b) => b.similarityScore - a.similarityScore);
      const topSimilarities = similarities.slice(0, 50);

      // Save or update user similarity
      await UserSimilarity.findOneAndUpdate(
        { user: userId },
        {
          user: userId,
          similarUsers: topSimilarities,
          lastCalculated: new Date()
        },
        { upsert: true, new: true }
      );

      console.log(`Calculated ${topSimilarities.length} similar users for user: ${userId}`);
      return topSimilarities;

    } catch (error) {
      console.error('Error calculating user similarities:', error);
      throw error;
    }
  }

  // Calculate similarity score between two users
  calculateSimilarityScore(user1Behavior, user2Behavior) {
    try {
      // Extract user preferences and interactions
      const user1Products = new Set(user1Behavior.events.map(e => e.product?.toString()).filter(Boolean));
      const user2Products = new Set(user2Behavior.events.map(e => e.product?.toString()).filter(Boolean));
      
      const user1Categories = new Set(user1Behavior.events.map(e => e.category?.toString()).filter(Boolean));
      const user2Categories = new Set(user2Behavior.events.map(e => e.category?.toString()).filter(Boolean));
      
      const user1Brands = new Set(user1Behavior.events.map(e => e.brand?.toString()).filter(Boolean));
      const user2Brands = new Set(user2Behavior.events.map(e => e.brand?.toString()).filter(Boolean));

      // Calculate Jaccard similarity for products
      const sharedProducts = [...user1Products].filter(p => user2Products.has(p)).length;
      const totalProducts = new Set([...user1Products, ...user2Products]).size;
      const productSimilarity = totalProducts > 0 ? sharedProducts / totalProducts : 0;

      // Calculate Jaccard similarity for categories
      const sharedCategories = [...user1Categories].filter(c => user2Categories.has(c)).length;
      const totalCategories = new Set([...user1Categories, ...user2Categories]).size;
      const categorySimilarity = totalCategories > 0 ? sharedCategories / totalCategories : 0;

      // Calculate Jaccard similarity for brands
      const sharedBrands = [...user1Brands].filter(b => user2Brands.has(b)).length;
      const totalBrands = new Set([...user1Brands, ...user2Brands]).size;
      const brandSimilarity = totalBrands > 0 ? sharedBrands / totalBrands : 0;

      // Weighted similarity score
      const similarityScore = (
        productSimilarity * 0.5 +
        categorySimilarity * 0.3 +
        brandSimilarity * 0.2
      );

      return {
        score: Math.min(similarityScore, 1),
        sharedProducts,
        sharedCategories,
        sharedBrands
      };

    } catch (error) {
      console.error('Error calculating similarity score:', error);
      return { score: 0, sharedProducts: 0, sharedCategories: 0, sharedBrands: 0 };
    }
  }

  // Get recommendations based on recently viewed products
  async getViewBasedRecommendations(userId, limit = 10) {
    try {
      const userBehavior = await UserBehavior.findOne({ user: userId })
        .populate('events.product');

      if (!userBehavior || userBehavior.events.length === 0) {
        return await this.fallbackRecommendations(limit);
      }

      // Get recently viewed products (last 10 view events)
      const recentViews = userBehavior.events
        .filter(e => ['view', 'click', 'page_view'].includes(e.type) && e.product)
        .slice(-10)
        .map(e => e.product);

      if (recentViews.length === 0) {
        return await this.fallbackRecommendations(limit);
      }

      const recommendations = [];
      const seenProducts = new Set();

      // For each recently viewed product, find similar products
      for (const viewedProduct of recentViews) {
        try {
          // Find products in the same category
          const similarProducts = await Product.find({
            _id: { $ne: viewedProduct._id },
            category: viewedProduct.category,
            countInStock: { $gt: 0 }
          })
          .populate('category')
          .populate('brand')
          .sort({ rating: -1, numReviews: -1 })
          .limit(3);

          similarProducts.forEach(product => {
            if (!seenProducts.has(product._id.toString())) {
              seenProducts.add(product._id.toString());
              
              // Calculate similarity score based on category, brand, price range
              let score = 0.5; // Base score
              
              // Same category bonus
              if (product.category._id.toString() === viewedProduct.category.toString()) {
                score += 0.3;
              }
              
              // Same brand bonus
              if (product.brand && viewedProduct.brand && 
                  product.brand._id.toString() === viewedProduct.brand.toString()) {
                score += 0.2;
              }
              
              // Price similarity bonus (within 50% range)
              const priceDiff = Math.abs(product.price - viewedProduct.price) / viewedProduct.price;
              if (priceDiff <= 0.5) {
                score += 0.1 * (1 - priceDiff);
              }
              
              // Rating bonus
              score += (product.rating / 5) * 0.1;

              recommendations.push({
                product: product._id,
                score: Math.min(score, 1),
                baseProduct: viewedProduct._id,
                reason: `Similar to ${viewedProduct.name || 'recently viewed item'}`,
                algorithm: 'view_based'
              });
            }
          });
        } catch (error) {
          console.error(`Error finding similar products for ${viewedProduct._id}:`, error);
        }
      }

      // Sort by score and return top recommendations
      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    } catch (error) {
      console.error('Error in view-based recommendations:', error);
      return await this.fallbackRecommendations(limit);
    }
  }

  // Get category-based recommendations
  async getCategoryBasedRecommendations(userId, limit = 10) {
    try {
      const userBehavior = await UserBehavior.findOne({ user: userId })
        .populate('preferences.categories.category');

      if (!userBehavior || userBehavior.preferences.categories.length === 0) {
        return await this.fallbackRecommendations(limit);
      }

      // Get user's top 3 preferred categories
      const topCategories = userBehavior.preferences.categories
        .slice(0, 3)
        .map(c => ({ category: c.category._id, score: c.score }));

      const recommendations = [];
      const seenProducts = new Set(userBehavior.events.map(e => e.product?.toString()).filter(Boolean));

      for (const categoryPref of topCategories) {
        const categoryProducts = await Product.find({
          category: categoryPref.category,
          _id: { $nin: Array.from(seenProducts) },
          countInStock: { $gt: 0 }
        })
        .populate('category')
        .populate('brand')
        .sort({ rating: -1, numReviews: -1 })
        .limit(Math.ceil(limit / topCategories.length));

        categoryProducts.forEach(product => {
          if (!seenProducts.has(product._id.toString())) {
            seenProducts.add(product._id.toString());
            
            // Score based on category preference and product quality
            const categoryScore = categoryPref.score / 100; // Normalize preference score
            const qualityScore = (product.rating / 5) * 0.3 + (Math.log(product.numReviews + 1) / 10) * 0.2;
            const finalScore = Math.min(categoryScore * 0.7 + qualityScore, 1);

            recommendations.push({
              product: product._id,
              score: finalScore,
              category: categoryPref.category,
              reason: `Top pick in ${product.category.name}`,
              algorithm: 'category_based'
            });
          }
        });
      }

      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    } catch (error) {
      console.error('Error in category-based recommendations:', error);
      return await this.fallbackRecommendations(limit);
    }
  }

  // Get cart-based recommendations
  async getCartBasedRecommendations(cartItems, limit = 8) {
    try {
      if (!cartItems || cartItems.length === 0) {
        return [];
      }

      const cartProductIds = cartItems.map(item => item.toString());
      const recommendations = [];
      const seenProducts = new Set(cartProductIds);

      // Get cart products details
      const cartProducts = await Product.find({
        _id: { $in: cartProductIds }
      }).populate('category').populate('brand');

      // Find complementary products
      for (const cartProduct of cartProducts) {
        // Find products often bought with this item
        const complementaryProducts = await this.frequentlyBoughtTogether([cartProduct._id], 3);
        
        complementaryProducts.forEach(rec => {
          if (!seenProducts.has(rec.product.toString())) {
            seenProducts.add(rec.product.toString());
            recommendations.push({
              product: rec.product,
              score: rec.score,
              complementaryTo: [cartProduct._id],
              reason: `Great with ${cartProduct.name || 'your cart items'}`,
              algorithm: 'cart_based'
            });
          }
        });

        // Find products in same category but different subcategory/type
        const categoryProducts = await Product.find({
          category: cartProduct.category,
          _id: { $nin: Array.from(seenProducts) },
          countInStock: { $gt: 0 }
        })
        .populate('category')
        .sort({ rating: -1 })
        .limit(2);

        categoryProducts.forEach(product => {
          if (!seenProducts.has(product._id.toString())) {
            seenProducts.add(product._id.toString());
            recommendations.push({
              product: product._id,
              score: 0.6 + (product.rating / 5) * 0.3,
              complementaryTo: [cartProduct._id],
              reason: `Popular in ${product.category.name}`,
              algorithm: 'cart_based'
            });
          }
        });
      }

      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    } catch (error) {
      console.error('Error in cart-based recommendations:', error);
      return [];
    }
  }

  // Get fallback recommendations for users with insufficient data
  async getFallbackRecommendations(userId) {
    try {
      return {
        forYou: await this.fallbackRecommendations(10),
        basedOnViewed: [],
        categoryBased: await this.trendingRecommendations(8),
        trending: await this.trendingRecommendations(10),
        frequentlyBoughtTogether: [],
        cartBased: []
      };
    } catch (error) {
      console.error('Error in fallback recommendations:', error);
      return {
        forYou: [],
        basedOnViewed: [],
        categoryBased: [],
        trending: [],
        frequentlyBoughtTogether: [],
        cartBased: []
      };
    }
  }
}

export default new RecommendationService();