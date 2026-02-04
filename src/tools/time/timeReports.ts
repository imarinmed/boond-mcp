import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { BoondAPIClient } from "../../api/client.js";
import {
  searchTimeReportsSchema,
  createTimeReportSchema,
  timeReportIdSchema,
} from "../../types/schemas.js";
import type { TimeReport, SearchResponse } from "../../types/boond.js";
import { handleSearchError, handleToolError } from "../../utils/error-handling.js";

function formatTimeReportList(result: SearchResponse<TimeReport>): string {
  if (!result.data || result.data.length === 0) {
    return "No time reports found.";
  }

  const reports = result.data.map((report) => {
    const date = new Date(report.date).toLocaleDateString();
    return `  • ID: ${report.id}
    Date: ${date}
    Hours: ${report.hours}
    Resource ID: ${report.resourceId}
    Project ID: ${report.projectId}
    Status: ${report.status}
    ${report.description ? `Description: ${report.description}` : ""}`;
  });

  const total = result.pagination.total;
  const page = result.pagination.page;
  const limit = result.pagination.limit;

  return (
    `Time Reports (${total} total, page ${page} of ${Math.ceil(total / limit)}):\n` +
    reports.join("\n") +
    `\n\nShowing ${result.data.length} of ${total} results.`
  );
}

function formatTimeReport(report: TimeReport): string {
  const date = new Date(report.date).toLocaleDateString();
  const created = report.createdAt
    ? new Date(report.createdAt).toLocaleString()
    : "Unknown";
  const updated = report.updatedAt
    ? new Date(report.updatedAt).toLocaleString()
    : "Unknown";

  return (
    `Time Report Details:\n` +
    `  ID: ${report.id}\n` +
    `  Date: ${date}\n` +
    `  Hours: ${report.hours}\n` +
    `  Resource ID: ${report.resourceId}\n` +
    `  Project ID: ${report.projectId}\n` +
    `  Status: ${report.status}\n` +
    `  ${report.description ? `Description: ${report.description}\n` : ""}` +
    `  Created: ${created}\n` +
    `  Updated: ${updated}`
  );
}

export function registerTimeReportTools(
  server: McpServer,
  client: BoondAPIClient
): void {
  server.registerTool(
    "boond_timereports_search",
    {
      description: "Search time reports by resource, date range, or status",
      inputSchema: searchTimeReportsSchema.shape,
    },
    async (params) => {
      try {
        const validated = searchTimeReportsSchema.parse(params);
        const result = await client.searchTimeReports(validated);
        const text = formatTimeReportList(result);

        return {
          content: [{ type: "text", text }],
        };
      } catch (error) {
        return handleSearchError(error, "time reports");
      }
    }
  );

  server.registerTool(
    "boond_timereports_get",
    {
      description: "Get a time report by ID",
      inputSchema: timeReportIdSchema.shape,
    },
    async (params) => {
      try {
        const validated = timeReportIdSchema.parse(params);
        const report = await client.getTimeReport(validated.id);
        const text = formatTimeReport(report);

        return {
          content: [{ type: "text", text }],
        };
      } catch (error) {
        return handleToolError(error, "retrieving", "Time report");
      }
    }
  );

  server.registerTool(
    "boond_timereports_create",
    {
      description: "Create a new time report",
      inputSchema: createTimeReportSchema.shape,
    },
    async (params) => {
      try {
        const validated = createTimeReportSchema.parse(params);
        const report = await client.createTimeReport(validated);
        const text = formatTimeReport(report);

        return {
          content: [
            {
              type: "text",
              text: `Time report created successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, "creating", "Time report");
      }
    }
  );
}
