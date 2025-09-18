import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Email transporter configuration
const createTransporter = () => {
  // For development, use Ethereal Email (fake SMTP service)
  // For production, configure with real SMTP service (Gmail, SendGrid, etc.)
  
  if (process.env.NODE_ENV === 'production') {
    // Production email configuration
    return nodemailer.createTransporter({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  } else {
    // Development configuration with Ethereal Email
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.ETHEREAL_EMAIL || 'ethereal.user@ethereal.email',
        pass: process.env.ETHEREAL_PASSWORD || 'ethereal.pass'
      }
    });
  }
};

// Generate verification token
export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate password reset token
export const generatePasswordResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send verification email
export const sendVerificationEmail = async (email, username, verificationToken) => {
  try {
    const transporter = createTransporter();
    
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: `"NexusMart" <${process.env.EMAIL_FROM || 'noreply@nexusmart.com'}>`,
      to: email,
      subject: 'Verify Your Email Address - NexusMart',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to NexusMart!</h1>
            </div>
            <div class="content">
              <h2>Hello ${username},</h2>
              <p>Thank you for registering with NexusMart. To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">${verificationUrl}</p>
              
              <p><strong>Important:</strong> This verification link will expire in 24 hours for security reasons.</p>
              
              <p>If you didn't create an account with NexusMart, please ignore this email.</p>
              
              <p>Best regards,<br>The NexusMart Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 NexusMart. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to NexusMart!
        
        Hello ${username},
        
        Thank you for registering with NexusMart. To complete your registration and activate your account, please verify your email address by visiting this link:
        
        ${verificationUrl}
        
        This verification link will expire in 24 hours for security reasons.
        
        If you didn't create an account with NexusMart, please ignore this email.
        
        Best regards,
        The NexusMart Team
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return {
      success: true,
      messageId: info.messageId,
      previewUrl: process.env.NODE_ENV !== 'production' ? nodemailer.getTestMessageUrl(info) : null
    };
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, username, resetToken) => {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"NexusMart" <${process.env.EMAIL_FROM || 'noreply@nexusmart.com'}>`,
      to: email,
      subject: 'Password Reset Request - NexusMart',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #ff6b6b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello ${username},</h2>
              <p>We received a request to reset your password for your NexusMart account. If you made this request, click the button below to reset your password:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">${resetUrl}</p>
              
              <div class="warning">
                <strong>Security Notice:</strong>
                <ul>
                  <li>This password reset link will expire in 1 hour for security reasons.</li>
                  <li>If you didn't request a password reset, please ignore this email.</li>
                  <li>Your password will remain unchanged until you create a new one.</li>
                </ul>
              </div>
              
              <p>If you continue to have problems, please contact our support team.</p>
              
              <p>Best regards,<br>The NexusMart Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 NexusMart. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Reset Request
        
        Hello ${username},
        
        We received a request to reset your password for your NexusMart account. If you made this request, visit this link to reset your password:
        
        ${resetUrl}
        
        This password reset link will expire in 1 hour for security reasons.
        
        If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
        
        Best regards,
        The NexusMart Team
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return {
      success: true,
      messageId: info.messageId,
      previewUrl: process.env.NODE_ENV !== 'production' ? nodemailer.getTestMessageUrl(info) : null
    };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Send welcome email after verification
export const sendWelcomeEmail = async (email, username) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"NexusMart" <${process.env.EMAIL_FROM || 'noreply@nexusmart.com'}>`,
      to: email,
      subject: 'Welcome to NexusMart - Account Verified!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to NexusMart</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #2ecc71; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .features { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to NexusMart!</h1>
            </div>
            <div class="content">
              <h2>Hello ${username},</h2>
              <p>Congratulations! Your email has been successfully verified and your NexusMart account is now active.</p>
              
              <div class="features">
                <h3>What you can do now:</h3>
                <ul>
                  <li>🛍️ Browse thousands of products</li>
                  <li>🛒 Add items to your cart and wishlist</li>
                  <li>💳 Secure checkout with multiple payment options</li>
                  <li>📦 Track your orders in real-time</li>
                  <li>⭐ Rate and review products</li>
                  <li>🎯 Get personalized recommendations</li>
                </ul>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">Start Shopping</a>
              </div>
              
              <p>If you have any questions or need assistance, our customer support team is here to help.</p>
              
              <p>Happy shopping!<br>The NexusMart Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 NexusMart. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to NexusMart!
        
        Hello ${username},
        
        Congratulations! Your email has been successfully verified and your NexusMart account is now active.
        
        What you can do now:
        - Browse thousands of products
        - Add items to your cart and wishlist
        - Secure checkout with multiple payment options
        - Track your orders in real-time
        - Rate and review products
        - Get personalized recommendations
        
        Start shopping: ${process.env.FRONTEND_URL || 'http://localhost:3000'}
        
        If you have any questions or need assistance, our customer support team is here to help.
        
        Happy shopping!
        The NexusMart Team
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error for welcome email as it's not critical
    return { success: false, error: error.message };
  }
};