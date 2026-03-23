import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BoondAPIClient } from '../../api/client.js';
import { z } from 'zod';
import { handleToolError } from '../../utils/error-handling.js';
import { WRITE_TOOL_ANNOTATIONS } from '../../utils/tool-registry.js';
import { dryRunSchema, dryRunResponse } from '../../utils/dry-run.js';

const bulkCreateResourceSchema = z
  .object({
    resources: z
      .array(
        z.object({
          firstName: z.string().min(1, 'First name is required'),
          lastName: z.string().min(1, 'Last name is required'),
          email: z.string().email('Valid email is required'),
          phone: z.string().optional(),
          status: z.enum(['active', 'inactive', 'archived']).optional(),
          department: z.string().optional(),
          skills: z.array(z.string()).optional(),
          hourlyRate: z.number().positive().optional(),
        })
      )
      .min(1, 'At least one resource is required')
      .max(50, 'Maximum 50 resources per bulk operation'),
  })
  .extend(dryRunSchema.shape);

const bulkUpdateResourceSchema = z
  .object({
    updates: z
      .array(
        z.object({
          id: z.string().min(1, 'Resource ID is required'),
          firstName: z.string().min(1).optional(),
          lastName: z.string().min(1).optional(),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          status: z.enum(['active', 'inactive', 'archived']).optional(),
          department: z.string().optional(),
          skills: z.array(z.string()).optional(),
          hourlyRate: z.number().positive().optional(),
        })
      )
      .min(1, 'At least one update is required')
      .max(50, 'Maximum 50 updates per bulk operation'),
  })
  .extend(dryRunSchema.shape);

const bulkDeleteResourceSchema = z
  .object({
    ids: z
      .array(z.string().min(1, 'Resource ID is required'))
      .min(1, 'At least one ID is required')
      .max(50, 'Maximum 50 deletions per bulk operation'),
  })
  .extend(dryRunSchema.shape);

export function registerBulkCreateResourceTool(server: McpServer, client: BoondAPIClient): void {
  server.registerTool(
    'boond_resources_bulk_create',
    {
      description: 'Create multiple resources in a single operation (max 50)',
      inputSchema: bulkCreateResourceSchema.shape,
      annotations: WRITE_TOOL_ANNOTATIONS,
    },
    async params => {
      try {
        const validated = bulkCreateResourceSchema.parse(params);
        const { dryRun, ...rest } = validated;
        if (dryRun) {
          return dryRunResponse('Bulk Create Resources', {
            count: rest.resources.length,
            items: rest.resources,
          });
        }
        const { resources } = rest;

        const results: Array<{
          success: boolean;
          data?: { id: string; name: string };
          error?: string;
        }> = [];

        for (const resourceData of resources) {
          try {
            const resource = await client.createResource(resourceData);
            results.push({
              success: true,
              data: {
                id: resource.id,
                name: `${resource.firstName} ${resource.lastName}`,
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
        lines.push(`📦 Bulk Create Resources Result`);
        lines.push(`Total: ${resources.length}`);
        lines.push(`✅ Successful: ${successful}`);
        lines.push(`❌ Failed: ${failed}`);
        lines.push('');

        if (successful > 0) {
          lines.push('Created resources:');
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
              const resource = resources[i];
              lines.push(`  ✗ ${resource.firstName} ${resource.lastName}: ${result.error}`);
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
        return handleToolError(error, 'bulk creating', 'Resources');
      }
    }
  );
}

export function registerBulkUpdateResourceTool(server: McpServer, client: BoondAPIClient): void {
  server.registerTool(
    'boond_resources_bulk_update',
    {
      description: 'Update multiple resources in a single operation (max 50)',
      inputSchema: bulkUpdateResourceSchema.shape,
      annotations: WRITE_TOOL_ANNOTATIONS,
    },
    async params => {
      try {
        const validated = bulkUpdateResourceSchema.parse(params);
        const { dryRun, ...rest } = validated;
        if (dryRun) {
          return dryRunResponse('Bulk Update Resources', {
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
            await client.updateResource(id, updateData);
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
        lines.push(`📝 Bulk Update Resources Result`);
        lines.push(`Total: ${updates.length}`);
        lines.push(`✅ Successful: ${successful}`);
        lines.push(`❌ Failed: ${failed}`);
        lines.push('');

        if (successful > 0) {
          lines.push('Updated resources:');
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
        return handleToolError(error, 'bulk updating', 'Resources');
      }
    }
  );
}

export function registerBulkDeleteResourceTool(server: McpServer, client: BoondAPIClient): void {
  server.registerTool(
    'boond_resources_bulk_delete',
    {
      description:
        'Delete multiple resources in a single operation (max 50). Use with caution - this cannot be undone!',
      inputSchema: bulkDeleteResourceSchema.shape,
      annotations: WRITE_TOOL_ANNOTATIONS,
    },
    async params => {
      try {
        const validated = bulkDeleteResourceSchema.parse(params);
        const { dryRun, ...rest } = validated;
        if (dryRun) {
          return dryRunResponse('Bulk Delete Resources', {
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
            await client.deleteResource(id);
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
        lines.push(`🗑️ Bulk Delete Resources Result`);
        lines.push(`⚠️ This operation cannot be undone!`);
        lines.push('');
        lines.push(`Total: ${ids.length}`);
        lines.push(`✅ Deleted: ${successful}`);
        lines.push(`❌ Failed: ${failed}`);
        lines.push('');

        if (successful > 0) {
          lines.push('Deleted resource IDs:');
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
        return handleToolError(error, 'bulk deleting', 'Resources');
      }
    }
  );
}
