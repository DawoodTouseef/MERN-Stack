import express from 'express';
import PaymentService from '../services/paymentService.js';
import { PaymentGateway, PaymentTransaction, FraudRule } from '../models/paymentGatewayModel.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validatePaymentRequest } from '../middlewares/validationMiddleware.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();
const paymentService = new PaymentService();


const defaultGatewayTemplates = [
  {
    name: 'upi',
    displayName: 'UPI',
    isActive: true,
    supportedMethods: ['upi'],
    configuration: { merchantId: '', publicKey: '', secretKey: '', webhookSecret: '', environment: 'sandbox' }
  },
  {
    name: 'paypal',
    displayName: 'PayPal',
    isActive: true,
    supportedMethods: ['wallet', 'international', 'credit_card', 'debit_card'],
    configuration: { merchantId: '', publicKey: '', secretKey: '', webhookSecret: '', environment: 'sandbox' }
  },
  {
    name: 'stripe',
    displayName: 'Stripe',
    isActive: true,
    supportedMethods: ['credit_card', 'debit_card', 'international', 'wallet'],
    configuration: { merchantId: '', publicKey: '', secretKey: '', webhookSecret: '', environment: 'sandbox' }
  },
  {
    name: 'razorpay',
    displayName: 'Razorpay',
    isActive: true,
    supportedMethods: ['upi', 'credit_card', 'debit_card', 'net_banking', 'wallet'],
    configuration: { merchantId: '', publicKey: '', secretKey: '', webhookSecret: '', environment: 'sandbox' }
  }
];

const ensureDefaultGateways = async () => {
  for (const template of defaultGatewayTemplates) {
    await PaymentGateway.findOneAndUpdate(
      { name: template.name },
      { $setOnInsert: template },
      { upsert: true, new: false }
    );
  }
};


// Rate limiting for payment endpoints
const paymentRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 payment requests per windowMs
  message: 'Too many payment attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// Get available payment methods
router.get('/methods', async (req, res) => {
  try {
    const { country } = req.query;
    const paymentMethods = await paymentService.getPaymentMethods(country);
    
    res.json({
      success: true,
      paymentMethods
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment methods'
    });
  }
});

// Create payment intent
router.post('/create-intent', 
  paymentRateLimit,
  authenticate,
  validatePaymentRequest,
  async (req, res) => {
    try {
      const {
        amount,
        currency,
        gateway,
        paymentMethod,
        orderId,
        billingAddress,
        metadata
      } = req.body;

      const paymentData = {
        amount,
        currency,
        gateway,
        paymentMethod,
        orderId,
        userId: req.user._id,
        customerInfo: {
          email: req.user.email,
          name: req.user.username
        },
        billingAddress,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        deviceFingerprint: req.body.deviceFingerprint,
        metadata
      };

      const result = await paymentService.createPaymentIntent(paymentData);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Payment creation failed:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Confirm payment (webhook endpoint)
router.post('/webhook/:gateway', async (req, res) => {
  try {
    const { gateway } = req.params;
    const gatewayResponse = {
      headers: req.headers,
      body: req.body,
      ...req.body
    };

    // Find transaction by gateway transaction ID
    const transaction = await PaymentTransaction.findOne({
      gatewayTransactionId: req.body.id || req.body.payment_id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const confirmedTransaction = await paymentService.confirmPayment(
      transaction._id,
      gatewayResponse
    );

    // Emit real-time update
    req.app.get('io').to(`user_${transaction.userId}`).emit('paymentUpdate', {
      transactionId: transaction._id,
      status: confirmedTransaction.status,
      orderId: transaction.orderId
    });

    res.json({
      success: true,
      message: 'Payment confirmed'
    });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Process refund
router.post('/refund', authenticate, async (req, res) => {
  try {
    const { transactionId, amount, reason } = req.body;

    // Verify user has permission to refund this transaction
    const transaction = await PaymentTransaction.findById(transactionId)
      .populate('orderId');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check if user is admin or owns the transaction
    if (req.user.role !== 'admin' && transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to refund this transaction'
      });
    }

    const refundResult = await paymentService.processRefund(transactionId, {
      amount,
      reason
    });

    res.json({
      success: true,
      refund: refundResult
    });
  } catch (error) {
    console.error('Refund processing failed:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get transaction history
router.get('/transactions', authenticate, async (req, res) => {
  try {
    const { page, limit, status, gateway } = req.query;
    
    const userId = req.user.role === 'admin' ? undefined : req.user._id;
    
    const result = await paymentService.getTransactionHistory(userId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      status,
      gateway
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction history'
    });
  }
});

// Get transaction details
router.get('/transaction/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const transaction = await PaymentTransaction.findById(id)
      .populate('orderId', 'orderNumber totalAmount items')
      .populate('userId', 'username email');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check if user has permission to view this transaction
    if (req.user.role !== 'admin' && transaction.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authenticateorized to view this transaction'
      });
    }

    // Remove sensitive data
    const sanitizedTransaction = {
      ...transaction.toObject(),
      gatewayResponse: undefined,
      cardDetails: transaction.cardDetails ? {
        last4: transaction.cardDetails.last4,
        brand: transaction.cardDetails.brand
      } : undefined
    };

    res.json({
      success: true,
      transaction: sanitizedTransaction
    });
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction details'
    });
  }
});

// Admin endpoints for gateway management
router.get('/gateways', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    await ensureDefaultGateways();

    const gateways = await PaymentGateway.find({ name: { $in: ['upi', 'paypal', 'stripe', 'razorpay'] } })
      .sort({ name: 1 })
      .select('-configuration.secretKey -configuration.webhookSecret');

    res.json({
      success: true,
      gateways
    });
  } catch (error) {
    console.error('Error fetching gateways:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment gateways'
    });
  }
});

