/**
 * Order tools registration
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BoondAPIClient } from '../../api/client.js';
import {
  searchParamsSchema,
  createOrderSchema,
  orderIdSchema,
  updateOrderWithIdSchema,
} from '../../types/schemas.js';
import type { Order, SearchResponse } from '../../types/boond.js';
import { handleSearchError, handleToolError } from '../../utils/error-handling.js';
import { enrichItemsWithDetails } from '../../utils/enrichment.js';
import { pickCompanyId, pickStatus, pickTotal } from '../../utils/normalization.js';
import { READ_TOOL_ANNOTATIONS, WRITE_TOOL_ANNOTATIONS } from '../../utils/tool-registry.js';
import { dryRunSchema, dryRunResponse } from '../../utils/dry-run.js';

function toOrderRecord(order: Order): Record<string, unknown> {
  return order as unknown as Record<string, unknown>;
}

function shouldEnrichOrder(order: Order): boolean {
  const record = toOrderRecord(order);
  return (
    pickStatus(record) === 'unknown' ||
    pickCompanyId(record) === 'unknown' ||
    pickTotal(record) === 'unknown'
  );
}

/**
 * Format order list for display
 */
function formatOrderList(result: SearchResponse<Order>): string {
  if (result.data.length === 0) {
    return 'No orders found.';
  }

  const orders = result.data.map(order => {
    const lines: string[] = [];
    const record = toOrderRecord(order);
    lines.push(`📦 Order #${order.id} (Status: ${pickStatus(record)})`);
    lines.push(`   Company: ${pickCompanyId(record)}`);
    if (order.projectId) lines.push(`   Project: ${order.projectId}`);
    lines.push(`   Total: ${pickTotal(record)}`);
    return lines.join('\n');
  });

  const summary = `Found ${result.data.length} order(s) (Page ${result.pagination.page}/${Math.ceil(result.pagination.total / result.pagination.limit)} of ${result.pagination.total} total)`;

  return `${summary}\n\n${orders.join('\n\n')}`;
}

/**
 * Format single order details
 */
function formatOrder(order: Order): string {
  const lines: string[] = [];
  const record = toOrderRecord(order);
  lines.push(`📦 Order: ${order.id}`);
  lines.push(`Status: ${pickStatus(record)}`);
  lines.push(`Company: ${pickCompanyId(record)}`);
  if (order.projectId) lines.push(`Project: ${order.projectId}`);
  lines.push(`Total: ${pickTotal(record)}`);
  if (order.createdAt) lines.push(`Created: ${order.createdAt}`);
  if (order.updatedAt) lines.push(`Updated: ${order.updatedAt}`);

  return lines.join('\n');
}

export function registerOrderTools(server: McpServer, client: BoondAPIClient): void {
  /**
   * boond_orders_search - Search orders
   */
  server.registerTool(
    'boond_orders_search',
    {
      description: 'Search orders by criteria',
      annotations: READ_TOOL_ANNOTATIONS,
      inputSchema: searchParamsSchema.shape,
    },
    async params => {
      try {
        const validated = searchParamsSchema.parse(params);
        const result = await client.searchOrders(validated);
        result.data = await enrichItemsWithDetails(
          result.data,
          order => client.getOrder(order.id),
          shouldEnrichOrder,
          10
        );
        result.data = result.data.slice(0, validated.limit);
        const text = formatOrderList(result);

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleSearchError(error, 'orders');
      }
    }
  );

  /**
   * boond_orders_get - Get order by ID
   */
  server.registerTool(
    'boond_orders_get',
    {
      description: 'Get an order by ID',
      annotations: READ_TOOL_ANNOTATIONS,
      inputSchema: orderIdSchema.shape,
    },
    async params => {
      try {
        const validated = orderIdSchema.parse(params);
        const order = await client.getOrder(validated.id);
        const text = formatOrder(order);

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleToolError(error, 'retrieving', 'Order');
      }
    }
  );

  /**
   * boond_orders_create - Create new order
   */
  server.registerTool(
    'boond_orders_create',
    {
      description: 'Create a new order',
      annotations: WRITE_TOOL_ANNOTATIONS,
      inputSchema: createOrderSchema.merge(dryRunSchema).shape,
    },
    async params => {
      try {
        const validated = createOrderSchema.merge(dryRunSchema).parse(params);
        const { dryRun, ...data } = validated;
        if (dryRun) {
          return dryRunResponse('Create Order', data);
        }

        const order = await client.createOrder(data);
        const text = formatOrder(order);

        return {
          content: [
            {
              type: 'text',
              text: `Order created successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'creating', 'Order');
      }
    }
  );

  /**
   * boond_orders_update - Update existing order
   */
  server.registerTool(
    'boond_orders_update',
    {
      description: 'Update an existing order',
      annotations: WRITE_TOOL_ANNOTATIONS,
      inputSchema: updateOrderWithIdSchema.merge(dryRunSchema).shape,
    },
    async params => {
      try {
        const validated = updateOrderWithIdSchema.merge(dryRunSchema).parse(params);
        const { dryRun, id, ...updateData } = validated;
        if (dryRun) {
          return dryRunResponse('Update Order', { id, ...updateData });
        }

        const order = await client.updateOrder(id, updateData);
        const text = formatOrder(order);

        return {
          content: [
            {
              type: 'text',
              text: `Order updated successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'updating', 'Order');
      }
    }
  );
}
