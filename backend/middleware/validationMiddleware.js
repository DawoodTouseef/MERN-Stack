import joi from 'joi';

// Payment request validation middleware
export const validatePaymentRequest = (req, res, next) => {
  const schema = joi.object({
    amount: joi.number().positive().required(),
    currency: joi.string().length(3).required(),
    gateway: joi.string().valid('stripe', 'razorpay', 'paypal', 'payu', 'instamojo', 'ccavenue', 'paytm').required(),
    paymentMethod: joi.string().valid('credit_card', 'debit_card', 'upi', 'net_banking', 'wallet', 'emi', 'international').required(),
    orderId: joi.string().required(),
    billingAddress: joi.object({
      street: joi.string().required(),
      city: joi.string().required(),
      state: joi.string().required(),
      postalCode: joi.string().required(),
      country: joi.string().length(2).required()
    }).required(),
    deviceFingerprint: joi.string().optional(),
    metadata: joi.object().optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};

// Refund request validation
export const validateRefundRequest = (req, res, next) => {
  const schema = joi.object({
    transactionId: joi.string().required(),
    amount: joi.number().positive().required(),
    reason: joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};

// Gateway configuration validation
export const validateGatewayConfig = (req, res, next) => {
  const schema = joi.object({
    name: joi.string().valid('stripe', 'razorpay', 'paypal', 'payu', 'instamojo', 'ccavenue', 'paytm').required(),
    displayName: joi.string().required(),
    isActive: joi.boolean().optional(),
    supportedMethods: joi.array().items(
      joi.string().valid('credit_card', 'debit_card', 'upi', 'net_banking', 'wallet', 'emi', 'international')
    ).required(),
    configuration: joi.object({
      merchantId: joi.string().optional(),
      secretKey: joi.string().optional(),
      publicKey: joi.string().optional(),
      webhookSecret: joi.string().optional(),
      environment: joi.string().valid('sandbox', 'production').optional()
    }).required(),
    fees: joi.object({
      domestic: joi.object({
        percentage: joi.number().min(0).max(100).optional(),
        fixed: joi.number().min(0).optional()
      }).optional(),
      international: joi.object({
        percentage: joi.number().min(0).max(100).optional(),
        fixed: joi.number().min(0).optional()
      }).optional()
    }).optional(),
    limits: joi.object({
      minimum: joi.number().min(0).optional(),
      maximum: joi.number().min(0).optional()
    }).optional(),
    supportedCurrencies: joi.array().items(joi.string().length(3)).optional(),
    countries: joi.array().items(joi.string().length(2)).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};

// Fraud rule validation
export const validateFraudRule = (req, res, next) => {
  const schema = joi.object({
    name: joi.string().required(),
    description: joi.string().optional(),
    isActive: joi.boolean().optional(),
    priority: joi.number().min(1).max(10).optional(),
    conditions: joi.object({
      amountThreshold: joi.number().min(0).optional(),
      velocityCheck: joi.object({
        enabled: joi.boolean().optional(),
        timeWindow: joi.number().min(1).optional(),
        maxTransactions: joi.number().min(1).optional()
      }).optional(),
      ipCheck: joi.object({
        enabled: joi.boolean().optional(),
        blacklistedIPs: joi.array().items(joi.string().ip()).optional(),
        geoLocation: joi.object({
          restrictedCountries: joi.array().items(joi.string().length(2)).optional()
        }).optional()
      }).optional(),
      cardCheck: joi.object({
        enabled: joi.boolean().optional(),
        blacklistedCards: joi.array().items(joi.string()).optional(),
        testCards: joi.boolean().optional()
      }).optional(),
      deviceCheck: joi.object({
        enabled: joi.boolean().optional(),
        maxDevicesPerUser: joi.number().min(1).optional()
      }).optional()
    }).required(),
    actions: joi.object({
      score: joi.number().min(1).max(100).required(),
      blockTransaction: joi.boolean().optional(),
      requireManualReview: joi.boolean().optional(),
      notifyAdmin: joi.boolean().optional()
    }).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};