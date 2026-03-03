import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BoondAPIClient } from '../../api/client.js';
import { ApiError } from '../../api/client.js';
import { z } from 'zod';
import { handleSearchError } from '../../utils/error-handling.js';

const capabilitiesProbeSchema = z.object({
  limit: z.number().int().min(1).max(5).default(1),
});

type ProbeStatus =
  | 'ok'
  | 'forbidden'
  | 'not_available'
  | 'method_mismatch'
  | 'validation'
  | 'auth_error'
  | 'input_required'
  | 'error';

interface ProbeResult {
  probe: string;
  status: ProbeStatus;
  details: string;
}

function classifyError(error: unknown): { status: ProbeStatus; details: string } {
  if (error instanceof ApiError) {
    if (error.statusCode === 401) {
      return { status: 'auth_error', details: error.message };
    }
    if (error.statusCode === 403) {
      return { status: 'forbidden', details: error.message };
    }
    if (error.statusCode === 404) {
      return { status: 'not_available', details: error.message };
    }
    if (error.statusCode === 405) {
      return { status: 'method_mismatch', details: error.message };
    }
    if (error.statusCode === 422) {
      return { status: 'validation', details: error.message };
    }
    return { status: 'error', details: `${error.code}: ${error.message}` };
  }

  if (error instanceof Error) {
    return { status: 'error', details: error.message };
  }

  return { status: 'error', details: String(error) };
}

function currentMonthRange(): { startDate: string; endDate: string } {
  const today = new Date();
  const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0));

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

async function runProbe(name: string, fn: () => Promise<unknown>): Promise<ProbeResult> {
  try {
    await fn();
    return { probe: name, status: 'ok', details: 'access granted' };
  } catch (error) {
    const classified = classifyError(error);
    return {
      probe: name,
      status: classified.status,
      details: classified.details,
    };
  }
}

export function registerCapabilitiesProbeTool(server: McpServer, client: BoondAPIClient): void {
  server.registerTool(
    'boond_capabilities_probe',
    {
      description:
        'Probe effective Boond API capabilities/scopes by testing representative read endpoints and classifying outcomes (ok/forbidden/not_available/method_mismatch/validation)',
      inputSchema: capabilitiesProbeSchema.shape,
    },
    async params => {
      try {
        const { limit } = capabilitiesProbeSchema.parse(params);
        const { startDate, endDate } = currentMonthRange();
        const expenseProbeArgs = {
          page: 1,
          limit,
          startDate,
          endDate,
        } as { page: number; limit: number; startDate: string; endDate: string };

        const results: ProbeResult[] = [];

        results.push(
          await runProbe('resources_search', () => client.searchResources({ page: 1, limit }))
        );
        results.push(
          await runProbe('projects_search', () => client.searchProjects({ page: 1, limit }))
        );
        results.push(
          await runProbe('deliveries_search', () => client.searchDeliveries({ page: 1, limit }))
        );
        results.push(
          await runProbe('timereports_search', () => client.searchTimeReports({ page: 1, limit }))
        );
        results.push(
          await runProbe('expenses_search', () => client.searchExpenseReports(expenseProbeArgs))
        );
        results.push(
          await runProbe('contracts_search', () => client.searchContracts({ page: 1, limit }))
        );
        results.push(
          await runProbe('documents_search', () => client.searchDocuments({ page: 1, limit }))
        );
        results.push(
          await runProbe('quotations_search', () => client.searchQuotations({ page: 1, limit }))
        );
        results.push(await runProbe('settings_search', () => client.searchSettings()));
        results.push(await runProbe('apps_search', () => client.searchApps({ page: 1, limit })));
        results.push(
          await runProbe('alerts_search', () => client.searchAlerts({ page: 1, limit }))
        );
        results.push(
          await runProbe('accounts_search', () => client.searchAccounts({ page: 1, limit }))
        );

        const bankingAccountsResult = await runProbe('banking_accounts_search', () =>
          client.searchBankingAccounts()
        );
        results.push(bankingAccountsResult);

        if (bankingAccountsResult.status === 'ok') {
          try {
            const bankingAccounts = await client.searchBankingAccounts();
            const bankingAccountId = bankingAccounts.data[0]?.id;

            if (!bankingAccountId) {
              results.push({
                probe: 'banking_transactions_search',
                status: 'input_required',
                details: 'No banking account id found from banking_accounts_search',
              });
            } else {
              results.push(
                await runProbe('banking_transactions_search', () =>
                  client.searchBankingTransactions(bankingAccountId, {
                    page: 1,
                    limit,
                  })
                )
              );
            }
          } catch (error) {
            const classified = classifyError(error);
            results.push({
              probe: 'banking_transactions_search',
              status: classified.status,
              details: classified.details,
            });
          }
        } else {
          results.push({
            probe: 'banking_transactions_search',
            status: 'input_required',
            details: 'Skipped because banking_accounts_search is not accessible',
          });
        }

        const counts = {
          ok: results.filter(r => r.status === 'ok').length,
          forbidden: results.filter(r => r.status === 'forbidden').length,
          notAvailable: results.filter(r => r.status === 'not_available').length,
          methodMismatch: results.filter(r => r.status === 'method_mismatch').length,
          validation: results.filter(r => r.status === 'validation').length,
          authError: results.filter(r => r.status === 'auth_error').length,
          inputRequired: results.filter(r => r.status === 'input_required').length,
          error: results.filter(r => r.status === 'error').length,
          total: results.length,
        };

        const lines: string[] = [];
        lines.push('🛡️ Boond API Capabilities Probe');
        lines.push('');
        lines.push(
          `Summary: OK=${counts.ok} | Forbidden=${counts.forbidden} | NotAvailable=${counts.notAvailable} | MethodMismatch=${counts.methodMismatch} | Validation=${counts.validation} | Auth=${counts.authError} | InputRequired=${counts.inputRequired} | Error=${counts.error}`
        );
        lines.push(`Total probes: ${counts.total}`);
        lines.push('');
        lines.push('Details:');

        for (const result of results) {
          lines.push(`- ${result.probe}: ${result.status}`);
          lines.push(`  ${result.details}`);
        }

        lines.push('');
        lines.push('JSON:');
        lines.push(
          JSON.stringify(
            {
              summary: counts,
              results,
            },
            null,
            2
          )
        );

        return {
          content: [
            {
              type: 'text',
              text: lines.join('\n'),
            },
          ],
        };
      } catch (error) {
        return handleSearchError(error, 'capabilities probe');
      }
    }
  );
}
