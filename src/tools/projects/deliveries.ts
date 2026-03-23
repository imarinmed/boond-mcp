import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BoondAPIClient } from '../../api/client.js';
import { z } from 'zod';
import {
  searchDeliveriesSchema,
  deliveryIdSchema,
  createDeliverySchema,
  updateDeliveryWithIdSchema,
} from '../../types/schemas.js';
import type { Delivery, SearchResponse } from '../../types/boond.js';
import { handleSearchError, handleToolError } from '../../utils/error-handling.js';
import { READ_TOOL_ANNOTATIONS, WRITE_TOOL_ANNOTATIONS } from '../../utils/tool-registry.js';
import { dryRunSchema, dryRunResponse } from '../../utils/dry-run.js';

function resolveDeliveryName(delivery: Delivery): string {
  const record = delivery as unknown as Record<string, unknown>;
  const candidates = [
    record['name'],
    record['title'],
    record['label'],
    record['projectName'],
    record['projectTitle'],
  ];

  for (const value of candidates) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  return `Delivery #${delivery.id}`;
}

function resolveDeliveryStatus(delivery: Delivery): string {
  const record = delivery as unknown as Record<string, unknown>;
  const candidates = [
    record['status'],
    record['state'],
    record['workflowStatus'],
    record['validationStatus'],
    record['activity'],
  ];

  for (const value of candidates) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
    if (typeof value === 'number') {
      return String(value);
    }
    if (typeof value === 'boolean') {
      return value ? 'active' : 'inactive';
    }
  }

  return 'unknown';
}

async function enrichDeliveriesWithDetails(
  client: BoondAPIClient,
  deliveries: Delivery[],
  maxLookups: number = 10
): Promise<Delivery[]> {
  const candidates = deliveries
    .map((delivery, index) => ({ delivery, index }))
    .filter(({ delivery }) => {
      const missingStatus = resolveDeliveryStatus(delivery) === 'unknown';
      const missingName = resolveDeliveryName(delivery).startsWith('Delivery #');
      return missingStatus || missingName;
    })
    .slice(0, maxLookups);

  if (candidates.length === 0) {
    return deliveries;
  }

  const enriched = [...deliveries];
  const results = await Promise.allSettled(
    candidates.map(({ delivery }) => client.getDelivery(delivery.id))
  );

  for (let i = 0; i < results.length; i += 1) {
    const result = results[i];
    const candidate = candidates[i];
    if (!candidate || !result || result.status !== 'fulfilled') {
      continue;
    }

    enriched[candidate.index] = {
      ...candidate.delivery,
      ...result.value,
    };
  }

  return enriched;
}

function formatDeliveryList(result: SearchResponse<Delivery>): string {
  if (result.data.length === 0) {
    return 'No deliveries found.';
  }

  const deliveries = result.data.map(delivery => {
    const lines: string[] = [];
    lines.push(`📦 ${resolveDeliveryName(delivery)} (ID: ${delivery.id})`);
    lines.push(`   Status: ${resolveDeliveryStatus(delivery)}`);
    lines.push(`   Project ID: ${delivery.projectId}`);
    if (delivery.description) lines.push(`   Description: ${delivery.description}`);
    if (delivery.dueDate) lines.push(`   Due: ${delivery.dueDate}`);
    if (delivery.deliveredAt) lines.push(`   Delivered: ${delivery.deliveredAt}`);
    if (delivery.createdAt) lines.push(`   Created: ${delivery.createdAt}`);
    return lines.join('\n');
  });

  const summary = `Found ${result.data.length} delivery(ies) (Page ${result.pagination.page}/${Math.ceil(result.pagination.total / result.pagination.limit)} of ${result.pagination.total} total)`;

  return `${summary}\n\n${deliveries.join('\n\n')}`;
}

function formatDelivery(delivery: Delivery): string {
  const lines: string[] = [];
  lines.push(`📦 Delivery: ${resolveDeliveryName(delivery)}`);
  lines.push(`ID: ${delivery.id}`);
  lines.push(`Status: ${resolveDeliveryStatus(delivery)}`);
  lines.push(`Project ID: ${delivery.projectId}`);
  if (delivery.description) lines.push(`Description: ${delivery.description}`);
  if (delivery.dueDate) lines.push(`Due Date: ${delivery.dueDate}`);
  if (delivery.deliveredAt) lines.push(`Delivered: ${delivery.deliveredAt}`);
  if (delivery.createdAt) lines.push(`Created: ${delivery.createdAt}`);
  if (delivery.updatedAt) lines.push(`Updated: ${delivery.updatedAt}`);

  return lines.join('\n');
}

