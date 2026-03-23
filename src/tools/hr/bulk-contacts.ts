import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BoondAPIClient } from '../../api/client.js';
import { z } from 'zod';
import { handleToolError } from '../../utils/error-handling.js';
import { WRITE_TOOL_ANNOTATIONS } from '../../utils/tool-registry.js';
import { dryRunSchema, dryRunResponse } from '../../utils/dry-run.js';

const bulkCreateContactSchema = z
  .object({
    contacts: z
      .array(
        z.object({
          firstName: z.string().min(1, 'First name is required'),
          lastName: z.string().min(1, 'Last name is required'),
          email: z.string().email('Valid email is required'),
          phone: z.string().optional(),
          companyId: z.string().min(1, 'Company ID is required'),
          jobTitle: z.string().optional(),
          department: z.string().optional(),
        })
      )
      .min(1, 'At least one contact is required')
      .max(50, 'Maximum 50 contacts per bulk operation'),
  })
  .extend(dryRunSchema.shape);

const bulkUpdateContactSchema = z
  .object({
    updates: z
      .array(
        z.object({
          id: z.string().min(1, 'Contact ID is required'),
          firstName: z.string().min(1).optional(),
          lastName: z.string().min(1).optional(),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          companyId: z.string().optional(),
          jobTitle: z.string().optional(),
          department: z.string().optional(),
        })
      )
      .min(1, 'At least one update is required')
      .max(50, 'Maximum 50 updates per bulk operation'),
  })
  .extend(dryRunSchema.shape);

const bulkDeleteContactSchema = z
  .object({
    ids: z
      .array(z.string().min(1, 'Contact ID is required'))
      .min(1, 'At least one ID is required')
      .max(50, 'Maximum 50 deletions per bulk operation'),
  })
  .extend(dryRunSchema.shape);

export function registerBulkCreateContactTool(server: McpServer, client: BoondAPIClient): void {
  server.registerTool(
    'boond_contacts_bulk_create',
    {
      description: 'Create multiple contacts in a single operation (max 50)',
      inputSchema: bulkCreateContactSchema.shape,
      annotations: WRITE_TOOL_ANNOTATIONS,
    },
    async params => {
      try {
        const validated = bulkCreateContactSchema.parse(params);
        const { dryRun, ...rest } = validated;
        if (dryRun) {
          return dryRunResponse('Bulk Create Contacts', {
            count: rest.contacts.length,
            items: rest.contacts,
          });
        }
        const { contacts } = rest;

        const results: Array<{
          success: boolean;
          data?: { id: string; name: string };
          error?: string;
        }> = [];

        for (const contactData of contacts) {
          try {
            const contact = await client.createContact(contactData);
            results.push({
              success: true,
              data: {
                id: contact.id,
                name: `${contact.firstName} ${contact.lastName}`,
              },
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            results.push({
              success: false,
              error: errorMessage,
            });
          }
        }

        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        const lines: string[] = [];
        lines.push(`📦 Bulk Create Contacts Result`);
        lines.push(`Total: ${contacts.length}`);
        lines.push(`✅ Successful: ${successful}`);
        lines.push(`❌ Failed: ${failed}`);
        lines.push('');

        if (successful > 0) {
          lines.push('Created contacts:');
          for (const result of results) {
            if (result.success && result.data) {
              lines.push(`  ✓ ${result.data.name} (ID: ${result.data.id})`);
            }
          }
        }

        if (failed > 0) {
          lines.push('');
          lines.push('Failures:');
          for (let i = 0; i < results.length; i++) {
            const result = results[i];
            if (!result.success) {
              const contact = contacts[i];
              lines.push(`  ✗ ${contact.firstName} ${contact.lastName}: ${result.error}`);
            }
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: lines.join('\n'),
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'bulk creating', 'Contacts');
      }
    }
  );
}

export function registerBulkUpdateContactTool(server: McpServer, client: BoondAPIClient): void {
  server.registerTool(
    'boond_contacts_bulk_update',
    {
      description: 'Update multiple contacts in a single operation (max 50)',
      inputSchema: bulkUpdateContactSchema.shape,
      annotations: WRITE_TOOL_ANNOTATIONS,
    },
    async params => {
      try {
        const validated = bulkUpdateContactSchema.parse(params);
        const { dryRun, ...rest } = validated;
        if (dryRun) {
          return dryRunResponse('Bulk Update Contacts', {
            count: rest.updates.length,
            updates: rest.updates,
          });
        }
        const { updates } = rest;

        const results: Array<{
          success: boolean;
          id: string;
          error?: string;
        }> = [];

        for (const update of updates) {
          try {
            const { id, ...updateData } = update;
            await client.updateContact(id, updateData);
            results.push({
              success: true,
              id,
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            results.push({
              success: false,
              id: update.id,
              error: errorMessage,
            });
          }
        }

        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        const lines: string[] = [];
        lines.push(`📝 Bulk Update Contacts Result`);
        lines.push(`Total: ${updates.length}`);
        lines.push(`✅ Successful: ${successful}`);
        lines.push(`❌ Failed: ${failed}`);
        lines.push('');

        if (successful > 0) {
          lines.push('Updated contacts:');
          for (const result of results) {
            if (result.success) {
              lines.push(`  ✓ ID: ${result.id}`);
            }
          }
        }

        if (failed > 0) {
          lines.push('');
          lines.push('Failures:');
          for (const result of results) {
            if (!result.success) {
              lines.push(`  ✗ ID: ${result.id} - ${result.error}`);
            }
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: lines.join('\n'),
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'bulk updating', 'Contacts');
      }
    }
  );
}

export function registerBulkDeleteContactTool(server: McpServer, client: BoondAPIClient): void {
  server.registerTool(
    'boond_contacts_bulk_delete',
    {
      description:
        'Delete multiple contacts in a single operation (max 50). Use with caution - this cannot be undone!',
      inputSchema: bulkDeleteContactSchema.shape,
      annotations: WRITE_TOOL_ANNOTATIONS,
    },
    async params => {
      try {
        const validated = bulkDeleteContactSchema.parse(params);
        const { dryRun, ...rest } = validated;
        if (dryRun) {
          return dryRunResponse('Bulk Delete Contacts', {
            count: rest.ids.length,
            ids: rest.ids,
          });
        }
        const { ids } = rest;

        const results: Array<{
          success: boolean;
          id: string;
          error?: string;
        }> = [];

        for (const id of ids) {
          try {
            await client.deleteContact(id);
            results.push({
              success: true,
              id,
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            results.push({
              success: false,
              id,
              error: errorMessage,
            });
          }
        }

        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        const lines: string[] = [];
        lines.push(`🗑️ Bulk Delete Contacts Result`);
        lines.push(`⚠️ This operation cannot be undone!`);
        lines.push('');
        lines.push(`Total: ${ids.length}`);
        lines.push(`✅ Deleted: ${successful}`);
        lines.push(`❌ Failed: ${failed}`);
        lines.push('');

        if (successful > 0) {
          lines.push('Deleted contact IDs:');
          for (const result of results) {
            if (result.success) {
              lines.push(`  ✓ ${result.id}`);
            }
          }
        }

        if (failed > 0) {
          lines.push('');
          lines.push('Failed deletions:');
          for (const result of results) {
            if (!result.success) {
              lines.push(`  ✗ ID: ${result.id} - ${result.error}`);
            }
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: lines.join('\n'),
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'bulk deleting', 'Contacts');
      }
    }
  );
}
