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
      inputSchema: createCompanySchema.shape,
    },
    async params => {
      try {
        const validated = createCompanySchema.parse(params);
        const company = await client.createCompany(validated);
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
      inputSchema: updateCompanyWithIdSchema.shape,
    },
    async params => {
      try {
        const { id, ...updateData } = updateCompanyWithIdSchema.parse(params);
        const validated = updateCompanySchema.parse(updateData);
        const company = await client.updateCompany(id, validated);
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
      inputSchema: companyIdSchema.shape,
    },
    async params => {
      try {
        const validated = companyIdSchema.parse(params);
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
