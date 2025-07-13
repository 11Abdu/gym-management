import express from 'express';
import {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  togglePlanStatus
} from '../controllers/planController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validatePlan } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// @route   GET /api/plans
// @desc    Get all plans
// @access  Private
router.get('/', getAllPlans);

// @route   GET /api/plans/:id
// @desc    Get plan by ID
// @access  Private
router.get('/:id', getPlanById);

// @route   POST /api/plans
// @desc    Create new plan
// @access  Private (Admin only)
router.post('/', authorize('admin', 'super_admin'), validatePlan, createPlan);

// @route   PUT /api/plans/:id
// @desc    Update plan
// @access  Private (Admin only)
router.put('/:id', authorize('admin', 'super_admin'), updatePlan);

// @route   PUT /api/plans/:id/toggle-status
// @desc    Toggle plan active status
// @access  Private (Admin only)
router.put('/:id/toggle-status', authorize('admin', 'super_admin'), togglePlanStatus);

// @route   DELETE /api/plans/:id
// @desc    Delete plan
// @access  Private (Admin only)
router.delete('/:id', authorize('admin', 'super_admin'), deletePlan);

export default router;