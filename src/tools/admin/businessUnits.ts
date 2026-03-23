import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BoondAPIClient } from '../../api/client.js';
import {
  searchParamsSchema,
  businessUnitIdSchema,
  createBusinessUnitSchema,
  updateBusinessUnitWithIdSchema,
} from '../../types/schemas.js';
import type { BusinessUnit, SearchResponse } from '../../types/boond.js';
import { handleSearchError, handleToolError } from '../../utils/error-handling.js';
import { READ_TOOL_ANNOTATIONS, WRITE_TOOL_ANNOTATIONS } from '../../utils/tool-registry.js';
import { dryRunSchema, dryRunResponse } from '../../utils/dry-run.js';

function formatBusinessUnitList(result: SearchResponse<BusinessUnit>): string {
  if (result.data.length === 0) {
    return 'No business units found.';
  }

  const units = result.data.map(unit => {
    const lines: string[] = [];
    lines.push(`🏢 ${unit.name} (ID: ${unit.id})`);
    if (unit.parentId) lines.push(`   Parent: ${unit.parentId}`);
    if (unit.managerId) lines.push(`   Manager: ${unit.managerId}`);
    return lines.join('\n');
  });

  const summary = `Found ${result.data.length} business unit(s) (Page ${result.pagination.page}/${Math.ceil(result.pagination.total / result.pagination.limit)} of ${result.pagination.total} total)`;

  return `${summary}\n\n${units.join('\n\n')}`;
}

function formatBusinessUnit(unit: BusinessUnit): string {
  const lines: string[] = [];
  lines.push(`🏢 Business Unit: ${unit.name}`);
  lines.push(`ID: ${unit.id}`);
  if (unit.parentId) lines.push(`Parent ID: ${unit.parentId}`);
  if (unit.managerId) lines.push(`Manager ID: ${unit.managerId}`);
  if (unit.createdAt) lines.push(`Created: ${unit.createdAt}`);
  if (unit.updatedAt) lines.push(`Updated: ${unit.updatedAt}`);

  return lines.join('\n');
}

export function registerBusinessUnitTools(server: McpServer, client: BoondAPIClient): void {
  server.registerTool(
    'boond_businessunits_search',
    {
      description: 'Search business units by name or criteria',
      annotations: READ_TOOL_ANNOTATIONS,
      inputSchema: searchParamsSchema.shape,
    },
    async params => {
      try {
        const validated = searchParamsSchema.parse(params);
        const result = await client.searchBusinessUnits(validated);
        const text = formatBusinessUnitList(result);

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleSearchError(error, 'business units');
      }
    }
  );

  server.registerTool(
    'boond_businessunits_get',
    {
      description: 'Get a business unit by ID',
      annotations: READ_TOOL_ANNOTATIONS,
      inputSchema: businessUnitIdSchema.shape,
    },
    async params => {
      try {
        const validated = businessUnitIdSchema.parse(params);
        const unit = await client.getBusinessUnit(validated.id);
        const text = formatBusinessUnit(unit);

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleToolError(error, 'retrieving', 'Business unit');
      }
    }
  );

  server.registerTool(
    'boond_businessunits_create',
    {
      description: 'Create a new business unit',
      annotations: WRITE_TOOL_ANNOTATIONS,
      inputSchema: createBusinessUnitSchema.merge(dryRunSchema).shape,
    },
    async params => {
      try {
        const validated = createBusinessUnitSchema.merge(dryRunSchema).parse(params);
        const { dryRun, ...data } = validated;
        if (dryRun) {
          return dryRunResponse('Create Business Unit', data);
        }
        const unit = await client.createBusinessUnit(data);
        const text = formatBusinessUnit(unit);

        return {
          content: [
            {
              type: 'text',
              text: `Business unit created successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'creating', 'Business unit');
      }
    }
  );

  server.registerTool(
    'boond_businessunits_update',
    {
      description: 'Update an existing business unit',
      annotations: WRITE_TOOL_ANNOTATIONS,
      inputSchema: updateBusinessUnitWithIdSchema.merge(dryRunSchema).shape,
    },
    async params => {
      try {
        const validated = updateBusinessUnitWithIdSchema.merge(dryRunSchema).parse(params);
        const { id, dryRun, ...updateData } = validated;
        if (dryRun) {
          return dryRunResponse('Update Business Unit', { id, ...updateData });
        }
        const unit = await client.updateBusinessUnit(id, updateData);
        const text = formatBusinessUnit(unit);

        return {
          content: [
            {
              type: 'text',
              text: `Business unit updated successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'updating', 'Business unit');
      }
    }
  );
}
