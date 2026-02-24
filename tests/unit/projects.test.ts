import { describe, it, expect, beforeEach } from 'vitest';
import { mockClient } from '../mocks/mock-api-client.js';

describe('Projects Domain Tools', () => {
  beforeEach(() => {
    mockClient.reset();
  });

  describe('Projects', () => {
    it('should search projects', async () => {
      const result = await mockClient.searchProjects({});
      expect(result.data).toHaveLength(5);
      expect(result.data[0].status).toBeDefined();
    });

    it('should search projects with filters', async () => {
      const result = await mockClient.searchProjects({ status: 'active', companyId: 'comp-123' });
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should get project by id', async () => {
      const result = await mockClient.getProject('proj-123');
      expect(result.id).toBe('proj-123');
      expect(result.budget).toBeDefined();
    });
  });

  describe('Deliveries', () => {
    it('should search deliveries', async () => {
      const result = await mockClient.searchDeliveries({});
      expect(result.data).toHaveLength(5);
      expect(result.data[0].status).toBeDefined();
    });

    it('should search deliveries with query', async () => {
      const result = await mockClient.searchDeliveries({ query: 'phase' });
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should get delivery by id', async () => {
      const result = await mockClient.getDelivery('delivery-123');
      expect(result.id).toBe('delivery-123');
      expect(result.projectId).toBeDefined();
    });

    it('should create delivery', async () => {
      const data = {
        projectId: 'proj-123',
        name: 'New Delivery',
        status: 'pending' as const,
      };
      const result = await mockClient.createDelivery(data);
      expect(result.name).toBe('New Delivery');
    });

    it('should update delivery', async () => {
      const data = { status: 'completed' as const };
      const result = await mockClient.updateDelivery('delivery-123', data);
      expect(result.status).toBe('completed');
    });

    it('should delete delivery', async () => {
      await mockClient.deleteDelivery('delivery-123');
      expect(mockClient.calls[0].method).toBe('deleteDelivery');
    });
  });

  describe('Actions', () => {
    it('should search actions', async () => {
      const result = await mockClient.searchActions({});
      expect(result.data).toHaveLength(5);
      expect(result.data[0].priority).toBeDefined();
    });

    it('should search actions with filters', async () => {
      const result = await mockClient.searchActions({ status: 'open', priority: 'high' });
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should get action by id', async () => {
      const result = await mockClient.getAction('action-123');
      expect(result.id).toBe('action-123');
      expect(result.assignedTo).toBeDefined();
    });

    it('should create action', async () => {
      const data = {
        projectId: 'proj-123',
        name: 'New Action',
        status: 'open' as const,
      };
      const result = await mockClient.createAction(data);
      expect(result.name).toBe('New Action');
    });

    it('should update action', async () => {
      const data = { priority: 'high' as const };
      const result = await mockClient.updateAction('action-123', data);
      expect(result.priority).toBe('high');
    });

    it('should delete action', async () => {
      await mockClient.deleteAction('action-123');
      expect(mockClient.calls[0].method).toBe('deleteAction');
    });
  });
});
