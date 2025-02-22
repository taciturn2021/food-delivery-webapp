import { Router } from 'express';
import { login, register, getProfile, registerCustomer } from '../controllers/authController.js';
import { protect, isAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/register', protect, isAdmin, register); // Protected admin-only registration for staff
router.post('/register/customer', registerCustomer); // Public customer registration
router.get('/profile', protect, getProfile);

export default router;