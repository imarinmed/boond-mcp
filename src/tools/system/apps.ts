import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { BoondAPIClient } from "../../api/client.js";
import { searchParamsSchema, appIdSchema } from "../../types/schemas.js";
import type { App, SearchResponse } from "../../types/boond.js";
import { handleSearchError, handleToolError } from "../../utils/error-handling.js";

function formatAppList(result: SearchResponse<App>): string {
  if (result.data.length === 0) {
    return "No apps found.";
  }

  const apps = result.data.map((app) => {
    const lines: string[] = [];
    lines.push(`📦 ${app.name} (ID: ${app.id})`);
    if (app.type) lines.push(`   Type: ${app.type}`);
    if (app.status) lines.push(`   Status: ${app.status}`);
    return lines.join("\n");
  });

  const summary = `Found ${result.data.length} app(s) (Page ${result.pagination.page}/${Math.ceil(result.pagination.total / result.pagination.limit)} of ${result.pagination.total} total)`;

  return `${summary}\n\n${apps.join("\n\n")}`;
}

function formatApp(app: App): string {
  const lines: string[] = [];
  lines.push(`📦 App: ${app.name}`);
  lines.push(`ID: ${app.id}`);
  if (app.type) lines.push(`Type: ${app.type}`);
  if (app.status) lines.push(`Status: ${app.status}`);
  if (app.createdAt) lines.push(`Created: ${app.createdAt}`);
  if (app.updatedAt) lines.push(`Updated: ${app.updatedAt}`);

  return lines.join("\n");
}

export function registerAppTools(
  server: McpServer,
  client: BoondAPIClient
): void {
  server.registerTool(
    "boond_apps_search",
    {
      description: "Search apps by name or criteria",
      inputSchema: searchParamsSchema.shape,
    },
    async (params) => {
      try {
        const validated = searchParamsSchema.parse(params);
        const result = await client.searchApps(validated);
        const text = formatAppList(result);

        return {
          content: [{ type: "text", text }],
        };
      } catch (error) {
        return handleSearchError(error, "apps");
      }
    }
  );

  server.registerTool(
    "boond_apps_get",
    {
      description: "Get an app by ID",
      inputSchema: appIdSchema.shape,
    },
    async (params) => {
      try {
        const validated = appIdSchema.parse(params);
        const app = await client.getApp(validated.id);
        const text = formatApp(app);

        return {
          content: [{ type: "text", text }],
        };
      } catch (error) {
        return handleToolError(error, "retrieving", "App");
      }
    }
  );

  server.registerTool(
    "boond_apps_install",
    {
      description: "Install an app by ID",
      inputSchema: appIdSchema.shape,
    },
    async (params) => {
      try {
        const validated = appIdSchema.parse(params);
        const app = await client.installApp(validated.id);
        const text = formatApp(app);

        return {
          content: [
            {
              type: "text",
              text: `App installed successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, "installing", "App");
      }
    }
  );

  server.registerTool(
    "boond_apps_uninstall",
    {
      description: "Uninstall an app by ID",
      inputSchema: appIdSchema.shape,
    },
    async (params) => {
      try {
        const validated = appIdSchema.parse(params);
        await client.uninstallApp(validated.id);

        return {
          content: [
            {
              type: "text",
              text: `App uninstalled successfully!`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, "uninstalling", "App");
      }
    }
  );
}
