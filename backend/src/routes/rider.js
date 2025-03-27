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

const router = express.Router();

// Branch manager and admin routes
router.post('/', protect, isAdminOrManager, createRider);
router.get('/branch/:branch_id', protect, isAdminOrManager, getBranchRiders);
router.get('/branch/:branchId/rider-statuses', protect, isAdminOrManager, getBranchRiderStatuses);

// Routes that allow both admin/manager and self-update for riders
router.put('/:id', protect, isAdminOrManagerOrSelfRider, updateRider);

// Rider routes
router.get('/:id', protect, getRiderStatus);  
router.get('/:userId/orders', protect, isRider, getRiderOrders);
router.post('/location', protect, isRider, updateRiderLocation);
router.get('/delivery/:order_id', protect, isRiderForOrder, getDeliveryInformation);



// New settings routes
router.get('/:rider_id/settings', protect, getRiderSettings);
router.put('/:rider_id/settings', protect, updateRiderSettings);
router.put('/:rider_id/availability', protect, updateRiderAvailability);

export default router;