/**
 * Quotation tools registration
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BoondAPIClient } from '../../api/client.js';

import type { Quotation, SearchResponse } from '../../types/boond.js';
import {
  searchParamsSchema,
  createQuotationSchema,
  quotationIdSchema,
  updateQuotationWithIdSchema,
} from '../../types/schemas.js';

import { handleSearchError, handleToolError } from '../../utils/error-handling.js';

/**
 * Format quotation list for display
 */
function formatQuotationList(result: SearchResponse<Quotation>): string {
  if (result.data.length === 0) {
    return 'No quotations found.';
  }

  const quotations = result.data.map(quotation => {
    const lines: string[] = [];
    lines.push(`📋 Quotation ID: ${quotation.id}`);
    lines.push(`   Opportunity: ${quotation.opportunityId}`);
    lines.push(`   Company: ${quotation.companyId}`);
    lines.push(`   Total: ${quotation.total}`);
    lines.push(`   Status: ${quotation.status}`);
    if (quotation.sentAt) lines.push(`   Sent: ${quotation.sentAt}`);
    if (quotation.validUntil) lines.push(`   Valid Until: ${quotation.validUntil}`);
    if (quotation.description) lines.push(`   Description: ${quotation.description}`);
    return lines.join('\n');
  });

  const summary = `Found ${result.data.length} quotation(s) (Page ${result.pagination.page}/${Math.ceil(result.pagination.total / result.pagination.limit)} of ${result.pagination.total} total)`;

  return `${summary}\n\n${quotations.join('\n\n')}`;
}

/**
 * Format single quotation details
 */
function formatQuotation(quotation: Quotation): string {
  const lines: string[] = [];
  lines.push(`📋 Quotation: ${quotation.id}`);
  lines.push(`Opportunity ID: ${quotation.opportunityId}`);
  lines.push(`Company ID: ${quotation.companyId}`);
  lines.push(`Total: ${quotation.total}`);
  lines.push(`Status: ${quotation.status}`);
  if (quotation.sentAt) lines.push(`Sent: ${quotation.sentAt}`);
  if (quotation.validUntil) lines.push(`Valid Until: ${quotation.validUntil}`);
  if (quotation.description) lines.push(`Description: ${quotation.description}`);
  if (quotation.createdAt) lines.push(`Created: ${quotation.createdAt}`);
  if (quotation.updatedAt) lines.push(`Updated: ${quotation.updatedAt}`);

  return lines.join('\n');
}

export function registerQuotationTools(server: McpServer, client: BoondAPIClient): void {
  /**
   * boond_quotations_search - Search quotations
   */
  server.registerTool(
    'boond_quotations_search',
    {
      description: 'Search quotations by criteria',
      inputSchema: searchParamsSchema.shape,
    },
    async params => {
      try {
        const validated = searchParamsSchema.parse(params);
        const result = await client.searchQuotations(validated);
        const text = formatQuotationList(result);

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleSearchError(error, 'quotations');
      }
    }
  );

  /**
   * boond_quotations_get - Get quotation by ID
   */
  server.registerTool(
    'boond_quotations_get',
    {
      description: 'Get a quotation by ID',
      inputSchema: quotationIdSchema.shape,
    },
    async params => {
      try {
        const validated = quotationIdSchema.parse(params);
        const quotation = await client.getQuotation(validated.id);
        const text = formatQuotation(quotation);

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleToolError(error, 'retrieving', 'Quotation');
      }
    }
  );

  /**
   * boond_quotations_create - Create new quotation
   */
  server.registerTool(
    'boond_quotations_create',
    {
      description: 'Create a new quotation',
      inputSchema: createQuotationSchema.shape,
    },
    async params => {
      try {
        const validated = createQuotationSchema.parse(params);
        const quotation = await client.createQuotation(validated);
        const text = formatQuotation(quotation);

        return {
          content: [
            {
              type: 'text',
              text: `Quotation created successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'creating', 'Quotation');
      }
    }
  );

  /**
   * boond_quotations_update - Update existing quotation
   */
  server.registerTool(
    'boond_quotations_update',
    {
      description: 'Update an existing quotation',
      inputSchema: updateQuotationWithIdSchema.shape,
    },
    async params => {
      try {
        const { id, ...updateData } = updateQuotationWithIdSchema.parse(params);
        const quotation = await client.updateQuotation(id, updateData);
        const text = formatQuotation(quotation);

        return {
          content: [
            {
              type: 'text',
              text: `Quotation updated successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'updating', 'Quotation');
      }
    }
  );

  /**
   * boond_quotations_send - Send quotation
   */
  server.registerTool(
    'boond_quotations_send',
    {
      description: 'Send a quotation',
      inputSchema: quotationIdSchema.shape,
    },
    async params => {
      try {
        const validated = quotationIdSchema.parse(params);
        const quotation = await client.sendQuotation(validated.id);
        const text = formatQuotation(quotation);

        return {
          content: [
            {
              type: 'text',
              text: `Quotation sent successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'sending', 'Quotation');
      }
    }
  );

  server.registerTool(
    'boond_quotations_delete',
    {
      description: 'Delete a quotation by ID',
      inputSchema: quotationIdSchema.shape,
    },
    async params => {
      try {
        const validated = quotationIdSchema.parse(params);
        await client.deleteQuotation(validated.id);
        return {
          content: [
            {
              type: 'text',
              text: `Quotation ${validated.id} deleted successfully.`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'deleting', 'Quotation');
      }
    }
  );
}
