import type { Role, Permission } from '../types/rbac.js';

export const SYSTEM_ROLES: Role[] = [
  {
    id: 'role_admin',
    name: 'Administrator',
    description: 'Full system access',
    permissions: [
      'candidates.read', 'candidates.write',
      'contacts.read', 'contacts.write',
      'companies.read', 'companies.write',
      'opportunities.read', 'opportunities.write',
      'resources.read', 'resources.write',
      'invoices.read', 'invoices.write',
      'admin.users', 'admin.config',
      'webhooks.manage', 'workflows.manage',
    ],
    isSystem: true,
  },
  {
    id: 'role_hr',
    name: 'HR Manager',
    description: 'Access to HR-related functions',
    permissions: [
      'candidates.read', 'candidates.write',
      'contacts.read', 'contacts.write',
      'resources.read', 'resources.write',
    ],
    isSystem: true,
  },
  {
    id: 'role_sales',
    name: 'Sales',
    description: 'Access to sales functions',
    permissions: [
      'contacts.read', 'contacts.write',
      'companies.read', 'companies.write',
      'opportunities.read', 'opportunities.write',
    ],
    isSystem: true,
  },
  {
    id: 'role_finance',
    name: 'Finance',
    description: 'Access to finance functions',
    permissions: [
      'invoices.read', 'invoices.write',
      'companies.read',
    ],
    isSystem: true,
  },
  {
    id: 'role_viewer',
    name: 'Viewer',
    description: 'Read-only access',
    permissions: [
      'candidates.read',
      'contacts.read',
      'companies.read',
      'opportunities.read',
      'resources.read',
    ],
    isSystem: true,
  },
];

export function getRoleById(roleId: string): Role | undefined {
  return SYSTEM_ROLES.find(r => r.id === roleId);
}

export function getPermissionsForRole(roleId: string): Permission[] {
  const role = getRoleById(roleId);
  return role?.permissions || [];
}

export function hasPermission(roleId: string, permission: Permission): boolean {
  const permissions = getPermissionsForRole(roleId);
  return permissions.includes(permission);
}

export function listRoles(): Role[] {
  return [...SYSTEM_ROLES];
}
