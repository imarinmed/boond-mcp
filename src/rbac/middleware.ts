import type { Permission } from '../types/rbac.js';
import { getPermissionsForRole } from './roles.js';

export interface AuthContext {
  userId: string;
  roleId: string;
  tenantId?: string;
}

/**
 * Check if user has required permission
 */
export function checkPermission(authContext: AuthContext, requiredPermission: Permission): boolean {
  const userPermissions = getPermissionsForRole(authContext.roleId);
  return userPermissions.includes(requiredPermission);
}

/**
 * Middleware to require specific permission
 */
export function requirePermission<T extends Record<string, unknown>>(
  permission: Permission,
  handler: (params: T, authContext: AuthContext) => Promise<unknown>
): (params: T, authContext: AuthContext) => Promise<unknown> {
  return async (params: T, authContext: AuthContext) => {
    if (!checkPermission(authContext, permission)) {
      throw new Error(`Permission denied: ${permission}`);
    }
    return handler(params, authContext);
  };
}

/**
 * Check if user has any of the required permissions
 */
export function checkAnyPermission(authContext: AuthContext, permissions: Permission[]): boolean {
  const userPermissions = getPermissionsForRole(authContext.roleId);
  return permissions.some(p => userPermissions.includes(p));
}

/**
 * Check if user has all required permissions
 */
export function checkAllPermissions(authContext: AuthContext, permissions: Permission[]): boolean {
  const userPermissions = getPermissionsForRole(authContext.roleId);
  return permissions.every(p => userPermissions.includes(p));
}
