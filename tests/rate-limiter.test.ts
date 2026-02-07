import { describe, expect, it } from 'vitest';

import {
  FixedWindowRateLimiter,
  getRateLimitConfigFromEnv,
  wrapToolHandlerWithRateLimit,
} from '../src/utils/rate-limiter';

describe('rate limiter', () => {
  it('uses sensible defaults when env vars are missing', () => {
    const config = getRateLimitConfigFromEnv({});

    expect(config.enabled).toBe(true);
    expect(config.maxRequests).toBe(60);
    expect(config.windowMs).toBe(60000);
  });

  it('reads and validates env-based configuration', () => {
    const config = getRateLimitConfigFromEnv({
      MCP_RATE_LIMIT_MAX_REQUESTS: '15',
      MCP_RATE_LIMIT_WINDOW_MS: '30000',
      MCP_RATE_LIMIT_ENABLED: 'false',
    });

    expect(config.enabled).toBe(false);
    expect(config.maxRequests).toBe(15);
    expect(config.windowMs).toBe(30000);
  });

  it('enforces a fixed window and resets after the window', () => {
    let nowMs = 1000;
    const limiter = new FixedWindowRateLimiter(
      {
        enabled: true,
        maxRequests: 2,
        windowMs: 10000,
      },
      () => nowMs
    );

    const first = limiter.consume('global');
    const second = limiter.consume('global');
    const third = limiter.consume('global');

    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(1);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(0);
    expect(third.allowed).toBe(false);
    expect(third.retryAfterSeconds).toBeGreaterThan(0);

    nowMs = 12001;
    const afterReset = limiter.consume('global');

    expect(afterReset.allowed).toBe(true);
    expect(afterReset.remaining).toBe(1);
  });

  it('adds rate-limit metadata and headers to successful responses', async () => {
    const limiter = new FixedWindowRateLimiter({
      enabled: true,
      maxRequests: 3,
      windowMs: 60000,
    });

    const wrapped = wrapToolHandlerWithRateLimit(async () => {
      return {
        content: [{ type: 'text', text: 'ok' }],
      };
    }, limiter);

    const result = await wrapped();
    const meta = result._meta as Record<string, unknown>;
    const headers = meta['http.headers'] as Record<string, string>;
    const rateLimit = meta.rateLimit as Record<string, number>;

    expect(headers['X-RateLimit-Limit']).toBe('3');
    expect(headers['X-RateLimit-Remaining']).toBe('2');
    expect(headers['X-RateLimit-Reset']).toBeDefined();
    expect(rateLimit.limit).toBe(3);
    expect(rateLimit.remaining).toBe(2);
  });

  it('returns deterministic error response when limit is exceeded', async () => {
    const limiter = new FixedWindowRateLimiter({
      enabled: true,
      maxRequests: 1,
      windowMs: 60000,
    });

    const wrapped = wrapToolHandlerWithRateLimit(async () => {
      return {
        content: [{ type: 'text', text: 'ok' }],
      };
    }, limiter);

    await wrapped();
    const exceeded = await wrapped();
    const firstContent = exceeded.content[0];

    expect(exceeded.isError).toBe(true);
    expect(firstContent?.type).toBe('text');
    if (firstContent?.type === 'text') {
      expect(firstContent.text).toContain('Rate limit exceeded');
    }

    const meta = exceeded._meta as Record<string, unknown>;
    const headers = meta['http.headers'] as Record<string, string>;

    expect(headers['X-RateLimit-Remaining']).toBe('0');
    expect(headers['Retry-After']).toBeDefined();
  });
});
