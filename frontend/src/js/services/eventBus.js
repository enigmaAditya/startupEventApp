/* ============================================
   StartupEvents — Client-Side Event Bus
   Syllabus: FE Unit III — Prototypes, prototype chain,
             EventEmitter pattern, class syntax
   ============================================ */

/**
 * Client-side EventEmitter using class syntax + prototype chain
 * 
 * This mirrors Node.js EventEmitter API on the browser side.
 * Demonstrates: class syntax (ES6+), prototype methods,
 *               Map, Set, spread operator, Symbol.iterator
 */
class ClientEventBus {
  constructor() {
    // Map of eventName → Set of listener functions
    this._listeners = new Map();
    this._onceListeners = new Map();
  }

  /**
   * Register an event listener
   * Demonstrates: Map.get/set, Set.add, method chaining
   *
   * @param {string} eventName
   * @param {Function} listener
   * @returns {ClientEventBus} this (for chaining)
   */
  on(eventName, listener) {
    if (!this._listeners.has(eventName)) {
      this._listeners.set(eventName, new Set());
    }
    this._listeners.get(eventName).add(listener);
    return this; // Enable chaining: bus.on('a', fn1).on('b', fn2)
  }

  /**
   * Register a one-time event listener
   * Demonstrates: closure wrapping an original listener
   *
   * @param {string} eventName
   * @param {Function} listener
   * @returns {ClientEventBus}
   */
  once(eventName, listener) {
    if (!this._onceListeners.has(eventName)) {
      this._onceListeners.set(eventName, new Set());
    }
    this._onceListeners.get(eventName).add(listener);
    return this;
  }

  /**
   * Remove a specific listener
   * @param {string} eventName
   * @param {Function} listener
   * @returns {ClientEventBus}
   */
  off(eventName, listener) {
    this._listeners.get(eventName)?.delete(listener);
    this._onceListeners.get(eventName)?.delete(listener);
    return this;
  }

  /**
   * Emit an event — call all registered listeners
   * Demonstrates: spread operator, Set.forEach, try/catch per listener
   *
   * @param {string} eventName
   * @param {...*} args - Arguments to pass to listeners
   */
  emit(eventName, ...args) {
    // Call regular listeners
    const listeners = this._listeners.get(eventName);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`EventBus error in "${eventName}" listener:`, error);
        }
      });
    }

    // Call and remove one-time listeners
    const onceListeners = this._onceListeners.get(eventName);
    if (onceListeners) {
      onceListeners.forEach((listener) => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`EventBus error in once "${eventName}" listener:`, error);
        }
      });
      this._onceListeners.delete(eventName);
    }
  }

  /**
   * Remove all listeners for an event (or all events)
   * @param {string} [eventName] - If omitted, removes all
   */
  removeAllListeners(eventName) {
    if (eventName) {
      this._listeners.delete(eventName);
      this._onceListeners.delete(eventName);
    } else {
      this._listeners.clear();
      this._onceListeners.clear();
    }
  }

  /**
   * Get number of listeners for an event
   * @param {string} eventName
   * @returns {number}
   */
  listenerCount(eventName) {
    const regular = this._listeners.get(eventName)?.size || 0;
    const once = this._onceListeners.get(eventName)?.size || 0;
    return regular + once;
  }
}

// Create and expose singleton event bus
// This bus is used for client-side pub/sub communication between modules
window.__eventBus = new ClientEventBus();

// ---- Register default application event handlers ----

// Example: When user logs in, update UI everywhere
window.__eventBus.on('auth:login', (user) => {
  console.log(`[EventBus] User logged in: ${user.email}`);
  // Update navbar, enable protected features, etc.
});

// Example: When an event is RSVPed, show a toast
window.__eventBus.on('event:rsvped', (eventData) => {
  if (typeof window.showToast === 'function') {
    window.showToast({
      type: 'success',
      title: 'RSVP Confirmed!',
      message: `You're registered for "${eventData.title}"`,
    });
  }
});

// Example: When filters change, track for analytics
window.__eventBus.on('filter:changed', (filters) => {
  console.log('[EventBus] Filters changed:', filters);
});
