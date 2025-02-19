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

const router = express.Router();

// Public routes
router.get('/public', getAllBranches); // Public endpoint for customers
router.get('/:id/menu/public', getPublicBranchMenu);

// Admin-only routes
router.post('/', protect, isAdmin, createBranch);
router.delete('/:id', protect, isAdmin, deleteBranch);

// Admin and branch manager routes
router.get('/', protect, isAdminOrManager, getAllBranches);
router.get('/:id/menu', protect, isAdminOrManager, getBranchMenu);
router.get('/:id/settings', protect, isAdminOrManager, getBranchSettings);
router.put('/:id/settings', protect, isAdminOrManager, updateBranchSettings);
router.put('/:id', protect, isAdminOrManager, updateBranch);

export default router;