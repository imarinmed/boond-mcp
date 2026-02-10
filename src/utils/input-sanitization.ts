import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '`': '&#96;',
};

const INJECTION_TOKEN_MAP: Record<string, string> = {
  '--': ' - - ',
  '/*': '/ *',
  '*/': '* /',
  ';': ' ',
};

type SanitizedToolHandler = (
  ...args: readonly unknown[]
) => Promise<CallToolResult> | CallToolResult;

function sanitizeString(value: string): string {
  // eslint-disable-next-line no-control-regex
  const withoutControls = value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');
  const neutralizedInjectionTokens = withoutControls.replace(/--|\/\*|\*\/|;/g, token => {
    return INJECTION_TOKEN_MAP[token] ?? token;
  });

  return neutralizedInjectionTokens.replace(/[&<>"'`]/g, character => {
    return HTML_ESCAPE_MAP[character] ?? character;
  });
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const prototype: object | null = Object.getPrototypeOf(value) as object | null;
  return prototype === Object.prototype || prototype === null;
}

function sanitizeValue(value: unknown, visited: WeakSet<object>): unknown {
  if (typeof value === 'string') {
    return sanitizeString(value);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  if (visited.has(value)) {
    return value;
  }

  visited.add(value);

  if (Array.isArray(value)) {
    return value.map(item => sanitizeValue(item, visited));
  }

  if (isPlainObject(value)) {
    const sanitized: Record<string, unknown> = {};

    for (const [key, entryValue] of Object.entries(value)) {
      sanitized[key] = sanitizeValue(entryValue, visited);
    }

    return sanitized;
  }

  return value;
}

export function sanitizeInput<T>(value: T): T {
  return sanitizeValue(value, new WeakSet<object>()) as T;
}

export function wrapToolHandlerWithInputSanitization(
  handler: SanitizedToolHandler
): SanitizedToolHandler {
  return (...args: readonly unknown[]): Promise<CallToolResult> | CallToolResult => {
    const sanitizedArgs = args.map(argument => sanitizeInput(argument));
    return handler(...sanitizedArgs);
  };
}

export function applyInputSanitizationToServer(server: McpServer): void {
  const originalRegisterTool = server.registerTool.bind(server);

  const patchedRegisterTool = ((name: string, config: unknown, callback: unknown) => {
    const wrapped = wrapToolHandlerWithInputSanitization(callback as SanitizedToolHandler);
    return originalRegisterTool(name, config as never, wrapped as never);
  }) as McpServer['registerTool'];

  server.registerTool = patchedRegisterTool;
}
