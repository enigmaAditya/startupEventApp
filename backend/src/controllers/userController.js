/* ============================================
   StartupEvents — User Controller
   Syllabus: BE Unit II — RESTful endpoints
   ============================================ */

const User = require('../models/User');
const { ApiError } = require('../middlewares/errorHandler');

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/users/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('eventsOrganized', 'title date status')
      .populate('eventsAttending', 'title date status');

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current user profile
 * @route   PUT /api/v1/users/me
 * @access  Private
 */
const updateMe = async (req, res, next) => {
  try {
    // Only allow updating specific fields
    const allowedFields = ['firstName', 'lastName', 'bio', 'interests', 'avatar'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMe, updateMe };
