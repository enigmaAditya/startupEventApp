/* ============================================
   StartupEvents — In-Memory Cache (Closure + Map)
   Syllabus: FE Unit III — Closures, Map, Date,
             higher-order functions
   ============================================ */

/**
 * Create a cache factory with TTL (Time To Live)
 * 
 * Uses closures to encapsulate the cache Map and configuration.
 * Each cache instance has its own private state (via closure).
 *
 * Demonstrates: closures, Map, factory function,
 *               Date.now(), higher-order functions
 *
 * @param {Object} options
 * @param {number} options.ttl - Time-to-live in milliseconds (default: 5 minutes)
 * @param {number} options.maxSize - Maximum cache entries (default: 100)
 * @returns {Object} Cache instance with get/set/has/clear/stats methods
 */
const createCache = ({ ttl = 5 * 60 * 1000, maxSize = 100 } = {}) => {
  // Private state — closed over by returned methods
  const store = new Map(); // Map preserves insertion order
  let hits = 0;
  let misses = 0;

  /**
   * Evict expired entries
   * Demonstrates: Map.entries(), for...of, destructuring, Date comparison
   */
  const evictExpired = () => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.expiresAt) {
        store.delete(key);
      }
    }
  };

  /**
   * Evict oldest entries if cache is full (LRU-like)
   * Demonstrates: Map iterator, while loop
   */
  const evictOldest = () => {
    while (store.size >= maxSize) {
      // Map.keys().next() gives the oldest (first inserted) key
      const oldestKey = store.keys().next().value;
      store.delete(oldestKey);
    }
  };

  return {
    /**
     * Get a cached value by key
     * @param {string} key
     * @returns {*|undefined} Cached value or undefined if not found/expired
     */
    get: (key) => {
      const entry = store.get(key);

      if (!entry) {
        misses++;
        return undefined;
      }

      // Check if expired
      if (Date.now() > entry.expiresAt) {
        store.delete(key);
        misses++;
        return undefined;
      }

      hits++;
      return entry.value;
    },

    /**
     * Set a value in the cache
     * @param {string} key
     * @param {*} value
     * @param {number} [customTtl] - Override default TTL
     */
    set: (key, value, customTtl) => {
      evictExpired();
      evictOldest();

      store.set(key, {
        value,
        expiresAt: Date.now() + (customTtl || ttl),
        createdAt: Date.now(),
      });
    },

    /**
     * Check if a key exists and is not expired
     * @param {string} key
     * @returns {boolean}
     */
    has: (key) => {
      const entry = store.get(key);
      if (!entry) return false;
      if (Date.now() > entry.expiresAt) {
        store.delete(key);
        return false;
      }
      return true;
    },

    /**
     * Delete a specific key
     * @param {string} key
     * @returns {boolean}
     */
    delete: (key) => store.delete(key),

    /** Clear entire cache */
    clear: () => {
      store.clear();
      hits = 0;
      misses = 0;
    },

    /** Get cache statistics */
    stats: () => ({
      size: store.size,
      maxSize,
      ttl,
      hits,
      misses,
      hitRate: hits + misses > 0 ? ((hits / (hits + misses)) * 100).toFixed(1) + '%' : '0%',
    }),
  };
};

// Create named cache instances for different data types
window.__cache = {
  events: createCache({ ttl: 3 * 60 * 1000, maxSize: 200 }),  // 3 min for events
  users: createCache({ ttl: 10 * 60 * 1000, maxSize: 50 }),    // 10 min for user data
  search: createCache({ ttl: 1 * 60 * 1000, maxSize: 100 }),   // 1 min for search results
};
