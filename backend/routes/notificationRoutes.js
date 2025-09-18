import express from 'express';
import {
  getNotificationStatus,
  sendTestNotification,
  broadcastAdminAnnouncement,
  getConnectedUsers,
  sendNotificationToUser,
  sendNotificationToRole,
  notifySystemMaintenance,
  getRealtimeStats
} from '../controllers/notificationController.js';
import { authenticate, IsAdmin } from '../middlewares/authMiddleware.js';
import { generalLimiter, adminLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

// Public/User routes (require authentication)
router.route('/status')
  .get(authenticate, getNotificationStatus);

router.route('/test')
  .post(authenticate, IsAdmin, adminLimiter, sendTestNotification);

// Admin routes (require admin privileges)
router.route('/admin/broadcast')
  .post(authenticate, IsAdmin, adminLimiter, broadcastAdminAnnouncement);

router.route('/admin/connected-users')
  .get(authenticate, IsAdmin, getConnectedUsers);

router.route('/admin/send-to-user')
  .post(authenticate, IsAdmin, adminLimiter, sendNotificationToUser);

router.route('/admin/send-to-role')
  .post(authenticate, IsAdmin, adminLimiter, sendNotificationToRole);

router.route('/admin/maintenance')
  .post(authenticate, IsAdmin, adminLimiter, notifySystemMaintenance);

router.route('/admin/stats')
  .get(authenticate, IsAdmin, getRealtimeStats);

export default router;