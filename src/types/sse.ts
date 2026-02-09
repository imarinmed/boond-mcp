import { z } from 'zod';

export const SSEConfigSchema = z.object({
  enabled: z.boolean().default(false),
  port: z.number().default(3001),
  heartbeatIntervalMs: z.number().default(30000),
  allowedOrigins: z.array(z.string()).default(['*']),
});

export type SSEConfig = z.infer<typeof SSEConfigSchema>;

export const SSEEventSchema = z.object({
  event: z.string(),
  data: z.unknown(),
  timestamp: z.string().datetime(),
});

export type SSEEvent = z.infer<typeof SSEEventSchema>;

export const SSEEventTypes = [
  'candidate.created',
  'candidate.updated',
  'candidate.deleted',
  'contact.created',
  'contact.updated',
  'company.created',
  'company.updated',
  'opportunity.created',
  'opportunity.updated',
  'webhook.received',
  'workflow.completed',
  'workflow.failed',
] as const;

export type SSEEventType = typeof SSEEventTypes[number];
