import Stripe from 'stripe';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import axios from 'axios';
import { PaymentGateway, PaymentTransaction, FraudRule } from '../models/paymentGatewayModel.js';

class PaymentService {
  constructor() {
    this.gateways = new Map();
    this.initializeGateways();
  }

  async initializeGateways() {
    try {
      this.gateways.clear();
      const activeGateways = await PaymentGateway.find({ isActive: true });

      for (const gateway of activeGateways) {
        switch (gateway.name) {
          case 'stripe':
            if (gateway.configuration?.secretKey) {
              this.gateways.set('stripe', new Stripe(gateway.configuration.secretKey, {
                apiVersion: '2023-10-16'
              }));
            }
            break;
          case 'razorpay':
            if (gateway.configuration?.publicKey && gateway.configuration?.secretKey) {
              this.gateways.set('razorpay', new Razorpay({
                key_id: gateway.configuration.publicKey,
                key_secret: gateway.configuration.secretKey
              }));
            }
            break;
          case 'paypal':
            // PayPal SDK initialization would go here
            break;
        }
      }
    } catch (error) {
      console.error('Error initializing payment gateways:', error);
    }
  }

  async createPaymentIntent(paymentData) {
    const {
      amount,
      currency,
      gateway,
      paymentMethod,
      orderId,
      userId,
      customerInfo,
      metadata
    } = paymentData;

    try {
      // Run fraud detection
      const fraudResult = await this.runFraudDetection(paymentData);

      if (fraudResult.blocked) {
        throw new Error(`Transaction blocked due to fraud detection: ${fraudResult.reason}`);
      }

      let gatewayResponse;
      let gatewayTransactionId;

      switch (gateway) {
        case 'stripe':
          gatewayResponse = await this.createStripePayment(paymentData);
          gatewayTransactionId = gatewayResponse.id;
          break;
        case 'razorpay':
          gatewayResponse = await this.createRazorpayPayment(paymentData);
          gatewayTransactionId = gatewayResponse.id;
          break;
        case 'paypal':
          gatewayResponse = await this.createPayPalPayment(paymentData);
          gatewayTransactionId = gatewayResponse.id;
          break;
        default:
          throw new Error(`Unsupported payment gateway: ${gateway}`);
      }

      // Create payment transaction record
      const transaction = new PaymentTransaction({
        orderId,
        userId,
        gateway,
        gatewayTransactionId,
        amount,
        currency,
        paymentMethod,
        status: 'pending',
        gatewayResponse,
        fraudScore: fraudResult.score,
        fraudFlags: fraudResult.flags,
        ipAddress: paymentData.ipAddress,
        userAgent: paymentData.userAgent,
        deviceFingerprint: paymentData.deviceFingerprint,
        billingAddress: paymentData.billingAddress,
        metadata
      });

      await transaction.save();

      return {
        transactionId: transaction._id,
        gatewayTransactionId,
        clientSecret: gatewayResponse.client_secret,
        status: 'pending',
        fraudScore: fraudResult.score,
        requiresAction: gatewayResponse.status === 'requires_action'
      };
    } catch (error) {
      console.error('Payment creation failed:', error);
      throw error;
    }
  }

