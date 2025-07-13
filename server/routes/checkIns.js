import express from 'express';
import {
  getAllCheckIns,
  getCheckInsByDate,
  getCheckInsByMember,
  createCheckIn,
  updateCheckIn,
  getCheckInStats
} from '../controllers/checkInController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// @route   GET /api/checkins/stats
// @desc    Get check-in statistics
// @access  Private
router.get('/stats', getCheckInStats);

// @route   GET /api/checkins
// @desc    Get all check-ins
// @access  Private
router.get('/', getAllCheckIns);

// @route   GET /api/checkins/date/:date
// @desc    Get check-ins by date
// @access  Private
router.get('/date/:date', getCheckInsByDate);

// @route   GET /api/checkins/member/:memberId
// @desc    Get check-ins by member
// @access  Private
router.get('/member/:memberId', getCheckInsByMember);

// @route   POST /api/checkins
// @desc    Create check-in/check-out
// @access  Private
router.post('/', createCheckIn);

// @route   PUT /api/checkins/:id
// @desc    Update check-in
// @access  Private
router.put('/:id', updateCheckIn);

export default router;