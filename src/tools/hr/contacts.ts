/**
 * Contact tools registration
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BoondAPIClient } from '../../api/client.js';
import {
  searchParamsSchema,
  createContactSchema,
  contactIdSchema,
  updateContactWithIdSchema,
} from '../../types/schemas.js';
import type { Contact, SearchResponse } from '../../types/boond.js';
import { handleSearchError, handleToolError } from '../../utils/error-handling.js';
import { WRITE_TOOL_ANNOTATIONS, READ_TOOL_ANNOTATIONS } from '../../utils/tool-registry.js';
import { dryRunSchema, dryRunResponse } from '../../utils/dry-run.js';
import { ValidationError } from '../../api/client.js';

function pickContactName(contact: Contact): string {
  const record = contact as unknown as Record<string, unknown>;
  const first =
    (typeof contact.firstName === 'string' ? contact.firstName : undefined) ||
    (typeof record['firstName'] === 'string' ? (record['firstName'] as string) : undefined) ||
    '';
  const last =
    (typeof contact.lastName === 'string' ? contact.lastName : undefined) ||
    (typeof record['lastName'] === 'string' ? (record['lastName'] as string) : undefined) ||
    '';
  const full = `${first} ${last}`.trim();
  return full || `Contact #${contact.id}`;
}

function pickContactEmail(contact: Contact): string {
  const record = contact as unknown as Record<string, unknown>;
  const candidates = [
    contact.email,
    record['email'],
    record['email1'],
    record['email_1'],
    record['mail'],
  ];
  for (const value of candidates) {
    if (typeof value === 'string' && value.trim().length > 0) return value;
  }
  return 'not available';
}

function pickContactCompanyId(contact: Contact): string {
  const record = contact as unknown as Record<string, unknown>;
  const candidates = [
    contact.companyId,
    record['companyId'],
    record['clientId'],
    record['accountId'],
  ];
  for (const value of candidates) {
    if (typeof value === 'string' && value.trim().length > 0) return value;
    if (typeof value === 'number') return String(value);
  }
  return 'unknown';
}

/**
 * Format contact list for display
 */
function formatContactList(result: SearchResponse<Contact>): string {
  if (result.data.length === 0) {
    return 'No contacts found.';
  }

  const contacts = result.data.map(contact => {
    const lines: string[] = [];
    lines.push(`👤 ${pickContactName(contact)} (ID: ${contact.id})`);
    lines.push(`   Email: ${pickContactEmail(contact)}`);
    if (contact.phone) lines.push(`   Phone: ${contact.phone}`);
    lines.push(`   Company ID: ${pickContactCompanyId(contact)}`);
    if (contact.jobTitle) lines.push(`   Job Title: ${contact.jobTitle}`);
    if (contact.department) lines.push(`   Department: ${contact.department}`);
    return lines.join('\n');
  });

  const summary = `Found ${result.data.length} contact(s) (Page ${result.pagination.page}/${Math.ceil(result.pagination.total / result.pagination.limit)} of ${result.pagination.total} total)`;

  return `${summary}\n\n${contacts.join('\n\n')}`;
}

/**
 * Format single contact details
 */
function formatContact(contact: Contact): string {
  const lines: string[] = [];
  lines.push(`👤 Contact: ${pickContactName(contact)}`);
  lines.push(`ID: ${contact.id}`);
  lines.push(`Email: ${pickContactEmail(contact)}`);
  if (contact.phone) lines.push(`Phone: ${contact.phone}`);
  lines.push(`Company ID: ${pickContactCompanyId(contact)}`);
  if (contact.jobTitle) lines.push(`Job Title: ${contact.jobTitle}`);
  if (contact.department) lines.push(`Department: ${contact.department}`);
  if (contact.createdAt) lines.push(`Created: ${contact.createdAt}`);
  if (contact.updatedAt) lines.push(`Updated: ${contact.updatedAt}`);

  return lines.join('\n');
}

export function registerContactTools(server: McpServer, client: BoondAPIClient): void {
  /**
   * boond_contacts_search - Search contacts
   */
  server.registerTool(
    'boond_contacts_search',
    {
      description: 'Search contacts by name, email, or other criteria',
      inputSchema: searchParamsSchema.shape,
      annotations: READ_TOOL_ANNOTATIONS,
    },
    async params => {
      try {
        const validated = searchParamsSchema.parse(params);
        const result = await client.searchContacts(validated);
        const text = formatContactList(result);

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleSearchError(error, 'contacts');
      }
    }
  );

  /**
   * boond_contacts_get - Get contact by ID
   */
  server.registerTool(
    'boond_contacts_get',
    {
      description: 'Get a contact by ID',
      inputSchema: contactIdSchema.shape,
      annotations: READ_TOOL_ANNOTATIONS,
    },
    async params => {
      try {
        const validated = contactIdSchema.parse(params);
        const contact = await client.getContact(validated.id);
        const text = formatContact(contact);

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleToolError(error, 'retrieving', 'Contact');
      }
    }
  );

  /**
   * boond_contacts_create - Create new contact
   */
  server.registerTool(
    'boond_contacts_create',
    {
      description: 'Create a new contact',
      inputSchema: createContactSchema.merge(dryRunSchema).shape,
      annotations: WRITE_TOOL_ANNOTATIONS,
    },
    async params => {
      try {
        const validated = createContactSchema.merge(dryRunSchema).parse(params);
        const { dryRun, ...data } = validated;
        if (dryRun) {
          return dryRunResponse('Create Contact', data);
        }
        const contact = await client.createContact(data);
        const text = formatContact(contact);

        return {
          content: [
            {
              type: 'text',
              text: `Contact created successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'creating', 'Contact');
      }
    }
  );

  /**
   * boond_contacts_update - Update existing contact
   */
  server.registerTool(
    'boond_contacts_update',
    {
      description: 'Update an existing contact',
      inputSchema: updateContactWithIdSchema.merge(dryRunSchema).shape,
      annotations: WRITE_TOOL_ANNOTATIONS,
    },
    async params => {
      try {
        const validated = updateContactWithIdSchema.merge(dryRunSchema).parse(params);
        const { dryRun, id, ...updateData } = validated;
        if (dryRun) {
          return dryRunResponse('Update Contact', { id, ...updateData });
        }

        if (!id) {
          throw new ValidationError('Contact ID is required');
        }

        const contact = await client.updateContact(id, updateData);
        const text = formatContact(contact);

        return {
          content: [
            {
              type: 'text',
              text: `Contact updated successfully!\n\n${text}`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'updating', 'Contact');
      }
    }
  );

  /**
   * boond_contacts_delete - Delete contact
   */
  server.registerTool(
    'boond_contacts_delete',
    {
      description: 'Delete a contact by ID',
      inputSchema: contactIdSchema.merge(dryRunSchema).shape,
      annotations: WRITE_TOOL_ANNOTATIONS,
    },
    async params => {
      try {
        const validated = contactIdSchema.merge(dryRunSchema).parse(params);
        const { dryRun, ...rest } = validated;
        if (dryRun) {
          return dryRunResponse('Delete Contact', { id: rest.id });
        }
        await client.deleteContact(rest.id);
        return {
          content: [
            {
              type: 'text',
              text: `Contact ${rest.id} deleted successfully.`,
            },
          ],
        };
      } catch (error) {
        return handleToolError(error, 'deleting', 'Contact');
      }
    }
  );
}
