
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { auth } = require('../middleware/auth');

// Get user notifications
router.get('/:userId/notifications', notificationController.getUserNotifications);

// Mark notification as read
router.put('/:userId/notifications/:notificationId/mark-read', auth, notificationController.markNotificationAsRead);

// Mark all notifications as read
router.put('/:userId/notifications/mark-all-read', auth, notificationController.markAllNotificationsAsRead);

// Clear all notifications
router.delete('/:userId/notifications/clear-all', auth, notificationController.clearAllNotifications);

module.exports = router;
