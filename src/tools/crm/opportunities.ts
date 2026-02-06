/**
 * Opportunity tools registration
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BoondAPIClient } from '../../api/client.js';

import type { Opportunity, SearchResponse } from '../../types/boond.js';
import {
  searchParamsSchema,
  createOpportunitySchema,
  opportunityIdSchema,
  updateOpportunityWithIdSchema,
} from '../../types/schemas.js';

import { handleSearchError, handleToolError } from '../../utils/error-handling.js';

/**
 * Format opportunity list for display
 */
function formatOpportunityList(result: SearchResponse<Opportunity>): string {
  if (result.data.length === 0) {
    return 'No opportunities found.';
  }

  const opportunities = result.data.map(opportunity => {
    const lines: string[] = [];
    lines.push(`💼 ${opportunity.name} (ID: ${opportunity.id})`);
    if (opportunity.companyId) lines.push(`   Company ID: ${opportunity.companyId}`);
    if (opportunity.status) lines.push(`   Status: ${opportunity.status}`);
    if (opportunity.value) lines.push(`   Value: $${opportunity.value}`);
    if (opportunity.probability) lines.push(`   Probability: ${opportunity.probability}%`);
    if (opportunity.expectedCloseDate)
      lines.push(`   Expected Close: ${opportunity.expectedCloseDate}`);
    if (opportunity.description) lines.push(`   Description: ${opportunity.description}`);
    return lines.join('\n');
  });

  const summary = `Found ${result.data.length} opportunity(ies) (Page ${result.pagination.page}/${Math.ceil(result.pagination.total / result.pagination.limit)} of ${result.pagination.total} total)`;

  return `${summary}\n\n${opportunities.join('\n\n')}`;
}

/**
 * Format single opportunity details
 */
function formatOpportunity(opportunity: Opportunity): string {
  const lines: string[] = [];
  lines.push(`💼 Opportunity: ${opportunity.name}`);
  lines.push(`ID: ${opportunity.id}`);
  if (opportunity.companyId) lines.push(`Company ID: ${opportunity.companyId}`);
  if (opportunity.contactId) lines.push(`Contact ID: ${opportunity.contactId}`);
  if (opportunity.status) lines.push(`Status: ${opportunity.status}`);
  if (opportunity.value) lines.push(`Value: $${opportunity.value}`);
  if (opportunity.probability) lines.push(`Probability: ${opportunity.probability}%`);
  if (opportunity.expectedCloseDate)
    lines.push(`Expected Close Date: ${opportunity.expectedCloseDate}`);
  if (opportunity.description) lines.push(`Description: ${opportunity.description}`);
  if (opportunity.createdAt) lines.push(`Created: ${opportunity.createdAt}`);
  if (opportunity.updatedAt) lines.push(`Updated: ${opportunity.updatedAt}`);

  return lines.join('\n');
}

export function registerOpportunityTools(server: McpServer, client: BoondAPIClient): void {
  /**
   * boond_opportunities_search - Search opportunities
   */
  server.registerTool(
    'boond_opportunities_search',
    {
      description: 'Search opportunities by name or criteria',
      inputSchema: searchParamsSchema.shape,
    },
    async params => {
      try {
        const validated = searchParamsSchema.parse(params);
        const result = await client.searchOpportunities(validated);
        const text = formatOpportunityList(result);

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleSearchError(error, 'opportunities');
      }
    }
  );

  /**
   * boond_opportunities_get - Get opportunity by ID
   */
  server.registerTool(
    'boond_opportunities_get',
    {
      description: 'Get an opportunity by ID',
      inputSchema: opportunityIdSchema.shape,
    },
    async params => {
      try {
        const validated = opportunityIdSchema.parse(params);
        const opportunity = await client.getOpportunity(validated.id);
        const text = formatOpportunity(opportunity);

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleToolError(error, 'retrieving', 'Opportunity');
      }
    }
  );

  /**
   * boond_opportunities_create - Create new opportunity
   */
  server.registerTool(
    'boond_opportunities_create',
    {
      description: 'Create a new opportunity',
      inputSchema: createOpportunitySchema.shape,
    },
    async params => {
      try {
        const validated = createOpportunitySchema.parse(params);
        const opportunity = await client.createOpportunity(validated);
        const text = formatOpportunity(opportunity);

        return {
          content: [
            {
              type: 'text',
              text: `Opportunity created successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'creating', 'Opportunity');
      }
    }
  );

  /**
   * boond_opportunities_update - Update existing opportunity
   */
  server.registerTool(
    'boond_opportunities_update',
    {
      description: 'Update an existing opportunity',
      inputSchema: updateOpportunityWithIdSchema.shape,
    },
    async params => {
      try {
        const { id, ...updateData } = updateOpportunityWithIdSchema.parse(params);
        const opportunity = await client.updateOpportunity(id, updateData);
        const text = formatOpportunity(opportunity);

        return {
          content: [
            {
              type: 'text',
              text: `Opportunity updated successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'updating', 'Opportunity');
      }
    }
  );

  server.registerTool(
    'boond_opportunities_delete',
    {
      description: 'Delete an opportunity by ID',
      inputSchema: opportunityIdSchema.shape,
    },
    async params => {
      try {
        const validated = opportunityIdSchema.parse(params);
        await client.deleteOpportunity(validated.id);
        return {
          content: [
            {
              type: 'text',
              text: `Opportunity ${validated.id} deleted successfully.`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'deleting', 'Opportunity');
      }
    }
  );
}
