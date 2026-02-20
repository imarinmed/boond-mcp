import { describe, it, expect } from 'bun:test';
import {
  generateWebhookSignature,
  verifyWebhookSignature,
  generateWebhookSignatureWithTimestamp,
  verifyWebhookSignatureWithTimestamp,
  createWebhookPayload,
} from '../utils/webhook-signature.js';

describe('Webhook Signature', () => {
  const testSecret = 'whsec_test_secret_key_12345';
  const testPayload = JSON.stringify({ event: 'candidate.created', data: { id: '123' } });

  describe('Basic HMAC Signature', () => {
    it('should generate a valid signature', () => {
      const signature = generateWebhookSignature(testPayload, testSecret);
      expect(signature).toMatch(/^sha256=[a-f0-9]{64}$/);
    });

    it('should verify a valid signature', () => {
      const signature = generateWebhookSignature(testPayload, testSecret);
      const isValid = verifyWebhookSignature(signature, testPayload, testSecret);
      expect(isValid).toBe(true);
    });

    it('should reject an invalid signature', () => {
      const wrongSignature = 'sha256=invalid_signature';
      const isValid = verifyWebhookSignature(wrongSignature, testPayload, testSecret);
      expect(isValid).toBe(false);
    });

    it('should reject signature with wrong secret', () => {
      const signature = generateWebhookSignature(testPayload, testSecret);
      const isValid = verifyWebhookSignature(signature, testPayload, 'wrong_secret');
      expect(isValid).toBe(false);
    });
  });

  describe('Timestamp-based Signature', () => {
    it('should generate signature with timestamp', () => {
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = generateWebhookSignatureWithTimestamp(testPayload, testSecret, timestamp);
      expect(signature).toMatch(/^t=\d+,sha256=[a-f0-9]{64}$/);
    });

    it('should verify signature with timestamp', () => {
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = generateWebhookSignatureWithTimestamp(testPayload, testSecret, timestamp);
      const isValid = verifyWebhookSignatureWithTimestamp(signature, testPayload, testSecret);
      expect(isValid).toBe(true);
    });

    it('should reject timestamp outside tolerance', () => {
      const oldTimestamp = Math.floor(Date.now() / 1000) - 1000; // 1000 seconds ago
      const signature = generateWebhookSignatureWithTimestamp(testPayload, testSecret, oldTimestamp);
      const isValid = verifyWebhookSignatureWithTimestamp(signature, testPayload, testSecret, 300);
      expect(isValid).toBe(false);
    });
  });

  describe('Webhook Payload Creation', () => {
    it('should create payload with headers', () => {
      const event = 'candidate.created';
      const data = { id: '123', name: 'John Doe' };
      
      const result = createWebhookPayload(event, data, testSecret);
      
      expect(result.payload).toBeDefined();
      expect(result.headers['Content-Type']).toBe('application/json');
      expect(result.headers['X-Webhook-Signature']).toMatch(/^t=\d+,sha256=/);
      expect(result.headers['X-Webhook-Event']).toBe(event);
      expect(result.headers['X-Webhook-Timestamp']).toMatch(/^\d+$/);
      
      // Verify payload is valid JSON
      const parsed = JSON.parse(result.payload);
      expect(parsed.event).toBe(event);
      expect(parsed.data).toEqual(data);
      expect(parsed.timestamp).toBeDefined();
    });
  });
});
