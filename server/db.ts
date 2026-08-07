import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

let isConnected = false;

export async function connectToDatabase() {
  if (isConnected) return;

  if (!MONGODB_URI) {
    console.log('[MongoDB] MONGODB_URI not set. Running with fallback memory store adapter.');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    isConnected = true;
    console.log('[MongoDB] Connected successfully to MongoDB Atlas.');
  } catch (error) {
    console.error('[MongoDB] Connection error, using memory fallback:', error);
  }
}

export function isDbConnected(): boolean {
  return isConnected;
}
