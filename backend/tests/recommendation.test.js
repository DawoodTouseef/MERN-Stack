const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const UserBehavior = require('../models/recommendationModel');
const RecommendationService = require('../services/recommendationService');

// Test database setup
const MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/nexus-mart-test';

describe('Recommendation System Backend Tests', () => {
  let authToken;
  let testUser;
  let testProducts;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(MONGODB_URI);
    
    // Clean up existing test data
    await User.deleteMany({ email: { $regex: /test.*@test\.com/ } });
    await Product.deleteMany({ name: { $regex: /Test Product/ } });
    await UserBehavior.deleteMany({});
  });

  afterAll(async () => {
    // Clean up and close connection
    await User.deleteMany({ email: { $regex: /test.*@test\.com/ } });
    await Product.deleteMany({ name: { $regex: /Test Product/ } });
    await UserBehavior.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Create test user
    testUser = await User.create({
      username: 'testuser',
      email: 'testuser@test.com',
      password: 'testpassword123',
      role: 'user'
    });

    // Create test products
    testProducts = await Product.insertMany([
      {
        name: 'Test Product 1',
        description: 'Test description 1',
        price: 99.99,
        category: new mongoose.Types.ObjectId(),
        brand: 'Test Brand',
        countInStock: 10,
        seller: testUser._id
      },
      {
        name: 'Test Product 2',
        description: 'Test description 2',
        price: 149.99,
        category: new mongoose.Types.ObjectId(),
        brand: 'Test Brand',
        countInStock: 5,
        seller: testUser._id
      },
      {
        name: 'Test Product 3',
        description: 'Test description 3',
        price: 199.99,
        category: new mongoose.Types.ObjectId(),
        brand: 'Another Brand',
        countInStock: 8,
        seller: testUser._id
      }
    ]);

    // Login and get auth token
    const loginResponse = await request(app)
      .post('/api/users/auth')
      .send({
        email: 'testuser@test.com',
        password: 'testpassword123'
      });

    authToken = loginResponse.body.token;
  });

  afterEach(async () => {
    // Clean up test data after each test
    await User.findByIdAndDelete(testUser._id);
    await Product.deleteMany({ _id: { $in: testProducts.map(p => p._id) } });
    await UserBehavior.deleteMany({ user: testUser._id });
  });

  describe('Recommendation API Endpoints', () => {
    describe('POST /api/recommendations/track-behavior', () => {
      test('should track user behavior successfully', async () => {
        const behaviorData = {
          type: 'product_view',
          productId: testProducts[0]._id,
          metadata: {
            timeSpent: 30,
            source: 'product_page'
          }
        };

        const response = await request(app)
          .post('/api/recommendations/track-behavior')
          .set('Authorization', `Bearer ${authToken}`)
          .send(behaviorData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('Behavior tracked');

        // Verify behavior was saved to database
        const userBehavior = await UserBehavior.findOne({ user: testUser._id });
        expect(userBehavior).toBeTruthy();
        expect(userBehavior.events).toHaveLength(1);
        expect(userBehavior.events[0].type).toBe('product_view');
        expect(userBehavior.events[0].product.toString()).toBe(testProducts[0]._id.toString());
      });

      test('should require authentication', async () => {
        const behaviorData = {
          type: 'product_view',
          productId: testProducts[0]._id
        };

        await request(app)
          .post('/api/recommendations/track-behavior')
          .send(behaviorData)
          .expect(401);
      });

      test('should validate required fields', async () => {
        const response = await request(app)
          .post('/api/recommendations/track-behavior')
          .set('Authorization', `Bearer ${authToken}`)
          .send({})
          .expect(400);

        expect(response.body.message).toContain('required');
      });

      test('should handle invalid product ID', async () => {
        const behaviorData = {
          type: 'product_view',
          productId: new mongoose.Types.ObjectId()
        };

        const response = await request(app)
          .post('/api/recommendations/track-behavior')
          .set('Authorization', `Bearer ${authToken}`)
          .send(behaviorData)
          .expect(404);

        expect(response.body.message).toContain('Product not found');
      });
    });

    describe('GET /api/recommendations/personalized', () => {
      beforeEach(async () => {
        // Create some user behavior data
        await UserBehavior.create({
          user: testUser._id,
          events: [
            {
              type: 'product_view',
              product: testProducts[0]._id,
              category: testProducts[0].category,
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
            },
            {
              type: 'add_to_cart',
              product: testProducts[1]._id,
              category: testProducts[1].category,
              timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
            }
          ]
        });
      });

      test('should return personalized recommendations', async () => {
        const response = await request(app)
          .get('/api/recommendations/personalized')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.recommendations)).toBe(true);
        expect(response.body.recommendations.length).toBeGreaterThan(0);
        
        // Should include recommendation source and score
        response.body.recommendations.forEach(rec => {
          expect(rec).toHaveProperty('product');
          expect(rec).toHaveProperty('score');
          expect(rec).toHaveProperty('source');
          expect(rec.score).toBeGreaterThan(0);
        });
      });

      test('should support pagination', async () => {
        const response = await request(app)
          .get('/api/recommendations/personalized?page=1&limit=2')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.recommendations.length).toBeLessThanOrEqual(2);
        expect(response.body.pagination).toBeDefined();
        expect(response.body.pagination.page).toBe(1);
        expect(response.body.pagination.limit).toBe(2);
      });

      test('should handle different recommendation types', async () => {
        const response = await request(app)
          .get('/api/recommendations/personalized?type=content_based')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        // All recommendations should be content-based
        response.body.recommendations.forEach(rec => {
          expect(['content_based', 'hybrid']).toContain(rec.source);
        });
      });

      test('should require authentication', async () => {
        await request(app)
          .get('/api/recommendations/personalized')
          .expect(401);
      });
    });

    describe('GET /api/recommendations/similar/:productId', () => {
      test('should return similar products', async () => {
        const response = await request(app)
          .get(`/api/recommendations/similar/${testProducts[0]._id}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.similarProducts)).toBe(true);
        
        // Should not include the original product
        response.body.similarProducts.forEach(product => {
          expect(product._id).not.toBe(testProducts[0]._id.toString());
        });
      });

      test('should handle invalid product ID', async () => {
        const invalidId = new mongoose.Types.ObjectId();
        const response = await request(app)
          .get(`/api/recommendations/similar/${invalidId}`)
          .expect(404);

        expect(response.body.message).toContain('Product not found');
      });

      test('should limit results correctly', async () => {
        const response = await request(app)
          .get(`/api/recommendations/similar/${testProducts[0]._id}?limit=1`)
          .expect(200);

        expect(response.body.similarProducts.length).toBeLessThanOrEqual(1);
      });
    });

    describe('GET /api/recommendations/trending', () => {
      test('should return trending products', async () => {
        const response = await request(app)
          .get('/api/recommendations/trending')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.trendingProducts)).toBe(true);
        
        // Should include popularity metrics
        response.body.trendingProducts.forEach(product => {
          expect(product).toHaveProperty('popularityScore');
          expect(product.popularityScore).toBeGreaterThanOrEqual(0);
        });
      });

      test('should support time period filtering', async () => {
        const response = await request(app)
          .get('/api/recommendations/trending?period=week')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.period).toBe('week');
      });
    });
  });

  describe('RecommendationService Unit Tests', () => {
    let recommendationService;

    beforeEach(() => {
      recommendationService = new RecommendationService();
    });

    describe('generatePersonalizedRecommendations', () => {
      test('should generate recommendations for user with behavior history', async () => {
        // Create user behavior
        await UserBehavior.create({
          user: testUser._id,
          events: [
            {
              type: 'product_view',
              product: testProducts[0]._id,
              category: testProducts[0].category,
              timestamp: new Date()
            }
          ]
        });

        const recommendations = await recommendationService.generatePersonalizedRecommendations(
          testUser._id,
          { limit: 10 }
        );

        expect(Array.isArray(recommendations)).toBe(true);
        expect(recommendations.length).toBeGreaterThan(0);
        
        recommendations.forEach(rec => {
          expect(rec).toHaveProperty('product');
          expect(rec).toHaveProperty('score');
          expect(rec).toHaveProperty('source');
          expect(['content_based', 'collaborative', 'trending', 'hybrid']).toContain(rec.source);
        });
      });

      test('should handle new users with no behavior history', async () => {
        const newUser = await User.create({
          username: 'newuser',
          email: 'newuser@test.com',
          password: 'testpassword123',
          role: 'user'
        });

        const recommendations = await recommendationService.generatePersonalizedRecommendations(
          newUser._id,
          { limit: 5 }
        );

        expect(Array.isArray(recommendations)).toBe(true);
        expect(recommendations.length).toBeGreaterThan(0);
        
        // For new users, should primarily use trending recommendations
        const trendingCount = recommendations.filter(rec => rec.source === 'trending').length;
        expect(trendingCount).toBeGreaterThan(0);

        await User.findByIdAndDelete(newUser._id);
      });
    });

    describe('calculateSimilarProducts', () => {
      test('should find similar products based on content', async () => {
        const similarProducts = await recommendationService.calculateSimilarProducts(
          testProducts[0]._id,
          { limit: 5 }
        );

        expect(Array.isArray(similarProducts)).toBe(true);
        similarProducts.forEach(product => {
          expect(product._id.toString()).not.toBe(testProducts[0]._id.toString());
        });
      });

      test('should handle product with no similar items', async () => {
        // Create a unique product
        const uniqueProduct = await Product.create({
          name: 'Unique Product',
          description: 'Very unique description with special keywords',
          price: 999.99,
          category: new mongoose.Types.ObjectId(),
          brand: 'Unique Brand',
          countInStock: 1,
          seller: testUser._id
        });

        const similarProducts = await recommendationService.calculateSimilarProducts(
          uniqueProduct._id,
          { limit: 5 }
        );

        expect(Array.isArray(similarProducts)).toBe(true);
        // Should still return some products, even if not very similar

        await Product.findByIdAndDelete(uniqueProduct._id);
      });
    });

    describe('trackUserBehavior', () => {
      test('should create new behavior record for new user', async () => {
        await recommendationService.trackUserBehavior(testUser._id, {
          type: 'product_view',
          productId: testProducts[0]._id,
          metadata: { source: 'homepage' }
        });

        const behavior = await UserBehavior.findOne({ user: testUser._id });
        expect(behavior).toBeTruthy();
        expect(behavior.events).toHaveLength(1);
        expect(behavior.events[0].type).toBe('product_view');
      });

      test('should append to existing behavior record', async () => {
        // Create initial behavior
        await UserBehavior.create({
          user: testUser._id,
          events: [{
            type: 'product_view',
            product: testProducts[0]._id,
            category: testProducts[0].category,
            timestamp: new Date()
          }]
        });

        // Add new behavior
        await recommendationService.trackUserBehavior(testUser._id, {
          type: 'add_to_cart',
          productId: testProducts[1]._id,
          metadata: { quantity: 2 }
        });

        const behavior = await UserBehavior.findOne({ user: testUser._id });
        expect(behavior.events).toHaveLength(2);
        expect(behavior.events[1].type).toBe('add_to_cart');
      });

      test('should handle invalid behavior data', async () => {
        await expect(
          recommendationService.trackUserBehavior(testUser._id, {
            type: 'invalid_type',
            productId: testProducts[0]._id
          })
        ).rejects.toThrow();
      });
    });

    describe('calculateUserSimilarities', () => {
      test('should calculate similarities between users', async () => {
        // Create another user with similar behavior
        const user2 = await User.create({
          username: 'testuser2',
          email: 'testuser2@test.com',
          password: 'testpassword123',
          role: 'user'
        });

        // Create behaviors for both users
        await UserBehavior.insertMany([
          {
            user: testUser._id,
            events: [{
              type: 'product_view',
              product: testProducts[0]._id,
              category: testProducts[0].category,
              timestamp: new Date()
            }]
          },
          {
            user: user2._id,
            events: [{
              type: 'product_view',
              product: testProducts[0]._id,
              category: testProducts[0].category,
              timestamp: new Date()
            }]
          }
        ]);

        const similarities = await recommendationService.calculateUserSimilarities(testUser._id);
        expect(Array.isArray(similarities)).toBe(true);

        if (similarities.length > 0) {
          similarities.forEach(sim => {
            expect(sim).toHaveProperty('user');
            expect(sim).toHaveProperty('similarity');
            expect(sim.similarity).toBeGreaterThanOrEqual(0);
            expect(sim.similarity).toBeLessThanOrEqual(1);
          });
        }

        await User.findByIdAndDelete(user2._id);
      });
    });
  });

  describe('Performance Tests', () => {
    test('should handle large number of products efficiently', async () => {
      const startTime = Date.now();
      
      const recommendations = await recommendationService.generatePersonalizedRecommendations(
        testUser._id,
        { limit: 50 }
      );
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(recommendations.length).toBeGreaterThan(0);
    }, 10000);

    test('should handle concurrent requests', async () => {
      const promises = Array.from({ length: 10 }, () =>
        recommendationService.generatePersonalizedRecommendations(testUser._id, { limit: 10 })
      );

      const results = await Promise.all(promises);
      
      results.forEach(recommendations => {
        expect(Array.isArray(recommendations)).toBe(true);
        expect(recommendations.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle database connection errors gracefully', async () => {
      // Temporarily close the connection
      await mongoose.connection.close();

      await expect(
        recommendationService.generatePersonalizedRecommendations(testUser._id)
      ).rejects.toThrow();

      // Reconnect for other tests
      await mongoose.connect(MONGODB_URI);
    });

    test('should handle invalid user ID', async () => {
      const invalidUserId = new mongoose.Types.ObjectId();
      
      const recommendations = await recommendationService.generatePersonalizedRecommendations(
        invalidUserId,
        { limit: 10 }
      );

      expect(Array.isArray(recommendations)).toBe(true);
      // Should return trending products for invalid users
    });

    test('should handle malformed behavior data', async () => {
      await expect(
        recommendationService.trackUserBehavior(testUser._id, {
          type: null,
          productId: 'invalid-id'
        })
      ).rejects.toThrow();
    });
  });
});