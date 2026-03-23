import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BoondAPIClient } from '../../api/client.js';
import { perimeterParamsSchema } from '../../types/schemas.js';
import type { Perimeter } from '../../types/boond.js';
import { handleToolError } from '../../utils/error-handling.js';

function formatPerimeter(perimeter: Perimeter): string {
  const lines: string[] = [];
  lines.push(`🔒 Perimeter: ${perimeter.name}`);
  lines.push(`ID: ${perimeter.id}`);
  if (perimeter.module) lines.push(`Module: ${perimeter.module}`);
  if (perimeter.required !== undefined)
    lines.push(`Required: ${perimeter.required ? 'Yes' : 'No'}`);
  if (perimeter.allManagerTypes !== undefined)
    lines.push(`All Manager Types: ${perimeter.allManagerTypes ? 'Yes' : 'No'}`);
  if (perimeter.allAgencies !== undefined)
    lines.push(`All Agencies: ${perimeter.allAgencies ? 'Yes' : 'No'}`);
  if (perimeter.resourceTypes && perimeter.resourceTypes.length > 0) {
    lines.push(`Resource Types: ${perimeter.resourceTypes.join(', ')}`);
  }
  if (perimeter.createdAt) lines.push(`Created: ${perimeter.createdAt}`);
  if (perimeter.updatedAt) lines.push(`Updated: ${perimeter.updatedAt}`);

  return lines.join('\n');
}

export function registerPerimeterTools(server: McpServer, client: BoondAPIClient): void {
  server.registerTool(
    'boond_perimeters_get',
    {
      description:
        'Get application perimeter configuration. ' +
        'Perimeters define access boundaries and management scopes across modules. ' +
        "Optionally filter by module (e.g., 'resources', 'candidates', 'companies').",
      inputSchema: perimeterParamsSchema.shape,
    },
    async params => {
      try {
        const validated = perimeterParamsSchema.parse(params);
        const perimeter = validated.module
          ? await client.getPerimeters({ module: validated.module })
          : await client.getPerimeters();
        const text = formatPerimeter(perimeter);

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleToolError(error, 'retrieving', 'Perimeter');
      }
    }
  );
}
