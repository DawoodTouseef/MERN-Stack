import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import opencage from "opencage-api-client";
import axios from "axios";
import cors from 'cors';
import { createServer } from 'http';

// Security imports
import { securityMiddleware, createRateLimiters, sanitizeInput, requestSizeLimits } from './middlewares/securityMiddleware.js';

// Utiles
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import productQARoutes from "./routes/productQARoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import AdressRoutes from "./routes/addressRoutes.js";
import BrandRoutes from "./routes/brandRoutes.js";
import TaxRoutes from './routes/taxRoutes.js';
import CourierRoutes from './routes/courierRoutes.js';
import AnalyticsRoutes from './routes/analyticsRoutes.js';
import TestRoutes from './routes/testRoutes.js';
import BannerRoutes from "./routes/bannerRoutes.js";
import OfferRoutes from './routes/offerRoutes.js'
import authRoutes from './routes/authRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import dynamicPricingRoutes from './routes/dynamicPricingRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import currencyRoutes from './routes/currencyRoutes.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';
import notificationManager from './services/notificationService.js';
import taxServiceManager from './services/thirdPartyTaxService.js';
import socketService from './services/socketService.js';
import { authenticate, authorizeVendor } from './middlewares/authMiddleware.js';
dotenv.config();

// Validate critical environment variables
if (process.env.NODE_ENV === 'production') {
  const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URL'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }
  
  if (process.env.JWT_SECRET === 'admin123') {
    console.error('❌ JWT_SECRET cannot use default value in production');
    process.exit(1);
  }
}
const port = process.env.PORT || 5501;
const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY || '';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';
const EXCHANGE_API_DOMAIN = process.env.EXCHANGE_API_DOMAIN || '';

connectDB();

const app = express();
const server = createServer(app);

// Apply security middleware first
securityMiddleware(app);

// Create rate limiters
const { generalLimiter, authLimiter, passwordResetLimiter, uploadLimiter } = createRateLimiters();
console.log(`Frontend URL: ${process.env.FRONTEND_URL}`)
// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://mern-stack-two-psi.vercel.app']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-CSRF-Token'],
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight OPTIONS requests for all routes
app.options('*', cors(corsOptions));

// Body parsing with size limits
app.use(express.json({ limit: requestSizeLimits.json }));
app.use(express.urlencoded({ extended: true, limit: requestSizeLimits.urlencoded }));
app.use(cookieParser());

// Apply input sanitization
app.use(sanitizeInput);

// Apply general rate limiting
app.use(generalLimiter);

// Routes with specific rate limiting
app.use("/api/users", userRoutes);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/products", productQARoutes);
app.use("/api/upload", uploadLimiter, uploadRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/address", AdressRoutes);
app.use("/api/brands", BrandRoutes);
app.use('/api/tax', TaxRoutes);
app.use('/api/courier', CourierRoutes);
app.use('/api/analytics', AnalyticsRoutes);
app.use('/api/test', TestRoutes);
app.use('/api/banner', BannerRoutes);
app.use('/api/offer', OfferRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/pricing', dynamicPricingRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/currencies', currencyRoutes);
// app.use('/api/payments', paymentRoutes); // Temporarily disabled for testing

// Security headers for config endpoints
app.get("/api/config/paypal", (req, res) => {
  res.json({ clientId: process.env.PAYPAL_CLIENT_ID });
});

app.get('/api/config/exchange', (req, res) => {
  res.json({ apikey: process.env.EXCHANGE_API_KEY });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    message: 'Vendor dashboard API is running'
  });
});

// Vendor health check endpoint
app.get('/api/vendors/health', authenticate, authorizeVendor, (req, res) => {
  res.status(200).json({
    status: 'OK',
    user: {
      id: req.user._id,
      username: req.user.username,
      role: req.user.role,
      vendorVerified: req.user.vendorVerified,
      status: req.user.status
    },
    timestamp: new Date().toISOString(),
    message: 'Vendor API access is working correctly'
  });
});

// Serve static files securely
const path = await import('path');
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname + "/uploads"), {
  maxAge: '1d', // Cache for 1 day
  setHeaders: (res, filePath) => {
    // Set security headers for static files
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
  }
}));

// Serve frontend static files in production
/**
 * if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.resolve(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(frontendBuildPath));
  
  // Serve index.html for all routes to support client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(frontendBuildPath, 'index.html'));
  });
}
 */

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Initialize Socket.io
socketService.initialize(server);

server.listen(port, async () => {
  console.log(`Server running on port: ${port}`);
  
  // Initialize notification service with the server
  notificationManager.initialize(server);
  console.log('Real-time notification service initialized');
  
  // Initialize tax service manager
  try {
    await taxServiceManager.initialize();
    console.log('Tax service manager initialized');
  } catch (error) {
    console.log('Tax service initialization warning:', error.message);
  }
});