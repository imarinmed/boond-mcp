#!/usr/bin/env node
/**
 * BoondManager MCP Server
 * Entry point for the Model Context Protocol server
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { BoondAPIClient, RoleTokens } from './api/client.js';
import { applyInputSanitizationToServer } from './utils/input-sanitization.js';
import { applyRateLimitingToServer, createRateLimiterFromEnv } from './utils/rate-limiter.js';
import { loadUsers } from './utils/config.js';
import { User } from './types/auth.js';
import {
  // HR Domain
  registerCandidateTools,
  registerContractTools,
  registerResourceTools,
  registerContactTools as registerHRContactTools,
  registerBulkCreateCandidateTool,
  registerBulkUpdateCandidateTool,
  registerBulkDeleteCandidateTool,
  registerBulkCreateContactTool,
  registerBulkUpdateContactTool,
  registerBulkDeleteContactTool,
  registerBulkCreateResourceTool,
  registerBulkUpdateResourceTool,
  registerBulkDeleteResourceTool,
  // CRM Domain
  registerBulkCreateCompanyTool,
  registerBulkUpdateCompanyTool,
  registerBulkDeleteCompanyTool,
  registerCompanyTools,
  registerQuotationTools,
  registerOpportunityTools,
  // Finance Domain
  registerInvoiceTools,
  registerPurchaseTools,
  registerOrderTools,
  registerBankingTools,
  // Projects Domain
  registerProjectTools,
  registerDeliveryTools,
  registerActionTools,
  // Time Domain
  registerTimeReportTools,
  registerAbsenceTools,
  registerExpenseTools,
  // Admin Domain
  registerAgencyTools,
  registerAccountTools,
  registerBusinessUnitTools,
  // Documents Domain
  registerDocumentTools,
  // System Domain
  registerAppTools,
  registerSettingTools,
  registerAlertTools,
  registerFullTextSearchTool,
  registerFacetedSearchTool,
  registerDateRangeSearchTool,
  registerAdvancedSearchTool,
  registerAdminTools,
} from './tools/index.js';

/**
 * Main server initialization and startup
 */
async function main(): Promise<void> {
  try {
    // Initialize server
    const server = new McpServer({
      name: 'boondmanager',
      version: '0.1.0',
    });

    // Check for multi-user mode configuration
    const usersConfigPath = process.env['BOOND_USERS_CONFIG'];
    let users: User[] = [];
    let apiClient: BoondAPIClient;
    let isMultiUserMode = false;

    if (usersConfigPath) {
      // Multi-user mode: load users and use role-based tokens
      isMultiUserMode = true;
      users = loadUsers(usersConfigPath);
      isMultiUserMode = true;
      console.error(
        `Multi-user mode enabled: ${users.length} users loaded from ${usersConfigPath}`
      );

      // Get role-based tokens from environment
      const hrToken = process.env['BOOND_HR_API_TOKEN'];
      const financeToken = process.env['BOOND_FINANCE_API_TOKEN'];
      const adminToken = process.env['BOOND_ADMIN_API_TOKEN'];

      if (!hrToken || !financeToken || !adminToken) {
        console.error(
          'Error: Multi-user mode requires BOOND_HR_API_TOKEN, BOOND_FINANCE_API_TOKEN, and BOOND_ADMIN_API_TOKEN environment variables.'
        );
        process.exit(1);
      }

      const roleTokens: RoleTokens = {
        hr: hrToken,
        finance: financeToken,
        admin: adminToken,
      };

      apiClient = new BoondAPIClient(roleTokens);
    } else {
      // Single-user mode: use single API token
      const apiToken = process.env['BOOND_API_TOKEN'];
      if (!apiToken) {
        console.error(
          'Error: BOOND_API_TOKEN environment variable is not set. Please set it before starting the server.'
        );
        process.exit(1);
      }

      console.error('Single-user mode enabled');
      apiClient = new BoondAPIClient(apiToken);
    }

    // Apply API-level request rate limiting for tool calls
    const rateLimiter = createRateLimiterFromEnv(process.env);
    applyRateLimitingToServer(server, rateLimiter);
    applyInputSanitizationToServer(server);

    if (rateLimiter.getConfig().enabled) {
      const config = rateLimiter.getConfig();
      console.error(
        `Rate limiting enabled: ${config.maxRequests} requests per ${config.windowMs}ms`
      );
    }

    // Register all tools
    // HR Domain
    registerCandidateTools(server, apiClient);
    registerContractTools(server, apiClient);
    registerResourceTools(server, apiClient);
    registerHRContactTools(server, apiClient);
    registerBulkCreateCandidateTool(server, apiClient);
    registerBulkUpdateCandidateTool(server, apiClient);
    registerBulkDeleteCandidateTool(server, apiClient);
    registerBulkCreateContactTool(server, apiClient);
    registerBulkUpdateContactTool(server, apiClient);
    registerBulkDeleteContactTool(server, apiClient);
    registerBulkCreateResourceTool(server, apiClient);
    registerBulkUpdateResourceTool(server, apiClient);
    registerBulkDeleteResourceTool(server, apiClient);

    // CRM Domain
    registerBulkCreateCompanyTool(server, apiClient);
    registerBulkUpdateCompanyTool(server, apiClient);
    registerBulkDeleteCompanyTool(server, apiClient);
    registerCompanyTools(server, apiClient);
    registerQuotationTools(server, apiClient);
    registerOpportunityTools(server, apiClient);

    // Finance Domain
    registerInvoiceTools(server, apiClient);
    registerPurchaseTools(server, apiClient);
    registerOrderTools(server, apiClient);
    registerBankingTools(server, apiClient);

    // Projects Domain
    registerProjectTools(server, apiClient);
    registerDeliveryTools(server, apiClient);
    registerActionTools(server, apiClient);

    // Time Domain
    registerTimeReportTools(server, apiClient);
    registerAbsenceTools(server, apiClient);
    registerExpenseTools(server, apiClient);

    // Admin Domain
    registerAgencyTools(server, apiClient);
    registerAccountTools(server, apiClient);
    registerBusinessUnitTools(server, apiClient);

    // Documents Domain
    registerDocumentTools(server, apiClient);

    // System Domain
    registerAppTools(server, apiClient);
    registerSettingTools(server, apiClient);
    registerAlertTools(server, apiClient);
    registerFullTextSearchTool(server, apiClient);
    registerFacetedSearchTool(server, apiClient);
    registerDateRangeSearchTool(server, apiClient);
    registerAdvancedSearchTool(server, apiClient);

    // Register admin tools in multi-user mode
    if (isMultiUserMode) {
      registerAdminTools(server, usersConfigPath!);
    }

    // Initialize transport and connect
    const transport = new StdioServerTransport();
    await server.connect(transport);

    // Log startup message to stderr only
    console.error('BoondManager MCP Server running on stdio');

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.error('Received SIGINT, shutting down gracefully...');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.error('Received SIGTERM, shutting down gracefully...');
      process.exit(0);
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Fatal error: ${errorMessage}`);
    process.exit(1);
  }
}

// Run the server
main().catch(error => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`Uncaught error: ${errorMessage}`);
  process.exit(1);
});
