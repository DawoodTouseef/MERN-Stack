import asyncHandler from '../middlewares/asyncHandler.js';
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import {
  generateVerificationToken,
  generatePasswordResetToken,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
} from '../services/emailService.js';

// @desc    Send email verification
// @route   POST /api/auth/send-verification
// @access  Private
export const sendEmailVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.emailVerified) {
    return res.status(400).json({
      success: false,
      message: 'Email is already verified'
    });
  }

  // Generate verification token
  const verificationToken = generateVerificationToken();
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Save token to user
  user.emailVerificationToken = verificationToken;
  user.emailVerificationExpires = verificationExpires;
  await user.save();

  try {
    // Send verification email
    const emailResult = await sendVerificationEmail(
      user.email,
      user.username,
      verificationToken
    );

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully',
      previewUrl: emailResult.previewUrl // Only for development
    });
  } catch (error) {
    // Clear token if email fails
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(500);
    throw new Error('Failed to send verification email');
  }
});

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    res.status(400);
    throw new Error('Verification token is required');
  }

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired verification token');
  }

  // Verify email
  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  // Send welcome email (non-blocking)
  sendWelcomeEmail(user.email, user.username).catch(error => {
    console.error('Failed to send welcome email:', error);
  });

  res.status(200).json({
    success: true,
    message: 'Email verified successfully'
  });
});

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    // Don't reveal if user exists or not for security
    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    });
  }

  // Generate reset token
  const resetToken = generatePasswordResetToken();
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Save token to user
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = resetExpires;
  await user.save();

  try {
    // Send password reset email
    await sendPasswordResetEmail(
      user.email,
      user.username,
      resetToken
    );

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    });
  } catch (error) {
    // Clear token if email fails
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(500);
    throw new Error('Failed to send password reset email');
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    res.status(400);
    throw new Error('Token and new password are required');
  }

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Update password and clear reset token
  user.password = hashedPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.loginAttempts = 0; // Reset login attempts
  user.lockUntil = undefined; // Clear any account locks
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successfully'
  });
});

// @desc    Change password (authenticated user)
// @route   POST /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Current password and new password are required');
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isCurrentPasswordValid) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update password
  user.password = hashedPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists and is unverified, a verification email has been sent'
    });
  }

  if (user.emailVerified) {
    return res.status(400).json({
      success: false,
      message: 'Email is already verified'
    });
  }

  // Generate new verification token
  const verificationToken = generateVerificationToken();
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Save token to user
  user.emailVerificationToken = verificationToken;
  user.emailVerificationExpires = verificationExpires;
  await user.save();

  try {
    // Send verification email
    await sendVerificationEmail(
      user.email,
      user.username,
      verificationToken
    );

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists and is unverified, a verification email has been sent'
    });
  } catch (error) {
    // Clear token if email fails
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(500);
    throw new Error('Failed to send verification email');
  }
});

// @desc    Check email verification status
// @route   GET /api/auth/verification-status
// @access  Private
export const getVerificationStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('emailVerified email');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    success: true,
    data: {
      email: user.email,
      emailVerified: user.emailVerified
    }
  });
});