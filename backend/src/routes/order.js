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
    getRiderAssignedOrders,
    updateRiderLocation,
    riderUpdateOrderStatus
} from '../controllers/orderController.js';
import { protect, isAdminOrManager, isRider } from '../middleware/auth.js';
import { isBranchActive } from '../middleware/orders.js';

const router = express.Router();

// General order routes
router.post('/', protect, isBranchActive, createOrder);
router.get('/', protect, isAdminOrManager, getOrders);

// Customer order routes - Place these BEFORE the /:id route to prevent conflicts
router.get('/customer/active', protect, getCustomerActiveOrders);
router.get('/customer/history', protect, getCustomerOrderHistory);

// Branch order routes
router.get('/branch/pending', protect, isAdminOrManager, getBranchPendingOrders);

// Rider order routes
router.get('/rider/assigned', protect, isRider, getRiderAssignedOrders);
router.put('/rider/location', protect, isRider, updateRiderLocation);

// ID-specific routes - Place these AFTER the more specific routes
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, isAdminOrManager, updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/assign-rider', protect, isAdminOrManager, assignRiderToOrder);
router.put('/:id/rider-status', protect, isRider, riderUpdateOrderStatus);

export default router;