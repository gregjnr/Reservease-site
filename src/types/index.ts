export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  createdAt?: string;
}

export interface WorkingHours {
  start: string;
  end: string;
  slotInterval: number;
}

export interface Service {
  _id: string;
  id?: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  isActive: boolean;
  availableDays: number[];
  workingHours: WorkingHours;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type BookingStatus = 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  _id: string;
  id?: string;
  user: string | { _id: string; name: string; email: string; phone?: string };
  service: string | Service;
  date: string;
  timeSlot: string;
  status: BookingStatus;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AvailableSlotsResponse {
  date: string;
  serviceId: string;
  serviceName?: string;
  duration?: number;
  price?: number;
  isOperatingDay: boolean;
  availableSlots: string[];
  bookedSlots: string[];
  allSlots: string[];
  message?: string;
}
