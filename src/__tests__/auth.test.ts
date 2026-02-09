import { describe, it, expect } from 'bun:test';
import {
  generateApiKey,
  hashApiKey,
  validateApiKey,
  maskApiKey,
  isValidApiKeyFormat,
} from '../utils/auth.js';
import { User } from '../types/auth.js';

describe('Auth Utilities', () => {
  describe('generateApiKey', () => {
    it('should generate a key with correct format', () => {
      const key = generateApiKey();
      expect(key.startsWith('bnd_')).toBe(true);
      expect(key.length).toBeGreaterThanOrEqual(36);
    });

    it('should generate unique keys', () => {
      const keys = new Set();
      for (let i = 0; i < 100; i++) {
        keys.add(generateApiKey());
      }
      expect(keys.size).toBe(100);
    });
  });

  describe('hashApiKey', () => {
    it('should produce consistent hashes', () => {
      const key = 'bnd_testkey123';
      const hash1 = hashApiKey(key);
      const hash2 = hashApiKey(key);
      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(64); // SHA-256 hex length
    });

    it('should produce different hashes for different keys', () => {
      const hash1 = hashApiKey('bnd_key1');
      const hash2 = hashApiKey('bnd_key2');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('validateApiKey', () => {
    const testUser: User = {
      id: 'user-001',
      name: 'Test User',
      email: 'test@example.com',
      role: 'hr',
      apiKeyHash: hashApiKey('bnd_validkey123'),
      createdAt: '2024-01-15T10:30:00Z',
      isActive: true,
    };

    it('should return user for valid key', () => {
      const user = validateApiKey('bnd_validkey123', [testUser]);
      expect(user).not.toBeNull();
      expect(user?.id).toBe('user-001');
    });

    it('should return null for invalid key', () => {
      const user = validateApiKey('bnd_invalidkey', [testUser]);
      expect(user).toBeNull();
    });

    it('should return null for inactive user', () => {
      const inactiveUser = { ...testUser, isActive: false };
      const user = validateApiKey('bnd_validkey123', [inactiveUser]);
      expect(user).toBeNull();
    });

    it('should return null for empty users array', () => {
      const user = validateApiKey('bnd_validkey123', []);
      expect(user).toBeNull();
    });
  });

  describe('maskApiKey', () => {
    it('should mask key correctly', () => {
      const key = 'bnd_a3f7b2d9e1c8f4a5b6d7e8f9';
      const masked = maskApiKey(key);
      expect(masked).toBe('bnd_a3f7...e8f9');
    });

    it('should return **** for short keys', () => {
      const masked = maskApiKey('short');
      expect(masked).toBe('****');
    });
  });

  describe('isValidApiKeyFormat', () => {
    it('should accept valid format', () => {
      expect(isValidApiKeyFormat('bnd_a3f7b2d9e1c8f4a5b6d7e8f9a1b2c3d4')).toBe(true);
    });

    it('should reject keys without prefix', () => {
      expect(isValidApiKeyFormat('invalid_a3f7b2d9')).toBe(false);
    });

    it('should reject short keys', () => {
      expect(isValidApiKeyFormat('bnd_short')).toBe(false);
    });
  });
});
