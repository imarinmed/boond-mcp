import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BoondAPIClient } from '../../api/client.js';
import { searchParamsSchema, flagIdSchema } from '../../types/schemas.js';
import type { Flag, SearchResponse } from '../../types/boond.js';
import { handleSearchError, handleToolError } from '../../utils/error-handling.js';

function formatFlagList(result: SearchResponse<Flag>): string {
  if (result.data.length === 0) {
    return 'No flags found.';
  }

  const flags = result.data.map(flag => {
    const lines: string[] = [];
    lines.push(`🏷️ ${flag.name} (ID: ${flag.id})`);
    if (flag.color) lines.push(`   Color: ${flag.color}`);
    return lines.join('\n');
  });

  const summary = `Found ${result.data.length} flag(s) (Page ${result.pagination.page}/${Math.ceil(result.pagination.total / result.pagination.limit)} of ${result.pagination.total} total)`;

  return `${summary}\n\n${flags.join('\n\n')}`;
}

function formatFlag(flag: Flag): string {
  const lines: string[] = [];
  lines.push(`🏷️ Flag: ${flag.name}`);
  lines.push(`ID: ${flag.id}`);
  if (flag.color) lines.push(`Color: ${flag.color}`);
  if (flag.createdAt) lines.push(`Created: ${flag.createdAt}`);
  if (flag.updatedAt) lines.push(`Updated: ${flag.updatedAt}`);

  return lines.join('\n');
}

export function registerFlagTools(server: McpServer, client: BoondAPIClient): void {
  server.registerTool(
    'boond_flags_search',
    {
      description:
        'Search flags by name or criteria. Flags are used for categorizing and tagging entities across the system.',
      inputSchema: searchParamsSchema.shape,
    },
    async params => {
      try {
        const validated = searchParamsSchema.parse(params);
        const result = await client.searchFlags(validated);
        const text = formatFlagList(result);

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleSearchError(error, 'flags');
      }
    }
  );

  server.registerTool(
    'boond_flags_get',
    {
      description: 'Get a flag by ID',
      inputSchema: flagIdSchema.shape,
    },
    async params => {
      try {
        const validated = flagIdSchema.parse(params);
        const flag = await client.getFlag(validated.id);
        const text = formatFlag(flag);

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleToolError(error, 'retrieving', 'Flag');
      }
    }
  );
}
