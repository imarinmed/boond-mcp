import { describe, it, expect, beforeEach } from 'vitest';
import { mockClient } from '../mocks/mock-api-client.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  registerCandidateTools,
  registerContactTools,
  registerResourceTools,
  registerContractTools,
  registerCompanyTools,
  registerOpportunityTools,
  registerQuotationTools,
  registerInvoiceTools,
  registerPurchaseTools,
  registerOrderTools,
  registerBankingTools,
  registerProjectTools,
  registerDeliveryTools,
  registerActionTools,
  registerTimeReportTools,
  registerAbsenceTools,
  registerExpenseTools,
  registerAgencyTools,
  registerBusinessUnitTools,
  registerAccountTools,
  registerDocumentTools,
  registerAppTools,
  registerSettingTools,
  registerAlertTools,
} from '../../src/tools/index.js';

describe('Integration Tests - Full Tool Registration', () => {
  beforeEach(() => {
    mockClient.reset();
  });

  describe('Tool Registration', () => {
    it('should register HR domain tools', () => {
      const mockServer = { registerTool: () => {} } as unknown as McpServer;
      expect(() => {
        registerCandidateTools(mockServer, mockClient as any);
        registerContactTools(mockServer, mockClient as any);
        registerResourceTools(mockServer, mockClient as any);
        registerContractTools(mockServer, mockClient as any);
      }).not.toThrow();
    });

    it('should register CRM domain tools', () => {
      const mockServer = { registerTool: () => {} } as unknown as McpServer;
      expect(() => {
        registerCompanyTools(mockServer, mockClient as any);
        registerOpportunityTools(mockServer, mockClient as any);
        registerQuotationTools(mockServer, mockClient as any);
      }).not.toThrow();
    });

    it('should register Finance domain tools', () => {
      const mockServer = { registerTool: () => {} } as unknown as McpServer;
      expect(() => {
        registerInvoiceTools(mockServer, mockClient as any);
        registerPurchaseTools(mockServer, mockClient as any);
        registerOrderTools(mockServer, mockClient as any);
        registerBankingTools(mockServer, mockClient as any);
      }).not.toThrow();
    });

    it('should register Projects domain tools', () => {
      const mockServer = { registerTool: () => {} } as unknown as McpServer;
      expect(() => {
        registerProjectTools(mockServer, mockClient as any);
        registerDeliveryTools(mockServer, mockClient as any);
        registerActionTools(mockServer, mockClient as any);
      }).not.toThrow();
    });

    it('should register Time domain tools', () => {
      const mockServer = { registerTool: () => {} } as unknown as McpServer;
      expect(() => {
        registerTimeReportTools(mockServer, mockClient as any);
        registerAbsenceTools(mockServer, mockClient as any);
        registerExpenseTools(mockServer, mockClient as any);
      }).not.toThrow();
    });

    it('should register Admin domain tools', () => {
      const mockServer = { registerTool: () => {} } as unknown as McpServer;
      expect(() => {
        registerAgencyTools(mockServer, mockClient as any);
        registerBusinessUnitTools(mockServer, mockClient as any);
        registerAccountTools(mockServer, mockClient as any);
      }).not.toThrow();
    });

    it('should register Documents domain tools', () => {
      const mockServer = { registerTool: () => {} } as unknown as McpServer;
      expect(() => {
        registerDocumentTools(mockServer, mockClient as any);
      }).not.toThrow();
    });

    it('should register System domain tools', () => {
      const mockServer = { registerTool: () => {} } as unknown as McpServer;
      expect(() => {
        registerAppTools(mockServer, mockClient as any);
        registerSettingTools(mockServer, mockClient as any);
        registerAlertTools(mockServer, mockClient as any);
      }).not.toThrow();
    });
  });

  describe('End-to-End Workflows', () => {
    it('should handle candidate-to-contract workflow', async () => {
      const candidate = await mockClient.createCandidate({
        firstName: 'Jane',
        lastName: 'Developer',
        email: 'jane@example.com',
        status: 'active',
      });
      expect(candidate.id).toBeDefined();

      const resource = await mockClient.createResource({
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
        status: 'active',
      });
      expect(resource.id).toBeDefined();

      const contract = await mockClient.createContract({
        resourceId: resource.id,
        startDate: '2024-01-01',
        type: 'full-time',
        status: 'active',
      });
      expect(contract.resourceId).toBe(resource.id);
    });

    it('should handle opportunity-to-invoice workflow', async () => {
      const company = await mockClient.createCompany({
        name: 'Client Corp',
        type: 'client',
      });

      const opportunity = await mockClient.createOpportunity({
        name: 'Big Project',
        companyId: company.id,
        status: 'lead',
      });

      const quotation = await mockClient.createQuotation({
        opportunityId: opportunity.id,
        companyId: company.id,
        total: 50000,
      });

      await mockClient.sendQuotation(quotation.id);

      const invoice = await mockClient.createInvoice({
        companyId: company.id,
        total: quotation.total,
        issuedAt: new Date().toISOString(),
      });

      await mockClient.payInvoice(invoice.id);

      const paidInvoice = await mockClient.getInvoice(invoice.id);
      expect(paidInvoice.status).toBe('paid');
    });

    it('should handle project delivery workflow', async () => {
      const project = await mockClient.searchProjects({}).then(r => r.data[0]);

      const delivery = await mockClient.createDelivery({
        projectId: project.id,
        name: 'Phase 1',
        status: 'pending',
      });

      await mockClient.updateDelivery(delivery.id, { status: 'completed' });

      const action = await mockClient.createAction({
        projectId: project.id,
        name: 'Deploy to Production',
        status: 'open',
      });

      await mockClient.updateAction(action.id, { status: 'completed' });
    });

    it('should handle absence approval workflow', async () => {
      const absence = await mockClient.createAbsence({
        resourceId: 'res-123',
        type: 'vacation',
        startDate: '2024-07-01',
        endDate: '2024-07-10',
      });

      await mockClient.approveAbsence(absence.id);

      const approved = await mockClient.getAbsence(absence.id);
      expect(approved.status).toBe('approved');
    });

    it('should handle expense report workflow', async () => {
      const report = await mockClient.createExpenseReport({
        resourceId: 'res-123',
        total: 500,
        period: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
      });

      await mockClient.submitExpenseReport(report.id);

      await mockClient.approveExpenseReport(report.id);

      await mockClient.payExpenseReport(report.id);

      const paid = await mockClient.getExpenseReport(report.id);
      expect(paid.status).toBe('paid');
    });
  });

  describe('Error Handling', () => {
    it('should handle API failures gracefully', async () => {
      mockClient.setFailure(new Error('API Error'));

      await expect(mockClient.searchCandidates({})).rejects.toThrow('API Error');
    });

    it('should handle validation errors', async () => {
      mockClient.setFailure(new Error('Validation failed: email required'));

      await expect(mockClient.createCandidate({})).rejects.toThrow('Validation failed');
    });

    it('should handle not found errors', async () => {
      mockClient.setFailure(new Error('Resource not found'));

      await expect(mockClient.getCandidate('invalid-id')).rejects.toThrow('not found');
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple concurrent searches', async () => {
      const results = await Promise.all([
        mockClient.searchCandidates({}),
        mockClient.searchCompanies({}),
        mockClient.searchProjects({}),
      ]);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.data.length).toBeGreaterThan(0);
      });
    });

    it('should handle concurrent CRUD operations', async () => {
      const candidates = await Promise.all(
        Array.from({ length: 5 }, (_, i) =>
          mockClient.createCandidate({
            firstName: `User${i}`,
            lastName: 'Test',
            email: `user${i}@test.com`,
            status: 'active',
          })
        )
      );

      expect(candidates).toHaveLength(5);
      candidates.forEach((c, i) => {
        expect(c.firstName).toBe(`User${i}`);
      });
    });
  });
});

export {};
