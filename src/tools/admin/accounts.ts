import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { BoondAPIClient } from "../../api/client.js";
import {
  searchParamsSchema,
  accountIdSchema,
  createAccountSchema,
  updateAccountWithIdSchema,
} from "../../types/schemas.js";
import type { Account, SearchResponse } from "../../types/boond.js";
import { handleSearchError, handleToolError } from "../../utils/error-handling.js";

function formatAccountList(result: SearchResponse<Account>): string {
  if (result.data.length === 0) {
    return "No accounts found.";
  }

  const accounts = result.data.map((account) => {
    const lines: string[] = [];
    lines.push(`👤 ${account.username} (ID: ${account.id})`);
    if (account.email) lines.push(`   Email: ${account.email}`);
    if (account.role) lines.push(`   Role: ${account.role}`);
    if (account.status) lines.push(`   Status: ${account.status}`);
    return lines.join("\n");
  });

  const summary = `Found ${result.data.length} account(s) (Page ${result.pagination.page}/${Math.ceil(result.pagination.total / result.pagination.limit)} of ${result.pagination.total} total)`;

  return `${summary}\n\n${accounts.join("\n\n")}`;
}

function formatAccount(account: Account): string {
  const lines: string[] = [];
  lines.push(`👤 Account: ${account.username}`);
  lines.push(`ID: ${account.id}`);
  if (account.email) lines.push(`Email: ${account.email}`);
  if (account.role) lines.push(`Role: ${account.role}`);
  if (account.status) lines.push(`Status: ${account.status}`);
  if (account.createdAt) lines.push(`Created: ${account.createdAt}`);
  if (account.updatedAt) lines.push(`Updated: ${account.updatedAt}`);

  return lines.join("\n");
}

export function registerAccountTools(
  server: McpServer,
  client: BoondAPIClient
): void {
  server.registerTool(
    "boond_accounts_search",
    {
      description: "Search accounts by username or criteria",
      inputSchema: searchParamsSchema.shape,
    },
    async (params) => {
      try {
        const validated = searchParamsSchema.parse(params);
        const result = await client.searchAccounts(validated);
        const text = formatAccountList(result);

        return {
          content: [{ type: "text", text }],
        };
      } catch (error) {
        return handleSearchError(error, "accounts");
      }
    }
  );

  server.registerTool(
    "boond_accounts_get",
    {
      description: "Get an account by ID",
      inputSchema: accountIdSchema.shape,
    },
    async (params) => {
      try {
        const validated = accountIdSchema.parse(params);
        const account = await client.getAccount(validated.id);
        const text = formatAccount(account);

        return {
          content: [{ type: "text", text }],
        };
      } catch (error) {
        return handleToolError(error, "retrieving", "Account");
      }
    }
  );

  server.registerTool(
    "boond_accounts_create",
    {
      description: "Create a new account",
      inputSchema: createAccountSchema.shape,
    },
    async (params) => {
      try {
        const validated = createAccountSchema.parse(params);
        const account = await client.createAccount(validated);
        const text = formatAccount(account);

        return {
          content: [
            {
              type: "text",
              text: `Account created successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, "creating", "Account");
      }
    }
  );

  server.registerTool(
    "boond_accounts_update",
    {
      description: "Update an existing account",
      inputSchema: updateAccountWithIdSchema.shape,
    },
    async (params) => {
      try {
        const validated = updateAccountWithIdSchema.parse(params);
        const { id, ...updateData } = validated;
        const account = await client.updateAccount(id, updateData);
        const text = formatAccount(account);

        return {
          content: [
            {
              type: "text",
              text: `Account updated successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, "updating", "Account");
      }
    }
  );
}
