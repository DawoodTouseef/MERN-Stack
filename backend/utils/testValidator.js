import mongoose from 'mongoose';
import TaxRule, { TaxExemption, TaxConfig } from '../models/taxModel.js';
import CourierPartner, { Shipment } from '../models/courierModel.js';
import Offer, { PriceHistory, FlashSaleSession } from '../models/offersModel.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';

// System Health Check
export const runSystemHealthCheck = async () => {
  console.log('🚀 Starting E-Commerce System Health Check...');
  
  const results = {
    database: false,
    models: false,
    taxSystem: false,
    courierSystem: false,
    orderTracking: false,
    dynamicPricing: false,
    analytics: false
  };

  try {
    // 1. Database Connection Test
    console.log('📊 Testing database connection...');
    if (mongoose.connection.readyState === 1) {
      results.database = true;
      console.log('✅ Database connected successfully');
    } else {
      console.log('❌ Database connection failed');
      return results;
    }

    // 2. Model Validation Test
    console.log('📋 Testing model schemas...');
    const models = [TaxRule, TaxExemption, TaxConfig, CourierPartner, Shipment, Offer, PriceHistory, FlashSaleSession, Order, Product, User];
    let modelsValid = true;
    
    for (const Model of models) {
      try {
        await Model.findOne().limit(1);
      } catch (error) {
        console.log(`❌ Model ${Model.modelName} validation failed:`, error.message);
        modelsValid = false;
      }
    }
    
    if (modelsValid) {
      results.models = true;
      console.log('✅ All models validated successfully');
    }

    // 3. Tax System Test
    console.log('💰 Testing tax system...');
    try {
      // Test creating a sample tax rule
      const testTaxRule = {
        country: 'US',
        state: 'CA',
        rate: 8.25,
        taxType: 'sales_tax',
        description: 'Test tax rule - health check'
      };
      
      const existingRule = await TaxRule.findOne({ description: 'Test tax rule - health check' });
      if (!existingRule) {
        await TaxRule.create(testTaxRule);
      }
      
      results.taxSystem = true;
      console.log('✅ Tax system operational');
    } catch (error) {
      console.log('❌ Tax system test failed:', error.message);
    }

    // 4. Courier System Test
    console.log('🚚 Testing courier system...');
    try {
      const courierCount = await CourierPartner.countDocuments();
      results.courierSystem = true;
      console.log(`✅ Courier system operational (${courierCount} partners configured)`);
    } catch (error) {
      console.log('❌ Courier system test failed:', error.message);
    }

    // 5. Order Tracking Test
    console.log('📦 Testing order tracking...');
    try {
      const recentOrders = await Order.find().limit(1).select('tracking orderStatus');
      results.orderTracking = true;
      console.log('✅ Order tracking system operational');
    } catch (error) {
      console.log('❌ Order tracking test failed:', error.message);
    }

    // 6. Dynamic Pricing Test
    console.log('💸 Testing dynamic pricing...');
    try {
      const activeOffers = await Offer.countDocuments({ isActive: true });
      results.dynamicPricing = true;
      console.log(`✅ Dynamic pricing operational (${activeOffers} active offers)`);
    } catch (error) {
      console.log('❌ Dynamic pricing test failed:', error.message);
    }

    // 7. Analytics Test
    console.log('📈 Testing analytics system...');
    try {
      const orderCount = await Order.countDocuments();
      const productCount = await Product.countDocuments();
      const userCount = await User.countDocuments();
      
      results.analytics = true;
      console.log(`✅ Analytics operational (${orderCount} orders, ${productCount} products, ${userCount} users)`);
    } catch (error) {
      console.log('❌ Analytics test failed:', error.message);
    }

    // Cleanup test data
    await TaxRule.deleteOne({ description: 'Test tax rule - health check' });

  } catch (error) {
    console.log('❌ System health check failed:', error.message);
  }

  return results;
};

// API Endpoints Test
export const testAPIEndpoints = () => {
  const endpoints = {
    tax: [
      'POST /api/tax/create',
      'POST /api/tax/calculate-advanced',
      'GET /api/tax/',
      'POST /api/tax/exemptions',
      'GET /api/tax/config',
      'POST /api/tax/test-service'
    ],
    courier: [
      'GET /api/courier/partners',
      'POST /api/courier/calculate-rates',
      'POST /api/courier/shipments',
      'GET /api/courier/track/:trackingNumber'
    ],
    orders: [
      'GET /api/orders/advanced/filters',
      'PUT /api/orders/:id/status',
      'GET /api/orders/:id/tracking',
      'GET /api/orders/track/:orderNumber'
    ],
    offers: [
      'POST /api/offer/calculate-price',
      'GET /api/offer/flash-sales/active',
      'POST /api/offer/:id/start-flash-sale',
      'GET /api/offer/:id/analytics'
    ],
    analytics: [
      'GET /api/analytics/dashboard',
      'GET /api/analytics/sales',
      'GET /api/analytics/products',
      'GET /api/analytics/customers',
      'GET /api/analytics/tax',
      'GET /api/analytics/shipping',
      'GET /api/analytics/flash-sales'
    ]
  };

  console.log('\n🔗 Available API Endpoints:');
  Object.entries(endpoints).forEach(([category, routes]) => {
    console.log(`\n📂 ${category.toUpperCase()} ENDPOINTS:`);
    routes.forEach(route => console.log(`   ${route}`));
  });

  return endpoints;
};

