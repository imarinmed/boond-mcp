/**
 * Invoice tools registration
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BoondAPIClient } from '../../api/client.js';
import {
  searchParamsSchema,
  createInvoiceSchema,
  invoiceIdSchema,
  updateInvoiceWithIdSchema,
} from '../../types/schemas.js';
import type { Invoice, SearchResponse } from '../../types/boond.js';
import { handleSearchError, handleToolError } from '../../utils/error-handling.js';

/**
 * Format invoice list for display
 */
function formatInvoiceList(result: SearchResponse<Invoice>): string {
  if (result.data.length === 0) {
    return 'No invoices found.';
  }

  const invoices = result.data.map(invoice => {
    const lines: string[] = [];
    lines.push(`💰 Invoice #${invoice.id} (Status: ${invoice.status})`);
    lines.push(`   Company: ${invoice.companyId}`);
    lines.push(`   Total: ${invoice.total}`);
    if (invoice.issuedAt) lines.push(`   Issued: ${invoice.issuedAt}`);
    if (invoice.dueDate) lines.push(`   Due Date: ${invoice.dueDate}`);
    if (invoice.paidAt) lines.push(`   Paid: ${invoice.paidAt}`);
    if (invoice.description) lines.push(`   Description: ${invoice.description}`);
    return lines.join('\n');
  });

  const summary = `Found ${result.data.length} invoice(s) (Page ${result.pagination.page}/${Math.ceil(result.pagination.total / result.pagination.limit)} of ${result.pagination.total} total)`;

  return `${summary}\n\n${invoices.join('\n\n')}`;
}

/**
 * Format single invoice details
 */
function formatInvoice(invoice: Invoice): string {
  const lines: string[] = [];
  lines.push(`💰 Invoice: ${invoice.id}`);
  lines.push(`Status: ${invoice.status}`);
  lines.push(`Company: ${invoice.companyId}`);
  lines.push(`Total: ${invoice.total}`);
  if (invoice.issuedAt) lines.push(`Issued: ${invoice.issuedAt}`);
  if (invoice.dueDate) lines.push(`Due Date: ${invoice.dueDate}`);
  if (invoice.paidAt) lines.push(`Paid: ${invoice.paidAt}`);
  if (invoice.description) lines.push(`Description: ${invoice.description}`);
  if (invoice.items && invoice.items.length > 0) {
    lines.push(`Items:`);
    invoice.items.forEach(
      (item: { description: string; quantity: number; unitPrice: number; total: number }) => {
        lines.push(`  - ${item.description}: ${item.quantity} x ${item.unitPrice} = ${item.total}`);
      }
    );
  }
  if (invoice.createdAt) lines.push(`Created: ${invoice.createdAt}`);
  if (invoice.updatedAt) lines.push(`Updated: ${invoice.updatedAt}`);

  return lines.join('\n');
}

export function registerInvoiceTools(server: McpServer, client: BoondAPIClient): void {
  /**
   * boond_invoices_search - Search invoices
   */
  server.registerTool(
    'boond_invoices_search',
    {
      description: 'Search invoices by criteria',
      inputSchema: searchParamsSchema.shape,
    },
    async params => {
      try {
        const validated = searchParamsSchema.parse(params);
        const result = await client.searchInvoices(validated);
        const text = formatInvoiceList(result);

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleSearchError(error, 'invoices');
      }
    }
  );

  /**
   * boond_invoices_get - Get invoice by ID
   */
  server.registerTool(
    'boond_invoices_get',
    {
      description: 'Get an invoice by ID',
      inputSchema: invoiceIdSchema.shape,
    },
    async params => {
      try {
        const validated = invoiceIdSchema.parse(params);
        const invoice = await client.getInvoice(validated.id);
        const text = formatInvoice(invoice);

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleToolError(error, 'retrieving', 'Invoice');
      }
    }
  );

  /**
   * boond_invoices_create - Create new invoice
   */
  server.registerTool(
    'boond_invoices_create',
    {
      description: 'Create a new invoice',
      inputSchema: createInvoiceSchema.shape,
    },
    async params => {
      try {
        const validated = createInvoiceSchema.parse(params);
        const invoice = await client.createInvoice(validated);
        const text = formatInvoice(invoice);

        return {
          content: [
            {
              type: 'text',
              text: `Invoice created successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'creating', 'Invoice');
      }
    }
  );

  /**
   * boond_invoices_update - Update existing invoice
   */
  server.registerTool(
    'boond_invoices_update',
    {
      description: 'Update an existing invoice',
      inputSchema: updateInvoiceWithIdSchema.shape,
    },
    async params => {
      try {
        const validated = updateInvoiceWithIdSchema.parse(params);
        const { id, ...updateData } = validated;
        const invoice = await client.updateInvoice(id, updateData);
        const text = formatInvoice(invoice);

        return {
          content: [
            {
              type: 'text',
              text: `Invoice updated successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'updating', 'Invoice');
      }
    }
  );

  server.registerTool(
    'boond_invoices_delete',
    {
      description: 'Delete an invoice by ID',
      inputSchema: invoiceIdSchema.shape,
    },
    async params => {
      try {
        const validated = invoiceIdSchema.parse(params);
        await client.deleteInvoice(validated.id);
        return {
          content: [
            {
              type: 'text',
              text: `Invoice ${validated.id} deleted successfully.`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'deleting', 'Invoice');
      }
    }
  );
}
