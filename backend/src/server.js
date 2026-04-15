/* ============================================
   StartupEvents — Server Entry Point
   Syllabus: BE Unit I — EventEmitter, Node.js setup
   BE Unit II — HTTP server
   BE Unit III — Socket.IO integration
   ============================================ */

const http = require('http');
const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const connectDB = require('./config/database');
const { initializeSocketIO } = require('./sockets');

/**
 * Start the server
 * Demonstrates: HTTP module, async server startup, EventEmitter (server events)
 */
const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Create HTTP server from Express app
  // Demonstrates: http.createServer — wrapping Express for Socket.IO
  const server = http.createServer(app);

  // Initialize Socket.IO
  // Demonstrates: Socket.IO attached to HTTP server (BE Unit III)
  initializeSocketIO(server);

  // Start listening
  server.listen(config.port, () => {
    logger.info(`🚀 Server running in ${config.nodeEnv} mode on port ${config.port}`);
    logger.info(`📡 API: http://localhost:${config.port}/api/v1`);
    logger.info(`🌐 Frontend: http://localhost:${config.port}`);
  });

  // Handle server errors
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      logger.error(`Port ${config.port} is already in use`);
    } else {
      logger.error(`Server error: ${error.message}`);
    }
    process.exit(1);
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    logger.info(`${signal} received. Graceful shutdown...`);
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

// Handle unhandled rejections
process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
});

// Start the server
startServer();
