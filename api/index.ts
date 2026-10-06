import type { Request, Response } from 'express';
import { connectDB } from '../server/config/db.ts';
import app from '../server/app.ts';
import { seedDatabase } from '../server/utils/seed.ts';

let isSeeded = false;

/**
 * Vercel Serverless Function Catch-All Handler
 * Handles all incoming requests routed under /api/*
 */
export default async function handler(req: Request, res: Response) {
  try {
    // 1. Establish or reuse cached MongoDB Atlas connection
    await connectDB();

    // 2. Ensure default admin and catalog services are seeded in Atlas on cold start
    if (!isSeeded) {
      await seedDatabase();
      isSeeded = true;
    }

    // 3. Delegate to Express application
    return app(req, res);
  } catch (error: any) {
    console.error('❌ [Serverless Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Serverless database or runtime error',
    });
  }
}
