import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

const DEFAULT_MAX_REQUESTS = 60;
const DEFAULT_WINDOW_MS = 60000;

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  enabled: boolean;
}

interface RateLimitState {
  windowStartMs: number;
  requestCount: number;
}

interface RateLimitDecision {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAtMs: number;
  retryAfterSeconds?: number;
}

type RateLimitedToolHandler = (
  ...args: readonly unknown[]
) => Promise<CallToolResult> | CallToolResult;

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function buildRateLimitHeaders(decision: RateLimitDecision): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(decision.limit),
    'X-RateLimit-Remaining': String(decision.remaining),
    'X-RateLimit-Reset': String(Math.ceil(decision.resetAtMs / 1000)),
  };

  if (decision.retryAfterSeconds !== undefined) {
    headers['Retry-After'] = String(decision.retryAfterSeconds);
  }

  return headers;
}

function withRateLimitMetadata(
  result: CallToolResult,
  decision: RateLimitDecision
): CallToolResult {
  const headers = buildRateLimitHeaders(decision);

  return {
    ...result,
    _meta: {
      ...(result._meta ?? {}),
      rateLimit: {
        limit: decision.limit,
        remaining: decision.remaining,
        resetAt: decision.resetAtMs,
        retryAfter: decision.retryAfterSeconds,
      },
      'http.headers': headers,
    },
  };
}

function createRateLimitExceededResult(decision: RateLimitDecision): CallToolResult {
  const waitSeconds = decision.retryAfterSeconds ?? 1;

  return withRateLimitMetadata(
    {
      content: [
        {
          type: 'text',
          text: `Rate limit exceeded. Try again in ${waitSeconds} second(s).`,
        },
      ],
      isError: true,
    },
    decision
  );
}

export class FixedWindowRateLimiter {
  private readonly states = new Map<string, RateLimitState>();

  public constructor(
    private readonly config: RateLimitConfig,
    private readonly now: () => number = () => Date.now()
  ) {}

  public getConfig(): RateLimitConfig {
    return this.config;
  }

  public consume(key: string = 'global'): RateLimitDecision {
    const nowMs = this.now();

    const existingState = this.states.get(key);
    const shouldResetWindow =
      !existingState || nowMs - existingState.windowStartMs >= this.config.windowMs;

    const currentState: RateLimitState = shouldResetWindow
      ? { windowStartMs: nowMs, requestCount: 0 }
      : existingState;

    const resetAtMs = currentState.windowStartMs + this.config.windowMs;

    if (currentState.requestCount >= this.config.maxRequests) {
      this.states.set(key, currentState);

      const retryAfterSeconds = Math.max(1, Math.ceil((resetAtMs - nowMs) / 1000));

      return {
        allowed: false,
        limit: this.config.maxRequests,
        remaining: 0,
        resetAtMs,
        retryAfterSeconds,
      };
    }

    currentState.requestCount += 1;
    this.states.set(key, currentState);

    return {
      allowed: true,
      limit: this.config.maxRequests,
      remaining: this.config.maxRequests - currentState.requestCount,
      resetAtMs,
    };
  }
}

export function getRateLimitConfigFromEnv(env: NodeJS.ProcessEnv = process.env): RateLimitConfig {
  const maxRequests = parsePositiveInt(env['MCP_RATE_LIMIT_MAX_REQUESTS'], DEFAULT_MAX_REQUESTS);
  const windowMs = parsePositiveInt(env['MCP_RATE_LIMIT_WINDOW_MS'], DEFAULT_WINDOW_MS);

  const enabled =
    env['MCP_RATE_LIMIT_ENABLED'] === undefined
      ? true
      : env['MCP_RATE_LIMIT_ENABLED'].toLowerCase() !== 'false';

  return {
    maxRequests,
    windowMs,
    enabled,
  };
}

export function createRateLimiterFromEnv(
  env: NodeJS.ProcessEnv = process.env
): FixedWindowRateLimiter {
  return new FixedWindowRateLimiter(getRateLimitConfigFromEnv(env));
}

export function wrapToolHandlerWithRateLimit(
  handler: RateLimitedToolHandler,
  limiter: FixedWindowRateLimiter,
  key: string = 'global'
): RateLimitedToolHandler {
  return async (...args: readonly unknown[]): Promise<CallToolResult> => {
    if (!limiter.getConfig().enabled) {
      return handler(...args);
    }

    const decision = limiter.consume(key);

    if (!decision.allowed) {
      return createRateLimitExceededResult(decision);
    }

    const result = await handler(...args);
    return withRateLimitMetadata(result, decision);
  };
}

export function applyRateLimitingToServer(
  server: McpServer,
  limiter: FixedWindowRateLimiter
): void {
  if (!limiter.getConfig().enabled) {
    return;
  }

  const originalRegisterTool = server.registerTool.bind(server);

  const patchedRegisterTool = ((name: string, config: unknown, callback: unknown) => {
    const wrapped = wrapToolHandlerWithRateLimit(
      callback as unknown as RateLimitedToolHandler,
      limiter
    );

    return originalRegisterTool(name, config as never, wrapped as never);
  }) as McpServer['registerTool'];

  server.registerTool = patchedRegisterTool;
}
