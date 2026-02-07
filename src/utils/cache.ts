/**
 * LRU (Least Recently Used) Cache implementation for API response caching.
 *
 * Features:
 * - Generic key-value storage with type safety
 * - Automatic eviction of least recently used items when capacity is reached
 * - Optional TTL (Time To Live) for automatic expiration
 * - Eviction callbacks for custom cleanup logic
 * - Hit/miss/eviction/expiration statistics tracking
 * - O(1) get/set/delete operations using Map
 *
 * Usage:
 * ```typescript
 * // Basic usage (backward compatible)
 * const cache = new LRUCache<string, User>(100);
 *
 * // With TTL and eviction callback
 * const cache = new LRUCache<string, User>({
 *   maxSize: 100,
 *   ttl: 60000, // 1 minute
 *   onEvict: (key, value, reason) => {
 *     console.log(`Evicted ${key} due to ${reason}`);
 *   }
 * });
 *
 * cache.set('user-123', userData);
 * const user = cache.get('user-123');
 *
 * // Clean up resources
 * cache.destroy();
 * ```
 */

export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  expirations: number;
  size: number;
}

export interface CacheOptions<K, V> {
  maxSize?: number;
  ttl?: number;
  onEvict?: (key: K, value: V, reason: 'capacity' | 'ttl' | 'manual') => void;
}

interface CacheEntry<V> {
  value: V;
  expiresAt: number | undefined;
}

export class LRUCache<K, V> {
  private cache: Map<K, CacheEntry<V>>;
  private maxSize: number;
  private ttl: number | undefined;
  private onEvict: ((key: K, value: V, reason: 'capacity' | 'ttl' | 'manual') => void) | undefined;
  private cleanupInterval: NodeJS.Timeout | undefined;
  private hits: number = 0;
  private misses: number = 0;
  private evictions: number = 0;
  private expirations: number = 0;

  constructor(options: CacheOptions<K, V> | number = {}) {
    const opts = typeof options === 'number' ? { maxSize: options } : options;
    const maxSize = opts.maxSize ?? 100;

    if (maxSize < 1) {
      throw new Error('Cache max size must be at least 1');
    }

    this.maxSize = maxSize;
    this.ttl = opts.ttl;
    this.onEvict = opts.onEvict;
    this.cache = new Map<K, CacheEntry<V>>();

    if (this.ttl) {
      this.startCleanupInterval();
    }
  }

  private startCleanupInterval(): void {
    if (!this.ttl) return;

    const intervalMs = this.ttl / 2;
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const expiredKeys: K[] = [];

      for (const [key, entry] of this.cache.entries()) {
        if (entry.expiresAt && now > entry.expiresAt) {
          expiredKeys.push(key);
        }
      }

      for (const key of expiredKeys) {
        const entry = this.cache.get(key);
        if (entry) {
          this.cache.delete(key);
          this.expirations++;
          if (this.onEvict) {
            this.onEvict(key, entry.value, 'ttl');
          }
        }
      }
    }, intervalMs);

    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  private isExpired(entry: CacheEntry<V>): boolean {
    if (!entry.expiresAt) return false;
    return Date.now() > entry.expiresAt;
  }

  /**
   * Retrieves a value from the cache.
   * Updates the entry's position to most recently used.
   *
   * @param key The key to look up
   * @returns The cached value, or undefined if not found
   */
  get(key: K): V | undefined {
    const entry = this.cache.get(key);

    if (entry === undefined) {
      this.misses++;
      return undefined;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.expirations++;
      if (this.onEvict) {
        this.onEvict(key, entry.value, 'ttl');
      }
      this.misses++;
      return undefined;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);
    this.hits++;

    return entry.value;
  }

  /**
   * Stores a value in the cache.
   * If the cache is at capacity, evicts the least recently used entry.
   *
   * @param key The key to store under
   * @param value The value to cache
   */
  set(key: K, value: V): void {
    const entry: CacheEntry<V> = {
      value,
      expiresAt: this.ttl ? Date.now() + this.ttl : undefined,
    };

    // If key exists, delete it first (will be re-added at end)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Evict least recently used entry if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        const evictedEntry = this.cache.get(firstKey);
        this.cache.delete(firstKey);
        this.evictions++;
        if (this.onEvict && evictedEntry) {
          this.onEvict(firstKey, evictedEntry.value, 'capacity');
        }
      }
    }

    // Add new entry at end (most recently used)
    this.cache.set(key, entry);
  }

  /**
   * Checks if a key exists in the cache without affecting LRU order.
   *
   * @param key The key to check
   * @returns true if the key exists, false otherwise
   */
  has(key: K): boolean {
    return this.cache.has(key);
  }

  /**
   * Removes an entry from the cache.
   *
   * @param key The key to remove
   * @returns true if the entry was removed, false if it didn't exist
   */
  delete(key: K): boolean {
    const entry = this.cache.get(key);
    const result = this.cache.delete(key);
    if (result && this.onEvict && entry) {
      this.onEvict(key, entry.value, 'manual');
    }
    return result;
  }

  /**
   * Removes all entries from the cache and resets statistics.
   */
  clear(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
    this.expirations = 0;
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
    this.cache.clear();
  }

  /**
   * Returns current cache statistics.
   *
   * @returns Object containing hits, misses, evictions, and current size
   */
  getStats(): CacheStats {
    return {
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      expirations: this.expirations,
      size: this.cache.size,
    };
  }

  /**
   * Returns the maximum capacity of the cache.
   */
  getMaxSize(): number {
    return this.maxSize;
  }

  /**
   * Returns the current number of entries in the cache.
   */
  getSize(): number {
    return this.cache.size;
  }
}
