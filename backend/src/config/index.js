/* ============================================
   StartupEvents — Configuration Loader
   Syllabus: BE Unit I — Core modules (fs, path),
             JSON parsing, dotenv (third-party)
   ============================================ */

const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
// Demonstrates: third-party module (dotenv), path.resolve (core module)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Application configuration object
 * Demonstrates: object destructuring, default values, computed properties
 */
const config = {
  // Server
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',

  // MongoDB
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/startupevents',

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret',
    expire: process.env.JWT_EXPIRE || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '30d',
  },

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 10000, // Significantly higher limit for development
  },

  // OpenAI (optional — AI features run in mock mode without a key)
  openaiApiKey: process.env.OPENAI_API_KEY || null,
};

module.exports = config;
