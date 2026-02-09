import { z } from 'zod';

export const TenantSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  apiToken: z.string(),
  settings: z.record(z.unknown()).default({}),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Tenant = z.infer<typeof TenantSchema>;

export const TenantContextSchema = z.object({
  tenantId: z.string(),
  tenantSlug: z.string(),
  apiToken: z.string(),
});

export type TenantContext = z.infer<typeof TenantContextSchema>;

export const TenantsConfigSchema = z.object({
  tenants: z.array(TenantSchema),
});

export type TenantsConfig = z.infer<typeof TenantsConfigSchema>;
