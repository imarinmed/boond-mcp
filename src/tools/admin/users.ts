import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { User } from '../../types/auth.js';
import { generateApiKey, hashApiKey, maskApiKey } from '../../utils/auth.js';
import { loadUsers, saveUsers } from '../../utils/config.js';
import { getAuthContext } from '../../utils/auth-middleware.js';

export function registerAdminTools(server: McpServer, usersConfigPath: string): void {
  // Get users helper
  const getUsers = (): User[] => loadUsers(usersConfigPath);
  const saveUsersList = (users: User[]) => saveUsers(usersConfigPath, users);

  // Register boond_admin_users_list
  server.registerTool(
    'boond_admin_users_list',
    {
      description: 'List all users (Admin only)',
      inputSchema: z.object({}).shape,
    },
    async (_params, context) => {
      try {
        const authContext = getAuthContext(context);
        if (!authContext) {
          return {
            content: [{ type: 'text', text: 'Error: Authentication required' }],
            isError: true,
          };
        }

        if (authContext.role !== 'admin') {
          return {
            content: [{ type: 'text', text: 'Error: Admin access required' }],
            isError: true,
          };
        }

        const users = getUsers();

        if (users.length === 0) {
          return {
            content: [{ type: 'text', text: 'No users configured.' }],
          };
        }

        const lines = users.map(user => {
          const maskedKey = maskApiKey(user.apiKeyHash);
          return [
            `👤 ${user.name}`,
            `  ID: ${user.id}`,
            `  Email: ${user.email}`,
            `  Role: ${user.role.toUpperCase()}`,
            `  API Key: ${maskedKey}`,
            `  Created: ${user.createdAt}`,
            `  Status: ${user.isActive ? 'Active' : 'Inactive'}`,
          ].join('\n');
        });

        return {
          content: [{ type: 'text', text: `Users (${users.length}):\n\n${lines.join('\n\n')}` }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error listing users: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Register boond_admin_users_create
  const createUserSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Valid email is required'),
    role: z.enum(['hr', 'finance', 'admin']),
  });

  server.registerTool(
    'boond_admin_users_create',
    {
      description: 'Create a new user with API key (Admin only)',
      inputSchema: createUserSchema.shape,
    },
    async (params, context) => {
      try {
        const authContext = getAuthContext(context);
        if (!authContext) {
          return {
            content: [{ type: 'text', text: 'Error: Authentication required' }],
            isError: true,
          };
        }

        if (authContext.role !== 'admin') {
          return {
            content: [{ type: 'text', text: 'Error: Admin access required' }],
            isError: true,
          };
        }

        const validated = createUserSchema.parse(params);
        const users = getUsers();

        // Check for duplicate email
        if (users.some(u => u.email === validated.email)) {
          return {
            content: [
              { type: 'text', text: `Error: User with email ${validated.email} already exists` },
            ],
            isError: true,
          };
        }

        // Generate new API key
        const apiKey = generateApiKey();
        const apiKeyHash = hashApiKey(apiKey);

        // Create new user
        const newUser: User = {
          id: `user-${Date.now()}`,
          name: validated.name,
          email: validated.email,
          role: validated.role,
          apiKeyHash,
          createdAt: new Date().toISOString(),
          isActive: true,
        };

        users.push(newUser);
        saveUsersList(users);

        return {
          content: [
            {
              type: 'text',
              text: [
                '✅ User created successfully!',
                '',
                `Name: ${newUser.name}`,
                `Email: ${newUser.email}`,
                `Role: ${newUser.role.toUpperCase()}`,
                `ID: ${newUser.id}`,
                '',
                '🔑 API KEY (save this - it will not be shown again):',
                apiKey,
                '',
                'Share this key with the user securely.',
              ].join('\n'),
            },
          ],
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            content: [
              {
                type: 'text',
                text: `Validation error: ${error.errors.map(e => e.message).join(', ')}`,
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: `Error creating user: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Register boond_admin_users_revoke
  const revokeUserSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
  });

  server.registerTool(
    'boond_admin_users_revoke',
    {
      description: 'Revoke/deactivate a user (Admin only)',
      inputSchema: revokeUserSchema.shape,
    },
    async (params, context) => {
      try {
        const authContext = getAuthContext(context);
        if (!authContext) {
          return {
            content: [{ type: 'text', text: 'Error: Authentication required' }],
            isError: true,
          };
        }

        if (authContext.role !== 'admin') {
          return {
            content: [{ type: 'text', text: 'Error: Admin access required' }],
            isError: true,
          };
        }

        const validated = revokeUserSchema.parse(params);
        let users = getUsers();

        const userIndex = users.findIndex(u => u.id === validated.userId);
        if (userIndex === -1) {
          return {
            content: [{ type: 'text', text: `Error: User with ID ${validated.userId} not found` }],
            isError: true,
          };
        }

        // Deactivate user
        users[userIndex].isActive = false;
        saveUsersList(users);

        return {
          content: [
            {
              type: 'text',
              text: [
                '✅ User revoked successfully',
                '',
                `User: ${users[userIndex].name}`,
                `Email: ${users[userIndex].email}`,
                'Status: Inactive (revoked)',
              ].join('\n'),
            },
          ],
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            content: [
              {
                type: 'text',
                text: `Validation error: ${error.errors.map(e => e.message).join(', ')}`,
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: `Error revoking user: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
