/* ============================================
   StartupEvents — Auth Controller
   Syllabus: BE Unit III — JWT, bcrypt, authentication
   ============================================ */

const { validationResult } = require('express-validator');
const User = require('../models/User');
const { ApiError } = require('../middlewares/errorHandler');
const appEvents = require('../utils/appEvents');

/**
 * Helper: Send token response (set cookies + send JSON)
 * Demonstrates: res.cookie(), token management
 */
const sendTokenResponse = (user, statusCode, res) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Cookie options
  const cookieOptions = {
    httpOnly: true, // Not accessible via JavaScript
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  // Don't include password in response
  const userResponse = {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };

  res
    .status(statusCode)
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 })
    .json({
      success: true,
      data: {
        user: userResponse,
        accessToken,
        refreshToken,
      },
    });
};

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 *
 * Demonstrates: User.create(), validation, 201 status, EventEmitter
 */
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { firstName, lastName, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(ApiError.conflict('An account with this email already exists'));
    }

    // Create user (password is hashed in pre-save hook)
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'attendee',
    });

    // Emit registration event
    appEvents.emit('user:registered', { email: user.email });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 *
 * Demonstrates: findByEmail (with password), comparePassword, JWT generation
 */
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user with password field (select: false by default)
    const user = await User.findByEmail(email);
    if (!user) {
      return next(ApiError.unauthorized('Invalid email or password'));
    }

    // Compare passwords using bcrypt
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(ApiError.unauthorized('Invalid email or password'));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user (clear cookies)
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
const logout = (req, res) => {
  res
    .status(200)
    .cookie('accessToken', '', { maxAge: 0 })
    .cookie('refreshToken', '', { maxAge: 0 })
    .json({ success: true, message: 'Logged out successfully' });
};

module.exports = { register, login, logout };
