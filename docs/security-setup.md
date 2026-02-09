# Security Setup Guide

This guide explains how to set up and use the multi-user security features in Boond MCP Server v1.1.0.

## Overview

The security system provides:

- **API Key Authentication**: Per-user API keys for access control
- **Role-Based Access Control (RBAC)**: Three roles with different permissions
  - **HR**: Access to HR tools (candidates, contacts, resources, contracts)
  - **Finance**: Access to Finance tools (invoices, purchases, orders, banking)
  - **Admin**: Access to all tools + user management
- **Multi-Token Support**: Different Boond API tokens per role

## Quick Start

### 1. Set Up Environment Variables

For multi-user mode, you need role-specific Boond API tokens:

```bash
# Required for multi-user mode
export BOOND_HR_API_TOKEN="your-hr-boond-token"
export BOOND_FINANCE_API_TOKEN="your-finance-boond-token"
export BOOND_ADMIN_API_TOKEN="your-admin-boond-token"

# Path to user configuration file
export BOOND_USERS_CONFIG="./config/users.json"
```

### 2. Create Admin User

Create an initial admin user using the setup script:

```bash
# The server will detect no users exist and create an admin
bun run build/index.js
# Check logs for the generated admin API key
```

Or manually create `config/users.json`:

```json
{
  "users": [
    {
      "id": "admin-001",
      "name": "System Administrator",
      "email": "admin@company.com",
      "role": "admin",
      "apiKeyHash": "sha256_hash_here",
      "createdAt": "2024-01-15T10:30:00Z",
      "isActive": true
    }
  ]
}
```

Generate the hash:

```typescript
import { hashApiKey } from './src/utils/auth.js';
const apiKey = 'bnd_generated_key_here';
const hash = hashApiKey(apiKey);
console.log(hash);
```

### 3. Start the Server

```bash
# Multi-user mode (requires BOOND_USERS_CONFIG)
bun run build/index.js

# Single-user mode (backward compatible, no auth required)
export BOOND_API_TOKEN="your-token"
bun run build/index.js
```

## User Management

### Creating Users

Admin users can create new users using the admin tools:

```typescript
// Use boond_admin_users_create tool
{
  "name": "Alice Smith",
  "email": "alice@company.com",
  "role": "hr"
}
// Returns: { user: {...}, apiKey: "bnd_abc123..." }
```

**Important**: The API key is shown only once during creation. Save it securely!

### Listing Users

```typescript
// Use boond_admin_users_list tool
// Returns list of users with masked API keys
```

### Revoking Access

```typescript
// Use boond_admin_users_revoke tool
{
  "userId": "user-001"
}
```

## Role Permissions

| Role        | Tools Accessible                                                                   | Boond Token Used |
| ----------- | ---------------------------------------------------------------------------------- | ---------------- |
| **HR**      | `boond_candidates_*`, `boond_contacts_*`, `boond_resources_*`, `boond_contracts_*` | HR token         |
| **Finance** | `boond_invoices_*`, `boond_purchases_*`, `boond_orders_*`, `boond_banking_*`       | Finance token    |
| **Admin**   | All tools + `boond_admin_users_*`                                                  | Admin token      |

## API Key Format

- **Prefix**: `bnd_`
- **Length**: 36+ characters
- **Example**: `bnd_a3f7b2d9e1c8f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8`
- **Storage**: SHA-256 hash stored in JSON, raw key shown once at creation

## Security Best Practices

1. **Keep API Keys Secret**: Only share via secure channels
2. **Rotate Keys Regularly**: Revoke old keys and create new ones
3. **Use HTTPS**: Always use HTTPS in production
4. **Limit Admin Users**: Only trusted personnel should have admin access
5. **Monitor Usage**: Check logs for suspicious activity
6. **Backup Config**: Regularly backup `config/users.json`

## Troubleshooting

### "Authentication required" Error

- Ensure `BOOND_USERS_CONFIG` is set
- Verify the users.json file exists and is valid
- Check that the API key is being sent with requests

### "Invalid API key" Error

- Verify the key hasn't been revoked
- Check the key format starts with `bnd_`
- Regenerate the key if lost

### "Access denied" Error

- Verify the user's role has access to the tool
- Check role-permissions.ts for the tool mapping
- Ensure the correct Boond API token is configured for that role

### Server Starts in Single-User Mode

- Check that `BOOND_USERS_CONFIG` environment variable is set
- Verify the config file path is correct
- Check server logs for config loading errors

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MCP Client (Claude, etc.)                 │
└──────────────────────┬──────────────────────────────────────┘
                       │ Stdio Transport
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Boond MCP Server (Multi-User Mode)              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Auth Middleware (extract & validate API key)       │   │
│  └──────────────────────┬──────────────────────────────┘   │
│                         │                                   │
│  ┌──────────────────────▼──────────────────────────────┐   │
│  │  Authorization Layer (check role → tool mapping)    │   │
│  └──────────────────────┬──────────────────────────────┘   │
│                         │                                   │
│  ┌──────────────────────▼──────────────────────────────┐   │
│  │  Tool Handler (executes with user context)          │   │
│  └──────────────────────┬──────────────────────────────┘   │
│                         │                                   │
│  ┌──────────────────────▼──────────────────────────────┐   │
│  │  Multi-Token API Client (role → Boond token)        │   │
│  └──────────────────────┬──────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────┘
                          │ HTTPS
                          ▼
              ┌───────────────────────┐
              │   BoondManager API    │
              │  (HR/Finance/Admin    │
              │   tokens per role)    │
              └───────────────────────┘
```

## Migration from Single-User Mode

1. Generate role-specific Boond API tokens in BoondManager
2. Set up environment variables with role tokens
3. Create initial admin user
4. Test admin access
5. Create users for each role
6. Distribute API keys securely
7. Gradually migrate users from single-user to multi-user mode

## Version History

- **v1.1.0**: Initial multi-user security (current)
  - API key authentication
  - Role-based access control
  - Multi-token API client
  - Admin user management tools

- **v1.2.0** (planned): Partner access
  - Encrypted config storage
  - Key rotation
  - Basic audit logging

- **v1.3.0** (planned): External client access
  - Database-backed users
  - Comprehensive audit logging
  - OAuth2/OpenID Connect

## Support

For issues or questions:

- Check logs with `DEBUG=boond-mcp bun run build/index.js`
- Review error messages in Claude Desktop
- Open an issue on GitHub
