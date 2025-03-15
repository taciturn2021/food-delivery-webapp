import { Router } from 'express';
import { login, register, getProfile, registerCustomer, updateProfile, updatePassword } from '../controllers/authController.js';
import { protect, isAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/register', protect, isAdmin, register); // Protected admin-only registration for staff
router.post('/register/customer', registerCustomer); // Public customer registration
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);

export default router;