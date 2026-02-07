/**
 * LRU (Least Recently Used) Cache implementation for API response caching.
 *
 * Features:
 * - Generic key-value storage with type safety
 * - Automatic eviction of least recently used items when capacity is reached
 * - Hit/miss/eviction statistics tracking
 * - O(1) get/set/delete operations using Map
 *
 * Usage:
 * ```typescript
 * const cache = new LRUCache<string, User>(100);
 * cache.set('user-123', userData);
 * const user = cache.get('user-123');
 * ```
 */

export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
}

export class LRUCache<K, V> {
  private cache: Map<K, V>;
  private maxSize: number;
  private hits: number = 0;
  private misses: number = 0;
  private evictions: number = 0;

  /**
   * Creates a new LRU Cache instance.
   *
   * @param maxSize Maximum number of entries to store (default: 100)
   */
  constructor(maxSize: number = 100) {
    if (maxSize < 1) {
      throw new Error('Cache max size must be at least 1');
    }
    this.maxSize = maxSize;
    this.cache = new Map<K, V>();
  }

  /**
   * Retrieves a value from the cache.
   * Updates the entry's position to most recently used.
   *
   * @param key The key to look up
   * @returns The cached value, or undefined if not found
   */
  get(key: K): V | undefined {
    const value = this.cache.get(key);

    if (value === undefined) {
      this.misses++;
      return undefined;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, value);
    this.hits++;

    return value;
  }

  /**
   * Stores a value in the cache.
   * If the cache is at capacity, evicts the least recently used entry.
   *
   * @param key The key to store under
   * @param value The value to cache
   */
  set(key: K, value: V): void {
    // If key exists, delete it first (will be re-added at end)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Evict least recently used entry if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
        this.evictions++;
      }
    }

    // Add new entry at end (most recently used)
    this.cache.set(key, value);
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
    return this.cache.delete(key);
  }

  /**
   * Removes all entries from the cache and resets statistics.
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
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
