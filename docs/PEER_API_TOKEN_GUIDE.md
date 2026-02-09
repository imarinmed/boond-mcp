# Peer API Token Guide - BoondManager MCP Server

**Version:** 1.1.0  
**Last Updated:** 2024-01-15  
**Audience:** Administrators and End Users

---

## 📋 Overview

This guide explains how to **create API tokens for your peers** (administrators) and how **peers can use these tokens** to authenticate with the BoondManager MCP Server.

### What You'll Learn

- ✅ How to generate secure API keys for team members
- ✅ How to distribute keys safely
- ✅ How peers authenticate with the MCP server
- ✅ How to troubleshoot common issues

---

## 🔐 Part 1: Creating API Tokens (For Administrators)

### Prerequisites

Before creating tokens for peers, ensure:

1. You're running the server in **multi-user mode**
2. You have **admin access**
3. You know which role each peer needs (HR/Finance/Admin)

### Step 1: Set Up Multi-User Mode

```bash
# 1. Set environment variables
export BOOND_HR_API_TOKEN="your-hr-boond-token"
export BOOND_FINANCE_API_TOKEN="your-finance-boond-token"
export BOOND_ADMIN_API_TOKEN="your-admin-boond-token"
export BOOND_USERS_CONFIG="./config/users.json"

# 2. Ensure config directory exists
mkdir -p config

# 3. Start the server
bun run build/index.js
```

### Step 2: Generate an API Key

#### Option A: Using Admin Tools (Recommended)

If you have an admin user set up, use the MCP tool:

```typescript
// Tool: boond_admin_users_create
{
  "name": "John Doe",
  "email": "john@company.com",
  "role": "hr"
}
```

**Response:**

```typescript
{
  "user": {
    "id": "user-1705321234567-abc123",
    "name": "John Doe",
    "email": "john@company.com",
    "role": "hr",
    "apiKeyHash": "sha256_hash_here",
    "createdAt": "2024-01-15T10:30:00Z",
    "isActive": true
  },
  "apiKey": "bnd_a3f7b2d9e1c8f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8"
}
```

⚠️ **IMPORTANT:** The `apiKey` is shown **only once**! Save it immediately.

#### Option B: Manual Generation (For Initial Setup)

Create a script to generate keys manually:

```typescript
// generate-key.ts
import { generateApiKey, hashApiKey } from './src/utils/auth.js';

// Generate a new key
const apiKey = generateApiKey();
console.log('API Key:', apiKey);
console.log('Hash:', hashApiKey(apiKey));
```

Run it:

```bash
bun run generate-key.ts
```

**Output:**

```
API Key: bnd_x7y9z2a4b6c8d0e2f4g6h8i0j2k4l6m8n0o2p4q6r8s0t2
Hash: 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08
```

Then manually add to `config/users.json`:

```json
{
  "users": [
    {
      "id": "user-1705321234567-abc123",
      "name": "John Doe",
      "email": "john@company.com",
      "role": "hr",
      "apiKeyHash": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
      "createdAt": "2024-01-15T10:30:00Z",
      "isActive": true
    }
  ]
}
```

### Step 3: Choose the Right Role

| Role        | Access                                     | Best For                  |
| ----------- | ------------------------------------------ | ------------------------- |
| **HR**      | Candidates, contacts, resources, contracts | Recruiters, HR managers   |
| **Finance** | Invoices, purchases, orders, banking       | Accountants, finance team |
| **Admin**   | All tools + user management                | System administrators     |

### Step 4: Securely Distribute the Key

#### ✅ DO:

- Use **encrypted email** or secure messaging (Signal, Wire)
- Share via **password manager** (1Password, Bitwarden)
- Use **secure file sharing** with expiration
- Send key and instructions separately

#### ❌ DON'T:

- Send in plain text email
- Share in Slack/Teams public channels
- Include in documentation or code
- Screenshot and share images

### Step 5: Document the Key

Keep a record (for your reference only):

```
User: John Doe (john@company.com)
Role: HR
API Key: bnd_x7y9z2a4b6c8d0e2f4g6h8i0j2k4l6m8n0o2p4q6r8s0t2
Created: 2024-01-15
Distributed via: 1Password secure link
Status: Active
```

---

## 👤 Part 2: Using API Tokens (For Peers/End Users)

### Step 1: Receive Your API Key

You'll receive an API key that looks like:

```
bnd_x7y9z2a4b6c8d0e2f4g6h8i0j2k4l6m8n0o2p4q6r8s0t2
```

**Characteristics:**

- Starts with `bnd_`
- 36+ characters long
- Mix of letters and numbers

### Step 2: Store Your Key Securely

#### Option A: Environment Variable (Recommended)

