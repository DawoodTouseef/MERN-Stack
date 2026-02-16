import mongoose from 'mongoose';

const paymentGatewaySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['stripe', 'razorpay', 'paypal', 'payu', 'instamojo', 'ccavenue', 'paytm']
  },
  displayName: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  supportedMethods: [{
    type: String,
    enum: ['credit_card', 'debit_card', 'upi', 'net_banking', 'wallet', 'emi', 'international']
  }],
  configuration: {
    merchantId: String,
    secretKey: String,
    publicKey: String,
    webhookSecret: String,
    environment: {
      type: String,
      enum: ['sandbox', 'production'],
      default: 'sandbox'
    }
  },
  fees: {
    domestic: {
      percentage: { type: Number, default: 2.5 },
      fixed: { type: Number, default: 0 }
    },
    international: {
      percentage: { type: Number, default: 3.5 },
      fixed: { type: Number, default: 0 }
    }
  },
  limits: {
    minimum: { type: Number, default: 1 },
    maximum: { type: Number, default: 500000 }
  },
  supportedCurrencies: [{
    type: String,
    default: ['INR', 'USD', 'EUR', 'GBP']
  }],
  countries: [{
    type: String,
    default: ['IN', 'US', 'GB', 'CA', 'AU']
  }]
}, {
  timestamps: true
});

const PaymentGateway = mongoose.model('PaymentGateway', paymentGatewaySchema);

const paymentTransactionSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gateway: {
    type: String,
    required: true
  },
  gatewayTransactionId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'INR'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'upi', 'net_banking', 'wallet', 'emi', 'international'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  failureReason: String,
  refunds: [{
    refundId: String,
    amount: Number,
    reason: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed']
    },
    processedAt: Date,
    createdAt: { type: Date, default: Date.now }
  }],
  fraudScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  fraudFlags: [{
    rule: String,
    score: Number,
    description: String
  }],
  ipAddress: String,
  userAgent: String,
  deviceFingerprint: String,
  billingAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  cardDetails: {
    last4: String,
    brand: String,
    country: String,
    fingerprint: String
  },
  webhookVerified: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for efficient queries
paymentTransactionSchema.index({ orderId: 1 });
paymentTransactionSchema.index({ userId: 1 });
paymentTransactionSchema.index({ gatewayTransactionId: 1 });
paymentTransactionSchema.index({ status: 1 });
paymentTransactionSchema.index({ createdAt: -1 });

const PaymentTransaction = mongoose.model('PaymentTransaction', paymentTransactionSchema);

// Fraud Detection Rule Schema
const fraudRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 1
  },
  conditions: {
    amountThreshold: Number,
    velocityCheck: {
      enabled: Boolean,
      timeWindow: Number, // minutes
      maxTransactions: Number
    },
    ipCheck: {
      enabled: Boolean,
      blacklistedIPs: [String],
      geoLocation: {
        restrictedCountries: [String]
      }
    },
    cardCheck: {
      enabled: Boolean,
      blacklistedCards: [String],
      testCards: Boolean
    },
    deviceCheck: {
      enabled: Boolean,
      maxDevicesPerUser: Number
    }
  },
  actions: {
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    blockTransaction: {
      type: Boolean,
      default: false
    },
    requireManualReview: {
      type: Boolean,
      default: false
    },
    notifyAdmin: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

const FraudRule = mongoose.model('FraudRule', fraudRuleSchema);

export { PaymentGateway, PaymentTransaction, FraudRule };