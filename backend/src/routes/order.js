import express from 'express';
import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder
} from '../controllers/orderController.js';
import { protect, isAdminOrManager } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/', protect, isAdminOrManager, getOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, isAdminOrManager, updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);

export default router;import express from 'express';
import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder
} from '../controllers/orderController.js';
import { protect, isAdminOrManager } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/', protect, isAdminOrManager, getOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, isAdminOrManager, updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);

export default router;