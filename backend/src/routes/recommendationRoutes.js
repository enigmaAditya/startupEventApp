const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendationController');
const protect = require('../middlewares/auth');

/**
 * Recommendations
 * GET /api/v1/recommendations — Get personalized upcoming events
 */
router.get('/', protect, getRecommendations);

module.exports = router;
