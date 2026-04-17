const Event = require('../models/Event');
const logger = require('../utils/logger');

/**
 * @desc    Get personalized event recommendations for the current user
 * @route   GET /api/v1/recommendations
 * @access  Private
 */
const getRecommendations = async (req, res, next) => {
  try {
    const userInterests = req.user.interests || [];
    
    // 1. Initial filter: upcoming events, excluding those user is already attending
    const filter = {
      date: { $gte: new Date() },
      status: 'upcoming',
      attendees: { $ne: req.user._id }
    };

    // 2. Fetch events
    const allEvents = await Event.find(filter)
      .populate('organizer', 'firstName lastName')
      .limit(50);

    if (userInterests.length === 0) {
      // Fallback for users with no interests: return featured events
      return res.status(200).json({
        success: true,
        data: allEvents.filter(e => e.isFeatured).slice(0, 5),
        reason: 'Featured events for you'
      });
    }

    // 3. Scoring logic (Simple Tag Intersection)
    const scoredEvents = allEvents.map(event => {
      let score = 0;
      
      // Category match (High weight)
      if (userInterests.some(i => i.toLowerCase() === event.category.toLowerCase())) {
        score += 5;
      }

      // Tag match (Medium weight)
      const commonTags = (event.tags || []).filter(tag => 
        userInterests.some(interest => interest.toLowerCase() === tag.toLowerCase())
      );
      score += commonTags.length * 2;

      // Featured bonus
      if (event.isFeatured) score += 3;

      return { event, score };
    });

    // 4. Sort and return top 6
    const topRecommendations = scoredEvents
      .filter(se => se.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(se => se.event);

    res.status(200).json({
      success: true,
      count: topRecommendations.length,
      data: topRecommendations,
      explanation: 'Matches your interests: ' + userInterests.join(', ')
    });

  } catch (error) {
    logger.error(`Recommendation Error: ${error.message}`);
    next(error);
  }
};

module.exports = {
  getRecommendations
};