```bash
# Add to your shell profile (~/.bashrc, ~/.zshrc, etc.)
export BOOND_MCP_API_KEY="bnd_your_key_here"

# Reload your shell
source ~/.bashrc
```

#### Option B: Local Config File

Create `~/.boond-mcp/config.json`:

```json
{
  "apiKey": "bnd_your_key_here"
}
```

Set permissions:

```bash
chmod 600 ~/.boond-mcp/config.json
```

### Step 3: Configure Claude Desktop

Edit your Claude Desktop config:

**macOS:**

```bash
# Edit the config file
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Windows:**

```
%APPDATA%\Claude\claude_desktop_config.json
```

**Linux:**

```bash
~/.config/Claude/claude_desktop_config.json
```

#### Configuration Options:

**Option A: Using the API Key directly**

```json
{
  "mcpServers": {
    "boondmanager": {
      "command": "bun",
      "args": ["run", "/path/to/boond-mcp/build/index.js"],
      "env": {
        "BOOND_MCP_API_KEY": "bnd_your_key_here",
        "BOOND_HR_API_TOKEN": "hr-boond-token",
        "BOOND_FINANCE_API_TOKEN": "finance-boond-token",
        "BOOND_ADMIN_API_TOKEN": "admin-boond-token",
        "BOOND_USERS_CONFIG": "/path/to/config/users.json"
      }
    }
  }
}
```

**Option B: Using the admin tool approach (more secure)**

If your admin set up the server with users.json:

```json
{
  "mcpServers": {
    "boondmanager": {
      "command": "bun",
      "args": ["run", "/path/to/boond-mcp/build/index.js"],
      "env": {
        "BOOND_HR_API_TOKEN": "hr-boond-token",
        "BOOND_FINANCE_API_TOKEN": "finance-boond-token",
        "BOOND_ADMIN_API_TOKEN": "admin-boond-token",
        "BOOND_USERS_CONFIG": "/path/to/config/users.json"
      }
    }
  }
}
```

### Step 4: Restart Claude Desktop

1. **Quit Claude Desktop completely** (Cmd+Q / Ctrl+Q)
2. **Restart Claude Desktop**
3. **Wait 10-15 seconds** for the MCP server to initialize

### Step 5: Verify Authentication

Ask Claude:

```
Can you list the available BoondManager tools?
```

You should see tools like:

- `boond_candidates_search`
- `boond_contacts_get`
- etc.

If you see the tools, authentication is working!

---

## 🔧 Troubleshooting

### "Authentication required" Error

**Problem:** Server rejects requests without valid auth

**Solutions:**

1. Check that `BOOND_USERS_CONFIG` is set
2. Verify your user exists in `config/users.json`
3. Ensure your API key hasn't been revoked

### "Invalid API key" Error

**Problem:** Key format incorrect or doesn't match stored hash

**Solutions:**

1. Verify key starts with `bnd_`
2. Check key length (36+ characters)
3. Ensure no extra spaces or newlines
4. Contact admin to regenerate key

### "Access denied" Error

**Problem:** Your role doesn't have permission for this tool

**Solutions:**

1. Check which role you're assigned (HR/Finance/Admin)
2. Review role permissions with your admin
3. Request role upgrade if needed

### Tools Not Appearing in Claude

**Problem:** MCP server not connecting

**Solutions:**

1. Check Claude Desktop logs:
   - macOS: `~/Library/Logs/Claude/`
   - Windows: `%APPDATA%\Claude\logs\`

2. Verify the server starts:

   ```bash
   cd /path/to/boond-mcp
   bun run build/index.js
   ```

3. Check for TypeScript errors:

   ```bash
   bunx tsc --noEmit
   ```

4. Restart Claude Desktop completely

### "Server starts in single-user mode"

**Problem:** Multi-user config not detected

**Solutions:**

1. Verify `BOOND_USERS_CONFIG` is set:

   ```bash
   echo $BOOND_USERS_CONFIG
   ```

2. Check file exists:

   ```bash
   ls -la $BOOND_USERS_CONFIG
   ```

3. Ensure file is valid JSON:
   ```bash
   cat $BOOND_USERS_CONFIG | jq .
   ```

---

## 📊 Quick Reference

### API Key Format

```
bnd_<32-characters-base64url>

Example:
bnd_a3f7b2d9e1c8f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8
```

### Role Permissions Summary

| Tool Category   | HR  | Finance | Admin |
| --------------- | --- | ------- | ----- |
| Candidates      | ✅  | ❌      | ✅    |
| Contacts        | ✅  | ❌      | ✅    |
| Resources       | ✅  | ❌      | ✅    |
| Contracts       | ✅  | ❌      | ✅    |
| Companies       | ❌  | ✅      | ✅    |
| Invoices        | ❌  | ✅      | ✅    |
| Purchases       | ❌  | ✅      | ✅    |
| Banking         | ❌  | ✅      | ✅    |
| User Management | ❌  | ❌      | ✅    |

### Environment Variables

```bash
# Required for multi-user mode
export BOOND_HR_API_TOKEN="hr-boond-token"
export BOOND_FINANCE_API_TOKEN="finance-boond-token"
export BOOND_ADMIN_API_TOKEN="admin-boond-token"
export BOOND_USERS_CONFIG="./config/users.json"

