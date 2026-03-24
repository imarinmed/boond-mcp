import { describe, expect, it, vi } from 'vitest';

import { registerDocumentTools } from '../../src/tools/documents/documents.js';

describe('boond_documents_search behavior', () => {
  it('searches documents through the API and formats the response', async () => {
    const registerTool = vi.fn();
    const mockServer = {
      registerTool,
    };

    const mockClient = {
      searchDocuments: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'doc-123',
            name: 'Contract.pdf',
            type: 'application/pdf',
            size: 102400,
            uploadedAt: '2026-03-23T10:00:00Z',
            uploadedBy: 'ops-42',
            folderId: 'folder-9',
            url: 'https://example.com/doc-123',
          },
        ],
        pagination: { page: 1, limit: 5, total: 1 },
      }),
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

    expect(result?.isError).not.toBe(true);
    expect(result?.content?.[0]?.text).toContain('Found 1 document(s)');
    expect(result?.content?.[0]?.text).toContain('Contract.pdf');
    expect(mockClient.searchDocuments).toHaveBeenCalledWith({
      query: 'contract',
      page: 1,
      limit: 5,
    });
    expect(mockClient.getDocument).not.toHaveBeenCalled();
  });
});
