const express = require('express');
const router = express.Router();
const {
  getUnreadCount,
  markNotificationsAsRead,
  getRecentUpdates,
} = require('../controllers/notificationController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

// Get recent updates preview (public/optional)
router.get('/recent', optionalProtect, getRecentUpdates);

// Authenticated notification unread count & mark as read
router.get('/unread-count', protect, getUnreadCount);
router.post('/mark-read', protect, markNotificationsAsRead);

module.exports = router;
