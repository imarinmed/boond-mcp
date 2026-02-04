/**
 * Candidate tools registration
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { BoondAPIClient } from "../../api/client.js";
import {
  searchParamsSchema,
  createCandidateSchema,
  candidateIdSchema,
  updateCandidateWithIdSchema,
} from "../../types/schemas.js";
import type { Candidate, SearchResponse } from "../../types/boond.js";
import { handleSearchError, handleToolError } from "../../utils/error-handling.js";
import { ValidationError } from "../../api/client.js";

/**
 * Format candidate list for display
 */
function formatCandidateList(result: SearchResponse<Candidate>): string {
  if (result.data.length === 0) {
    return "No candidates found.";
  }

  const candidates = result.data.map((candidate) => {
    const lines: string[] = [];
    lines.push(`👤 ${candidate.firstName} ${candidate.lastName} (ID: ${candidate.id})`);
    lines.push(`   Email: ${candidate.email}`);
    if (candidate.phone) lines.push(`   Phone: ${candidate.phone}`);
    lines.push(`   Status: ${candidate.status}`);
    if (candidate.address) lines.push(`   Address: ${candidate.address}`);
    if (candidate.city) lines.push(`   City: ${candidate.city}`);
    if (candidate.country) lines.push(`   Country: ${candidate.country}`);
    return lines.join("\n");
  });

  const summary = `Found ${result.data.length} candidate(s) (Page ${result.pagination.page}/${Math.ceil(result.pagination.total / result.pagination.limit)} of ${result.pagination.total} total)`;

  return `${summary}\n\n${candidates.join("\n\n")}`;
}

/**
 * Format single candidate details
 */
function formatCandidate(candidate: Candidate): string {
  const lines: string[] = [];
  lines.push(`👤 Candidate: ${candidate.firstName} ${candidate.lastName}`);
  lines.push(`ID: ${candidate.id}`);
  lines.push(`Email: ${candidate.email}`);
  if (candidate.phone) lines.push(`Phone: ${candidate.phone}`);
  lines.push(`Status: ${candidate.status}`);
  if (candidate.address) lines.push(`Address: ${candidate.address}`);
  if (candidate.city) lines.push(`City: ${candidate.city}`);
  if (candidate.country) lines.push(`Country: ${candidate.country}`);
  if (candidate.createdAt) lines.push(`Created: ${candidate.createdAt}`);
  if (candidate.updatedAt) lines.push(`Updated: ${candidate.updatedAt}`);

  return lines.join("\n");
}

export function registerCandidateTools(
  server: McpServer,
  client: BoondAPIClient
): void {
  /**
   * boond_candidates_search - Search candidates
   */
  server.registerTool(
    "boond_candidates_search",
    {
      description: "Search candidates by name, email, or other criteria",
      inputSchema: searchParamsSchema.shape,
    },
    async (params) => {
      try {
        const validated = searchParamsSchema.parse(params);
        const result = await client.searchCandidates(validated);
        const text = formatCandidateList(result);

        return {
          content: [{ type: "text", text }],
        };
      } catch (error) {
        return handleSearchError(error, "candidates");
      }
    }
  );

  /**
   * boond_candidates_get - Get candidate by ID
   */
  server.registerTool(
    "boond_candidates_get",
    {
      description: "Get a candidate by ID",
      inputSchema: candidateIdSchema.shape,
    },
    async (params) => {
      try {
        const validated = candidateIdSchema.parse(params);
        const candidate = await client.getCandidate(validated.id);
        const text = formatCandidate(candidate);

        return {
          content: [{ type: "text", text }],
        };
      } catch (error) {
        return handleToolError(error, "retrieving", "Candidate");
      }
    }
  );

  /**
   * boond_candidates_create - Create new candidate
   */
  server.registerTool(
    "boond_candidates_create",
    {
      description: "Create a new candidate",
      inputSchema: createCandidateSchema.shape,
    },
    async (params) => {
      try {
        const validated = createCandidateSchema.parse(params);
        const candidate = await client.createCandidate(validated);
        const text = formatCandidate(candidate);

        return {
          content: [
            {
              type: "text",
              text: `Candidate created successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, "creating", "Candidate");
      }
    }
  );

  /**
   * boond_candidates_update - Update existing candidate
   */
  server.registerTool(
    "boond_candidates_update",
    {
      description: "Update an existing candidate",
      inputSchema: updateCandidateWithIdSchema.shape,
    },
    async (params) => {
      try {
        const validated = updateCandidateWithIdSchema.parse(params);
        const { id, ...updateData } = validated;

        if (!id) {
          throw new ValidationError("Candidate ID is required");
        }

        const candidate = await client.updateCandidate(id, updateData);
        const text = formatCandidate(candidate);

        return {
          content: [
            {
              type: "text",
              text: `Candidate updated successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, "updating", "Candidate");
      }
    }
  );
}
