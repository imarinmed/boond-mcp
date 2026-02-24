import { describe, it, expect, beforeEach } from 'vitest';
import { mockClient } from '../mocks/mock-api-client.js';

describe('System Domain Tools', () => {
  beforeEach(() => {
    mockClient.reset();
  });

  describe('Apps', () => {
    it('should search apps', async () => {
      const result = await mockClient.searchApps();
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0].type).toBeDefined();
    });

    it('should get app by id', async () => {
      const result = await mockClient.getApp('app-123');
      expect(result.id).toBe('app-123');
      expect(result.status).toBeDefined();
    });
  });

  describe('Settings', () => {
    it('should search settings', async () => {
      const result = await mockClient.searchSettings({});
      expect(result.data).toHaveLength(5);
      expect(result.data[0].key).toBeDefined();
    });

    it('should search settings with category', async () => {
      const result = await mockClient.searchSettings({ category: 'appearance' });
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should get setting by id', async () => {
      const result = await mockClient.getSetting('setting-123');
      expect(result.id).toBe('setting-123');
      expect(result.value).toBeDefined();
    });

    it('should update setting', async () => {
      const data = { value: 'light' };
      const result = await mockClient.updateSetting('setting-123', data);
      expect(result.value).toBe('light');
    });
  });

  describe('Alerts', () => {
    it('should search alerts', async () => {
      const result = await mockClient.searchAlerts({});
      expect(result.data).toHaveLength(5);
      expect(result.data[0].severity).toBeDefined();
    });

    it('should search unresolved alerts', async () => {
      const result = await mockClient.searchAlerts({ resolved: false });
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should get alert by id', async () => {
      const result = await mockClient.getAlert('alert-123');
      expect(result.id).toBe('alert-123');
      expect(result.message).toBeDefined();
    });

    it('should update alert', async () => {
      const data = { severity: 'high' as const };
      const result = await mockClient.updateAlert('alert-123', data);
      expect(result.severity).toBe('high');
    });
  });

  describe('Search Operations', () => {
    it('should perform global search', async () => {
      const result = await mockClient.search({ query: 'john' });
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should perform faceted search', async () => {
      const result = await mockClient.facetedSearch({
        query: 'developer',
        filters: { type: ['candidate', 'resource'] },
      });
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should perform advanced search', async () => {
      const result = await mockClient.advancedSearch({
        query: 'senior',
        criteria: { skills: ['TypeScript'] },
      });
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should perform date search', async () => {
      const result = await mockClient.dateSearch({
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      });
      expect(result.data.length).toBeGreaterThan(0);
    });
  });
});
