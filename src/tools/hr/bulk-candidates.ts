import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BoondAPIClient } from '../../api/client.js';
import { z } from 'zod';
import { handleToolError } from '../../utils/error-handling.js';
import { WRITE_TOOL_ANNOTATIONS } from '../../utils/tool-registry.js';
import { dryRunSchema, dryRunResponse } from '../../utils/dry-run.js';

const bulkCreateCandidateSchema = z
  .object({
    candidates: z
      .array(
        z.object({
          firstName: z.string().min(1, 'First name is required'),
          lastName: z.string().min(1, 'Last name is required'),
          email: z.string().email('Valid email is required'),
          phone: z.string().optional(),
          city: z.string().optional(),
          country: z.string().optional(),
        })
      )
      .min(1, 'At least one candidate is required')
      .max(50, 'Maximum 50 candidates per bulk operation'),
  })
  .extend(dryRunSchema.shape);

const bulkUpdateCandidateSchema = z
  .object({
    updates: z
      .array(
        z.object({
          id: z.string().min(1, 'Candidate ID is required'),
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          city: z.string().optional(),
          country: z.string().optional(),
          status: z.enum(['active', 'inactive', 'archived']).optional(),
        })
      )
      .min(1, 'At least one update is required')
      .max(50, 'Maximum 50 updates per bulk operation'),
  })
  .extend(dryRunSchema.shape);

const bulkDeleteCandidateSchema = z
  .object({
    ids: z
      .array(z.string().min(1, 'Candidate ID is required'))
      .min(1, 'At least one ID is required')
      .max(50, 'Maximum 50 deletions per bulk operation'),
  })
  .extend(dryRunSchema.shape);

export function registerBulkCreateCandidateTool(server: McpServer, client: BoondAPIClient): void {
  server.registerTool(
    'boond_candidates_bulk_create',
    {
      description: 'Create multiple candidates in a single operation (max 50)',
      inputSchema: bulkCreateCandidateSchema.shape,
      annotations: WRITE_TOOL_ANNOTATIONS,
    },
    async params => {
      try {
        const validated = bulkCreateCandidateSchema.parse(params);
        const { dryRun, ...rest } = validated;
        if (dryRun) {
          return dryRunResponse('Bulk Create Candidates', {
            count: rest.candidates.length,
            items: rest.candidates,
          });
        }
        const { candidates } = rest;

        const results: Array<{
          success: boolean;
          data?: { id: string; name: string };
          error?: string;
        }> = [];

        for (const candidateData of candidates) {
          try {
            const candidate = await client.createCandidate(candidateData);
            results.push({
              success: true,
              data: {
                id: candidate.id,
                name: `${candidate.firstName} ${candidate.lastName}`,
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
        lines.push(`📦 Bulk Create Candidates Result`);
        lines.push(`Total: ${candidates.length}`);
        lines.push(`✅ Successful: ${successful}`);
        lines.push(`❌ Failed: ${failed}`);
        lines.push('');

        if (successful > 0) {
          lines.push('Created candidates:');
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
              const candidate = candidates[i];
              lines.push(`  ✗ ${candidate.firstName} ${candidate.lastName}: ${result.error}`);
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
        return handleToolError(error, 'bulk creating', 'Candidates');
      }
    }
  );
}

export function registerBulkUpdateCandidateTool(server: McpServer, client: BoondAPIClient): void {
  server.registerTool(
    'boond_candidates_bulk_update',
    {
      description: 'Update multiple candidates in a single operation (max 50)',
      inputSchema: bulkUpdateCandidateSchema.shape,
      annotations: WRITE_TOOL_ANNOTATIONS,
    },
    async params => {
      try {
        const validated = bulkUpdateCandidateSchema.parse(params);
        const { dryRun, ...rest } = validated;
        if (dryRun) {
          return dryRunResponse('Bulk Update Candidates', {
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
            await client.updateCandidate(id, updateData);
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
        lines.push(`📝 Bulk Update Candidates Result`);
        lines.push(`Total: ${updates.length}`);
        lines.push(`✅ Successful: ${successful}`);
        lines.push(`❌ Failed: ${failed}`);
        lines.push('');

        if (successful > 0) {
          lines.push('Updated candidates:');
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
        return handleToolError(error, 'bulk updating', 'Candidates');
      }
    }
  );
}

export function registerBulkDeleteCandidateTool(server: McpServer, client: BoondAPIClient): void {
  server.registerTool(
    'boond_candidates_bulk_delete',
    {
      description:
        'Delete multiple candidates in a single operation (max 50). Use with caution - this cannot be undone!',
      inputSchema: bulkDeleteCandidateSchema.shape,
      annotations: WRITE_TOOL_ANNOTATIONS,
    },
    async params => {
      try {
        const validated = bulkDeleteCandidateSchema.parse(params);
        const { dryRun, ...rest } = validated;
        if (dryRun) {
          return dryRunResponse('Bulk Delete Candidates', {
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
            await client.deleteCandidate(id);
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
        lines.push(`🗑️ Bulk Delete Candidates Result`);
        lines.push(`⚠️ This operation cannot be undone!`);
        lines.push('');
        lines.push(`Total: ${ids.length}`);
        lines.push(`✅ Deleted: ${successful}`);
        lines.push(`❌ Failed: ${failed}`);
        lines.push('');

        if (successful > 0) {
          lines.push('Deleted candidate IDs:');
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
        return handleToolError(error, 'bulk deleting', 'Candidates');
      }
    }
  );
}
