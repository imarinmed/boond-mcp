import { z } from 'zod';

/**
 * User role enum schema
 * - hr: Access to HR domain tools (candidates, contacts, resources, contracts)
 * - finance: Access to Finance domain tools (invoices, purchases, orders, banking)
 * - admin: Access to all tools + user management
 */
export const UserRoleSchema = z.enum(['hr', 'finance', 'admin']);
export type UserRole = z.infer<typeof UserRoleSchema>;

/**
 * User schema for storing user information and API key hash
 */
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: UserRoleSchema,
  apiKeyHash: z.string(),
  createdAt: z.string().datetime(),
  isActive: z.boolean().default(true),
});

export type User = z.infer<typeof UserSchema>;

/**
 * Users configuration schema for the JSON config file
 */
export const UsersConfigSchema = z.object({
  users: z.array(UserSchema),
});

export type UsersConfig = z.infer<typeof UsersConfigSchema>;
