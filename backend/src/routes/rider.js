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
    getBranchRiderStatuses,
    getRiderSettings,
    updateRiderSettings,
    updateRiderAvailability
} from '../controllers/riderController.js';
import { protect, isAdmin, isAdminOrManager, isRider, isRiderForOrder, isAdminOrManagerOrSelfRider } from '../middleware/auth.js';

const router = express.Router();

// Branch manager and admin routes
router.post('/', protect, isAdminOrManager, createRider);
router.get('/branch/:branch_id', protect, isAdminOrManager, getBranchRiders);
router.post('/assign-order', protect, isAdminOrManager, assignOrderToRider);
router.get('/branch/:branchId/rider-statuses', protect, isAdminOrManager, getBranchRiderStatuses);

// Routes that allow both admin/manager and self-update for riders
router.put('/:id', protect, isAdminOrManagerOrSelfRider, updateRider);

// Rider routes
router.get('/:id', protect, getRiderStatus);  // Changed from /:riderId/status to /:id
router.get('/:rider_id/orders', protect, isRider, getRiderOrders);
router.put('/orders/:orderId/status', protect, isRider, isRiderForOrder, updateDeliveryStatus);
router.post('/location', protect, isRider, updateRiderLocation);
router.get('/delivery/:assignment_id/location', protect, getDeliveryLocation);

// Delivery metrics routes
router.post('/delivery/:orderId/start', protect, isRider, startDelivery);
router.post('/delivery/:orderId/complete', protect, isRider, completeDelivery);
router.post('/delivery/:orderId/rate', protect, submitDeliveryRating);
router.get('/:rider_id/metrics', protect, isAdminOrManager, getRiderMetrics);

// New settings routes
router.get('/:rider_id/settings', protect, getRiderSettings);
router.put('/:rider_id/settings', protect, updateRiderSettings);
router.put('/:rider_id/availability', protect, updateRiderAvailability);

export default router;