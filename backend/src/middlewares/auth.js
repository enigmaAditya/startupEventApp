/* ============================================
   StartupEvents — JWT Auth Middleware
   Syllabus: BE Unit III — JWT, middleware, security
   ============================================ */

const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const { ApiError } = require('./errorHandler');

/**
 * Protect routes — verify JWT access token
 * Demonstrates: middleware pattern, JWT verification,
 *               async middleware, Bearer token extraction
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header
    // Format: "Bearer <token>"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Also check cookies
    else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(ApiError.unauthorized('Access denied. No token provided.'));
    }

    // Verify token
    // Demonstrates: jwt.verify, async/await
    const decoded = jwt.verify(token, config.jwt.secret);

    // Get user from database
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(ApiError.unauthorized('User no longer exists'));
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = protect;
