export const MCP_SERVER_CONFIG = {
  apiKey: '75621a070463f3ad2bd6e1dc38b7a36f5994c56f5ce885e08cf6f09e41a3141c',
  serverUrl: 'https://boond-mcp-d61y.onrender.com/mcp',
  timeout: 30000,
};

export function getMCPHeaders(): Record<string, string> {
  return {
    'X-API-Key': MCP_SERVER_CONFIG.apiKey,
    'Content-Type': 'application/json',
    'MCP-Version': '2024-11-05',
  };
}

export async function callMCPTool(toolName: string, params: Record<string, any>): Promise<any> {
  const response = await fetch(MCP_SERVER_CONFIG.serverUrl, {
    method: 'POST',
    headers: getMCPHeaders(),
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Math.random().toString(36).substring(2, 9),
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: params,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`MCP server error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  
  if (result.error) {
    throw new Error(`Tool error: ${JSON.stringify(result.error)}`);
  }

  return result.result;
}

export async function listMCPTools(): Promise<Array<{ name: string; description: string }>> {
  const response = await fetch(MCP_SERVER_CONFIG.serverUrl, {
    method: 'POST',
    headers: getMCPHeaders(),
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Math.random().toString(36).substring(2, 9),
      method: 'tools/list',
    }),
  });

  if (!response.ok) {
    throw new Error(`MCP server error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  return result.result?.tools || [];
}
