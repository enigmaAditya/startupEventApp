/* ============================================
   StartupEvents — Event Controller
   Syllabus: BE Unit II — Controllers, req/res objects,
             status codes, CRUD
   BE Unit IV — Mongoose CRUD, pagination
   ============================================ */

const { validationResult } = require('express-validator');
const Event = require('../models/Event');
const RSVP = require('../models/RSVP');
const User = require('../models/User');
const { ApiError } = require('../middlewares/errorHandler');
const { paginatedResponse } = require('../middlewares/paginate');
const appEvents = require('../utils/appEvents');
const logger = require('../utils/logger');

/**
 * @desc    Get all events (paginated, filtered)
 * @route   GET /api/v1/events
 * @access  Public
 *
 * Demonstrates: req.query, Mongoose find/sort/skip/limit, pagination
 */
const getEvents = async (req, res, next) => {
  try {
    const { category, search, status, city, organizer } = req.query;
    const { page, limit, skip } = req.pagination;

    // Build filter object dynamically
    // Demonstrates: computed property names, optional chaining
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (organizer) filter.organizer = organizer;
    if (city) filter['location.city'] = new RegExp(city, 'i');

    let query;
    let countFilter = filter;

    if (search) {
      countFilter = { ...filter, $text: { $search: search } };
      query = Event.find(
        countFilter,
        { score: { $meta: 'textScore' } }
      ).sort({ score: { $meta: 'textScore' } });
    } else {
      query = Event.find(filter).sort({ date: 1 });
    }

    const total = await Event.countDocuments(countFilter);

    // Execute query with pagination
    const events = await query
      .skip(skip)
      .limit(limit)
      .populate('organizer', 'firstName lastName');

    // Harden attendeeCount: explicitly calculate from array length to ignore physical shadows
    const hardenedEvents = events.map(evt => {
      const e = evt.toObject({ virtuals: true });
      e.attendeeCount = evt.attendees ? evt.attendees.length : 0;
      return e;
    });

    // Send paginated response
    res.status(200).json(paginatedResponse(hardenedEvents, total, { page, limit }));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single event by ID
 * @route   GET /api/v1/events/:id
 * @access  Public
 *
 * Demonstrates: req.params, findById, populate
 */
const getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'firstName lastName email')
      .populate('attendees', 'firstName lastName');

    if (!event) {
      return next(ApiError.notFound('Event not found'));
    }

    // Harden attendeeCount for singleton response
    const hardenedEvent = event.toObject({ virtuals: true });
    hardenedEvent.attendeeCount = event.attendees ? event.attendees.length : 0;

    res.status(200).json({ success: true, data: hardenedEvent });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new event
 * @route   POST /api/v1/events
 * @access  Private (Organizer)
 *
 * Demonstrates: req.body, validation, .create(), 201 status
 */
const createEvent = async (req, res, next) => {
  try {
    // Check validation results from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Set organizer to the authenticated user
    req.body.organizer = req.user._id;

    const event = await Event.create(req.body);

    // Add this event to the organizer's eventsOrganized array
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { eventsOrganized: event._id } });

    // Emit event on the app event bus (EventEmitter)
    appEvents.emit('event:created', {
      title: event.title,
      organizer: req.user.email,
    });

    // 201 Created
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an event
 * @route   PUT /api/v1/events/:id
 * @access  Private (Organizer who owns the event)
 *
 * Demonstrates: findByIdAndUpdate, ownership check
 */
const updateEvent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    let event = await Event.findById(req.params.id);

    if (!event) {
      return next(ApiError.notFound('Event not found'));
    }

    // Check ownership (only organizer can update their own event)
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(ApiError.forbidden('Not authorized to update this event'));
    }

    const allowedUpdates = ['title', 'description', 'category', 'date', 'endDate',
      'time', 'location', 'capacity', 'tags', 'status', 'isVirtual', 'isFeatured', 'prizePool', 'isFullyBooked'];
    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    event = await Event.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an event
 * @route   DELETE /api/v1/events/:id
 * @access  Private (Admin only)
 *
 * Demonstrates: findByIdAndDelete, 204 vs 200
 */
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return next(ApiError.notFound('Event not found'));
    }

    // Check ownership
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(ApiError.forbidden('Not authorized to delete this event'));
    }

    await Event.findByIdAndDelete(req.params.id);

    // Also delete associated RSVPs
    await RSVP.deleteMany({ event: req.params.id });

    // Remove from the organizer's listed events
    await User.findByIdAndUpdate(event.organizer, {
      $pull: { eventsOrganized: req.params.id }
    });

    // Remove from all attendees' listed events
    await User.updateMany(
      { eventsAttending: req.params.id },
      { $pull: { eventsAttending: req.params.id } }
    );

    logger.info(`Event deleted: "${event.title}" by admin ${req.user.email}`);

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    RSVP to an event
 * @route   POST /api/v1/events/:id/rsvp
 * @access  Private (Authenticated)
 *
 * Demonstrates: create, error handling for duplicates,
 *               instance methods (addAttendee)
 */
const rsvpToEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return next(ApiError.notFound('Event not found'));
    }

    if (req.user.role === 'organizer') {
      return next(ApiError.forbidden('Organizers cannot RSVP to events'));
    }

    if (event.isFullyBooked) {
      return next(ApiError.badRequest('Event is fully booked'));
    }

    // Create RSVP record
    const rsvp = await RSVP.create({
      user: req.user._id,
      event: event._id,
      role: req.body.role || 'other',
      teamSize: req.body.teamSize || 1,
    });

    // Add user to event attendees
    await event.addAttendee(req.user._id);

    // Add event to user's attending list
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { eventsAttending: event._id } });

    // Emit RSVP event
    appEvents.emit('event:rsvp', {
      eventTitle: event.title,
      userEmail: req.user.email,
    });

    res.status(201).json({ success: true, data: rsvp });
  } catch (error) {
    // Handle duplicate RSVP (unique compound index)
    if (error.code === 11000) {
      return next(ApiError.conflict('You have already RSVPed to this event'));
    }
    next(error);
  }
};

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  rsvpToEvent,
};
