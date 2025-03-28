import express from 'express';
import { 
    createMenuItem, 
    getAllMenuItems, 
    updateMenuItem, 
    deleteMenuItem,
    assignMenuItemToBranch 
} from '../controllers/menuController.js';
import { protect, isAdmin, isAdminOrManager } from '../middleware/auth.js';
import { menuReadLimiter, menuWriteLimiter } from '../middleware/rateLimiter/index.js';

const router = express.Router();

// Apply write limiter to create operations
router.post('/', protect, menuWriteLimiter, isAdmin, createMenuItem);

// Apply read limiter to get operations
router.get('/', protect, menuReadLimiter, isAdminOrManager, getAllMenuItems);

// Apply write limiter to update/delete operations
router.put('/:id', protect, menuWriteLimiter, isAdmin, updateMenuItem);
router.delete('/:id', protect, menuWriteLimiter, isAdmin, deleteMenuItem);
router.post('/branch-assignment', protect, menuWriteLimiter, isAdminOrManager, assignMenuItemToBranch);

export default router;