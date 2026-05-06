/* ============================================
   StartupEvents — Event Routes
   Syllabus: BE Unit II — express.Router(), GET/POST,
             route parameters, middleware chaining
   ============================================ */

const express = require('express');
const router = express.Router();

// Controller functions
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  rsvpToEvent,
  clearEventChat,
} = require('../controllers/eventController');

// Middleware
const protect = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const { paginate } = require('../middlewares/paginate');
const { createEventRules, updateEventRules, eventQueryRules } = require('../middlewares/validators/eventValidator');

// ============ ROUTES ============
// Demonstrates: express.Router(), chaining middleware, HTTP methods

/**
 * GET  /api/v1/events      — List all events (public, paginated)
 * POST /api/v1/events      — Create event (organizer only)
 */
router
  .route('/')
  .get(protect.optional, eventQueryRules, paginate, getEvents)
  .post(protect, authorize('organizer', 'admin'), createEventRules, createEvent);

/**
 * GET    /api/v1/events/:id  — Get single event (public)
 * PUT    /api/v1/events/:id  — Update event (organizer who owns it)
 * DELETE /api/v1/events/:id  — Delete event (admin only)
 */
router
  .route('/:id')
  .get(protect.optional, getEvent)
  .put(protect, authorize('organizer', 'admin'), updateEventRules, updateEvent)
  .delete(protect, authorize('organizer', 'admin'), deleteEvent);

/**
 * POST /api/v1/events/:id/rsvp — RSVP to an event (authenticated)
 */
const { addReview, getEventReviews } = require('../controllers/reviewController');

// ... (rest of imports)

// Existing RSVP route
router.post('/:id/rsvp', protect, rsvpToEvent);

/**
 * Reviews
 * POST /api/v1/events/:id/reviews — Submit a review (attendees only)
 * GET  /api/v1/events/:id/reviews — Get all reviews for an event
 */
router.route('/:id/reviews')
  .get(getEventReviews)
  .post(protect, addReview);

/**
 * Chat history clearing
 * DELETE /api/v1/events/:id/chat — Clear chat (organizer who owns it)
 */
router.delete('/:id/chat', protect, authorize('organizer', 'admin'), clearEventChat);

module.exports = router;
