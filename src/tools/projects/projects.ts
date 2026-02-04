import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { BoondAPIClient } from "../../api/client.js";
import { z } from "zod";
import { searchProjectsSchema, projectIdSchema } from "../../types/schemas.js";
import type { Project, SearchResponse } from "../../types/boond.js";
import { handleSearchError, handleToolError } from "../../utils/error-handling.js";

function formatProjectList(result: SearchResponse<Project>): string {
  if (result.data.length === 0) {
    return "No projects found.";
  }

  const projects = result.data.map((project) => {
    const lines: string[] = [];
    lines.push(`📋 ${project.name} (ID: ${project.id})`);
    lines.push(`   Status: ${project.status}`);
    lines.push(`   Company ID: ${project.companyId}`);
    if (project.startDate) lines.push(`   Start: ${project.startDate}`);
    if (project.endDate) lines.push(`   End: ${project.endDate}`);
    if (project.description) lines.push(`   Description: ${project.description}`);
    if (project.budget) lines.push(`   Budget: $${project.budget}`);
    return lines.join("\n");
  });

  const summary = `Found ${result.data.length} project(s) (Page ${result.pagination.page}/${Math.ceil(result.pagination.total / result.pagination.limit)} of ${result.pagination.total} total)`;

  return `${summary}\n\n${projects.join("\n\n")}`;
}

function formatProject(project: Project): string {
  const lines: string[] = [];
  lines.push(`📋 Project: ${project.name}`);
  lines.push(`ID: ${project.id}`);
  lines.push(`Status: ${project.status}`);
  lines.push(`Company ID: ${project.companyId}`);
  if (project.startDate) lines.push(`Start Date: ${project.startDate}`);
  if (project.endDate) lines.push(`End Date: ${project.endDate}`);
  if (project.description) lines.push(`Description: ${project.description}`);
  if (project.budget) lines.push(`Budget: $${project.budget}`);
  if (project.createdAt) lines.push(`Created: ${project.createdAt}`);
  if (project.updatedAt) lines.push(`Updated: ${project.updatedAt}`);

  return lines.join("\n");
}

export function registerProjectTools(
  server: McpServer,
  client: BoondAPIClient
): void {
  server.registerTool(
    "boond_projects_search",
    {
      description: "Search projects by criteria",
      inputSchema: {
        query: z.string().optional().describe("Search query"),
        page: z.number().int().min(1).default(1).describe("Page number"),
        limit: z.number().int().min(1).max(100).default(20).describe("Results per page"),
        status: z
          .enum(["planning", "active", "on-hold", "completed", "cancelled"])
          .optional()
          .describe("Filter by project status"),
        companyId: z.string().optional().describe("Filter by company ID"),
      },
    },
    async (input) => {
      try {
        const params = searchProjectsSchema.parse(input);
        const result = await client.searchProjects(params);
        return {
          content: [
            {
              type: "text",
              text: formatProjectList(result),
            },
          ],
        };
      } catch (error) {
        return handleSearchError(error, "projects");
      }
    }
  );

  server.registerTool(
    "boond_projects_get",
    {
      description: "Get a project by ID",
      inputSchema: {
        id: z.string().min(1, "Project ID is required").describe("Project ID"),
      },
    },
    async (input) => {
      try {
        const params = projectIdSchema.parse(input);
        const project = await client.getProject(params.id);
        return {
          content: [
            {
              type: "text",
              text: formatProject(project),
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, "retrieving", "Project");
      }
    }
  );
}
