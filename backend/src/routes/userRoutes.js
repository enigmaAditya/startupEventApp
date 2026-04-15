/* ============================================
   StartupEvents — User Routes
   Syllabus: BE Unit II — express.Router()
   ============================================ */

const express = require('express');
const router = express.Router();

const { getMe, updateMe } = require('../controllers/userController');
const protect = require('../middlewares/auth');

/**
 * GET /api/v1/users/me  — Get current user profile (private)
 * PUT /api/v1/users/me  — Update current user profile (private)
 */
router.use(protect); // All user routes require authentication

router.route('/me').get(getMe).put(updateMe);

module.exports = router;
