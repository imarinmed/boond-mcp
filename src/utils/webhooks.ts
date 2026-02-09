import { readFileSync, writeFileSync, existsSync } from 'fs';
import { randomBytes, createHmac } from 'crypto';
import {
  WebhookConfig,
  WebhookEvent,
  WebhooksConfig,
  WebhooksConfigSchema,
} from '../types/webhooks.js';

const WEBHOOK_ID_PREFIX = 'wh_';
const WEBHOOK_SECRET_PREFIX = 'whsec_';

/**
 * Generate a unique webhook ID
 */
export function generateWebhookId(): string {
  const random = randomBytes(12).toString('hex');
  return `${WEBHOOK_ID_PREFIX}${random}`;
}

/**
 * Generate a webhook secret for HMAC signature
 */
export function generateWebhookSecret(): string {
  const random = randomBytes(32).toString('base64url');
  return `${WEBHOOK_SECRET_PREFIX}${random}`;
}

/**
 * Load webhooks from config file
 */
export function loadWebhooks(configPath: string): WebhookConfig[] {
  if (!existsSync(configPath)) {
    return [];
  }

  try {
    const data = readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(data);
    const validated = WebhooksConfigSchema.parse(parsed);
    return validated.webhooks.filter(w => w.isActive);
  } catch (error) {
    console.error('Failed to load webhooks config:', error);
    return [];
  }
}

/**
 * Save webhooks to config file
 */
export function saveWebhooks(configPath: string, webhooks: WebhookConfig[]): void {
  const config: WebhooksConfig = { webhooks };
  writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

/**
 * Register a new webhook
 */
export async function registerWebhook(
  configPath: string,
  url: string,
  events: WebhookEvent[]
): Promise<WebhookConfig> {
  const webhooks = loadWebhooks(configPath);

  // Check if webhook with same URL already exists
  const existing = webhooks.find(w => w.url === url);
  if (existing) {
    throw new Error(`Webhook already registered for URL: ${url}`);
  }

  const webhook: WebhookConfig = {
    id: generateWebhookId(),
    url,
    events,
    secret: generateWebhookSecret(),
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  webhooks.push(webhook);
  saveWebhooks(configPath, webhooks);

  return webhook;
}

/**
 * Unregister a webhook by ID
 */
export async function unregisterWebhook(configPath: string, id: string): Promise<void> {
  const webhooks = loadWebhooks(configPath);
  const filtered = webhooks.filter(w => w.id !== id);

  if (filtered.length === webhooks.length) {
    throw new Error(`Webhook not found: ${id}`);
  }

  saveWebhooks(configPath, filtered);
}

/**
 * List all registered webhooks
 */
export async function listWebhooks(configPath: string): Promise<WebhookConfig[]> {
  return loadWebhooks(configPath);
}

/**
 * Generate HMAC signature for webhook payload
 */
export function generateWebhookSignature(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = generateWebhookSignature(payload, secret);
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

import { timingSafeEqual } from 'crypto';
