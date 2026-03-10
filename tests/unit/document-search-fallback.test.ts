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

describe('document search fallback behavior', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock as typeof global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('continues on 404 and succeeds on a later compatible endpoint', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(404, { message: 'Not found' }))
      .mockResolvedValueOnce(
        jsonResponse(200, {
          data: [{ id: 'doc-1', name: 'Contract.pdf' }],
          pagination: { page: 1, limit: 10, total: 1 },
        })
      );

    const client = new BoondAPIClient('test-token');
    const result = await client.searchDocuments({ query: 'contract', page: 1, limit: 10 });

    expect(result.data).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/documents?');
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain('/documents/search?');
  });

  it('fails fast on 422 without trying later fallbacks', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(404, { message: 'Not found' }))
      .mockResolvedValueOnce(jsonResponse(422, { message: 'Bad query shape' }));

    const client = new BoondAPIClient('test-token');

    await expect(
      client.searchDocuments({ query: 'contract', page: 1, limit: 10 })
    ).rejects.toMatchObject({
      statusCode: 422,
      code: 'DOCUMENT_SEARCH_VALIDATION_ERROR',
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('never probes POST /documents as a search fallback', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(404, { message: 'Not found' }))
      .mockResolvedValueOnce(jsonResponse(405, { message: 'Method not allowed' }))
      .mockResolvedValueOnce(jsonResponse(404, { message: 'Not found' }))
      .mockResolvedValueOnce(jsonResponse(404, { message: 'Not found' }))
      .mockResolvedValueOnce(jsonResponse(405, { message: 'Method not allowed' }));

    const client = new BoondAPIClient('test-token');

    await expect(
      client.searchDocuments({ query: 'contract', page: 1, limit: 10 })
    ).rejects.toMatchObject({
      code: 'DOCUMENT_SEARCH_UNAVAILABLE',
    });

    expect(fetchMock).toHaveBeenCalledTimes(5);
    const calledUrls = fetchMock.mock.calls.map(call => String(call[0]));
    expect(calledUrls.some(url => url.endsWith('/documents'))).toBe(false);
  });

  it('surfaces the exact endpoint in the 422 validation error', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(422, { message: 'Validation failed' }));

    const client = new BoondAPIClient('test-token');

    await expect(client.searchDocuments({ query: 'x', page: 1, limit: 1 })).rejects.toThrow(
      'Document search validation failed on GET /documents?query=x&page=1&limit=1'
    );
  });

  it('throws the compatibility exhaustion error after all supported attempts fail', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(404, { message: 'Not found' }))
      .mockResolvedValueOnce(jsonResponse(404, { message: 'Not found' }))
      .mockResolvedValueOnce(jsonResponse(405, { message: 'Method not allowed' }))
      .mockResolvedValueOnce(jsonResponse(405, { message: 'Method not allowed' }))
      .mockResolvedValueOnce(jsonResponse(404, { message: 'Not found' }));

    const client = new BoondAPIClient('test-token');

    await expect(client.searchDocuments({ query: 'x', page: 1, limit: 1 })).rejects.toMatchObject({
      statusCode: 404,
      code: 'DOCUMENT_SEARCH_UNAVAILABLE',
      message:
        'Document search failed: no compatible documents search endpoint responded successfully (tried GET /documents, GET /documents/search, POST /documents/search, GET /documents/list, POST /documents/list).',
    });
  });

  it('keeps POST search payload for the dedicated search endpoint', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(404, { message: 'Not found' }))
      .mockResolvedValueOnce(jsonResponse(404, { message: 'Not found' }))
      .mockResolvedValueOnce(
        jsonResponse(200, {
          data: [],
          pagination: { page: 2, limit: 15, total: 0 },
        })
      );

    const client = new BoondAPIClient('test-token');
    await client.searchDocuments({ query: 'proposal', page: 2, limit: 15 });

    const thirdCall = fetchMock.mock.calls[2];
    expect(thirdCall?.[1]?.method).toBe('POST');
    expect(thirdCall?.[1]?.body).toBe(JSON.stringify({ query: 'proposal', page: 2, limit: 15 }));
  });
});