export function registerDeliveryTools(server: McpServer, client: BoondAPIClient): void {
  server.registerTool(
    'boond_deliveries_search',
    {
      description: 'Search deliveries by criteria',
      annotations: READ_TOOL_ANNOTATIONS,
      inputSchema: {
        query: z.string().optional().describe('Search query'),
        page: z.number().int().min(1).default(1).describe('Page number'),
        limit: z.number().int().min(1).max(100).default(20).describe('Results per page'),
      },
    },
    async input => {
      try {
        const params = searchDeliveriesSchema.parse(input);
        const result = await client.searchDeliveries(params);
        result.data = await enrichDeliveriesWithDetails(client, result.data);
        result.data = result.data.slice(0, params.limit);
        return {
          content: [
            {
              type: 'text',
              text: formatDeliveryList(result),
            },
          ],
        };
      } catch (error) {
        return handleSearchError(error, 'deliveries');
      }
    }
  );

  server.registerTool(
    'boond_deliveries_get',
    {
      description: 'Get a delivery by ID',
      annotations: READ_TOOL_ANNOTATIONS,
      inputSchema: {
        id: z.string().min(1, 'Delivery ID is required').describe('Delivery ID'),
      },
    },
    async input => {
      try {
        const params = deliveryIdSchema.parse(input);
        const delivery = await client.getDelivery(params.id);
        return {
          content: [
            {
              type: 'text',
              text: formatDelivery(delivery),
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'retrieving', 'Delivery');
      }
    }
  );

  server.registerTool(
    'boond_deliveries_create',
    {
      description: 'Create a new delivery',
      annotations: WRITE_TOOL_ANNOTATIONS,
      inputSchema: z
        .object({
          name: z.string().min(1).describe('Delivery name'),
          projectId: z.string().min(1).describe('Project ID'),
          description: z.string().optional().describe('Delivery description'),
          dueDate: z.string().optional().describe('Due date (ISO 8601 format)'),
        })
        .merge(dryRunSchema).shape,
    },
    async input => {
      try {
        const validated = createDeliverySchema.merge(dryRunSchema).parse(input);
        const { dryRun, ...data } = validated;
        if (dryRun) {
          return dryRunResponse('Create Delivery', data);
        }
        const delivery = await client.createDelivery(data);
        return {
          content: [
            {
              type: 'text',
              text: `✅ Delivery created successfully:\n\n${formatDelivery(delivery)}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'creating', 'Delivery');
      }
    }
  );

  server.registerTool(
    'boond_deliveries_update',
    {
      description: 'Update an existing delivery',
      annotations: WRITE_TOOL_ANNOTATIONS,
      inputSchema: z
        .object({
          id: z.string().min(1).describe('Delivery ID'),
          name: z.string().optional().describe('Delivery name'),
          description: z.string().optional().describe('Delivery description'),
          dueDate: z.string().optional().describe('Due date (ISO 8601 format)'),
          status: z
            .enum(['pending', 'in-progress', 'completed', 'blocked'])
            .optional()
            .describe('Delivery status'),
        })
        .merge(dryRunSchema).shape,
    },
    async input => {
      try {
        const validated = updateDeliveryWithIdSchema.merge(dryRunSchema).parse(input);
        const { id, dryRun, ...updateData } = validated;
        if (dryRun) {
          return dryRunResponse('Update Delivery', { id, ...updateData });
        }
        const delivery = await client.updateDelivery(id, updateData);
        return {
          content: [
            {
              type: 'text',
              text: `✅ Delivery updated successfully:\n\n${formatDelivery(delivery)}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'updating', 'Delivery');
      }
    }
  );

  server.registerTool(
    'boond_deliveries_send',
    {
      description: 'Send a delivery notification',
      annotations: WRITE_TOOL_ANNOTATIONS,
      inputSchema: deliveryIdSchema.merge(dryRunSchema).shape,
    },
    async input => {
      try {
        const { id, dryRun } = deliveryIdSchema.merge(dryRunSchema).parse(input);
        if (dryRun) {
          return dryRunResponse('Send Delivery', { id });
        }
        const delivery = await client.sendDelivery(id);
        return {
          content: [
            {
              type: 'text',
              text: `✅ Delivery sent successfully:\n\n${formatDelivery(delivery)}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'sending', 'Delivery');
      }
    }
  );
}
