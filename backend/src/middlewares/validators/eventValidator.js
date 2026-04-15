/* ============================================
   StartupEvents — Event Validator
   Syllabus: BE Unit II — express-validator
   ============================================ */

const { body, query } = require('express-validator');

/**
 * Validation rules for creating an event
 * Demonstrates: express-validator chains, custom messages
 */
const createEventRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),

  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['hackathon', 'pitch-night', 'workshop', 'meetup', 'conference'])
    .withMessage('Invalid category'),

  body('date')
    .notEmpty().withMessage('Event date is required')
    .isISO8601().withMessage('Invalid date format')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Event date must be in the future');
      }
      return true;
    }),

  body('location.venue')
    .trim()
    .notEmpty().withMessage('Venue is required'),

  body('location.city')
    .trim()
    .notEmpty().withMessage('City is required'),

  body('capacity')
    .notEmpty().withMessage('Capacity is required')
    .isInt({ min: 1 }).withMessage('Capacity must be at least 1'),

  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
];

/**
 * Validation rules for updating an event
 */
const updateEventRules = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),

  body('category')
    .optional()
    .isIn(['hackathon', 'pitch-night', 'workshop', 'meetup', 'conference'])
    .withMessage('Invalid category'),

  body('capacity')
    .optional()
    .isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
];

/**
 * Validation rules for event query/filter params
 */
const eventQueryRules = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),

  query('category')
    .optional()
    .isIn(['hackathon', 'pitch-night', 'workshop', 'meetup', 'conference'])
    .withMessage('Invalid category filter'),
];

module.exports = { createEventRules, updateEventRules, eventQueryRules };
