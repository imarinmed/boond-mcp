/**
 * Resource tools registration
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BoondAPIClient } from '../../api/client.js';
import {
  searchParamsSchema,
  createResourceSchema,
  resourceIdSchema,
  updateResourceWithIdSchema,
} from '../../types/schemas.js';
import type { Resource, SearchResponse } from '../../types/boond.js';
import { handleSearchError, handleToolError } from '../../utils/error-handling.js';
import { ValidationError } from '../../api/client.js';

/**
 * Format resource list for display
 */
function formatResourceList(result: SearchResponse<Resource>): string {
  if (result.data.length === 0) {
    return 'No resources found.';
  }

  const resources = result.data.map(resource => {
    const lines: string[] = [];
    lines.push(`👤 ${resource.firstName} ${resource.lastName} (ID: ${resource.id})`);
    lines.push(`   Email: ${resource.email}`);
    if (resource.phone) lines.push(`   Phone: ${resource.phone}`);
    lines.push(`   Status: ${resource.status}`);
    if (resource.department) lines.push(`   Department: ${resource.department}`);
    if (resource.skills && resource.skills.length > 0)
      lines.push(`   Skills: ${resource.skills.join(', ')}`);
    if (resource.hourlyRate) lines.push(`   Hourly Rate: $${resource.hourlyRate}`);
    return lines.join('\n');
  });

  const summary = `Found ${result.data.length} resource(s) (Page ${result.pagination.page}/${Math.ceil(result.pagination.total / result.pagination.limit)} of ${result.pagination.total} total)`;

  return `${summary}\n\n${resources.join('\n\n')}`;
}

/**
 * Format single resource details
 */
function formatResource(resource: Resource): string {
  const lines: string[] = [];
  lines.push(`👤 Resource: ${resource.firstName} ${resource.lastName}`);
  lines.push(`ID: ${resource.id}`);
  lines.push(`Email: ${resource.email}`);
  if (resource.phone) lines.push(`Phone: ${resource.phone}`);
  lines.push(`Status: ${resource.status}`);
  if (resource.department) lines.push(`Department: ${resource.department}`);
  if (resource.skills && resource.skills.length > 0)
    lines.push(`Skills: ${resource.skills.join(', ')}`);
  if (resource.hourlyRate) lines.push(`Hourly Rate: $${resource.hourlyRate}`);
  if (resource.createdAt) lines.push(`Created: ${resource.createdAt}`);
  if (resource.updatedAt) lines.push(`Updated: ${resource.updatedAt}`);

  return lines.join('\n');
}

export function registerResourceTools(server: McpServer, client: BoondAPIClient): void {
  /**
   * boond_resources_search - Search resources
   */
  server.registerTool(
    'boond_resources_search',
    {
      description: 'Search resources by name, email, or other criteria',
      inputSchema: searchParamsSchema.shape,
    },
    async params => {
      try {
        const validated = searchParamsSchema.parse(params);
        const result = await client.searchResources(validated);
        const text = formatResourceList(result);

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleSearchError(error, 'resources');
      }
    }
  );

  /**
   * boond_resources_get - Get resource by ID
   */
  server.registerTool(
    'boond_resources_get',
    {
      description: 'Get a resource by ID',
      inputSchema: resourceIdSchema.shape,
    },
    async params => {
      try {
        const validated = resourceIdSchema.parse(params);
        const resource = await client.getResource(validated.id);
        const text = formatResource(resource);

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleToolError(error, 'retrieving', 'Resource');
      }
    }
  );

  /**
   * boond_resources_create - Create new resource
   */
  server.registerTool(
    'boond_resources_create',
    {
      description: 'Create a new resource',
      inputSchema: createResourceSchema.shape,
    },
    async params => {
      try {
        const validated = createResourceSchema.parse(params);
        const resource = await client.createResource(validated);
        const text = formatResource(resource);

        return {
          content: [
            {
              type: 'text',
              text: `Resource created successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'creating', 'Resource');
      }
    }
  );

  /**
   * boond_resources_update - Update existing resource
   */
  server.registerTool(
    'boond_resources_update',
    {
      description: 'Update an existing resource',
      inputSchema: updateResourceWithIdSchema.shape,
    },
    async params => {
      try {
        const validated = updateResourceWithIdSchema.parse(params);
        const { id, ...updateData } = validated;

        if (!id) {
          throw new ValidationError('Resource ID is required');
        }

        const resource = await client.updateResource(id, updateData);
        const text = formatResource(resource);

        return {
          content: [
            {
              type: 'text',
              text: `Resource updated successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'updating', 'Resource');
      }
    }
  );

  server.registerTool(
    'boond_resources_delete',
    {
      description: 'Delete a resource by ID',
      inputSchema: resourceIdSchema.shape,
    },
    async params => {
      try {
        const validated = resourceIdSchema.parse(params);
        await client.deleteResource(validated.id);
        return {
          content: [
            {
              type: 'text',
              text: `Resource ${validated.id} deleted successfully.`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'deleting', 'Resource');
      }
    }
  );
}
