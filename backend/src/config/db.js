const mongoose = require('mongoose');

let memoryServerInstance = null;

const connectDB = async () => {
  const isProd = process.env.NODE_ENV === 'production';

  // Production Environment: Strictly require MONGODB_URI from environment variables
  if (isProd) {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      console.error('Fatal: MONGODB_URI environment variable is missing in production.');
      process.exit(1);
    }

    try {
      const conn = await mongoose.connect(uri);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      // Secure logging: Never print the connection string, credentials, or password
      console.error(`MongoDB Atlas connection error: ${error.message}`);
      process.exit(1);
    }
  }

  // Development / Local Environment: Try local connection, fallback to in-memory MongoDB
  const localUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mini-social-app';
  try {
    const conn = await mongoose.connect(localUri, { serverSelectionTimeoutMS: 3000 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`Local MongoDB connection failed (${error.message}).`);
    try {
      console.log('Spawning internal in-memory MongoDB server for local development...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServerInstance = await MongoMemoryServer.create();
      const memUri = memoryServerInstance.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (memErr) {
      console.error(`In-Memory MongoDB Error: ${memErr.message}`);
    }
  }
};

module.exports = connectDB;
