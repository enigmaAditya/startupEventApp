/* ============================================
   StartupEvents — Auth Routes
   Syllabus: BE Unit II — express.Router(), POST routes
   BE Unit III — Authentication endpoints
   ============================================ */

const express = require('express');
const router = express.Router();

const { register, login, logout } = require('../controllers/authController');
const protect = require('../middlewares/auth');
const { registerRules, loginRules } = require('../middlewares/validators/authValidator');

/**
 * POST /api/v1/auth/register — Register new user (public)
 * POST /api/v1/auth/login    — Login user (public)
 * POST /api/v1/auth/logout   — Logout user (private)
 */
router.post('/register', registerRules, register);
router.post('/login', loginRules, login);
router.post('/logout', protect, logout);

module.exports = router;
