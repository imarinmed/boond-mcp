import { EventSource } from 'eventsource';


export const MCP_SERVER_CONFIG = {
  apiKey: process.env.MCP_API_KEY || '',
  serverUrl: 'https://boond-mcp-d61y.onrender.com/mcp',
  timeout: 10000,
};

// Validate configuration before use
export function validateConfig(): void {
  if (!MCP_SERVER_CONFIG.apiKey) {
    throw new Error(
      'MCP_API_KEY environment variable is required. ' +
      'Set it with: export MCP_API_KEY="your-api-key"'
    );
  }
}

/**
 * Wait for Render server to be ready (handles cold starts)
 * Render free tier can take 30-60 seconds to wake up from sleep
 */
export async function waitForServerReady(maxRetries = 12, retryDelay = 5000): Promise<void> {
  console.log('⏳ Checking if MCP server is ready...');
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      // Try to establish a session as a health check
      const sessionId = await establishSession();
      if (sessionId) {
        const waited = i * retryDelay / 1000;
        console.log(`✅ MCP server ready after ${waited} seconds`);
        return;
      }
    } catch (error) {
      const attempt = i + 1;
      const waited = attempt * retryDelay / 1000;
      console.log(`⏳ Attempt ${attempt}/${maxRetries}: Server not ready yet (waited ${waited}s)...`);
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  
  throw new Error(`Server not ready after ${maxRetries * retryDelay / 1000} seconds. Render free tier may be cold starting.`);
}

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
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          headers: {
            ...init?.headers,
            'X-API-Key': MCP_SERVER_CONFIG.apiKey,
          },
        }),
    });

    const timeout = setTimeout(() => {
      es.close();
      reject(new Error('Session establishment timeout after 90 seconds. Server may still be cold starting.'));
    }, 90000); // 90 seconds for Render free tier cold starts

    // Listen for the specific 'endpoint' event type
    es.addEventListener('endpoint', (event: any) => {
      console.error('[SSE] Received endpoint event:', event.data);
      // The event.data contains just the endpoint URL: /mcp?sessionId=xxx
      const sessionMatch = event.data.match(/sessionId=([^&\s]+)/);
      const sessionId = sessionMatch ? sessionMatch[1] : null;
      if (sessionId) {
        clearTimeout(timeout);
        currentSessionId = sessionId;
        eventSource = es;
        es.onmessage = (e) => {
          console.error('[SSE] Received message:', e.data);
          try {
            const message = JSON.parse(e.data);
            if (message?.id && pendingRequests.has(message.id)) {
              const resolver = pendingRequests.get(message.id)!;
              resolver(message);
              pendingRequests.delete(message.id);
            }
          } catch (error) {
            console.error('[SSE] Failed to parse message:', error);
          }
        };
        resolve(sessionId);
      }
    });

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
  const responsePromise = new Promise<any>((resolve, reject) => {
    pendingRequests.set(requestId, resolve);
    setTimeout(() => {
      if (pendingRequests.has(requestId)) {
        pendingRequests.delete(requestId);
        reject(new Error('Request timeout after 30 seconds'));
      }
    }, 30000); // 30 seconds for individual tool calls
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
  const mcpResponse = await responsePromise;
  
  // Extract the result field from MCP response
  if (mcpResponse.result) {
    // Check if it's an error response
    if (mcpResponse.result.isError) {
      const errorText = mcpResponse.result.content?.[0]?.text || 'Unknown error';
      throw new Error(errorText);
    }
    return mcpResponse.result;
  }
  
  // If there's a top-level error
  if (mcpResponse.error) {
    throw new Error(mcpResponse.error.message || JSON.stringify(mcpResponse.error));
  }
  
  return mcpResponse;
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
        resolve({ error: 'Request timeout after 30 seconds' });
      }
    }, 30000); // 30 seconds for tool listing
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
