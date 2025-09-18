import { Server } from 'socket.io';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import { Shipment } from '../models/courierModel.js';

// Notification Service Class
class NotificationService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
  }
  
  // Initialize Socket.IO
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
      }
    });
    
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);
      
      // Handle user authentication
      socket.on('authenticate', (data) => {
        const { userId, role } = data;
        this.connectedUsers.set(userId, {
          socketId: socket.id,
          role: role,
          connectedAt: new Date()
        });
        
        // Join role-based rooms
        socket.join(`role_${role}`);
        socket.join(`user_${userId}`);
        
        console.log(`User ${userId} authenticated with role ${role}`);
      });
      
      // Handle order tracking subscription
      socket.on('subscribe_order', (orderId) => {
        socket.join(`order_${orderId}`);
        console.log(`Socket ${socket.id} subscribed to order ${orderId}`);
      });
      
      // Handle unsubscription
      socket.on('unsubscribe_order', (orderId) => {
        socket.leave(`order_${orderId}`);
        console.log(`Socket ${socket.id} unsubscribed from order ${orderId}`);
      });
      
      // Handle disconnection
      socket.on('disconnect', () => {
        // Remove user from connected users
        for (const [userId, userData] of this.connectedUsers.entries()) {
          if (userData.socketId === socket.id) {
            this.connectedUsers.delete(userId);
            break;
          }
        }
        console.log('User disconnected:', socket.id);
      });
    });
  }
  
  // Send order status update
  async sendOrderUpdate(orderId, updateData) {
    if (!this.io) return;
    
    try {
      const order = await Order.findById(orderId).populate('user', 'username email');
      if (!order) return;
      
      const notification = {
        type: 'order_update',
        orderId: orderId,
        orderNumber: order.orderNumber,
        status: updateData.status,
        message: updateData.message,
        timestamp: new Date(),
        data: updateData
      };
      
      // Send to customer
      this.io.to(`user_${order.user._id}`).emit('order_update', notification);
      
      // Send to order-specific room
      this.io.to(`order_${orderId}`).emit('order_update', notification);
      
      // Send to admins
      this.io.to('role_admin').emit('order_update', notification);
      
      // If it's a vendor order, send to vendor
      if (order.vendor) {
        this.io.to(`user_${order.vendor}`).emit('order_update', notification);
      }
      
      console.log(`Order update sent for order ${order.orderNumber}`);
    } catch (error) {
      console.error('Error sending order update:', error);
    }
  }
  
  // Send tracking update
  async sendTrackingUpdate(trackingNumber, trackingData) {
    if (!this.io) return;
    
    try {
      const shipment = await Shipment.findOne({ trackingNumber })
        .populate({
          path: 'order',
          populate: { path: 'user', select: 'username email' }
        });
        
      if (!shipment) return;
      
      const notification = {
        type: 'tracking_update',
        trackingNumber: trackingNumber,
        orderId: shipment.order._id,
        orderNumber: shipment.order.orderNumber,
        status: trackingData.status,
        location: trackingData.location,
        message: trackingData.message,
        timestamp: new Date(),
        estimatedDelivery: trackingData.estimatedDelivery
      };
      
      // Send to customer
      this.io.to(`user_${shipment.order.user._id}`).emit('tracking_update', notification);
      
      // Send to order-specific room
      this.io.to(`order_${shipment.order._id}`).emit('tracking_update', notification);
      
      console.log(`Tracking update sent for ${trackingNumber}`);
    } catch (error) {
      console.error('Error sending tracking update:', error);
    }
  }
  
  // Send delivery notification
  async sendDeliveryNotification(orderId, deliveryData) {
    if (!this.io) return;
    
    try {
      const order = await Order.findById(orderId).populate('user', 'username email');
      if (!order) return;
      
      const notification = {
        type: 'delivery_notification',
        orderId: orderId,
        orderNumber: order.orderNumber,
        message: 'Your order has been delivered!',
        deliveredAt: deliveryData.deliveredAt,
        signedBy: deliveryData.signedBy,
        timestamp: new Date()
      };
      
      // Send to customer
      this.io.to(`user_${order.user._id}`).emit('delivery_notification', notification);
      
      // Send to order-specific room
      this.io.to(`order_${orderId}`).emit('delivery_notification', notification);
      
      console.log(`Delivery notification sent for order ${order.orderNumber}`);
    } catch (error) {
      console.error('Error sending delivery notification:', error);
    }
  }
  
  // Send general notification
  async sendNotification(userId, notification) {
    if (!this.io) return;
    
    this.io.to(`user_${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date()
    });
  }
  
  // Broadcast to all connected users
  broadcastToAll(event, data) {
    if (!this.io) return;
    
    this.io.emit(event, {
      ...data,
      timestamp: new Date()
    });
  }
  
  // Broadcast to specific role
  broadcastToRole(role, event, data) {
    if (!this.io) return;
    
    this.io.to(`role_${role}`).emit(event, {
      ...data,
      timestamp: new Date()
    });
  }
  
  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }
  
  // Get connected users by role
  getConnectedUsersByRole(role) {
    return Array.from(this.connectedUsers.entries())
      .filter(([_, userData]) => userData.role === role)
      .map(([userId, _]) => userId);
  }
}

// SMS Notification Service
class SMSService {
  constructor() {
    this.apiKey = process.env.SMS_API_KEY;
    this.apiUrl = process.env.SMS_API_URL || 'https://api.textlocal.in/send/';
  }
  
  async sendSMS(phoneNumber, message, templateId = null) {
    try {
      if (!this.apiKey) {
        console.log('SMS API key not configured');
        return { status: 'failed', reason: 'SMS service not configured' };
      }
      
      // Here you would integrate with your SMS service (Twilio, TextLocal, etc.)
      // For now, we'll simulate the SMS sending
      console.log(`SMS sent to ${phoneNumber}: ${message}`);
      
      return {
        status: 'sent',
        messageId: Date.now().toString(),
        cost: 0.05 // Simulated cost
      };
    } catch (error) {
      console.error('SMS sending error:', error);
      return { status: 'failed', reason: error.message };
    }
  }
  
  // Order status SMS templates
  getOrderStatusMessage(orderNumber, status, trackingNumber = null) {
    const templates = {
      'Placed': `Your order ${orderNumber} has been placed successfully. We'll notify you once it's confirmed.`,
      'Confirmed': `Great news! Your order ${orderNumber} has been confirmed and is being prepared.`,
      'Packed': `Your order ${orderNumber} has been packed and is ready for shipment.`,
      'Shipped': `Your order ${orderNumber} has been shipped. Track it here: ${trackingNumber}`,
      'Out for Delivery': `Your order ${orderNumber} is out for delivery. It should arrive today!`,
      'Delivered': `Your order ${orderNumber} has been delivered. Thank you for shopping with us!`,
      'Cancelled': `Your order ${orderNumber} has been cancelled. Refund will be processed within 3-5 business days.`,
      'Returned': `Your return request for order ${orderNumber} has been processed.`
    };
    
    return templates[status] || `Your order ${orderNumber} status has been updated to ${status}.`;
  }
}

// Email Notification Service
class EmailService {
  constructor() {
    // Email service configuration would go here
    this.isConfigured = false;
  }
  
  async sendEmail(to, subject, htmlContent, templateId = null) {
    try {
      if (!this.isConfigured) {
        console.log('Email service not configured');
        return { status: 'failed', reason: 'Email service not configured' };
      }
      
      // Here you would integrate with your email service (SendGrid, Mailgun, etc.)
      console.log(`Email sent to ${to}: ${subject}`);
      
      return {
        status: 'sent',
        messageId: Date.now().toString()
      };
    } catch (error) {
      console.error('Email sending error:', error);
      return { status: 'failed', reason: error.message };
    }
  }
  
  // Generate order status email HTML
  generateOrderStatusEmail(order, status) {
    return `
      <h2>Order Status Update</h2>
      <p>Dear ${order.user.username},</p>
      <p>Your order <strong>${order.orderNumber}</strong> status has been updated to <strong>${status}</strong>.</p>
      <div style=\"border: 1px solid #ddd; padding: 15px; margin: 15px 0;\">
        <h3>Order Details:</h3>
        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p><strong>Total Amount:</strong> $${order.totalPrice}</p>
        <p><strong>Status:</strong> ${status}</p>
        ${order.tracking?.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.tracking.trackingNumber}</p>` : ''}
      </div>
      <p>Thank you for shopping with us!</p>
    `;
  }
}

