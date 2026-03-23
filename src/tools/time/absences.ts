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
import { READ_TOOL_ANNOTATIONS, WRITE_TOOL_ANNOTATIONS } from '../../utils/tool-registry.js';
import { dryRunSchema, dryRunResponse } from '../../utils/dry-run.js';

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

function formatDisplayDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString();
}

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
    const startDate = formatDisplayDate(normalized.startDate);
    const endDate = formatDisplayDate(normalized.endDate);
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
  const startDate = formatDisplayDate(normalized.startDate);
  const endDate = formatDisplayDate(normalized.endDate);
  const created = normalized.createdAt
    ? new Date(normalized.createdAt).toLocaleString()
    : 'unknown';
  const updated = normalized.updatedAt
    ? new Date(normalized.updatedAt).toLocaleString()
    : 'unknown';

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

function normalizeId(id: string): string {
  const numeric = Number(id);
  if (Number.isFinite(numeric) && id.trim() !== '') {
    return String(numeric);
  }
  return id;
}

async function resolveAbsenceFromSearch(
  client: BoondAPIClient,
  targetId: string,
  maxPages: number = 5,
  pageSize: number = 100
): Promise<Absence | null> {
  const exactId = targetId;
  const normalizedTarget = normalizeId(targetId);

  for (let page = 1; page <= maxPages; page += 1) {
    const result = await client.searchAbsences({ page, limit: pageSize });
    const match = result.data.find(absence => {
      const candidateId = String(absence.id);
      return candidateId === exactId || normalizeId(candidateId) === normalizedTarget;
    });

    if (match) {
      return match;
    }

    if (page * pageSize >= result.pagination.total) {
      break;
    }
  }

  return null;
}

export function registerAbsenceTools(server: McpServer, client: BoondAPIClient): void {
  server.registerTool(
    'boond_absences_search',
    {
      description: 'Search absences by resource, date range, status, or type',
      annotations: READ_TOOL_ANNOTATIONS,
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
      annotations: READ_TOOL_ANNOTATIONS,
      inputSchema: absenceIdSchema.shape,
    },
    async params => {
      try {
        const validated = absenceIdSchema.parse(params);
        let absence: Absence;

        try {
          absence = await client.getAbsence(validated.id);
        } catch (error) {
          const message = error instanceof Error ? error.message.toLowerCase() : '';
          const isNotFound = message.includes('not found') || message.includes('404');

          if (!isNotFound) {
            throw error;
          }

          const fallback = await resolveAbsenceFromSearch(client, validated.id);
          if (!fallback) {
            throw error;
          }
          absence = fallback;
        }

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
      annotations: WRITE_TOOL_ANNOTATIONS,
      inputSchema: createAbsenceSchema.merge(dryRunSchema).shape,
    },
    async params => {
      try {
        const validated = createAbsenceSchema.merge(dryRunSchema).parse(params);
        const { dryRun, ...data } = validated;
        if (dryRun) {
          return dryRunResponse('Create Absence', data);
        }
        const absence = await client.createAbsence(data);
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
      annotations: WRITE_TOOL_ANNOTATIONS,
      inputSchema: updateAbsenceWithIdSchema.merge(dryRunSchema).shape,
    },
    async params => {
      try {
        const validated = updateAbsenceWithIdSchema.merge(dryRunSchema).parse(params);
        const { id, dryRun, ...updateData } = validated;
        if (dryRun) {
          return dryRunResponse('Update Absence', { id, ...updateData });
        }
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
