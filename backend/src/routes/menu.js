import express from 'express';
import { 
    createMenuItem, 
    getAllMenuItems, 
    updateMenuItem, 
    deleteMenuItem,
    assignMenuItemToBranch 
} from '../controllers/menuController.js';
import { protect, isAdmin, isAdminOrManager } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, isAdmin, createMenuItem);
router.get('/', protect, isAdminOrManager, getAllMenuItems);
router.put('/:id', protect, isAdmin, updateMenuItem);
router.delete('/:id', protect, isAdmin, deleteMenuItem);
router.post('/branch-assignment', protect, isAdminOrManager, assignMenuItemToBranch);

export default router;