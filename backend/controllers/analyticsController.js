import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import Offer from "../models/offersModel.js";
import TaxRule from "../models/taxModel.js";
import { Shipment } from "../models/courierModel.js";
import mongoose from "mongoose";  

// Sales Analytics
export const getSalesAnalytics = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      groupBy = 'day', // day, week, month, year
      vendorId,
      categoryId,
      productId
    } = req.query;

    const matchStage = {
      isPaid: true,
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    // Add filters
    if (vendorId) matchStage.vendor = mongoose.Types.ObjectId(vendorId);
    if (productId) matchStage['orderItems.product'] = mongoose.Types.ObjectId(productId);

    const dateFormat = {
      day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      week: { $dateToString: { format: "%Y-W%U", date: "$createdAt" } },
      month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
      year: { $dateToString: { format: "%Y", date: "$createdAt" } }
    };

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: dateFormat[groupBy],
          totalSales: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: "$totalPrice" },
          totalTax: { $sum: "$taxPrice" },
          totalShipping: { $sum: "$shippingPrice" }   
        }
      },
      { $sort: { _id: 1 } }
    ];

    const salesData = await Order.aggregate(pipeline);

    // Calculate totals
    const totals = salesData.reduce((acc, curr) => ({
      totalSales: acc.totalSales + curr.totalSales,
      totalOrders: acc.totalOrders + curr.totalOrders,
      totalTax: acc.totalTax + curr.totalTax,
      totalShipping: acc.totalShipping + curr.totalShipping
    }), { totalSales: 0, totalOrders: 0, totalTax: 0, totalShipping: 0 });

    res.json({
      period: { startDate, endDate, groupBy },
      data: salesData,
      summary: {
        ...totals,
        averageOrderValue: totals.totalOrders > 0 ? totals.totalSales / totals.totalOrders : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch sales analytics", error: error.message });
  }
};

// Product Performance Analytics
export const getProductAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, limit = 20, sortBy = 'revenue' } = req.query;

    const pipeline = [
      {
        $match: {
          isPaid: true,
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.product",
          totalRevenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] } },
          totalQuantitySold: { $sum: "$orderItems.qty" }, 
          totalOrders: { $sum: 1 },
          averagePrice: { $avg: "$orderItems.price" }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails"      
        }
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          productId: "$_id",
          productName: "$productDetails.name",
          category: "$productDetails.category",
          brand: "$productDetails.brand", 
          totalRevenue: 1,
          totalQuantitySold: 1,
          totalOrders: 1,
          averagePrice: 1,
          currentStock: "$productDetails.countInStock"        
        }
      },
      { $sort: { [sortBy]: -1 } },
      { $limit: parseInt(limit) }
    ];

    const productAnalytics = await Order.aggregate(pipeline);

    res.json({
      period: { startDate, endDate },
      topProducts: productAnalytics,
      metrics: {
        totalProducts: productAnalytics.length,
        totalRevenue: productAnalytics.reduce((sum, p) => sum + p.totalRevenue, 0),
        totalQuantitySold: productAnalytics.reduce((sum, p) => sum + p.totalQuantitySold, 0)
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product analytics", error: error.message });
  } 
};

// Customer Analytics
export const getCustomerAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, segment = 'all' } = req.query;

    const matchStage = {
      isPaid: true,
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    // Customer lifetime value and behavior
    const customerPipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: "$user",
          totalSpent: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: "$totalPrice" },
          firstOrderDate: { $min: "$createdAt" },
          lastOrderDate: { $max: "$createdAt" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      { $unwind: "$userDetails" },
      {
        $addFields: {
          customerSegment: {
            $switch: {
              branches: [
                { case: { $gte: ["$totalSpent", 1000] }, then: "VIP" },
                { case: { $gte: ["$totalSpent", 500] }, then: "Premium" },
                { case: { $gte: ["$totalSpent", 100] }, then: "Regular" }
              ],
              default: "New"
            }
          },
          daysSinceFirstOrder: {
            $divide: [
              { $subtract: [new Date(), "$firstOrderDate"] }, 
              1000 * 60 * 60 * 24
            ]
          }
        }
      }
    ];

    if (segment !== 'all') {
      customerPipeline.push({ $match: { customerSegment: segment } });
    }

    const customerData = await Order.aggregate(customerPipeline);

    // Customer segmentation summary
    const segmentSummary = await Order.aggregate([
      { $match: matchStage },
      {
        $group: { 
          _id: "$user",
          totalSpent: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $gte: ["$totalSpent", 1000] }, then: "VIP" },
                { case: { $gte: ["$totalSpent", 500] }, then: "Premium" },    
                { case: { $gte: ["$totalSpent", 100] }, then: "Regular" }
              ],
              default: "New"
            }
          },
          customerCount: { $sum: 1 },
          totalRevenue: { $sum: "$totalSpent" },
          averageSpending: { $avg: "$totalSpent" }  
        }
      }
    ]);

    res.json({
      period: { startDate, endDate },
      customerData: customerData.slice(0, 100), // Limit for performance
      segmentSummary,
      metrics: {
        totalCustomers: customerData.length,
        averageLifetimeValue: customerData.reduce((sum, c) => sum + c.totalSpent, 0) / customerData.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch customer analytics", error: error.message });
  }
};

// Tax Analytics
export const getTaxAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, jurisdiction, taxType } = req.query;

    const matchStage = {
      isPaid: true,
      taxPrice: { $gt: 0 },
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    const taxPipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "addresses",
          localField: "shippingAddress",
          foreignField: "_id",  
          as: "address"
        }
      },        
      { $unwind: "$address" },
      {
        $group: {
          _id: {
            country: "$address.country",
            state: "$address.state",
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
          },
          totalTaxCollected: { $sum: "$taxPrice" },
          totalOrders: { $sum: 1 }, 
          totalSales: { $sum: "$itemsPrice" },
          averageTaxRate: { $avg: { $divide: ["$taxPrice", "$itemsPrice"] } }
        }
      },
      { $sort: { "_id.date": 1 } }
    ];

    const taxData = await Order.aggregate(taxPipeline);

    // Tax rules effectiveness
    const taxRulesStats = await TaxRule.aggregate([
      {
        $group: {
          _id: {
            country: "$address.country",
            state: "$address.state",
            taxType: "$taxType"
          },
          averageRate: { $avg: "$rate" },
          ruleCount: { $sum: 1 }
        }
      }
    ]);

    res.json({
      period: { startDate, endDate },
      taxCollection: taxData,
      taxRulesStats,
      summary: {
        totalTaxCollected: taxData.reduce((sum, item) => sum + item.totalTaxCollected, 0),
        totalOrders: taxData.reduce((sum, item) => sum + item.totalOrders, 0),
        averageTaxRate: taxData.length > 0 ? 
          taxData.reduce((sum, item) => sum + item.averageTaxRate, 0) / taxData.length : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tax analytics", error: error.message });
  }
};

// Shipping Analytics
export const getShippingAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, courierId } = req.query;

    const matchStage = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    if (courierId) {
      matchStage.courier = mongoose.Types.ObjectId(courierId);
    }

    const shippingPipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "courierpartners",
          localField: "courier",
          foreignField: "_id",
          as: "courierDetails"
        }
      },
      { $unwind: { path: "$courierDetails", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            courier: "$courierDetails.name",
            status: "$status",
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
          },
          totalShipments: { $sum: 1 },
          totalCost: { $sum: "$totalCost" },
          averageCost: { $avg: "$totalCost" },
          averageWeight: { $avg: "$weight" }
        }
      },
      { $sort: { "_id.date": 1 } }  
    ];

    const shippingData = await Shipment.aggregate(shippingPipeline);

    // Delivery performance
    const deliveryPerformance = await Shipment.aggregate([
      {
        $match: {
          ...matchStage,
          status: 'delivered',
          estimatedDelivery: { $exists: true },
          actualDelivery: { $exists: true }
        }
      },
      {
        $addFields: {
          deliveryDelay: {
            $divide: [
              { $subtract: ["$actualDelivery", "$estimatedDelivery"] }, 
              1000 * 60 * 60 * 24 // Convert to days  
            ]
          }
        }
      },
      {
        $group: {
          _id: "$courierDetails.name",
          totalDeliveries: { $sum: 1 },   
          onTimeDeliveries: {
            $sum: { $cond: [{ $lte: ["$deliveryDelay", 0] }, 1, 0] }
          },
          averageDelay: { $avg: "$deliveryDelay" },
          maxDelay: { $max: "$deliveryDelay" }    
        }
      },
      {
        $addFields: {
          onTimePercentage: {     
            $multiply: [  
              { $divide: ["$onTimeDeliveries", "$totalDeliveries"] },
              100
            ]
          }
        }
      }
    ]);

    res.json({
      period: { startDate, endDate },
      shippingData,
      deliveryPerformance,
      summary: {
        totalShipments: shippingData.reduce((sum, item) => sum + item.totalShipments, 0),
        totalShippingCost: shippingData.reduce((sum, item) => sum + item.totalCost, 0),
        averageDeliveryPerformance: deliveryPerformance.length > 0 ?
          deliveryPerformance.reduce((sum, item) => sum + item.onTimePercentage, 0) / deliveryPerformance.length : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch shipping analytics", error: error.message });
  }
};

// Flash Sales Analytics
export const getFlashSalesAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, offerId } = req.query;

    const matchStage = {
      'flashSaleConfig.isFlashSale': true,
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    if (offerId) {
      matchStage._id = mongoose.Types.ObjectId(offerId);
    }

    const flashSalesData = await Offer.find(matchStage).select(
      'title analytics flashSaleConfig startTime endTime'
    );

    // Calculate performance metrics
    const performanceMetrics = flashSalesData.map(offer => {
      const duration = offer.endTime ? 
        (new Date(offer.endTime) - new Date(offer.startTime)) / (1000 * 60 * 60) : 0; // hours
      
      return {
        id: offer._id,
        title: offer.title,
        duration,
        views: offer.analytics.views,
        conversions: offer.analytics.conversions,
        revenue: offer.analytics.revenue,
        conversionRate: offer.analytics.views > 0 ? 
          (offer.analytics.conversions / offer.analytics.views * 100) : 0,
        revenuePerHour: duration > 0 ? offer.analytics.revenue / duration : 0,
        stockUtilization: offer.flashSaleConfig.stockLimit > 0 ?
          ((offer.flashSaleConfig.stockLimit - offer.flashSaleConfig.currentStock) / offer.flashSaleConfig.stockLimit * 100) : 0
      };
    });

    res.json({
      period: { startDate, endDate },
      flashSales: performanceMetrics,
      summary: {
        totalFlashSales: flashSalesData.length,
        totalRevenue: performanceMetrics.reduce((sum, fs) => sum + fs.revenue, 0),
        averageConversionRate: performanceMetrics.length > 0 ?
          performanceMetrics.reduce((sum, fs) => sum + fs.conversionRate, 0) / performanceMetrics.length : 0,
        averageRevenuePerHour: performanceMetrics.length > 0 ?
          performanceMetrics.reduce((sum, fs) => sum + fs.revenuePerHour, 0) / performanceMetrics.length : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch flash sales analytics", error: error.message });
  }
};

// Dashboard Overview
export const getDashboardOverview = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const days = parseInt(period.replace('d', ''));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const matchStage = {
      createdAt: { $gte: startDate }
    };

    // Quick stats
    const [totalOrders, totalRevenue, totalCustomers, activeProducts] = await Promise.all([
      Order.countDocuments({ ...matchStage, isPaid: true }),
      Order.aggregate([
        { $match: { ...matchStage, isPaid: true } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } }   
      ]),
      User.countDocuments({ ...matchStage, role: 'customer' }),
      Product.countDocuments({ countInStock: { $gt: 0 } })
    ]);

    // Recent activity
    const recentOrders = await Order.find(matchStage)
      .populate('user', 'username')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderNumber totalPrice orderStatus createdAt');

    res.json({
      period: `${days} days`,
      quickStats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalCustomers,
        activeProducts
      },
      recentActivity: recentOrders
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard overview", error: error.message });
  }
};