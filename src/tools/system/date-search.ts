import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BoondAPIClient } from '../../api/client.js';
import { z } from 'zod';
import { handleSearchError } from '../../utils/error-handling.js';
import { READ_TOOL_ANNOTATIONS } from '../../utils/tool-registry.js';

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

function normalizeTimeReportLine(report: Record<string, unknown>): {
  date: string;
  hours: string;
  status: string;
  resourceId: string;
  projectId: string;
} {
  const regularTimesRaw = report['regularTimes'];
  const regularTimes = Array.isArray(regularTimesRaw)
    ? (regularTimesRaw.filter(item => item && typeof item === 'object') as Array<
        Record<string, unknown>
      >)
    : [];
  const firstRegular = regularTimes[0];
  const date =
    (firstRegular && typeof firstRegular['startDate'] === 'string'
      ? firstRegular['startDate']
      : undefined) ||
    readString(report, ['date', 'workDate', 'day', 'term']) ||
    'Unknown';

  const summed = regularTimes
    .map(item => item['duration'])
    .reduce<number | undefined>((acc, value) => {
      const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
      if (Number.isNaN(n)) {
        return acc;
      }
      return (acc ?? 0) + n;
    }, undefined);

  const hours =
    summed ??
    readNumber(report, [
      'hours',
      'duration',
      'workedHours',
      'quantity',
      'time',
      'nbHours',
      'numberOfHours',
    ]);

  const projectFromRegular =
    firstRegular && typeof firstRegular['project'] === 'object' && firstRegular['project'] !== null
      ? (firstRegular['project'] as Record<string, unknown>)['id']
      : undefined;

  const status =
    readString(report, ['status', 'state', 'workflowStatus', 'validationStatus']) ||
    (typeof report['state'] === 'number' ? String(report['state']) : 'unknown');

  const resourceId =
    readString(report, ['resourceId', 'consultantId', 'dependsOnId']) ||
    (typeof report['resourceId'] === 'number' ? String(report['resourceId']) : 'unknown');

  const projectId =
    (typeof projectFromRegular === 'number' || typeof projectFromRegular === 'string'
      ? String(projectFromRegular)
      : undefined) ||
    readString(report, ['projectId', 'missionId', 'assignmentId']) ||
    (typeof report['projectId'] === 'number' ? String(report['projectId']) : 'unknown');

  return {
    date,
    hours: hours !== undefined ? String(hours) : 'unknown',
    status,
    resourceId,
    projectId,
  };
}

function isTimeReportIncomplete(report: Record<string, unknown>): boolean {
  const normalized = normalizeTimeReportLine(report);
  return normalized.hours === 'unknown' || normalized.projectId === 'unknown';
}

const dateRangeSearchSchema = z.object({
  entity: z.enum(['timereports', 'absences', 'projects']),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  status: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

export function registerDateRangeSearchTool(server: McpServer, client: BoondAPIClient): void {
  server.registerTool(
    'boond_date_range_search',
    {
      description:
        'Search entities within a specific date range (YYYY-MM-DD format). Supports time reports, absences, and projects.',
      annotations: READ_TOOL_ANNOTATIONS,
      inputSchema: dateRangeSearchSchema.shape,
    },
    async params => {
      try {
        const validated = dateRangeSearchSchema.parse(params);
        const { entity, dateFrom, dateTo, status, page, limit } = validated;

        const lines: string[] = [];
        lines.push(`📅 Date Range Search: ${entity}`);
        lines.push(`From: ${dateFrom} To: ${dateTo}`);
        if (status) lines.push(`Status: ${status}`);
        lines.push('');

        switch (entity) {
          case 'timereports': {
            const results = await client.searchTimeReports({
              startDate: dateFrom,
              endDate: dateTo,
              page,
              limit,
            });

            const enriched = [...results.data];
            const candidates = results.data
              .map((tr, index) => ({ tr, index }))
              .filter(({ tr }) => isTimeReportIncomplete(tr as unknown as Record<string, unknown>))
              .slice(0, 10);

            const detailResults = await Promise.allSettled(
              candidates.map(({ tr }) =>
                client.getTimeReport(String((tr as unknown as Record<string, unknown>)['id']))
              )
            );

            for (let i = 0; i < detailResults.length; i += 1) {
              const result = detailResults[i];
              const candidate = candidates[i];
              if (!candidate || !result || result.status !== 'fulfilled') {
                continue;
              }
              enriched[candidate.index] = {
                ...(candidate.tr as unknown as Record<string, unknown>),
                ...(result.value as unknown as Record<string, unknown>),
              } as unknown as (typeof results.data)[number];
            }

            lines.push(`Found ${results.data.length} time reports`);
            for (const tr of enriched) {
              const normalized = normalizeTimeReportLine(tr as unknown as Record<string, unknown>);
              lines.push(`  • ${normalized.date} - ${normalized.hours}h (${normalized.status})`);
              lines.push(
                `    Resource: ${normalized.resourceId}, Project: ${normalized.projectId}`
              );
            }
            break;
          }
          case 'absences': {
            const results = await client.searchAbsences({
              startDate: dateFrom,
              endDate: dateTo,
              page,
              limit,
            });
            lines.push(`Found ${results.data.length} absences`);
            for (const a of results.data) {
              lines.push(`  • ${a.type}: ${a.startDate} to ${a.endDate}`);
              lines.push(`    Resource: ${a.resourceId}`);
            }
            break;
          }
          case 'projects': {
            const results = await client.searchProjects({
              query: '',
              page,
              limit,
            });
            const filtered = results.data.filter(p => {
              if (!p.startDate) return false;
              return p.startDate >= dateFrom && p.startDate <= dateTo;
            });
            lines.push(`Found ${filtered.length} projects starting in range`);
            for (const p of filtered) {
              lines.push(`  • ${p.name} (ID: ${p.id})`);
              lines.push(`    Start: ${p.startDate}, Status: ${p.status}`);
            }
            break;
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: lines.join('\n'),
            },
          ],
        };
      } catch (error) {
        return handleSearchError(error, 'date range search');
      }
    }
  );
}
