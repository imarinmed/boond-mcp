import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BoondAPIClient } from '../../api/client.js';
import {
  searchParamsSchema,
  documentIdSchema,
  updateDocumentWithIdSchema,
} from '../../types/schemas.js';
import type { Document } from '../../types/boond.js';
import { handleToolError } from '../../utils/error-handling.js';
import {
  pickDate,
  pickName,
  pickType,
  readNumber,
  readString,
  formatUnknownWithDebug,
} from '../../utils/normalization.js';
import { READ_TOOL_ANNOTATIONS, WRITE_TOOL_ANNOTATIONS } from '../../utils/tool-registry.js';
import { dryRunSchema, dryRunResponse } from '../../utils/dry-run.js';

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

function formatSize(sizeInBytes: number): string {
  if (!Number.isFinite(sizeInBytes) || sizeInBytes < 0) {
    return 'unknown';
  }

  return `${(sizeInBytes / 1024).toFixed(2)} KB`;
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
        description: 'Deprecated: global documents search is not supported by Boond API',
        annotations: READ_TOOL_ANNOTATIONS,
        inputSchema: searchParamsSchema.shape,
      },
      async params => {
        searchParamsSchema.parse(params);
  
        return {
          content: [
            {
              type: 'text',
              text: 'Global document search is not supported by Boond API. Retrieve documents from an owning record (for example a candidate, resource, company, project, or contract), then fetch the document by its ID with boond_documents_get.',
            },
          ],
          isError: true,
        };
      }
    );

  server.registerTool(
    'boond_documents_get',
    {
      description: 'Get a document by ID',
      annotations: READ_TOOL_ANNOTATIONS,
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
      annotations: WRITE_TOOL_ANNOTATIONS,
      inputSchema: updateDocumentWithIdSchema.merge(dryRunSchema).shape,
    },
    async params => {
      try {
        const validated = updateDocumentWithIdSchema.merge(dryRunSchema).parse(params);
        const { id, dryRun, ...updateData } = validated;
        if (dryRun) {
          return dryRunResponse('Update Document', { id, ...updateData });
        }
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
      description: 'Get document download URL and metadata',
      annotations: READ_TOOL_ANNOTATIONS,
      inputSchema: documentIdSchema.shape,
    },
    async params => {
      try {
        const validated = documentIdSchema.parse(params);
        const download = await client.downloadDocument(validated.id);

        const text = [
          '📥 Document Download',
          `Filename: ${download.filename}`,
          `URL: ${download.url}`,
          `Content-Type: ${download.contentType}`,
        ].join('\n');

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleToolError(error, 'retrieving download URL for', 'Document');
      }
    }
  );
}
