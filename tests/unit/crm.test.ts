import { describe, it, expect, beforeEach } from 'vitest';
import { mockClient } from '../mocks/mock-api-client.js';

describe('CRM Domain Tools', () => {
  beforeEach(() => {
    mockClient.reset();
  });

  describe('Companies', () => {
    it('should search companies', async () => {
      const result = await mockClient.searchCompanies({});
      expect(result.data).toHaveLength(5);
      expect(result.data[0].type).toBeDefined();
    });

    it('should search companies with query', async () => {
      const result = await mockClient.searchCompanies({ query: 'acme' });
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should get company by id', async () => {
      const result = await mockClient.getCompany('comp-123');
      expect(result.id).toBe('comp-123');
      expect(result.name).toBeDefined();
    });

    it('should create company', async () => {
      const data = {
        name: 'New Company',
        type: 'client' as const,
      };
      const result = await mockClient.createCompany(data);
      expect(result.name).toBe('New Company');
      expect(result.type).toBe('client');
    });

    it('should update company', async () => {
      const data = { name: 'Updated Company' };
      const result = await mockClient.updateCompany('comp-123', data);
      expect(result.name).toBe('Updated Company');
    });

    it('should delete company', async () => {
      await mockClient.deleteCompany('comp-123');
      expect(mockClient.calls[0].method).toBe('deleteCompany');
    });
  });

  describe('Opportunities', () => {
    it('should search opportunities', async () => {
      const result = await mockClient.searchOpportunities({});
      expect(result.data).toHaveLength(5);
      expect(result.data[0].probability).toBeDefined();
    });

    it('should search opportunities with query', async () => {
      const result = await mockClient.searchOpportunities({ query: 'developer' });
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should get opportunity by id', async () => {
      const result = await mockClient.getOpportunity('opp-123');
      expect(result.id).toBe('opp-123');
      expect(result.value).toBeDefined();
    });

    it('should create opportunity', async () => {
      const data = {
        name: 'New Opportunity',
        companyId: 'comp-123',
        status: 'lead' as const,
      };
      const result = await mockClient.createOpportunity(data);
      expect(result.name).toBe('New Opportunity');
      expect(result.status).toBe('lead');
    });

    it('should update opportunity', async () => {
      const data = { status: 'won' as const };
      const result = await mockClient.updateOpportunity('opp-123', data);
      expect(result.status).toBe('won');
    });

    it('should delete opportunity', async () => {
      await mockClient.deleteOpportunity('opp-123');
      expect(mockClient.calls[0].method).toBe('deleteOpportunity');
    });
  });

  describe('Quotations', () => {
    it('should search quotations', async () => {
      const result = await mockClient.searchQuotations({});
      expect(result.data).toHaveLength(5);
      expect(result.data[0].total).toBeDefined();
    });

    it('should search quotations with query', async () => {
      const result = await mockClient.searchQuotations({ query: 'development' });
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should get quotation by id', async () => {
      const result = await mockClient.getQuotation('quote-123');
      expect(result.id).toBe('quote-123');
      expect(result.opportunityId).toBeDefined();
    });

    it('should create quotation', async () => {
      const data = {
        opportunityId: 'opp-123',
        companyId: 'comp-123',
        total: 25000,
      };
      const result = await mockClient.createQuotation(data);
      expect(result.total).toBe(25000);
    });

    it('should update quotation', async () => {
      const data = { total: 30000 };
      const result = await mockClient.updateQuotation('quote-123', data);
      expect(result.total).toBe(30000);
    });

    it('should delete quotation', async () => {
      await mockClient.deleteQuotation('quote-123');
      expect(mockClient.calls[0].method).toBe('deleteQuotation');
    });

    it('should send quotation', async () => {
      const result = await mockClient.sendQuotation('quote-123');
      expect(result.status).toBe('sent');
    });
  });
});
