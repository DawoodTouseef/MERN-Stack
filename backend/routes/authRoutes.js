import express from 'express';
import {
  sendEmailVerification,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  resendVerificationEmail,
  getVerificationStatus
} from '../controllers/authController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import {
  validatePasswordReset,
  validatePasswordChange,
  handleValidationErrors
} from '../middlewares/validationMiddleware.js';
import {
  authLimiter,
  passwordResetLimiter
} from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

// Email verification routes
router.post('/send-verification', authenticate, sendEmailVerification);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', authLimiter, resendVerificationEmail);
router.get('/verification-status', authenticate, getVerificationStatus);

// Password reset routes
router.post('/forgot-password', passwordResetLimiter, validatePasswordReset, forgotPassword);
router.post('/reset-password', validatePasswordChange, resetPassword);

// Password change route (for authenticated users)
router.post('/change-password', authenticate, changePassword);

export default router;