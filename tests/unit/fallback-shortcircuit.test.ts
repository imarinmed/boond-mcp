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

describe('search fallback short-circuit behavior', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock as typeof global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('short-circuits fallback chain on permission_denied', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(403, { message: 'insufficient permissions on endpoint' }))
      .mockResolvedValueOnce(
        jsonResponse(200, {
          data: [{ id: 'doc-1', name: 'Should not be reached' }],
          pagination: { page: 1, limit: 10, total: 1 },
        })
      );

    const client = new BoondAPIClient('test-token');

    await expect(client.searchDocuments({ query: 'contract', page: 1, limit: 10 })).rejects.toThrow(
      'Forbidden: insufficient permissions for this endpoint'
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/documents?');
  });

  it('short-circuits fallback chain on provider_blocked', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse(403, {
          message: 'Attention required. Cloudflare challenge',
        })
      )
      .mockResolvedValueOnce(
        jsonResponse(200, {
          data: [{ id: 'doc-1', name: 'Should not be reached' }],
          pagination: { page: 1, limit: 10, total: 1 },
        })
      );

    const client = new BoondAPIClient('test-token');

    await expect(client.searchDocuments({ query: 'contract', page: 1, limit: 10 })).rejects.toMatchObject(
      {
        statusCode: 403,
        code: 'CLOUDFLARE_BLOCK',
      }
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/documents?');
  });

  it('short-circuits expense fallback chain on permission_denied', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(403, { message: 'insufficient permissions on endpoint' }))
      .mockResolvedValueOnce(
        jsonResponse(200, {
          data: [{ id: 'exp-1', total: 100 }],
          pagination: { page: 1, limit: 10, total: 1 },
        })
      );

    const client = new BoondAPIClient('test-token');

    await expect(client.searchExpenseReports({ query: 'travel', page: 1, limit: 10 })).rejects.toThrow(
      'Forbidden: insufficient permissions for this endpoint'
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/expenses-reports?');
  });

  it('short-circuits expense fallback chain on provider_blocked', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse(403, {
          message: 'Attention required. Cloudflare challenge',
        })
      )
      .mockResolvedValueOnce(
        jsonResponse(200, {
          data: [{ id: 'exp-1', total: 100 }],
          pagination: { page: 1, limit: 10, total: 1 },
        })
      );

    const client = new BoondAPIClient('test-token');

    await expect(client.searchExpenseReports({ query: 'travel', page: 1, limit: 10 })).rejects.toMatchObject(
      {
        statusCode: 403,
        code: 'CLOUDFLARE_BLOCK',
      }
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/expenses-reports?');
  });

  it('continues expense fallbacks after 422 and succeeds on a later endpoint', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(422, { message: 'Validation failed' }))
      .mockResolvedValueOnce(jsonResponse(404, { message: 'Not found' }))
      .mockResolvedValueOnce(
        jsonResponse(200, {
          data: [{ id: 'exp-1', total: 100 }],
          pagination: { page: 1, limit: 10, total: 1 },
        })
      );

    const client = new BoondAPIClient('test-token');
    const result = await client.searchExpenseReports({ query: 'travel', page: 1, limit: 10 });

    expect(result.data).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/expenses-reports?');
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain('/expense-reports?');
    expect(String(fetchMock.mock.calls[2]?.[0])).toContain('/expenses-reports/search?');
  });
});
