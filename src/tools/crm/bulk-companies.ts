import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BoondAPIClient } from '../../api/client.js';
import { z } from 'zod';
import { handleToolError } from '../../utils/error-handling.js';
import { WRITE_TOOL_ANNOTATIONS } from '../../utils/tool-registry.js';
import { dryRunSchema, dryRunResponse } from '../../utils/dry-run.js';

const bulkCreateCompanySchema = z.object({
  ...dryRunSchema.shape,
  companies: z
    .array(
      z.object({
        name: z.string().min(1, 'Company name is required'),
        type: z.enum(['client', 'supplier', 'partner']).optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
      })
    )
    .min(1, 'At least one company is required')
    .max(50, 'Maximum 50 companies per bulk operation'),
});

const bulkUpdateCompanySchema = z.object({
  ...dryRunSchema.shape,
  updates: z
    .array(
      z.object({
        id: z.string().min(1, 'Company ID is required'),
        name: z.string().min(1).optional(),
        type: z.enum(['client', 'supplier', 'partner']).optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
      })
    )
    .min(1, 'At least one update is required')
    .max(50, 'Maximum 50 updates per bulk operation'),
});

const bulkDeleteCompanySchema = z.object({
  ...dryRunSchema.shape,
  ids: z
    .array(z.string().min(1, 'Company ID is required'))
    .min(1, 'At least one ID is required')
    .max(50, 'Maximum 50 deletions per bulk operation'),
});

export function registerBulkCreateCompanyTool(server: McpServer, client: BoondAPIClient): void {
  server.registerTool(
    'boond_companies_bulk_create',
    {
      description: 'Create multiple companies in a single operation (max 50)',
      inputSchema: bulkCreateCompanySchema.shape,
      annotations: WRITE_TOOL_ANNOTATIONS,
    },
    async params => {
      try {
        const validated = bulkCreateCompanySchema.parse(params);
        const { dryRun, companies } = validated;

        if (dryRun) {
          return dryRunResponse('Bulk Create Companies', {
            count: companies.length,
            items: companies,
          });
        }

        const results: Array<{
          success: boolean;
          data?: { id: string; name: string };
          error?: string;
        }> = [];

        for (const companyData of companies) {
          try {
            const company = await client.createCompany(companyData);
            results.push({
              success: true,
              data: {
                id: company.id,
                name: company.name,
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
        lines.push(`📦 Bulk Create Companies Result`);
        lines.push(`Total: ${companies.length}`);
        lines.push(`✅ Successful: ${successful}`);
        lines.push(`❌ Failed: ${failed}`);
        lines.push('');

        if (successful > 0) {
          lines.push('Created companies:');
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
              const company = companies[i];
              lines.push(`  ✗ ${company.name}: ${result.error}`);
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
        return handleToolError(error, 'bulk creating', 'Companies');
      }
    }
  );
}

export function registerBulkUpdateCompanyTool(server: McpServer, client: BoondAPIClient): void {
  server.registerTool(
    'boond_companies_bulk_update',
    {
      description: 'Update multiple companies in a single operation (max 50)',
      inputSchema: bulkUpdateCompanySchema.shape,
      annotations: WRITE_TOOL_ANNOTATIONS,
    },
    async params => {
      try {
        const validated = bulkUpdateCompanySchema.parse(params);
        const { dryRun, updates } = validated;

        if (dryRun) {
          return dryRunResponse('Bulk Update Companies', {
            count: updates.length,
            items: updates,
          });
        }

        const results: Array<{
          success: boolean;
          id: string;
          error?: string;
        }> = [];

        for (const update of updates) {
          try {
            const { id, ...updateData } = update;
            await client.updateCompany(id, updateData);
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
        lines.push(`📝 Bulk Update Companies Result`);
        lines.push(`Total: ${updates.length}`);
        lines.push(`✅ Successful: ${successful}`);
        lines.push(`❌ Failed: ${failed}`);
        lines.push('');

        if (successful > 0) {
          lines.push('Updated companies:');
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
        return handleToolError(error, 'bulk updating', 'Companies');
      }
    }
  );
}

export function registerBulkDeleteCompanyTool(server: McpServer, client: BoondAPIClient): void {
  server.registerTool(
    'boond_companies_bulk_delete',
    {
      description:
        'Delete multiple companies in a single operation (max 50). Use with caution - this cannot be undone!',
      inputSchema: bulkDeleteCompanySchema.shape,
      annotations: WRITE_TOOL_ANNOTATIONS,
    },
    async params => {
      try {
        const validated = bulkDeleteCompanySchema.parse(params);
        const { dryRun, ids } = validated;

        if (dryRun) {
          return dryRunResponse('Bulk Delete Companies', {
            count: ids.length,
            ids,
          });
        }

        const results: Array<{
          success: boolean;
          id: string;
          error?: string;
        }> = [];

        for (const id of ids) {
          try {
            await client.deleteCompany(id);
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
        lines.push(`🗑️ Bulk Delete Companies Result`);
        lines.push(`⚠️ This operation cannot be undone!`);
        lines.push('');
        lines.push(`Total: ${ids.length}`);
        lines.push(`✅ Deleted: ${successful}`);
        lines.push(`❌ Failed: ${failed}`);
        lines.push('');

        if (successful > 0) {
          lines.push('Deleted company IDs:');
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
        return handleToolError(error, 'bulk deleting', 'Companies');
      }
    }
  );
}
