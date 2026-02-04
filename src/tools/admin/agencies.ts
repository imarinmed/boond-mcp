import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { BoondAPIClient } from "../../api/client.js";
import {
  searchParamsSchema,
  agencyIdSchema,
  createAgencySchema,
  updateAgencyWithIdSchema,
} from "../../types/schemas.js";
import type { Agency, SearchResponse } from "../../types/boond.js";
import { handleSearchError, handleToolError } from "../../utils/error-handling.js";

function formatAgencyList(result: SearchResponse<Agency>): string {
  if (result.data.length === 0) {
    return "No agencies found.";
  }

  const agencies = result.data.map((agency) => {
    const lines: string[] = [];
    lines.push(`🏛️ ${agency.name} (ID: ${agency.id})`);
    if (agency.address) lines.push(`   Address: ${agency.address}`);
    if (agency.city) lines.push(`   City: ${agency.city}`);
    if (agency.country) lines.push(`   Country: ${agency.country}`);
    return lines.join("\n");
  });

  const summary = `Found ${result.data.length} agency(ies) (Page ${result.pagination.page}/${Math.ceil(result.pagination.total / result.pagination.limit)} of ${result.pagination.total} total)`;

  return `${summary}\n\n${agencies.join("\n\n")}`;
}

function formatAgency(agency: Agency): string {
  const lines: string[] = [];
  lines.push(`🏛️ Agency: ${agency.name}`);
  lines.push(`ID: ${agency.id}`);
  if (agency.address) lines.push(`Address: ${agency.address}`);
  if (agency.city) lines.push(`City: ${agency.city}`);
  if (agency.country) lines.push(`Country: ${agency.country}`);
  if (agency.createdAt) lines.push(`Created: ${agency.createdAt}`);
  if (agency.updatedAt) lines.push(`Updated: ${agency.updatedAt}`);

  return lines.join("\n");
}

export function registerAgencyTools(
  server: McpServer,
  client: BoondAPIClient
): void {
  server.registerTool(
    "boond_agencies_search",
    {
      description: "Search agencies by name or criteria",
      inputSchema: searchParamsSchema.shape,
    },
    async (params) => {
      try {
        const validated = searchParamsSchema.parse(params);
        const result = await client.searchAgencies(validated);
        const text = formatAgencyList(result);

        return {
          content: [{ type: "text", text }],
        };
      } catch (error) {
        return handleSearchError(error, "agencies");
      }
    }
  );

  server.registerTool(
    "boond_agencies_get",
    {
      description: "Get an agency by ID",
      inputSchema: agencyIdSchema.shape,
    },
    async (params) => {
      try {
        const validated = agencyIdSchema.parse(params);
        const agency = await client.getAgency(validated.id);
        const text = formatAgency(agency);

        return {
          content: [{ type: "text", text }],
        };
      } catch (error) {
        return handleToolError(error, "retrieving", "Agency");
      }
    }
  );

  server.registerTool(
    "boond_agencies_create",
    {
      description: "Create a new agency",
      inputSchema: createAgencySchema.shape,
    },
    async (params) => {
      try {
        const validated = createAgencySchema.parse(params);
        const agency = await client.createAgency(validated);
        const text = formatAgency(agency);

        return {
          content: [
            {
              type: "text",
              text: `Agency created successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, "creating", "Agency");
      }
    }
  );

  server.registerTool(
    "boond_agencies_update",
    {
      description: "Update an existing agency",
      inputSchema: updateAgencyWithIdSchema.shape,
    },
    async (params) => {
      try {
        const validated = updateAgencyWithIdSchema.parse(params);
        const { id, ...updateData } = validated;
        const agency = await client.updateAgency(id, updateData);
        const text = formatAgency(agency);

        return {
          content: [
            {
              type: "text",
              text: `Agency updated successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, "updating", "Agency");
      }
    }
  );
}
