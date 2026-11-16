const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_video_studio';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });

    isConnected = conn.connections[0].readyState === 1;
    console.log(`[Database] MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[Database] MongoDB connection warning: ${error.message}`);
    console.warn('[Database] Running in disconnected/offline mode until MongoDB URI is available.');
  }

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.warn('[Database] MongoDB disconnected.');
  });

  mongoose.connection.on('reconnected', () => {
    isConnected = true;
    console.log('[Database] MongoDB reconnected.');
  });
};

const getDBStatus = () => ({
  connected: isConnected,
  readyState: mongoose.connection.readyState
});

module.exports = {
  connectDB,
  getDBStatus
};

