// Security-enhanced error handling middleware
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Log errors for monitoring (but don't expose details to client)
  if (process.env.NODE_ENV === 'production') {
    console.error(`Error ${statusCode}: ${message}`, {
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      user: req.user?.id || 'anonymous',
      timestamp: new Date().toISOString()
    });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map(val => val.message);
    message = errors.join(', ');
  }

  // JWT errors - Don't expose internal details
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Authentication failed';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Session expired. Please log in again';
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File size exceeds limit';
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Invalid file upload';
  }

  // Rate limiting errors
  if (err.status === 429) {
    statusCode = 429;
    message = 'Too many requests. Please try again later';
  }

  // Database connection errors
  if (err.name === 'MongoNetworkError' || err.name === 'MongooseServerSelectionError') {
    statusCode = 503;
    message = 'Service temporarily unavailable';
  }

  // Security-related errors - Don't expose details
  if (err.message?.includes('CSRF') || err.message?.includes('csrf')) {
    statusCode = 403;
    message = 'Invalid request';
  }

  // Generic server errors - Don't expose internal details in production
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'Internal server error';
  }

  const response = {
    success: false,
    message,
    ...(statusCode === 429 && { retryAfter: err.retryAfter }),
    timestamp: new Date().toISOString()
  };

  // Only include stack trace and detailed error info in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.error = {
      name: err.name,
      message: err.message,
      code: err.code
    };
    response.requestInfo = {
      path: req.originalUrl,
      method: req.method,
      ip: req.ip
    };
  }

  res.status(statusCode).json(response);
};

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Security event logger
const logSecurityEvent = (eventType, details, req) => {
  const logEntry = {
    type: 'SECURITY_EVENT',
    event: eventType,
    details,
    ip: req?.ip,
    userAgent: req?.get('User-Agent'),
    timestamp: new Date().toISOString(),
    user: req?.user?.id || 'anonymous'
  };
  
  console.warn('Security Event:', JSON.stringify(logEntry));
  
  // In production, you might want to send this to a security monitoring service
  // Example: sendToSecurityService(logEntry);
};

export { notFound, errorHandler, asyncHandler, logSecurityEvent };