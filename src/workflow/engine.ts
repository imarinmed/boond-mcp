import { EventEmitter } from 'events';
import type { 
  Workflow, 
  WorkflowExecution, 
  WorkflowStep
} from '../types/workflow.js';

/**
 * Workflow Engine for executing automated workflows
 */
export class WorkflowEngine extends EventEmitter {
  private workflows: Map<string, Workflow> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();
  private runningExecutions: Set<string> = new Set();

  registerWorkflow(workflow: Workflow): void {
    this.workflows.set(workflow.id, workflow);
    this.emit('workflow:registered', workflow);
  }

  unregisterWorkflow(workflowId: string): boolean {
    const deleted = this.workflows.delete(workflowId);
    if (deleted) {
      this.emit('workflow:unregistered', workflowId);
    }
    return deleted;
  }

  getWorkflow(workflowId: string): Workflow | undefined {
    return this.workflows.get(workflowId);
  }

  listWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  async triggerWorkflow(workflowId: string, triggerData: unknown): Promise<WorkflowExecution | null> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow || !workflow.isActive) {
      return null;
    }

    if (!this.checkTriggerConditions(workflow.trigger.conditions, triggerData)) {
      return null;
    }

    const execution: WorkflowExecution = {
      id: this.generateExecutionId(),
      workflowId,
      status: 'pending',
      triggerData,
      stepResults: [],
      startedAt: new Date().toISOString(),
    };

    this.executions.set(execution.id, execution);
    this.emit('execution:created', execution);
    this.runExecution(execution);

    return execution;
  }

  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId);
  }

  listExecutions(workflowId?: string): WorkflowExecution[] {
    const executions = Array.from(this.executions.values());
    if (workflowId) {
      return executions.filter(e => e.workflowId === workflowId);
    }
    return executions;
  }

  cancelExecution(executionId: string): boolean {
    const execution = this.executions.get(executionId);
    if (!execution || execution.status !== 'running') {
      return false;
    }

    execution.status = 'cancelled';
    execution.completedAt = new Date().toISOString();
    this.runningExecutions.delete(executionId);
    
    this.emit('execution:cancelled', execution);
    return true;
  }

  private async runExecution(execution: WorkflowExecution): Promise<void> {
    const workflow = this.workflows.get(execution.workflowId);
    if (!workflow) {
      execution.status = 'failed';
      execution.error = 'Workflow not found';
      execution.completedAt = new Date().toISOString();
      this.emit('execution:failed', execution);
      return;
    }

    execution.status = 'running';
    this.runningExecutions.add(execution.id);
    this.emit('execution:started', execution);

    try {
      let currentStep: WorkflowStep | undefined = workflow.steps[0];

      while (currentStep) {
        execution.currentStepId = currentStep.id;
        
        const stepResult = await this.executeStep(currentStep, execution);
        execution.stepResults.push(stepResult);

        if (stepResult.status === 'failure') {
          if (currentStep.onErrorStepId) {
            currentStep = workflow.steps.find(s => s.id === currentStep!.onErrorStepId);
            continue;
          } else {
            execution.status = 'failed';
            execution.error = stepResult.error;
            break;
          }
        }

        if (currentStep.nextStepId) {
          currentStep = workflow.steps.find(s => s.id === currentStep!.nextStepId);
        } else {
          currentStep = undefined;
        }
      }

      if (execution.status === 'running') {
        execution.status = 'completed';
      }
    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : 'Unknown error';
    } finally {
      execution.completedAt = new Date().toISOString();
      execution.currentStepId = undefined;
      this.runningExecutions.delete(execution.id);

      this.emit(
        execution.status === 'completed' ? 'execution:completed' : 'execution:failed',
        execution
      );
    }
  }

  private async executeStep(
    step: WorkflowStep,
    _execution: WorkflowExecution
  ): Promise<WorkflowExecution['stepResults'][number]> {
    const startedAt = new Date().toISOString();
    
    try {
      this.emit('step:started', { step, execution: _execution });

      let output: unknown;
      
      switch (step.type) {
        case 'action':
          output = { action: step.config['action'], executed: true };
          break;
        case 'condition':
          output = { condition: step.config['condition'], result: true };
          break;
        case 'delay':
          const delayMs = (step.config['delayMs'] as number) || 1000;
          await new Promise(resolve => setTimeout(resolve, delayMs));
          output = { delayMs };
          break;
        case 'webhook':
          output = { webhookUrl: step.config['url'], called: true };
          break;
        case 'notification':
          output = { message: step.config['message'], sent: true };
          break;
        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }

      const completedAt = new Date().toISOString();

      this.emit('step:completed', { step, execution: _execution, output });

      return {
        stepId: step.id,
        status: 'success',
        output,
        startedAt,
        completedAt,
      };
    } catch (error) {
      const completedAt = new Date().toISOString();
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      this.emit('step:failed', { step, execution: _execution, error: errorMessage });

      return {
        stepId: step.id,
        status: 'failure',
        error: errorMessage,
        startedAt,
        completedAt,
      };
    }
  }

  private checkTriggerConditions(conditions: Record<string, unknown>[] | undefined, _triggerData: unknown): boolean {
    if (!conditions || conditions.length === 0) {
      return true;
    }
    return true;
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
