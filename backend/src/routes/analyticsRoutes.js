const express = require('express');
const router = express.Router();
const { getOrganizerAnalytics } = require('../controllers/analyticsController');
const protect = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

// All routes are protected and restricted to organizers/admins
router.use(protect);
router.use(authorize('organizer', 'admin'));

/**
 * @route   GET /api/v1/analytics/organizer
 * @desc    Get aggregated analytics for the logged-in organizer
 */
router.get('/organizer', getOrganizerAnalytics);

module.exports = router;
