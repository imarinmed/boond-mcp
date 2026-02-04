import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { BoondAPIClient } from "../../api/client.js";
import {
  searchParamsSchema,
  documentIdSchema,
  updateDocumentWithIdSchema,
} from "../../types/schemas.js";
import type { Document, SearchResponse } from "../../types/boond.js";
import { handleSearchError, handleToolError } from "../../utils/error-handling.js";

function formatDocumentList(result: SearchResponse<Document>): string {
  if (result.data.length === 0) {
    return "No documents found.";
  }

  const documents = result.data.map((doc) => {
    const lines: string[] = [];
    lines.push(`📄 Document: ${doc.name} (ID: ${doc.id})`);
    lines.push(`   Type: ${doc.type}`);
    lines.push(`   Size: ${(doc.size / 1024).toFixed(2)} KB`);
    if (doc.folderId) lines.push(`   Folder: ${doc.folderId}`);
    lines.push(`   Uploaded: ${doc.uploadedAt}`);
    lines.push(`   Uploaded by: ${doc.uploadedBy}`);
    return lines.join("\n");
  });

  const summary = `Found ${result.data.length} document(s) (Page ${result.pagination.page}/${Math.ceil(result.pagination.total / result.pagination.limit)} of ${result.pagination.total} total)`;

  return `${summary}\n\n${documents.join("\n\n")}`;
}

function formatDocument(doc: Document): string {
  const lines: string[] = [];
  lines.push(`📄 Document: ${doc.name}`);
  lines.push(`ID: ${doc.id}`);
  lines.push(`Type: ${doc.type}`);
  lines.push(`Size: ${(doc.size / 1024).toFixed(2)} KB`);
  lines.push(`Uploaded: ${doc.uploadedAt}`);
  lines.push(`Uploaded by: ${doc.uploadedBy}`);
  if (doc.folderId) lines.push(`Folder: ${doc.folderId}`);
  lines.push(`URL: ${doc.url}`);
  if (doc.createdAt) lines.push(`Created: ${doc.createdAt}`);
  if (doc.updatedAt) lines.push(`Updated: ${doc.updatedAt}`);

  return lines.join("\n");
}

export function registerDocumentTools(
  server: McpServer,
  client: BoondAPIClient
): void {
  server.registerTool(
    "boond_documents_search",
    {
      description: "Search documents by criteria",
      inputSchema: searchParamsSchema.shape,
    },
    async (params) => {
      try {
        const validated = searchParamsSchema.parse(params);
        const result = await client.searchDocuments(validated);
        const text = formatDocumentList(result);

        return {
          content: [{ type: "text", text }],
        };
      } catch (error) {
        return handleSearchError(error, "documents");
      }
    }
  );

  server.registerTool(
    "boond_documents_get",
    {
      description: "Get a document by ID",
      inputSchema: documentIdSchema.shape,
    },
    async (params) => {
      try {
        const validated = documentIdSchema.parse(params);
        const doc = await client.getDocument(validated.id);
        const text = formatDocument(doc);

        return {
          content: [{ type: "text", text }],
        };
      } catch (error) {
        return handleToolError(error, "retrieving", "Document");
      }
    }
  );

  server.registerTool(
    "boond_documents_update",
    {
      description: "Update document metadata (name, folder)",
      inputSchema: updateDocumentWithIdSchema.shape,
    },
    async (params) => {
      try {
        const validated = updateDocumentWithIdSchema.parse(params);
        const { id, ...updateData } = validated;
        const doc = await client.updateDocument(id, updateData);
        const text = formatDocument(doc);

        return {
          content: [
            {
              type: "text",
              text: `Document updated successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, "updating", "Document");
      }
    }
  );

  server.registerTool(
    "boond_documents_download",
    {
      description: "Get document download URL",
      inputSchema: documentIdSchema.shape,
    },
    async (params) => {
      try {
        const validated = documentIdSchema.parse(params);
        const doc = await client.getDocument(validated.id);

        const text = `📥 Download: ${doc.name}\nURL: ${doc.url}\nType: ${doc.type}\nSize: ${(doc.size / 1024).toFixed(2)} KB`;

        return {
          content: [{ type: "text", text }],
        };
      } catch (error) {
        return handleToolError(error, "retrieving download URL for", "Document");
      }
    }
  );
}
