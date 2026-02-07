import { describe, it, expect, beforeEach } from 'vitest';
import { LRUCache } from '../src/utils/cache.js';

describe('LRUCache', () => {
  describe('Constructor', () => {
    it('should create cache with default max size of 100', () => {
      const cache = new LRUCache<string, number>();
      expect(cache.getMaxSize()).toBe(100);
      expect(cache.getSize()).toBe(0);
    });

    it('should create cache with custom max size', () => {
      const cache = new LRUCache<string, number>(50);
      expect(cache.getMaxSize()).toBe(50);
    });

    it('should throw error for max size less than 1', () => {
      expect(() => new LRUCache<string, number>(0)).toThrow('Cache max size must be at least 1');
      expect(() => new LRUCache<string, number>(-5)).toThrow('Cache max size must be at least 1');
    });
  });

  describe('Basic Operations', () => {
    let cache: LRUCache<string, number>;

    beforeEach(() => {
      cache = new LRUCache<string, number>(3);
    });

    it('should set and get values', () => {
      cache.set('key1', 100);
      expect(cache.get('key1')).toBe(100);
      expect(cache.getSize()).toBe(1);
    });

    it('should return undefined for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('should check if key exists', () => {
      cache.set('key1', 100);
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(false);
    });

    it('should delete entries', () => {
      cache.set('key1', 100);
      expect(cache.has('key1')).toBe(true);

      const deleted = cache.delete('key1');
      expect(deleted).toBe(true);
      expect(cache.has('key1')).toBe(false);
      expect(cache.getSize()).toBe(0);
    });

    it('should return false when deleting non-existent key', () => {
      const deleted = cache.delete('nonexistent');
      expect(deleted).toBe(false);
    });

    it('should clear all entries', () => {
      cache.set('key1', 100);
      cache.set('key2', 200);
      cache.set('key3', 300);

      expect(cache.getSize()).toBe(3);
      cache.clear();
      expect(cache.getSize()).toBe(0);
      expect(cache.has('key1')).toBe(false);
    });

    it('should update existing key value', () => {
      cache.set('key1', 100);
      cache.set('key1', 200);
      expect(cache.get('key1')).toBe(200);
      expect(cache.getSize()).toBe(1);
    });
  });

  describe('LRU Eviction', () => {
    let cache: LRUCache<string, number>;

    beforeEach(() => {
      cache = new LRUCache<string, number>(3);
    });

    it('should evict least recently used item when capacity reached', () => {
      cache.set('key1', 100);
      cache.set('key2', 200);
      cache.set('key3', 300);

      // Cache is full (3/3). Adding key4 should evict key1 (least recently used)
      cache.set('key4', 400);

      expect(cache.has('key1')).toBe(false); // Evicted
      expect(cache.has('key2')).toBe(true);
      expect(cache.has('key3')).toBe(true);
      expect(cache.has('key4')).toBe(true);
      expect(cache.getSize()).toBe(3);
    });

    it('should update LRU order on get', () => {
      cache.set('key1', 100);
      cache.set('key2', 200);
      cache.set('key3', 300);

      // Access key1, moving it to most recently used
      cache.get('key1');

      // Add key4 - should evict key2 (now least recently used)
      cache.set('key4', 400);

      expect(cache.has('key1')).toBe(true); // Not evicted (was accessed)
      expect(cache.has('key2')).toBe(false); // Evicted
      expect(cache.has('key3')).toBe(true);
      expect(cache.has('key4')).toBe(true);
    });

    it('should update LRU order on set of existing key', () => {
      cache.set('key1', 100);
      cache.set('key2', 200);
      cache.set('key3', 300);

      // Update key1, moving it to most recently used
      cache.set('key1', 150);

      // Add key4 - should evict key2 (now least recently used)
      cache.set('key4', 400);

      expect(cache.has('key1')).toBe(true);
      expect(cache.get('key1')).toBe(150);
      expect(cache.has('key2')).toBe(false); // Evicted
      expect(cache.has('key3')).toBe(true);
      expect(cache.has('key4')).toBe(true);
    });

    it('should handle multiple evictions', () => {
      cache.set('key1', 100);
      cache.set('key2', 200);
      cache.set('key3', 300);

      // Fill cache and trigger multiple evictions
      cache.set('key4', 400); // Evicts key1
      cache.set('key5', 500); // Evicts key2
      cache.set('key6', 600); // Evicts key3

      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(false);
      expect(cache.has('key3')).toBe(false);
      expect(cache.has('key4')).toBe(true);
      expect(cache.has('key5')).toBe(true);
      expect(cache.has('key6')).toBe(true);
    });
  });

  describe('Statistics', () => {
    let cache: LRUCache<string, number>;

    beforeEach(() => {
      cache = new LRUCache<string, number>(3);
    });

    it('should track hits and misses', () => {
      cache.set('key1', 100);

      cache.get('key1'); // Hit
      cache.get('key1'); // Hit
      cache.get('nonexistent'); // Miss
      cache.get('nonexistent'); // Miss

      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(2);
    });

    it('should track evictions', () => {
      cache.set('key1', 100);
      cache.set('key2', 200);
      cache.set('key3', 300);
      cache.set('key4', 400); // Eviction
      cache.set('key5', 500); // Eviction

      const stats = cache.getStats();
      expect(stats.evictions).toBe(2);
    });

    it('should track current size', () => {
      const stats1 = cache.getStats();
      expect(stats1.size).toBe(0);

      cache.set('key1', 100);
      cache.set('key2', 200);

      const stats2 = cache.getStats();
      expect(stats2.size).toBe(2);
    });

    it('should reset stats on clear', () => {
      cache.set('key1', 100);
      cache.get('key1'); // Hit
      cache.get('nonexistent'); // Miss

      cache.clear();

      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.evictions).toBe(0);
      expect(stats.size).toBe(0);
    });

    it('should not reset eviction count when items are added after clear', () => {
      cache.set('key1', 100);
      cache.set('key2', 200);
      cache.set('key3', 300);
      cache.set('key4', 400); // Eviction

      expect(cache.getStats().evictions).toBe(1);

      cache.clear(); // Resets evictions to 0

      cache.set('key5', 500);
      cache.set('key6', 600);
      cache.set('key7', 700);
      cache.set('key8', 800); // New eviction

      const stats = cache.getStats();
      expect(stats.evictions).toBe(1); // Only counts evictions after clear
    });

    it('should not affect stats when checking with has', () => {
      cache.set('key1', 100);

      cache.has('key1');
      cache.has('nonexistent');

      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle cache of size 1', () => {
      const cache = new LRUCache<string, number>(1);

      cache.set('key1', 100);
      expect(cache.get('key1')).toBe(100);

      cache.set('key2', 200); // Evicts key1
      expect(cache.has('key1')).toBe(false);
      expect(cache.get('key2')).toBe(200);
      expect(cache.getSize()).toBe(1);
    });

    it('should handle empty cache operations', () => {
      const cache = new LRUCache<string, number>(10);

      expect(cache.get('any')).toBeUndefined();
      expect(cache.has('any')).toBe(false);
      expect(cache.delete('any')).toBe(false);
      expect(cache.getSize()).toBe(0);

      cache.clear(); // Should not throw
      expect(cache.getSize()).toBe(0);
    });

    it('should handle different key types', () => {
      const cache1 = new LRUCache<number, string>(5);
      cache1.set(1, 'one');
      cache1.set(2, 'two');
      expect(cache1.get(1)).toBe('one');

      const cache2 = new LRUCache<symbol, boolean>(5);
      const sym1 = Symbol('sym1');
      const sym2 = Symbol('sym2');
      cache2.set(sym1, true);
      cache2.set(sym2, false);
      expect(cache2.get(sym1)).toBe(true);
    });

    it('should handle different value types', () => {
      const cache = new LRUCache<string, { id: number; name: string }>(5);
      const user1 = { id: 1, name: 'Alice' };
      const user2 = { id: 2, name: 'Bob' };

      cache.set('user1', user1);
      cache.set('user2', user2);

      expect(cache.get('user1')).toEqual(user1);
      expect(cache.get('user2')).toEqual(user2);
    });

    it('should handle null and undefined values', () => {
      const cache = new LRUCache<string, string | null | undefined>(5);

      cache.set('key1', null);
      cache.set('key2', undefined);
      cache.set('key3', 'value');

      // get() returns undefined for both non-existent keys and keys with undefined value
      // This is expected Map behavior
      expect(cache.get('key1')).toBe(null);
      expect(cache.get('key2')).toBe(undefined);
      expect(cache.get('key3')).toBe('value');

      // has() correctly distinguishes between non-existent and undefined value
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(true);
      expect(cache.has('key3')).toBe(true);
      expect(cache.has('nonexistent')).toBe(false);
    });
  });

  describe('Complex Scenarios', () => {
    it('should maintain correct order with mixed operations', () => {
      const cache = new LRUCache<string, number>(3);

      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      cache.get('a'); // a becomes most recently used: [b, c, a]
      cache.set('d', 4); // Evicts b: [c, a, d]

      expect(cache.has('b')).toBe(false); // Evicted
      expect(cache.has('a')).toBe(true);
      expect(cache.has('c')).toBe(true);
      expect(cache.has('d')).toBe(true);

      cache.get('c'); // c becomes most recently used: [a, d, c]
      cache.set('e', 5); // Evicts a: [d, c, e]

      expect(cache.has('a')).toBe(false); // Evicted
      expect(cache.has('d')).toBe(true);
      expect(cache.has('c')).toBe(true);
      expect(cache.has('e')).toBe(true);
    });

    it('should handle rapid set/get cycles', () => {
      const cache = new LRUCache<string, number>(10);

      // Rapid sets
      for (let i = 0; i < 20; i++) {
        cache.set(`key${i}`, i);
      }

      // Only last 10 should remain
      expect(cache.getSize()).toBe(10);
      for (let i = 0; i < 10; i++) {
        expect(cache.has(`key${i}`)).toBe(false);
      }
      for (let i = 10; i < 20; i++) {
        expect(cache.has(`key${i}`)).toBe(true);
      }
    });

    it('should correctly track stats across complex operations', () => {
      const cache = new LRUCache<string, number>(3);

      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      cache.get('a'); // hit
      cache.get('x'); // miss
      cache.get('b'); // hit
      cache.get('y'); // miss

      cache.set('d', 4); // eviction (c is evicted)
      cache.set('e', 5); // eviction (a is evicted, despite recent access, b was accessed more recently)

      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(2);
      expect(stats.evictions).toBe(2);
      expect(stats.size).toBe(3);
    });
  });

  describe('TTL Configuration', () => {
    it('should respect TTL and expire entries', async () => {
      const cache = new LRUCache<string, string>({ maxSize: 10, ttl: 100 });
      cache.set('key1', 'value1');

      expect(cache.get('key1')).toBe('value1');
      expect(cache.getStats().hits).toBe(1);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(cache.get('key1')).toBeUndefined();
      expect(cache.getStats().misses).toBe(1);
      expect(cache.getStats().expirations).toBeGreaterThan(0);

      cache.destroy();
    });

    it('should not return expired entries', async () => {
      const cache = new LRUCache<string, number>({ maxSize: 5, ttl: 50 });
      cache.set('a', 1);
      cache.set('b', 2);

      await new Promise(resolve => setTimeout(resolve, 70));

      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBeUndefined();
      expect(cache.getStats().expirations).toBe(2);

      cache.destroy();
    });

    it('should return non-expired entries', () => {
      const cache = new LRUCache<string, string>({ maxSize: 5, ttl: 10000 });
      cache.set('key1', 'value1');

      expect(cache.get('key1')).toBe('value1');
      expect(cache.getStats().hits).toBe(1);
      expect(cache.getStats().expirations).toBe(0);

      cache.destroy();
    });
  });

  describe('Eviction Callbacks', () => {
    it('should call onEvict callback when evicting due to capacity', () => {
      const evictions: Array<{ key: string; value: number; reason: string }> = [];
      const cache = new LRUCache<string, number>({
        maxSize: 2,
        onEvict: (key, value, reason) => evictions.push({ key, value, reason }),
      });

      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3); // Should evict 'a'

      expect(evictions).toHaveLength(1);
      expect(evictions[0]).toEqual({ key: 'a', value: 1, reason: 'capacity' });
    });

    it('should call onEvict callback when entry expires via TTL', async () => {
      const evictions: Array<{ key: string; value: string; reason: string }> = [];
      const cache = new LRUCache<string, string>({
        maxSize: 5,
        ttl: 50,
        onEvict: (key, value, reason) => evictions.push({ key, value, reason }),
      });

      cache.set('expired', 'value');

      await new Promise(resolve => setTimeout(resolve, 70));

      // Trigger cleanup by attempting to get
      cache.get('expired');

      // Give cleanup interval time to run
      await new Promise(resolve => setTimeout(resolve, 30));

      const ttlEvictions = evictions.filter(e => e.reason === 'ttl');
      expect(ttlEvictions.length).toBeGreaterThan(0);
      expect(ttlEvictions[0].key).toBe('expired');
      expect(ttlEvictions[0].value).toBe('value');

      cache.destroy();
    });

    it('should call onEvict callback when manually deleting', () => {
      const evictions: Array<{ key: string; value: number; reason: string }> = [];
      const cache = new LRUCache<string, number>({
        maxSize: 5,
        onEvict: (key, value, reason) => evictions.push({ key, value, reason }),
      });

      cache.set('key', 123);
      cache.delete('key');

      expect(evictions).toHaveLength(1);
      expect(evictions[0]).toEqual({ key: 'key', value: 123, reason: 'manual' });
    });
  });

  describe('Cache Options', () => {
    it('should accept options object with maxSize, ttl, and onEvict', () => {
      const evictions: Array<unknown> = [];
      const cache = new LRUCache<string, string>({
        maxSize: 50,
        ttl: 5000,
        onEvict: (key, value, reason) => evictions.push({ key, value, reason }),
      });

      expect(cache.getMaxSize()).toBe(50);
      cache.set('test', 'value');
      expect(cache.get('test')).toBe('value');

      cache.destroy();
    });

    it('should maintain backward compatibility with number constructor', () => {
      const cache = new LRUCache<string, number>(100);

      expect(cache.getMaxSize()).toBe(100);
      cache.set('key', 42);
      expect(cache.get('key')).toBe(42);
    });
  });

  describe('Cleanup Interval', () => {
    it('should periodically clean up expired entries', async () => {
      const cache = new LRUCache<string, string>({ maxSize: 10, ttl: 60 });

      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      expect(cache.getSize()).toBe(2);

      // Wait for expiration + cleanup interval (ttl/2 = 30ms)
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(cache.getStats().expirations).toBeGreaterThan(0);

      cache.destroy();
    });

    it('should stop cleanup interval on destroy', async () => {
      const cache = new LRUCache<string, string>({ maxSize: 5, ttl: 50 });
      cache.set('key', 'value');

      const expirationsBefore = cache.getStats().expirations;
      cache.destroy();

      // Wait longer than cleanup interval
      await new Promise(resolve => setTimeout(resolve, 100));

      // Expirations should not increase after destroy
      const expirationsAfter = cache.getStats().expirations;
      expect(expirationsAfter).toBe(expirationsBefore);
    });
  });

  describe('Mixed Operations with TTL and Capacity', () => {
    it('should handle TTL and capacity evictions together', async () => {
      const evictions: Array<{ key: string; reason: string }> = [];
      const cache = new LRUCache<string, number>({
        maxSize: 2,
        ttl: 100,
        onEvict: (key, value, reason) => evictions.push({ key, reason }),
      });

      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3); // Capacity eviction of 'a'

      expect(evictions).toHaveLength(1);
      expect(evictions[0].reason).toBe('capacity');

      await new Promise(resolve => setTimeout(resolve, 120));

      // Entries should expire
      expect(cache.get('b')).toBeUndefined();
      expect(cache.get('c')).toBeUndefined();

      cache.destroy();
    });

    it('should track all eviction reasons in stats', async () => {
      const cache = new LRUCache<string, string>({
        maxSize: 2,
        ttl: 50,
      });

      cache.set('a', '1');
      cache.set('b', '2');
      cache.set('c', '3'); // Capacity eviction

      expect(cache.getStats().evictions).toBe(1);

      cache.delete('b'); // Manual deletion doesn't increment evictions counter

      await new Promise(resolve => setTimeout(resolve, 70));

      // TTL expiration
      cache.get('c'); // Trigger check

      await new Promise(resolve => setTimeout(resolve, 30));

      expect(cache.getStats().expirations).toBeGreaterThan(0);

      cache.destroy();
    });
  });
});
