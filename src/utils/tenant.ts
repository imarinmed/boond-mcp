import { readFileSync, writeFileSync, existsSync } from 'fs';
import type { Tenant, TenantsConfig, TenantContext } from '../types/tenant.js';
import { TenantsConfigSchema } from '../types/tenant.js';

const TENANTS_CONFIG_PATH = process.env['BOOND_TENANTS_CONFIG'] || './config/tenants.json';

export function loadTenants(configPath: string = TENANTS_CONFIG_PATH): Tenant[] {
  if (!existsSync(configPath)) {
    return [];
  }
  
  try {
    const data = readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(data);
    const validated = TenantsConfigSchema.parse(parsed);
    return validated.tenants.filter(t => t.isActive);
  } catch {
    return [];
  }
}

export function saveTenants(tenants: Tenant[], configPath: string = TENANTS_CONFIG_PATH): void {
  const config: TenantsConfig = { tenants };
  writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

export function getTenantById(tenants: Tenant[], tenantId: string): Tenant | undefined {
  return tenants.find(t => t.id === tenantId && t.isActive);
}

export function getTenantBySlug(tenants: Tenant[], slug: string): Tenant | undefined {
  return tenants.find(t => t.slug === slug && t.isActive);
}

export function getTenantByApiToken(tenants: Tenant[], apiToken: string): Tenant | undefined {
  return tenants.find(t => t.apiToken === apiToken && t.isActive);
}

export function createTenantContext(tenant: Tenant): TenantContext {
  return {
    tenantId: tenant.id,
    tenantSlug: tenant.slug,
    apiToken: tenant.apiToken,
  };
}

export function generateTenantSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function generateTenantApiToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = 'tn_';
  for (let i = 0; i < 48; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}
