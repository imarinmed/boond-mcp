import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BoondAPIClient } from '../../src/api/client.js';
import { searchExpenseReportsSchema } from '../../src/types/schemas.js';

const originalFetch = global.fetch;

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Map([['content-type', 'application/json']]),
    json: async () => body,
  };
}

describe('expense search request shape', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock as typeof global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('sends provided startMonth/endMonth on plural GET route', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        data: [{ id: 'exp-1', total: 100 }],
        pagination: { page: 1, limit: 1, total: 1 },
      })
    );

    const client = new BoondAPIClient('test-token');
    await client.searchExpenseReports({
      startMonth: '2026-01',
      endMonth: '2026-03',
      page: 1,
      limit: 1,
    });

    const firstCallUrl = String(fetchMock.mock.calls[0]?.[0]);
    expect(firstCallUrl).toContain('/expenses-reports?');
    expect(firstCallUrl).toContain('startMonth=2026-01');
    expect(firstCallUrl).toContain('endMonth=2026-03');
  });

  it('derives startMonth/endMonth from startDate/endDate when months are omitted', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        data: [{ id: 'exp-1', total: 100 }],
        pagination: { page: 1, limit: 1, total: 1 },
      })
    );

    const client = new BoondAPIClient('test-token');
    await client.searchExpenseReports({
      startDate: '2026-01-04',
      endDate: '2026-02-19',
      page: 1,
      limit: 1,
    });

    const firstCallUrl = String(fetchMock.mock.calls[0]?.[0]);
    expect(firstCallUrl).toContain('startMonth=2026-01');
    expect(firstCallUrl).toContain('endMonth=2026-02');
  });

  it('uses corrected month shape on plural /expenses-reports/search POST fallback', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(404, { message: 'not found' }))
      .mockResolvedValueOnce(jsonResponse(404, { message: 'not found' }))
      .mockResolvedValueOnce(jsonResponse(404, { message: 'not found' }))
      .mockResolvedValueOnce(
        jsonResponse(200, {
          data: [{ id: 'exp-1', total: 100 }],
          pagination: { page: 1, limit: 1, total: 1 },
        })
      );

    const parsed = searchExpenseReportsSchema.parse({
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      page: 1,
      limit: 1,
    });

    const client = new BoondAPIClient('test-token');
    const result = await client.searchExpenseReports(parsed);

    expect(result.data).toHaveLength(1);
    expect(String(fetchMock.mock.calls[3]?.[0])).toContain('/expenses-reports/search');

    const requestOptions = fetchMock.mock.calls[3]?.[1] as { body?: string };
    const requestBody = JSON.parse(String(requestOptions.body));
    expect(requestBody.startMonth).toBe('2026-01');
    expect(requestBody.endMonth).toBe('2026-01');
  });
});
