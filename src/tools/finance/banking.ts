/**
 * Banking tools registration
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { BoondAPIClient } from "../../api/client.js";
import {
  searchParamsSchema,
  bankingAccountIdSchema,
} from "../../types/schemas.js";
import { z } from "zod";
import type { BankingAccount, BankingTransaction, SearchResponse } from "../../types/boond.js";
import { handleSearchError, handleToolError } from "../../utils/error-handling.js";

/**
 * Format banking account list for display
 */
function formatBankingAccountList(result: SearchResponse<BankingAccount>): string {
  if (result.data.length === 0) {
    return "No banking accounts found.";
  }

  const accounts = result.data.map((account) => {
    const lines: string[] = [];
    lines.push(`🏦 Account #${account.id}`);
    lines.push(`   Name: ${account.name}`);
    if (account.bankName) lines.push(`   Bank: ${account.bankName}`);
    if (account.accountNumber) lines.push(`   Account Number: ${account.accountNumber}`);
    if (account.balance !== undefined) lines.push(`   Balance: ${account.balance}`);
    if (account.currency) lines.push(`   Currency: ${account.currency}`);
    return lines.join("\n");
  });

  const summary = `Found ${result.data.length} banking account(s)`;

  return `${summary}\n\n${accounts.join("\n\n")}`;
}

/**
 * Format single banking account details
 */
function formatBankingAccount(account: BankingAccount): string {
  const lines: string[] = [];
  lines.push(`🏦 Banking Account: ${account.id}`);
  lines.push(`Name: ${account.name}`);
  if (account.bankName) lines.push(`Bank Name: ${account.bankName}`);
  if (account.accountNumber) lines.push(`Account Number: ${account.accountNumber}`);
  if (account.balance !== undefined) lines.push(`Balance: ${account.balance}`);
  if (account.currency) lines.push(`Currency: ${account.currency}`);
  if (account.createdAt) lines.push(`Created: ${account.createdAt}`);
  if (account.updatedAt) lines.push(`Updated: ${account.updatedAt}`);

  return lines.join("\n");
}

/**
 * Format banking transaction list for display
 */
function formatBankingTransactionList(result: SearchResponse<BankingTransaction>): string {
  if (result.data.length === 0) {
    return "No transactions found.";
  }

  const transactions = result.data.map((transaction) => {
    const lines: string[] = [];
    lines.push(`💳 Transaction #${transaction.id}`);
    if (transaction.date) lines.push(`   Date: ${transaction.date}`);
    if (transaction.description) lines.push(`   Description: ${transaction.description}`);
    if (transaction.amount !== undefined) lines.push(`   Amount: ${transaction.amount}`);
    if (transaction.type) lines.push(`   Type: ${transaction.type}`);
    return lines.join("\n");
  });

  const summary = `Found ${result.data.length} transaction(s) (Page ${result.pagination.page}/${Math.ceil(result.pagination.total / result.pagination.limit)} of ${result.pagination.total} total)`;

  return `${summary}\n\n${transactions.join("\n\n")}`;
}

export function registerBankingTools(
  server: McpServer,
  client: BoondAPIClient
): void {
  /**
   * boond_banking_accounts_search - Search banking accounts
   */
  server.registerTool(
    "boond_banking_accounts_search",
    {
      description: "Search banking accounts",
      inputSchema: z.object({}).shape,
    },
    async () => {
      try {
        const result = await client.searchBankingAccounts();
        const text = formatBankingAccountList(result);

        return {
          content: [{ type: "text", text }],
        };
      } catch (error) {
        return handleSearchError(error, "banking accounts");
      }
    }
  );

  /**
   * boond_banking_accounts_get - Get banking account by ID
   */
  server.registerTool(
    "boond_banking_accounts_get",
    {
      description: "Get a banking account by ID",
      inputSchema: bankingAccountIdSchema.shape,
    },
    async (params) => {
      try {
        const validated = bankingAccountIdSchema.parse(params);
        const account = await client.getBankingAccount(validated.id);
        const text = formatBankingAccount(account);

        return {
          content: [{ type: "text", text }],
        };
      } catch (error) {
        return handleToolError(error, "retrieving", "Banking account");
      }
    }
  );

  /**
   * boond_banking_transactions_search - Search banking transactions
   */
  server.registerTool(
    "boond_banking_transactions_search",
    {
      description: "Search banking transactions for a specific account",
      inputSchema: z.object({
        accountId: z.string().min(1, "Banking account ID is required"),
        ...searchParamsSchema.partial().shape,
      }).shape,
    },
    async (params) => {
      try {
        const { accountId, ...searchParams } = params as {
          accountId: string;
          [key: string]: unknown;
        };

        if (!accountId) {
          return {
            content: [
              {
                type: "text",
                text: `Error: Banking account ID is required`,
              },
            ],
            isError: true,
          };
        }

        const validated = searchParamsSchema.partial().parse(searchParams);
        const result = await client.searchBankingTransactions(accountId, {
          query: validated.query,
          page: validated.page || 1,
          limit: validated.limit || 10,
        });
        const text = formatBankingTransactionList(result);

        return {
          content: [{ type: "text", text }],
        };
      } catch (error) {
        return handleSearchError(error, "banking transactions");
      }
    }
  );
}
