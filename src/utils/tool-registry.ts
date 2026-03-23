import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult, ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';

export const WRITE_TOOL_ANNOTATIONS = {
  readOnlyHint: false,
  destructiveHint: true,
  openWorldHint: false,
} as const;

export const READ_TOOL_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
} as const;

export interface ToolHandler {
  name: string;
  description: string;
  inputSchema: unknown;
  annotations?: ToolAnnotations;
  handler: (args: Record<string, unknown>) => Promise<CallToolResult>;
}

// Global tool registry for stateless HTTP access
const toolRegistry = new Map<string, ToolHandler>();

/**
 * Wraps the server's registerTool method to capture tools for HTTP access
 */
export function applyToolRegistry(server: McpServer): void {
  const originalRegisterTool = server.registerTool.bind(server);

  const wrappedRegisterTool = ((
    name: string,
    config: {
      description?: string;
      inputSchema?: unknown;
      annotations?: ToolAnnotations;
    },
    callback: (args: Record<string, unknown>) => Promise<CallToolResult>
  ) => {
    // Store in registry for HTTP access
    const configObj = config;
    const toolEntry: ToolHandler = {
      name,
      description: configObj.description || '',
      inputSchema: configObj.inputSchema,
      handler: callback,
    };

    if (configObj.annotations) {
      toolEntry.annotations = configObj.annotations;
    }

    toolRegistry.set(name, toolEntry);

    // Call original registerTool (3 arguments: name, config, callback)
    return originalRegisterTool(name, config as never, callback as never);
  }) as McpServer['registerTool'];

  server.registerTool = wrappedRegisterTool;
}

/**
 * Get all registered tools
 */
export function getRegisteredTools(): ToolHandler[] {
  return Array.from(toolRegistry.values());
}

/**
 * Call a tool by name
 */
export async function callTool(
  name: string,
  args: Record<string, unknown>
): Promise<CallToolResult> {
  const tool = toolRegistry.get(name);
  if (!tool) {
    throw new Error(`Tool not found: ${name}`);
  }
  return tool.handler(args);
}

/**
 * Check if a tool exists
 */
export function hasTool(name: string): boolean {
  return toolRegistry.has(name);
}
