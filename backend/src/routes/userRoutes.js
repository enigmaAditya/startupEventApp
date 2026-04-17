/* ============================================
   StartupEvents — User Routes
   Syllabus: BE Unit II — express.Router()
   ============================================ */

const express = require('express');
const router = express.Router();

const { 
  getMe, 
  updateMe, 
  getAllUsers, 
  updateUserRole, 
  toggleUserStatus,
  requestOrganizerAccess,
  revokeApplication,
  verifyOrganizer
} = require('../controllers/userController');
const protect = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

/**
 * GET /api/v1/users/me  — Get current user profile (private)
 * PUT /api/v1/users/me  — Update current user profile (private)
 */
router.use(protect); // All user routes require authentication

router.route('/me').get(getMe).put(updateMe);

// Organizer Verification - Attendee Actions
router.post('/request-organizer', requestOrganizerAccess);
router.post('/revoke-application', revokeApplication);

// Administrative Routes (Admin Only)
router.route('/').get(authorize('admin'), getAllUsers);
router.patch('/:id/role', authorize('admin'), updateUserRole);
router.patch('/:id/status', authorize('admin'), toggleUserStatus);
router.patch('/:id/verify', authorize('admin'), verifyOrganizer);

module.exports = router;
