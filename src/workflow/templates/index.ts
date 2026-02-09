import type { Workflow } from '../../types/workflow.js';

export const candidateNotificationTemplate: Workflow = {
  id: 'template_candidate_notification',
  name: 'Candidate Creation Notification',
  description: 'Send notification when a new candidate is created',
  trigger: {
    event: 'candidate.created',
    conditions: [],
  },
  steps: [
    {
      id: 'step_1',
      type: 'notification',
      name: 'Send Notification',
      config: {
        message: 'New candidate created: {{candidate.name}}',
      },
    },
  ],
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const opportunityFollowUpTemplate: Workflow = {
  id: 'template_opportunity_followup',
  name: 'Opportunity Follow-up',
  description: 'Delay and send follow-up for opportunity updates',
  trigger: {
    event: 'opportunity.updated',
    conditions: [],
  },
  steps: [
    {
      id: 'step_1',
      type: 'delay',
      name: 'Wait 1 hour',
      config: {
        delayMs: 3600000, // 1 hour
      },
      nextStepId: 'step_2',
    },
    {
      id: 'step_2',
      type: 'notification',
      name: 'Send Follow-up',
      config: {
        message: 'Follow-up on opportunity: {{opportunity.title}}',
      },
    },
  ],
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const webhookIntegrationTemplate: Workflow = {
  id: 'template_webhook_integration',
  name: 'External Webhook Integration',
  description: 'Call external webhook when company is created',
  trigger: {
    event: 'company.created',
    conditions: [],
  },
  steps: [
    {
      id: 'step_1',
      type: 'webhook',
      name: 'Call External API',
      config: {
        url: 'https://example.com/webhook',
      },
    },
  ],
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const conditionBasedTemplate: Workflow = {
  id: 'template_condition_based',
  name: 'Condition-Based Workflow',
  description: 'Conditionally execute actions based on data',
  trigger: {
    event: 'contact.updated',
    conditions: [],
  },
  steps: [
    {
      id: 'step_1',
      type: 'condition',
      name: 'Check Contact Status',
      config: {
        condition: 'contact.status === "active"',
      },
      nextStepId: 'step_2',
    },
    {
      id: 'step_2',
      type: 'action',
      name: 'Update CRM',
      config: {
        action: 'sync_to_crm',
      },
    },
  ],
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const allTemplates = [
  candidateNotificationTemplate,
  opportunityFollowUpTemplate,
  webhookIntegrationTemplate,
  conditionBasedTemplate,
];

export function getTemplateById(id: string): Workflow | undefined {
  return allTemplates.find(t => t.id === id);
}

export function listTemplates(): Workflow[] {
  return allTemplates;
}
