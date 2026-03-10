import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BoondAPIClient } from '../../api/client.js';
import {
  searchExpenseReportsSchema,
  createExpenseReportSchema,
  updateExpenseReportWithIdSchema,
  expenseReportIdSchema,
  rejectExpenseReportSchema,
} from '../../types/schemas.js';
import type { ExpenseReport, SearchResponse } from '../../types/boond.js';
import { handleSearchError, handleToolError } from '../../utils/error-handling.js';
import { enrichItemsWithDetails } from '../../utils/enrichment.js';
import { readNumber, readString, formatUnknownWithDebug } from '../../utils/normalization.js';

function formatDate(value: string | undefined): string {
  if (!value) return 'unknown';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString();
}

function normalizeExpenseReport(report: ExpenseReport): {
  id: string;
  resourceId: string;
  periodStart: string;
  periodEnd: string;
  total: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  items?: ExpenseReport['items'];
} {
  const record = report as unknown as Record<string, unknown>;
  const period =
    record['period'] && typeof record['period'] === 'object'
      ? (record['period'] as Record<string, unknown>)
      : {};

  const periodStart =
    readString(period, ['startDate', 'fromDate', 'from']) ||
    readString(record, ['periodStartDate', 'startDate', 'fromDate']);
  const periodEnd =
    readString(period, ['endDate', 'toDate', 'to']) ||
    readString(record, ['periodEndDate', 'endDate', 'toDate']);

  const totalNum = readNumber(record, [
    'total',
    'amount',
    'totalAmount',
    'sum',
    'amountWithoutTaxes',
  ]);
  const statusCandidates = ['status', 'state', 'workflowStatus', 'validationStatus'];
  const status =
    readString(record, statusCandidates) ||
    (typeof record['state'] === 'number'
      ? String(record['state'])
      : formatUnknownWithDebug(
          'status',
          statusCandidates.map(k => record[k])
        ));

  const resourceIdValue = record['resourceId'] ?? record['consultantId'] ?? report.resourceId;
  const resourceId =
    resourceIdValue === undefined || resourceIdValue === null || resourceIdValue === ''
      ? formatUnknownWithDebug('resourceId', [resourceIdValue])
      : String(resourceIdValue);

   return {
     id: report.id,
     resourceId,
     periodStart: periodStart || 'unknown',
     periodEnd: periodEnd || 'unknown',
    total: totalNum !== undefined ? String(totalNum) : String(report.total ?? 'unknown'),
    status,
    ...(report.createdAt ? { createdAt: report.createdAt } : {}),
    ...(report.updatedAt ? { updatedAt: report.updatedAt } : {}),
    ...(report.items ? { items: report.items } : {}),
  };
}

function shouldEnrichExpenseReport(report: ExpenseReport): boolean {
   const normalized = normalizeExpenseReport(report);
   return (
     normalized.resourceId === 'unknown' ||
     normalized.periodStart === 'unknown' ||
     normalized.periodEnd === 'unknown' ||
     normalized.total === 'unknown' ||
     normalized.status === 'unknown'
   );
 }

function formatExpenseReportList(result: SearchResponse<ExpenseReport>): string {
  if (!result.data || result.data.length === 0) {
    return 'No expense reports found.';
  }

  const reports = result.data.map(report => {
    const normalized = normalizeExpenseReport(report);
    const startDate = formatDate(normalized.periodStart);
    const endDate = formatDate(normalized.periodEnd);
    return `  • ID: ${report.id}
    Period: ${startDate} to ${endDate}
    Resource ID: ${normalized.resourceId}
    Total: ${normalized.total}
    Status: ${normalized.status}`;
  });

  const total = result.pagination.total;
  const page = result.pagination.page;
  const limit = result.pagination.limit;

  return (
    `Expense Reports (${total} total, page ${page} of ${Math.ceil(total / limit)}):\n` +
    reports.join('\n') +
    `\n\nShowing ${result.data.length} of ${total} results.`
  );
}