  async createStripePayment(paymentData) {
    const stripe = this.gateways.get('stripe');
    const { amount, currency, customerInfo, metadata } = paymentData;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency: currency.toLowerCase(),
      payment_method_types: ['card'],
      customer_email: customerInfo.email,
      metadata: {
        orderId: paymentData.orderId,
        userId: paymentData.userId,
        ...metadata
      },
      automatic_payment_methods: {
        enabled: true
      }
    });

    return paymentIntent;
  }

  async createRazorpayPayment(paymentData) {
    const razorpay = this.gateways.get('razorpay');
    const { amount, currency, customerInfo, orderId } = paymentData;

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: currency.toUpperCase(),
      receipt: `order_${orderId}`,
      payment_capture: 1,
      notes: {
        orderId: paymentData.orderId,
        userId: paymentData.userId
      }
    });

    return order;
  }

  async createPayPalPayment(paymentData) {
    const { amount, currency, orderId } = paymentData;

    const gateway = await PaymentGateway.findOne({ name: 'paypal', isActive: true });
    if (!gateway) throw new Error('PayPal gateway not configured');

    const auth = Buffer.from(`${gateway.configuration.publicKey}:${gateway.configuration.secretKey}`).toString('base64');

    // Get access token
    const tokenResponse = await axios.post(
      `${gateway.configuration.environment === 'sandbox' ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com'}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Create order
    const response = await axios.post(
      `${gateway.configuration.environment === 'sandbox' ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com'}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: orderId,
          amount: {
            currency_code: currency.toUpperCase(),
            value: amount.toFixed(2)
          }
        }]
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      id: response.data.id,
      status: response.data.status,
      links: response.data.links,
      client_secret: response.data.id // For PayPal, the ID is often used as the identifier for client-side SDK
    };
  }

  async runFraudDetection(paymentData) {
    try {
      const fraudRules = await FraudRule.find({ isActive: true })
        .sort({ priority: -1 });

      let totalScore = 0;
      const flags = [];
      let blocked = false;

      for (const rule of fraudRules) {
        const ruleResult = await this.evaluateFraudRule(rule, paymentData);

        if (ruleResult.triggered) {
          totalScore += rule.actions.score;
          flags.push({
            rule: rule.name,
            score: rule.actions.score,
            description: rule.description
          });

          if (rule.actions.blockTransaction) {
            blocked = true;
          }
        }
      }

      // Check velocity (multiple transactions in short time)
      const velocityCheck = await this.checkVelocity(paymentData);
      if (velocityCheck.triggered) {
        totalScore += velocityCheck.score;
        flags.push(velocityCheck.flag);
      }

      // Check suspicious patterns
      const patternCheck = await this.checkSuspiciousPatterns(paymentData);
      if (patternCheck.triggered) {
        totalScore += patternCheck.score;
        flags.push(patternCheck.flag);
      }

      return {
        score: Math.min(totalScore, 100),
        flags,
        blocked: blocked || totalScore >= 80,
        reason: blocked ? 'High fraud score' : null
      };
    } catch (error) {
      console.error('Fraud detection error:', error);
      return { score: 0, flags: [], blocked: false };
    }
  }

  async evaluateFraudRule(rule, paymentData) {
    const { conditions } = rule;
    let triggered = false;

    // Amount threshold check
    if (conditions.amountThreshold && paymentData.amount > conditions.amountThreshold) {
      triggered = true;
    }

    // IP blacklist check
    if (conditions.ipCheck?.enabled) {
      if (conditions.ipCheck.blacklistedIPs?.includes(paymentData.ipAddress)) {
        triggered = true;
      }
    }

    // Card fingerprint check
    if (conditions.cardCheck?.enabled && paymentData.cardFingerprint) {
      if (conditions.cardCheck.blacklistedCards?.includes(paymentData.cardFingerprint)) {
        triggered = true;
      }
    }

    return { triggered };
  }

  async checkVelocity(paymentData) {
    const timeWindow = 15; // minutes
    const maxTransactions = 5;

    const recentTransactions = await PaymentTransaction.countDocuments({
      userId: paymentData.userId,
      createdAt: {
        $gte: new Date(Date.now() - timeWindow * 60 * 1000)
      }
    });

    return {
      triggered: recentTransactions >= maxTransactions,
      score: recentTransactions >= maxTransactions ? 25 : 0,
      flag: {
        rule: 'velocity_check',
        score: 25,
        description: `${recentTransactions} transactions in ${timeWindow} minutes`
      }
    };
  }

  async checkSuspiciousPatterns(paymentData) {
    // Check for multiple failed attempts
    const failedAttempts = await PaymentTransaction.countDocuments({
      userId: paymentData.userId,
      status: 'failed',
      createdAt: {
        $gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
      }
    });

    return {
      triggered: failedAttempts >= 3,
      score: failedAttempts >= 3 ? 30 : 0,
      flag: {
        rule: 'failed_attempts',
        score: 30,
        description: `${failedAttempts} failed attempts in last hour`
      }
    };
  }

  async confirmPayment(transactionId, gatewayResponse) {
    try {
      const transaction = await PaymentTransaction.findById(transactionId);
      if (!transaction) throw new Error('Transaction not found');

      const isValidWebhook = await this.verifyWebhookSignature(transaction.gateway, gatewayResponse);
      if (!isValidWebhook) throw new Error('Invalid webhook signature');

      // Detect success based on multiple gateway response formats
      const isSuccess = (
        gatewayResponse.status === 'succeeded' || // Stripe
        gatewayResponse.status === 'captured' || // Razorpay
        gatewayResponse.status === 'COMPLETED' || // PayPal
        gatewayResponse.event === 'payment.captured' || // Razorpay event
        gatewayResponse.event_type === 'PAYMENT.CAPTURE.COMPLETED' // PayPal event
      );

      transaction.status = isSuccess ? 'completed' : 'failed';
      transaction.gatewayResponse = { ...transaction.gatewayResponse, ...gatewayResponse };
      transaction.webhookVerified = true;

      await transaction.save();

      if (transaction.status === 'completed') {
        const ParentOrder = (await import('../models/parentOrderModel.js')).default;
        const Order = (await import('../models/orderModel.js')).default;

        const parentOrder = await ParentOrder.findById(transaction.orderId);
        if (parentOrder) {
          parentOrder.isPaid = true;
          parentOrder.paidAt = new Date();
          parentOrder.paymentStatus = 'Completed';
          parentOrder.paymentResult = {
            id: transaction.gatewayTransactionId,
            status: transaction.status,
            update_time: new Date().toISOString()
          };
          await parentOrder.save();

          await Order.updateMany(
            { parentOrder: parentOrder._id },
            {
              isPaid: true,
              paidAt: new Date(),
              paymentStatus: 'Completed',
              paymentResult: parentOrder.paymentResult
            }
          );
        }
      }

      return transaction;
    } catch (error) {
      console.error('Payment confirmation failed:', error);
      throw error;
    }
  }

  async verifyWebhookSignature(gateway, payload) {
    switch (gateway) {
      case 'stripe':
        return this.verifyStripeWebhook(payload);
      case 'razorpay':
        return this.verifyRazorpayWebhook(payload);
      case 'paypal':
        return this.verifyPayPalWebhook(payload);
      default:
        return false;
    }
  }

  verifyStripeWebhook(payload) {
    const stripe = this.gateways.get('stripe');
    const signature = payload.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    try {
      stripe.webhooks.constructEvent(payload.body, signature, webhookSecret);
      return true;
    } catch (error) {
      console.error('Stripe webhook verification failed:', error);
      return false;
    }
  }

  verifyRazorpayWebhook(payload) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = payload.headers['x-razorpay-signature'];

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(payload.body))
      .digest('hex');

    return signature === expectedSignature;
  }

  async verifyPayPalWebhook(payload) {
    const gateway = await PaymentGateway.findOne({ name: 'paypal', isActive: true });
    if (!gateway) return false;

    try {
      const auth = Buffer.from(`${gateway.configuration.publicKey}:${gateway.configuration.secretKey}`).toString('base64');
      const response = await axios.post(
        `${gateway.configuration.environment === 'sandbox' ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com'}/v1/notifications/verify-webhook-signature`,
        {
          auth_algo: payload.headers['paypal-auth-algo'],
          cert_url: payload.headers['paypal-cert-url'],
          transmission_id: payload.headers['paypal-transmission-id'],
          transmission_sig: payload.headers['paypal-transmission-sig'],
          transmission_time: payload.headers['paypal-transmission-time'],
          webhook_id: gateway.configuration.webhookSecret,
          webhook_event: payload.body
        },
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.verification_status === 'SUCCESS';
    } catch (error) {
      console.error('PayPal webhook verification failed:', error.message);
      return false;
    }
  }

  async processRefund(transactionId, refundData) {
    try {
      const transaction = await PaymentTransaction.findById(transactionId);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.status !== 'completed') {
        throw new Error('Cannot refund incomplete transaction');
      }

      const { amount, reason } = refundData;
      let refundResponse;

      switch (transaction.gateway) {
        case 'stripe':
          refundResponse = await this.processStripeRefund(transaction, amount);
          break;
        case 'razorpay':
          refundResponse = await this.processRazorpayRefund(transaction, amount);
          break;
        case 'paypal':
          refundResponse = await this.processPayPalRefund(transaction, amount);
          break;
        default:
          throw new Error(`Refund not supported for gateway: ${transaction.gateway}`);
      }

      // Update transaction with refund information
      transaction.refunds.push({
        refundId: refundResponse.id,
        amount,
        reason,
        status: 'completed',
        processedAt: new Date()
      });

      // Update transaction status
      const totalRefunded = transaction.refunds.reduce((sum, refund) => sum + refund.amount, 0);
      if (totalRefunded >= transaction.amount) {
        transaction.status = 'refunded';
      } else {
        transaction.status = 'partially_refunded';
      }

      await transaction.save();

      return {
        refundId: refundResponse.id,
        amount,
        status: 'completed'
      };
    } catch (error) {
      console.error('Refund processing failed:', error);
      throw error;
    }
  }

  async processStripeRefund(transaction, amount) {
    const stripe = this.gateways.get('stripe');

    return await stripe.refunds.create({
      payment_intent: transaction.gatewayTransactionId,
      amount: Math.round(amount * 100)
    });
  }

  async processRazorpayRefund(transaction, amount) {
    const razorpay = this.gateways.get('razorpay');

    return await razorpay.payments.refund(transaction.gatewayTransactionId, {
      amount: Math.round(amount * 100)
    });
  }

  async processPayPalRefund(transaction, amount) {
    // PayPal refund logic
    return { id: 'paypal_refund_id' }; // Placeholder
  }

  async getPaymentMethods(country = 'IN') {
    try {
      const gateways = await PaymentGateway.find({
        isActive: true,
        countries: { $in: [country] }
      });

      const paymentMethods = [];

      for (const gateway of gateways) {
        const methods = gateway.supportedMethods.map(method => ({
          gateway: gateway.name,
          displayName: gateway.displayName,
          method,
          fees: gateway.fees,
          limits: gateway.limits
        }));
        paymentMethods.push(...methods);
      }

      return paymentMethods;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  }

  async getTransactionHistory(userId, options = {}) {
    const { page = 1, limit = 20, status, gateway } = options;

    const query = { userId };
    if (status) query.status = status;
    if (gateway) query.gateway = gateway;

    const transactions = await PaymentTransaction.find(query)
      .populate('orderId', 'orderNumber totalAmount')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-gatewayResponse.client_secret -cardDetails');

    const total = await PaymentTransaction.countDocuments(query);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}

export default PaymentService;