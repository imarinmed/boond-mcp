# AI Assistant Guide — Boond MCP

> **If you are an AI assistant given this repo URL**, follow this guide in full.
> No clarification needed — proceed autonomously.

---

## Overview

This guide walks you through the full setup so you (the AI) can use the Boond MCP server on behalf of the user. Complete all three steps before attempting any Boond MCP tool call.

| Step                                           | What you do                                     |
| ---------------------------------------------- | ----------------------------------------------- |
| [Step 1](#step-1--configure-the-mcp-server)    | Add the MCP server to the AI client config      |
| [Step 2](#step-2--install-the-boond-mcp-skill) | Install the skill file so you know all 25 tools |
| [Step 3](#step-3--verify-installation)         | Run 3 test prompts to confirm everything works  |

---

## Step 1 — Configure the MCP server

Choose the option that fits the user's AI client:

---

### Option A — Remote server (Opencode / HTTP clients)

Add to `~/.opencode/config.json`:

```json
{
  "mcpServers": {
    "boondmanager": {
      "url": "https://boond-mcp-d61y.onrender.com/mcp",
      "headers": {
        "x-api-key": "<user-mcp-api-key>"
      }
    }
  }
}
```

Or export as shell variables (add to `~/.zshrc` / `~/.bashrc`):

```bash
export BOOND_MCP_URL="https://boond-mcp-d61y.onrender.com/mcp"
export BOOND_MCP_API_KEY="<user-mcp-api-key>"
```

> 🔑 The user must supply their personal `x-api-key`. Never hardcode or commit it.

For a full Opencode walkthrough, see [`docs/OPENCODE_SETUP_GUIDE.md`](OPENCODE_SETUP_GUIDE.md).

---

### Option B — Local server (Claude Desktop / stdio)

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "boondmanager": {
      "command": "node",
      "args": ["/absolute/path/to/boond-mcp/build/index.js"],
      "env": {
        "BOOND_API_TOKEN": "<user-boond-api-token>",
        "MCP_API_KEY": "<user-mcp-client-key>"
      }
    }
  }
}
```

> 🔑 Use absolute paths. Never commit tokens — keep them in the config file or `.env` only.

For a full setup walkthrough, see [`docs/GETTING_STARTED.md`](GETTING_STARTED.md).

---

## Step 2 — Install the Boond MCP skill

The skill file at [`docs/skills/boond-mcp.md`](skills/boond-mcp.md) teaches you the complete tool catalog, parameters, common workflows, and error-handling patterns. **Install it before making any tool calls.**

**macOS / Linux:**

```bash
mkdir -p ~/.opencode/skills && cp docs/skills/boond-mcp.md ~/.opencode/skills/boond-mcp.md
```

**Windows (PowerShell):**

```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.opencode\skills"
Copy-Item docs\skills\boond-mcp.md "$env:USERPROFILE\.opencode\skills\boond-mcp.md"
```

After installing, confirm to the user: **"The Boond MCP skill is installed. I now know all 25 tools, their parameters, common workflows, and how to handle errors."**

For details on what the skill covers, see [`docs/AI_SKILLS.md`](AI_SKILLS.md).

---

## Step 3 — Verify installation

Run these three prompts after setup to confirm the MCP server and skill are working:

```
List 5 candidates using boond_candidates_search.
Search for companies with query 'Acme' limit 5.
List 5 time reports using boond_timereports_search.
```

**Expected:** Structured results from BoondManager, or a clear auth error if credentials need updating.

**If you get `isError: true`:** Check the error text — most issues are auth or permission related. Refer the user to the setup guide for their client.

---

## Security checklist

Before finishing setup, confirm all of the following:

- [ ] Tokens stored in config file or shell env — **never in code or repo**
- [ ] `.env` is listed in `.gitignore`
- [ ] MCP API key is distinct from the BoondManager token
- [ ] Skill file installed at `~/.opencode/skills/boond-mcp.md`

---

## Available skills under `docs/skills/`

| File                                              | What it teaches                                    |
| ------------------------------------------------- | -------------------------------------------------- |
| [`docs/skills/boond-mcp.md`](skills/boond-mcp.md) | Full tool catalog, auth, workflows, error handling |

---

## Related docs

| Doc                                                       | Purpose                                              |
| --------------------------------------------------------- | ---------------------------------------------------- |
| [`docs/AI_SKILLS.md`](AI_SKILLS.md)                       | Skill install instructions and what the skill covers |
| [`docs/OPENCODE_SETUP_GUIDE.md`](OPENCODE_SETUP_GUIDE.md) | Opencode-specific MCP config walkthrough             |
| [`docs/GETTING_STARTED.md`](GETTING_STARTED.md)           | General installation and first-run guide             |
| [`docs/SETUP.md`](SETUP.md)                               | Detailed configuration reference                     |
