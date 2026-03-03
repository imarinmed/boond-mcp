import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BoondAPIClient } from '../../api/client.js';
import {
  searchAbsencesSchema,
  createAbsenceSchema,
  absenceIdSchema,
  updateAbsenceWithIdSchema,
} from '../../types/schemas.js';
import type { Absence, SearchResponse } from '../../types/boond.js';
import { handleSearchError, handleToolError } from '../../utils/error-handling.js';
import { enrichItemsWithDetails } from '../../utils/enrichment.js';
import {
  readString,
  pickStatus,
  pickType,
  pickDate,
  pickResourceId,
  normalizeAbsence,
  isFieldUnknown,
} from '../../utils/normalization.js';

type DisplayAbsence = {
  id: string;
  resourceId: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  reason?: string;
  createdAt?: string;
  updatedAt?: string;
};

function normalizeAbsenceForDisplay(absence: Absence): DisplayAbsence {
  const normalized = normalizeAbsence(absence);
  const normalizedFields = normalized._normalized;
  const record = absence as unknown as Record<string, unknown>;
  const reason = readString(record, ['reason']) || absence.reason;

  return {
    id: absence.id,
    resourceId: normalizedFields.resourceId ?? pickResourceId(record),
    type: normalizedFields.type ?? pickType(record),
    startDate:
      normalizedFields.startDate ?? pickDate(record, ['startDate', 'startsAt', 'fromDate', 'from']),
    endDate: normalizedFields.endDate ?? pickDate(record, ['endDate', 'endsAt', 'toDate', 'to']),
    status: normalizedFields.status ?? pickStatus(record),
    ...(reason ? { reason } : {}),
    ...(absence.createdAt ? { createdAt: absence.createdAt } : {}),
    ...(absence.updatedAt ? { updatedAt: absence.updatedAt } : {}),
  };
}

function formatAbsenceList(result: SearchResponse<Absence>): string {
  if (!result.data || result.data.length === 0) {
    return 'No absences found.';
  }

  const absences = result.data.map(absence => {
    const normalized = normalizeAbsenceForDisplay(absence);
    const startDate = new Date(normalized.startDate).toLocaleDateString();
    const endDate = new Date(normalized.endDate).toLocaleDateString();
    return `  • ID: ${absence.id}
    Resource ID: ${normalized.resourceId}
    Type: ${normalized.type}
    Start Date: ${startDate}
    End Date: ${endDate}
    Status: ${normalized.status}
    ${normalized.reason ? `Reason: ${normalized.reason}` : ''}`;
  });

  const total = result.pagination.total;
  const page = result.pagination.page;
  const limit = result.pagination.limit;

  return (
    `Absences (${total} total, page ${page} of ${Math.ceil(total / limit)}):\n` +
    absences.join('\n') +
    `\n\nShowing ${result.data.length} of ${total} results.`
  );
}

function formatAbsence(absence: Absence): string {
  const normalized = normalizeAbsenceForDisplay(absence);
  const startDate = new Date(normalized.startDate).toLocaleDateString();
  const endDate = new Date(normalized.endDate).toLocaleDateString();
  const created = normalized.createdAt
    ? new Date(normalized.createdAt).toLocaleString()
    : 'Unknown';
  const updated = normalized.updatedAt
    ? new Date(normalized.updatedAt).toLocaleString()
    : 'Unknown';

  return (
    `Absence Details:\n` +
    `  ID: ${absence.id}\n` +
    `  Resource ID: ${normalized.resourceId}\n` +
    `  Type: ${normalized.type}\n` +
    `  Start Date: ${startDate}\n` +
    `  End Date: ${endDate}\n` +
    `  Status: ${normalized.status}\n` +
    `  ${normalized.reason ? `Reason: ${normalized.reason}\n` : ''}` +
    `  Created: ${created}\n` +
    `  Updated: ${updated}`
  );
}

export function registerAbsenceTools(server: McpServer, client: BoondAPIClient): void {
  server.registerTool(
    'boond_absences_search',
    {
      description: 'Search absences by resource, date range, status, or type',
      inputSchema: searchAbsencesSchema.shape,
    },
    async params => {
      try {
        const validated = searchAbsencesSchema.parse(params);
        const result = await client.searchAbsences(validated);
        result.data = await enrichItemsWithDetails(
          result.data,
          absence => client.getAbsence(String(absence.id)),
          absence => {
            const normalized = normalizeAbsence(absence)._normalized;
            return isFieldUnknown(normalized.status) || isFieldUnknown(normalized.type);
          },
          10
        );
        result.data = result.data.slice(0, validated.limit);
        const text = formatAbsenceList(result);

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleSearchError(error, 'absences');
      }
    }
  );

  server.registerTool(
    'boond_absences_get',
    {
      description: 'Get an absence by ID',
      inputSchema: absenceIdSchema.shape,
    },
    async params => {
      try {
        const validated = absenceIdSchema.parse(params);
        const absence = await client.getAbsence(validated.id);
        const text = formatAbsence(absence);

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleToolError(error, 'retrieving', 'Absence');
      }
    }
  );

  server.registerTool(
    'boond_absences_create',
    {
      description: 'Create a new absence',
      inputSchema: createAbsenceSchema.shape,
    },
    async params => {
      try {
        const validated = createAbsenceSchema.parse(params);
        const absence = await client.createAbsence(validated);
        const text = formatAbsence(absence);

        return {
          content: [
            {
              type: 'text',
              text: `Absence created successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'creating', 'Absence');
      }
    }
  );

  server.registerTool(
    'boond_absences_update',
    {
      description: 'Update an existing absence',
      inputSchema: updateAbsenceWithIdSchema.shape,
    },
    async params => {
      try {
        const validated = updateAbsenceWithIdSchema.parse(params);
        const { id, ...updateData } = validated;
        const absence = await client.updateAbsence(id, updateData);
        const text = formatAbsence(absence);

        return {
          content: [
            {
              type: 'text',
              text: `Absence updated successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'updating', 'Absence');
      }
    }
  );
}
