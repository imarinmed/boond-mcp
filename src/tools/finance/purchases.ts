/**
 * Purchase tools registration
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BoondAPIClient } from '../../api/client.js';
import {
  searchParamsSchema,
  createPurchaseSchema,
  purchaseIdSchema,
  updatePurchaseWithIdSchema,
} from '../../types/schemas.js';
import type { Purchase, SearchResponse } from '../../types/boond.js';
import { handleSearchError, handleToolError } from '../../utils/error-handling.js';

/**
 * Format purchase list for display
 */
function formatPurchaseList(result: SearchResponse<Purchase>): string {
  if (result.data.length === 0) {
    return 'No purchases found.';
  }

  const purchases = result.data.map(purchase => {
    const lines: string[] = [];
    lines.push(`📦 Purchase #${purchase.id} (Status: ${purchase.status})`);
    lines.push(`   Company: ${purchase.companyId}`);
    lines.push(`   Total: ${purchase.total}`);
    if (purchase.orderedAt) lines.push(`   Ordered: ${purchase.orderedAt}`);
    if (purchase.receivedAt) lines.push(`   Received: ${purchase.receivedAt}`);
    return lines.join('\n');
  });

  const summary = `Found ${result.data.length} purchase(s) (Page ${result.pagination.page}/${Math.ceil(result.pagination.total / result.pagination.limit)} of ${result.pagination.total} total)`;

  return `${summary}\n\n${purchases.join('\n\n')}`;
}

/**
 * Format single purchase details
 */
function formatPurchase(purchase: Purchase): string {
  const lines: string[] = [];
  lines.push(`📦 Purchase: ${purchase.id}`);
  lines.push(`Status: ${purchase.status}`);
  lines.push(`Company: ${purchase.companyId}`);
  lines.push(`Total: ${purchase.total}`);
  if (purchase.orderedAt) lines.push(`Ordered: ${purchase.orderedAt}`);
  if (purchase.receivedAt) lines.push(`Received: ${purchase.receivedAt}`);
  if (purchase.items && purchase.items.length > 0) {
    lines.push(`Items:`);
    purchase.items.forEach(
      (item: { description: string; quantity: number; unitPrice: number; total: number }) => {
        lines.push(`  - ${item.description}: ${item.quantity} x ${item.unitPrice} = ${item.total}`);
      }
    );
  }
  if (purchase.createdAt) lines.push(`Created: ${purchase.createdAt}`);
  if (purchase.updatedAt) lines.push(`Updated: ${purchase.updatedAt}`);

  return lines.join('\n');
}

export function registerPurchaseTools(server: McpServer, client: BoondAPIClient): void {
  /**
   * boond_purchases_search - Search purchases
   */
  server.registerTool(
    'boond_purchases_search',
    {
      description: 'Search purchases by criteria',
      inputSchema: searchParamsSchema.shape,
    },
    async params => {
      try {
        const validated = searchParamsSchema.parse(params);
        const result = await client.searchPurchases(validated);
        const text = formatPurchaseList(result);

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleSearchError(error, 'purchases');
      }
    }
  );

  /**
   * boond_purchases_get - Get purchase by ID
   */
  server.registerTool(
    'boond_purchases_get',
    {
      description: 'Get a purchase by ID',
      inputSchema: purchaseIdSchema.shape,
    },
    async params => {
      try {
        const validated = purchaseIdSchema.parse(params);
        const purchase = await client.getPurchase(validated.id);
        const text = formatPurchase(purchase);

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleToolError(error, 'retrieving', 'Purchase');
      }
    }
  );

  /**
   * boond_purchases_create - Create new purchase
   */
  server.registerTool(
    'boond_purchases_create',
    {
      description: 'Create a new purchase',
      inputSchema: createPurchaseSchema.shape,
    },
    async params => {
      try {
        const validated = createPurchaseSchema.parse(params);
        const purchase = await client.createPurchase(validated);
        const text = formatPurchase(purchase);

        return {
          content: [
            {
              type: 'text',
              text: `Purchase created successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'creating', 'Purchase');
      }
    }
  );

  /**
   * boond_purchases_update - Update existing purchase
   */
  server.registerTool(
    'boond_purchases_update',
    {
      description: 'Update an existing purchase',
      inputSchema: updatePurchaseWithIdSchema.shape,
    },
    async params => {
      try {
        const validated = updatePurchaseWithIdSchema.parse(params);
        const { id, ...updateData } = validated;
        const purchase = await client.updatePurchase(id, updateData);
        const text = formatPurchase(purchase);

        return {
          content: [
            {
              type: 'text',
              text: `Purchase updated successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'updating', 'Purchase');
      }
    }
  );

  server.registerTool(
    'boond_purchases_delete',
    {
      description: 'Delete a purchase by ID',
      inputSchema: purchaseIdSchema.shape,
    },
    async params => {
      try {
        const validated = purchaseIdSchema.parse(params);
        await client.deletePurchase(validated.id);
        return {
          content: [
            {
              type: 'text',
              text: `Purchase ${validated.id} deleted successfully.`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'deleting', 'Purchase');
      }
    }
  );
}
