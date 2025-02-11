import express from 'express';
import { login, register, getProfile } from '../controllers/authController.js';
import { protect, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', protect, isAdmin, register); // Only admins can register new users
router.get('/profile', protect, getProfile);

export default router;