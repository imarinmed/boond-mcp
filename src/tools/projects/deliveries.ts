import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { BoondAPIClient } from "../../api/client.js";
import { z } from "zod";
import {
  searchDeliveriesSchema,
  deliveryIdSchema,
  createDeliverySchema,
  updateDeliveryWithIdSchema,
} from "../../types/schemas.js";
import type { Delivery, SearchResponse } from "../../types/boond.js";
import { handleSearchError, handleToolError } from "../../utils/error-handling.js";

function formatDeliveryList(result: SearchResponse<Delivery>): string {
  if (result.data.length === 0) {
    return "No deliveries found.";
  }

  const deliveries = result.data.map((delivery) => {
    const lines: string[] = [];
    lines.push(`📦 ${delivery.name} (ID: ${delivery.id})`);
    lines.push(`   Status: ${delivery.status}`);
    lines.push(`   Project ID: ${delivery.projectId}`);
    if (delivery.description) lines.push(`   Description: ${delivery.description}`);
    if (delivery.dueDate) lines.push(`   Due: ${delivery.dueDate}`);
    if (delivery.deliveredAt) lines.push(`   Delivered: ${delivery.deliveredAt}`);
    if (delivery.createdAt) lines.push(`   Created: ${delivery.createdAt}`);
    return lines.join("\n");
  });

  const summary = `Found ${result.data.length} delivery(ies) (Page ${result.pagination.page}/${Math.ceil(result.pagination.total / result.pagination.limit)} of ${result.pagination.total} total)`;

  return `${summary}\n\n${deliveries.join("\n\n")}`;
}

function formatDelivery(delivery: Delivery): string {
  const lines: string[] = [];
  lines.push(`📦 Delivery: ${delivery.name}`);
  lines.push(`ID: ${delivery.id}`);
  lines.push(`Status: ${delivery.status}`);
  lines.push(`Project ID: ${delivery.projectId}`);
  if (delivery.description) lines.push(`Description: ${delivery.description}`);
  if (delivery.dueDate) lines.push(`Due Date: ${delivery.dueDate}`);
  if (delivery.deliveredAt) lines.push(`Delivered: ${delivery.deliveredAt}`);
  if (delivery.createdAt) lines.push(`Created: ${delivery.createdAt}`);
  if (delivery.updatedAt) lines.push(`Updated: ${delivery.updatedAt}`);

  return lines.join("\n");
}

export function registerDeliveryTools(
  server: McpServer,
  client: BoondAPIClient
): void {
  server.registerTool(
    "boond_deliveries_search",
    {
      description: "Search deliveries by criteria",
      inputSchema: {
        query: z.string().optional().describe("Search query"),
        page: z.number().int().min(1).default(1).describe("Page number"),
        limit: z.number().int().min(1).max(100).default(20).describe("Results per page"),
      },
    },
    async (input) => {
      try {
        const params = searchDeliveriesSchema.parse(input);
        const result = await client.searchDeliveries(params);
        return {
          content: [
            {
              type: "text",
              text: formatDeliveryList(result),
            },
          ],
        };
      } catch (error) {
        return handleSearchError(error, "deliveries");
      }
    }
  );

  server.registerTool(
    "boond_deliveries_get",
    {
      description: "Get a delivery by ID",
      inputSchema: {
        id: z.string().min(1, "Delivery ID is required").describe("Delivery ID"),
      },
    },
    async (input) => {
      try {
        const params = deliveryIdSchema.parse(input);
        const delivery = await client.getDelivery(params.id);
        return {
          content: [
            {
              type: "text",
              text: formatDelivery(delivery),
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, "retrieving", "Delivery");
      }
    }
  );

  server.registerTool(
    "boond_deliveries_create",
    {
      description: "Create a new delivery",
      inputSchema: {
        name: z.string().min(1).describe("Delivery name"),
        projectId: z.string().min(1).describe("Project ID"),
        description: z.string().optional().describe("Delivery description"),
        dueDate: z.string().optional().describe("Due date (ISO 8601 format)"),
      },
    },
    async (input) => {
      try {
        const data = createDeliverySchema.parse(input);
        const delivery = await client.createDelivery(data);
        return {
          content: [
            {
              type: "text",
              text: `✅ Delivery created successfully:\n\n${formatDelivery(delivery)}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, "creating", "Delivery");
      }
    }
  );

  server.registerTool(
    "boond_deliveries_update",
    {
      description: "Update an existing delivery",
      inputSchema: {
        id: z.string().min(1).describe("Delivery ID"),
        name: z.string().optional().describe("Delivery name"),
        description: z.string().optional().describe("Delivery description"),
        dueDate: z.string().optional().describe("Due date (ISO 8601 format)"),
        status: z.enum(["pending", "in-progress", "completed", "blocked"]).optional().describe("Delivery status"),
      },
    },
    async (input) => {
      try {
        const validated = updateDeliveryWithIdSchema.parse(input);
        const { id, ...updateData } = validated;
        const delivery = await client.updateDelivery(id, updateData);
        return {
          content: [
            {
              type: "text",
              text: `✅ Delivery updated successfully:\n\n${formatDelivery(delivery)}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, "updating", "Delivery");
      }
    }
  );

  server.registerTool(
    "boond_deliveries_send",
    {
      description: "Send a delivery notification",
      inputSchema: {
        id: z.string().min(1).describe("Delivery ID"),
      },
    },
    async (input) => {
      try {
        const params = deliveryIdSchema.parse(input);
        const delivery = await client.sendDelivery(params.id);
        return {
          content: [
            {
              type: "text",
              text: `✅ Delivery sent successfully:\n\n${formatDelivery(delivery)}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, "sending", "Delivery");
      }
    }
  );
}
