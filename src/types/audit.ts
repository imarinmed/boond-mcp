import { z } from 'zod';

export const AuditEventTypeSchema = z.enum([
  'tool.executed',
  'tool.failed',
  'api.request',
  'api.response',
  'api.error',
  'auth.login',
  'auth.logout',
  'auth.failed',
  'config.changed',
  'workflow.triggered',
  'workflow.completed',
  'workflow.failed',
]);

export type AuditEventType = z.infer<typeof AuditEventTypeSchema>;

export const AuditEventSchema = z.object({
  id: z.string(),
  timestamp: z.string().datetime(),
  type: AuditEventTypeSchema,
  severity: z.enum(['info', 'warning', 'error', 'critical']).default('info'),
  tenantId: z.string().optional(),
  userId: z.string().optional(),
  toolName: z.string().optional(),
  requestId: z.string().optional(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export type AuditEvent = z.infer<typeof AuditEventSchema>;

export const AuditLogSchema = z.object({
  events: z.array(AuditEventSchema),
  metadata: z.object({
    version: z.string(),
    lastRotated: z.string().datetime().optional(),
  }),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

export const AuditFilterSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  types: z.array(AuditEventTypeSchema).optional(),
  tenantId: z.string().optional(),
  userId: z.string().optional(),
  severity: z.enum(['info', 'warning', 'error', 'critical']).optional(),
  toolName: z.string().optional(),
});

export type AuditFilter = z.infer<typeof AuditFilterSchema>;
