import { randomBytes, createHash } from 'crypto';
import { User } from '../types/auth.js';

const API_KEY_PREFIX = 'bnd_';

/**
 * Generate a cryptographically secure API key
 * Format: bnd_<32-char-base64url>
 * @returns A new API key string
 */
export function generateApiKey(): string {
  const random = randomBytes(24).toString('base64url');
  return `${API_KEY_PREFIX}${random}`;
}

/**
 * Hash an API key for secure storage
 * Uses SHA-256 for deterministic hashing
 * @param key The API key to hash
 * @returns Hex string hash
 */
export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

/**
 * Validate an API key against the user store
 * @param key The API key to validate
 * @param users Array of users to check against
 * @returns The matching user or null if not found/inactive
 */
export function validateApiKey(key: string, users: User[]): User | null {
  if (!isValidApiKeyFormat(key)) {
    return null;
  }

  const keyHash = hashApiKey(key);
  const user = users.find(u => u.apiKeyHash === keyHash && u.isActive);
  return user || null;
}

/**
 * Mask an API key for display (shows first 8 and last 4 chars)
 * Example: bnd_a3f7...b2d9
 * @param key The API key to mask
 * @returns Masked key string
 */
export function maskApiKey(key: string): string {
  if (key.length <= 12) {
    return '****';
  }
  return `${key.slice(0, 8)}...${key.slice(-4)}`;
}

/**
 * Validate API key format
 * Must start with 'bnd_' and be at least 36 characters
 * @param key The API key to validate
 * @returns True if format is valid
 */
export function isValidApiKeyFormat(key: string): boolean {
  return key.startsWith(API_KEY_PREFIX) && key.length >= 36;
}
