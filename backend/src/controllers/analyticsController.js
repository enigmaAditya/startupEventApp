const Event = require('../models/Event');
const RSVP = require('../models/RSVP');
const { ApiError } = require('../middlewares/errorHandler');
const logger = require('../utils/logger');

/**
 * @desc    Get aggregated analytics for the organizer
 * @route   GET /api/v1/analytics/organizer
 * @access  Private (Organizer)
 */
const getOrganizerAnalytics = async (req, res, next) => {
  try {
    const organizerId = req.user._id;

    // 1. Fetch all events owned by this organizer
    const events = await Event.find({ organizer: organizerId }).select('title category attendees status createdAt');
    
    if (events.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalEvents: 0,
          totalReach: 0,
          growthScore: 0,
          categoryBreakdown: {},
          topEvent: null,
          recentActivity: []
        }
      });
    }

    const eventIds = events.map(e => e._id);

    // 2. Aggregate metrics
    const totalEvents = events.length;
    const totalReach = events.reduce((acc, curr) => acc + (curr.attendees?.length || 0), 0);
    
    // 3. Category Breakdown
    const categoryBreakdown = events.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + 1;
      return acc;
    }, {});

    // 4. Growth Score (RSVPs in the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentRSVPs = await RSVP.countDocuments({
      event: { $in: eventIds },
      createdAt: { $gte: sevenDaysAgo }
    });

    // 5. Find Top Performing Event
    const topEvent = [...events].sort((a, b) => (b.attendees?.length || 0) - (a.attendees?.length || 0))[0];

    // 6. Recent Activity (Latest 5 RSVPs)
    const recentActivity = await RSVP.find({ event: { $in: eventIds } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'firstName lastName')
      .populate('event', 'title');

    res.status(200).json({
      success: true,
      data: {
        totalEvents,
        totalReach,
        growthScore: recentRSVPs,
        categoryBreakdown,
        topEvent: {
          title: topEvent.title,
          attendees: topEvent.attendees?.length || 0,
          category: topEvent.category
        },
        recentActivity: recentActivity.map(r => ({
          userName: r.user ? `${r.user.firstName} ${r.user.lastName}` : 'Someone',
          eventTitle: r.event?.title || 'an event',
          timestamp: r.createdAt
        }))
      }
    });
  } catch (error) {
    logger.error(`Analytics Error: ${error.message}`);
    next(error);
  }
};

module.exports = {
  getOrganizerAnalytics
};