function formatExpenseReport(report: ExpenseReport): string {
  const normalized = normalizeExpenseReport(report);
  const startDate = formatDate(normalized.periodStart);
  const endDate = formatDate(normalized.periodEnd);
   const created = normalized.createdAt
     ? new Date(normalized.createdAt).toLocaleString()
     : 'unknown';
   const updated = normalized.updatedAt
     ? new Date(normalized.updatedAt).toLocaleString()
     : 'unknown';

  let itemsText = '';
  if (normalized.items && normalized.items.length > 0) {
    itemsText = `\n  Items:\n`;
    normalized.items.forEach(item => {
      itemsText += `    - ${item.description}: ${item.amount} (${item.category || 'uncategorized'})\n`;
    });
  }

  return (
    `Expense Report Details:\n` +
    `  ID: ${report.id}\n` +
    `  Resource ID: ${normalized.resourceId}\n` +
    `  Period: ${startDate} to ${endDate}\n` +
    `  Total: ${normalized.total}\n` +
    `  Status: ${normalized.status}\n` +
    itemsText +
    `  Created: ${created}\n` +
    `  Updated: ${updated}`
  );
}

export function registerExpenseTools(server: McpServer, client: BoondAPIClient): void {
  server.registerTool(
    'boond_expenses_search',
    {
      description: 'Search expense reports by resource, date range, or status',
      inputSchema: searchExpenseReportsSchema.shape,
    },
    async params => {
      try {
        const validated = searchExpenseReportsSchema.parse(params);
        const result = await client.searchExpenseReports(validated);
        result.data = await enrichItemsWithDetails(
          result.data,
          report => client.getExpenseReport(report.id),
          shouldEnrichExpenseReport,
          10
        );
        result.data = result.data.slice(0, validated.limit);
        const text = formatExpenseReportList(result);

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleSearchError(error, 'expense reports');
      }
    }
  );

  server.registerTool(
    'boond_expenses_get',
    {
      description: 'Get an expense report by ID',
      inputSchema: expenseReportIdSchema.shape,
    },
    async params => {
      try {
        const validated = expenseReportIdSchema.parse(params);
        const report = await client.getExpenseReport(validated.id);
        const text = formatExpenseReport(report);

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleToolError(error, 'retrieving', 'Expense report');
      }
    }
  );

  server.registerTool(
    'boond_expenses_create',
    {
      description: 'Create a new expense report',
      inputSchema: createExpenseReportSchema.shape,
    },
    async params => {
      try {
        const validated = createExpenseReportSchema.parse(params);
        const report = await client.createExpenseReport(validated);
        const text = formatExpenseReport(report);

        return {
          content: [
            {
              type: 'text',
              text: `Expense report created successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'creating', 'Expense report');
      }
    }
  );

  server.registerTool(
    'boond_expenses_update',
    {
      description: 'Update an existing expense report',
      inputSchema: updateExpenseReportWithIdSchema.shape,
    },
    async params => {
      try {
        const validated = updateExpenseReportWithIdSchema.parse(params);
        const { id, ...updateData } = validated;
        const report = await client.updateExpenseReport(id, updateData);
        const text = formatExpenseReport(report);

        return {
          content: [
            {
              type: 'text',
              text: `Expense report updated successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'updating', 'Expense report');
      }
    }
  );

  server.registerTool(
    'boond_expenses_certify',
    {
      description: 'Certify an expense report (approve for payment)',
      inputSchema: expenseReportIdSchema.shape,
    },
    async params => {
      try {
        const validated = expenseReportIdSchema.parse(params);
        await client.certifyExpenseReport(validated.id);

        return {
          content: [
            {
              type: 'text',
              text: `Expense report ${validated.id} has been certified successfully!`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'certifying', 'Expense report');
      }
    }
  );

  server.registerTool(
    'boond_expenses_reject',
    {
      description: 'Reject an expense report with a reason',
      inputSchema: rejectExpenseReportSchema.shape,
    },
    async params => {
      try {
        const validated = rejectExpenseReportSchema.parse(params);
        await client.rejectExpenseReport(validated.id, validated.reason);

        return {
          content: [
            {
              type: 'text',
              text: `Expense report ${validated.id} has been rejected.\nReason: ${validated.reason}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'rejecting', 'Expense report');
      }
    }
  );
}
