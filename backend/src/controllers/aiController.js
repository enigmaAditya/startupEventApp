const aiService = require('../services/aiService');
const { ApiError } = require('../middlewares/errorHandler');

/**
 * @desc    Generate a full event draft from a simple prompt
 * @route   POST /api/v1/ai/generate-draft
 * @access  Private (Organizer)
 * 
 * Demonstrates: AI service integration, robust error handling consistent with codebase.
 */
exports.generateDraft = async (req, res, next) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return next(ApiError.badRequest('Please provide an event description prompt'));
    }

    const draft = await aiService.generateEventDraft(prompt);

    res.status(200).json({
      success: true,
      data: draft
    });
  } catch (error) {
    next(error);
  }
};
