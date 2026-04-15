/* ============================================
   StartupEvents — AI Routes
   Syllabus: BE Unit VI — API versioning,
             third-party API integration
   ============================================ */

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const aiService = require('../services/aiService');
const Event = require('../models/Event');

// @desc    Get AI status (is OpenAI configured?)
// @route   GET /api/v1/ai/status
// @access  Public
router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      available: aiService.isAIAvailable(),
      message: aiService.isAIAvailable()
        ? 'AI features are enabled'
        : 'AI features are running in mock mode (no API key configured)',
    },
  });
});

// @desc    Get personalized event recommendations
// @route   GET /api/v1/ai/recommendations
// @access  Private
router.get('/recommendations', protect, async (req, res, next) => {
  try {
    const user = req.user;
    const interests = user.interests || [];

    // Get upcoming events
    const events = await Event.find({ status: 'upcoming' })
      .sort({ date: 1 })
      .limit(20)
      .lean();

    const recommendations = await aiService.getRecommendations(interests, events);

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Enhance event description with AI
// @route   POST /api/v1/ai/enhance-description
// @access  Private (Organizer)
router.post('/enhance-description', protect, async (req, res, next) => {
  try {
    const enhanced = await aiService.enhanceDescription(req.body);

    res.json({
      success: true,
      data: { description: enhanced },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Semantic search for events
// @route   GET /api/v1/ai/search?q=query
// @access  Public
router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        error: { message: 'Search query "q" is required' },
      });
    }

    const events = await Event.find({ status: 'upcoming' }).lean();
    const results = await aiService.semanticSearch(q, events);

    res.json({
      success: true,
      data: results.slice(0, 10), // Top 10 results
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
