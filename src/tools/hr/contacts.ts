/**
 * Contact tools registration
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { BoondAPIClient } from "../../api/client.js";
import {
  searchParamsSchema,
  createContactSchema,
  contactIdSchema,
  updateContactWithIdSchema,
} from "../../types/schemas.js";
import type { Contact, SearchResponse } from "../../types/boond.js";
import { handleSearchError, handleToolError } from "../../utils/error-handling.js";
import { ValidationError } from "../../api/client.js";

/**
 * Format contact list for display
 */
function formatContactList(result: SearchResponse<Contact>): string {
  if (result.data.length === 0) {
    return "No contacts found.";
  }

  const contacts = result.data.map((contact) => {
    const lines: string[] = [];
    lines.push(`👤 ${contact.firstName} ${contact.lastName} (ID: ${contact.id})`);
    lines.push(`   Email: ${contact.email}`);
    if (contact.phone) lines.push(`   Phone: ${contact.phone}`);
    lines.push(`   Company ID: ${contact.companyId}`);
    if (contact.jobTitle) lines.push(`   Job Title: ${contact.jobTitle}`);
    if (contact.department) lines.push(`   Department: ${contact.department}`);
    return lines.join("\n");
  });

  const summary = `Found ${result.data.length} contact(s) (Page ${result.pagination.page}/${Math.ceil(result.pagination.total / result.pagination.limit)} of ${result.pagination.total} total)`;

  return `${summary}\n\n${contacts.join("\n\n")}`;
}

/**
 * Format single contact details
 */
function formatContact(contact: Contact): string {
  const lines: string[] = [];
  lines.push(`👤 Contact: ${contact.firstName} ${contact.lastName}`);
  lines.push(`ID: ${contact.id}`);
  lines.push(`Email: ${contact.email}`);
  if (contact.phone) lines.push(`Phone: ${contact.phone}`);
  lines.push(`Company ID: ${contact.companyId}`);
  if (contact.jobTitle) lines.push(`Job Title: ${contact.jobTitle}`);
  if (contact.department) lines.push(`Department: ${contact.department}`);
  if (contact.createdAt) lines.push(`Created: ${contact.createdAt}`);
  if (contact.updatedAt) lines.push(`Updated: ${contact.updatedAt}`);

  return lines.join("\n");
}

export function registerContactTools(
  server: McpServer,
  client: BoondAPIClient
): void {
  /**
   * boond_contacts_search - Search contacts
   */
  server.registerTool(
    "boond_contacts_search",
    {
      description: "Search contacts by name, email, or other criteria",
      inputSchema: searchParamsSchema.shape,
    },
    async (params) => {
      try {
        const validated = searchParamsSchema.parse(params);
        const result = await client.searchContacts(validated);
        const text = formatContactList(result);

        return {
          content: [{ type: "text", text }],
        };
      } catch (error) {
        return handleSearchError(error, "contacts");
      }
    }
  );

  /**
   * boond_contacts_get - Get contact by ID
   */
  server.registerTool(
    "boond_contacts_get",
    {
      description: "Get a contact by ID",
      inputSchema: contactIdSchema.shape,
    },
    async (params) => {
      try {
        const validated = contactIdSchema.parse(params);
        const contact = await client.getContact(validated.id);
        const text = formatContact(contact);

        return {
          content: [{ type: "text", text }],
        };
      } catch (error) {
        return handleToolError(error, "retrieving", "Contact");
      }
    }
  );

  /**
   * boond_contacts_create - Create new contact
   */
  server.registerTool(
    "boond_contacts_create",
    {
      description: "Create a new contact",
      inputSchema: createContactSchema.shape,
    },
    async (params) => {
      try {
        const validated = createContactSchema.parse(params);
        const contact = await client.createContact(validated);
        const text = formatContact(contact);

        return {
          content: [
            {
              type: "text",
              text: `Contact created successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, "creating", "Contact");
      }
    }
  );

  /**
   * boond_contacts_update - Update existing contact
   */
  server.registerTool(
    "boond_contacts_update",
    {
      description: "Update an existing contact",
      inputSchema: updateContactWithIdSchema.shape,
    },
    async (params) => {
      try {
        const validated = updateContactWithIdSchema.parse(params);
        const { id, ...updateData } = validated;

        if (!id) {
          throw new ValidationError("Contact ID is required");
        }

        const contact = await client.updateContact(id, updateData);
        const text = formatContact(contact);

        return {
          content: [
            {
              type: "text",
              text: `Contact updated successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, "updating", "Contact");
      }
    }
  );
}
