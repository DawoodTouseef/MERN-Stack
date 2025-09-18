import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import './NotificationSystem.css';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const socketRef = useRef(null);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo && userInfo.token) {
      // Initialize socket connection
      socketRef.current = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000', {
        auth: {
          token: userInfo.token
        },
        transports: ['websocket', 'polling']
      });

      const socket = socketRef.current;

      // Connection event handlers
      socket.on('connect', () => {
        console.log('Connected to notification server');
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from notification server');
        setIsConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      // Notification event handlers
      socket.on('order_notification', (data) => {
        handleNotification('order', data);
      });

      socket.on('product_notification', (data) => {
        handleNotification('product', data);
      });

      socket.on('user_notification', (data) => {
        handleNotification('user', data);
      });

      socket.on('payment_notification', (data) => {
        handleNotification('payment', data);
      });

      socket.on('review_notification', (data) => {
        handleNotification('review', data);
      });

      socket.on('system_notification', (data) => {
        handleNotification('system', data);
      });

      socket.on('admin_announcement', (data) => {
        handleNotification('announcement', data);
      });

      socket.on('admin_message', (data) => {
        handleNotification('admin', data);
      });

      socket.on('test_notification', (data) => {
        handleNotification('test', data);
      });

      socket.on('maintenance_notification', (data) => {
        handleNotification('maintenance', data);
      });

      // Cleanup on unmount
      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    }
  }, [userInfo]);

  const handleNotification = (type, data) => {
    const notification = {
      id: Date.now() + Math.random(),
      type,
      ...data,
      timestamp: new Date(),
      read: false
    };

    // Add to notifications list
    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep only last 50

    // Show toast notification
    const toastOptions = {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    };

    switch (type) {
      case 'order':
        toast.info(`📦 ${data.title || 'Order Update'}: ${data.message}`, toastOptions);
        break;
      case 'product':
        toast.success(`🛍️ ${data.title || 'Product Update'}: ${data.message}`, toastOptions);
        break;
      case 'payment':
        toast.success(`💳 ${data.title || 'Payment Update'}: ${data.message}`, toastOptions);
        break;
      case 'system':
      case 'maintenance':
        toast.warning(`⚠️ ${data.title || 'System Notice'}: ${data.message}`, toastOptions);
        break;
      case 'announcement':
        toast.info(`📢 ${data.title || 'Announcement'}: ${data.message}`, toastOptions);
        break;
      case 'admin':
        toast.info(`👨‍💼 ${data.title || 'Admin Message'}: ${data.message}`, toastOptions);
        break;
      case 'review':
        toast.info(`⭐ ${data.title || 'Review Update'}: ${data.message}`, toastOptions);
        break;
      case 'user':
        toast.info(`👤 ${data.title || 'Account Update'}: ${data.message}`, toastOptions);
        break;
      case 'test':
        toast.success(`🧪 ${data.title || 'Test'}: ${data.message}`, toastOptions);
        break;
      default:
        toast.info(`🔔 ${data.title || 'Notification'}: ${data.message}`, toastOptions);
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(notif => !notif.read).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order': return '📦';
      case 'product': return '🛍️';
      case 'payment': return '💳';
      case 'system': return '⚙️';
      case 'maintenance': return '⚠️';
      case 'announcement': return '📢';
      case 'admin': return '👨‍💼';
      case 'review': return '⭐';
      case 'user': return '👤';
      case 'test': return '🧪';
      default: return '🔔';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (!userInfo) {
    return null; // Don't render if user is not logged in
  }

  return (
    <div className="notification-system">
      {/* Notification Bell */}
      <div className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
        <div className={`bell-icon ${isConnected ? 'connected' : 'disconnected'}`}>
          🔔
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </div>
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '🟢' : '🔴'}
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="notifications-panel">
          <div className="notifications-header">
            <h3>Notifications</h3>
            <div className="notifications-actions">
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="mark-all-read">
                  Mark all read
                </button>
              )}
              <button onClick={clearNotifications} className="clear-all">
                Clear all
              </button>
              <button 
                onClick={() => setShowNotifications(false)} 
                className="close-panel"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">
                      {notification.title || 'Notification'}
                    </div>
                    <div className="notification-message">
                      {notification.message}
                    </div>
                    {notification.from && (
                      <div className="notification-from">
                        From: {notification.from}
                      </div>
                    )}
                    <div className="notification-time">
                      {formatTime(notification.timestamp)}
                    </div>
                  </div>
                  {!notification.read && <div className="unread-indicator"></div>}
                </div>
              ))
            )}
          </div>

          <div className="notifications-footer">
            <div className="connection-info">
              Status: {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;