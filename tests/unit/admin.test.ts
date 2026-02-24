import { describe, it, expect, beforeEach } from 'vitest';
import { mockClient } from '../mocks/mock-api-client.js';

describe('Admin Domain Tools', () => {
  beforeEach(() => {
    mockClient.reset();
  });

  describe('Agencies', () => {
    it('should search agencies', async () => {
      const result = await mockClient.searchAgencies({});
      expect(result.data).toHaveLength(5);
      expect(result.data[0].name).toBeDefined();
    });

    it('should search agencies with query', async () => {
      const result = await mockClient.searchAgencies({ query: 'paris' });
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should get agency by id', async () => {
      const result = await mockClient.getAgency('agency-123');
      expect(result.id).toBe('agency-123');
      expect(result.city).toBeDefined();
    });

    it('should create agency', async () => {
      const data = {
        name: 'New Agency',
        city: 'Lyon',
        country: 'France',
      };
      const result = await mockClient.createAgency(data);
      expect(result.name).toBe('New Agency');
    });

    it('should update agency', async () => {
      const data = { name: 'Updated Agency' };
      const result = await mockClient.updateAgency('agency-123', data);
      expect(result.name).toBe('Updated Agency');
    });

    it('should delete agency', async () => {
      await mockClient.deleteAgency('agency-123');
      expect(mockClient.calls[0].method).toBe('deleteAgency');
    });
  });

  describe('Business Units', () => {
    it('should search business units', async () => {
      const result = await mockClient.searchBusinessUnits({});
      expect(result.data).toHaveLength(5);
    });

    it('should search business units with query', async () => {
      const result = await mockClient.searchBusinessUnits({ query: 'engineering' });
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should get business unit by id', async () => {
      const result = await mockClient.getBusinessUnit('bu-123');
      expect(result.id).toBe('bu-123');
      expect(result.managerId).toBeDefined();
    });

    it('should create business unit', async () => {
      const data = {
        name: 'Marketing Division',
        managerId: 'res-456',
      };
      const result = await mockClient.createBusinessUnit(data);
      expect(result.name).toBe('Marketing Division');
    });

    it('should update business unit', async () => {
      const data = { name: 'Updated Division' };
      const result = await mockClient.updateBusinessUnit('bu-123', data);
      expect(result.name).toBe('Updated Division');
    });

    it('should delete business unit', async () => {
      await mockClient.deleteBusinessUnit('bu-123');
      expect(mockClient.calls[0].method).toBe('deleteBusinessUnit');
    });
  });

  describe('Accounts', () => {
    it('should search accounts', async () => {
      const result = await mockClient.searchAccounts({});
      expect(result.data).toHaveLength(5);
      expect(result.data[0].role).toBeDefined();
    });

    it('should search accounts with query', async () => {
      const result = await mockClient.searchAccounts({ query: 'admin' });
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should get account by id', async () => {
      const result = await mockClient.getAccount('acc-123');
      expect(result.id).toBe('acc-123');
      expect(result.email).toBeDefined();
    });

    it('should create account', async () => {
      const data = {
        username: 'newuser',
        email: 'new@example.com',
        role: 'user' as const,
        status: 'active' as const,
      };
      const result = await mockClient.createAccount(data);
      expect(result.username).toBe('newuser');
    });

    it('should update account', async () => {
      const data = { role: 'manager' as const };
      const result = await mockClient.updateAccount('acc-123', data);
      expect(result.role).toBe('manager');
    });

    it('should delete account', async () => {
      await mockClient.deleteAccount('acc-123');
      expect(mockClient.calls[0].method).toBe('deleteAccount');
    });
  });
});
