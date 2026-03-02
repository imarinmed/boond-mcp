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

function pickOrderStatus(order: Order): string {
  const record = order as unknown as Record<string, unknown>;
  const candidates = [
    order.status,
    record['state'],
    record['workflowStatus'],
    record['validationStatus'],
  ];
  for (const value of candidates) {
    if (typeof value === 'string' && value.trim().length > 0) return value;
    if (typeof value === 'number') return String(value);
  }
  return 'unknown';
}

function pickOrderCompany(order: Order): string {
  const record = order as unknown as Record<string, unknown>;
  const candidates = [
    order.companyId,
    record['companyId'],
    record['clientId'],
    record['accountId'],
  ];
  for (const value of candidates) {
    if (typeof value === 'string' && value.trim().length > 0) return value;
    if (typeof value === 'number') return String(value);
  }
  return 'unknown';
}

function pickOrderTotal(order: Order): string {
  const record = order as unknown as Record<string, unknown>;
  const candidates = [order.total, record['amount'], record['totalAmount'], record['sum']];
  for (const value of candidates) {
    if (typeof value === 'number') return String(value);
    if (typeof value === 'string' && value.trim().length > 0) return value;
  }
  return 'unknown';
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
    lines.push(`📦 Order #${order.id} (Status: ${pickOrderStatus(order)})`);
    lines.push(`   Company: ${pickOrderCompany(order)}`);
    if (order.projectId) lines.push(`   Project: ${order.projectId}`);
    lines.push(`   Total: ${pickOrderTotal(order)}`);
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
  lines.push(`📦 Order: ${order.id}`);
  lines.push(`Status: ${pickOrderStatus(order)}`);
  lines.push(`Company: ${pickOrderCompany(order)}`);
  if (order.projectId) lines.push(`Project: ${order.projectId}`);
  lines.push(`Total: ${pickOrderTotal(order)}`);
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
      inputSchema: searchParamsSchema.shape,
    },
    async params => {
      try {
        const validated = searchParamsSchema.parse(params);
        const result = await client.searchOrders(validated);
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
      inputSchema: createOrderSchema.shape,
    },
    async params => {
      try {
        const validated = createOrderSchema.parse(params);
        const order = await client.createOrder(validated);
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
      inputSchema: updateOrderWithIdSchema.shape,
    },
    async params => {
      try {
        const validated = updateOrderWithIdSchema.parse(params);
        const { id, ...updateData } = validated;
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
