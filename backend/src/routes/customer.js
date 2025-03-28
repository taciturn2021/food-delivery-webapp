import express from 'express';
import { protect } from '../middleware/auth.js';
import { customerReadLimiter, customerWriteLimiter } from '../middleware/rateLimiter/index.js';
import {
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getCustomerProfile,
    updateCustomerProfile
} from '../controllers/customerController.js';

const router = express.Router();

// Customer profile routes with appropriate rate limiters
router.get('/profile', protect, customerReadLimiter, getCustomerProfile);
router.put('/profile', protect, customerWriteLimiter, updateCustomerProfile);

// Address management routes
router.get('/addresses', protect, customerReadLimiter, getAddresses);
router.post('/addresses', protect, customerWriteLimiter, addAddress);
router.put('/addresses/:id', protect, customerWriteLimiter, updateAddress);
router.delete('/addresses/:id', protect, customerWriteLimiter, deleteAddress);
router.put('/addresses/:id/default', protect, customerWriteLimiter, setDefaultAddress);

export default router;