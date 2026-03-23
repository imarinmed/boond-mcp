/**
 * Candidate tools registration
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BoondAPIClient } from '../../api/client.js';
import {
  searchParamsSchema,
  createCandidateSchema,
  candidateIdSchema,
  updateCandidateWithIdSchema,
} from '../../types/schemas.js';
import type { Candidate, SearchResponse } from '../../types/boond.js';
import { handleSearchError, handleToolError } from '../../utils/error-handling.js';
import { WRITE_TOOL_ANNOTATIONS, READ_TOOL_ANNOTATIONS } from '../../utils/tool-registry.js';
import { dryRunSchema, dryRunResponse } from '../../utils/dry-run.js';
import { ValidationError } from '../../api/client.js';

function pickCandidateName(candidate: Candidate): string {
  const record = candidate as unknown as Record<string, unknown>;
  const firstName =
    (typeof candidate.firstName === 'string' ? candidate.firstName : undefined) ||
    (typeof record['firstName'] === 'string' ? (record['firstName'] as string) : undefined) ||
    (typeof record['firstname'] === 'string' ? (record['firstname'] as string) : undefined) ||
    '';
  const lastName =
    (typeof candidate.lastName === 'string' ? candidate.lastName : undefined) ||
    (typeof record['lastName'] === 'string' ? (record['lastName'] as string) : undefined) ||
    (typeof record['lastname'] === 'string' ? (record['lastname'] as string) : undefined) ||
    '';
  const full = `${firstName} ${lastName}`.trim();
  return full || `Candidate #${candidate.id}`;
}

function pickCandidateEmail(candidate: Candidate): string {
  const record = candidate as unknown as Record<string, unknown>;
  const candidates = [
    candidate.email,
    record['email'],
    record['email1'],
    record['email_1'],
    record['mail'],
  ];
  for (const value of candidates) {
    if (typeof value === 'string' && value.trim().length > 0) return value;
  }
  return 'not available';
}

function pickCandidateStatus(candidate: Candidate): string {
  const record = candidate as unknown as Record<string, unknown>;
  const candidates = [
    candidate.status,
    record['state'],
    record['workflowStatus'],
    record['validationStatus'],
  ];
  for (const value of candidates) {
    if (typeof value === 'string' && value.trim().length > 0) return value;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return value ? 'active' : 'inactive';
  }
  return 'unknown';
}

/**
 * Format candidate list for display
 */
function formatCandidateList(result: SearchResponse<Candidate>): string {
  if (result.data.length === 0) {
    return 'No candidates found.';
  }

  const candidates = result.data.map(candidate => {
    const lines: string[] = [];
    lines.push(`👤 ${pickCandidateName(candidate)} (ID: ${candidate.id})`);
    lines.push(`   Email: ${pickCandidateEmail(candidate)}`);
    if (candidate.phone) lines.push(`   Phone: ${candidate.phone}`);
    lines.push(`   Status: ${pickCandidateStatus(candidate)}`);
    if (candidate.address) lines.push(`   Address: ${candidate.address}`);
    if (candidate.city) lines.push(`   City: ${candidate.city}`);
    if (candidate.country) lines.push(`   Country: ${candidate.country}`);
    return lines.join('\n');
  });

  const summary = `Found ${result.data.length} candidate(s) (Page ${result.pagination.page}/${Math.ceil(result.pagination.total / result.pagination.limit)} of ${result.pagination.total} total)`;

  return `${summary}\n\n${candidates.join('\n\n')}`;
}

/**
 * Format single candidate details
 */
function formatCandidate(candidate: Candidate): string {
  const lines: string[] = [];
  lines.push(`👤 Candidate: ${pickCandidateName(candidate)}`);
  lines.push(`ID: ${candidate.id}`);
  lines.push(`Email: ${pickCandidateEmail(candidate)}`);
  if (candidate.phone) lines.push(`Phone: ${candidate.phone}`);
  lines.push(`Status: ${pickCandidateStatus(candidate)}`);
  if (candidate.address) lines.push(`Address: ${candidate.address}`);
  if (candidate.city) lines.push(`City: ${candidate.city}`);
  if (candidate.country) lines.push(`Country: ${candidate.country}`);
  if (candidate.createdAt) lines.push(`Created: ${candidate.createdAt}`);
  if (candidate.updatedAt) lines.push(`Updated: ${candidate.updatedAt}`);

  return lines.join('\n');
}