// Update gateway configuration
router.put('/gateways/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { id } = req.params;
    const updateData = req.body || {};

    // Prevent changing gateway identity via update payload
    delete updateData.name;

    const existingGateway = await PaymentGateway.findById(id);
    if (!existingGateway) {
      return res.status(404).json({
        success: false,
        message: 'Gateway not found'
      });
    }

    const mergedConfiguration = {
      ...(existingGateway.configuration?.toObject ? existingGateway.configuration.toObject() : existingGateway.configuration || {}),
      ...(updateData.configuration || {}),
    };

    // Keep existing secrets when frontend submits blank values
    if (!updateData.configuration?.secretKey) {
      mergedConfiguration.secretKey = existingGateway.configuration?.secretKey || '';
    }
    if (!updateData.configuration?.webhookSecret) {
      mergedConfiguration.webhookSecret = existingGateway.configuration?.webhookSecret || '';
    }

    const payload = {
      ...updateData,
      configuration: mergedConfiguration,
    };

    const gateway = await PaymentGateway.findByIdAndUpdate(
      id,
      payload,
      { new: true, runValidators: true }
    ).select('-configuration.secretKey -configuration.webhookSecret');

    if (!gateway) {
      return res.status(404).json({
        success: false,
        message: 'Gateway not found'
      });
    }

    // Reinitialize payment service with updated gateways
    await paymentService.initializeGateways();

    res.json({
      success: true,
      gateway
    });
  } catch (error) {
    console.error('Error updating gateway:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Fraud rules management
router.get('/fraud-rules', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const rules = await FraudRule.find().sort({ priority: -1 });

    res.json({
      success: true,
      rules
    });
  } catch (error) {
    console.error('Error fetching fraud rules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fraud rules'
    });
  }
});

// Create fraud rule
router.post('/fraud-rules', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const rule = new FraudRule(req.body);
    await rule.save();

    res.status(201).json({
      success: true,
      rule
    });
  } catch (error) {
    console.error('Error creating fraud rule:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Update fraud rule
router.put('/fraud-rules/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { id } = req.params;
    const rule = await FraudRule.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Fraud rule not found'
      });
    }

    res.json({
      success: true,
      rule
    });
  } catch (error) {
    console.error('Error updating fraud rule:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get payment analytics
router.get('/analytics', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { startDate, endDate } = req.query;
    const dateFilter = {};
    
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Payment analytics aggregation
    const analytics = await PaymentTransaction.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          successfulTransactions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          failedTransactions: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          },
          averageFraudScore: { $avg: '$fraudScore' },
          totalRefunded: {
            $sum: {
              $cond: [
                { $in: ['$status', ['refunded', 'partially_refunded']] },
                '$amount',
                0
              ]
            }
          }
        }
      }
    ]);

    // Gateway-wise breakdown
    const gatewayStats = await PaymentTransaction.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$gateway',
          transactions: { $sum: 1 },
          amount: { $sum: '$amount' },
          successRate: {
            $avg: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      analytics: analytics[0] || {
        totalTransactions: 0,
        totalAmount: 0,
        successfulTransactions: 0,
        failedTransactions: 0,
        averageFraudScore: 0,
        totalRefunded: 0
      },
      gatewayStats
    });
  } catch (error) {
    console.error('Error fetching payment analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment analytics'
    });
  }
});

export default router;