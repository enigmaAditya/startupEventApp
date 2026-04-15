/* ============================================
   StartupEvents — Error Handler Middleware
   Syllabus: BE Unit II — Error handling, custom errors,
             error middleware (4 params)
   ============================================ */

const logger = require('../utils/logger');

/**
 * Custom API Error class
 * Demonstrates: class inheritance, custom error types
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Distinguishes from programmer errors
    Error.captureStackTrace(this, this.constructor);
  }
}

// Pre-defined error factories
// Demonstrates: static methods, factory pattern
ApiError.badRequest = (msg = 'Bad Request') => new ApiError(400, msg);
ApiError.unauthorized = (msg = 'Unauthorized') => new ApiError(401, msg);
ApiError.forbidden = (msg = 'Forbidden') => new ApiError(403, msg);
ApiError.notFound = (msg = 'Resource not found') => new ApiError(404, msg);
ApiError.conflict = (msg = 'Conflict') => new ApiError(409, msg);
ApiError.internal = (msg = 'Internal Server Error') => new ApiError(500, msg);

/**
 * 404 Not Found handler
 * Demonstrates: app.all() catch-all for undefined routes
 */
const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Route ${req.originalUrl} not found`));
};

/**
 * Global error handling middleware
 * Demonstrates: error-handling middleware (4 parameters — err, req, res, next)
 * Express recognizes this as an error handler due to the 4 params
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const errorHandler = (err, req, res, next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific Mongoose errors
  // Demonstrates: switch statement, error type checking

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map((e) => e.message);
    message = messages.join('. ');
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `A record with this ${field} already exists`;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
  }

  // Log the error
  if (statusCode >= 500) {
    logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method}`);
    if (process.env.NODE_ENV !== 'production') {
      logger.error(err.stack);
    }
  } else {
    logger.warn(`${statusCode} - ${message} - ${req.originalUrl}`);
  }

  // Send response
  // Demonstrates: setting response status code and headers
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
};

module.exports = { ApiError, errorHandler, notFoundHandler };