// Main Notification Manager
class NotificationManager {
  constructor() {
    this.realTimeService = new NotificationService();
    this.smsService = new SMSService();
    this.emailService = new EmailService();
  }
  
  // Initialize all services
  initialize(server) {
    this.realTimeService.initialize(server);
  }
  
  // Send comprehensive order notification
  async sendOrderNotification(orderId, status, additionalData = {}) {
    try {
      const order = await Order.findById(orderId).populate('user', 'username email phone');
      if (!order) return;
      
      const updateData = {
        status: status,
        message: this.getStatusMessage(status),
        trackingNumber: order.tracking?.trackingNumber,
        ...additionalData
      };
      
      // Send real-time notification
      await this.realTimeService.sendOrderUpdate(orderId, updateData);
      
      // Send SMS if enabled
      if (order.notifications?.sms && order.user.phone) {
        const smsMessage = this.smsService.getOrderStatusMessage(
          order.orderNumber,
          status,
          order.tracking?.trackingNumber
        );
        
        const smsResult = await this.smsService.sendSMS(order.user.phone, smsMessage);
        
        // Log communication
        order.communications.push({
          type: 'sms',
          message: smsMessage,
          status: smsResult.status,
          sentAt: new Date()
        });
      }
      
      // Send email if enabled
      if (order.notifications?.email && order.user.email) {
        const emailContent = this.emailService.generateOrderStatusEmail(order, status);
        const emailResult = await this.emailService.sendEmail(
          order.user.email,
          `Order ${order.orderNumber} - Status Update`,
          emailContent
        );
        
        // Log communication
        order.communications.push({
          type: 'email',
          message: `Order status update email for ${status}`,
          status: emailResult.status,
          sentAt: new Date()
        });
      }
      
      await order.save();
      
    } catch (error) {
      console.error('Error sending order notification:', error);
    }
  }
  
  // Send tracking update notification
  async sendTrackingNotification(trackingNumber, trackingData) {
    await this.realTimeService.sendTrackingUpdate(trackingNumber, trackingData);
  }
  
  // Send delivery notification
  async sendDeliveryNotification(orderId, deliveryData) {
    await this.realTimeService.sendDeliveryNotification(orderId, deliveryData);
    
    // Also send order notification
    await this.sendOrderNotification(orderId, 'Delivered', deliveryData);
  }
  
  // Helper method to get status message
  getStatusMessage(status) {
    const messages = {
      'Placed': 'Your order has been placed successfully',
      'Confirmed': 'Your order has been confirmed',
      'Packed': 'Your order has been packed',
      'Shipped': 'Your order has been shipped',
      'Out for Delivery': 'Your order is out for delivery',
      'Delivered': 'Your order has been delivered',
      'Cancelled': 'Your order has been cancelled',
      'Returned': 'Your order return has been processed'
    };
    
    return messages[status] || `Order status updated to ${status}`;
  }
}

// Export singleton instance
const notificationManager = new NotificationManager();
export default notificationManager;