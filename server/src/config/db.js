const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connUri = process.env.MONGO_URI || 'mongodb://localhost:27017/credify';
    console.log(`[Database] Attempting to connect to: ${connUri}`);
    
    // Connect to MongoDB with a timeout so it doesn't hang indefinitely if offline
    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 5000
    });
    
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database] Error connecting to MongoDB: ${error.message}`);
    console.log('[Database] IMPORTANT: Running without a live MongoDB connection. Ensure MongoDB is running locally, or configure a valid MONGO_URI in your .env file.');
  }
};

module.exports = connectDB;
