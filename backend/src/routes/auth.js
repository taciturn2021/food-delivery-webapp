import { Router } from 'express';
import { login, register, getProfile, registerCustomer, updateProfile, updatePassword } from '../controllers/authController.js';
import { protect, isAdmin } from '../middleware/auth.js';
import { loginLimiter, registerLimiter } from '../middleware/rateLimiter/index.js';

const router = Router();

// Apply more lenient rate limiting to login
router.post('/login', loginLimiter, login);

// Admin-only staff registration with stricter rate limiting
router.post('/register', protect, isAdmin, registerLimiter, register);

// Public customer registration with stricter rate limiting
router.post('/register/customer', registerLimiter, registerCustomer);

// Regular profile routes - no specific rate limiting
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);

export default router;