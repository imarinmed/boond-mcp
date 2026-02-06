import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BoondAPIClient } from '../../api/client.js';
import { z } from 'zod';
import { handleSearchError } from '../../utils/error-handling.js';

const facetedSearchSchema = z.object({
  entity: z.enum(['candidates', 'companies', 'contacts', 'resources', 'projects', 'opportunities']),
  query: z.string().optional(),
  status: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

export function registerFacetedSearchTool(server: McpServer, client: BoondAPIClient): void {
  server.registerTool(
    'boond_faceted_search',
    {
      description: 'Perform faceted search with filter criteria on specific entity type',
      inputSchema: facetedSearchSchema.shape,
    },
    async params => {
      try {
        const validated = facetedSearchSchema.parse(params);
        const { entity, query, status, page, limit } = validated;

        const baseParams = { query: query || '', page, limit };
        const searchParams = status
          ? {
              ...baseParams,
              status: status as 'active' | 'planning' | 'on-hold' | 'completed' | 'cancelled',
            }
          : baseParams;

        let resultCount = 0;
        const lines: string[] = [];
        lines.push(`🔍 Faceted Search: ${entity}`);
        if (query) lines.push(`Query: "${query}"`);
        if (status) lines.push(`Status: ${status}`);
        lines.push(`Page: ${page}, Limit: ${limit}`);
        lines.push('');

        switch (entity) {
          case 'candidates': {
            const results = await client.searchCandidates(searchParams);
            resultCount = results.data.length;
            lines.push(`Found ${resultCount} candidates`);
            for (const c of results.data) {
              lines.push(`  • ${c.firstName} ${c.lastName} (ID: ${c.id})`);
              lines.push(`    Email: ${c.email}, Status: ${c.status}`);
            }
            break;
          }
          case 'companies': {
            const results = await client.searchCompanies(searchParams);
            resultCount = results.data.length;
            lines.push(`Found ${resultCount} companies`);
            for (const c of results.data) {
              lines.push(`  • ${c.name} (ID: ${c.id})`);
              if (c.type) lines.push(`    Type: ${c.type}`);
            }
            break;
          }
          case 'contacts': {
            const results = await client.searchContacts(searchParams);
            resultCount = results.data.length;
            lines.push(`Found ${resultCount} contacts`);
            for (const c of results.data) {
              lines.push(`  • ${c.firstName} ${c.lastName} (ID: ${c.id})`);
              lines.push(`    Email: ${c.email}`);
            }
            break;
          }
          case 'resources': {
            const results = await client.searchResources(searchParams);
            resultCount = results.data.length;
            lines.push(`Found ${resultCount} resources`);
            for (const r of results.data) {
              lines.push(`  • ${r.firstName} ${r.lastName} (ID: ${r.id})`);
              lines.push(`    Email: ${r.email}, Status: ${r.status}`);
            }
            break;
          }
          case 'projects': {
            const results = await client.searchProjects(searchParams);
            resultCount = results.data.length;
            lines.push(`Found ${resultCount} projects`);
            for (const p of results.data) {
              lines.push(`  • ${p.name} (ID: ${p.id})`);
              lines.push(`    Status: ${p.status}`);
            }
            break;
          }
          case 'opportunities': {
            const results = await client.searchOpportunities(searchParams);
            resultCount = results.data.length;
            lines.push(`Found ${resultCount} opportunities`);
            for (const o of results.data) {
              lines.push(`  • ${o.name} (ID: ${o.id})`);
              lines.push(`    Status: ${o.status}, Value: ${o.value || 'N/A'}`);
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
        return handleSearchError(error, 'faceted search');
      }
    }
  );
}
