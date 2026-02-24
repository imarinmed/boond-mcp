import { describe, it, expect, beforeEach } from 'vitest';
import { mockClient } from '../mocks/mock-api-client.js';

describe('Documents Domain Tools', () => {
  beforeEach(() => {
    mockClient.reset();
  });

  describe('Documents', () => {
    it('should search documents', async () => {
      const result = await mockClient.searchDocuments({});
      expect(result.data).toHaveLength(5);
      expect(result.data[0].type).toBeDefined();
    });

    it('should search documents with query', async () => {
      const result = await mockClient.searchDocuments({ query: 'contract' });
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should get document by id', async () => {
      const result = await mockClient.getDocument('doc-123');
      expect(result.id).toBe('doc-123');
      expect(result.url).toBeDefined();
    });

    it('should update document', async () => {
      const data = { name: 'Updated Contract.pdf' };
      const result = await mockClient.updateDocument('doc-123', data);
      expect(result.name).toBe('Updated Contract.pdf');
    });

    it('should delete document', async () => {
      await mockClient.deleteDocument('doc-123');
      expect(mockClient.calls[0].method).toBe('deleteDocument');
    });
  });
});
