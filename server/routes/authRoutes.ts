import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.ts';
import { protect } from '../middleware/authMiddleware.ts';

const router = Router();

// Public auth endpoints
router.post('/register', register);
router.post('/login', login);

// Protected endpoints
router.get('/me', protect, getMe);

export default router;
