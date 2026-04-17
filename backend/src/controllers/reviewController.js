const Review = require('../models/Review');
const Event = require('../models/Event');
const { ApiError } = require('../middlewares/errorHandler');
const logger = require('../utils/logger');

/**
 * @desc    Submit a review for a completed event
 * @route   POST /api/v1/events/:id/reviews
 * @access  Private (Attendees only)
 */
const addReview = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return next(ApiError.notFound('Event not found'));
    }

    // 1. Check if event is completed (Automated sync)
    await event.syncStatus();
    if (event.status !== 'completed') {
      return next(ApiError.badRequest('You can only review events that have ended.'));
    }

    // 2. Check if user was an attendee
    const isAttendee = event.attendees.some(id => id.toString() === req.user._id.toString());
    if (!isAttendee) {
      return next(ApiError.forbidden('Only registered attendees can review this event.'));
    }

    // 3. Create review
    const review = await Review.create({
      event: event._id,
      user: req.user._id,
      rating: req.body.rating,
      comment: req.body.comment
    });

    res.status(201).json({
      success: true,
      data: review
    });

  } catch (error) {
    if (error.code === 11000) {
      return next(ApiError.conflict('You have already reviewed this event.'));
    }
    logger.error(`Review Error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get all reviews for an event
 * @route   GET /api/v1/events/:id/reviews
 * @access  Public
 */
const getEventReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ event: req.params.id })
      .sort({ createdAt: -1 })
      .populate('user', 'firstName lastName avatar');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addReview,
  getEventReviews
};
