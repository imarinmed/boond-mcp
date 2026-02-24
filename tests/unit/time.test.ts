import { describe, it, expect, beforeEach } from 'vitest';
import { mockClient } from '../mocks/mock-api-client.js';

describe('Time Domain Tools', () => {
  beforeEach(() => {
    mockClient.reset();
  });

  describe('Time Reports', () => {
    it('should search time reports', async () => {
      const result = await mockClient.searchTimeReports({});
      expect(result.data).toHaveLength(5);
      expect(result.data[0].hours).toBeDefined();
    });

    it('should search time reports with filters', async () => {
      const result = await mockClient.searchTimeReports({
        resourceId: 'res-123',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should get time report by id', async () => {
      const result = await mockClient.getTimeReport('tr-123');
      expect(result.id).toBe('tr-123');
      expect(result.hours).toBeDefined();
    });

    it('should create time report', async () => {
      const data = {
        resourceId: 'res-123',
        date: new Date().toISOString(),
        hours: 8,
        projectId: 'proj-123',
      };
      const result = await mockClient.createTimeReport(data);
      expect(result.hours).toBe(8);
    });

    it('should update time report', async () => {
      const data = { hours: 4 };
      const result = await mockClient.updateTimeReport('tr-123', data);
      expect(result.hours).toBe(4);
    });
  });

  describe('Absences', () => {
    it('should search absences', async () => {
      const result = await mockClient.searchAbsences({});
      expect(result.data).toHaveLength(5);
      expect(result.data[0].type).toBeDefined();
    });

    it('should search absences with filters', async () => {
      const result = await mockClient.searchAbsences({
        resourceId: 'res-123',
        status: 'approved',
        type: 'vacation',
      });
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should get absence by id', async () => {
      const result = await mockClient.getAbsence('abs-123');
      expect(result.id).toBe('abs-123');
      expect(result.reason).toBeDefined();
    });

    it('should create absence', async () => {
      const data = {
        resourceId: 'res-123',
        type: 'vacation' as const,
        startDate: '2024-07-01',
        endDate: '2024-07-10',
      };
      const result = await mockClient.createAbsence(data);
      expect(result.type).toBe('vacation');
    });

    it('should update absence', async () => {
      const data = { reason: 'Updated reason' };
      const result = await mockClient.updateAbsence('abs-123', data);
      expect(result.reason).toBe('Updated reason');
    });

    it('should delete absence', async () => {
      await mockClient.deleteAbsence('abs-123');
      expect(mockClient.calls[0].method).toBe('deleteAbsence');
    });

    it('should approve absence', async () => {
      const result = await mockClient.approveAbsence('abs-123');
      expect(result.status).toBe('approved');
    });

    it('should reject absence', async () => {
      const result = await mockClient.rejectAbsence('abs-123');
      expect(result.status).toBe('rejected');
    });
  });

  describe('Expense Reports', () => {
    it('should search expense reports', async () => {
      const result = await mockClient.searchExpenseReports({});
      expect(result.data).toHaveLength(5);
      expect(result.data[0].total).toBeDefined();
    });

    it('should search expense reports with filters', async () => {
      const result = await mockClient.searchExpenseReports({
        resourceId: 'res-123',
        status: 'submitted',
      });
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should get expense report by id', async () => {
      const result = await mockClient.getExpenseReport('er-123');
      expect(result.id).toBe('er-123');
      expect(result.period).toBeDefined();
    });

    it('should create expense report', async () => {
      const data = {
        resourceId: 'res-123',
        total: 150,
        period: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
      };
      const result = await mockClient.createExpenseReport(data);
      expect(result.total).toBe(150);
    });

    it('should update expense report', async () => {
      const data = { total: 200 };
      const result = await mockClient.updateExpenseReport('er-123', data);
      expect(result.total).toBe(200);
    });

    it('should submit expense report', async () => {
      const result = await mockClient.submitExpenseReport('er-123');
      expect(result.status).toBe('submitted');
    });

    it('should approve expense report', async () => {
      const result = await mockClient.approveExpenseReport('er-123');
      expect(result.status).toBe('approved');
    });

    it('should reject expense report', async () => {
      const result = await mockClient.rejectExpenseReport('er-123', 'Invalid receipt');
      expect(result.status).toBe('rejected');
    });

    it('should pay expense report', async () => {
      const result = await mockClient.payExpenseReport('er-123');
      expect(result.status).toBe('paid');
    });
  });
});
