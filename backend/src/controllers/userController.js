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

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/v1/users
 * @access  Private (Admin)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user role (Admin only)
 * @route   PATCH /api/v1/users/:id/role
 * @access  Private (Admin)
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    
    if (!['attendee', 'organizer', 'admin'].includes(role)) {
      return next(ApiError.badRequest('Invalid role'));
    }

    const updateData = { role };
    // If Admin manually demotes to attendee, reset verification status
    if (role === 'attendee') {
      updateData.organizerStatus = 'none';
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(ApiError.notFound('User not found'));
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle user active status (Admin only)
 * @route   PATCH /api/v1/users/:id/status
 * @access  Private (Admin)
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(ApiError.notFound('User not found'));
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Request organizer status (Attendee -> Organizer)
 * @route   POST /api/v1/users/request-organizer
 * @access  Private (Attendee)
 */
const requestOrganizerAccess = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.role === 'organizer' && user.organizerStatus === 'verified') {
      return next(ApiError.badRequest('You are already a verified organizer'));
    }

    // Cooldown check for rejected applications
    if (user.organizerStatus === 'rejected' && user.organizerRejectionDate) {
      const waitDays = 20;
      const msPerDay = 24 * 60 * 60 * 1000;
      const timePassed = new Date() - new Date(user.organizerRejectionDate);
      const daysPassed = timePassed / msPerDay;

      if (daysPassed < waitDays) {
        const remainingDays = Math.ceil(waitDays - daysPassed);
        return next(ApiError.badRequest(`Your application was recently rejected. Please wait ${remainingDays} more day(s) before re-applying.`));
      }
    }

    user.organizerStatus = 'pending';
    user.organizerRejectionDate = undefined; // Reset on new application
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Application submitted successfully',
      data: { organizerStatus: user.organizerStatus }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Revoke organizer application
 * @route   POST /api/v1/users/revoke-application
 * @access  Private
 */
const revokeApplication = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    // If verified, they already lost RSVP, but we allow down-grading back to attendee
    user.role = 'attendee';
    user.organizerStatus = 'none';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Application revoked/Role reset to attendee',
      data: { role: user.role, organizerStatus: user.organizerStatus }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin Approve/Verify Organizer
 * @route   PATCH /api/v1/users/:id/verify
 * @access  Private (Admin)
 */
const verifyOrganizer = async (req, res, next) => {
  try {
    const { status } = req.body; // 'verified' or 'rejected'
    
    if (!['verified', 'rejected'].includes(status)) {
      return next(ApiError.badRequest('Invalid status'));
    }

    const updateData = { organizerStatus: status };
    if (status === 'verified') {
      updateData.role = 'organizer';
      updateData.organizerRejectionDate = undefined;
    } else {
      updateData.role = 'attendee';
      updateData.organizerRejectionDate = new Date();
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return next(ApiError.notFound('User not found'));
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getMe, 
  updateMe, 
  getAllUsers, 
  updateUserRole, 
  toggleUserStatus,
  requestOrganizerAccess,
  revokeApplication,
  verifyOrganizer
};
