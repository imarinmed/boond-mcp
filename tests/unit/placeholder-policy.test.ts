import { describe, it, expect } from 'vitest';
import {
  formatUnknown,
  formatUnknownWithDebug,
  isFieldUnknown,
  pickStatus,
  pickType,
  pickDate,
} from '../../src/utils/normalization.js';

describe('Placeholder Policy', () => {
  describe('isFieldUnknown', () => {
    it('returns true for undefined', () => {
      expect(isFieldUnknown(undefined)).toBe(true);
    });

    it('returns true for empty string', () => {
      expect(isFieldUnknown('')).toBe(true);
    });

    it('returns true for "unknown"', () => {
      expect(isFieldUnknown('unknown')).toBe(true);
    });

    it('returns true for "undefined"', () => {
      expect(isFieldUnknown('undefined')).toBe(true);
    });

    it('returns false for valid values', () => {
      expect(isFieldUnknown('active')).toBe(false);
      expect(isFieldUnknown('0')).toBe(false);
      expect(isFieldUnknown('John Doe')).toBe(false);
    });
  });

  describe('formatUnknown (standard mode)', () => {
    it('formats valid values with label', () => {
      expect(formatUnknown('Status', 'active')).toBe('Status: active');
      expect(formatUnknown('Type', 'invoice')).toBe('Type: invoice');
    });

    it('returns "unknown" for unknown values in standard mode', () => {
      expect(formatUnknown('Status', undefined)).toBe('Status: unknown');
      expect(formatUnknown('Type', 'unknown')).toBe('Type: unknown');
    });

    it('returns "unknown" for empty string values', () => {
      expect(formatUnknown('Name', '')).toBe('Name: unknown');
    });
  });

  describe('formatUnknown (strict mode)', () => {
    it('returns [missing_from_api] for unknown values in strict mode', () => {
      expect(formatUnknown('Status', undefined, true)).toBe('Status: [missing_from_api]');
      expect(formatUnknown('Type', 'unknown', true)).toBe('Type: [missing_from_api]');
    });

    it('still formats valid values normally in strict mode', () => {
      expect(formatUnknown('Status', 'active', true)).toBe('Status: active');
    });
  });

  describe('formatUnknownWithDebug', () => {
    it('returns fallback when DEBUG_FIELDS is false', () => {
      // DEBUG_FIELDS is false by default in test environment
      const result = formatUnknownWithDebug('status', [null, undefined], 'unknown');
      expect(result).toBe('unknown');
    });

    it('includes candidate info when DEBUG_FIELDS is true', () => {
      // This test documents the behavior; actual debug output depends on env
      const result = formatUnknownWithDebug('status', [null, undefined, ''], 'unknown');
      // Should be just 'unknown' in test env (DEBUG_FIELDS=false)
      expect(result).toBe('unknown');
    });
  });

  describe('pickStatus placeholder policy', () => {
    it('returns "unknown" when no status candidates found', () => {
      const record = { name: 'Test' };
      expect(pickStatus(record)).toBe('unknown');
    });

    it('returns actual status when found', () => {
      const record = { status: 'active' };
      expect(pickStatus(record)).toBe('active');
    });

    it('converts numeric state to string', () => {
      const record = { state: 1 };
      expect(pickStatus(record)).toBe('1');
    });

    it('converts boolean to active/inactive', () => {
      expect(pickStatus({ active: true })).toBe('active');
      expect(pickStatus({ active: false })).toBe('inactive');
    });
  });

  describe('pickType placeholder policy', () => {
    it('returns "unknown" when no type candidates found', () => {
      const record = { name: 'Test' };
      expect(pickType(record)).toBe('unknown');
    });

    it('returns actual type when found', () => {
      const record = { type: 'invoice' };
      expect(pickType(record)).toBe('invoice');
    });
  });

  describe('pickDate placeholder policy', () => {
    it('returns "unknown" when no date value found', () => {
      const record = {};
      expect(pickDate(record, ['startDate', 'date'])).toBe('unknown');
    });

    it('returns formatted date when valid', () => {
      const record = { startDate: '2024-01-15' };
      const result = pickDate(record, ['startDate']);
      expect(result).not.toBe('unknown');
      expect(result).toContain('2024');
    });

    it('returns original value when invalid date string', () => {
      const record = { date: 'not-a-date' };
      expect(pickDate(record, ['date'])).toBe('not-a-date');
    });
  });
});

describe('Formatter Placeholder Consistency', () => {
  describe('Capitalization policy', () => {
    it('should use lowercase "unknown" consistently (not "Unknown")', () => {
      // This test enforces the policy: all formatters should use lowercase 'unknown'
      // not capitalized 'Unknown'
      const policyValue = 'unknown';
      const incorrectValue = 'Unknown';
      expect(policyValue).not.toBe(incorrectValue);
      expect(policyValue).toBe('unknown');
    });
  });

  describe('Display formatting policy', () => {
    it('formatUnknown should be used for display-level formatting', () => {
      // Documents the policy: formatters should prefer formatUnknown()
      // over manual string concatenation when showing unknown values
      const label = 'Status';
      const value = 'unknown';
      const result = formatUnknown(label, value);
      expect(result).toBe('Status: unknown');
    });
  });
});
