import { Request, Response } from 'express';
import { Booking } from '../models/Booking.ts';
import { Service } from '../models/Service.ts';
import { AuthRequest } from '../middleware/authMiddleware.ts';

/**
 * Helper to generate time slot strings (e.g. ["09:00", "09:30", "10:00", ...])
 */
function generateTimeSlots(start: string, end: string, intervalMinutes: number): string[] {
  const slots: string[] = [];
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);

  let current = startHour * 60 + startMinute;
  const finish = endHour * 60 + endMinute;

  while (current + intervalMinutes <= finish) {
    const hours = Math.floor(current / 60);
    const minutes = current % 60;
    const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    slots.push(formatted);
    current += intervalMinutes;
  }

  return slots;
}

/**
 * @desc    Get available time slots for a given service and date
 * @route   GET /api/bookings/available-slots
 * @access  Public
 */
export const getAvailableSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { serviceId, date } = req.query;

    if (!serviceId || !date) {
      res.status(400).json({
        success: false,
        message: 'Both serviceId and date (YYYY-MM-DD) query parameters are required',
      });
      return;
    }

    const dateStr = String(date);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      res.status(400).json({
        success: false,
        message: 'Invalid date format. Expected YYYY-MM-DD',
      });
      return;
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Service not found',
      });
      return;
    }

    if (!service.isActive) {
      res.status(400).json({
        success: false,
        message: 'This service is currently inactive and cannot be booked',
      });
      return;
    }

    // Determine Day of Week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    // Parse using UTC components to avoid timezone shifting
    const [year, month, day] = dateStr.split('-').map(Number);
    const targetDate = new Date(Date.UTC(year, month - 1, day));
    const dayOfWeek = targetDate.getUTCDay();

    // Check if the service is available on this day
    const availableDays = service.availableDays && service.availableDays.length > 0
      ? service.availableDays
      : [1, 2, 3, 4, 5, 6];

    if (!availableDays.includes(dayOfWeek)) {
      res.status(200).json({
        success: true,
        data: {
          date: dateStr,
          serviceId: service._id,
          isOperatingDay: false,
          availableSlots: [],
          bookedSlots: [],
          allSlots: [],
          message: 'The service is closed on this day of the week.',
        },
      });
      return;
    }

    // Generate base schedule slots
    const start = service.workingHours?.start || '09:00';
    const end = service.workingHours?.end || '17:00';
    const interval = service.workingHours?.slotInterval || 30;

    const allSlots = generateTimeSlots(start, end, interval);

    // Query active/confirmed bookings for this service and date
    const bookedDocs = await Booking.find({
      service: service._id,
      date: dateStr,
      status: 'confirmed',
    }).select('timeSlot');

    const bookedSlotSet = new Set(bookedDocs.map((b) => b.timeSlot));

    // Also check if date is in the past or today's passed hours
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const isToday = dateStr === todayStr;
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    // Filter available slots
    const availableSlots = allSlots.filter((slot) => {
      // Exclude if already booked
      if (bookedSlotSet.has(slot)) {
        return false;
      }
      // If it's today, exclude slots that have already passed
      if (isToday) {
        const [slotH, slotM] = slot.split(':').map(Number);
        const slotTotalMinutes = slotH * 60 + slotM;
        if (slotTotalMinutes <= currentTotalMinutes) {
          return false;
        }
      }
      return true;
    });

    res.status(200).json({
      success: true,
      data: {
        date: dateStr,
        serviceId: service._id,
        serviceName: service.name,
        duration: service.duration,
        price: service.price,
        isOperatingDay: true,
        availableSlots,
        bookedSlots: Array.from(bookedSlotSet),
        allSlots,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error calculating available slots',
    });
  }
};

/**
 * @desc    Create a new appointment booking
 * @route   POST /api/bookings
 * @access  Private (Logged-in user)
 */
