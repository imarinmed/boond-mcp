# Interactive Setup Guide for AI Assistants

## Quick Start

This guide helps AI assistants set up BoondManager MCP interactively.

## Questions to Ask

1. Which AI client? (Claude Desktop, Claude Code, OpenCode)
2. Boond API Token? (from https://ui.boondmanager.com)
3. Role? (hr, finance, sales, admin)

## Claude Desktop Config

File: ~/Library/Application Support/Claude/claude_desktop_config.json

{
  "mcpServers": {
    "boondmanager": {
      "command": "npx",
      "args": ["-y", "@imarinmed/boond-mcp@latest"],
      "env": {
        "BOOND_API_TOKEN": "TOKEN",
        "BOOND_USER_ROLE": "ROLE"
      }
    }
  }
}

## Testing

Ask: "Search for candidates" or "Show invoices"

## Troubleshooting

- npx not found: Install Node.js
- Auth failed: Check token
- Access denied: Check role
