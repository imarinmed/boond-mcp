import { z } from 'zod';

/**
 * Webhook event types supported by BoondManager
 */
export const WebhookEventSchema = z.enum([
  'candidate.created',
  'candidate.updated',
  'candidate.deleted',
  'contact.created',
  'contact.updated',
  'company.created',
  'company.updated',
  'opportunity.created',
  'opportunity.updated',
]);

export type WebhookEvent = z.infer<typeof WebhookEventSchema>;

/**
 * Configuration for a single webhook endpoint
 */
export const WebhookConfigSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  events: z.array(WebhookEventSchema),
  secret: z.string(),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
});

export type WebhookConfig = z.infer<typeof WebhookConfigSchema>;

/**
 * Container for all webhooks configuration
 */
export const WebhooksConfigSchema = z.object({
  webhooks: z.array(WebhookConfigSchema),
});

export type WebhooksConfig = z.infer<typeof WebhooksConfigSchema>;

/**
 * Webhook delivery payload
 */
export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: unknown;
}

/**
 * Webhook delivery response
 */
export interface WebhookDelivery {
  success: boolean;
  statusCode?: number;
  error?: string;
  deliveredAt: string;
}
