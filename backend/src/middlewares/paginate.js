/* ============================================
   StartupEvents — Pagination Middleware
   Syllabus: BE Unit IV — Mongoose pagination, .skip(), .limit()
   ============================================ */

/**
 * Reusable pagination middleware
 * Parses ?page=1&limit=10 query params and attaches pagination info to req
 *
 * Demonstrates: query parameter parsing, parseInt, default values,
 *               middleware pattern, req augmentation
 */
const paginate = (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  req.pagination = {
    page,
    limit,
    skip,
  };

  next();
};

/**
 * Create paginated response
 * @param {Array} data - The data array
 * @param {number} total - Total count of matching documents
 * @param {Object} pagination - req.pagination
 * @returns {Object} Formatted response
 */
const paginatedResponse = (data, total, pagination) => {
  const { page, limit } = pagination;
  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    count: data.length,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    data,
  };
};

module.exports = { paginate, paginatedResponse };
