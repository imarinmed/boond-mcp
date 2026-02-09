import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { WebhookEventSchema } from '../../types/webhooks.js';
import { registerWebhook, listWebhooks, unregisterWebhook } from '../../utils/webhooks.js';

const WEBHOOKS_CONFIG_PATH = process.env["BOOND_WEBHOOKS_CONFIG"] || './config/webhooks.json';

const registerWebhookSchema = z.object({
  url: z.string().url(),
  events: z.array(WebhookEventSchema),
});

const unregisterWebhookSchema = z.object({
  id: z.string(),
});

export function registerWebhookTools(server: McpServer): void {
  server.registerTool(
    'boond_webhook_register',
    {
      description: 'Register a new webhook for BoondManager events',
      inputSchema: registerWebhookSchema.shape,
    },
    async (params) => {
      try {
        const validated = registerWebhookSchema.parse(params);
        const webhook = await registerWebhook(WEBHOOKS_CONFIG_PATH, validated.url, validated.events);
        return {
          content: [{
            type: 'text',
            text: `✅ Webhook registered successfully!\n\nID: ${webhook.id}\nURL: ${webhook.url}\nEvents: ${webhook.events.join(', ')}\nSecret: ${webhook.secret}\n\n⚠️ Save this secret - it won't be shown again!`,
          }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}` }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    'boond_webhook_list',
    {
      description: 'List all registered webhooks',
      inputSchema: {},
    },
    async () => {
      try {
        const webhooks = await listWebhooks(WEBHOOKS_CONFIG_PATH);
        if (webhooks.length === 0) {
          return {
            content: [{ type: 'text', text: 'No webhooks registered.' }],
          };
        }
        const lines = webhooks.map(wh => {
          return `📡 ${wh.id}\n   URL: ${wh.url}\n   Events: ${wh.events.join(', ')}\n   Active: ${wh.isActive ? '✅' : '❌'}\n   Created: ${wh.createdAt}`;
        });
        return {
          content: [{
            type: 'text',
            text: `📋 Registered Webhooks (${webhooks.length}):\n\n${lines.join('\n\n')}`,
          }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}` }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    'boond_webhook_unregister',
    {
      description: 'Unregister a webhook by ID',
      inputSchema: unregisterWebhookSchema.shape,
    },
    async (params) => {
      try {
        const validated = unregisterWebhookSchema.parse(params);
        await unregisterWebhook(WEBHOOKS_CONFIG_PATH, validated.id);
        return {
          content: [{ type: 'text', text: `✅ Webhook ${validated.id} unregistered successfully.` }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}` }],
          isError: true,
        };
      }
    }
  );
}
