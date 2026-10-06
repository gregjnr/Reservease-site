import mongoose, { Document, Model, Schema } from 'mongoose';

export type BookingStatus = 'confirmed' | 'cancelled' | 'completed';

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  service: mongoose.Types.ObjectId;
  date: string; // Format: YYYY-MM-DD (e.g. "2026-10-05")
  timeSlot: string; // Format: HH:mm (e.g. "09:30")
  status: BookingStatus;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service reference is required'],
      index: true,
    },
    date: {
      type: String,
      required: [true, 'Booking date (YYYY-MM-DD) is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'],
      index: true,
    },
    timeSlot: {
      type: String,
      required: [true, 'Booking time slot (HH:mm) is required'],
      match: [/^\d{2}:\d{2}$/, 'Time slot must be formatted as HH:mm'],
      index: true,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'completed'],
      default: 'confirmed',
      index: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerEmail: {
      type: String,
      required: [true, 'Customer email is required'],
      trim: true,
      lowercase: true,
    },
    customerPhone: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
    cancellationReason: {
      type: String,
      maxlength: [500, 'Cancellation reason cannot exceed 500 characters'],
    },
    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * DATABASE-LEVEL DOUBLE-BOOKING PREVENTION
 * Unique partial compound index:
 * Ensures that for any given service, date, and time slot, there can ONLY be ONE
 * document with status = 'confirmed'.
 * If another booking attempt occurs for the same slot, MongoDB will reject it with
 * a 11000 Duplicate Key error, even if two concurrent requests bypass the API validation.
 * When a booking is cancelled, status becomes 'cancelled', freeing up the unique index
 * so the slot can be booked again!
 */
bookingSchema.index(
  { service: 1, date: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'confirmed' },
    name: 'unique_confirmed_service_slot',
  }
);

export const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);
