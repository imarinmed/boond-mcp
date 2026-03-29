import { createServer, IncomingMessage, ServerResponse } from 'http';
import { EventEmitter } from 'events';

/**
 * SSE Client connection
 */
interface SSEClient {
  id: string;
  response: ServerResponse;
  heartbeatInterval?: ReturnType<typeof setInterval>;
}

/**
 * SSE Server for real-time BoondManager event streaming
 */
export class SSEServer extends EventEmitter {
  private clients: Map<string, SSEClient> = new Map();
  private server: ReturnType<typeof createServer> | null = null;
  private port: number;
  private heartbeatMs: number;

  constructor(port: number = 3001, heartbeatMs: number = 30000) {
    super();
    this.port = port;
    this.heartbeatMs = heartbeatMs;
  }

  /**
   * Start the SSE server
   */
  start(): void {
    this.server = createServer((req, res) => {
      this.handleRequest(req, res);
    });

    this.server.listen(this.port, () => {
      console.log(`SSE Server listening on port ${this.port}`);
    });

    this.server.on('error', (error) => {
      this.emit('error', error);
    });
  }

  /**
   * Stop the SSE server
   */
  stop(): void {
    // Close all client connections
    for (const client of this.clients.values()) {
      this.closeClient(client);
    }
    this.clients.clear();

    // Close server
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }

  /**
   * Handle incoming HTTP request
   */
  private handleRequest(req: IncomingMessage, res: ServerResponse): void {
    const url = new URL(req.url || '/', `http://localhost:${this.port}`);
    
    // Handle SSE connection
    if (url.pathname === '/events' && req.method === 'GET') {
      this.handleSSEConnection(req, res);
      return;
    }

    // Handle health check
    if (url.pathname === '/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'ok', 
        clients: this.clients.size,
        timestamp: new Date().toISOString()
      }));
      return;
    }

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      });
      res.end();
      return;
    }

    // Not found
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }

  /**
   * Handle SSE connection upgrade
   */
  private handleSSEConnection(_req: IncomingMessage, res: ServerResponse): void {
    const clientId = this.generateClientId();
    
    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });

    // Send initial connection event
    res.write(`event: connected\n`);
    res.write(`data: ${JSON.stringify({ clientId, timestamp: new Date().toISOString() })}\n\n`);

    // Create client
    const client: SSEClient = {
      id: clientId,
      response: res,
    };

    // Set up heartbeat
    client.heartbeatInterval = setInterval(() => {
      res.write(':heartbeat\n\n');
    }, this.heartbeatMs);

    // Handle client disconnect
    res.on('close', () => {
      this.closeClient(client);
      this.clients.delete(clientId);
      this.emit('disconnect', clientId);
    });

    // Store client
    this.clients.set(clientId, client);
    this.emit('connect', clientId);

    console.log(`SSE Client connected: ${clientId} (total: ${this.clients.size})`);
  }

  /**
   * Broadcast event to all connected clients
   */
  broadcast(event: string, data: unknown): void {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    
    for (const [clientId, client] of this.clients) {
      try {
        client.response.write(message);
      } catch (error) {
        console.error(`Failed to send to client ${clientId}:`, error);
        this.closeClient(client);
        this.clients.delete(clientId);
      }
    }
  }

  /**
   * Send event to specific client
   */
  sendToClient(clientId: string, event: string, data: unknown): boolean {
    const client = this.clients.get(clientId);
    if (!client) {
      return false;
    }

    try {
      const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      client.response.write(message);
      return true;
    } catch (error) {
      console.error(`Failed to send to client ${clientId}:`, error);
      this.closeClient(client);
      this.clients.delete(clientId);
      return false;
    }
  }

  /**
   * Get number of connected clients
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Get list of connected client IDs
   */
  getClientIds(): string[] {
    return Array.from(this.clients.keys());
  }

  /**
   * Close a client connection
   */
  private closeClient(client: SSEClient): void {
    if (client.heartbeatInterval) {
      clearInterval(client.heartbeatInterval);
    }
    
    try {
      client.response.end();
    } catch {
      // Client already disconnected
    }
  }

  /**
   * Generate unique client ID
   */
  private generateClientId(): string {
    return `sse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
