/* ============================================
   StartupEvents — Analytics Service
   Syllabus: BE Unit V — Aggregation queries,
             service layer pattern
   ============================================ */

const EventAnalytics = require('../models/EventAnalytics');
const UserActivity = require('../models/UserActivity');

/**
 * Analytics Service
 * 
 * Encapsulates all analytics-related business logic.
 * Controllers call this service, which calls the models.
 *
 * Demonstrates: service layer pattern, aggregation pipelines,
 *               date range filtering, data transformation
 */
const analyticsService = {
  // ============ EVENT ANALYTICS ============

  /**
   * Track an event page view
   * @param {string} eventId
   * @param {string} source - Traffic source (direct, search, social, referral)
   */
  async trackEventView(eventId, source = 'direct') {
    return EventAnalytics.trackView(eventId, source);
  },

  /**
   * Get dashboard overview stats
   * @returns {Object} Aggregate stats
   */
  async getDashboardStats() {
    const [eventStats, activityStats] = await Promise.all([
      EventAnalytics.aggregate([
        {
          $group: {
            _id: null,
            totalViews: { $sum: '$views' },
            totalUniqueViews: { $sum: '$uniqueViews' },
            totalRSVPs: { $sum: '$rsvpCount' },
            totalShares: { $sum: '$shares' },
          },
        },
        { $project: { _id: 0 } },
      ]),
      UserActivity.getActivitySummary(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      ),
    ]);

    return {
      overview: eventStats[0] || { totalViews: 0, totalUniqueViews: 0, totalRSVPs: 0, totalShares: 0 },
      recentActivity: activityStats,
    };
  },

  /**
   * Get analytics for a specific event
   * @param {string} eventId
   * @param {number} days - Lookback period
   */
  async getEventAnalytics(eventId, days = 30) {
    const [trend, sources, summary] = await Promise.all([
      EventAnalytics.getDailyTrend(eventId, days),
      EventAnalytics.getSourceBreakdown(eventId),
      EventAnalytics.aggregate([
        { $match: { event: require('mongoose').Types.ObjectId.createFromHexString(eventId) } },
        {
          $group: {
            _id: null,
            totalViews: { $sum: '$views' },
            totalRSVPs: { $sum: '$rsvpCount' },
            avgDailyViews: { $avg: '$views' },
          },
        },
        { $project: { _id: 0 } },
      ]),
    ]);

    return {
      summary: summary[0] || { totalViews: 0, totalRSVPs: 0, avgDailyViews: 0 },
      dailyTrend: trend,
      sources: sources[0] || { direct: 0, search: 0, social: 0, referral: 0 },
    };
  },

  /**
   * Get top performing events
   * @param {number} limit
   */
  async getTopEvents(limit = 10) {
    return EventAnalytics.getTopByViews(limit);
  },

  // ============ USER ACTIVITY ============

  /**
   * Log a user action
   * @param {Object} data
   */
  async logActivity(data) {
    return UserActivity.log(data);
  },

  /**
   * Get a user's activity feed
   * @param {string} userId
   * @param {number} limit
   */
  async getUserActivity(userId, limit = 20) {
    return UserActivity.getUserFeed(userId, limit);
  },

  /**
   * Get most active users
   * @param {number} limit
   */
  async getMostActiveUsers(limit = 10) {
    return UserActivity.getMostActiveUsers(limit);
  },

  /**
   * Get platform-wide activity summary
   * @param {number} days - Lookback period
   */
  async getPlatformActivity(days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return UserActivity.getActivitySummary(since);
  },
};

module.exports = analyticsService;
