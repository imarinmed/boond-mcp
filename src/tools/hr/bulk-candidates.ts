import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BoondAPIClient } from '../../api/client.js';
import { z } from 'zod';
import { handleToolError } from '../../utils/error-handling.js';

const bulkCreateCandidateSchema = z.object({
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
});

export function registerBulkCreateCandidateTool(server: McpServer, client: BoondAPIClient): void {
  server.registerTool(
    'boond_candidates_bulk_create',
    {
      description: 'Create multiple candidates in a single operation (max 50)',
      inputSchema: bulkCreateCandidateSchema.shape,
    },
    async params => {
      try {
        const validated = bulkCreateCandidateSchema.parse(params);
        const { candidates } = validated;

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
