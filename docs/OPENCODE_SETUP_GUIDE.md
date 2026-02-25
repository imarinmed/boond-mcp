# BoondManager MCP - OpenCode Beta Setup

This guide shows how a beta tester connects to the hosted BoondManager MCP server from OpenCode using a client API key.

## 1) What Is Authenticated

- `BOOND_API_TOKEN` stays server-side only (internal).
- Testers use `MCP_API_KEY` as a client key via request header `x-api-key`.
- `GET /health` remains public.

## 2) Beta Tester Prerequisites

- OpenCode installed and working
- Access to the shared client key (`BOOND_MCP_API_KEY`)

## 3) OpenCode Config (Official Format)

Create or edit `opencode.json` (or `opencode.jsonc`) and add:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "boond-mcp": {
      "type": "remote",
      "url": "https://boond-mcp-d61y.onrender.com/mcp",
      "oauth": false,
      "headers": {
        "x-api-key": "{env:BOOND_MCP_API_KEY}"
      },
      "enabled": true
    }
  }
```

### Alternative: HTTP Stateless Endpoint (No SSE Required)

The server also provides a **stateless HTTP endpoint** at `/mcp/http` that doesn't require session management. This is simpler for testing and scripts:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "boond-mcp": {
      "type": "remote",
      "url": "https://boond-mcp-d61y.onrender.com/mcp/http",
      "oauth": false,
      "headers": {
        "x-api-key": "{env:BOOND_MCP_API_KEY}"
      },
      "enabled": true
    }
  }
}
```

**Differences:**
- **SSE endpoint** (`/mcp`): Requires persistent connection, supports real-time streaming
- **HTTP endpoint** (`/mcp/http`): Simple request/response, no session management needed

For OpenCode, both work, but the HTTP endpoint is simpler for basic usage.
```

Why this format:

- It matches OpenCode docs for remote MCP servers.
- `oauth: false` is correct because this server uses API-key auth, not OAuth flow.

## 4) Set Environment Variable on Tester Machine

Set this in the tester shell/session before launching OpenCode:

```bash
export BOOND_MCP_API_KEY
```

Use the value shared by your admin for `BOOND_MCP_API_KEY`.

On Windows PowerShell:

```powershell
$env:BOOND_MCP_API_KEY = "<value-provided-by-admin>"
```

## 5) Verify in OpenCode

Run:

```bash
opencode mcp list
opencode mcp debug boond-mcp
```

Expected:

- Server appears as configured remote MCP
- Auth/header check passes
- Tools are discoverable

## 6) Functional Smoke Test Prompts

In OpenCode, try:

- `List available tools from boond-mcp.`
- `Search candidates in BoondManager.`
- `List recent companies.`

## 7) Troubleshooting

- `401 Unauthorized`
  - Wrong or missing `BOOND_MCP_API_KEY`
  - Header not configured as `x-api-key`
- `404 Session not found`
  - Session expired; retry request flow
- Connection issues
  - Check health endpoint: `https://boond-mcp-d61y.onrender.com/health`

## 8) Security Notes

- Rotate `MCP_API_KEY` periodically.
- Use separate keys per tester if possible.
- Never expose `BOOND_API_TOKEN` to clients.
