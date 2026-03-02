import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BoondAPIClient } from '../../api/client.js';
import {
  searchTimeReportsSchema,
  createTimeReportSchema,
  timeReportIdSchema,
} from '../../types/schemas.js';
import type { TimeReport, SearchResponse } from '../../types/boond.js';
import { handleSearchError, handleToolError } from '../../utils/error-handling.js';

function firstDefined<T>(...values: Array<T | undefined | null>): T | undefined {
  return values.find(value => value !== undefined && value !== null) as T | undefined;
}

function readString(record: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }
  return undefined;
}

function readNumber(record: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }
  return undefined;
}

function formatDate(value: string | undefined): string {
  if (!value) {
    return 'Unknown';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString();
}

function normalizeTimeReport(report: TimeReport): {
  id: string;
  date: string;
  hours: string;
  resourceId: string;
  projectId: string;
  status: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
} {
  const record = report as unknown as Record<string, unknown>;

  const dateRaw = firstDefined(
    report.date,
    readString(record, ['workDate', 'day', 'workedOn', 'reportedAt', 'startsAt', 'date'])
  );
  const hours = firstDefined(
    report.hours,
    readNumber(record, ['duration', 'workedHours', 'quantity', 'time', 'nbHours', 'numberOfHours'])
  );

  return {
    id: report.id,
    date: formatDate(dateRaw),
    hours: hours !== undefined ? String(hours) : 'Unknown',
    resourceId: String(
      firstDefined(
        report.resourceId,
        readString(record, ['resourceId', 'consultantId', 'dependsOnId'])
      ) ?? 'Unknown'
    ),
    projectId: String(
      firstDefined(
        report.projectId,
        readString(record, ['projectId', 'missionId', 'assignmentId'])
      ) ?? 'Unknown'
    ),
    status: String(
      firstDefined(
        report.status,
        readString(record, ['status', 'state', 'workflowStatus', 'validationStatus'])
      ) ?? 'Unknown'
    ),
    ...(report.description ? { description: report.description } : {}),
    ...(report.createdAt ? { createdAt: report.createdAt } : {}),
    ...(report.updatedAt ? { updatedAt: report.updatedAt } : {}),
  };
}

function formatTimeReportList(result: SearchResponse<TimeReport>): string {
  if (!result.data || result.data.length === 0) {
    return 'No time reports found.';
  }

  const reports = result.data.map(report => {
    const normalized = normalizeTimeReport(report);
    return `  • ID: ${report.id}
    Date: ${normalized.date}
    Hours: ${normalized.hours}
    Resource ID: ${normalized.resourceId}
    Project ID: ${normalized.projectId}
    Status: ${normalized.status}
    ${normalized.description ? `Description: ${normalized.description}` : ''}`;
  });

  const total = result.pagination.total;
  const page = result.pagination.page;
  const limit = result.pagination.limit;

  return (
    `Time Reports (${total} total, page ${page} of ${Math.ceil(total / limit)}):\n` +
    reports.join('\n') +
    `\n\nShowing ${result.data.length} of ${total} results.`
  );
}

function formatTimeReport(report: TimeReport): string {
  const normalized = normalizeTimeReport(report);
  const created = normalized.createdAt
    ? new Date(normalized.createdAt).toLocaleString()
    : 'Unknown';
  const updated = normalized.updatedAt
    ? new Date(normalized.updatedAt).toLocaleString()
    : 'Unknown';

  return (
    `Time Report Details:\n` +
    `  ID: ${report.id}\n` +
    `  Date: ${normalized.date}\n` +
    `  Hours: ${normalized.hours}\n` +
    `  Resource ID: ${normalized.resourceId}\n` +
    `  Project ID: ${normalized.projectId}\n` +
    `  Status: ${normalized.status}\n` +
    `  ${normalized.description ? `Description: ${normalized.description}\n` : ''}` +
    `  Created: ${created}\n` +
    `  Updated: ${updated}`
  );
}

export function registerTimeReportTools(server: McpServer, client: BoondAPIClient): void {
  server.registerTool(
    'boond_timereports_search',
    {
      description: 'Search time reports by resource, date range, or status',
      inputSchema: searchTimeReportsSchema.shape,
    },
    async params => {
      try {
        const validated = searchTimeReportsSchema.parse(params);
        const result = await client.searchTimeReports(validated);
        const text = formatTimeReportList(result);

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleSearchError(error, 'time reports');
      }
    }
  );

  server.registerTool(
    'boond_timereports_get',
    {
      description: 'Get a time report by ID',
      inputSchema: timeReportIdSchema.shape,
    },
    async params => {
      try {
        const validated = timeReportIdSchema.parse(params);
        const report = await client.getTimeReport(validated.id);
        const text = formatTimeReport(report);

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleToolError(error, 'retrieving', 'Time report');
      }
    }
  );

  server.registerTool(
    'boond_timereports_create',
    {
      description: 'Create a new time report',
      inputSchema: createTimeReportSchema.shape,
    },
    async params => {
      try {
        const validated = createTimeReportSchema.parse(params);
        const report = await client.createTimeReport(validated);
        const text = formatTimeReport(report);

        return {
          content: [
            {
              type: 'text',
              text: `Time report created successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'creating', 'Time report');
      }
    }
  );
}
