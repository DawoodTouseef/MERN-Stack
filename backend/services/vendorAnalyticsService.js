import Vendor from '../models/vendorModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import mongoose from 'mongoose';

class VendorAnalyticsService {
  // Get comprehensive vendor performance metrics
  static async getVendorPerformance(vendorId, options = {}) {
    try {
      const { startDate, endDate, period = '30d' } = options;
      
      // Calculate date range if not provided
      const end = endDate ? new Date(endDate) : new Date();
      const start = startDate ? new Date(startDate) : new Date(end.getTime() - (parseInt(period) * 24 * 60 * 60 * 1000));
      
      // Validate dates
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('Invalid date parameters');
      }
      
      // Get vendor products
      const vendorProducts = await Product.find({ vendor: vendorId });
      const productIds = vendorProducts.map(p => p._id);
      
      if (productIds.length === 0) {
        return this.getEmptyVendorMetrics();
      }
      
      // Get sales data
      const salesData = await this.getSalesData(productIds, start, end);
      
      // Get product performance
      const productPerformance = await this.getProductPerformance(productIds);
      
      // Get customer insights
      const customerInsights = await this.getCustomerInsights(productIds, start, end);
      
      // Get inventory status
      const inventoryStatus = await this.getInventoryStatus(vendorProducts);
      
      return {
        sales: salesData,
        products: productPerformance,
        customers: customerInsights,
        inventory: inventoryStatus,
        period: { start, end }
      };
    } catch (error) {
      console.error('VendorAnalyticsService.getVendorPerformance error:', error);
      // Return empty metrics instead of throwing error
      return this.getEmptyVendorMetrics();
    }
  }
  
  // Get sales data for vendor products
  static async getSalesData(productIds, startDate, endDate) {
    try {
      // Validate input parameters
      if (!productIds || productIds.length === 0) {
        return {
          total: { totalRevenue: 0, totalOrders: 0, totalQuantity: 0, averageOrderValue: 0 },
          daily: [],
          growth: { revenueGrowth: 0, orderGrowth: 0 }
        };
      }
      
      const matchStage = {
        'orderItems.product': { $in: productIds },
        isPaid: true,
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      };
      
      const salesAggregation = await Order.aggregate([
        { $match: matchStage },
        {
          $unwind: '$orderItems'
        },
        {
          $match: {
            'orderItems.product': { $in: productIds }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.qty'] } },
            totalOrders: { $sum: 1 },
            totalQuantity: { $sum: '$orderItems.qty' },
            averageOrderValue: { $avg: '$totalPrice' }
          }
        }
      ]);
      
      const dailySales = await Order.aggregate([
        { $match: matchStage },
        {
          $unwind: '$orderItems'
        },
        {
          $match: {
            'orderItems.product': { $in: productIds }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            dailyRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.qty'] } },
            dailyOrders: { $sum: 1 },
            dailyQuantity: { $sum: '$orderItems.qty' }
          }
        },
        { $sort: { _id: 1 } }
      ]);
      
      const growthData = await this.calculateGrowth(productIds, startDate, endDate);
      
      return {
        total: salesAggregation[0] || { totalRevenue: 0, totalOrders: 0, totalQuantity: 0, averageOrderValue: 0 },
        daily: dailySales,
        growth: growthData
      };
    } catch (error) {
      console.error('VendorAnalyticsService.getSalesData error:', error);
      // Return default values instead of throwing error
      return {
        total: { totalRevenue: 0, totalOrders: 0, totalQuantity: 0, averageOrderValue: 0 },
        daily: [],
        growth: { revenueGrowth: 0, orderGrowth: 0 }
      };
    }
  }
  
  // Calculate sales growth
  static async calculateGrowth(productIds, startDate, endDate) {
    try {
      // Validate input parameters
      if (!productIds || productIds.length === 0) {
        return { revenueGrowth: 0, orderGrowth: 0 };
      }
      
      // Validate dates
      if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
        return { revenueGrowth: 0, orderGrowth: 0 };
      }
      
      // Calculate current period
      const currentPeriod = await Order.aggregate([
        {
          $match: {
            'orderItems.product': { $in: productIds },
            isPaid: true,
            createdAt: {
              $gte: startDate,
              $lte: endDate
            }
          }
        },
        {
          $unwind: '$orderItems'
        },
        {
          $match: {
            'orderItems.product': { $in: productIds }
          }
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.qty'] } },
            orders: { $sum: 1 }
          }
        }
      ]);
      
      // Calculate previous period
      const periodDiff = endDate.getTime() - startDate.getTime();
      const previousStart = new Date(startDate.getTime() - periodDiff);
      const previousEnd = new Date(endDate.getTime() - periodDiff);
      
      const previousPeriod = await Order.aggregate([
        {
          $match: {
            'orderItems.product': { $in: productIds },
            isPaid: true,
            createdAt: {
              $gte: previousStart,
              $lte: previousEnd
            }
          }
        },
        {
          $unwind: '$orderItems'
        },
        {
          $match: {
            'orderItems.product': { $in: productIds }
          }
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.qty'] } },
            orders: { $sum: 1 }
          }
        }
      ]);
      
      const currentRevenue = currentPeriod[0]?.revenue || 0;
      const previousRevenue = previousPeriod[0]?.revenue || 0;
      const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
      
      const currentOrders = currentPeriod[0]?.orders || 0;
      const previousOrders = previousPeriod[0]?.orders || 0;
      const orderGrowth = previousOrders > 0 ? ((currentOrders - previousOrders) / previousOrders) * 100 : 0;
      
      return {
        revenueGrowth: parseFloat(revenueGrowth.toFixed(2)),
        orderGrowth: parseFloat(orderGrowth.toFixed(2))
      };
    } catch (error) {
      console.error('VendorAnalyticsService.calculateGrowth error:', error);
      return { revenueGrowth: 0, orderGrowth: 0 };
    }
  }
  
  // Get product performance metrics
  static async getProductPerformance(productIds) {
    try {
      const topProducts = await Order.aggregate([
        {
          $match: {
            'orderItems.product': { $in: productIds },
            isPaid: true
          }
        },
        {
          $unwind: '$orderItems'
        },
        {
          $match: {
            'orderItems.product': { $in: productIds }
          }
        },
        {
          $group: {
            _id: '$orderItems.product',
            totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.qty'] } },
            totalQuantity: { $sum: '$orderItems.qty' },
            totalOrders: { $sum: 1 }
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
        {
          $unwind: '$product'
        },
        {
          $project: {
            productId: '$_id',
            productName: '$product.name',
            productImage: '$product.image',
            category: '$product.category',
            brand: '$product.brand',
            totalRevenue: 1,
            totalQuantity: 1,
            totalOrders: 1,
            currentStock: '$product.countInStock'
          }
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 }
      ]);
      
      return {
        topProducts,
        totalProducts: productIds.length,
        activeProducts: topProducts.length
      };
    } catch (error) {
      throw new Error(`Failed to fetch product performance: ${error.message}`);
    }
  }
  
  // Get customer insights
  static async getCustomerInsights(productIds, startDate, endDate) {
    try {
      const matchStage = {
        'orderItems.product': { $in: productIds },
        isPaid: true,
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      };
      
      const customerAggregation = await Order.aggregate([
        { $match: matchStage },
        {
          $unwind: '$orderItems'
        },
        {
          $match: {
            'orderItems.product': { $in: productIds }
          }
        },
        {
          $group: {
            _id: '$user',
            totalSpent: { $sum: { $multiply: ['$orderItems.price', '$orderItems.qty'] } },
            totalOrders: { $sum: 1 },
            averageOrderValue: { $avg: '$totalPrice' },
            firstOrder: { $min: '$createdAt' },
            lastOrder: { $max: '$createdAt' }
          }
        },
        {
          $group: {
            _id: null,
            totalCustomers: { $sum: 1 },
            averageCustomerValue: { $avg: '$totalSpent' },
            customerSegments: {
              $push: {
                customerId: '$_id',
                totalSpent: '$totalSpent',
                totalOrders: '$totalOrders',
                segment: {
                  $switch: {
                    branches: [
                      { case: { $gte: ['$totalSpent', 1000] }, then: 'VIP' },
                      { case: { $gte: ['$totalSpent', 500] }, then: 'Premium' },
                      { case: { $gte: ['$totalSpent', 100] }, then: 'Regular' }
                    ],
                    default: 'New'
                  }
                }
              }
            }
          }
        }
      ]);
      
      const segmentCounts = {};
      if (customerAggregation[0]?.customerSegments) {
        customerAggregation[0].customerSegments.forEach(customer => {
          const segment = customer.segment;
          segmentCounts[segment] = (segmentCounts[segment] || 0) + 1;
        });
      }
      
      return {
        total: customerAggregation[0]?.totalCustomers || 0,
        averageValue: customerAggregation[0]?.averageCustomerValue || 0,
        segments: segmentCounts
      };
    } catch (error) {
      throw new Error(`Failed to fetch customer insights: ${error.message}`);
    }
  }
  
  // Get inventory status
  static async getInventoryStatus(products) {
    try {
      const totalProducts = products.length;
      const outOfStock = products.filter(p => p.countInStock === 0).length;
      const lowStock = products.filter(p => p.countInStock > 0 && p.countInStock <= 5).length;
      
      const inventoryValue = products.reduce((sum, product) => {
        return sum + (product.countInStock * product.price);
      }, 0);
      
      // Products needing restocking
      const restockProducts = products
        .filter(p => p.countInStock <= 5)
        .map(p => ({
          productId: p._id,
          productName: p.name,
          currentStock: p.countInStock,
          price: p.price,
          totalValue: p.countInStock * p.price
        }))
        .sort((a, b) => a.currentStock - b.currentStock);
      
      return {
        totalProducts,
        outOfStock,
        lowStock,
        inStock: totalProducts - outOfStock - lowStock,
        inventoryValue,
        restockProducts: restockProducts.slice(0, 10)
      };
    } catch (error) {
      throw new Error(`Failed to fetch inventory status: ${error.message}`);
    }
  }
  
  // Get empty vendor metrics for new vendors
  static getEmptyVendorMetrics() {
    return {
      sales: {
        total: { totalRevenue: 0, totalOrders: 0, totalQuantity: 0, averageOrderValue: 0 },
        daily: [],
        growth: { revenueGrowth: 0, orderGrowth: 0 }
      },
      products: {
        topProducts: [],
        totalProducts: 0,
        activeProducts: 0
      },
      customers: {
        total: 0,
        averageValue: 0,
        segments: {}
      },
      inventory: {
        totalProducts: 0,
        outOfStock: 0,
        lowStock: 0,
        inStock: 0,
        inventoryValue: 0,
        restockProducts: []
      },
      period: { start: new Date(), end: new Date() }
    };
  }
  
  // Get vendor ranking based on performance
  static async getVendorRanking(limit = 10) {
    try {
      const vendorPerformance = await Vendor.aggregate([
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: 'vendor',
            as: 'products'
          }
        },
        {
          $match: {
            products: { $ne: [] },
            isActive: true
          }
        },
        {
          $lookup: {
            from: 'orders',
            localField: 'products._id',
            foreignField: 'orderItems.product',
            as: 'orders'
          }
        },
        {
          $unwind: {
            path: '$orders',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $match: {
            'orders.isPaid': true
          }
        },
        {
          $group: {
            _id: '$_id',
            vendorName: { $first: '$name' },
            totalRevenue: { $sum: '$orders.totalPrice' },
            totalOrders: { $sum: 1 },
            averageOrderValue: { $avg: '$orders.totalPrice' }
          }
        },
        {
          $sort: { totalRevenue: -1 }
        },
        {
          $limit: limit
        }
      ]);
      
      return vendorPerformance;
    } catch (error) {
      throw new Error(`Failed to fetch vendor ranking: ${error.message}`);
    }
  }
}

export default VendorAnalyticsService;