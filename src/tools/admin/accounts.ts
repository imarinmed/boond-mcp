import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BoondAPIClient } from '../../api/client.js';
import {
  searchParamsSchema,
  accountIdSchema,
  createAccountSchema,
  updateAccountWithIdSchema,
} from '../../types/schemas.js';
import type { Account, SearchResponse } from '../../types/boond.js';
import { handleSearchError, handleToolError } from '../../utils/error-handling.js';
import { READ_TOOL_ANNOTATIONS, WRITE_TOOL_ANNOTATIONS } from '../../utils/tool-registry.js';
import { dryRunSchema, dryRunResponse } from '../../utils/dry-run.js';

function pickAccountLabel(account: Account): string {
  const record = account as unknown as Record<string, unknown>;
  const username =
    typeof account.username === 'string' && account.username.trim().length > 0
      ? account.username
      : undefined;
  const email =
    typeof account.email === 'string' && account.email.trim().length > 0
      ? account.email
      : undefined;
  const firstName = typeof record['firstName'] === 'string' ? (record['firstName'] as string) : '';
  const lastName = typeof record['lastName'] === 'string' ? (record['lastName'] as string) : '';
  const fullName = `${firstName} ${lastName}`.trim();

  return username || fullName || email || `Account #${account.id}`;
}

function pickAccountStatus(account: Account): string {
  const record = account as unknown as Record<string, unknown>;
  const candidates = [
    account.status,
    record['state'],
    record['workflowStatus'],
    record['activity'],
  ];
  for (const value of candidates) {
    if (typeof value === 'string' && value.trim().length > 0) return value;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return value ? 'active' : 'inactive';
  }
  return 'unknown';
}

function formatAccountList(result: SearchResponse<Account>): string {
  if (result.data.length === 0) {
    return 'No accounts found.';
  }

  const accounts = result.data.map(account => {
    const lines: string[] = [];
    lines.push(`👤 ${pickAccountLabel(account)} (ID: ${account.id})`);
    if (account.email) lines.push(`   Email: ${account.email}`);
    if (account.role) lines.push(`   Role: ${account.role}`);
    lines.push(`   Status: ${pickAccountStatus(account)}`);
    return lines.join('\n');
  });

  const summary = `Found ${result.data.length} account(s) (Page ${result.pagination.page}/${Math.ceil(result.pagination.total / result.pagination.limit)} of ${result.pagination.total} total)`;

  return `${summary}\n\n${accounts.join('\n\n')}`;
}

function formatAccount(account: Account): string {
  const lines: string[] = [];
  lines.push(`👤 Account: ${pickAccountLabel(account)}`);
  lines.push(`ID: ${account.id}`);
  if (account.email) lines.push(`Email: ${account.email}`);
  if (account.role) lines.push(`Role: ${account.role}`);
  lines.push(`Status: ${pickAccountStatus(account)}`);
  if (account.createdAt) lines.push(`Created: ${account.createdAt}`);
  if (account.updatedAt) lines.push(`Updated: ${account.updatedAt}`);

  return lines.join('\n');
}

export function registerAccountTools(server: McpServer, client: BoondAPIClient): void {
  server.registerTool(
    'boond_accounts_search',
    {
      description: 'Search accounts by username or criteria',
      annotations: READ_TOOL_ANNOTATIONS,
      inputSchema: searchParamsSchema.shape,
    },
    async params => {
      try {
        const validated = searchParamsSchema.parse(params);
        const result = await client.searchAccounts(validated);
        const text = formatAccountList(result);

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleSearchError(error, 'accounts');
      }
    }
  );

  server.registerTool(
    'boond_accounts_get',
    {
      description: 'Get an account by ID',
      annotations: READ_TOOL_ANNOTATIONS,
      inputSchema: accountIdSchema.shape,
    },
    async params => {
      try {
        const validated = accountIdSchema.parse(params);
        const account = await client.getAccount(validated.id);
        const text = formatAccount(account);

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleToolError(error, 'retrieving', 'Account');
      }
    }
  );

  server.registerTool(
    'boond_accounts_create',
    {
      description: 'Create a new account',
      annotations: WRITE_TOOL_ANNOTATIONS,
      inputSchema: createAccountSchema.merge(dryRunSchema).shape,
    },
    async params => {
      try {
        const validated = createAccountSchema.merge(dryRunSchema).parse(params);
        const { dryRun, ...data } = validated;
        if (dryRun) {
          return dryRunResponse('Create Account', data);
        }
        const account = await client.createAccount(data);
        const text = formatAccount(account);

        return {
          content: [
            {
              type: 'text',
              text: `Account created successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'creating', 'Account');
      }
    }
  );

  server.registerTool(
    'boond_accounts_update',
    {
      description: 'Update an existing account',
      annotations: WRITE_TOOL_ANNOTATIONS,
      inputSchema: updateAccountWithIdSchema.merge(dryRunSchema).shape,
    },
    async params => {
      try {
        const validated = updateAccountWithIdSchema.merge(dryRunSchema).parse(params);
        const { id, dryRun, ...updateData } = validated;
        if (dryRun) {
          return dryRunResponse('Update Account', { id, ...updateData });
        }
        const account = await client.updateAccount(id, updateData);
        const text = formatAccount(account);

        return {
          content: [
            {
              type: 'text',
              text: `Account updated successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'updating', 'Account');
      }
    }
  );
}
