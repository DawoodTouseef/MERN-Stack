import asyncHandler from 'express-async-handler';
import Vendor from '../models/vendorModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import VendorAnalyticsService from '../services/vendorAnalyticsService.js';
import mongoose from 'mongoose';

// @desc    Get all vendors
// @route   GET /api/vendors
// @access  Private/Admin
export const getVendors = asyncHandler(async (req, res) => {
  try {
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.pageNumber) || 1;

    const count = await Vendor.countDocuments();
    const vendors = await Vendor.find()
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      vendors,
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch vendors', error: error.message });
  }
});

// @desc    Get vendor by ID
// @route   GET /api/vendors/:id
// @access  Private/Admin
export const getVendorById = asyncHandler(async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    
    if (vendor) {
      res.json(vendor);
    } else {
      res.status(404).json({ message: 'Vendor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch vendor', error: error.message });
  }
});

// @desc    Create vendor
// @route   POST /api/vendors
// @access  Private/Admin
export const createVendor = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      businessType,
      taxId,
      bankDetails,
      contactPerson
    } = req.body;

    const vendorExists = await Vendor.findOne({ email });
    
    if (vendorExists) {
      res.status(400);
      throw new Error('Vendor already exists with this email');
    }

    const vendor = new Vendor({
      name,
      email,
      phone,
      address,
      businessType,
      taxId,
      bankDetails,
      contactPerson
    });

    const createdVendor = await vendor.save();
    res.status(201).json(createdVendor);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create vendor', error: error.message });
  }
});

// @desc    Update vendor
// @route   PUT /api/vendors/:id
// @access  Private/Admin
export const updateVendor = asyncHandler(async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (vendor) {
      vendor.name = req.body.name || vendor.name;
      vendor.email = req.body.email || vendor.email;
      vendor.phone = req.body.phone || vendor.phone;
      vendor.address = req.body.address || vendor.address;
      vendor.businessType = req.body.businessType || vendor.businessType;
      vendor.taxId = req.body.taxId || vendor.taxId;
      vendor.bankDetails = req.body.bankDetails || vendor.bankDetails;
      vendor.contactPerson = req.body.contactPerson || vendor.contactPerson;
      vendor.isActive = req.body.isActive !== undefined ? req.body.isActive : vendor.isActive;

      const updatedVendor = await vendor.save();
      res.json(updatedVendor);
    } else {
      res.status(404).json({ message: 'Vendor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update vendor', error: error.message });
  }
});

// @desc    Delete vendor
// @route   DELETE /api/vendors/:id
// @access  Private/Admin
export const deleteVendor = asyncHandler(async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (vendor) {
      await vendor.remove();
      res.json({ message: 'Vendor removed' });
    } else {
      res.status(404).json({ message: 'Vendor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete vendor', error: error.message });
  }
});

// @desc    Get vendor dashboard data
// @route   GET /api/vendors/dashboard
// @access  Private/Vendor
export const getVendorDashboard = asyncHandler(async (req, res) => {
  try {
    const vendorId = req.user._id;
    
    // Get comprehensive vendor performance metrics
    const performance = await VendorAnalyticsService.getVendorPerformance(vendorId, {
      period: '30d'
    });
    
    // Get vendor products
    const products = await Product.find({ vendor: vendorId });
    
    // Get recent orders for vendor's products
    const recentOrders = await Order.find({
      'orderItems.product': { $in: products.map(p => p._id) }
    })
    .populate('user', 'username email')
    .sort({ createdAt: -1 })
    .limit(10);
    
    res.json({
      products: products.length,
      recentOrders,
      performance
    });
  } catch (error) {
    console.error('Vendor dashboard error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data', error: error.message });
  }
});

