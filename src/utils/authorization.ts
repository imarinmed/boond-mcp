import { UserRole } from '../types/auth.js';

/**
 * Check if a role has access to a specific tool
 */
export function canAccessTool(role: UserRole, toolName: string): boolean {
  // Admin has access to all tools
  if (role === 'admin') {
    return true;
  }

  // HR role access
  if (role === 'hr') {
    return (
      toolName.startsWith('boond_candidates') ||
      toolName.startsWith('boond_contacts') ||
      toolName.startsWith('boond_resources') ||
      toolName.startsWith('boond_contracts') ||
      toolName.startsWith('boond_bulk_candidates') ||
      toolName.startsWith('boond_bulk_contacts') ||
      toolName.startsWith('boond_bulk_resources') ||
      toolName.startsWith('boond_bulk_contracts')
    );
  }

  // Finance role access
  if (role === 'finance') {
    return (
      toolName.startsWith('boond_invoices') ||
      toolName.startsWith('boond_purchases') ||
      toolName.startsWith('boond_orders') ||
      toolName.startsWith('boond_banking') ||
      toolName.startsWith('boond_expenses') ||
      toolName.startsWith('boond_quotes')
    );
  }

  return false;
}

/**
 * Get list of accessible tools for a role
 */
export function getAccessibleTools(role: UserRole): string[] {
  if (role === 'admin') {
    return ['*']; // All tools
  }

  const tools: string[] = [];

  if (role === 'hr') {
    tools.push(
      'boond_candidates_search',
      'boond_candidates_get',
      'boond_candidates_create',
      'boond_candidates_update',
      'boond_contacts_search',
      'boond_contacts_get',
      'boond_contacts_create',
      'boond_contacts_update',
      'boond_resources_search',
      'boond_resources_get',
      'boond_resources_create',
      'boond_resources_update',
      'boond_contracts_search',
      'boond_contracts_get',
      'boond_contracts_create',
      'boond_contracts_update'
    );
  }

  if (role === 'finance') {
    tools.push(
      'boond_invoices_search',
      'boond_invoices_get',
      'boond_purchases_search',
      'boond_purchases_get',
      'boond_orders_search',
      'boond_orders_get',
      'boond_banking_search',
      'boond_banking_get',
      'boond_expenses_search',
      'boond_expenses_get',
      'boond_quotes_search',
      'boond_quotes_get'
    );
  }

  return tools;
}

/**
 * Create authorization error response
 */
export function createAuthzError(
  role: UserRole,
  toolName: string
): { content: Array<{ type: 'text'; text: string }>; isError: true } {
  return {
    content: [
      {
        type: 'text',
        text: `🚫 Access Denied: Your role '${role}' does not have permission to use '${toolName}'.`,
      },
    ],
    isError: true,
  };
}
