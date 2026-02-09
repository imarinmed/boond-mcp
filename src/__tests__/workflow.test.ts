import { describe, it, expect, beforeEach } from 'bun:test';
import { WorkflowEngine } from '../workflow/engine.js';
import type { Workflow } from '../types/workflow.js';

describe('Workflow Engine', () => {
  let engine: WorkflowEngine;

  beforeEach(() => {
    engine = new WorkflowEngine();
  });

  describe('Workflow Management', () => {
    it('should register a workflow', () => {
      const workflow: Workflow = {
        id: 'wf_test',
        name: 'Test Workflow',
        description: 'A test workflow',
        trigger: { event: 'candidate.created', conditions: [] },
        steps: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      engine.registerWorkflow(workflow);
      expect(engine.getWorkflow('wf_test')).toEqual(workflow);
    });

    it('should unregister a workflow', () => {
      const workflow: Workflow = {
        id: 'wf_test',
        name: 'Test Workflow',
        description: 'A test workflow',
        trigger: { event: 'candidate.created', conditions: [] },
        steps: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      engine.registerWorkflow(workflow);
      expect(engine.unregisterWorkflow('wf_test')).toBe(true);
      expect(engine.getWorkflow('wf_test')).toBeUndefined();
    });

    it('should list all workflows', () => {
      const workflow1: Workflow = {
        id: 'wf_1',
        name: 'Workflow 1',
        description: 'First workflow',
        trigger: { event: 'candidate.created', conditions: [] },
        steps: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const workflow2: Workflow = {
        id: 'wf_2',
        name: 'Workflow 2',
        description: 'Second workflow',
        trigger: { event: 'contact.created', conditions: [] },
        steps: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      engine.registerWorkflow(workflow1);
      engine.registerWorkflow(workflow2);

      const workflows = engine.listWorkflows();
      expect(workflows).toHaveLength(2);
      expect(workflows.map(w => w.id)).toContain('wf_1');
      expect(workflows.map(w => w.id)).toContain('wf_2');
    });
  });

  describe('Workflow Execution', () => {
    it('should trigger a workflow', async () => {
      const workflow: Workflow = {
        id: 'wf_test',
        name: 'Test Workflow',
        description: 'A test workflow',
        trigger: { event: 'candidate.created', conditions: [] },
        steps: [
          {
            id: 'step_1',
            type: 'action',
            name: 'Test Action',
            config: { action: 'test' },
          },
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      engine.registerWorkflow(workflow);
      
      const execution = await engine.triggerWorkflow('wf_test', { test: true });
      
      expect(execution).not.toBeNull();
      expect(execution?.workflowId).toBe('wf_test');
      expect(execution?.status).toBe('pending');
    });

    it('should not trigger inactive workflow', async () => {
      const workflow: Workflow = {
        id: 'wf_test',
        name: 'Test Workflow',
        description: 'A test workflow',
        trigger: { event: 'candidate.created', conditions: [] },
        steps: [],
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      engine.registerWorkflow(workflow);
      
      const execution = await engine.triggerWorkflow('wf_test', { test: true });
      
      expect(execution).toBeNull();
    });

    it('should get execution status', async () => {
      const workflow: Workflow = {
        id: 'wf_test',
        name: 'Test Workflow',
        description: 'A test workflow',
        trigger: { event: 'candidate.created', conditions: [] },
        steps: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      engine.registerWorkflow(workflow);
      const execution = await engine.triggerWorkflow('wf_test', { test: true });
      
      expect(execution).not.toBeNull();
      
      const retrieved = engine.getExecution(execution!.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(execution!.id);
    });
  });
});
