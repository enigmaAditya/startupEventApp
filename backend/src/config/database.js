/* ============================================
   StartupEvents — Database Connection
   Syllabus: BE Unit I — Async/await, third-party modules
   ============================================ */

const mongoose = require('mongoose');
const config = require('./index');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB with Auto-Retry logic
 * Demonstrates: recursive async functions, exponential backoff (simplified), robust error handling
 */
const connectDB = async () => {
  try {
    logger.info(`🔍 Connecting to MongoDB: ${config.mongoUri.split('@')[1] || 'URL HIDDEN'}`);
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 10000, // Increased timeout for slow production handshakes
      socketTimeoutMS: 45000,
    });
    logger.info(`✅ MongoDB Connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`❌ MONGODB CONNECTION FATAL: ${error.message}`);
    logger.error(`💡 DEBUG TIP: Check if Render IP is whitelisted in MongoDB Atlas or if MONGODB_URI is set.`);
    logger.info('🚑 Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

// Handle connection events using EventEmitter pattern
// Demonstrates: Automatic recovery on mid-session disconnects
mongoose.connection.on('disconnected', () => {
  logger.warn('⚠️ MongoDB disconnected. Entering recovery mode...');
  setTimeout(connectDB, 5000);
});

mongoose.connection.on('error', (err) => {
  logger.error(`🚨 MongoDB error: ${err.message}`);
});

module.exports = connectDB;
