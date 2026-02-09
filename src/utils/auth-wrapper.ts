/**
 * Auth wrapper for tool handlers
 *
 * This module provides utilities to wrap tool handlers with authentication
 * and authorization checks for multi-user mode.
 */

import type { BoondAPIClient } from '../api/client.js';
import type { User } from '../types/auth.js';
import { canAccessTool, createAuthzError } from './authorization.js';
import { validateApiKey } from './auth.js';
import { loadUsers } from './config.js';

// Global auth state (set during server initialization)
let authState: {
  isEnabled: boolean;
  users: User[];
  client: BoondAPIClient;
} | null = null;

/**
 * Initialize the auth system
 * Called once during server startup
 */
export function initializeAuth(
  isEnabled: boolean,
  usersConfigPath: string | null,
  client: BoondAPIClient
): void {
  const users = usersConfigPath ? loadUsers(usersConfigPath) : [];
  authState = {
    isEnabled,
    users,
    client,
  };
}

/**
 * Get current auth state
 */
export function getAuthState(): typeof authState {
  return authState;
}

/**
 * Check if auth is enabled
 */
export function isAuthEnabled(): boolean {
  return authState?.isEnabled ?? false;
}

/**
 * Auth result when authentication succeeds
 */
export interface AuthSuccess {
  success: true;
  user: User;
  client: BoondAPIClient;
}

/**
 * Auth result when authentication fails
 */
export interface AuthFailure {
  success: false;
  error: { content: Array<{ type: 'text'; text: string }>; isError: true };
}

/**
 * Auth result type (union of success and failure)
 */
export type AuthResult = AuthSuccess | AuthFailure;

/**
 * Authenticate and authorize a tool request
 *
 * @param toolName - Name of the tool being called
 * @param apiKey - API key from request (optional, for single-user mode)
 * @returns Auth result with user and role-based client, or error
 */
export function authenticateToolRequest(toolName: string, apiKey?: string): AuthResult {
  // If auth is not enabled, allow access (single-user mode)
  if (!authState?.isEnabled) {
    return {
      success: true,
      user: {
        id: 'single',
        name: 'Single User',
        email: '',
        role: 'admin',
        apiKeyHash: '',
        createdAt: '',
        isActive: true,
      },
      client: authState?.client!,
    };
  }

  // Validate API key
  if (!apiKey) {
    return {
      success: false,
      error: {
        content: [
          {
            type: 'text',
            text: '🔐 Authentication Required: API key is missing. Please provide your API key in the request metadata.',
          },
        ],
        isError: true,
      },
    };
  }

  const user = validateApiKey(apiKey, authState.users);
  if (!user) {
    return {
      success: false,
      error: {
        content: [
          {
            type: 'text',
            text: '🔐 Authentication Failed: Invalid or revoked API key.',
          },
        ],
        isError: true,
      },
    };
  }

  // Check authorization
  if (!canAccessTool(user.role, toolName)) {
    return {
      success: false,
      error: createAuthzError(user.role, toolName),
    };
  }

  // Get role-specific client
  const roleClient = authState.client.getClientForRole(user.role);

  return {
    success: true,
    user,
    client: roleClient,
  };
}

/**
 * Wrap a tool handler with authentication
 *
 * @param toolName - Name of the tool
 * @param handler - Original tool handler
 * @returns Wrapped handler with auth checks
 */
export function withAuth<T extends Record<string, unknown>>(
  toolName: string,
  handler: (
    params: T,
    client: BoondAPIClient
  ) => Promise<{ content: Array<{ type: 'text'; text: string }>; isError?: boolean }>
): (params: T) => Promise<{ content: Array<{ type: 'text'; text: string }>; isError?: boolean }> {
  return async (params: T) => {
    // Extract API key from params if present (in multi-user mode, it would be passed)
    const apiKey = (params as Record<string, string>)['__api_key'];

    const authResult = authenticateToolRequest(toolName, apiKey);

    if (!authResult.success) {
      return authResult.error;
    }

    // Call the original handler with the role-specific client
    return handler(params, authResult.client);
  };
}
