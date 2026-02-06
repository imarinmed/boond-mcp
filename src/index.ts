#!/usr/bin/env node
/**
 * BoondManager MCP Server
 * Entry point for the Model Context Protocol server
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { BoondAPIClient } from './api/client.js';
import {
  // HR Domain
  registerCandidateTools,
  registerContractTools,
  registerResourceTools,
  registerContactTools as registerHRContactTools,
  registerBulkCreateCandidateTool,
  // CRM Domain
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

    // Get API token from environment
    const apiToken = process.env['BOOND_API_TOKEN'];
    if (!apiToken) {
      console.error(
        'Error: BOOND_API_TOKEN environment variable is not set. Please set it before starting the server.'
      );
      process.exit(1);
    }

    // Initialize API client
    const apiClient = new BoondAPIClient(apiToken);

    // Register all tools
    // HR Domain
    registerCandidateTools(server, apiClient);
    registerContractTools(server, apiClient);
    registerResourceTools(server, apiClient);
    registerHRContactTools(server, apiClient);
    registerBulkCreateCandidateTool(server, apiClient);

    // CRM Domain
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
