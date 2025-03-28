import express from 'express';
import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getCustomerActiveOrders,
    getCustomerOrderHistory,
    assignRiderToOrder,
    getBranchPendingOrders,
    riderUpdateOrderStatus
} from '../controllers/orderController.js';
import { protect, isAdminOrManager, isRider, isRiderForOrder } from '../middleware/auth.js';
import { isBranchActive } from '../middleware/orders.js';
import { orderReadLimiter, orderWriteLimiter } from '../middleware/rateLimiter/index.js';

const router = express.Router();

// General order routes with specific rate limiters
router.post('/', protect, orderWriteLimiter, isBranchActive, createOrder);
router.get('/', protect, orderReadLimiter, isAdminOrManager, getOrders);

// Customer order routes with read rate limiter
router.get('/customer/active', protect, orderReadLimiter, getCustomerActiveOrders);
router.get('/customer/history', protect, orderReadLimiter, getCustomerOrderHistory);

// Branch order routes with read rate limiter
router.get('/branch/pending', protect, orderReadLimiter, isAdminOrManager, getBranchPendingOrders);

// ID-specific routes
router.get('/:id', protect, orderReadLimiter, getOrderById);
router.put('/:id/status', protect, orderWriteLimiter, isAdminOrManager, updateOrderStatus);
router.put('/:id/cancel', protect, orderWriteLimiter, cancelOrder);
router.put('/:id/assign-rider', protect, orderWriteLimiter, isAdminOrManager, assignRiderToOrder);

// rider routes with write rate limiter
router.put('/:id/rider-status', protect, orderWriteLimiter, isRiderForOrder, riderUpdateOrderStatus);

export default router;