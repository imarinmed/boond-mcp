import { describe, it, expect, beforeEach } from 'vitest';
import { mockClient } from '../mocks/mock-api-client.js';

describe('HR Domain Tools', () => {
  beforeEach(() => {
    mockClient.reset();
  });

  describe('Candidates', () => {
    it('should search candidates with default params', async () => {
      const result = await mockClient.searchCandidates({});
      expect(result.data).toHaveLength(5);
      expect(result.pagination.page).toBe(1);
      expect(mockClient.calls).toHaveLength(1);
      expect(mockClient.calls[0].method).toBe('searchCandidates');
    });

    it('should search candidates with query', async () => {
      const result = await mockClient.searchCandidates({ query: 'john' });
      expect(result.data).toHaveLength(5);
      expect(mockClient.calls[0].args[0]).toEqual({ query: 'john' });
    });

    it('should search candidates with pagination', async () => {
      const result = await mockClient.searchCandidates({ page: 2, limit: 10 });
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(10);
    });

    it('should get candidate by id', async () => {
      const result = await mockClient.getCandidate('cand-123');
      expect(result.id).toBe('cand-123');
      expect(result.firstName).toBeDefined();
      expect(result.email).toBeDefined();
    });

    it('should create candidate', async () => {
      const data = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        status: 'active' as const,
      };
      const result = await mockClient.createCandidate(data);
      expect(result.firstName).toBe('Test');
      expect(result.lastName).toBe('User');
      expect(result.email).toBe('test@example.com');
      expect(result.id).toBeDefined();
    });

    it('should update candidate', async () => {
      const data = { firstName: 'Updated' };
      const result = await mockClient.updateCandidate('cand-123', data);
      expect(result.id).toBe('cand-123');
      expect(result.firstName).toBe('Updated');
    });

    it('should delete candidate', async () => {
      await mockClient.createCandidate({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        status: 'active',
      });
      await mockClient.deleteCandidate('cand-123');
      expect(mockClient.calls[mockClient.calls.length - 1].method).toBe('deleteCandidate');
    });

    it('should handle search errors', async () => {
      mockClient.setFailure(new Error('Network error'));
      await expect(mockClient.searchCandidates({})).rejects.toThrow('Network error');
    });

    it('should handle get errors', async () => {
      mockClient.setFailure(new Error('Not found'));
      await expect(mockClient.getCandidate('invalid')).rejects.toThrow('Not found');
    });

    it('should handle create errors', async () => {
      mockClient.setFailure(new Error('Validation failed'));
      await expect(mockClient.createCandidate({})).rejects.toThrow('Validation failed');
    });
  });

  describe('Contacts', () => {
    it('should search contacts', async () => {
      const result = await mockClient.searchContacts({});
      expect(result.data).toHaveLength(5);
      expect(mockClient.calls[0].method).toBe('searchContacts');
    });

    it('should search contacts with query', async () => {
      const result = await mockClient.searchContacts({ query: 'jane' });
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should get contact by id', async () => {
      const result = await mockClient.getContact('cont-123');
      expect(result.id).toBe('cont-123');
      expect(result.companyId).toBeDefined();
    });

    it('should create contact', async () => {
      const data = {
        firstName: 'Test',
        lastName: 'Contact',
        email: 'contact@example.com',
        companyId: 'comp-123',
      };
      const result = await mockClient.createContact(data);
      expect(result.firstName).toBe('Test');
      expect(result.companyId).toBe('comp-123');
    });

    it('should update contact', async () => {
      const data = { jobTitle: 'Manager' };
      const result = await mockClient.updateContact('cont-123', data);
      expect(result.id).toBe('cont-123');
      expect(result.jobTitle).toBe('Manager');
    });

    it('should delete contact', async () => {
      await mockClient.deleteContact('cont-123');
      expect(mockClient.calls[0].method).toBe('deleteContact');
    });

    it('should handle contact errors', async () => {
      mockClient.setFailure(new Error('Contact not found'));
      await expect(mockClient.getContact('invalid')).rejects.toThrow('Contact not found');
    });
  });

  describe('Resources', () => {
    it('should search resources', async () => {
      const result = await mockClient.searchResources({});
      expect(result.data).toHaveLength(5);
      expect(result.data[0].skills).toBeDefined();
    });

    it('should get resource by id', async () => {
      const result = await mockClient.getResource('res-123');
      expect(result.id).toBe('res-123');
      expect(result.hourlyRate).toBeDefined();
    });

    it('should create resource', async () => {
      const data = {
        firstName: 'Developer',
        lastName: 'Test',
        email: 'dev@example.com',
        status: 'active' as const,
      };
      const result = await mockClient.createResource(data);
      expect(result.status).toBe('active');
      expect(result.skills).toBeDefined();
    });

    it('should update resource', async () => {
      const data = { hourlyRate: 100 };
      const result = await mockClient.updateResource('res-123', data);
      expect(result.hourlyRate).toBe(100);
    });

    it('should delete resource', async () => {
      await mockClient.deleteResource('res-123');
      expect(mockClient.calls[0].method).toBe('deleteResource');
    });
  });

  describe('Contracts', () => {
    it('should search contracts', async () => {
      const result = await mockClient.searchContracts({});
      expect(result.data).toHaveLength(5);
      expect(result.data[0].type).toBeDefined();
    });

    it('should get contract by id', async () => {
      const result = await mockClient.getContract('contract-123');
      expect(result.id).toBe('contract-123');
      expect(result.resourceId).toBeDefined();
    });

    it('should create contract', async () => {
      const data = {
        resourceId: 'res-123',
        startDate: '2024-01-01',
        type: 'full-time' as const,
        status: 'active' as const,
      };
      const result = await mockClient.createContract(data);
      expect(result.resourceId).toBe('res-123');
      expect(result.type).toBe('full-time');
    });

    it('should update contract', async () => {
      const data = { hourlyRate: 85 };
      const result = await mockClient.updateContract('contract-123', data);
      expect(result.hourlyRate).toBe(85);
    });

    it('should delete contract', async () => {
      await mockClient.deleteContract('contract-123');
      expect(mockClient.calls[0].method).toBe('deleteContract');
    });
  });
});
