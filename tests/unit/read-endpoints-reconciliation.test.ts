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

describe('official GET/read endpoint reconciliation', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock as typeof global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('uses GET /apps/quotations/quotations for quotations search', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        data: [{ id: 'q-1', status: 'draft' }],
        pagination: { page: 1, limit: 20, total: 1 },
      })
    );

    const client = new BoondAPIClient('test-token');
    await client.searchQuotations({ query: 'react', page: 1, limit: 20 });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const firstCallUrl = String(fetchMock.mock.calls[0]?.[0]);
    const firstCallOptions = fetchMock.mock.calls[0]?.[1] as { method?: string };

    const requestUrl = new URL(firstCallUrl);

    expect(requestUrl.pathname).toBe('/api/apps/quotations/quotations');
    expect(requestUrl.searchParams.get('query')).toBe('react');
    expect(requestUrl.searchParams.get('page')).toBe('1');
    expect(requestUrl.searchParams.get('limit')).toBe('20');
    expect(firstCallOptions.method).toBe('GET');
  });

  it('uses GET /apps/quotations/quotations/{id} for quotation profile', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        id: 'q-42',
        status: 'sent',
      })
    );

    const client = new BoondAPIClient('test-token');
    await client.getQuotation('q-42');

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const firstCallUrl = String(fetchMock.mock.calls[0]?.[0]);
    const firstCallOptions = fetchMock.mock.calls[0]?.[1] as { method?: string };

    expect(firstCallUrl).toContain('/apps/quotations/quotations/q-42');
    expect(firstCallOptions.method).toBe('GET');
  });

  it('uses GET /application/settings for settings read/search', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        data: [{ id: 's-1', key: 'timezone', value: 'UTC' }],
        pagination: { page: 1, limit: 100, total: 1 },
      })
    );

    const client = new BoondAPIClient('test-token');
    await client.searchSettings();

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const firstCallUrl = String(fetchMock.mock.calls[0]?.[0]);
    const firstCallOptions = fetchMock.mock.calls[0]?.[1] as { method?: string };

    expect(firstCallUrl).toContain('/application/settings');
    expect(firstCallOptions.method).toBe('GET');
  });
});
