import express from 'express';
import {
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAdminStats
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateAdmin } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// @route   GET /api/admin/stats
// @desc    Get admin statistics
// @access  Private (Super Admin only)
router.get('/stats', authorize('super_admin'), getAdminStats);

// @route   GET /api/admin
// @desc    Get all admins
// @access  Private (Super Admin only)
router.get('/', authorize('super_admin'), getAllAdmins);

// @route   POST /api/admin
// @desc    Create new admin
// @access  Private (Super Admin only)
router.post('/', authorize('super_admin'), validateAdmin, createAdmin);

// @route   PUT /api/admin/:id
// @desc    Update admin
// @access  Private
router.put('/:id', updateAdmin);

// @route   DELETE /api/admin/:id
// @desc    Delete admin
// @access  Private (Super Admin only)
router.delete('/:id', authorize('super_admin'), deleteAdmin);

export default router;