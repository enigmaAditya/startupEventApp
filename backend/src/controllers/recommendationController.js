const Event = require('../models/Event');
const RSVP = require('../models/RSVP');
const logger = require('../utils/logger');

/**
 * @desc    Get personalized event recommendations based on RSVP history
 * @route   GET /api/v1/recommendations
 * @access  Private
 *
 * Algorithm:
 * 1. Fetch all confirmed RSVPs for the user
 * 2. If < 3 RSVPs → return empty (not enough data for genuine recommendations)
 * 3. Build a preference profile from RSVP'd events:
 *    - Category frequency (e.g., 3 hackathons, 1 workshop)
 *    - Tag frequency (e.g., "AI" appeared 4 times, "web" 2 times)
 *    - City preference
 * 4. Score every upcoming event against this profile
 * 5. Return top matches with an explanation of WHY each was recommended
 */
const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Get all confirmed RSVPs for this user
    const rsvps = await RSVP.find({ user: userId, status: 'confirmed' })
      .populate({
        path: 'event',
        select: 'category tags location title date',
      });

    // Filter out RSVPs whose events may have been deleted
    const validRSVPs = rsvps.filter(r => r.event != null);

    // 2. Minimum threshold — need at least 3 RSVPs for genuine recommendations
    const MIN_RSVPS = 3;
    if (validRSVPs.length < MIN_RSVPS) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        reason: validRSVPs.length === 0
          ? 'RSVP to some events first to get personalized recommendations.'
          : `You've RSVP'd to ${validRSVPs.length} event(s). RSVP to at least ${MIN_RSVPS} events to unlock AI recommendations.`,
        rsvpCount: validRSVPs.length,
        threshold: MIN_RSVPS,
      });
    }

    // 3. Build preference profile from RSVP history
    const categoryFreq = {};
    const tagFreq = {};
    const cityFreq = {};
    const attendedEventIds = new Set();

    validRSVPs.forEach(rsvp => {
      const evt = rsvp.event;
      attendedEventIds.add(evt._id.toString());

      // Category frequency
      const cat = evt.category;
      categoryFreq[cat] = (categoryFreq[cat] || 0) + 1;

      // Tag frequency
      (evt.tags || []).forEach(tag => {
        const t = tag.toLowerCase();
        tagFreq[t] = (tagFreq[t] || 0) + 1;
      });

      // City frequency
      const city = evt.location?.city?.toLowerCase();
      if (city) {
        cityFreq[city] = (cityFreq[city] || 0) + 1;
      }
    });

    // Normalize frequencies into weights (0-1)
    const totalRSVPs = validRSVPs.length;
    const categoryWeights = {};
    Object.entries(categoryFreq).forEach(([cat, count]) => {
      categoryWeights[cat] = count / totalRSVPs;
    });

    const maxTagFreq = Math.max(...Object.values(tagFreq), 1);
    const tagWeights = {};
    Object.entries(tagFreq).forEach(([tag, count]) => {
      tagWeights[tag] = count / maxTagFreq;
    });

    // Top categories and tags for explanation
    const topCategories = Object.entries(categoryFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);

    const topTags = Object.entries(tagFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);

    // 4. Find upcoming events the user hasn't attended
    const candidates = await Event.find({
      date: { $gte: new Date() },
      status: 'upcoming',
      moderationStatus: 'active',
      _id: { $nin: [...attendedEventIds] },
      attendees: { $ne: userId },
    })
      .populate('organizer', 'firstName lastName')
      .limit(100);

    // 5. Score each candidate event
    const scoredEvents = candidates.map(event => {
      let score = 0;
      const reasons = [];

      // Category match (highest weight — 0 to 10 points)
      const catWeight = categoryWeights[event.category] || 0;
      if (catWeight > 0) {
        score += catWeight * 10;
        const pct = Math.round(catWeight * 100);
        reasons.push(`${pct}% of your RSVPs are ${event.category}s`);
      }

      // Tag overlap (0 to 6 points)
      const eventTags = (event.tags || []).map(t => t.toLowerCase());
      let tagScore = 0;
      const matchedTags = [];
      eventTags.forEach(tag => {
        if (tagWeights[tag]) {
          tagScore += tagWeights[tag] * 2;
          matchedTags.push(tag);
        }
      });
      if (tagScore > 0) {
        score += Math.min(tagScore, 6);
        if (matchedTags.length > 0) {
          reasons.push(`Matches your interests: ${matchedTags.slice(0, 3).join(', ')}`);
        }
      }

      // City proximity bonus (0 to 3 points)
      const eventCity = event.location?.city?.toLowerCase();
      if (eventCity && cityFreq[eventCity]) {
        const cityWeight = cityFreq[eventCity] / totalRSVPs;
        score += cityWeight * 3;
        reasons.push(`Near your frequent city: ${event.location.city}`);
      }

      // Spots filling up bonus (urgency signal — 0 to 2 points)
      if (event.capacity) {
        const fillRate = (event.attendees?.length || 0) / event.capacity;
        if (fillRate > 0.7) {
          score += 2;
          reasons.push('Filling up fast');
        } else if (fillRate > 0.4) {
          score += 1;
        }
      }

      // Featured event bonus (0 to 1 point)
      if (event.isFeatured) {
        score += 1;
        reasons.push('Featured event');
      }

      return {
        event,
        score: Math.round(score * 100) / 100,
        matchReason: reasons.length > 0 ? reasons[0] : null,
        allReasons: reasons,
      };
    });

    // 6. Filter (score > 0) and sort by score descending
    const recommendations = scoredEvents
      .filter(se => se.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    // 7. Build response
    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations.map(r => ({
        ...r.event.toJSON(),
        _matchScore: r.score,
        _matchReason: r.matchReason,
      })),
      profile: {
        totalRSVPs: validRSVPs.length,
        topCategories,
        topTags,
      },
      explanation: recommendations.length > 0
        ? `Based on your ${validRSVPs.length} RSVPs — you prefer ${topCategories.join(', ')} events${topTags.length > 0 ? ` about ${topTags.slice(0, 3).join(', ')}` : ''}.`
        : `No upcoming events match your RSVP profile right now. Check back soon!`,
    });

  } catch (error) {
    logger.error(`Recommendation Error: ${error.message}`);
    next(error);
  }
};

module.exports = {
  getRecommendations
};
