import express from 'express';
import { protect } from '../middleware/auth.js';
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

// Customer profile routes
router.get('/profile', protect, getCustomerProfile);
router.put('/profile', protect, updateCustomerProfile);

// Address management routes
router.get('/addresses', protect, getAddresses);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:id', protect, updateAddress);
router.delete('/addresses/:id', protect, deleteAddress);
router.put('/addresses/:id/default', protect, setDefaultAddress);

export default router;