import { Router } from 'express';
import {
  getAvailableSlots,
  createBooking,
  getMyBookings,
  getAllBookings,
  cancelBooking,
  updateBookingStatus,
} from '../controllers/bookingController.ts';
import { protect, authorizeAdmin } from '../middleware/authMiddleware.ts';

const router = Router();

// Public route to inspect real-time availability
router.get('/available-slots', getAvailableSlots);

// Customer protected routes
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.patch('/:id/cancel', protect, cancelBooking);

// Admin-only booking management
router.get('/', protect, authorizeAdmin, getAllBookings);
router.patch('/:id/status', protect, authorizeAdmin, updateBookingStatus);

export default router;