export function registerCandidateTools(server: McpServer, client: BoondAPIClient): void {
  /**
   * boond_candidates_search - Search candidates
   */
  server.registerTool(
    'boond_candidates_search',
    {
      description: 'Search candidates by name, email, or other criteria',
      inputSchema: searchParamsSchema.shape,
      annotations: READ_TOOL_ANNOTATIONS,
    },
    async params => {
      try {
        const validated = searchParamsSchema.parse(params);
        const result = await client.searchCandidates(validated);
        const text = formatCandidateList(result);

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleSearchError(error, 'candidates');
      }
    }
  );

  /**
   * boond_candidates_get - Get candidate by ID
   */
  server.registerTool(
    'boond_candidates_get',
    {
      description: 'Get a candidate by ID',
      inputSchema: candidateIdSchema.shape,
      annotations: READ_TOOL_ANNOTATIONS,
    },
    async params => {
      try {
        const validated = candidateIdSchema.parse(params);
        const candidate = await client.getCandidate(validated.id);
        const text = formatCandidate(candidate);

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleToolError(error, 'retrieving', 'Candidate');
      }
    }
  );

  /**
   * boond_candidates_create - Create new candidate
   */
  server.registerTool(
    'boond_candidates_create',
    {
      description: 'Create a new candidate',
      inputSchema: createCandidateSchema.merge(dryRunSchema).shape,
      annotations: WRITE_TOOL_ANNOTATIONS,
    },
    async params => {
      try {
        const validated = createCandidateSchema.merge(dryRunSchema).parse(params);
        const { dryRun, ...data } = validated;
        if (dryRun) {
          return dryRunResponse('Create Candidate', data);
        }
        const candidate = await client.createCandidate(data);
        const text = formatCandidate(candidate);

        return {
          content: [
            {
              type: 'text',
              text: `Candidate created successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'creating', 'Candidate');
      }
    }
  );

  /**
   * boond_candidates_update - Update existing candidate
   */
  server.registerTool(
    'boond_candidates_update',
    {
      description: 'Update an existing candidate',
      inputSchema: updateCandidateWithIdSchema.merge(dryRunSchema).shape,
      annotations: WRITE_TOOL_ANNOTATIONS,
    },
    async params => {
      try {
        const validated = updateCandidateWithIdSchema.merge(dryRunSchema).parse(params);
        const { dryRun, id, ...updateData } = validated;
        if (dryRun) {
          return dryRunResponse('Update Candidate', { id, ...updateData });
        }

        if (!id) {
          throw new ValidationError('Candidate ID is required');
        }

        const candidate = await client.updateCandidate(id, updateData);
        const text = formatCandidate(candidate);

        return {
          content: [
            {
              type: 'text',
              text: `Candidate updated successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'updating', 'Candidate');
      }
    }
  );

  /**
   * boond_candidates_delete - Delete a candidate
   */
  server.registerTool(
    'boond_candidates_delete',
    {
      description: 'Delete a candidate by ID',
      inputSchema: candidateIdSchema.merge(dryRunSchema).shape,
      annotations: WRITE_TOOL_ANNOTATIONS,
    },
    async params => {
      try {
        const validated = candidateIdSchema.merge(dryRunSchema).parse(params);
        const { dryRun, ...rest } = validated;
        if (dryRun) {
          return dryRunResponse('Delete Candidate', { id: rest.id });
        }
        await client.deleteCandidate(rest.id);
        return {
          content: [
            {
              type: 'text',
              text: `Candidate ${rest.id} deleted successfully.`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'deleting', 'Candidate');
      }
    }
  );
}
