import rateLimit from 'express-rate-limit';

// General API rate limiting
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

// Strict rate limiting for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after 15 minutes.',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many login attempts from this IP, please try again after 15 minutes.',
      retryAfter: '15 minutes'
    });
  }
});

// Password reset rate limiting
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    success: false,
    message: 'Too many password reset attempts from this IP, please try again after 1 hour.',
    retryAfter: '1 hour'
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many password reset attempts from this IP, please try again after 1 hour.',
      retryAfter: '1 hour'
    });
  }
});

// File upload rate limiting
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 file uploads per hour
  message: {
    success: false,
    message: 'Too many file uploads from this IP, please try again after 1 hour.',
    retryAfter: '1 hour'
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many file uploads from this IP, please try again after 1 hour.',
      retryAfter: '1 hour'
    });
  }
});

// Search rate limiting
export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 search requests per minute
  message: {
    success: false,
    message: 'Too many search requests from this IP, please try again after 1 minute.',
    retryAfter: '1 minute'
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many search requests from this IP, please try again after 1 minute.',
      retryAfter: '1 minute'
    });
  }
});

// Admin operations rate limiting
export const adminLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // Limit each IP to 50 admin requests per 5 minutes
  message: {
    success: false,
    message: 'Too many admin requests from this IP, please try again after 5 minutes.',
    retryAfter: '5 minutes'
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many admin requests from this IP, please try again after 5 minutes.',
      retryAfter: '5 minutes'
    });
  }
});

// Order creation rate limiting
export const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 order creations per hour
  message: {
    success: false,
    message: 'Too many order attempts from this IP, please try again after 1 hour.',
    retryAfter: '1 hour'
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many order attempts from this IP, please try again after 1 hour.',
      retryAfter: '1 hour'
    });
  }
});

// Registration rate limiting
export const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 registration attempts per hour
  message: {
    success: false,
    message: 'Too many registration attempts from this IP, please try again after 1 hour.',
    retryAfter: '1 hour'
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many registration attempts from this IP, please try again after 1 hour.',
      retryAfter: '1 hour'
    });
  }
});

// Create a custom rate limiter factory
export const createCustomLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
      retryAfter: `${Math.ceil(windowMs / 60000)} minutes`
    },
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message,
        retryAfter: `${Math.ceil(windowMs / 60000)} minutes`
      });
    }
  });
};