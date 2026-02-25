# Installing Boond MCP AI Skills

AI skills are knowledge files that teach your AI assistant (OpenCode, Claude, etc.) how to use the Boond MCP server effectively — the right tool names, parameters, common workflows, and how to handle errors.

---

## Quick Install (30 seconds)

```bash
mkdir -p ~/.opencode/skills
cp docs/skills/boond-mcp.md ~/.opencode/skills/boond-mcp.md
```

That's it. Your AI assistant will now have expert knowledge of all Boond MCP tools on every future conversation.

---

## For AI Assistants Reading This

If a user has asked you to "install Boond MCP skills", run this on their machine:

```bash
mkdir -p ~/.opencode/skills && cp "$(pwd)/docs/skills/boond-mcp.md" ~/.opencode/skills/boond-mcp.md && echo "✅ Boond MCP skill installed"
```

Then confirm: **"The Boond MCP skill has been installed. I now know all 25 available tools, their parameters, common workflows, and how to handle errors. You can ask me to search candidates, list invoices, track time, manage projects, and more."**

---

## What the Skill Teaches Your AI

| Area                 | Details                                                                                            |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| **Tool catalog**     | All 25 tools across 8 domains (HR, CRM, Finance, Projects, Time, Admin, Documents, System)         |
| **Exact tool names** | Prevents "tool not found" errors (e.g. `boond_timereports_search` not `boond_time_reports_search`) |
| **Parameters**       | `query`, `page`, `limit` for every search tool; `id` for get/pay tools                             |
| **Workflows**        | Find-then-get patterns, pagination, chaining tools across domains                                  |
| **Auth setup**       | Which env vars are needed and what they do                                                         |
| **Error handling**   | How to interpret `isError: true` responses and which endpoints may have permission limits          |

---

## What You Can Do After Installing

Once the skill is installed, ask your AI things like:

- _"Find all candidates named Dupont"_
- _"List our unpaid invoices"_
- _"How many projects are active this quarter?"_
- _"Search for opportunities at Acme Corp"_
- _"Get the full profile for candidate ID 628"_
- _"Mark invoice INV-042 as paid"_

---

## Keeping Skills Up to Date

Skills are versioned with the package. When you update boond-mcp, re-run the install command:

```bash
cp docs/skills/boond-mcp.md ~/.opencode/skills/boond-mcp.md
```

Check [`docs/CHANGELOG.md`](CHANGELOG.md) for what changed in each version.

---

## Skill File Location

| OS            | Path                                          |
| ------------- | --------------------------------------------- |
| macOS / Linux | `~/.opencode/skills/boond-mcp.md`             |
| Windows       | `%USERPROFILE%\.opencode\skills\boond-mcp.md` |

The skill file itself lives at [`docs/skills/boond-mcp.md`](skills/boond-mcp.md) in this repo.
