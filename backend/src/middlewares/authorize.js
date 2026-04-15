/* ============================================
   StartupEvents — RBAC Authorization Middleware
   Syllabus: BE Unit III — RBAC, middleware, closures
   ============================================ */

const { ApiError } = require('./errorHandler');

/**
 * Role-Based Access Control middleware factory
 * Returns a middleware function that checks if the user has one of the allowed roles
 *
 * Demonstrates: higher-order function (returns a function),
 *               closure (captures allowedRoles), rest parameters
 *
 * @param {...string} allowedRoles - Roles that are allowed access
 * @returns {Function} Express middleware
 *
 * Usage:
 *   router.delete('/events/:id', protect, authorize('admin'), deleteEvent);
 *   router.post('/events', protect, authorize('admin', 'organizer'), createEvent);
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user is set by the protect middleware
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }

    next();
  };
};

module.exports = authorize;
