import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IWorkingHours {
  start: string; // e.g., "09:00"
  end: string;   // e.g., "17:00"
  slotInterval: number; // in minutes, e.g., 30
}

export interface IService extends Document {
  name: string;
  description: string;
  duration: number; // duration in minutes (e.g. 30, 45, 60)
  price: number;    // price in USD
  category: string;
  isActive: boolean;
  availableDays: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  workingHours: IWorkingHours;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Service name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Service description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    duration: {
      type: Number,
      required: [true, 'Service duration in minutes is required'],
      min: [10, 'Duration must be at least 10 minutes'],
      max: [480, 'Duration cannot exceed 8 hours'],
      default: 30,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      default: 'General',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    availableDays: {
      type: [Number],
      default: [1, 2, 3, 4, 5, 6], // Monday to Saturday
    },
    workingHours: {
      start: {
        type: String,
        default: '09:00',
      },
      end: {
        type: String,
        default: '17:00',
      },
      slotInterval: {
        type: Number,
        default: 30, // 30 minutes interval
      },
    },
    imageUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Service: Model<IService> = mongoose.models.Service || mongoose.model<IService>('Service', serviceSchema);
