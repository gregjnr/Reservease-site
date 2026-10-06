import { Request, Response, NextFunction } from 'express';

/**
 * Handle 404 Not Found for API endpoints
 */
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new Error(`Resource Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Centralized Error Handler Middleware
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found: invalid ID format';
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((el: any) => el.message);
    message = `Validation Error: ${errors.join(', ')}`;
  }

  // Handle MongoDB Duplicate Key (code 11000)
  if (err.code === 11000) {
    statusCode = 409; // Conflict
    if (err.keyPattern && err.keyPattern.email) {
      message = 'An account with this email address already exists';
    } else if (err.keyPattern && (err.keyPattern.timeSlot || err.keyPattern.service)) {
      message = 'Double-booking conflict: This time slot is already booked for this service. Please choose another slot.';
    } else {
      message = 'Duplicate field value entered. A record with this unique value already exists.';
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
