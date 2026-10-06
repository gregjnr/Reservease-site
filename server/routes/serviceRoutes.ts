import { Router } from 'express';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from '../controllers/serviceController.ts';
import { protect, authorizeAdmin } from '../middleware/authMiddleware.ts';

const router = Router();

// Public routes
router.get('/', getAllServices);
router.get('/:id', getServiceById);

// Admin-only management routes
router.post('/', protect, authorizeAdmin, createService);
router.put('/:id', protect, authorizeAdmin, updateService);
router.delete('/:id', protect, authorizeAdmin, deleteService);

export default router;
