import express from 'express';
import {
    createRider,
    getBranchRiders,
    updateRider,
    getRiderOrders,
    updateRiderLocation,
    getDeliveryInformation,
    getRiderStatus,
    getBranchRiderStatuses,
    getRiderSettings,
    updateRiderSettings,
    updateRiderAvailability
} from '../controllers/riderController.js';
import { protect, isAdmin, isAdminOrManager, isRider, isRiderForOrder, isAdminOrManagerOrSelfRider } from '../middleware/auth.js';
import { riderReadLimiter, riderWriteLimiter } from '../middleware/rateLimiter/index.js';

const router = express.Router();

// Branch manager and admin routes
router.post('/', protect, riderWriteLimiter, isAdminOrManager, createRider);
router.get('/branch/:branch_id', protect, riderReadLimiter, isAdminOrManager, getBranchRiders);
router.get('/branch/:branchId/rider-statuses', protect, riderReadLimiter, isAdminOrManager, getBranchRiderStatuses);

// Routes that allow both admin/manager and self-update for riders
router.put('/:id', protect, riderWriteLimiter, isAdminOrManagerOrSelfRider, updateRider);

// Rider routes - read operations
router.get('/:id', protect, riderReadLimiter, getRiderStatus);  
router.get('/:userId/orders', protect, riderReadLimiter, isRider, getRiderOrders);
router.get('/delivery/:order_id', protect, riderReadLimiter, isRiderForOrder, getDeliveryInformation);

// Rider routes location update (no rate limiter)
// This route is for riders to update their location
router.post('/location', protect, isRider, updateRiderLocation);

// Settings routes
router.get('/:rider_id/settings', protect, riderReadLimiter, getRiderSettings);
router.put('/:rider_id/settings', protect, riderWriteLimiter, updateRiderSettings);
router.put('/:rider_id/availability', protect, riderWriteLimiter, updateRiderAvailability);

export default router;