const mongoose = require('mongoose');

let memoryServerInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mini-social-app';
  
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`Local MongoDB connection to ${uri} failed (${error.message}).`);
    
    // In development mode, auto-fallback to in-memory MongoDB for seamless localhost execution
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('Spawning internal in-memory MongoDB server for local development...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServerInstance = await MongoMemoryServer.create();
        const memUri = memoryServerInstance.getUri();
        const conn = await mongoose.connect(memUri);
        console.log(`In-Memory MongoDB Connected: ${conn.connection.host} (${memUri})`);
        return conn;
      } catch (memErr) {
        console.error(`In-Memory MongoDB Error: ${memErr.message}`);
      }
    }

    if (process.env.NODE_ENV === 'production') {
      console.error('Fatal: Could not connect to MongoDB Atlas in production.');
      process.exit(1);
    }
  }
};

module.exports = connectDB;
