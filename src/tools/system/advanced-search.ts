import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BoondAPIClient } from '../../api/client.js';
import { z } from 'zod';
import { handleSearchError } from '../../utils/error-handling.js';

const advancedSearchSchema = z.object({
  entity: z.enum(['candidates', 'companies', 'contacts', 'resources', 'projects']),
  field: z.enum(['email', 'phone', 'city', 'country', 'status', 'type']),
  value: z.string().min(1, 'Search value is required'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

export function registerAdvancedSearchTool(server: McpServer, client: BoondAPIClient): void {
  server.registerTool(
    'boond_advanced_search',
    {
      description:
        'Search entities by specific field values (email, phone, city, country, status, type)',
      inputSchema: advancedSearchSchema.shape,
    },
    async params => {
      try {
        const validated = advancedSearchSchema.parse(params);
        const { entity, field, value, page, limit } = validated;

        const lines: string[] = [];
        lines.push(`🔎 Advanced Search: ${entity}`);
        lines.push(`Field: ${field} = "${value}"`);
        lines.push('');

        const searchQuery = `${field}:${value}`;

        switch (entity) {
          case 'candidates': {
            const results = await client.searchCandidates({
              query: searchQuery,
              page,
              limit,
            });
            lines.push(`Found ${results.data.length} candidates`);
            for (const c of results.data) {
              const fieldValue = c[field as keyof typeof c];
              lines.push(`  • ${c.firstName} ${c.lastName} (ID: ${c.id})`);
              lines.push(`    ${field}: ${fieldValue || 'N/A'}`);
            }
            break;
          }
          case 'companies': {
            const results = await client.searchCompanies({
              query: searchQuery,
              page,
              limit,
            });
            lines.push(`Found ${results.data.length} companies`);
            for (const c of results.data) {
              const fieldValue = c[field as keyof typeof c];
              lines.push(`  • ${c.name} (ID: ${c.id})`);
              lines.push(`    ${field}: ${fieldValue || 'N/A'}`);
            }
            break;
          }
          case 'contacts': {
            const results = await client.searchContacts({
              query: searchQuery,
              page,
              limit,
            });
            lines.push(`Found ${results.data.length} contacts`);
            for (const c of results.data) {
              const fieldValue = c[field as keyof typeof c];
              lines.push(`  • ${c.firstName} ${c.lastName} (ID: ${c.id})`);
              lines.push(`    ${field}: ${fieldValue || 'N/A'}`);
            }
            break;
          }
          case 'resources': {
            const results = await client.searchResources({
              query: searchQuery,
              page,
              limit,
            });
            lines.push(`Found ${results.data.length} resources`);
            for (const r of results.data) {
              const fieldValue = r[field as keyof typeof r];
              lines.push(`  • ${r.firstName} ${r.lastName} (ID: ${r.id})`);
              lines.push(`    ${field}: ${fieldValue || 'N/A'}`);
            }
            break;
          }
          case 'projects': {
            const results = await client.searchProjects({
              query: searchQuery,
              page,
              limit,
            });
            lines.push(`Found ${results.data.length} projects`);
            for (const p of results.data) {
              const fieldValue = p[field as keyof typeof p];
              lines.push(`  • ${p.name} (ID: ${p.id})`);
              lines.push(`    ${field}: ${fieldValue || 'N/A'}`);
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
        return handleSearchError(error, 'advanced search');
      }
    }
  );
}
