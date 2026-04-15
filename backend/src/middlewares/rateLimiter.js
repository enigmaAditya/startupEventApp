/* ============================================
   StartupEvents — Rate Limiter Middleware
   Syllabus: BE Unit III — Security, middleware
   ============================================ */

const rateLimit = require('express-rate-limit');
const config = require('../config');

/**
 * Rate limiter middleware
 * Limits each IP to a set number of requests per window
 * Demonstrates: third-party middleware, protection against brute-force
 */
const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    error: {
      message: 'Too many requests, please try again later',
    },
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
});

module.exports = rateLimiter;
