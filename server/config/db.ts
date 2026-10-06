import mongoose from 'mongoose';

// Cache Mongoose connection across serverless function invocations (warm starts)
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };
if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

let memoryServerInstance: any = null;

/**
 * Connect to MongoDB database
 * - In Production / Vercel: Strictly requires MONGODB_URI (e.g. MongoDB Atlas) and caches connection.
 * - In Development: Connects to MONGODB_URI if provided, or dynamically imports MongoMemoryServer for local testing.
 */
export const connectDB = async (): Promise<typeof mongoose> => {
  // Return active cached connection if ready
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const isProduction =
    process.env.NODE_ENV === 'production' ||
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);

  const uri = process.env.MONGODB_URI;

  // Enforce MONGODB_URI in production
  if (isProduction) {
    if (!uri || uri.trim() === '') {
      throw new Error(
        'CRITICAL CONFIGURATION ERROR: MONGODB_URI is required in production / Vercel. Please set MONGODB_URI in your Vercel Project Settings > Environment Variables to connect to MongoDB Atlas.'
      );
    }
  }

  // Connect to configured MongoDB URI (MongoDB Atlas)
  if (uri && uri.trim() !== '') {
    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
      };
      cached.promise = mongoose.connect(uri, opts).then((instance) => {
        console.log('✅ [Database] Connected to MongoDB Atlas successfully');
        return instance;
      });
    }

    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (err) {
      cached.promise = null;
      if (isProduction) {
        console.error('❌ [Database] Failed to connect to MongoDB Atlas in production:', err);
        throw err;
      }
      console.warn('⚠️ [Database] External MongoDB connection failed in dev. Falling back to memory server...', err);
    }
  }

  // Development Fallback: Dynamically import MongoMemoryServer so it is not bundled on Vercel
  if (!isProduction) {
    try {
      if (!memoryServerInstance) {
        console.log('[Database] Initializing local MongoMemoryServer for development...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memoryServerInstance = await MongoMemoryServer.create();
      }
      const memoryUri = memoryServerInstance.getUri();
      cached.promise = mongoose.connect(memoryUri);
      cached.conn = await cached.promise;
      console.log(`✅ [Database] Connected to dev MongoMemoryServer at: ${memoryUri}`);
      return cached.conn;
    } catch (err) {
      console.error('❌ [Database] Failed to initialize MongoMemoryServer:', err);
      throw err;
    }
  }

  throw new Error('Database connection failed: No valid connection strategy found.');
};

/**
 * Disconnect from MongoDB and stop in-memory server if running
 */
export const disconnectDB = async (): Promise<void> => {
  try {
    if (cached.conn) {
      await mongoose.disconnect();
      cached.conn = null;
      cached.promise = null;
    }
    if (memoryServerInstance) {
      await memoryServerInstance.stop();
      memoryServerInstance = null;
    }
    console.log('🛑 [Database] Disconnected from MongoDB');
  } catch (err) {
    console.error('Error disconnecting from MongoDB:', err);
  }
};
