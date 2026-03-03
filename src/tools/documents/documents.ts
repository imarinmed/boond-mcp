import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BoondAPIClient } from '../../api/client.js';
import {
  searchParamsSchema,
  documentIdSchema,
  updateDocumentWithIdSchema,
} from '../../types/schemas.js';
import type { Document, SearchResponse } from '../../types/boond.js';
import { handleSearchError, handleToolError } from '../../utils/error-handling.js';
import { enrichItemsWithDetails } from '../../utils/enrichment.js';
import {
  pickDate,
  pickName,
  pickType,
  readNumber,
  readString,
  formatUnknownWithDebug,
} from '../../utils/normalization.js';

function toDocumentRecord(doc: Document): Record<string, unknown> {
  return doc as unknown as Record<string, unknown>;
}

function normalizeDocument(doc: Document): {
  id: string;
  name: string;
  type: string;
  size: number;
  folderId: string;
  uploadedAt: string;
  uploadedBy: string;
  url: string;
  createdAt?: string;
  updatedAt?: string;
} {
  const record = toDocumentRecord(doc);

  const uploadedByCandidates = ['uploadedBy', 'author', 'owner', 'createdBy', 'dependsOnId'];
  const uploadedBy =
    readString(record, uploadedByCandidates) ||
    formatUnknownWithDebug(
      'uploadedBy',
      uploadedByCandidates.map(k => record[k])
    );

  return {
    id: String(doc.id),
    name: pickName(record) || `Document #${doc.id}`,
    type: pickType(record),
    size: readNumber(record, ['size', 'fileSize', 'length', 'bytes']) ?? 0,
    folderId: readString(record, ['folderId', 'directoryId', 'folder', 'parentId']) || 'unknown',
    uploadedAt: pickDate(record, ['uploadedAt', 'uploadedDate', 'createdAt', 'date']),
    uploadedBy,
    url: readString(record, ['url', 'downloadUrl', 'link']) || doc.url || 'unknown',
    ...(doc.createdAt ? { createdAt: doc.createdAt } : {}),
    ...(doc.updatedAt ? { updatedAt: doc.updatedAt } : {}),
  };
}

function shouldEnrichDocument(doc: Document): boolean {
  const normalized = normalizeDocument(doc);
  return (
    normalized.name.startsWith('Document #') ||
    normalized.type === 'unknown' ||
    normalized.uploadedAt === 'unknown' ||
    normalized.uploadedBy === 'unknown' ||
    normalized.url === 'unknown'
  );
}

function formatSize(sizeInBytes: number): string {
  if (!Number.isFinite(sizeInBytes) || sizeInBytes <= 0) {
    return 'unknown';
  }

  return `${(sizeInBytes / 1024).toFixed(2)} KB`;
}

function formatDocumentList(result: SearchResponse<Document>): string {
  if (result.data.length === 0) {
    return 'No documents found.';
  }

  const documents = result.data.map(doc => {
    const normalized = normalizeDocument(doc);
    const lines: string[] = [];
    lines.push(`📄 Document: ${normalized.name} (ID: ${normalized.id})`);
    lines.push(`   Type: ${normalized.type}`);
    lines.push(`   Size: ${formatSize(normalized.size)}`);
    if (normalized.folderId !== 'unknown') lines.push(`   Folder: ${normalized.folderId}`);
    lines.push(`   Uploaded: ${normalized.uploadedAt}`);
    lines.push(`   Uploaded by: ${normalized.uploadedBy}`);
    return lines.join('\n');
  });

  const summary = `Found ${result.data.length} document(s) (Page ${result.pagination.page}/${Math.ceil(result.pagination.total / result.pagination.limit)} of ${result.pagination.total} total)`;

  return `${summary}\n\n${documents.join('\n\n')}`;
}

function formatDocument(doc: Document): string {
  const normalized = normalizeDocument(doc);
  const lines: string[] = [];
  lines.push(`📄 Document: ${normalized.name}`);
  lines.push(`ID: ${normalized.id}`);
  lines.push(`Type: ${normalized.type}`);
  lines.push(`Size: ${formatSize(normalized.size)}`);
  lines.push(`Uploaded: ${normalized.uploadedAt}`);
  lines.push(`Uploaded by: ${normalized.uploadedBy}`);
  if (normalized.folderId !== 'unknown') lines.push(`Folder: ${normalized.folderId}`);
  lines.push(`URL: ${normalized.url}`);
  if (normalized.createdAt) lines.push(`Created: ${normalized.createdAt}`);
  if (normalized.updatedAt) lines.push(`Updated: ${normalized.updatedAt}`);

  return lines.join('\n');
}

export function registerDocumentTools(server: McpServer, client: BoondAPIClient): void {
  server.registerTool(
    'boond_documents_search',
    {
      description: 'Search documents by criteria',
      inputSchema: searchParamsSchema.shape,
    },
    async params => {
      try {
        const validated = searchParamsSchema.parse(params);
        const result = await client.searchDocuments(validated);
        result.data = await enrichItemsWithDetails(
          result.data,
          document => client.getDocument(document.id),
          shouldEnrichDocument,
          10
        );
        result.data = result.data.slice(0, validated.limit);
        const text = formatDocumentList(result);

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleSearchError(error, 'documents');
      }
    }
  );

  server.registerTool(
    'boond_documents_get',
    {
      description: 'Get a document by ID',
      inputSchema: documentIdSchema.shape,
    },
    async params => {
      try {
        const validated = documentIdSchema.parse(params);
        const doc = await client.getDocument(validated.id);
        const text = formatDocument(doc);

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleToolError(error, 'retrieving', 'Document');
      }
    }
  );

  server.registerTool(
    'boond_documents_update',
    {
      description: 'Update document metadata (name, folder)',
      inputSchema: updateDocumentWithIdSchema.shape,
    },
    async params => {
      try {
        const validated = updateDocumentWithIdSchema.parse(params);
        const { id, ...updateData } = validated;
        const doc = await client.updateDocument(id, updateData);
        const text = formatDocument(doc);

        return {
          content: [
            {
              type: 'text',
              text: `Document updated successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'updating', 'Document');
      }
    }
  );

  server.registerTool(
    'boond_documents_download',
    {
      description: 'Get document download URL',
      inputSchema: documentIdSchema.shape,
    },
    async params => {
      try {
        const validated = documentIdSchema.parse(params);
        const doc = await client.getDocument(validated.id);

        const text = `📥 Download: ${doc.name}\nURL: ${doc.url}\nType: ${doc.type}\nSize: ${(doc.size / 1024).toFixed(2)} KB`;

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleToolError(error, 'retrieving download URL for', 'Document');
      }
    }
  );
}
