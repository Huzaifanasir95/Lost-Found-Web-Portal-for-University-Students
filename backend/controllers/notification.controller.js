
const Notification = require('../models/Notification');
const { validationResult } = require('express-validator');

// Get user notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Validate user id is provided
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('relatedItem')
      .populate('relatedPost');
    
    // Transform notifications to frontend format
    const formattedNotifications = notifications.map(notification => ({
      _id: notification._id,
      title: notification.relatedItem ? 
        (notification.type === 'claim' ? 
          'Claim Status Update' : 
          `Activity on your ${notification.relatedItem.type} item`
        ) : 
        (notification.relatedPost ? 'Community Activity' : 'System Notification'),
      description: notification.message,
      timestamp: notification.createdAt,
      read: notification.read,
      type: notification.type || 'system',
      link: notification.relatedItem ? 
        `/items/${notification.relatedItem._id}` : 
        (notification.relatedPost ? `/community/${notification.relatedPost._id}` : '/')
    }));
    
    res.json(formattedNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark notification as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const notificationId = req.params.notificationId;
    
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    notification.read = true;
    await notification.save();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark all notifications as read
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    await Notification.updateMany(
      { user: userId, read: false },
      { read: true }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Clear all notifications
exports.clearAllNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    await Notification.deleteMany({ user: userId });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a notification (internal function)
exports.createNotification = async (userId, message, itemId = null, postId = null, type = 'system') => {
  try {
    const notification = new Notification({
      user: userId,
      message,
      relatedItem: itemId,
      relatedPost: postId,
      type,
      read: false
    });
    
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Create a claim notification
exports.createClaimNotification = async (userId, message, itemId) => {
  return this.createNotification(userId, message, itemId, null, 'claim');
};
