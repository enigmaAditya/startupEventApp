/* ============================================
   StartupEvents — Analytics Routes
   Syllabus: BE Unit V — Express Router,
             route organization, middleware chaining
   ============================================ */

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const protect = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

// Public route — track views (no auth required)
router.post('/track/view', analyticsController.trackView);

// Protected routes — require authentication
router.use(protect);

// Any authenticated user can view their own activity
router.get('/activity', analyticsController.getUserActivity);

// Organizer & Admin routes
router.get('/dashboard', authorize('organizer', 'admin'), analyticsController.getDashboard);
router.get('/events/:id', authorize('organizer', 'admin'), analyticsController.getEventAnalytics);

// Admin-only routes
router.get('/top-events', authorize('admin'), analyticsController.getTopEvents);
router.get('/active-users', authorize('admin'), analyticsController.getMostActiveUsers);
router.get('/platform', authorize('admin'), analyticsController.getPlatformActivity);

module.exports = router;
