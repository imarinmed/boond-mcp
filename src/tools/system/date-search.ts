import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BoondAPIClient } from '../../api/client.js';
import { z } from 'zod';
import { handleSearchError } from '../../utils/error-handling.js';

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
            lines.push(`Found ${results.data.length} time reports`);
            for (const tr of results.data) {
              lines.push(`  • ${tr.date} - ${tr.hours}h (${tr.status})`);
              lines.push(`    Resource: ${tr.resourceId}, Project: ${tr.projectId}`);
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
