import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BoondAPIClient } from '../../src/api/client.js';

const originalFetch = global.fetch;

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Map([['content-type', 'application/json']]),
    json: async () => body,
  };
}

describe('contracts endpoint behavior', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock as typeof global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('uses GET /apps/contracts/contracts with pagination only', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        data: [{ id: 'contract-1', type: 'full-time' }],
        pagination: { page: 2, limit: 100, total: 1 },
      })
    );

    const client = new BoondAPIClient('test-token');
    const result = await client.searchContracts({ query: 'ignored', page: 2, limit: 150 });

    expect(result.data).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const firstCallUrl = String(fetchMock.mock.calls[0]?.[0]);
    const firstCallOptions = fetchMock.mock.calls[0]?.[1] as { method?: string };

    expect(firstCallUrl).toContain('/apps/contracts/contracts?page=2&limit=100');
    expect(firstCallUrl).not.toContain('query=');
    expect(firstCallOptions.method).toBe('GET');
  });

  it('keeps getContract by-id endpoint on /contracts/{id}', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        id: 'contract-42',
        type: 'freelance',
      })
    );

    const client = new BoondAPIClient('test-token');
    await client.getContract('contract-42');

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const firstCallUrl = String(fetchMock.mock.calls[0]?.[0]);
    const firstCallOptions = fetchMock.mock.calls[0]?.[1] as { method?: string };

    expect(firstCallUrl).toContain('/contracts/contract-42');
    expect(firstCallOptions.method).toBe('GET');
  });
});
