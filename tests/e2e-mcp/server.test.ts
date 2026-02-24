import { describe, it, expect, beforeAll } from 'vitest';
import { callMCPTool, listMCPTools, validateConfig, waitForServerReady } from './mcp-client.js';

describe.skipIf(!process.env.MCP_API_KEY)('MCP Server E2E Tests', () => {
  let availableTools: string[] = [];

  beforeAll(async () => {
    // Validate environment configuration
    validateConfig();
    // Wait for Render server to be ready (handles cold starts)
    console.log('🚀 Waiting for Render server to be ready...');
    await waitForServerReady();
    console.log('✅ Server is ready, starting tests...');
  }, 120000); // 2 minute timeout for server warmup

  beforeAll(async () => {
    const tools = await listMCPTools();
    availableTools = tools.map(t => t.name);
    console.log(`Found ${availableTools.length} tools on MCP server`);
  });

  describe('Tool Discovery', () => {
    it('should list all 121 tools', async () => {
      expect(availableTools.length).toBeGreaterThanOrEqual(121);
    });

    it('should have HR domain tools', () => {
      expect(availableTools).toContain('boond_candidates_search');
      expect(availableTools).toContain('boond_candidates_get');
      expect(availableTools).toContain('boond_contacts_search');
      expect(availableTools).toContain('boond_resources_search');
      expect(availableTools).toContain('boond_contracts_search');
    });

    it('should have CRM domain tools', () => {
      expect(availableTools).toContain('boond_companies_search');
      expect(availableTools).toContain('boond_opportunities_search');
      expect(availableTools).toContain('boond_quotations_search');
    });

    it('should have Finance domain tools', () => {
      expect(availableTools).toContain('boond_invoices_search');
      expect(availableTools).toContain('boond_purchases_search');
      expect(availableTools).toContain('boond_orders_search');
    });
  });

  describe('HR Domain', () => {
    it('should search candidates', async () => {
      const result = await callMCPTool('boond_candidates_search', {
        page: 1,
        limit: 5,
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
    });

    it('should get candidate by id', async () => {
      const searchResult = await callMCPTool('boond_candidates_search', {
        page: 1,
        limit: 1,
      });

      const text = searchResult.content[0].text;
      if (text.includes('No candidates found')) {
        console.log('No candidates in system, skipping get test');
        return;
      }

      const idMatch = text.match(/ID:\s*(\w+)/);
      if (!idMatch) {
        console.log('Could not extract candidate ID');
        return;
      }

      const candidateId = idMatch[1];
      const result = await callMCPTool('boond_candidates_get', {
        id: candidateId,
      });

      expect(result.content).toBeDefined();
      expect(result.content[0].text).toContain(candidateId);
    });

    it('should search contacts', async () => {
      const result = await callMCPTool('boond_contacts_search', {
        page: 1,
        limit: 5,
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('should search resources', async () => {
      const result = await callMCPTool('boond_resources_search', {
        page: 1,
        limit: 5,
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('should search contracts', async () => {
      const result = await callMCPTool('boond_contracts_search', {
        page: 1,
        limit: 5,
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });
  });

  describe('CRM Domain', () => {
    it('should search companies', async () => {
      const result = await callMCPTool('boond_companies_search', {
        page: 1,
        limit: 5,
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('should search opportunities', async () => {
      const result = await callMCPTool('boond_opportunities_search', {
        page: 1,
        limit: 5,
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('should search quotations', async () => {
      const result = await callMCPTool('boond_quotations_search', {
        page: 1,
        limit: 5,
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });
  });

  describe('Finance Domain', () => {
    it('should search invoices', async () => {
      const result = await callMCPTool('boond_invoices_search', {
        page: 1,
        limit: 5,
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('should search purchases', async () => {
      const result = await callMCPTool('boond_purchases_search', {
        page: 1,
        limit: 5,
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('should search orders', async () => {
      const result = await callMCPTool('boond_orders_search', {
        page: 1,
        limit: 5,
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });
  });

  describe('Projects Domain', () => {
    it('should search projects', async () => {
      const result = await callMCPTool('boond_projects_search', {
        page: 1,
        limit: 5,
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('should search deliveries', async () => {
      const result = await callMCPTool('boond_deliveries_search', {
        page: 1,
        limit: 5,
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('should search actions', async () => {
      const result = await callMCPTool('boond_actions_search', {
        page: 1,
        limit: 5,
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });
  });

  describe('Time Domain', () => {
    it('should search time reports', async () => {
      const result = await callMCPTool('boond_time_reports_search', {
        page: 1,
        limit: 5,
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('should search absences', async () => {
      const result = await callMCPTool('boond_absences_search', {
        page: 1,
        limit: 5,
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('should search expense reports', async () => {
      const result = await callMCPTool('boond_expense_reports_search', {
        page: 1,
        limit: 5,
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });
  });

  describe('Admin Domain', () => {
    it('should search agencies', async () => {
      const result = await callMCPTool('boond_agencies_search', {
        page: 1,
        limit: 5,
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('should search business units', async () => {
      const result = await callMCPTool('boond_business_units_search', {
        page: 1,
        limit: 5,
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('should search accounts', async () => {
      const result = await callMCPTool('boond_accounts_search', {
        page: 1,
        limit: 5,
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });
  });

  describe('Documents Domain', () => {
    it('should search documents', async () => {
      const result = await callMCPTool('boond_documents_search', {
        page: 1,
        limit: 5,
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });
  });

  describe('System Domain', () => {
    it('should search apps', async () => {
      const result = await callMCPTool('boond_apps_search', {});

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('should search settings', async () => {
      const result = await callMCPTool('boond_settings_search', {
        page: 1,
        limit: 5,
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('should search alerts', async () => {
      const result = await callMCPTool('boond_alerts_search', {
        page: 1,
        limit: 5,
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid tool names', async () => {
      await expect(callMCPTool('invalid_tool_name', {})).rejects.toThrow();
    });

    it('should handle invalid parameters', async () => {
      await expect(
        callMCPTool('boond_candidates_get', { invalid_param: 'value' })
      ).rejects.toThrow();
    });
  });
});
