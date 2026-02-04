import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { BoondAPIClient } from "../../api/client.js";
import {
  searchExpenseReportsSchema,
  createExpenseReportSchema,
  updateExpenseReportWithIdSchema,
  expenseReportIdSchema,
  rejectExpenseReportSchema,
} from "../../types/schemas.js";
import type { ExpenseReport, SearchResponse } from "../../types/boond.js";
import { handleSearchError, handleToolError } from "../../utils/error-handling.js";

function formatExpenseReportList(
  result: SearchResponse<ExpenseReport>
): string {
  if (!result.data || result.data.length === 0) {
    return "No expense reports found.";
  }

  const reports = result.data.map((report) => {
    const startDate = new Date(
      report.period.startDate
    ).toLocaleDateString();
    const endDate = new Date(report.period.endDate).toLocaleDateString();
    return `  • ID: ${report.id}
    Period: ${startDate} to ${endDate}
    Resource ID: ${report.resourceId}
    Total: ${report.total}
    Status: ${report.status}`;
  });

  const total = result.pagination.total;
  const page = result.pagination.page;
  const limit = result.pagination.limit;

  return (
    `Expense Reports (${total} total, page ${page} of ${Math.ceil(
      total / limit
    )}):\n` +
    reports.join("\n") +
    `\n\nShowing ${result.data.length} of ${total} results.`
  );
}

function formatExpenseReport(report: ExpenseReport): string {
  const startDate = new Date(report.period.startDate).toLocaleDateString();
  const endDate = new Date(report.period.endDate).toLocaleDateString();
  const created = report.createdAt
    ? new Date(report.createdAt).toLocaleString()
    : "Unknown";
  const updated = report.updatedAt
    ? new Date(report.updatedAt).toLocaleString()
    : "Unknown";

  let itemsText = "";
  if (report.items && report.items.length > 0) {
    itemsText = `\n  Items:\n`;
    report.items.forEach((item) => {
      itemsText += `    - ${item.description}: ${item.amount} (${
        item.category || "uncategorized"
      })\n`;
    });
  }

  return (
    `Expense Report Details:\n` +
    `  ID: ${report.id}\n` +
    `  Resource ID: ${report.resourceId}\n` +
    `  Period: ${startDate} to ${endDate}\n` +
    `  Total: ${report.total}\n` +
    `  Status: ${report.status}\n` +
    itemsText +
    `  Created: ${created}\n` +
    `  Updated: ${updated}`
  );
}

export function registerExpenseTools(
  server: McpServer,
  client: BoondAPIClient
): void {
  server.registerTool(
    "boond_expenses_search",
    {
      description: "Search expense reports by resource, date range, or status",
      inputSchema: searchExpenseReportsSchema.shape,
    },
    async (params) => {
      try {
        const validated = searchExpenseReportsSchema.parse(params);
        const result = await client.searchExpenseReports(validated);
        const text = formatExpenseReportList(result);

        return {
          content: [{ type: "text", text }],
        };
      } catch (error) {
        return handleSearchError(error, "expense reports");
      }
    }
  );

  server.registerTool(
    "boond_expenses_get",
    {
      description: "Get an expense report by ID",
      inputSchema: expenseReportIdSchema.shape,
    },
    async (params) => {
      try {
        const validated = expenseReportIdSchema.parse(params);
        const report = await client.getExpenseReport(validated.id);
        const text = formatExpenseReport(report);

        return {
          content: [{ type: "text", text }],
        };
      } catch (error) {
        return handleToolError(error, "retrieving", "Expense report");
      }
    }
  );

  server.registerTool(
    "boond_expenses_create",
    {
      description: "Create a new expense report",
      inputSchema: createExpenseReportSchema.shape,
    },
    async (params) => {
      try {
        const validated = createExpenseReportSchema.parse(params);
        const report = await client.createExpenseReport(validated);
        const text = formatExpenseReport(report);

        return {
          content: [
            {
              type: "text",
              text: `Expense report created successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, "creating", "Expense report");
      }
    }
  );

  server.registerTool(
    "boond_expenses_update",
    {
      description: "Update an existing expense report",
      inputSchema: updateExpenseReportWithIdSchema.shape,
    },
    async (params) => {
      try {
        const validated = updateExpenseReportWithIdSchema.parse(params);
        const { id, ...updateData } = validated;
        const report = await client.updateExpenseReport(id, updateData);
        const text = formatExpenseReport(report);

        return {
          content: [
            {
              type: "text",
              text: `Expense report updated successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, "updating", "Expense report");
      }
    }
  );

  server.registerTool(
    "boond_expenses_certify",
    {
      description: "Certify an expense report (approve for payment)",
      inputSchema: expenseReportIdSchema.shape,
    },
    async (params) => {
      try {
        const validated = expenseReportIdSchema.parse(params);
        await client.certifyExpenseReport(validated.id);

        return {
          content: [
            {
              type: "text",
              text: `Expense report ${validated.id} has been certified successfully!`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, "certifying", "Expense report");
      }
    }
  );

  server.registerTool(
    "boond_expenses_reject",
    {
      description: "Reject an expense report with a reason",
      inputSchema: rejectExpenseReportSchema.shape,
    },
    async (params) => {
      try {
        const validated = rejectExpenseReportSchema.parse(params);
        await client.rejectExpenseReport(validated.id, validated.reason);

        return {
          content: [
            {
              type: "text",
              text: `Expense report ${validated.id} has been rejected.\nReason: ${validated.reason}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, "rejecting", "Expense report");
      }
    }
  );
}
