import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { BoondAPIClient } from "../../api/client.js";
import { z } from "zod";
import { handleToolError } from "../../utils/error-handling.js";

const dictionaryParamsSchema = z.object({
  language: z
    .enum(["fr", "en", "es"])
    .optional()
    .describe("Language for dictionary values (fr, en, or es)"),
  mergeAllLanguages: z
    .boolean()
    .optional()
    .describe("When true, merges values from all languages"),
});

export function registerDictionaryTools(
  server: McpServer,
  client: BoondAPIClient
): void {
  server.registerTool(
    "boond_dictionary_get",
    {
      description:
        "Get the application dictionary containing all configurable lookup values " +
        "(action types, countries, currencies, statuses, etc.). " +
        "Returns data.setting with all dictionary categories.",
      inputSchema: dictionaryParamsSchema.shape,
    },
    async (params) => {
      try {
        const validated = dictionaryParamsSchema.parse(params);
        const clientParams: { language?: 'fr' | 'en' | 'es'; mergeAllLanguages?: boolean } = {};
        if (validated.language) {
          clientParams.language = validated.language;
        }
        if (validated.mergeAllLanguages !== undefined) {
          clientParams.mergeAllLanguages = validated.mergeAllLanguages;
        }
        const result = await client.getDictionary(clientParams);

        const settingKeys = Object.keys(result.data?.setting ?? {});
        const summary = `Dictionary loaded: ${settingKeys.length} categories available`;
        const categories = settingKeys.length > 0
          ? `\nCategories: ${settingKeys.join(", ")}`
          : "";

        const text = `${summary}${categories}\n\n${JSON.stringify(result.data.setting, null, 2)}`;

        return {
          content: [{ type: "text", text }],
        };
      } catch (error) {
        return handleToolError(error, "retrieving", "Dictionary");
      }
    }
  );
}