// @desc    Get vendor sales analytics
// @route   GET /api/vendors/analytics/sales
// @access  Private/Vendor
export const getVendorSalesAnalytics = asyncHandler(async (req, res) => {
  try {
    const vendorId = req.user._id;
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    // Get vendor products
    const products = await Product.find({ vendor: vendorId });
    
    // Validate date parameters
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Check if dates are valid
    if (startDate && isNaN(start.getTime())) {
      return res.status(400).json({ message: 'Invalid startDate parameter' });
    }
    
    if (endDate && isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid endDate parameter' });
    }
    
    const matchStage = {
      'orderItems.product': { $in: products.map(p => p._id) },
      isPaid: true,
      createdAt: {
        $gte: start,
        $lte: end
      }
    };

    const dateFormat = {
      day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      week: { $dateToString: { format: "%Y-W%U", date: "$createdAt" } },
      month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
      year: { $dateToString: { format: "%Y", date: "$createdAt" } }
    };

    const pipeline = [
      { $match: matchStage },
      {
        $unwind: '$orderItems'
      },
      {
        $match: {
          'orderItems.product': { $in: products.map(p => p._id) }
        }
      },
      {
        $group: {
          _id: dateFormat[groupBy],
          totalSales: { $sum: { $multiply: ['$orderItems.price', '$orderItems.qty'] } },
          totalOrders: { $sum: 1 },
          totalQuantity: { $sum: '$orderItems.qty' }
        }
      },
      { $sort: { _id: 1 } }
    ];

    const salesData = await Order.aggregate(pipeline);

    // Calculate totals
    const totals = salesData.reduce((acc, curr) => ({
      totalSales: acc.totalSales + curr.totalSales,
      totalOrders: acc.totalOrders + curr.totalOrders,
      totalQuantity: acc.totalQuantity + curr.totalQuantity
    }), { totalSales: 0, totalOrders: 0, totalQuantity: 0 });

    res.json({
      period: { startDate: start, endDate: end, groupBy },
      data: salesData,
      summary: totals
    });
  } catch (error) {
    console.error('Vendor sales analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch sales analytics', error: error.message });
  }
});

