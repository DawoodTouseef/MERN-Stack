import { body, param, query, validationResult } from 'express-validator';
import joi from 'joi';

// Validation error handler
export const handleValidationErrors = (req, res, next) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validationErrors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// User validation rules
export const validateUserRegistration = [
  body('username')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Username must be between 2 and 50 characters')
    .matches(/^[a-zA-Z0-9_\s]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('role')
    .optional()
    .isIn(['customer', 'vendor', 'seller', 'admin'])
    .withMessage('Invalid role specified'),
  
  handleValidationErrors
];

export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

export const validateUserUpdate = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Username must be between 2 and 50 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  
  handleValidationErrors
];

// Product validation rules
export const validateProduct = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('countInStock')
    .isInt({ min: 0 })
    .withMessage('Stock count must be a non-negative integer'),
  
  body('category')
    .isMongoId()
    .withMessage('Invalid category ID'),
  
  body('brand')
    .optional()
    .isMongoId()
    .withMessage('Invalid brand ID'),
  
  handleValidationErrors
];

// Order validation rules
export const validateOrder = [
  body('orderItems')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  
  body('orderItems.*.product')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('orderItems.*.qty')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  
  body('shippingAddress.address')
    .trim()
    .notEmpty()
    .withMessage('Shipping address is required'),
  
  body('shippingAddress.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  
  body('shippingAddress.postalCode')
    .trim()
    .notEmpty()
    .withMessage('Postal code is required'),
  
  body('shippingAddress.country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
  
  body('paymentMethod')
    .isIn(['PayPal', 'Stripe', 'CashOnDelivery'])
    .withMessage('Invalid payment method'),
  
  handleValidationErrors
];

// Category validation rules
export const validateCategory = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  handleValidationErrors
];

// Brand validation rules
export const validateBrand = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Brand name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  handleValidationErrors
];

// Address validation rules
export const validateAddress = [
  body('street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  
  body('state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State cannot exceed 100 characters'),
  
  body('postalCode')
    .trim()
    .notEmpty()
    .withMessage('Postal code is required'),
  
  body('country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
  
  handleValidationErrors
];

// MongoDB ObjectId validation
export const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName}`),
  
  handleValidationErrors
];

// Pagination validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

// File upload validation
export const validateFileUpload = (req, res, next) => {
  if (!req.file && !req.files) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }
  
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  const file = req.file || (req.files && req.files[0]);
  
  if (!allowedTypes.includes(file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type. Only JPEG, JPG, PNG, and WebP are allowed'
    });
  }
  
  if (file.size > maxSize) {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 5MB'
    });
  }
  
  next();
};

// Password reset validation
export const validatePasswordReset = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  handleValidationErrors
];

export const validatePasswordChange = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  handleValidationErrors
];

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