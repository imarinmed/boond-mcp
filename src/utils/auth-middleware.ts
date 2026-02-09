import { User } from '../types/auth.js';

/**
 * Authentication context passed through MCP requests
 */
export interface AuthContext {
  user: User | null;
  isAuthenticated: boolean;
}

/**
 * Extract API key from request metadata
 * MCP tools can receive metadata via the request context
 */
export function extractApiKey(metadata?: Record<string, unknown>): string | null {
  if (!metadata) return null;

  const apiKey = metadata['apiKey'] as string | undefined;
  if (typeof apiKey === 'string' && apiKey.length > 0) {
    return apiKey;
  }

  return null;
}

/**
 * Create authentication error response
 */
export function createAuthError(message: string): {
  content: Array<{ type: 'text'; text: string }>;
  isError: true;
} {
  return {
    content: [
      {
        type: 'text',
        text: `🔒 Authentication Error: ${message}`,
      },
    ],
    isError: true,
  };
}

/**
 * Authentication middleware function
 * Validates API key and returns auth context
 */
export function authenticateRequest(
  apiKey: string | null,
  users: User[]
): { success: true; user: User } | { success: false; error: string } {
  if (!apiKey) {
    return {
      success: false,
      error: 'API key is required. Please provide your API key in the request metadata.',
    };
  }

  const user = users.find(u => {
    const crypto = require('crypto');
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    return u.apiKeyHash === keyHash && u.isActive;
  });

  if (!user) {
    return { success: false, error: 'Invalid or revoked API key.' };
  }

  return { success: true, user };
}

/**
 * Get authentication context from MCP request context
 * This is a placeholder - actual implementation depends on MCP SDK capabilities
 */
export function getAuthContext(_context: unknown): { userId: string; role: string } | null {
  return null;
}
