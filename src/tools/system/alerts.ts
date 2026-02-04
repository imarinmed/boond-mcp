import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { BoondAPIClient } from "../../api/client.js";
import {
  searchParamsSchema,
  alertIdSchema,
  updateAlertWithIdSchema,
  updateAlertSchema,
} from "../../types/schemas.js";
import type { Alert, SearchResponse } from "../../types/boond.js";
import { handleSearchError, handleToolError } from "../../utils/error-handling.js";

function formatAlertList(result: SearchResponse<Alert>): string {
  if (result.data.length === 0) {
    return "No alerts found.";
  }

  const alerts = result.data.map((alert) => {
    const lines: string[] = [];
    const icon = alert.type === "error" ? "🔴" : alert.type === "warning" ? "🟡" : alert.type === "success" ? "🟢" : "ℹ️";
    lines.push(`${icon} ${alert.message} (ID: ${alert.id})`);
    lines.push(`   Type: ${alert.type} | Severity: ${alert.severity}`);
    if (!alert.resolvedAt) lines.push(`   Status: Unresolved`);
    else lines.push(`   Resolved: ${alert.resolvedAt}`);
    return lines.join("\n");
  });

  const summary = `Found ${result.data.length} alert(s) (Page ${result.pagination.page}/${Math.ceil(result.pagination.total / result.pagination.limit)} of ${result.pagination.total} total)`;

  return `${summary}\n\n${alerts.join("\n\n")}`;
}

function formatAlert(alert: Alert): string {
  const icon = alert.type === "error" ? "🔴" : alert.type === "warning" ? "🟡" : alert.type === "success" ? "🟢" : "ℹ️";
  const lines: string[] = [];
  lines.push(`${icon} Alert: ${alert.message}`);
  lines.push(`ID: ${alert.id}`);
  lines.push(`Type: ${alert.type}`);
  lines.push(`Severity: ${alert.severity}`);
  lines.push(`Created: ${alert.createdAt}`);
  if (alert.resolvedAt) {
    lines.push(`Resolved: ${alert.resolvedAt}`);
  } else {
    lines.push(`Status: Unresolved`);
  }

  return lines.join("\n");
}

export function registerAlertTools(
  server: McpServer,
  client: BoondAPIClient
): void {
  server.registerTool(
    "boond_alerts_search",
    {
      description: "Search alerts by criteria",
      inputSchema: searchParamsSchema.shape,
    },
    async (params) => {
      try {
        const validated = searchParamsSchema.parse(params);
        const result = await client.searchAlerts(validated);
        const text = formatAlertList(result);

        return {
          content: [{ type: "text", text }],
        };
      } catch (error) {
        return handleSearchError(error, "alerts");
      }
    }
  );

  server.registerTool(
    "boond_alerts_get",
    {
      description: "Get an alert by ID",
      inputSchema: alertIdSchema.shape,
    },
    async (params) => {
      try {
        const validated = alertIdSchema.parse(params);
        const alert = await client.getAlert(validated.id);

        const text = formatAlert(alert);

        return {
          content: [{ type: "text", text }],
        };
      } catch (error) {
        return handleToolError(error, "retrieving", "Alert");
      }
    }
  );

  server.registerTool(
    "boond_alerts_update",
    {
      description: "Update an alert status (mark as resolved)",
      inputSchema: updateAlertWithIdSchema.shape,
    },
    async (params) => {
      try {
        const { id, ...updateData } = updateAlertWithIdSchema.parse(params);
        const validated = updateAlertSchema.parse(updateData);
        const updatePayload =
          validated.resolved === undefined ? {} : { resolved: validated.resolved };
        const updatedAlert = await client.updateAlert(id, updatePayload);
        const text = formatAlert(updatedAlert);

        return {
          content: [
            {
              type: "text",
              text: `Alert updated successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, "updating", "Alert");
      }
    }
  );
}
