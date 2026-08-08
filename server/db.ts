import mongoose from 'mongoose';

let isConnected = false;

export async function connectToDatabase() {
  if (isConnected) return;

  const envUri = process.env.MONGODB_URI;

  if (envUri) {
    try {
      // If URI doesn't specify trustbite database path, set dbName: 'trustbite'
      await mongoose.connect(envUri, {
        dbName: 'trustbite'
      });
      isConnected = true;
      console.log('MongoDB Connected');
      return;
    } catch (error) {
      console.warn('[MongoDB] Direct connection error, falling back to embedded MongoDB server:', error);
    }
  }

  // If process.env.MONGODB_URI is not supplied or failed, start embedded MongoDB Server
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create({
      instance: {
        dbName: 'trustbite'
      }
    });
    const uri = mongod.getUri();
    await mongoose.connect(uri, {
      dbName: 'trustbite'
    });
    isConnected = true;
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('Fatal MongoDB Connection Error:', err);
    throw err;
  }
}

export function isDbConnected(): boolean {
  return isConnected;
}
