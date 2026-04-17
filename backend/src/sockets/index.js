/* ============================================
   StartupEvents — Socket.IO Setup
   Syllabus: BE Unit III — WebSockets, Socket.IO,
             sending/receiving messages, rooms
   ============================================ */

const { Server } = require('socket.io');
const logger = require('../utils/logger');
const Event = require('../models/Event');

let io;

/**
 * Initialize Socket.IO with the HTTP server
 * Demonstrates: Socket.IO setup, connection handling,
 *               rooms, emit/on patterns
 *
 * @param {import('http').Server} server
 */
const initializeSocketIO = (server) => {
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
  io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' ? false : corsOrigin,
      methods: ['GET', 'POST'],
    },
  });

  // ---- Connection Handler ----
  io.on('connection', (socket) => {
    logger.debug(`Socket connected: ${socket.id}`);

    // ---- Join event room (for per-event chat) ----
    // Demonstrates: Socket.IO rooms
    socket.on('join:event', async (eventId) => {
      socket.join(`event:${eventId}`);
      logger.debug(`Socket ${socket.id} joined room event:${eventId}`);
      
      try {
        const event = await Event.findById(eventId).select('chatHistory');
        if (event && event.chatHistory) {
          socket.emit('chat:history', event.chatHistory);
        }
      } catch (err) {
        logger.error(`Error fetching chat history for event ${eventId}: ${err.message}`);
      }

      // Notify room that a new user joined
      socket.to(`event:${eventId}`).emit('user:joined', {
        message: 'A new user joined the event chat',
        timestamp: new Date().toISOString(),
      });
    });

    // ---- Leave event room ----
    socket.on('leave:event', (eventId) => {
      socket.leave(`event:${eventId}`);
      logger.debug(`Socket ${socket.id} left room event:${eventId}`);
    });

    // ---- Chat message in event room ----
    // Demonstrates: receiving messages and broadcasting
    socket.on('chat:message', async ({ eventId, message, user, userId }) => {
      const chatMessage = {
        user,
        userId,
        message,
        timestamp: new Date().toISOString(),
      };

      try {
        await Event.findByIdAndUpdate(eventId, {
          $push: {
            chatHistory: {
              userId: userId,
              userName: user,
              message: message,
              timestamp: new Date(),
            }
          }
        });
      } catch (err) {
        logger.error(`Error saving chat to DB: ${err.message}`);
      }

      // Broadcast to everyone in the event room (except sender)
      socket.to(`event:${eventId}`).emit('chat:message', chatMessage);
    });

    // ---- Typing indicator ----
    socket.on('chat:typing', ({ eventId, user }) => {
      socket.to(`event:${eventId}`).emit('chat:typing', { user });
    });

    // ---- Disconnect ----
    socket.on('disconnect', (reason) => {
      logger.debug(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  logger.info('Socket.IO initialized');
};

/**
 * Emit a notification to all connected clients
 * Used by controllers/services to push real-time updates
 *
 * @param {string} eventName - Event name to emit
 * @param {Object} data - Data to send
 */
const emitNotification = (eventName, data) => {
  if (io) {
    io.emit(eventName, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Emit notification to a specific event room
 * @param {string} eventId - The event's MongoDB ID
 * @param {string} eventName - Socket event name
 * @param {Object} data - Data to send
 */
const emitToEventRoom = (eventId, eventName, data) => {
  if (io) {
    io.to(`event:${eventId}`).emit(eventName, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }
};

module.exports = { initializeSocketIO, emitNotification, emitToEventRoom };
