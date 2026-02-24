export const MCP_SERVER_CONFIG = {
  apiKey: '75621a070463f3ad2bd6e1dc38b7a36f5994c56f5ce885e08cf6f09e41a3141c',
  serverUrl: 'https://boond-mcp-d61y.onrender.com/mcp',
  timeout: 10000,
};

let currentSessionId: string | null = null;
let eventSource: EventSource | null = null;
const pendingRequests = new Map<string, (value: any) => void>();

function parseSessionIdFromSse(data: string): string | null {
  const eventMatch = data.match(/event:\s*endpoint\s*\ndata:\s*([^\n]+)/);
  if (eventMatch) {
    const endpointUrl = eventMatch[1].trim();
    const sessionMatch = endpointUrl.match(/sessionId=([^\s\n]+)/);
    if (sessionMatch) {
      return sessionMatch[1];
    }
  }
  return null;
}

function parseSseMessage(data: string): any | null {
  const lines = data.split('\n');
  let event = '';
  let payload = '';
  
  for (const line of lines) {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      payload = line.slice(5).trim();
    }
  }
  
  if (event === 'message' && payload) {
    try {
      return JSON.parse(payload);
    } catch {
      return null;
    }
  }
  return null;
}

export async function establishSession(): Promise<string> {
  return new Promise((resolve, reject) => {
    const es = new EventSource(MCP_SERVER_CONFIG.serverUrl, {
      headers: {
        'X-API-Key': MCP_SERVER_CONFIG.apiKey,
      },
    });

    const timeout = setTimeout(() => {
      es.close();
      reject(new Error('Session establishment timeout'));
    }, 10000);

    es.onmessage = (event) => {
      const sessionId = parseSessionIdFromSse(event.data);
      if (sessionId) {
        clearTimeout(timeout);
        currentSessionId = sessionId;
        eventSource = es;
        
        // Keep connection open for responses
        es.onmessage = (e) => {
          const message = parseSseMessage(e.data);
          if (message?.id && pendingRequests.has(message.id)) {
            const resolver = pendingRequests.get(message.id)!;
            resolver(message);
            pendingRequests.delete(message.id);
          }
        };
        
        resolve(sessionId);
      }
    };

    es.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('SSE connection failed'));
    };
  });
}

export async function callMCPTool(toolName: string, params: Record<string, any>): Promise<any> {
  if (!currentSessionId) {
    currentSessionId = await establishSession();
  }

  const requestId = Math.random().toString(36).substring(2, 9);
  const url = `${MCP_SERVER_CONFIG.serverUrl}?sessionId=${currentSessionId}`;
  
  // Wait for response via SSE
  const responsePromise = new Promise<any>((resolve) => {
    pendingRequests.set(requestId, resolve);
    
    // Timeout after 10 seconds
    setTimeout(() => {
      if (pendingRequests.has(requestId)) {
        pendingRequests.delete(requestId);
        resolve({ error: 'Request timeout' });
      }
    }, 10000);
  });
  
  // Send request via POST
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'X-API-Key': MCP_SERVER_CONFIG.apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: requestId,
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

  // Wait for response via SSE
  return responsePromise;
}

export async function listMCPTools(): Promise<Array<{ name: string; description: string }>> {
  if (!currentSessionId) {
    currentSessionId = await establishSession();
  }

  const requestId = Math.random().toString(36).substring(2, 9);
  const url = `${MCP_SERVER_CONFIG.serverUrl}?sessionId=${currentSessionId}`;
  
  const responsePromise = new Promise<any>((resolve) => {
    pendingRequests.set(requestId, resolve);
    setTimeout(() => {
      if (pendingRequests.has(requestId)) {
        pendingRequests.delete(requestId);
        resolve({ error: 'Request timeout' });
      }
    }, 10000);
  });
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'X-API-Key': MCP_SERVER_CONFIG.apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: requestId,
      method: 'tools/list',
    }),
  });

  if (!response.ok) {
    throw new Error(`MCP server error: ${response.status} ${response.statusText}`);
  }

  const result = await responsePromise;
  return result.result?.tools || [];
}
