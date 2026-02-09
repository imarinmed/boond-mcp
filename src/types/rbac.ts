import { z } from 'zod';

export const PermissionSchema = z.enum([
  'candidates.read',
  'candidates.write',
  'contacts.read',
  'contacts.write',
  'companies.read',
  'companies.write',
  'opportunities.read',
  'opportunities.write',
  'resources.read',
  'resources.write',
  'invoices.read',
  'invoices.write',
  'admin.users',
  'admin.config',
  'webhooks.manage',
  'workflows.manage',
]);

export type Permission = z.infer<typeof PermissionSchema>;

export const RoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  permissions: z.array(PermissionSchema),
  isSystem: z.boolean().default(false),
});

export type Role = z.infer<typeof RoleSchema>;

export const UserRoleSchema = z.object({
  userId: z.string(),
  roleId: z.string(),
  tenantId: z.string(),
  assignedAt: z.string().datetime(),
  assignedBy: z.string(),
});

export type UserRole = z.infer<typeof UserRoleSchema>;

export const RBACConfigSchema = z.object({
  roles: z.array(RoleSchema),
  userRoles: z.array(UserRoleSchema),
});

export type RBACConfig = z.infer<typeof RBACConfigSchema>;
