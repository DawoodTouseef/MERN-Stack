import asyncHandler from '../middlewares/asyncHandler.js';
import socketService from '../services/socketService.js';

// @desc    Get notification status
// @route   GET /api/notifications/status
// @access  Private
export const getNotificationStatus = asyncHandler(async (req, res) => {
  const isOnline = socketService.isUserOnline(req.user._id);
  const connectedUsersCount = socketService.getConnectedUsersCount();
  
  res.status(200).json({
    success: true,
    data: {
      isOnline,
      connectedUsersCount,
      userId: req.user._id,
      role: req.user.role
    }
  });
});

// @desc    Send test notification
// @route   POST /api/notifications/test
// @access  Private (Admin only)
export const sendTestNotification = asyncHandler(async (req, res) => {
  const { message, type = 'info' } = req.body;

  if (!message) {
    res.status(400);
    throw new Error('Message is required');
  }

  // Send test notification to the requesting user
  socketService.notifyUser(req.user._id, 'test_notification', {
    type,
    title: 'Test Notification',
    message,
    from: 'System'
  });

  res.status(200).json({
    success: true,
    message: 'Test notification sent successfully'
  });
});

// @desc    Broadcast admin announcement
// @route   POST /api/notifications/admin/broadcast
// @access  Private (Admin only)
export const broadcastAdminAnnouncement = asyncHandler(async (req, res) => {
  const { message, title = 'Admin Announcement' } = req.body;

  if (!message) {
    res.status(400);
    throw new Error('Message is required');
  }

  // Broadcast to all connected users
  socketService.broadcastToAll('admin_announcement', {
    type: 'announcement',
    title,
    message,
    from: 'Admin',
    adminName: req.user.username
  });

  res.status(200).json({
    success: true,
    message: 'Announcement broadcasted successfully'
  });
});

// @desc    Get connected users (Admin only)
// @route   GET /api/notifications/admin/connected-users
// @access  Private (Admin only)
export const getConnectedUsers = asyncHandler(async (req, res) => {
  const { role } = req.query;
  
  let connectedUsers;
  if (role) {
    connectedUsers = socketService.getConnectedUsersByRole(role);
  } else {
    const totalCount = socketService.getConnectedUsersCount();
    const adminUsers = socketService.getConnectedUsersByRole('admin');
    const vendorUsers = socketService.getConnectedUsersByRole('vendor');
    const sellerUsers = socketService.getConnectedUsersByRole('seller');
    const customerUsers = socketService.getConnectedUsersByRole('customer');
    
    connectedUsers = {
      total: totalCount,
      byRole: {
        admin: adminUsers,
        vendor: vendorUsers,
        seller: sellerUsers,
        customer: customerUsers
      }
    };
  }

  res.status(200).json({
    success: true,
    data: connectedUsers
  });
});

// @desc    Send notification to specific user (Admin only)
// @route   POST /api/notifications/admin/send-to-user
// @access  Private (Admin only)
export const sendNotificationToUser = asyncHandler(async (req, res) => {
  const { userId, message, title = 'Admin Message', type = 'info' } = req.body;

  if (!userId || !message) {
    res.status(400);
    throw new Error('User ID and message are required');
  }

  // Check if user is online
  const isOnline = socketService.isUserOnline(userId);
  
  if (!isOnline) {
    return res.status(200).json({
      success: true,
      message: 'User is offline. Notification will be delivered when they come online.',
      userOnline: false
    });
  }

  // Send notification to specific user
  socketService.notifyUser(userId, 'admin_message', {
    type,
    title,
    message,
    from: 'Admin',
    adminName: req.user.username
  });

  res.status(200).json({
    success: true,
    message: 'Notification sent successfully',
    userOnline: true
  });
});

// @desc    Send notification to all users of specific role (Admin only)
// @route   POST /api/notifications/admin/send-to-role
// @access  Private (Admin only)
export const sendNotificationToRole = asyncHandler(async (req, res) => {
  const { role, message, title = 'Admin Message', type = 'info' } = req.body;

  if (!role || !message) {
    res.status(400);
    throw new Error('Role and message are required');
  }

  const validRoles = ['customer', 'vendor', 'seller', 'admin'];
  if (!validRoles.includes(role)) {
    res.status(400);
    throw new Error('Invalid role specified');
  }

  // Get connected users of specific role
  const connectedUsers = socketService.getConnectedUsersByRole(role);
  
  if (connectedUsers.length === 0) {
    return res.status(200).json({
      success: true,
      message: `No ${role}s are currently online`,
      sentCount: 0
    });
  }

  // Send notification based on role
  if (role === 'admin') {
    socketService.notifyAdmins('admin_message', {
      type,
      title,
      message,
      from: 'Admin',
      adminName: req.user.username
    });
  } else if (role === 'vendor' || role === 'seller') {
    socketService.notifyVendors('admin_message', {
      type,
      title,
      message,
      from: 'Admin',
      adminName: req.user.username
    });
  } else {
    // For customers, send to each individually
    connectedUsers.forEach(user => {
      socketService.notifyUser(user.userId, 'admin_message', {
        type,
        title,
        message,
        from: 'Admin',
        adminName: req.user.username
      });
    });
  }

  res.status(200).json({
    success: true,
    message: `Notification sent to all online ${role}s`,
    sentCount: connectedUsers.length
  });
});

// @desc    Trigger system maintenance notification
// @route   POST /api/notifications/admin/maintenance
// @access  Private (Admin only)
export const notifySystemMaintenance = asyncHandler(async (req, res) => {
  const { message, scheduledTime } = req.body;

  if (!message) {
    res.status(400);
    throw new Error('Maintenance message is required');
  }

  socketService.notifySystemMaintenance(message, scheduledTime);

  res.status(200).json({
    success: true,
    message: 'System maintenance notification sent to all users'
  });
});

// @desc    Get real-time statistics
// @route   GET /api/notifications/admin/stats
// @access  Private (Admin only)
export const getRealtimeStats = asyncHandler(async (req, res) => {
  const totalConnected = socketService.getConnectedUsersCount();
  const adminUsers = socketService.getConnectedUsersByRole('admin');
  const vendorUsers = socketService.getConnectedUsersByRole('vendor');
  const sellerUsers = socketService.getConnectedUsersByRole('seller');
  const customerUsers = socketService.getConnectedUsersByRole('customer');

  res.status(200).json({
    success: true,
    data: {
      totalConnectedUsers: totalConnected,
      connectedByRole: {
        admin: adminUsers.length,
        vendor: vendorUsers.length,
        seller: sellerUsers.length,
        customer: customerUsers.length
      },
      lastUpdated: new Date()
    }
  });
});