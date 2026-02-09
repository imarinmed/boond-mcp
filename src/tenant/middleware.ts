import type { Tenant, TenantContext } from '../types/tenant.js';
import { loadTenants, getTenantByApiToken, createTenantContext } from '../utils/tenant.js';

const tenants = loadTenants();

/**
 * Extract tenant from request headers
 * Looks for X-Tenant-ID or X-API-Token header
 */
export function extractTenantFromHeaders(headers: Record<string, string | string[] | undefined>): Tenant | undefined {
  // Try API token first
  const apiToken = headers['x-api-token'];
  if (typeof apiToken === 'string') {
    return getTenantByApiToken(tenants, apiToken);
  }
  
  // Try tenant ID
  const tenantId = headers['x-tenant-id'];
  if (typeof tenantId === 'string') {
    return tenants.find(t => t.id === tenantId);
  }
  
  return undefined;
}

/**
 * Middleware to inject tenant context
 */
export function withTenantContext<T extends Record<string, unknown>>(
  handler: (params: T, tenantContext: TenantContext) => Promise<unknown>
): (params: T) => Promise<unknown> {
  return async (params: T) => {
    // In real implementation, headers would come from request context
    // For now, we'll check if tenantId is in params
    const tenantId = params['tenantId'] as string | undefined;
    
    if (!tenantId) {
      throw new Error('Tenant ID is required. Use X-Tenant-ID header or tenantId parameter.');
    }
    
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant || !tenant.isActive) {
      throw new Error(`Tenant '${tenantId}' not found or inactive.`);
    }
    
    const tenantContext = createTenantContext(tenant);
    return handler(params, tenantContext);
  };
}

/**
 * Validate tenant access
 */
export function validateTenantAccess(tenantId: string, _requiredPermission?: string): boolean {
  const tenant = tenants.find(t => t.id === tenantId);
  
  if (!tenant || !tenant.isActive) {
    return false;
  }
  
  // TODO: Check permissions if requiredPermission is specified
  
  return true;
}

/**
 * Get tenant-scoped API client configuration
 */
export function getTenantApiConfig(tenantContext: TenantContext): {
  apiToken: string;
  baseUrl: string;
} {
  return {
    apiToken: tenantContext.apiToken,
    baseUrl: process.env['BOOND_API_URL'] || 'https://ui.boondmanager.com/api/1.0',
  };
}
