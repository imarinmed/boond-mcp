import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { BoondAPIClient } from "../../api/client.js";
import { z } from "zod";
import {
  searchActionsSchema,
  actionIdSchema,
  createActionSchema,
  updateActionWithIdSchema,
} from "../../types/schemas.js";
import type { Action, SearchResponse } from "../../types/boond.js";
import { handleSearchError, handleToolError } from "../../utils/error-handling.js";

function formatActionList(result: SearchResponse<Action>): string {
  if (result.data.length === 0) {
    return "No actions found.";
  }

  const actions = result.data.map((action) => {
    const lines: string[] = [];
    lines.push(`✓ ${action.name} (ID: ${action.id})`);
    lines.push(`   Status: ${action.status}`);
    if (action.projectId) lines.push(`   Project ID: ${action.projectId}`);
    if (action.assignedTo) lines.push(`   Assigned To: ${action.assignedTo}`);
    if (action.priority) lines.push(`   Priority: ${action.priority}`);
    if (action.dueDate) lines.push(`   Due Date: ${action.dueDate}`);
    if (action.description) lines.push(`   Description: ${action.description}`);
    return lines.join("\n");
  });

  const summary = `Found ${result.data.length} action(s) (Page ${result.pagination.page}/${Math.ceil(result.pagination.total / result.pagination.limit)} of ${result.pagination.total} total)`;

  return `${summary}\n\n${actions.join("\n\n")}`;
}

function formatAction(action: Action): string {
  const lines: string[] = [];
  lines.push(`✓ Action: ${action.name}`);
  lines.push(`ID: ${action.id}`);
  lines.push(`Status: ${action.status}`);
  if (action.projectId) lines.push(`Project ID: ${action.projectId}`);
  if (action.assignedTo) lines.push(`Assigned To: ${action.assignedTo}`);
  if (action.priority) lines.push(`Priority: ${action.priority}`);
  if (action.dueDate) lines.push(`Due Date: ${action.dueDate}`);
  if (action.description) lines.push(`Description: ${action.description}`);
  if (action.createdAt) lines.push(`Created: ${action.createdAt}`);
  if (action.updatedAt) lines.push(`Updated: ${action.updatedAt}`);

  return lines.join("\n");
}

export function registerActionTools(
  server: McpServer,
  client: BoondAPIClient
): void {
  server.registerTool(
    "boond_actions_search",
    {
      description: "Search actions by criteria",
      inputSchema: {
        query: z.string().optional().describe("Search query"),
        page: z.number().int().min(1).default(1).describe("Page number"),
        limit: z.number().int().min(1).max(100).default(20).describe("Results per page"),
        status: z
          .enum(["open", "in-progress", "completed", "cancelled"])
          .optional()
          .describe("Filter by action status"),
        projectId: z.string().optional().describe("Filter by project ID"),
        priority: z
          .enum(["low", "medium", "high"])
          .optional()
          .describe("Filter by priority"),
      },
    },
    async (input) => {
      try {
        const params = searchActionsSchema.parse(input);
        const result = await client.searchActions(params);
        return {
          content: [
            {
              type: "text",
              text: formatActionList(result),
            },
          ],
        };
      } catch (error) {
        return handleSearchError(error, "actions");
      }
    }
  );

  server.registerTool(
    "boond_actions_get",
    {
      description: "Get an action by ID",
      inputSchema: {
        id: z.string().min(1, "Action ID is required").describe("Action ID"),
      },
    },
    async (input) => {
      try {
        const params = actionIdSchema.parse(input);
        const action = await client.getAction(params.id);
        return {
          content: [
            {
              type: "text",
              text: formatAction(action),
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, "retrieving", "Action");
      }
    }
  );

  server.registerTool(
    "boond_actions_create",
    {
      description: "Create a new action",
      inputSchema: {
        name: z.string().min(1, "Action name is required").describe("Action name"),
        projectId: z.string().optional().describe("Project ID"),
        status: z
          .enum(["open", "in-progress", "completed", "cancelled"])
          .optional()
          .default("open")
          .describe("Action status"),
        assignedTo: z.string().optional().describe("User ID to assign action to"),
        dueDate: z.string().optional().describe("Due date (ISO 8601 format)"),
        priority: z
          .enum(["low", "medium", "high"])
          .optional()
          .describe("Action priority"),
        description: z.string().optional().describe("Action description"),
      },
    },
    async (input) => {
      try {
        const data = createActionSchema.parse(input);
        const action = await client.createAction(data);
        return {
          content: [
            {
              type: "text",
              text: `✓ Action created successfully\n\n${formatAction(action)}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, "creating", "Action");
      }
    }
  );

  server.registerTool(
    "boond_actions_update",
    {
      description: "Update an existing action",
      inputSchema: {
        id: z.string().min(1, "Action ID is required").describe("Action ID"),
        name: z.string().optional().describe("Action name"),
        status: z
          .enum(["open", "in-progress", "completed", "cancelled"])
          .optional()
          .describe("Action status"),
        assignedTo: z.string().optional().describe("User ID to assign action to"),
        dueDate: z.string().optional().describe("Due date (ISO 8601 format)"),
        priority: z
          .enum(["low", "medium", "high"])
          .optional()
          .describe("Action priority"),
        description: z.string().optional().describe("Action description"),
      },
    },
    async (input) => {
      try {
        const validated = updateActionWithIdSchema.parse(input);
        const { id, ...updateData } = validated;
        const action = await client.updateAction(id, updateData);
        return {
          content: [
            {
              type: "text",
              text: `✓ Action updated successfully\n\n${formatAction(action)}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, "updating", "Action");
      }
    }
  );

  server.registerTool(
    "boond_actions_delete",
    {
      description: "Delete an action",
      inputSchema: {
        id: z.string().min(1, "Action ID is required").describe("Action ID"),
      },
    },
    async (input) => {
      try {
        const params = actionIdSchema.parse(input);
        await client.deleteAction(params.id);
        return {
          content: [
            {
              type: "text",
              text: `✓ Action with ID ${params.id} deleted successfully`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, "deleting", "Action");
      }
    }
  );
}
