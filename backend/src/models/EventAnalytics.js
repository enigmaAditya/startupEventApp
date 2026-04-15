/* ============================================
   StartupEvents — Event Analytics Model (Mongoose)
   Syllabus: BE Unit V — Advanced MongoDB,
             aggregation pipeline, compound indexes
   ============================================ */

const mongoose = require('mongoose');

/**
 * EventAnalytics Schema
 * 
 * Tracks views, unique views, and RSVP counts per event per day.
 * Uses compound indexes for efficient aggregation queries.
 *
 * Demonstrates: schema design for analytics, compound indexes,
 *               static methods with aggregation pipeline
 */
const eventAnalyticsSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required'],
      index: true,
    },

    // Daily metrics
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    uniqueViews: {
      type: Number,
      default: 0,
      min: 0,
    },
    rsvpCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    shares: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Date for this analytics record (one per day per event)
    date: {
      type: Date,
      required: true,
      default: () => {
        // Normalize to start of day (midnight UTC)
        const now = new Date();
        now.setUTCHours(0, 0, 0, 0);
        return now;
      },
    },

    // Source tracking
    sources: {
      direct: { type: Number, default: 0 },
      search: { type: Number, default: 0 },
      social: { type: Number, default: 0 },
      referral: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// ---- Compound Index ----
// One analytics record per event per day — prevents duplicates
eventAnalyticsSchema.index({ event: 1, date: 1 }, { unique: true });

// ---- Static Methods (Aggregation Pipeline) ----

/**
 * Get top events by total views
 * Demonstrates: $group, $sort, $limit, $lookup (join)
 *
 * @param {number} limit - How many events to return
 * @returns {Promise<Array>} Top events with view counts
 */
eventAnalyticsSchema.statics.getTopByViews = function (limit = 10) {
  return this.aggregate([
    // Stage 1: Group by event, sum all daily views
    {
      $group: {
        _id: '$event',
        totalViews: { $sum: '$views' },
        totalUniqueViews: { $sum: '$uniqueViews' },
        totalRSVPs: { $sum: '$rsvpCount' },
      },
    },
    // Stage 2: Sort by total views descending
    { $sort: { totalViews: -1 } },
    // Stage 3: Limit results
    { $limit: limit },
    // Stage 4: Lookup (join) event details from events collection
    {
      $lookup: {
        from: 'events',
        localField: '_id',
        foreignField: '_id',
        as: 'event',
      },
    },
    // Stage 5: Unwind the event array (since $lookup returns array)
    { $unwind: '$event' },
    // Stage 6: Project (reshape) the output
    {
      $project: {
        _id: 0,
        eventId: '$_id',
        title: '$event.title',
        category: '$event.category',
        totalViews: 1,
        totalUniqueViews: 1,
        totalRSVPs: 1,
      },
    },
  ]);
};

/**
 * Get daily views trend for a specific event
 * Demonstrates: $match, $sort, date range filtering
 *
 * @param {string} eventId - Event ObjectId
 * @param {number} days - Number of days to look back
 * @returns {Promise<Array>} Daily view data
 */
eventAnalyticsSchema.statics.getDailyTrend = function (eventId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        event: new mongoose.Types.ObjectId(eventId),
        date: { $gte: startDate },
      },
    },
    { $sort: { date: 1 } },
    {
      $project: {
        _id: 0,
        date: 1,
        views: 1,
        uniqueViews: 1,
        rsvpCount: 1,
      },
    },
  ]);
};

/**
 * Get traffic sources breakdown
 * Demonstrates: $group with $sum on nested fields
 *
 * @param {string} eventId
 * @returns {Promise<Object>} Source breakdown
 */
eventAnalyticsSchema.statics.getSourceBreakdown = function (eventId) {
  return this.aggregate([
    { $match: { event: new mongoose.Types.ObjectId(eventId) } },
    {
      $group: {
        _id: null,
        direct: { $sum: '$sources.direct' },
        search: { $sum: '$sources.search' },
        social: { $sum: '$sources.social' },
        referral: { $sum: '$sources.referral' },
      },
    },
    { $project: { _id: 0 } },
  ]);
};

/**
 * Increment view count for today
 * Uses upsert — creates record if it doesn't exist
 *
 * @param {string} eventId
 * @param {string} source - Traffic source
 */
eventAnalyticsSchema.statics.trackView = function (eventId, source = 'direct') {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const sourceField = `sources.${source}`;

  return this.findOneAndUpdate(
    { event: eventId, date: today },
    {
      $inc: {
        views: 1,
        [sourceField]: 1,
      },
    },
    { upsert: true, new: true }
  );
};

const EventAnalytics = mongoose.model('EventAnalytics', eventAnalyticsSchema);

module.exports = EventAnalytics;
