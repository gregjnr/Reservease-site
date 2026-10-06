import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import app from './server/app.ts';
import { connectDB, disconnectDB } from './server/config/db.ts';
import { seedDatabase } from './server/utils/seed.ts';

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  try {
    // 1. Connect to Database (auto-fallback to MongoMemoryServer if no URI)
    await connectDB();

    // 2. Seed initial admin user and services
    await seedDatabase();

    // 3. Mount Frontend
    if (!isProd) {
      // Create Vite dev server in middleware mode
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          hmr: process.env.DISABLE_HMR !== 'true',
          watch: process.env.DISABLE_HMR === 'true' ? null : {},
        },
        appType: 'spa',
      });

      // Mount Vite middleware after Express API routes
      app.use(vite.middlewares);
      console.log('⚡ [Vite] Dev middleware mounted');
    } else {
      // Production: serve built static client files
      const distPath = path.resolve(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
      console.log(`📦 [Production] Serving static files from ${distPath}`);
    }

    // 4. Start HTTP Server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🌟 [ReserveEase] Full-Stack server is live on http://0.0.0.0:${PORT}`);
    });

    // Graceful shutdown
    const handleExit = async () => {
      console.log('Closing HTTP server and database connections...');
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on('SIGINT', handleExit);
    process.on('SIGTERM', handleExit);
  } catch (error) {
    console.error('Fatal startup error in server.ts:', error);
    process.exit(1);
  }
}

startServer();
