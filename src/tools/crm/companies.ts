/**
 * Company tools registration
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { Company, SearchResponse } from '../../types/boond.js';
import {
  searchParamsSchema,
  createCompanySchema,
  updateCompanySchema,
  companyIdSchema,
  updateCompanyWithIdSchema,
} from '../../types/schemas.js';

import type { BoondAPIClient } from '../../api/client.js';
import { handleSearchError, handleToolError } from '../../utils/error-handling.js';
import { WRITE_TOOL_ANNOTATIONS, READ_TOOL_ANNOTATIONS } from '../../utils/tool-registry.js';
import { dryRunSchema, dryRunResponse } from '../../utils/dry-run.js';

/**
 * Format company list for display
 */
function formatCompanyList(result: SearchResponse<Company>): string {
  if (result.data.length === 0) {
    return 'No companies found.';
  }

  const companies = result.data.map(company => {
    const lines: string[] = [];
    lines.push(`🏢 ${company.name} (ID: ${company.id})`);
    if (company.type) lines.push(`   Type: ${company.type}`);
    if (company.address) lines.push(`   Address: ${company.address}`);
    if (company.city) lines.push(`   City: ${company.city}`);
    if (company.country) lines.push(`   Country: ${company.country}`);
    if (company.contacts && company.contacts.length > 0) {
      lines.push(`   Contacts: ${company.contacts.join(', ')}`);
    }
    return lines.join('\n');
  });

  const summary = `Found ${result.data.length} company(ies) (Page ${result.pagination.page}/${Math.ceil(result.pagination.total / result.pagination.limit)} of ${result.pagination.total} total)`;

  return `${summary}\n\n${companies.join('\n\n')}`;
}

/**
 * Format single company details
 */
function formatCompany(company: Company): string {
  const lines: string[] = [];
  lines.push(`🏢 Company: ${company.name}`);
  lines.push(`ID: ${company.id}`);
  if (company.type) lines.push(`Type: ${company.type}`);
  if (company.address) lines.push(`Address: ${company.address}`);
  if (company.city) lines.push(`City: ${company.city}`);
  if (company.country) lines.push(`Country: ${company.country}`);
  if (company.contacts && company.contacts.length > 0) {
    lines.push(`Contacts: ${company.contacts.join(', ')}`);
  }
  if (company.createdAt) lines.push(`Created: ${company.createdAt}`);
  if (company.updatedAt) lines.push(`Updated: ${company.updatedAt}`);

  return lines.join('\n');
}

export function registerCompanyTools(server: McpServer, client: BoondAPIClient): void {
  /**
   * boond_companies_search - Search companies
   */
  server.registerTool(
    'boond_companies_search',
    {
      description: 'Search companies by name or criteria',
      inputSchema: searchParamsSchema.shape,
      annotations: READ_TOOL_ANNOTATIONS,
    },
    async params => {
      try {
        const validated = searchParamsSchema.parse(params);
        const result = await client.searchCompanies(validated);
        const text = formatCompanyList(result);

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleSearchError(error, 'companies');
      }
    }
  );

  /**
   * boond_companies_get - Get company by ID
   */
  server.registerTool(
    'boond_companies_get',
    {
      description: 'Get a company by ID',
      inputSchema: companyIdSchema.shape,
      annotations: READ_TOOL_ANNOTATIONS,
    },
    async params => {
      try {
        const validated = companyIdSchema.parse(params);
        const company = await client.getCompany(validated.id);
        const text = formatCompany(company);

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleToolError(error, 'retrieving', 'Company');
      }
    }
  );

  /**
   * boond_companies_create - Create new company
   */
  server.registerTool(
    'boond_companies_create',
    {
      description: 'Create a new company',
      inputSchema: createCompanySchema.merge(dryRunSchema).shape,
      annotations: WRITE_TOOL_ANNOTATIONS,
    },
    async params => {
      try {
        const validated = createCompanySchema.merge(dryRunSchema).parse(params);
        const { dryRun, ...companyData } = validated;

        if (dryRun) {
          return dryRunResponse('Create Company', { company: companyData });
        }

        const company = await client.createCompany(companyData);
        const text = formatCompany(company);

        return {
          content: [
            {
              type: 'text',
              text: `Company created successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'creating', 'Company');
      }
    }
  );

  /**
   * boond_companies_update - Update an existing company
   */
  server.registerTool(
    'boond_companies_update',
    {
      description: 'Update an existing company',
      inputSchema: updateCompanyWithIdSchema.merge(dryRunSchema).shape,
      annotations: WRITE_TOOL_ANNOTATIONS,
    },
    async params => {
      try {
        const validated = updateCompanyWithIdSchema.merge(dryRunSchema).parse(params);
        const { dryRun, id, ...updateData } = validated;
        const parsedUpdateData = updateCompanySchema.parse(updateData);

        if (dryRun) {
          return dryRunResponse('Update Company', {
            id,
            updates: parsedUpdateData,
          });
        }

        const company = await client.updateCompany(id, parsedUpdateData);
        const text = formatCompany(company);

        return {
          content: [
            {
              type: 'text',
              text: `Company updated successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'updating', 'Company');
      }
    }
  );

  server.registerTool(
    'boond_companies_delete',
    {
      description: 'Delete a company by ID',
      inputSchema: companyIdSchema.merge(dryRunSchema).shape,
      annotations: WRITE_TOOL_ANNOTATIONS,
    },
    async params => {
      try {
        const validated = companyIdSchema.merge(dryRunSchema).parse(params);

        if (validated.dryRun) {
          return dryRunResponse('Delete Company', { id: validated.id });
        }

        await client.deleteCompany(validated.id);
        return {
          content: [
            {
              type: 'text',
              text: `Company ${validated.id} deleted successfully.`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'deleting', 'Company');
      }
    }
  );
}
