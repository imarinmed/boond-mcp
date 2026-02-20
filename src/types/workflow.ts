import { z } from 'zod';

export const WorkflowStepTypeSchema = z.enum([
  'action',
  'condition',
  'delay',
  'webhook',
  'notification',
]);

export type WorkflowStepType = z.infer<typeof WorkflowStepTypeSchema>;

export const WorkflowStepSchema = z.object({
  id: z.string(),
  type: WorkflowStepTypeSchema,
  name: z.string(),
  config: z.record(z.unknown()),
  nextStepId: z.string().optional(),
  onErrorStepId: z.string().optional(),
});

export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;

export const WorkflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  trigger: z.object({
    event: z.string(),
    conditions: z.array(z.record(z.unknown())).default([]),
  }),
  steps: z.array(WorkflowStepSchema),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Workflow = z.infer<typeof WorkflowSchema>;

export const WorkflowExecutionStatusSchema = z.enum([
  'pending',
  'running',
  'completed',
  'failed',
  'cancelled',
]);

export type WorkflowExecutionStatus = z.infer<typeof WorkflowExecutionStatusSchema>;

export const WorkflowExecutionSchema = z.object({
  id: z.string(),
  workflowId: z.string(),
  status: WorkflowExecutionStatusSchema,
  triggerData: z.unknown(),
  currentStepId: z.string().optional(),
  stepResults: z.array(z.object({
    stepId: z.string(),
    status: z.enum(['success', 'failure', 'skipped']),
    output: z.unknown().optional(),
    error: z.string().optional(),
    startedAt: z.string().datetime(),
    completedAt: z.string().datetime(),
  })).default([]),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  error: z.string().optional(),
});

export type WorkflowExecution = z.infer<typeof WorkflowExecutionSchema>;

export const WorkflowEventSchema = z.object({
  type: z.string(),
  workflowId: z.string(),
  executionId: z.string().optional(),
  data: z.unknown(),
  timestamp: z.string().datetime(),
});

export type WorkflowEvent = z.infer<typeof WorkflowEventSchema>;
