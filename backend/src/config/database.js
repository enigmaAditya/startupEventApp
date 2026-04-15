/* ============================================
   StartupEvents — Database Connection
   Syllabus: BE Unit I — Async/await, third-party modules
   ============================================ */

const mongoose = require('mongoose');
const config = require('./index');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB
 * Demonstrates: async/await, try/catch, third-party module (mongoose)
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Handle connection events using EventEmitter pattern
// Demonstrates: EventEmitter (mongoose.connection is an EventEmitter)
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB error: ${err.message}`);
});

module.exports = connectDB;
