---
name: boond-mcp
version: 1.0.0
description: How to configure and use the BoondManager MCP server with OpenCode and other clients
---

# BoondManager MCP Server - Agent Skill Guide

This skill teaches agents how to properly configure and use the `boond-mcp` MCP server to interact with BoondManager ERP/CRM.

## Overview

The **BoondManager MCP Server** provides 121 tools to interact with:

- **HR**: Candidates, resources, contacts, contracts
- **CRM**: Companies, opportunities, quotations
- **Finance**: Invoices, purchases, orders
- **Projects**: Projects, deliveries, actions
- **Time**: Time reports, absences, expense reports
- **Admin**: Agencies, business units, accounts, documents

All tools follow the pattern: `boond_{domain}_{action}`

## Configuration

### Server-Side Requirements (Required)

The MCP server needs these environment variables set on the **server** (not by you):

| Variable             | Description                                |
| -------------------- | ------------------------------------------ |
| `BOOND_CLIENT_TOKEN` | BoondManager client token (hex)            |
| `BOOND_CLIENT_KEY`   | BoondManager client key                    |
| `BOOND_USER_TOKEN`   | BoondManager user token                    |
| `BOOND_JWT_MODE`     | JWT mode — usually `normal`                |
| `MCP_API_KEY`        | API key to protect the MCP server endpoint |

If these aren't configured, the server will fail to start. Guide the user to check:

- `docs/OPENCODE_SETUP_GUIDE.md`
- Render dashboard environment variables (if deployed)

### OpenCode Configuration

**CRITICAL**: OpenCode remote MCP uses **SSE transport** by default, NOT the HTTP stateless endpoint.

Add this to `~/.config/opencode/opencode.jsonc`:

```jsonc
{
  "mcp": {
    "boond-mcp": {
      "type": "remote",
      "url": "https://boond-mcp-d61y.onrender.com/mcp", // <-- SSE endpoint
      "oauth": false,
      "headers": {
        "x-api-key": "your_mcp_api_key_here",
      },
      "enabled": true,
    },
  },
}
```

**DO NOT use `/mcp/http`** for OpenCode remote — it will fail with SSE errors.

## Transport Modes Explained

### 1. Stdio (Local Desktop)

**Use for**: Claude Desktop, Cursor, local development

```bash
# Run locally
BOOND_API_TOKEN=xxx node build/index.js
```

### 2. SSE (Server-Sent Events) - OpenCode Remote

**Use for**: OpenCode cloud, remote servers

- `GET /mcp` → Establish SSE connection
- `POST /mcp?sessionId=xxx` → Send messages
- Returns responses through SSE stream

### 3. HTTP Stateless (Direct HTTP)

**Use for**: Scripts, curl, simple HTTP clients

- `POST /mcp/http` → Send JSON-RPC
- Returns response directly in HTTP body

**Example curl:**

```bash
curl -X POST https://boond-mcp-d61y.onrender.com/mcp/http \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_key" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "boond_candidates_search",
      "arguments": {"query": "Jean", "limit": 5}
    }
  }'
```

## Tool Patterns

All tools follow: `boond_{domain}_{action}`

### Search Tools

- Accept: `query` (free-text), `page` (default 1), `limit` (default 25, max 100)
- Return: Paginated list with metadata

### Get Tools

- Accept: `id` (required)
- Return: Full details for a single record

### Domain Quick Reference

| Domain     | Search Tools              | Get Tools              |
| ---------- | ------------------------- | ---------------------- |
| Candidates | `boond_candidates_search` | `boond_candidates_get` |
| Companies  | `boond_companies_search`  | `boond_companies_get`  |
| Projects   | `boond_projects_search`   | `boond_projects_get`   |
| Invoices   | `boond_invoices_search`   | `boond_invoices_get`   |
| Resources  | `boond_resources_search`  | -                      |
| Contacts   | `boond_contacts_search`   | `boond_contacts_get`   |

## Common Workflows

### 1. Find a Person → Get Details

