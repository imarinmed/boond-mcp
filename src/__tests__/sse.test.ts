import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { SSEServer } from '../sse/server.js';

describe('SSE Server', () => {
  let server: SSEServer;

  beforeEach(() => {
    server = new SSEServer(0); // Port 0 for random available port
    server.start();
  });

  afterEach(() => {
    server.stop();
  });

  describe('Server Operations', () => {
    it('should start and stop server', () => {
      expect(server.getClientCount()).toBe(0);
    });

    it('should track connected clients', () => {
      // Initially no clients
      expect(server.getClientCount()).toBe(0);
      expect(server.getClientIds()).toEqual([]);
    });
  });

  describe('Broadcasting', () => {
    it('should broadcast events to all clients', () => {
      const testEvent = 'test.event';
      const testData = { message: 'Hello SSE' };
      
      // Should not throw even with no clients
      expect(() => {
        server.broadcast(testEvent, testData);
      }).not.toThrow();
    });

    it('should send to specific client', () => {
      const result = server.sendToClient('non-existent-client', 'test.event', {});
      expect(result).toBe(false);
    });
  });
});
