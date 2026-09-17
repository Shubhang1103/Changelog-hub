const ChangelogEntry = require('../models/ChangelogEntry');
const User = require('../models/User');

/**
 * @desc    Get unread changelog count for authenticated user
 * @route   GET /api/v1/notifications/unread-count
 * @access  Private (Protected)
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const user = req.user;
    const lastViewed = user.lastViewedChangelogDate || new Date(0);

    const unreadCount = await ChangelogEntry.countDocuments({
      status: 'Published',
      publishedAt: { $gt: lastViewed },
    });

    res.status(200).json({
      success: true,
      unreadCount,
      lastViewedChangelogDate: user.lastViewedChangelogDate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all changelog updates as read by updating lastViewedChangelogDate to now
 * @route   POST /api/v1/notifications/mark-read
 * @access  Private (Protected)
 */
const markNotificationsAsRead = async (req, res, next) => {
  try {
    const now = new Date();

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { lastViewedChangelogDate: now },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
      unreadCount: 0,
      lastViewedChangelogDate: updatedUser.lastViewedChangelogDate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get recent published updates for the slide-over notification drawer
 * @route   GET /api/v1/notifications/recent
 * @access  Public (Optional auth)
 */
const getRecentUpdates = async (req, res, next) => {
  try {
    const limit = Math.min(10, parseInt(req.query.limit, 10) || 5);

    const recent = await ChangelogEntry.find({ status: 'Published' })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .select('title slug category publishedAt coverImage contentMarkdown');

    res.status(200).json({
      success: true,
      count: recent.length,
      data: recent,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUnreadCount,
  markNotificationsAsRead,
  getRecentUpdates,
};