```
Step 1: Search
boond_candidates_search({ query: "Jean Dupont", limit: 5 })
→ Returns list with IDs

Step 2: Get full profile
boond_candidates_get({ id: "123" })
```

### 2. List Active Projects

```
boond_projects_search({ page: 1, limit: 25 })
→ Returns paginated project list
```

### 3. Paginate Large Results

```
Page 1: boond_candidates_search({ page: 1, limit: 100 })
Check: result.pagination.total (total count)
Page 2: boond_candidates_search({ page: 2, limit: 100 })
Continue until all retrieved
```

### 4. Find and Pay Invoice

```
Step 1: List unpaid
boond_invoices_search({ page: 1, limit: 50 })
→ Check status field in results

Step 2: Pay specific invoice
boond_invoices_pay({ id: "INV-001" })
```

## Error Handling

### Response Format

```json
{
  "content": [{ "type": "text", "text": "..." }],
  "isError": false
}
```

When `isError: true`:

- Check `content[0].text` for error message
- Common causes:
  - `401`: Invalid MCP API key
  - `403`: No permission for this Boond endpoint
  - `404`: Resource not found
  - `405`: Endpoint doesn't support this action

### Endpoint-Specific Notes

Some endpoints return 403/405 depending on Boond account permissions:

- `contracts`, `quotations`, `deliveries`
- `documents`, `settings`

**This is normal** — inform the user and try alternative tools.

## Verification Checklist

Before telling the user "it's working":

1. **Server is running**: `GET /health` returns 200
2. **SSE endpoint works**: `GET /mcp` returns SSE stream with sessionId
3. **Tool calls succeed**: Can execute at least one search tool
4. **Response has data**: Not empty arrays or error messages

## DO's and DON'Ts

### DO ✅

- Use `boond_{domain}_search` before `boond_{domain}_get`
- Start with `limit: 5` for quick lookups
- Use `query` parameter for free-text search
- Handle pagination for large datasets
- Check `isError` in responses

### DON'T ❌

- Don't guess IDs — always search first
- Don't use underscores in tool names (`boond_time_reports` is WRONG)
- Don't set `BOOND_*` env vars — the server handles Boond auth
- Don't use `/mcp/http` for OpenCode remote (use `/mcp`)

## Quick Reference

### Tool Count by Domain

- **HR**: 15 tools (candidates, resources, contacts, contracts)
- **CRM**: 10 tools (companies, opportunities, quotations)
- **Finance**: 14 tools (invoices, purchases, orders)
- **Projects**: 14 tools (projects, deliveries, actions)
- **Time**: 8 tools (time reports, absences, expenses)
- **Admin**: 12 tools (agencies, business units, accounts, documents)
- **System**: 6 tools (apps, settings, alerts)

### Response Types

All tools return MCP-compliant responses:

```typescript
{
  content: Array<{ type: "text", text: string }>,
  isError: boolean
}
```

The `text` field contains human-readable formatted output. Parse it or use IDs for subsequent calls.

---

## Troubleshooting

### "Cannot POST /mcp/http" or similar

- You're hitting the wrong endpoint
- OpenCode remote uses SSE (`/mcp`), not `/mcp/http`

### "Session not found" or SSE errors

- Session expired (normal after inactivity)
- Restart OpenCode or wait for Render to wake up

### "401 Unauthorized"

- Invalid `x-api-key` in OpenCode config
- Check that `MCP_API_KEY` is set on the server

### "403 Forbidden" on specific tools

- Boond account doesn't have permission for that endpoint
- Try alternative tools or inform user

### Tools return empty results

- Try broader search (remove filters, increase limit)
- Verify query parameters are valid
- Check if the entity type exists in this Boond instance

---

## See Also

- `docs/AI_SKILLS.md` - Detailed AI usage guide
- `docs/OPENCODE_SETUP_GUIDE.md` - OpenCode configuration
- `docs/skills/boond-mcp.md` - Full tool catalog
- `README.md` - General project documentation