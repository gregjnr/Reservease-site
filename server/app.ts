import express, { Application, Request, Response, Router } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.ts';
import serviceRoutes from './routes/serviceRoutes.ts';
import bookingRoutes from './routes/bookingRoutes.ts';
import { notFound, errorHandler } from './middleware/errorMiddleware.ts';

const app: Application = express();

// Enable permissive CORS for serverless & decoupled deployments
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Core API Router definition
const apiRouter = Router();

// Health Check API
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'ReserveEase Booking System API is operational (Vercel Serverless Ready)',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Modular Routes
apiRouter.use('/auth', authRoutes);
apiRouter.use('/services', serviceRoutes);
apiRouter.use('/bookings', bookingRoutes);

// Dual Mount: Mount at both '/api' (for local Vite/standalone Express) and root '/'
// (for Vercel serverless functions where /api path prefix may or may not be stripped by rewrite)
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Centralized error handling
app.use(errorHandler);

export default app;
