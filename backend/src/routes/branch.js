import express from 'express';
import {
    createBranch,
    getAllBranches,
    updateBranch,
    deleteBranch,
    getBranchMenu
} from '../controllers/branchController.js';
import { protect, isAdmin, isAdminOrManager } from '../middleware/auth.js';

const router = express.Router();

// Admin-only routes
router.post('/', protect, isAdmin, createBranch);
router.delete('/:id', protect, isAdmin, deleteBranch);

// Admin and branch manager routes
router.get('/', protect, isAdminOrManager, getAllBranches);
router.get('/:id/menu', protect, isAdminOrManager, getBranchMenu);
router.get('/:id/settings', protect, isAdminOrManager);
router.put('/:id/settings', protect, isAdminOrManager);
router.put('/:id', protect, isAdminOrManager, updateBranch);

export default router;