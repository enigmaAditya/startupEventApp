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
  .get(eventQueryRules, paginate, getEvents)
  .post(protect, authorize('organizer', 'admin'), createEventRules, createEvent);

/**
 * GET    /api/v1/events/:id  — Get single event (public)
 * PUT    /api/v1/events/:id  — Update event (organizer who owns it)
 * DELETE /api/v1/events/:id  — Delete event (admin only)
 */
router
  .route('/:id')
  .get(getEvent)
  .put(protect, authorize('organizer', 'admin'), updateEventRules, updateEvent)
  .delete(protect, authorize('admin'), deleteEvent);

/**
 * POST /api/v1/events/:id/rsvp — RSVP to an event (authenticated)
 */
router.post('/:id/rsvp', protect, rsvpToEvent);

module.exports = router;
