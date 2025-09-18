import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
    this.userSockets = new Map(); // socketId -> userId
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.io.use(this.authenticateSocket.bind(this));
    this.io.on('connection', this.handleConnection.bind(this));

    console.log('Socket.io service initialized');
  }

  // Authenticate socket connection
  async authenticateSocket(socket, next) {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'admin123');
      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      socket.user = user;
      
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  }

  // Handle new socket connection
  handleConnection(socket) {
    const userId = socket.userId;
    
    // Store user connection
    this.connectedUsers.set(userId, socket.id);
    this.userSockets.set(socket.id, userId);

    console.log(`User ${userId} connected with socket ${socket.id}`);

    // Join user to their personal room
    socket.join(`user_${userId}`);

    // Join admin users to admin room
    if (socket.userRole === 'admin') {
      socket.join('admin_room');
    }

    // Join vendors to vendor room
    if (socket.userRole === 'vendor' || socket.userRole === 'seller') {
      socket.join('vendor_room');
    }

    // Send connection confirmation
    socket.emit('connected', {
      message: 'Connected to real-time notifications',
      userId: userId,
      role: socket.userRole
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      this.handleDisconnection(socket);
    });

    // Handle custom events
    this.setupEventHandlers(socket);
  }

  // Handle socket disconnection
  handleDisconnection(socket) {
    const userId = this.userSockets.get(socket.id);
    
    if (userId) {
      this.connectedUsers.delete(userId);
      this.userSockets.delete(socket.id);
      console.log(`User ${userId} disconnected`);
    }
  }

  // Setup custom event handlers
  setupEventHandlers(socket) {
    // Handle user typing in chat (future feature)
    socket.on('typing', (data) => {
      socket.broadcast.emit('user_typing', {
        userId: socket.userId,
        username: socket.user.username,
        ...data
      });
    });

    // Handle user status updates
    socket.on('status_update', (status) => {
      socket.broadcast.emit('user_status_changed', {
        userId: socket.userId,
        status: status
      });
    });

    // Handle admin broadcast
    socket.on('admin_broadcast', (data) => {
      if (socket.userRole === 'admin') {
        this.broadcastToAll('admin_announcement', {
          message: data.message,
          timestamp: new Date(),
          from: 'Admin'
        });
      }
    });
  }

  // Notification methods

  // Send notification to specific user
  notifyUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId.toString());
    if (socketId && this.io) {
      this.io.to(socketId).emit(event, {
        ...data,
        timestamp: new Date(),
        read: false
      });
    }
  }

  // Send notification to multiple users
  notifyUsers(userIds, event, data) {
    userIds.forEach(userId => {
      this.notifyUser(userId, event, data);
    });
  }

  // Broadcast to all connected users
  broadcastToAll(event, data) {
    if (this.io) {
      this.io.emit(event, {
        ...data,
        timestamp: new Date()
      });
    }
  }

  // Send notification to all admins
  notifyAdmins(event, data) {
    if (this.io) {
      this.io.to('admin_room').emit(event, {
        ...data,
        timestamp: new Date()
      });
    }
  }

  // Send notification to all vendors
  notifyVendors(event, data) {
    if (this.io) {
      this.io.to('vendor_room').emit(event, {
        ...data,
        timestamp: new Date()
      });
    }
  }

  // Order-related notifications
  notifyOrderCreated(order) {
    // Notify customer
    this.notifyUser(order.user, 'order_created', {
      type: 'order',
      title: 'Order Placed Successfully',
      message: `Your order #${order._id} has been placed successfully`,
      orderId: order._id,
      amount: order.totalPrice
    });

    // Notify admins
    this.notifyAdmins('new_order', {
      type: 'order',
      title: 'New Order Received',
      message: `New order #${order._id} received`,
      orderId: order._id,
      customer: order.user,
      amount: order.totalPrice
    });
  }

  notifyOrderStatusUpdate(order, oldStatus, newStatus) {
    // Notify customer
    this.notifyUser(order.user, 'order_status_updated', {
      type: 'order',
      title: 'Order Status Updated',
      message: `Your order #${order._id} status changed from ${oldStatus} to ${newStatus}`,
      orderId: order._id,
      oldStatus,
      newStatus
    });

    // If order is delivered, send special notification
    if (newStatus === 'delivered') {
      this.notifyUser(order.user, 'order_delivered', {
        type: 'order',
        title: 'Order Delivered!',
        message: `Your order #${order._id} has been delivered successfully`,
        orderId: order._id
      });
    }
  }

  // Product-related notifications
  notifyProductLowStock(product) {
    this.notifyAdmins('product_low_stock', {
      type: 'inventory',
      title: 'Low Stock Alert',
      message: `Product "${product.name}" is running low on stock (${product.countInStock} remaining)`,
      productId: product._id,
      productName: product.name,
      stock: product.countInStock
    });
  }

  notifyProductOutOfStock(product) {
    this.notifyAdmins('product_out_of_stock', {
      type: 'inventory',
      title: 'Out of Stock Alert',
      message: `Product "${product.name}" is out of stock`,
      productId: product._id,
      productName: product.name
    });
  }

  // User-related notifications
  notifyNewUserRegistration(user) {
    this.notifyAdmins('new_user_registered', {
      type: 'user',
      title: 'New User Registration',
      message: `New user "${user.username}" has registered`,
      userId: user._id,
      username: user.username,
      email: user.email
    });
  }

  notifyPasswordReset(userId) {
    this.notifyUser(userId, 'password_reset_success', {
      type: 'security',
      title: 'Password Reset Successful',
      message: 'Your password has been reset successfully'
    });
  }

  notifyEmailVerified(userId) {
    this.notifyUser(userId, 'email_verified', {
      type: 'account',
      title: 'Email Verified',
      message: 'Your email has been verified successfully'
    });
  }

  // Payment-related notifications
  notifyPaymentSuccess(order) {
    this.notifyUser(order.user, 'payment_success', {
      type: 'payment',
      title: 'Payment Successful',
      message: `Payment for order #${order._id} was successful`,
      orderId: order._id,
      amount: order.totalPrice
    });
  }

  notifyPaymentFailed(userId, orderId, amount) {
    this.notifyUser(userId, 'payment_failed', {
      type: 'payment',
      title: 'Payment Failed',
      message: `Payment for order #${orderId} failed. Please try again.`,
      orderId,
      amount
    });
  }

  // Review-related notifications
  notifyNewReview(productId, review) {
    this.notifyAdmins('new_review', {
      type: 'review',
      title: 'New Product Review',
      message: `New review received for product`,
      productId,
      reviewId: review._id,
      rating: review.rating
    });
  }

  // System notifications
  notifySystemMaintenance(message, scheduledTime) {
    this.broadcastToAll('system_maintenance', {
      type: 'system',
      title: 'System Maintenance',
      message,
      scheduledTime
    });
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Get connected users by role
  getConnectedUsersByRole(role) {
    const users = [];
    this.userSockets.forEach((userId, socketId) => {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket && socket.userRole === role) {
        users.push({
          userId,
          socketId,
          username: socket.user.username
        });
      }
    });
    return users;
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.connectedUsers.has(userId.toString());
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;