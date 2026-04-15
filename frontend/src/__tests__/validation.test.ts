/* ============================================
   StartupEvents — Vitest Frontend Tests
   Syllabus: FE Unit VI — Testing, code quality,
             unit tests for validators and filters
   ============================================ */

import { describe, it, expect, beforeEach } from 'vitest';

// ============ VALIDATOR TESTS ============

/**
 * Email validator
 * Demonstrates: testing pure functions, regex patterns
 */
const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

/**
 * Password strength validator
 */
const isStrongPassword = (value: string): boolean =>
  value.length >= 8 && /[A-Z]/.test(value) && /[0-9]/.test(value);

/**
 * Name validator
 */
const isValidName = (value: string): boolean =>
  value.trim().length >= 2;

describe('Form Validators', () => {
  describe('isValidEmail', () => {
    it('should accept valid email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user@domain.co.in')).toBe(true);
      expect(isValidEmail('dev+tag@company.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('@nodomain.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user @example.com')).toBe(false);
    });
  });

  describe('isStrongPassword', () => {
    it('should accept strong passwords', () => {
      expect(isStrongPassword('Password1')).toBe(true);
      expect(isStrongPassword('MyP@ssw0rd!')).toBe(true);
      expect(isStrongPassword('StrongPass9')).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(isStrongPassword('')).toBe(false);
      expect(isStrongPassword('short1')).toBe(false);       // Too short
      expect(isStrongPassword('alllowercase1')).toBe(false); // No uppercase
      expect(isStrongPassword('NoNumbers')).toBe(false);     // No digits
    });
  });

  describe('isValidName', () => {
    it('should accept valid names', () => {
      expect(isValidName('Aditya')).toBe(true);
      expect(isValidName('Ab')).toBe(true);
    });

    it('should reject invalid names', () => {
      expect(isValidName('')).toBe(false);
      expect(isValidName('A')).toBe(false);
      expect(isValidName('  ')).toBe(false);
    });
  });
});

// ============ FILTER TESTS ============

interface TestEvent {
  title: string;
  category: string;
  date: string;
  location: { city: string };
  tags: string[];
}

/**
 * Filter events by category
 * Demonstrates: testing Array.filter logic
 */
const filterByCategory = (events: TestEvent[], category: string): TestEvent[] => {
  if (!category || category === 'all') return events;
  return events.filter((e) => e.category === category);
};

/**
 * Sort events by date
 */
const sortByDate = (events: TestEvent[], direction: 'asc' | 'desc' = 'asc'): TestEvent[] => {
  return [...events].sort((a, b) => {
    const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
    return direction === 'asc' ? diff : -diff;
  });
};

/**
 * Search events by title
 */
const searchEvents = (events: TestEvent[], query: string): TestEvent[] => {
  const q = query.toLowerCase().trim();
  if (!q) return events;
  return events.filter(
    (e) => e.title.toLowerCase().includes(q) || e.tags.some((t) => t.toLowerCase().includes(q)),
  );
};

describe('Event Filters', () => {
  let mockEvents: TestEvent[];

  beforeEach(() => {
    mockEvents = [
      { title: 'AI Hackathon', category: 'hackathon', date: '2026-06-15', location: { city: 'Mumbai' }, tags: ['AI', 'ML'] },
      { title: 'Pitch Night', category: 'pitch-night', date: '2026-05-10', location: { city: 'Bangalore' }, tags: ['SaaS', 'Funding'] },
      { title: 'React Workshop', category: 'workshop', date: '2026-07-01', location: { city: 'Delhi' }, tags: ['React', 'Web3'] },
      { title: 'Founder Meetup', category: 'meetup', date: '2026-04-20', location: { city: 'Bangalore' }, tags: ['Networking'] },
    ];
  });

  describe('filterByCategory', () => {
    it('should return all events when category is "all"', () => {
      expect(filterByCategory(mockEvents, 'all')).toHaveLength(4);
    });

    it('should filter by specific category', () => {
      const result = filterByCategory(mockEvents, 'hackathon');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('AI Hackathon');
    });

    it('should return empty for non-existent category', () => {
      expect(filterByCategory(mockEvents, 'conference')).toHaveLength(0);
    });
  });

  describe('sortByDate', () => {
    it('should sort ascending by default', () => {
      const sorted = sortByDate(mockEvents);
      expect(sorted[0].title).toBe('Founder Meetup');
      expect(sorted[sorted.length - 1].title).toBe('React Workshop');
    });

    it('should sort descending', () => {
      const sorted = sortByDate(mockEvents, 'desc');
      expect(sorted[0].title).toBe('React Workshop');
    });

    it('should not mutate original array', () => {
      const original = [...mockEvents];
      sortByDate(mockEvents);
      expect(mockEvents).toEqual(original);
    });
  });

  describe('searchEvents', () => {
    it('should find events by title', () => {
      const result = searchEvents(mockEvents, 'hackathon');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('AI Hackathon');
    });

    it('should find events by tag', () => {
      const result = searchEvents(mockEvents, 'react');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('React Workshop');
    });

    it('should be case-insensitive', () => {
      expect(searchEvents(mockEvents, 'PITCH')).toHaveLength(1);
    });

    it('should return all events for empty query', () => {
      expect(searchEvents(mockEvents, '')).toHaveLength(4);
    });
  });
});

// ============ CACHE TESTS ============

/**
 * Minimal cache implementation for testing
 */
const createTestCache = <T>(ttl: number = 1000) => {
  const store = new Map<string, { value: T; expiresAt: number }>();
  return {
    get: (key: string): T | undefined => {
      const entry = store.get(key);
      if (!entry || Date.now() > entry.expiresAt) { store.delete(key); return undefined; }
      return entry.value;
    },
    set: (key: string, value: T) => {
      store.set(key, { value, expiresAt: Date.now() + ttl });
    },
    has: (key: string) => store.has(key) && Date.now() <= (store.get(key)?.expiresAt ?? 0),
    size: () => store.size,
  };
};

describe('Cache', () => {
  it('should store and retrieve values', () => {
    const cache = createTestCache<string>();
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('should return undefined for missing keys', () => {
    const cache = createTestCache<string>();
    expect(cache.get('missing')).toBeUndefined();
  });

  it('should expire entries after TTL', async () => {
    const cache = createTestCache<string>(50); // 50ms TTL
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');

    // Wait for expiry
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(cache.get('key1')).toBeUndefined();
  });
});
