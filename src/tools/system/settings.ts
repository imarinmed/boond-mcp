import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { BoondAPIClient } from "../../api/client.js";
import { z } from "zod";
import {
  settingIdSchema,
  updateSettingWithIdSchema,
} from "../../types/schemas.js";
import type { Setting, SearchResponse } from "../../types/boond.js";
import { handleSearchError, handleToolError } from "../../utils/error-handling.js";

function formatSettingList(result: SearchResponse<Setting>): string {
  if (result.data.length === 0) {
    return "No settings found.";
  }

  const settings = result.data.map((setting) => {
    const lines: string[] = [];
    lines.push(`⚙️ ${setting.key} (ID: ${setting.id})`);
    if (setting.category) lines.push(`   Category: ${setting.category}`);
    lines.push(`   Value: ${JSON.stringify(setting.value)}`);
    return lines.join("\n");
  });

  const summary = `Found ${result.data.length} setting(s) (Page ${result.pagination.page}/${Math.ceil(result.pagination.total / result.pagination.limit)} of ${result.pagination.total} total)`;

  return `${summary}\n\n${settings.join("\n\n")}`;
}

function formatSetting(setting: Setting): string {
  const lines: string[] = [];
  lines.push(`⚙️ Setting: ${setting.key}`);
  lines.push(`ID: ${setting.id}`);
  if (setting.category) lines.push(`Category: ${setting.category}`);
  lines.push(`Value: ${JSON.stringify(setting.value)}`);
  if (setting.createdAt) lines.push(`Created: ${setting.createdAt}`);
  if (setting.updatedAt) lines.push(`Updated: ${setting.updatedAt}`);

  return lines.join("\n");
}

export function registerSettingTools(
  server: McpServer,
  client: BoondAPIClient
): void {
  server.registerTool(
    "boond_settings_search",
    {
      description: "Search all system settings",
      inputSchema: z.object({}).shape,
    },
    async () => {
      try {
        const result = await client.searchSettings();
        const text = formatSettingList(result);

        return {
          content: [{ type: "text", text }],
        };
      } catch (error) {
        return handleSearchError(error, "settings");
      }
    }
  );

  server.registerTool(
    "boond_settings_get",
    {
      description: "Get a setting by ID",
      inputSchema: settingIdSchema.shape,
    },
    async (params) => {
      try {
        const validated = settingIdSchema.parse(params);
        const result = await client.searchSettings();
        const setting = result.data.find((s) => s.id === validated.id);

        if (!setting) {
          return {
            content: [
              {
                type: "text",
                text: `Setting not found`,
              },
            ],
            isError: true,
          };
        }

        const text = formatSetting(setting);

        return {
          content: [{ type: "text", text }],
        };
      } catch (error) {
        return handleToolError(error, "retrieving", "Setting");
      }
    }
  );

  server.registerTool(
    "boond_settings_update",
    {
      description: "Update a setting by ID",
      inputSchema: updateSettingWithIdSchema.shape,
    },
    async (params) => {
      try {
        const validated = updateSettingWithIdSchema.parse(params);
        const { id, ...updateData } = validated;
        const setting = await client.updateSetting(id, updateData);
        const text = formatSetting(setting);

        return {
          content: [
            {
              type: "text",
              text: `Setting updated successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, "updating", "Setting");
      }
    }
  );
}
