import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';

// Advanced security middleware configuration
export const securityMiddleware = (app) => {
  // Helmet for security headers - but don't override CORS headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "https://api.paypal.com", "https://www.paypal.com", "https://mern-stack-two-psi.vercel.app"],
        frameSrc: ["'self'", "https://www.paypal.com"],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow embedding for payment iframes
    crossOriginResourcePolicy: { policy: "cross-origin" } // Allow cross-origin requests
  }));

  // Prevent NoSQL injection attacks
  app.use(mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      console.warn(`Potential NoSQL injection attempt detected on key: ${key}`);
    },
  }));

  // Prevent HTTP Parameter Pollution
  app.use(hpp({
    whitelist: ['tags', 'categories', 'colors', 'sizes'] // Allow arrays for these parameters
  }));

  // Additional security headers - but don't override CORS headers
  app.use((req, res, next) => {
    // Prevent MIME type sniffing
    if (!res.headersSent && !res.getHeader('Access-Control-Allow-Origin')) {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
    
    // Prevent framing (clickjacking protection) - but allow same origin
    if (!res.headersSent && !res.getHeader('Access-Control-Allow-Origin')) {
      res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    }
    
    // Enable XSS filtering
    if (!res.headersSent && !res.getHeader('Access-Control-Allow-Origin')) {
      res.setHeader('X-XSS-Protection', '1; mode=block');
    }
    
    // Referrer policy
    if (!res.headersSent && !res.getHeader('Access-Control-Allow-Origin')) {
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    }
    
    // Feature policy
    if (!res.headersSent && !res.getHeader('Access-Control-Allow-Origin')) {
      res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    }
    
    next();
  });
};

// Enhanced rate limiting configurations
export const createRateLimiters = () => {
  // General API rate limiter
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.round(req.rateLimit.resetTime / 1000)
      });
    }
  });

  // Strict rate limiter for authentication
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per windowMs
    message: {
      success: false,
      message: 'Too many authentication attempts. Please try again later.',
      retryAfter: '15 minutes'
    },
    skipSuccessfulRequests: true,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: 'Too many authentication attempts. Account temporarily locked.',
        retryAfter: Math.round(req.rateLimit.resetTime / 1000)
      });
    }
  });

  // Password reset rate limiter
  const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 password reset attempts per hour
    message: {
      success: false,
      message: 'Too many password reset attempts. Please try again later.',
      retryAfter: '1 hour'
    }
  });

  // File upload rate limiter
  const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 file uploads per 15 minutes
    message: {
      success: false,
      message: 'Too many file uploads. Please try again later.',
      retryAfter: '15 minutes'
    }
  });

  return {
    generalLimiter,
    authLimiter,
    passwordResetLimiter,
    uploadLimiter
  };
};

// Input sanitization middleware
export const sanitizeInput = (req, res, next) => {
  // Recursively sanitize all string inputs
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Remove potentially dangerous characters but preserve legitimate content
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
          .replace(/javascript:/gi, '') // Remove javascript: protocol
          .replace(/on\w+\s*=/gi, '') // Remove event handlers
          .trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) sanitizeObject(req.body);
  if (req.params) sanitizeObject(req.params);
  if (req.query) sanitizeObject(req.query);

  next();
};

// CSRF protection middleware
export const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF for API endpoints that use bearer tokens
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return next();
  }

  // For cookie-based authentication, check CSRF token
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const cookieToken = req.cookies['csrf-token'];

  if (!token || !cookieToken || token !== cookieToken) {
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token'
    });
  }

  next();
};

// Request size limiting
export const requestSizeLimits = {
  general: '10mb',
  fileUpload: '50mb',
  json: '1mb',
  urlencoded: '1mb'
};