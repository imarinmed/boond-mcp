import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WorkflowEngine } from '../../workflow/engine.js';
import { listTemplates, getTemplateById } from '../../workflow/templates/index.js';
import { z } from 'zod';

export function registerTemplateTools(server: McpServer, engine: WorkflowEngine): void {
  server.registerTool(
    'boond_workflow_template_list',
    {
      description: 'List available workflow templates',
      inputSchema: {},
    },
    async () => {
      const templates = listTemplates();
      
      const lines = templates.map(t => 
        `📋 ${t.name}\n   ID: ${t.id}\n   ${t.description}\n   Steps: ${t.steps.length}`
      );
      
      return {
        content: [{
          type: 'text',
          text: `📚 Available Workflow Templates (${templates.length}):\n\n${lines.join('\n\n')}`,
        }],
      };
    }
  );

  server.registerTool(
    'boond_workflow_template_apply',
    {
      description: 'Apply a workflow template',
      inputSchema: {
        templateId: z.string(),
        name: z.string().optional(),
      },
    },
    async (params) => {
      try {
        const template = getTemplateById(params.templateId);
        
        if (!template) {
          return {
            content: [{ type: 'text', text: `❌ Template '${params.templateId}' not found.` }],
            isError: true,
          };
        }

        const workflow = {
          ...template,
          id: `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: params.name || template.name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        engine.registerWorkflow(workflow);

        return {
          content: [{
            type: 'text',
            text: `✅ Template applied!\n\nWorkflow ID: ${workflow.id}\nName: ${workflow.name}\nTemplate: ${template.name}\nSteps: ${workflow.steps.length} step(s)`,
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
