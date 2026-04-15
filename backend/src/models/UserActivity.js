/* ============================================
   StartupEvents — User Activity Model (Mongoose)
   Syllabus: BE Unit V — Advanced MongoDB,
             activity tracking, aggregation
   ============================================ */

const mongoose = require('mongoose');

/**
 * UserActivity Schema
 * 
 * Tracks individual user actions for analytics and recommendations.
 * Each document represents a single user action.
 *
 * Demonstrates: schema design for event sourcing / activity log,
 *               Mixed type, TTL index (auto-delete old records)
 */
const userActivitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },

    action: {
      type: String,
      required: [true, 'Action type is required'],
      enum: {
        values: ['view', 'rsvp', 'cancel_rsvp', 'share', 'search', 'create_event', 'login'],
        message: '{VALUE} is not a valid action',
      },
      index: true,
    },

    // Reference to the event (if action is about an event)
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      default: null,
    },

    // Flexible metadata — different actions store different data
    // Demonstrates: Mixed (Schema.Types.Mixed) for dynamic fields
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // IP and user agent for analytics
    ip: String,
    userAgent: String,

    // When the activity occurred
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ---- TTL Index ----
// Auto-delete activity records after 90 days (keeps DB clean)
userActivitySchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// ---- Compound indexes for common queries ----
userActivitySchema.index({ user: 1, action: 1, timestamp: -1 });
userActivitySchema.index({ event: 1, action: 1 });

// ---- Static Methods ----

/**
 * Get activity summary grouped by action type
 * Demonstrates: $match with date range, $group, $sort
 *
 * @param {Date} since - Start date
 * @returns {Promise<Array>} Activity counts by type
 */
userActivitySchema.statics.getActivitySummary = function (since) {
  const match = since ? { timestamp: { $gte: since } } : {};

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$user' },
      },
    },
    {
      $project: {
        _id: 0,
        action: '$_id',
        count: 1,
        uniqueUsers: { $size: '$uniqueUsers' },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

/**
 * Get a user's recent activity feed
 * Demonstrates: $match, $sort, $limit, $lookup for event data
 *
 * @param {string} userId
 * @param {number} limit
 * @returns {Promise<Array>}
 */
userActivitySchema.statics.getUserFeed = function (userId, limit = 20) {
  return this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $sort: { timestamp: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'events',
        localField: 'event',
        foreignField: '_id',
        as: 'eventInfo',
      },
    },
    {
      $unwind: {
        path: '$eventInfo',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        action: 1,
        timestamp: 1,
        metadata: 1,
        eventTitle: '$eventInfo.title',
        eventCategory: '$eventInfo.category',
      },
    },
  ]);
};

/**
 * Get most active users
 * Demonstrates: $group, $sort, $limit, counting by user
 *
 * @param {number} limit
 * @returns {Promise<Array>}
 */
userActivitySchema.statics.getMostActiveUsers = function (limit = 10) {
  return this.aggregate([
    {
      $group: {
        _id: '$user',
        actionCount: { $sum: 1 },
        lastActive: { $max: '$timestamp' },
      },
    },
    { $sort: { actionCount: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userInfo',
      },
    },
    { $unwind: '$userInfo' },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        name: { $concat: ['$userInfo.firstName', ' ', '$userInfo.lastName'] },
        email: '$userInfo.email',
        actionCount: 1,
        lastActive: 1,
      },
    },
  ]);
};

/**
 * Log a user activity
 * Convenience static method
 *
 * @param {Object} data - Activity data
 */
userActivitySchema.statics.log = function (data) {
  return this.create({
    user: data.userId,
    action: data.action,
    event: data.eventId || null,
    metadata: data.metadata || {},
    ip: data.ip,
    userAgent: data.userAgent,
  });
};

const UserActivity = mongoose.model('UserActivity', userActivitySchema);

module.exports = UserActivity;