export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { serviceId, date, timeSlot, customerName, customerEmail, customerPhone, notes } = req.body;

    if (!serviceId || !date || !timeSlot) {
      res.status(400).json({
        success: false,
        message: 'Please provide serviceId, date (YYYY-MM-DD), and timeSlot (HH:mm)',
      });
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({
        success: false,
        message: 'Date must be formatted as YYYY-MM-DD',
      });
      return;
    }

    if (!/^\d{2}:\d{2}$/.test(timeSlot)) {
      res.status(400).json({
        success: false,
        message: 'Time slot must be formatted as HH:mm',
      });
      return;
    }

    // Verify service existence & status
    const service = await Service.findById(serviceId);
    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Selected service does not exist',
      });
      return;
    }

    if (!service.isActive) {
      res.status(400).json({
        success: false,
        message: 'Selected service is currently inactive',
      });
      return;
    }

    // Check past dates
    const todayStr = new Date().toISOString().split('T')[0];
    if (date < todayStr) {
      res.status(400).json({
        success: false,
        message: 'Cannot book appointments in the past',
      });
      return;
    }

    // Pre-check for existing confirmed booking
    const existingConfirmed = await Booking.findOne({
      service: serviceId,
      date,
      timeSlot,
      status: 'confirmed',
    });

    if (existingConfirmed) {
      res.status(409).json({
        success: false,
        message: `The ${timeSlot} slot on ${date} is already booked. Please pick another available time slot.`,
      });
      return;
    }

    // Fallbacks for customer info from authenticated user
    const clientName = customerName || req.user?.name || 'Customer';
    const clientEmail = customerEmail || req.user?.email || 'customer@example.com';
    const clientPhone = customerPhone || req.user?.phone || '';

    // Create booking document
    // If concurrent requests collide, MongoDB's unique partial index throws code 11000
    const newBooking = await Booking.create({
      user: req.user?._id,
      service: service._id,
      date,
      timeSlot,
      customerName: clientName,
      customerEmail: clientEmail,
      customerPhone: clientPhone,
      notes: notes || '',
      status: 'confirmed',
    });

    // Populate service information
    await newBooking.populate('service', 'name duration price category imageUrl');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      data: newBooking,
    });
  } catch (error: any) {
    // Catch database-level unique index violation
    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        message: 'Double-booking conflict: This time slot was just booked by another user. Please choose another time slot.',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Error creating booking',
    });
  }
};

/**
 * @desc    Get bookings of the logged-in user
 * @route   GET /api/bookings/my-bookings
 * @access  Private
 */
export const getMyBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookings = await Booking.find({ user: req.user?._id })
      .populate('service', 'name duration price category imageUrl')
      .sort({ date: -1, timeSlot: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching your bookings',
    });
  }
};

/**
 * @desc    Get all bookings (Admin view with filters)
 * @route   GET /api/bookings
 * @access  Private/Admin
 */
export const getAllBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, serviceId, date, search } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (serviceId) query.service = serviceId;
    if (date) query.date = date;

    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
      ];
    }

    const bookings = await Booking.find(query)
      .populate('service', 'name duration price category')
      .populate('user', 'name email phone')
      .sort({ date: -1, timeSlot: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching all bookings',
    });
  }
};

/**
 * @desc    Cancel a booking (user cancels their own or admin cancels)
 * @route   PATCH /api/bookings/:id/cancel
 * @access  Private
 */
export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
      return;
    }

    // Ensure user owns this booking OR is admin
    const isOwner = booking.user.toString() === req.user?._id.toString();
    const isAdmin = req.user?.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking',
      });
      return;
    }

    if (booking.status === 'cancelled') {
      res.status(400).json({
        success: false,
        message: 'This booking is already cancelled',
      });
      return;
    }

    booking.status = 'cancelled';
    booking.cancellationReason = reason || (isAdmin ? 'Cancelled by administrator' : 'Cancelled by customer');
    booking.cancelledAt = new Date();

    await booking.save();
    await booking.populate('service', 'name duration price');

    res.status(200).json({
      success: true,
      message: 'Booking successfully cancelled. The time slot is now available again.',
      data: booking,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error cancelling booking',
    });
  }
};

/**
 * @desc    Update booking status (e.g. marked as completed or confirmed)
 * @route   PATCH /api/bookings/:id/status
 * @access  Private/Admin
 */
export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;

    if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Status must be one of: confirmed, cancelled, completed',
      });
      return;
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
      return;
    }

    booking.status = status;
    if (status === 'cancelled') {
      booking.cancelledAt = new Date();
    }
    await booking.save();
    await booking.populate('service', 'name duration price');

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: booking,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        message: 'Double-booking conflict: That slot is currently occupied by another active booking.',
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating booking status',
    });
  }
};
