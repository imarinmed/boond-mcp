import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WorkflowEngine } from '../../workflow/engine.js';
import { z } from 'zod';


export function registerWorkflowTools(server: McpServer, engine: WorkflowEngine): void {
  // Register workflow
  server.registerTool(
    'boond_workflow_register',
    {
      description: 'Register a new workflow',
      inputSchema: {
        name: z.string(),
        description: z.string(),
        trigger: z.object({
          event: z.string(),
          conditions: z.array(z.record(z.unknown())).default([]),
        }),
        steps: z.array(z.object({
          id: z.string(),
          type: z.enum(['action', 'condition', 'delay', 'webhook', 'notification']),
          name: z.string(),
          config: z.record(z.unknown()),
          nextStepId: z.string().optional(),
          onErrorStepId: z.string().optional(),
        })),
      },
    },
    async (params) => {
      try {
        const workflow = {
          id: `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...params,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        engine.registerWorkflow(workflow);
        
        return {
          content: [{
            type: 'text',
            text: `✅ Workflow registered!\n\nID: ${workflow.id}\nName: ${workflow.name}\nSteps: ${workflow.steps.length} step(s)`,
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

  // List workflows
  server.registerTool(
    'boond_workflow_list',
    {
      description: 'List all registered workflows',
      inputSchema: {},
    },
    async () => {
      const workflows = engine.listWorkflows();
      if (workflows.length === 0) {
        return { content: [{ type: 'text', text: 'No workflows registered.' }] };
      }
      
      const lines = workflows.map(wf => 
        `🔧 ${wf.name} (${wf.id})\n   Status: ${wf.isActive ? '✅ Active' : '⏸️ Inactive'}\n   Trigger: ${wf.trigger.event}\n   Steps: ${wf.steps.length}`
      );
      
      return {
        content: [{
          type: 'text',
          text: `📋 Workflows (${workflows.length}):\n\n${lines.join('\n\n')}`,
        }],
      };
    }
  );

  // Trigger workflow
  server.registerTool(
    'boond_workflow_trigger',
    {
      description: 'Manually trigger a workflow',
      inputSchema: {
        workflowId: z.string(),
        data: z.record(z.unknown()).optional(),
      },
    },
    async (params) => {
      try {
        const execution = await engine.triggerWorkflow(params.workflowId, params.data);
        
        if (!execution) {
          return {
            content: [{ type: 'text', text: '❌ Workflow not found or trigger conditions not met.' }],
            isError: true,
          };
        }
        
        return {
          content: [{
            type: 'text',
            text: `✅ Workflow triggered!\n\nExecution ID: ${execution.id}\nStatus: ${execution.status}\nStarted: ${execution.startedAt}`,
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
}
