/* ============================================
   StartupEvents — Custom EventEmitter (App Event Bus)
   Syllabus: BE Unit I — EventEmitter, callbacks
   ============================================ */

const EventEmitter = require('events');

/**
 * Application-level event bus
 * Extends Node's built-in EventEmitter
 * Demonstrates: EventEmitter, inheritance, callbacks
 *
 * Events emitted:
 *   - 'user:registered' — when a new user signs up
 *   - 'event:created'   — when a new event is created
 *   - 'event:rsvp'      — when someone RSVPs to an event
 *   - 'event:cancelled' — when an event is cancelled
 */
class AppEventBus extends EventEmitter {
  constructor() {
    super();

    // Set max listeners to avoid memory leak warnings
    this.setMaxListeners(20);

    // Log all events in development
    if (process.env.NODE_ENV !== 'production') {
      this._setupDevLogging();
    }
  }

  /**
   * Setup development logging for all events
   * Demonstrates: callbacks, arrow functions, template literals
   * @private
   */
  _setupDevLogging() {
    const originalEmit = this.emit.bind(this);
    const logger = require('./logger');

    this.emit = (eventName, ...args) => {
      logger.debug(`Event emitted: "${eventName}" with ${args.length} arg(s)`);
      return originalEmit(eventName, ...args);
    };
  }
}

// Singleton pattern — single event bus for the entire app
const appEvents = new AppEventBus();

// ---- Register default event listeners (callbacks) ----

// Demonstrates: callback pattern, event-driven architecture
appEvents.on('user:registered', (userData) => {
  const logger = require('./logger');
  logger.info(`New user registered: ${userData.email}`);
  // In production: send welcome email, update analytics, etc.
});

appEvents.on('event:created', (eventData) => {
  const logger = require('./logger');
  logger.info(`New event created: "${eventData.title}" by ${eventData.organizer}`);
  // In production: notify subscribers, update search index, etc.
});

appEvents.on('event:rsvp', (rsvpData) => {
  const logger = require('./logger');
  logger.info(`RSVP received for event "${rsvpData.eventTitle}" by ${rsvpData.userEmail}`);
  // In production: send confirmation email, update attendee count, etc.
});

module.exports = appEvents;
