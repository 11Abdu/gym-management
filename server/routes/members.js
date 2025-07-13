import express from 'express';
import {
  getAllMembers,
  getMemberById,
  getMemberByMemberId,
  createMember,
  updateMember,
  deleteMember,
  getMemberStats
} from '../controllers/memberController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateMember } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// @route   GET /api/members/stats
// @desc    Get member statistics
// @access  Private
router.get('/stats', getMemberStats);

// @route   GET /api/members
// @desc    Get all members
// @access  Private
router.get('/', getAllMembers);

// @route   GET /api/members/:id
// @desc    Get member by ID
// @access  Private
router.get('/:id', getMemberById);

// @route   GET /api/members/member-id/:memberId
// @desc    Get member by member ID
// @access  Private
router.get('/member-id/:memberId', getMemberByMemberId);

// @route   POST /api/members
// @desc    Create new member
// @access  Private
router.post('/', validateMember, createMember);

// @route   PUT /api/members/:id
// @desc    Update member
// @access  Private
router.put('/:id', updateMember);

// @route   DELETE /api/members/:id
// @desc    Delete member
// @access  Private (Admin only)
router.delete('/:id', authorize('admin', 'super_admin'), deleteMember);

export default router;