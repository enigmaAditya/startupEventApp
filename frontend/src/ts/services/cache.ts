/* ============================================
   StartupEvents — Cache Service (TypeScript)
   Syllabus: FE Unit V — Generics, closures,
             Map with typed values
   ============================================ */

/**
 * Cache entry with TTL metadata
 * Demonstrates: generic interface — T is the cached value type
 */
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
}

/**
 * Cache configuration
 */
interface CacheOptions {
  ttl?: number;     // Time-to-live in ms
  maxSize?: number; // Maximum entries
}

/**
 * Cache statistics
 */
interface CacheStats {
  size: number;
  maxSize: number;
  ttl: number;
  hits: number;
  misses: number;
  hitRate: string;
}

/**
 * Cache instance interface
 * Demonstrates: generic interface — methods are typed per value type
 */
interface ICache<T> {
  get: (key: string) => T | undefined;
  set: (key: string, value: T, customTtl?: number) => void;
  has: (key: string) => boolean;
  delete: (key: string) => boolean;
  clear: () => void;
  stats: () => CacheStats;
}

/**
 * Create a type-safe, generic cache with TTL
 * 
 * Demonstrates: generic factory function — T flows through the entire
 * cache implementation, ensuring type-safe get/set operations.
 *
 * @template T - The type of values stored in this cache
 * @param options - Cache configuration
 * @returns A type-safe cache instance
 *
 * @example
 *   const eventCache = createCache<IEvent[]>({ ttl: 60000 });
 *   eventCache.set('latest', events);     // TS: events must be IEvent[]
 *   const cached = eventCache.get('latest'); // TS: cached is IEvent[] | undefined
 */
const createCache = <T>({ ttl = 5 * 60 * 1000, maxSize = 100 }: CacheOptions = {}): ICache<T> => {
  const store = new Map<string, CacheEntry<T>>();
  let hits = 0;
  let misses = 0;

  const evictExpired = (): void => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.expiresAt) {
        store.delete(key);
      }
    }
  };

  const evictOldest = (): void => {
    while (store.size >= maxSize) {
      const oldestKey = store.keys().next().value;
      if (oldestKey !== undefined) {
        store.delete(oldestKey);
      }
    }
  };

  return {
    get(key: string): T | undefined {
      const entry = store.get(key);
      if (!entry) { misses++; return undefined; }
      if (Date.now() > entry.expiresAt) { store.delete(key); misses++; return undefined; }
      hits++;
      return entry.value;
    },

    set(key: string, value: T, customTtl?: number): void {
      evictExpired();
      evictOldest();
      store.set(key, { value, expiresAt: Date.now() + (customTtl ?? ttl), createdAt: Date.now() });
    },

    has(key: string): boolean {
      const entry = store.get(key);
      if (!entry) return false;
      if (Date.now() > entry.expiresAt) { store.delete(key); return false; }
      return true;
    },

    delete: (key: string): boolean => store.delete(key),

    clear(): void { store.clear(); hits = 0; misses = 0; },

    stats(): CacheStats {
      return {
        size: store.size, maxSize, ttl, hits, misses,
        hitRate: hits + misses > 0 ? ((hits / (hits + misses)) * 100).toFixed(1) + '%' : '0%',
      };
    },
  };
};

export { createCache };
export type { ICache, CacheOptions, CacheStats };