// @desc    Get vendor product performance analytics
// @route   GET /api/vendors/analytics/products
// @access  Private/Vendor
export const getVendorProductAnalytics = asyncHandler(async (req, res) => {
  try {
    const vendorId = req.user._id;
    const { startDate, endDate, limit = 20, sortBy = 'revenue' } = req.query;
    
    // Validate limit parameter
    const parsedLimit = Math.min(parseInt(limit) || 20, 100); // Max 100 items
    
    // Validate sortBy parameter
    const validSortFields = ['revenue', 'totalQuantitySold', 'totalOrders', 'averagePrice'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'revenue';

    // Get vendor products
    const products = await Product.find({ vendor: vendorId });
    
    // Validate date parameters
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Check if dates are valid
    if (startDate && isNaN(start.getTime())) {
      return res.status(400).json({ message: 'Invalid startDate parameter' });
    }
    
    if (endDate && isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid endDate parameter' });
    }

    const pipeline = [
      {
        $match: {
          'orderItems.product': { $in: products.map(p => p._id) },
          isPaid: true,
          createdAt: {
            $gte: start,
            $lte: end
          }
        }
      },
      { $unwind: '$orderItems' },
      {
        $match: {
          'orderItems.product': { $in: products.map(p => p._id) }
        }
      },
      {
        $group: {
          _id: '$orderItems.product',
          totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.qty'] } },
          totalQuantitySold: { $sum: '$orderItems.qty' },
          totalOrders: { $sum: 1 },
          averagePrice: { $avg: '$orderItems.price' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $project: {
          productId: '$_id',
          productName: '$productDetails.name',
          productImage: '$productDetails.image',
          category: '$productDetails.category',
          brand: '$productDetails.brand',
          totalRevenue: 1,
          totalQuantitySold: 1,
          totalOrders: 1,
          averagePrice: 1,
          currentStock: '$productDetails.countInStock'
        }
      },
      { $sort: { [sortField]: -1 } },
      { $limit: parsedLimit }
    ];

    const productAnalytics = await Order.aggregate(pipeline);

    res.json({
      period: { startDate: start, endDate: end },
      topProducts: productAnalytics,
      metrics: {
        totalProducts: productAnalytics.length,
        totalRevenue: productAnalytics.reduce((sum, p) => sum + (p.totalRevenue || 0), 0),
        totalQuantitySold: productAnalytics.reduce((sum, p) => sum + (p.totalQuantitySold || 0), 0)
      }
    });
  } catch (error) {
    console.error('Vendor product analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch product analytics', error: error.message });
  }
});

// @desc    Get vendor customer analytics
// @route   GET /api/vendors/analytics/customers
// @access  Private/Vendor
export const getVendorCustomerAnalytics = asyncHandler(async (req, res) => {
  try {
    const vendorId = req.user._id;
    const { startDate, endDate, segment = 'all' } = req.query;

    // Get vendor products
    const products = await Product.find({ vendor: vendorId });
    
    // Validate date parameters
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Check if dates are valid
    if (startDate && isNaN(start.getTime())) {
      return res.status(400).json({ message: 'Invalid startDate parameter' });
    }
    
    if (endDate && isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid endDate parameter' });
    }

    const matchStage = {
      'orderItems.product': { $in: products.map(p => p._id) },
      isPaid: true,
      createdAt: {
        $gte: start,
        $lte: end
      }
    };

    // Customer lifetime value and behavior
    const customerPipeline = [
      { $match: matchStage },
      {
        $unwind: '$orderItems'
      },
      {
        $match: {
          'orderItems.product': { $in: products.map(p => p._id) }
        }
      },
      {
        $group: {
          _id: '$user',
          totalSpent: { $sum: { $multiply: ['$orderItems.price', '$orderItems.qty'] } },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$totalPrice' },
          firstOrderDate: { $min: '$createdAt' },
          lastOrderDate: { $max: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' },
      {
        $addFields: {
          customerSegment: {
            $switch: {
              branches: [
                { case: { $gte: ['$totalSpent', 1000] }, then: 'VIP' },
                { case: { $gte: ['$totalSpent', 500] }, then: 'Premium' },
                { case: { $gte: ['$totalSpent', 100] }, then: 'Regular' }
              ],
              default: 'New'
            }
          },
          daysSinceFirstOrder: {
            $divide: [
              { $subtract: [new Date(), '$firstOrderDate'] },
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
        $unwind: '$orderItems'
      },
      {
        $match: {
          'orderItems.product': { $in: products.map(p => p._id) }
        }
      },
      {
        $group: {
          _id: '$user',
          totalSpent: { $sum: { $multiply: ['$orderItems.price', '$orderItems.qty'] } },
          totalOrders: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $gte: ['$totalSpent', 1000] }, then: 'VIP' },
                { case: { $gte: ['$totalSpent', 500] }, then: 'Premium' },
                { case: { $gte: ['$totalSpent', 100] }, then: 'Regular' }
              ],
              default: 'New'
            }
          },
          customerCount: { $sum: 1 },
          totalRevenue: { $sum: '$totalSpent' },
          averageSpending: { $avg: '$totalSpent' }
        }
      }
    ]);

    res.json({
      period: { startDate: start, endDate: end },
      customerData: customerData.slice(0, 100), // Limit for performance
      segmentSummary,
      metrics: {
        totalCustomers: customerData.length,
        averageLifetimeValue: customerData.length > 0 ? 
          customerData.reduce((sum, c) => sum + (c.totalSpent || 0), 0) / customerData.length : 0
      }
    });
  } catch (error) {
    console.error('Vendor customer analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch customer analytics', error: error.message });
  }
});

// @desc    Get vendor inventory analytics
// @route   GET /api/vendors/analytics/inventory
// @access  Private/Vendor
export const getVendorInventoryAnalytics = asyncHandler(async (req, res) => {
  try {
    const vendorId = req.user._id;
    
    // Get vendor products
    const products = await Product.find({ vendor: vendorId });
    
    // Inventory metrics
    const totalProducts = products.length;
    const outOfStockProducts = products.filter(p => p.countInStock === 0).length;
    const lowStockProducts = products.filter(p => p.countInStock > 0 && p.countInStock <= 5).length;
    
    // Top selling products by inventory
    const inventoryAnalysis = products.map(product => ({
      productId: product._id,
      productName: product.name,
      currentStock: product.countInStock,
      price: product.price,
      totalValue: product.countInStock * product.price,
      status: product.countInStock === 0 ? 'Out of Stock' : 
              product.countInStock <= 5 ? 'Low Stock' : 'In Stock'
    })).sort((a, b) => a.currentStock - b.currentStock).slice(0, 20);
    
    res.json({
      metrics: {
        totalProducts,
        outOfStockProducts,
        lowStockProducts,
        inStockProducts: totalProducts - outOfStockProducts - lowStockProducts,
        stockValue: inventoryAnalysis.reduce((sum, item) => sum + item.totalValue, 0)
      },
      inventoryAnalysis
    });
  } catch (error) {
    console.error('Vendor inventory analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch inventory analytics', error: error.message });
  }
});

export default {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
  getVendorDashboard,
  getVendorSalesAnalytics,
  getVendorProductAnalytics,
  getVendorCustomerAnalytics,
  getVendorInventoryAnalytics
};