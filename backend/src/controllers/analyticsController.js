/* ============================================
   StartupEvents — Analytics Controller
   Syllabus: BE Unit V — Controller layer,
             RESTful endpoints for analytics
   ============================================ */

const analyticsService = require('../services/analyticsService');

/**
 * Analytics Controller
 * Handles HTTP requests for analytics endpoints
 */

// @desc    Get dashboard overview stats
// @route   GET /api/v1/analytics/dashboard
// @access  Private (Organizer/Admin)
exports.getDashboard = async (req, res, next) => {
  try {
    const stats = await analyticsService.getDashboardStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

// @desc    Get analytics for a specific event
// @route   GET /api/v1/analytics/events/:id
// @access  Private (Organizer who owns event / Admin)
exports.getEventAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const days = parseInt(req.query.days, 10) || 30;

    const analytics = await analyticsService.getEventAnalytics(id, days);
    res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top performing events
// @route   GET /api/v1/analytics/top-events
// @access  Private (Admin)
exports.getTopEvents = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const topEvents = await analyticsService.getTopEvents(limit);
    res.status(200).json({ success: true, data: topEvents });
  } catch (error) {
    next(error);
  }
};

// @desc    Track event page view
// @route   POST /api/v1/analytics/track/view
// @access  Public
exports.trackView = async (req, res, next) => {
  try {
    const { eventId, source } = req.body;
    await analyticsService.trackEventView(eventId, source);

    // Also log user activity if authenticated
    if (req.user) {
      await analyticsService.logActivity({
        userId: req.user.id,
        action: 'view',
        eventId,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      });
    }

    res.status(200).json({ success: true, message: 'View tracked' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's activity feed
// @route   GET /api/v1/analytics/activity
// @access  Private
exports.getUserActivity = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const activity = await analyticsService.getUserActivity(req.user.id, limit);
    res.status(200).json({ success: true, data: activity });
  } catch (error) {
    next(error);
  }
};

// @desc    Get most active users
// @route   GET /api/v1/analytics/active-users
// @access  Private (Admin)
exports.getMostActiveUsers = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const users = await analyticsService.getMostActiveUsers(limit);
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Get platform-wide activity summary
// @route   GET /api/v1/analytics/platform
// @access  Private (Admin)
exports.getPlatformActivity = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days, 10) || 30;
    const summary = await analyticsService.getPlatformActivity(days);
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};