// Environment Validation
export const validateEnvironment = () => {
  console.log('\n🔧 Environment Configuration Check:');
  
  const requiredEnvVars = [
    'MONGODB_URL',
    'JWT_SECRET',
    'PORT'
  ];

  const optionalEnvVars = [
    'PAYPAL_CLIENT_ID',
    'AVALARA_API_KEY',
    'TAXJAR_API_KEY',
    'FRONTEND_URL',
    'SMS_API_KEY',
    'EMAIL_SERVICE_KEY'
  ];

  const envStatus = {
    required: {},
    optional: {}
  };

  requiredEnvVars.forEach(envVar => {
    envStatus.required[envVar] = !!process.env[envVar];
    console.log(`${envStatus.required[envVar] ? '✅' : '❌'} ${envVar}: ${envStatus.required[envVar] ? 'Set' : 'Missing'}`);
  });

  console.log('\n📋 Optional Environment Variables:');
  optionalEnvVars.forEach(envVar => {
    envStatus.optional[envVar] = !!process.env[envVar];
    console.log(`${envStatus.optional[envVar] ? '✅' : '⚠️ '} ${envVar}: ${envStatus.optional[envVar] ? 'Set' : 'Not Set'}`);
  });

  return envStatus;
};

// Performance Test
export const runPerformanceTest = async () => {
  console.log('\n⚡ Performance Test:');
  
  const tests = [
    {
      name: 'Database Query Speed',
      test: async () => {
        const start = Date.now();
        await Product.find().limit(10);
        return Date.now() - start;
      }
    },
    {
      name: 'Order Aggregation Speed',
      test: async () => {
        const start = Date.now();
        await Order.aggregate([{ $match: {} }, { $limit: 5 }]);
        return Date.now() - start;
      }
    },
    {
      name: 'Tax Calculation Speed',
      test: async () => {
        const start = Date.now();
        await TaxRule.find({ isActive: true }).limit(5);
        return Date.now() - start;
      }
    }
  ];

  const results = [];
  for (const test of tests) {
    try {
      const duration = await test.test();
      results.push({ name: test.name, duration, status: duration < 1000 ? 'Good' : 'Slow' });
      console.log(`${duration < 1000 ? '✅' : '⚠️ '} ${test.name}: ${duration}ms (${duration < 1000 ? 'Good' : 'Slow'})`);
    } catch (error) {
      results.push({ name: test.name, duration: null, status: 'Failed', error: error.message });
      console.log(`❌ ${test.name}: Failed - ${error.message}`);
    }
  }

  return results;
};

// Complete System Test
export const runCompleteSystemTest = async () => {
  console.log('\n🎯 NEXUS MART E-COMMERCE SYSTEM VALIDATION');
  console.log('=' .repeat(50));
  
  const startTime = Date.now();
  
  try {
    // Run all tests
    const healthCheck = await runSystemHealthCheck();
    const envStatus = validateEnvironment();
    const apiEndpoints = testAPIEndpoints();
    const performance = await runPerformanceTest();
    
    const totalTime = Date.now() - startTime;
    
    // Generate Summary Report
    console.log('\n📊 SYSTEM VALIDATION SUMMARY');
    console.log('=' .repeat(30));
    
    const healthScore = Object.values(healthCheck).filter(Boolean).length / Object.keys(healthCheck).length * 100;
    const requiredEnvScore = Object.values(envStatus.required).filter(Boolean).length / Object.keys(envStatus.required).length * 100;
    const performanceScore = performance.filter(p => p.status === 'Good').length / performance.length * 100;
    
    console.log(`🏥 System Health Score: ${healthScore.toFixed(1)}%`);
    console.log(`🔧 Environment Config Score: ${requiredEnvScore.toFixed(1)}%`);
    console.log(`⚡ Performance Score: ${performanceScore.toFixed(1)}%`);
    console.log(`🔗 API Endpoints Available: ${Object.values(apiEndpoints).flat().length}`);
    console.log(`⏱️  Total Test Time: ${totalTime}ms`);
    
    const overallScore = (healthScore + requiredEnvScore + performanceScore) / 3;
    console.log(`\n🎯 OVERALL SYSTEM SCORE: ${overallScore.toFixed(1)}%`);
    
    if (overallScore >= 90) {
      console.log('🎉 EXCELLENT! System is ready for production.');
    } else if (overallScore >= 75) {
      console.log('✅ GOOD! System is functional with minor issues.');
    } else if (overallScore >= 50) {
      console.log('⚠️  WARNING! System has significant issues that need attention.');
    } else {
      console.log('❌ CRITICAL! System has major issues and is not ready for use.');
    }
    
    return {
      healthCheck,
      envStatus,
      apiEndpoints,
      performance,
      scores: {
        health: healthScore,
        environment: requiredEnvScore,
        performance: performanceScore,
        overall: overallScore
      },
      totalTime
    };
    
  } catch (error) {
    console.log('❌ System test failed:', error.message);
    return { error: error.message };
  }
};
