import { describe, expect, it, vi } from 'vitest';

import { registerDocumentTools } from '../../src/tools/documents/documents.js';

describe('boond_documents_search deprecation behavior', () => {
  it('returns a deprecation error message without probing API endpoints', async () => {
    const registerTool = vi.fn();
    const mockServer = {
      registerTool,
    };

    const mockClient = {
      searchDocuments: vi.fn(),
      getDocument: vi.fn(),
      updateDocument: vi.fn(),
    };

    registerDocumentTools(mockServer as never, mockClient as never);

    const searchToolCall = registerTool.mock.calls.find(
      (call: unknown[]) => call[0] === 'boond_documents_search'
    );

    expect(searchToolCall).toBeDefined();

    const handler = searchToolCall?.[2] as ((params: unknown) => Promise<any>) | undefined;
    const result = await handler?.({ query: 'contract', page: 1, limit: 5 });

    expect(result?.isError).toBe(true);
    expect(result?.content?.[0]?.text).toContain(
      'Global document search is not supported by Boond API'
    );
    expect(result?.content?.[0]?.text).toContain('owning record');
    expect(mockClient.searchDocuments).not.toHaveBeenCalled();
    expect(mockClient.getDocument).not.toHaveBeenCalled();
  });
});
