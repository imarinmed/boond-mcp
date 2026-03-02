import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BoondAPIClient } from '../../api/client.js';
import {
  searchParamsSchema,
  alertIdSchema,
  updateAlertWithIdSchema,
  updateAlertSchema,
} from '../../types/schemas.js';
import type { Alert, SearchResponse } from '../../types/boond.js';
import { handleSearchError, handleToolError } from '../../utils/error-handling.js';

function pickAlertType(alert: Alert): string {
  const record = alert as unknown as Record<string, unknown>;
  const candidates = [alert.type, record['kind'], record['category'], record['state']];
  for (const value of candidates) {
    if (typeof value === 'string' && value.trim().length > 0) return value;
    if (typeof value === 'number') return String(value);
  }
  return 'info';
}

function pickAlertSeverity(alert: Alert): string {
  const record = alert as unknown as Record<string, unknown>;
  const candidates = [alert.severity, record['level'], record['priority'], record['importance']];
  for (const value of candidates) {
    if (typeof value === 'string' && value.trim().length > 0) return value;
    if (typeof value === 'number') return String(value);
  }
  return 'unknown';
}

function pickAlertMessage(alert: Alert): string {
  const record = alert as unknown as Record<string, unknown>;
  const candidates = [
    alert.message,
    record['title'],
    record['text'],
    record['body'],
    record['description'],
  ];
  for (const value of candidates) {
    if (typeof value === 'string' && value.trim().length > 0) return value;
  }
  return `Alert #${alert.id}`;
}

function formatAlertList(result: SearchResponse<Alert>): string {
  if (result.data.length === 0) {
    return 'No alerts found.';
  }

  const alerts = result.data.map(alert => {
    const lines: string[] = [];
    const type = pickAlertType(alert);
    const severity = pickAlertSeverity(alert);
    const icon =
      type === 'error' ? '🔴' : type === 'warning' ? '🟡' : type === 'success' ? '🟢' : 'ℹ️';
    lines.push(`${icon} ${pickAlertMessage(alert)} (ID: ${alert.id})`);
    lines.push(`   Type: ${type} | Severity: ${severity}`);
    if (!alert.resolvedAt) lines.push(`   Status: Unresolved`);
    else lines.push(`   Resolved: ${alert.resolvedAt}`);
    return lines.join('\n');
  });

  const summary = `Found ${result.data.length} alert(s) (Page ${result.pagination.page}/${Math.ceil(result.pagination.total / result.pagination.limit)} of ${result.pagination.total} total)`;

  return `${summary}\n\n${alerts.join('\n\n')}`;
}

function formatAlert(alert: Alert): string {
  const type = pickAlertType(alert);
  const severity = pickAlertSeverity(alert);
  const icon =
    type === 'error' ? '🔴' : type === 'warning' ? '🟡' : type === 'success' ? '🟢' : 'ℹ️';
  const lines: string[] = [];
  lines.push(`${icon} Alert: ${pickAlertMessage(alert)}`);
  lines.push(`ID: ${alert.id}`);
  lines.push(`Type: ${type}`);
  lines.push(`Severity: ${severity}`);
  lines.push(`Created: ${alert.createdAt}`);
  if (alert.resolvedAt) {
    lines.push(`Resolved: ${alert.resolvedAt}`);
  } else {
    lines.push(`Status: Unresolved`);
  }

  return lines.join('\n');
}

export function registerAlertTools(server: McpServer, client: BoondAPIClient): void {
  server.registerTool(
    'boond_alerts_search',
    {
      description: 'Search alerts by criteria',
      inputSchema: searchParamsSchema.shape,
    },
    async params => {
      try {
        const validated = searchParamsSchema.parse(params);
        const result = await client.searchAlerts(validated);
        const text = formatAlertList(result);

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleSearchError(error, 'alerts');
      }
    }
  );

  server.registerTool(
    'boond_alerts_get',
    {
      description: 'Get an alert by ID',
      inputSchema: alertIdSchema.shape,
    },
    async params => {
      try {
        const validated = alertIdSchema.parse(params);
        const alert = await client.getAlert(validated.id);

        const text = formatAlert(alert);

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleToolError(error, 'retrieving', 'Alert');
      }
    }
  );

  server.registerTool(
    'boond_alerts_update',
    {
      description: 'Update an alert status (mark as resolved)',
      inputSchema: updateAlertWithIdSchema.shape,
    },
    async params => {
      try {
        const { id, ...updateData } = updateAlertWithIdSchema.parse(params);
        const validated = updateAlertSchema.parse(updateData);
        const updatePayload =
          validated.resolved === undefined ? {} : { resolved: validated.resolved };
        const updatedAlert = await client.updateAlert(id, updatePayload);
        const text = formatAlert(updatedAlert);

        return {
          content: [
            {
              type: 'text',
              text: `Alert updated successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'updating', 'Alert');
      }
    }
  );
}
