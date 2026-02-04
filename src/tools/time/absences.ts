import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { BoondAPIClient } from "../../api/client.js";
import {
  searchAbsencesSchema,
  createAbsenceSchema,
  absenceIdSchema,
  updateAbsenceWithIdSchema,
} from "../../types/schemas.js";
import type { Absence, SearchResponse } from "../../types/boond.js";
import { handleSearchError, handleToolError } from "../../utils/error-handling.js";

function formatAbsenceList(result: SearchResponse<Absence>): string {
  if (!result.data || result.data.length === 0) {
    return "No absences found.";
  }

  const absences = result.data.map((absence) => {
    const startDate = new Date(absence.startDate).toLocaleDateString();
    const endDate = new Date(absence.endDate).toLocaleDateString();
    return `  • ID: ${absence.id}
    Resource ID: ${absence.resourceId}
    Type: ${absence.type}
    Start Date: ${startDate}
    End Date: ${endDate}
    Status: ${absence.status}
    ${absence.reason ? `Reason: ${absence.reason}` : ""}`;
  });

  const total = result.pagination.total;
  const page = result.pagination.page;
  const limit = result.pagination.limit;

  return (
    `Absences (${total} total, page ${page} of ${Math.ceil(total / limit)}):\n` +
    absences.join("\n") +
    `\n\nShowing ${result.data.length} of ${total} results.`
  );
}

function formatAbsence(absence: Absence): string {
  const startDate = new Date(absence.startDate).toLocaleDateString();
  const endDate = new Date(absence.endDate).toLocaleDateString();
  const created = absence.createdAt
    ? new Date(absence.createdAt).toLocaleString()
    : "Unknown";
  const updated = absence.updatedAt
    ? new Date(absence.updatedAt).toLocaleString()
    : "Unknown";

  return (
    `Absence Details:\n` +
    `  ID: ${absence.id}\n` +
    `  Resource ID: ${absence.resourceId}\n` +
    `  Type: ${absence.type}\n` +
    `  Start Date: ${startDate}\n` +
    `  End Date: ${endDate}\n` +
    `  Status: ${absence.status}\n` +
    `  ${absence.reason ? `Reason: ${absence.reason}\n` : ""}` +
    `  Created: ${created}\n` +
    `  Updated: ${updated}`
  );
}

export function registerAbsenceTools(
  server: McpServer,
  client: BoondAPIClient
): void {
  server.registerTool(
    "boond_absences_search",
    {
      description: "Search absences by resource, date range, status, or type",
      inputSchema: searchAbsencesSchema.shape,
    },
    async (params) => {
      try {
        const validated = searchAbsencesSchema.parse(params);
        const result = await client.searchAbsences(validated);
        const text = formatAbsenceList(result);

        return {
          content: [{ type: "text", text }],
        };
      } catch (error) {
        return handleSearchError(error, "absences");
      }
    }
  );

  server.registerTool(
    "boond_absences_get",
    {
      description: "Get an absence by ID",
      inputSchema: absenceIdSchema.shape,
    },
    async (params) => {
      try {
        const validated = absenceIdSchema.parse(params);
        const absence = await client.getAbsence(validated.id);
        const text = formatAbsence(absence);

        return {
          content: [{ type: "text", text }],
        };
      } catch (error) {
        return handleToolError(error, "retrieving", "Absence");
      }
    }
  );

  server.registerTool(
    "boond_absences_create",
    {
      description: "Create a new absence",
      inputSchema: createAbsenceSchema.shape,
    },
    async (params) => {
      try {
        const validated = createAbsenceSchema.parse(params);
        const absence = await client.createAbsence(validated);
        const text = formatAbsence(absence);

        return {
          content: [
            {
              type: "text",
              text: `Absence created successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, "creating", "Absence");
      }
    }
  );

  server.registerTool(
    "boond_absences_update",
    {
      description: "Update an existing absence",
      inputSchema: updateAbsenceWithIdSchema.shape,
    },
    async (params) => {
      try {
        const validated = updateAbsenceWithIdSchema.parse(params);
        const { id, ...updateData } = validated;
        const absence = await client.updateAbsence(id, updateData);
        const text = formatAbsence(absence);

        return {
          content: [
            {
              type: "text",
              text: `Absence updated successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, "updating", "Absence");
      }
    }
  );
}
