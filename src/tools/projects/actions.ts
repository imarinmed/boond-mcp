import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BoondAPIClient } from '../../api/client.js';
import { z } from 'zod';
import {
  searchActionsSchema,
  actionIdSchema,
  createActionSchema,
  updateActionWithIdSchema,
} from '../../types/schemas.js';
import type { Action, SearchResponse } from '../../types/boond.js';
import { handleSearchError, handleToolError } from '../../utils/error-handling.js';
import { enrichItemsWithDetails } from '../../utils/enrichment.js';
import { normalizeAction, pickName, pickStatus } from '../../utils/normalization.js';
import { READ_TOOL_ANNOTATIONS, WRITE_TOOL_ANNOTATIONS } from '../../utils/tool-registry.js';
import { dryRunSchema, dryRunResponse } from '../../utils/dry-run.js';

function formatActionList(result: SearchResponse<Action>): string {
  if (result.data.length === 0) {
    return 'No actions found.';
  }

  const actions = result.data.map(action => {
    const normalized = normalizeAction(action)._normalized;
    const lines: string[] = [];
    lines.push(`✓ ${normalized.name ?? `Action #${action.id}`} (ID: ${action.id})`);
    lines.push(`   Status: ${normalized.status ?? 'unknown'}`);
    if (action.projectId) lines.push(`   Project ID: ${action.projectId}`);
    if (action.assignedTo) lines.push(`   Assigned To: ${action.assignedTo}`);
    if (action.priority) lines.push(`   Priority: ${action.priority}`);
    if (action.dueDate) lines.push(`   Due Date: ${action.dueDate}`);
    if (action.description) lines.push(`   Description: ${action.description}`);
    return lines.join('\n');
  });

  const summary = `Found ${result.data.length} action(s) (Page ${result.pagination.page}/${Math.ceil(result.pagination.total / result.pagination.limit)} of ${result.pagination.total} total)`;

  return `${summary}\n\n${actions.join('\n\n')}`;
}

function formatAction(action: Action): string {
  const normalized = normalizeAction(action)._normalized;
  const lines: string[] = [];
  lines.push(`✓ Action: ${normalized.name ?? `Action #${action.id}`}`);
  lines.push(`ID: ${action.id}`);
  lines.push(`Status: ${normalized.status ?? 'unknown'}`);
  if (action.projectId) lines.push(`Project ID: ${action.projectId}`);
  if (action.assignedTo) lines.push(`Assigned To: ${action.assignedTo}`);
  if (action.priority) lines.push(`Priority: ${action.priority}`);
  if (action.dueDate) lines.push(`Due Date: ${action.dueDate}`);
  if (action.description) lines.push(`Description: ${action.description}`);
  if (action.createdAt) lines.push(`Created: ${action.createdAt}`);
  if (action.updatedAt) lines.push(`Updated: ${action.updatedAt}`);

  return lines.join('\n');
}

export function registerActionTools(server: McpServer, client: BoondAPIClient): void {
  server.registerTool(
    'boond_actions_search',
    {
      description: 'Search actions by criteria',
      annotations: READ_TOOL_ANNOTATIONS,
      inputSchema: {
        query: z.string().optional().describe('Search query'),
        page: z.number().int().min(1).default(1).describe('Page number'),
        limit: z.number().int().min(1).max(100).default(20).describe('Results per page'),
        status: z
          .enum(['open', 'in-progress', 'completed', 'cancelled'])
          .optional()
          .describe('Filter by action status'),
        projectId: z.string().optional().describe('Filter by project ID'),
        priority: z.enum(['low', 'medium', 'high']).optional().describe('Filter by priority'),
      },
    },
    async input => {
      try {
        const params = searchActionsSchema.parse(input);
        const result = await client.searchActions(params);
        result.data = await enrichItemsWithDetails(
          result.data,
          action => client.getAction(String(action.id)),
          action => {
            const record = action as unknown as Record<string, unknown>;
            const missingName = pickName(record).length === 0;
            const missingStatus = pickStatus(record) === 'unknown';
            return missingName || missingStatus;
          },
          10
        );
        result.data = result.data.slice(0, params.limit);
        return {
          content: [
            {
              type: 'text',
              text: formatActionList(result),
            },
          ],
        };
      } catch (error) {
        return handleSearchError(error, 'actions');
      }
    }
  );

  server.registerTool(
    'boond_actions_get',
    {
      description: 'Get an action by ID',
      annotations: READ_TOOL_ANNOTATIONS,
      inputSchema: {
        id: z.string().min(1, 'Action ID is required').describe('Action ID'),
      },
    },
    async input => {
      try {
        const params = actionIdSchema.parse(input);
        const action = await client.getAction(params.id);
        return {
          content: [
            {
              type: 'text',
              text: formatAction(action),
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'retrieving', 'Action');
      }
    }
  );

  server.registerTool(
    'boond_actions_create',
    {
      description: 'Create a new action',
      annotations: WRITE_TOOL_ANNOTATIONS,
      inputSchema: z
        .object({
          name: z.string().min(1, 'Action name is required').describe('Action name'),
          projectId: z.string().optional().describe('Project ID'),
          status: z
            .enum(['open', 'in-progress', 'completed', 'cancelled'])
            .optional()
            .default('open')
            .describe('Action status'),
          assignedTo: z.string().optional().describe('User ID to assign action to'),
          dueDate: z.string().optional().describe('Due date (ISO 8601 format)'),
          priority: z.enum(['low', 'medium', 'high']).optional().describe('Action priority'),
          description: z.string().optional().describe('Action description'),
        })
        .merge(dryRunSchema).shape,
    },
    async input => {
      try {
        const validated = createActionSchema.merge(dryRunSchema).parse(input);
        const { dryRun, ...data } = validated;
        if (dryRun) {
          return dryRunResponse('Create Action', data);
        }
        const action = await client.createAction(data);
        return {
          content: [
            {
              type: 'text',
              text: `✓ Action created successfully\n\n${formatAction(action)}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'creating', 'Action');
      }
    }
  );

  server.registerTool(
    'boond_actions_update',
    {
      description: 'Update an existing action',
      annotations: WRITE_TOOL_ANNOTATIONS,
      inputSchema: z
        .object({
          id: z.string().min(1, 'Action ID is required').describe('Action ID'),
          name: z.string().optional().describe('Action name'),
          status: z
            .enum(['open', 'in-progress', 'completed', 'cancelled'])
            .optional()
            .describe('Action status'),
          assignedTo: z.string().optional().describe('User ID to assign action to'),
          dueDate: z.string().optional().describe('Due date (ISO 8601 format)'),
          priority: z.enum(['low', 'medium', 'high']).optional().describe('Action priority'),
          description: z.string().optional().describe('Action description'),
        })
        .merge(dryRunSchema).shape,
    },
    async input => {
      try {
        const validated = updateActionWithIdSchema.merge(dryRunSchema).parse(input);
        const { id, dryRun, ...updateData } = validated;
        if (dryRun) {
          return dryRunResponse('Update Action', { id, ...updateData });
        }
        const action = await client.updateAction(id, updateData);
        return {
          content: [
            {
              type: 'text',
              text: `✓ Action updated successfully\n\n${formatAction(action)}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'updating', 'Action');
      }
    }
  );

  server.registerTool(
    'boond_actions_delete',
    {
      description: 'Delete an action',
      annotations: WRITE_TOOL_ANNOTATIONS,
      inputSchema: actionIdSchema.merge(dryRunSchema).shape,
    },
    async input => {
      try {
        const { id, dryRun } = actionIdSchema.merge(dryRunSchema).parse(input);
        if (dryRun) {
          return dryRunResponse('Delete Action', { id });
        }
        await client.deleteAction(id);
        return {
          content: [
            {
              type: 'text',
              text: `✓ Action with ID ${id} deleted successfully`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'deleting', 'Action');
      }
    }
  );
}
