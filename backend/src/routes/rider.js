import express from 'express';
import {
    createRider,
    getBranchRiders,
    updateRider,
    assignOrderToRider,
    getRiderOrders,
    updateDeliveryStatus,
    updateRiderLocation,
    getDeliveryLocation,
    startDelivery,
    completeDelivery,
    submitDeliveryRating,
    getRiderMetrics,
    getRiderStatus,
    getBranchRiderStatuses
} from '../controllers/riderController.js';
import { protect, isAdmin, isAdminOrManager, isRider, isRiderForOrder } from '../middleware/auth.js';

const router = express.Router();

// Branch manager and admin routes
router.post('/', protect, isAdminOrManager, createRider);
router.get('/branch/:branch_id', protect, isAdminOrManager, getBranchRiders);
router.put('/:id', protect, isAdminOrManager, updateRider);
router.post('/assign-order', protect, isAdminOrManager, assignOrderToRider);
router.get('/branch/:branchId/rider-statuses', protect, isAdminOrManager, getBranchRiderStatuses);

// Rider routes
router.get('/:rider_id/orders', protect, isRider, getRiderOrders);
router.put('/orders/:orderId/status', protect, isRider, isRiderForOrder, updateDeliveryStatus);
router.post('/location', protect, isRider, updateRiderLocation);
router.get('/delivery/:assignment_id/location', protect, getDeliveryLocation);
router.get('/:riderId/status', protect, getRiderStatus);

// Delivery metrics routes
router.post('/delivery/:orderId/start', protect, isRider, startDelivery);
router.post('/delivery/:orderId/complete', protect, isRider, completeDelivery);
router.post('/delivery/:orderId/rate', protect, submitDeliveryRating);
router.get('/:rider_id/metrics', protect, isAdminOrManager, getRiderMetrics);

export default router;