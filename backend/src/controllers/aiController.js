const aiService = require('../services/aiService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * Generate an event draft from a user prompt
 * POST /api/v1/ai/generate-draft
 */
exports.generateDraft = catchAsync(async (req, res, next) => {
  const { prompt } = req.body;

  if (!prompt) {
    return next(new AppError('Please provide an event description prompt', 400));
  }

  const draft = await aiService.generateEventDraft(prompt);

  res.status(200).json({
    success: true,
    data: draft
  });
});
