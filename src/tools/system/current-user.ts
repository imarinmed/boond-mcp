import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { BoondAPIClient } from '../../api/client.js';
import type { CurrentUser } from '../../types/boond.js';
import { handleToolError } from '../../utils/error-handling.js';

function formatCurrentUser(currentUser: CurrentUser): string {
  const lines: string[] = [];
  const fullName = `${currentUser.firstName} ${currentUser.lastName}`.trim();

  lines.push(`👤 Current User: ${fullName || currentUser.login || currentUser.id}`);
  lines.push(`ID: ${currentUser.id}`);
  if (currentUser.email) lines.push(`Email: ${currentUser.email}`);
  if (currentUser.phone) lines.push(`Phone: ${currentUser.phone}`);
  if (currentUser.login) lines.push(`Login: ${currentUser.login}`);
  if (currentUser.level) lines.push(`Level: ${currentUser.level}`);
  if (currentUser.language) lines.push(`Language: ${currentUser.language}`);
  if (currentUser.currency !== undefined) lines.push(`Currency: ${currentUser.currency}`);
  if (currentUser.isOwner !== undefined) lines.push(`Owner: ${currentUser.isOwner ? 'Yes' : 'No'}`);
  if (currentUser.createdAt) lines.push(`Created: ${currentUser.createdAt}`);
  if (currentUser.updatedAt) lines.push(`Updated: ${currentUser.updatedAt}`);

  return lines.join('\n');
}

export function registerCurrentUserTools(server: McpServer, client: BoondAPIClient): void {
  server.registerTool(
    'boond_current_user_get',
    {
      description:
        'Get the authenticated current user profile and identity context from the application.',
      inputSchema: z.object({}).shape,
    },
    async () => {
      try {
        const currentUser = await client.getCurrentUser();
        const text = formatCurrentUser(currentUser);

        return {
          content: [{ type: 'text', text }],
        };
      } catch (error) {
        return handleToolError(error, 'retrieving', 'Current User');
      }
    }
  );
}
