import dotenv from 'dotenv';
dotenv.config();

import app from './app.ts';
import { connectDB, disconnectDB } from './config/db.ts';
import { seedDatabase } from './utils/seed.ts';

const PORT = Number(process.env.PORT) || 5000;

async function startStandaloneServer() {
  try {
    await connectDB();
    await seedDatabase();

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 [Server] Standalone Express server running on port ${PORT}`);
      console.log(`📡 [API] Base URL: http://localhost:${PORT}/api`);
    });

    const shutdown = async () => {
      console.log('Shutting down server...');
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Fatal error starting standalone server:', error);
    process.exit(1);
  }
}

startStandaloneServer();