# Optional
export BOOND_API_URL="https://ui.boondmanager.com/api/1.0"
```

---

## 🔒 Security Best Practices

### For Administrators

1. **Rotate keys every 90 days**

   ```bash
   # 1. Generate new key
   # 2. Distribute to user
   # 3. Revoke old key after 7 days
   ```

2. **Use separate keys per user**
   - Never share keys between users
   - Each person gets their own key

3. **Revoke immediately on departure**
   - Remove user from `config/users.json`
   - Or set `"isActive": false`

4. **Monitor usage**
   - Check logs regularly
   - Look for unusual activity

### For Users

1. **Never share your key**
   - Treat it like a password
   - Don't commit to git
   - Don't include in screenshots

2. **Store securely**
   - Use password manager
   - Set file permissions to 600

3. **Report compromised keys immediately**
   - Contact your admin
   - Key will be revoked and regenerated

---

## 📝 Example Workflows

### Scenario 1: New HR Team Member

**Admin Actions:**

```bash
# 1. Generate key
bun run scripts/generate-key.ts

# 2. Create user entry in config/users.json
# 3. Send key via secure channel
# 4. Document in admin records
```

**User Actions:**

```bash
# 1. Receive key via secure email
# 2. Store in ~/.bashrc
export BOOND_MCP_API_KEY="bnd_key_here"

# 3. Configure Claude Desktop
# 4. Restart Claude
# 5. Verify tools appear
```

### Scenario 2: Role Change (HR → Finance)

**Admin Actions:**

```typescript
// 1. Revoke old user
// Tool: boond_admin_users_revoke
{ "userId": "user-123" }

// 2. Create new user with Finance role
// Tool: boond_admin_users_create
{
  "name": "John Doe",
  "email": "john@company.com",
  "role": "finance"
}

// 3. Distribute new key
```

**User Actions:**

```bash
# 1. Update API key in environment
export BOOND_MCP_API_KEY="bnd_new_key_here"

# 2. Restart Claude Desktop
# 3. Verify Finance tools available
```

### Scenario 3: Lost Key

**User Actions:**

```
1. Contact admin immediately
2. Old key will be revoked
3. New key will be generated
4. Update configuration
```

**Admin Actions:**

```typescript
// 1. Revoke old key
// Tool: boond_admin_users_revoke
{ "userId": "user-123" }

// 2. Create new user (same person, new key)
// Tool: boond_admin_users_create
{ "name": "John Doe", "email": "john@company.com", "role": "hr" }

// 3. Distribute new key securely
```

---

## 🆘 Getting Help

### Check Logs

```bash
# Server logs
tail -f /path/to/boond-mcp/logs/server.log

# Audit logs
tail -f /path/to/boond-mcp/logs/audit.log

# Claude Desktop logs (macOS)
tail -f ~/Library/Logs/Claude/mcp.log
```

### Debug Mode

```bash
# Run with debug output
DEBUG=boond-mcp bun run build/index.js
```

### Common Commands

```bash
# Verify TypeScript
bunx tsc --noEmit

# Build project
bun run build

# Check config valid
jq . config/users.json

# List users
cat config/users.json | jq '.users[] | {id, name, role, isActive}'
```

---

## ✅ Checklist

### For Administrators

- [ ] Set up multi-user mode environment variables
- [ ] Create initial admin user
- [ ] Generate API keys for each peer
- [ ] Assign appropriate roles
- [ ] Distribute keys securely
- [ ] Document key assignments
- [ ] Set up key rotation schedule

### For Users

- [ ] Received API key from admin
- [ ] Stored key securely (env var or config file)
- [ ] Configured Claude Desktop
- [ ] Restarted Claude Desktop
- [ ] Verified tools appear
- [ ] Tested basic query
- [ ] Know how to report issues

---

## 📚 Additional Resources

- [Security Setup Guide](./security-setup.md) - Detailed multi-user setup
- [Architecture Diagram](#architecture) - System overview
- [API Documentation](https://doc.boondmanager.com) - BoondManager API docs

---

## 🔄 Version History

- **v1.1.0** (2024-01-15): Initial peer API token guide
  - Admin key generation procedures
  - User authentication guide
  - Troubleshooting section
  - Security best practices

---

**Questions?** Contact your system administrator or open an issue on GitHub.
