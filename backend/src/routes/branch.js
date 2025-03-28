import express from 'express';
import {
    createBranch,
    getAllBranches,
    updateBranch,
    deleteBranch,
    getBranchMenu,
    getBranchSettings,
    updateBranchSettings,
    getPublicBranchMenu
} from '../controllers/branchController.js';
import { protect, isAdmin, isAdminOrManager } from '../middleware/auth.js';
import { branchReadLimiter, branchWriteLimiter } from '../middleware/rateLimiter/index.js';

const router = express.Router();

// Public routes with read limiters
router.get('/public', branchReadLimiter, getAllBranches); // Public endpoint for customers
router.get('/:id/menu/public', branchReadLimiter, getPublicBranchMenu);

// Admin-only routes with write limiters
router.post('/', protect, branchWriteLimiter, isAdmin, createBranch);
router.delete('/:id', protect, branchWriteLimiter, isAdmin, deleteBranch);

// Admin and branch manager routes with appropriate limiters
router.get('/', protect, branchReadLimiter, isAdminOrManager, getAllBranches);
router.get('/:id/menu', protect, branchReadLimiter, isAdminOrManager, getBranchMenu);
router.get('/:id/settings', protect, branchReadLimiter, isAdminOrManager, getBranchSettings);
router.put('/:id/settings', protect, branchWriteLimiter, isAdminOrManager, updateBranchSettings);
router.put('/:id', protect, branchWriteLimiter, isAdminOrManager, updateBranch);

export default router;