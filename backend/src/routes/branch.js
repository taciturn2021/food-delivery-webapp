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

router.post('/', protect, isAdmin, createBranch);
router.get('/', protect, isAdminOrManager, getAllBranches);
router.put('/:id', protect, isAdmin, updateBranch);
router.delete('/:id', protect, isAdmin, deleteBranch);
router.get('/:id/menu', protect, isAdminOrManager, getBranchMenu);

export default router;