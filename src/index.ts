#!/usr/bin/env node
/**
 * BoondManager MCP Server
 * Entry point for the Model Context Protocol server
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import express from 'express';
import cors from 'cors';
import { BoondAPIClient } from './api/client.js';
import { applyInputSanitizationToServer } from './utils/input-sanitization.js';
import { applyRateLimitingToServer, createRateLimiterFromEnv } from './utils/rate-limiter.js';
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

    // Initialize API client auth from environment
    const apiToken = process.env['BOOND_API_TOKEN'];
    const clientToken = process.env['BOOND_CLIENT_TOKEN'];
    const clientKey = process.env['BOOND_CLIENT_KEY'];
    const userToken = process.env['BOOND_USER_TOKEN'] || apiToken;
    const jwtModeEnv = process.env['BOOND_JWT_MODE'];
    const jwtMode = jwtModeEnv === 'god' ? 'god' : 'normal';

    const apiClient =
      clientToken && clientKey && userToken
        ? new BoondAPIClient({
            type: 'x-jwt-client',
            clientToken,
            clientKey,
            userToken,
            mode: jwtMode,
          })
        : apiToken
          ? new BoondAPIClient(apiToken)
          : null;

    if (!apiClient) {
      console.error(
        'Error: missing Boond API credentials. Set either BOOND_API_TOKEN (legacy) OR BOOND_CLIENT_TOKEN + BOOND_CLIENT_KEY + BOOND_USER_TOKEN (X-Jwt-Client).'
      );
      process.exit(1);
    }

    if (clientToken && clientKey && userToken) {
      console.error('Boond auth mode: X-Jwt-Client-BoondManager');
    } else {
      console.error('Boond auth mode: X-Token-BoondManager');
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

    // Choose transport based on TRANSPORT_TYPE environment variable
    const transportType = process.env['TRANSPORT_TYPE'] || 'stdio';

    if (transportType === 'http') {
      const mcpApiKey = process.env['MCP_API_KEY'];
      if (!mcpApiKey) {
        console.error(
          'Error: MCP_API_KEY environment variable is not set. HTTP transport requires client authentication.'
        );
        process.exit(1);
      }

      // HTTP/SSE Transport
      const app = express();
      const port = parseInt(process.env['PORT'] || '3000', 10);

      // Apply CORS middleware
      app.use(cors());
      app.use(express.json());

      // Protect MCP endpoints with API key authentication
      app.use((req, res, next) => {
        if (req.path === '/health') {
          next();
          return;
        }

        const apiKey = req.header('x-api-key');
        if (!apiKey || apiKey !== mcpApiKey) {
          res.status(401).json({ error: 'Unauthorized' });
          return;
        }

        next();
      });

      // Health check endpoint
      app.get('/health', (_req, res) => {
        res.json({
          status: 'ok',
          timestamp: new Date().toISOString(),
        });
      });

      // Store transports by session ID for bidirectional communication
      const transports = new Map<string, SSEServerTransport>();

      // MCP SSE endpoint
      app.get('/mcp', async (_req, res) => {
        const transport = new SSEServerTransport('/mcp', res);
        const sessionId = transport['sessionId'];
        transports.set(sessionId, transport);

        res.on('close', () => {
          transports.delete(sessionId);
        });

        await server.connect(transport);
      });

      // Handle POST messages for bidirectional MCP
      app.post('/mcp', async (req, res) => {
        const sessionId = req.query['sessionId'] as string | undefined;

        if (!sessionId) {
          res.status(400).json({ error: 'Missing sessionId parameter' });
          return;
        }

        const transport = transports.get(sessionId);
        if (!transport) {
          res.status(404).json({ error: 'Session not found' });
          return;
        }

        try {
          await transport.handlePostMessage(req, res, req.body);
        } catch (error) {
          console.error('Error handling POST message:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      });

      // Start HTTP server
      const httpServer = app.listen(port, () => {
        console.error(`BoondManager MCP Server running on HTTP at http://localhost:${port}`);
        console.error('SSE endpoint: GET http://localhost:' + port + '/mcp');
        console.error('Health check: GET http://localhost:' + port + '/health');
      });

      // Handle graceful shutdown
      process.on('SIGINT', () => {
        console.error('Received SIGINT, shutting down gracefully...');
        httpServer.close(() => {
          console.error('HTTP server closed');
          process.exit(0);
        });
      });

      process.on('SIGTERM', () => {
        console.error('Received SIGTERM, shutting down gracefully...');
        httpServer.close(() => {
          console.error('HTTP server closed');
          process.exit(0);
        });
      });
    } else {
      // Stdio Transport (default)
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
    }
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
