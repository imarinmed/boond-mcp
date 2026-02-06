import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BoondAPIClient } from '../../api/client.js';
import { z } from 'zod';
import { handleSearchError } from '../../utils/error-handling.js';

const fullTextSearchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  entities: z
    .array(
      z.enum(['candidates', 'companies', 'contacts', 'resources', 'projects', 'opportunities'])
    )
    .optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(20).default(10),
});

export function registerFullTextSearchTool(server: McpServer, client: BoondAPIClient): void {
  server.registerTool(
    'boond_fulltext_search',
    {
      description: 'Perform full-text search across multiple entity types',
      inputSchema: fullTextSearchSchema.shape,
    },
    async params => {
      try {
        const validated = fullTextSearchSchema.parse(params);
        const { query, entities, limit } = validated;

        const targetEntities = entities || [
          'candidates',
          'companies',
          'contacts',
          'resources',
          'projects',
          'opportunities',
        ];

        const results: Array<{
          entity: string;
          data: Array<{ id: string; name: string; type: string; details: string }>;
        }> = [];

        if (targetEntities.includes('candidates')) {
          try {
            const candidateResults = await client.searchCandidates({
              query,
              page: 1,
              limit: Math.min(limit, 5),
            });
            if (candidateResults.data.length > 0) {
              results.push({
                entity: 'Candidates',
                data: candidateResults.data.map(c => ({
                  id: c.id,
                  name: `${c.firstName} ${c.lastName}`,
                  type: 'Candidate',
                  details: c.email,
                })),
              });
            }
          } catch {
            // Ignore individual search errors
          }
        }

        if (targetEntities.includes('companies')) {
          try {
            const companyResults = await client.searchCompanies({
              query,
              page: 1,
              limit: Math.min(limit, 5),
            });
            if (companyResults.data.length > 0) {
              results.push({
                entity: 'Companies',
                data: companyResults.data.map(c => ({
                  id: c.id,
                  name: c.name,
                  type: 'Company',
                  details: c.type || '',
                })),
              });
            }
          } catch {
            // Ignore individual search errors
          }
        }

        if (targetEntities.includes('contacts')) {
          try {
            const contactResults = await client.searchContacts({
              query,
              page: 1,
              limit: Math.min(limit, 5),
            });
            if (contactResults.data.length > 0) {
              results.push({
                entity: 'Contacts',
                data: contactResults.data.map(c => ({
                  id: c.id,
                  name: `${c.firstName} ${c.lastName}`,
                  type: 'Contact',
                  details: c.email,
                })),
              });
            }
          } catch {
            // Ignore individual search errors
          }
        }

        if (targetEntities.includes('resources')) {
          try {
            const resourceResults = await client.searchResources({
              query,
              page: 1,
              limit: Math.min(limit, 5),
            });
            if (resourceResults.data.length > 0) {
              results.push({
                entity: 'Resources',
                data: resourceResults.data.map(r => ({
                  id: r.id,
                  name: `${r.firstName} ${r.lastName}`,
                  type: 'Resource',
                  details: r.email,
                })),
              });
            }
          } catch {
            // Ignore individual search errors
          }
        }

        if (targetEntities.includes('projects')) {
          try {
            const projectResults = await client.searchProjects({
              query,
              page: 1,
              limit: Math.min(limit, 5),
            });
            if (projectResults.data.length > 0) {
              results.push({
                entity: 'Projects',
                data: projectResults.data.map(p => ({
                  id: p.id,
                  name: p.name,
                  type: 'Project',
                  details: p.status,
                })),
              });
            }
          } catch {
            // Ignore individual search errors
          }
        }

        if (targetEntities.includes('opportunities')) {
          try {
            const opportunityResults = await client.searchOpportunities({
              query,
              page: 1,
              limit: Math.min(limit, 5),
            });
            if (opportunityResults.data.length > 0) {
              results.push({
                entity: 'Opportunities',
                data: opportunityResults.data.map(o => ({
                  id: o.id,
                  name: o.name,
                  type: 'Opportunity',
                  details: o.value ? `Value: ${o.value}` : '',
                })),
              });
            }
          } catch {
            // Ignore individual search errors
          }
        }

        if (results.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `No results found for "${query}" across ${targetEntities.join(', ')}.`,
              },
            ],
          };
        }

        const lines: string[] = [];
        lines.push(`🔍 Full-Text Search Results for "${query}"`);
        lines.push(`Searched: ${targetEntities.join(', ')}`);
        lines.push('');

        let totalResults = 0;
        for (const result of results) {
          lines.push(`## ${result.entity} (${result.data.length})`);
          for (const item of result.data.slice(0, limit)) {
            lines.push(`  • ${item.name} (${item.type})`);
            lines.push(`    ID: ${item.id}`);
            if (item.details) {
              lines.push(`    ${item.details}`);
            }
          }
          lines.push('');
          totalResults += result.data.length;
        }

        lines.push(`---`);
        lines.push(`Total results: ${totalResults}`);

        return {
          content: [
            {
              type: 'text',
              text: lines.join('\n'),
            },
          ],
        };
      } catch (error) {
        return handleSearchError(error, 'full-text search');
      }
    }
  );
}
