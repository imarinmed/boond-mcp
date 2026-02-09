import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { verifyWebhookSignature, verifyWebhookSignatureWithTimestamp } from '../../utils/webhook-signature.js';

const verifySignatureSchema = z.object({
  signature: z.string().describe('The X-Webhook-Signature header value'),
  payload: z.string().describe('The raw webhook payload body'),
  secret: z.string().describe('The webhook secret key'),
  useTimestamp: z.boolean().optional().describe('Whether to verify with timestamp (default: false)'),
  toleranceSeconds: z.number().optional().describe('Timestamp tolerance in seconds (default: 300)'),
});

export function registerWebhookVerificationTools(server: McpServer): void {
  server.registerTool(
    'boond_webhook_verify_signature',
    {
      description: 'Verify a webhook request signature',
      inputSchema: verifySignatureSchema.shape,
    },
    async (params) => {
      try {
        const validated = verifySignatureSchema.parse(params);
        
        let isValid: boolean;
        if (validated.useTimestamp) {
          isValid = verifyWebhookSignatureWithTimestamp(
            validated.signature,
            validated.payload,
            validated.secret,
            validated.toleranceSeconds
          );
        } else {
          isValid = verifyWebhookSignature(
            validated.signature,
            validated.payload,
            validated.secret
          );
        }
        
        if (isValid) {
          return {
            content: [{
              type: 'text',
              text: `✅ Signature is valid!\n\nThis webhook request is authentic and came from BoondManager.`,
            }],
          };
        } else {
          return {
            content: [{
              type: 'text',
              text: `❌ Signature is invalid!\n\nThis webhook request may have been tampered with or the secret is incorrect.`,
            }],
            isError: true,
          };
        }
      } catch (error) {
        return {
          content: [{ type: 'text', text: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}` }],
          isError: true,
        };
      }
    }
  );
}
