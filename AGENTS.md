# AGENTS.md - BoondManager MCP Server

## Project Overview

A TypeScript-based Model Context Protocol (MCP) server providing 94+ tools across 8 business domains for BoondManager API integration.

## Architecture

### Directory Structure
```
src/
├── api/
│   ├── client.ts          # Main API client with error handling
│   ├── errors.ts          # Custom error classes (to be extracted)
│   └── index.ts           # API exports
├── tools/
│   ├── index.ts           # Tool registration exports
│   ├── hr/                # HR domain tools (candidates, contacts, resources, contracts)
│   ├── crm/               # CRM domain tools (companies, opportunities, quotations)
│   ├── finance/           # Finance tools (invoices, purchases, orders, banking)
│   ├── projects/          # Project tools (projects, deliveries, actions)
│   ├── time/              # Time tracking (timeReports, absences, expenses)
│   ├── admin/             # Admin tools (agencies, accounts, businessUnits)
│   ├── documents/         # Document management
│   └── system/            # System tools (apps, settings, alerts)
├── types/
│   ├── boond.ts           # API resource interfaces
│   ├── schemas.ts         # Zod validation schemas
│   └── mcp.ts             # MCP-specific types
└── utils/
    ├── formatting.ts      # Error formatting utilities
    └── error-handling.ts  # Reusable error handlers
```

## Git Workflow

### Git Configuration

**CRITICAL: Always use the imarinmed GitHub account for commits:**

```bash
# Verify your Git configuration
git config --local user.name  # Should output: imarinmed
git config --local user.email # Should output: imarinmed@users.noreply.github.com

# If not set correctly, configure them:
git config --local user.name "imarinmed"
git config --local user.email "imarinmed@users.noreply.github.com"
```

### Git Worktrees

This project uses **Git worktrees** for parallel development. Worktrees allow you to work on multiple features simultaneously without switching branches.

#### Worktree Structure

```
boond-mcp/                    (main worktree - main branch)
├── src/
├── build/
└── ...

boond-mcp-worktrees/          (worktrees directory)
├── feature-calendar/         (feature/calendar branch)
├── refactor-api-client/      (refactor/api-client branch)
└── docs-api-docs/            (docs/api-docs branch)
```

#### Creating Worktrees

```bash
# Create a new worktree for a feature
git worktree add ../boond-mcp-worktrees/feature-name -b feature/name

# Example: Create worktree for calendar feature
git worktree add ../boond-mcp-worktrees/feature-calendar -b feature/calendar

# Work on the feature
cd ../boond-mcp-worktrees/feature-calendar
# ... make changes ...
git add .
git commit -m "feat(time): add calendar integration tools"

# Push from main worktree
cd ../../boond-mcp
git push origin feature/calendar
```

#### Listing Worktrees

```bash
git worktree list
```

#### Removing Worktrees

```bash
# When done with a feature, remove the worktree
git worktree remove ../boond-mcp-worktrees/feature-calendar

# Also delete the branch if merged
git branch -d feature/calendar
```

### Branch Naming Convention

Follow these patterns for branch names:

- `feature/<domain>-<description>` - New features (e.g., `feature/time-calendar`)
- `fix/<domain>-<description>` - Bug fixes (e.g., `fix/hr-candidate-search`)
- `refactor/<component>` - Code refactoring (e.g., `refactor/api-client`)
- `docs/<section>` - Documentation updates (e.g., `docs/api-reference`)
- `chore/<task>` - Maintenance tasks (e.g., `chore/update-dependencies`)

### Commit Message Convention

Follow **Conventional Commits** specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

#### Types

- `feat`: New features or tools
- `fix`: Bug fixes
- `refactor`: Code restructuring without behavior change
- `docs`: Documentation updates
- `style`: Code style changes (formatting, indentation)
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, tooling
- `perf`: Performance improvements

#### Scopes

Use domain or component names:
- `hr`, `crm`, `finance`, `projects`, `time`, `admin`, `documents`, `system`
- `api`, `types`, `utils`, `schemas`

#### Examples

```bash
# Good commit messages
git commit -m "feat(time): add calendar event creation tool"
git commit -m "fix(hr): resolve candidate search pagination bug"
git commit -m "refactor(api): split client into domain modules"
git commit -m "docs: add Git workflow documentation"
git commit -m "chore: update TypeScript to 5.3"

# Bad commit messages
git commit -m "update"                    # Too vague
git commit -m "fixed stuff"               # Not descriptive
git commit -m "WIP"                       # Work-in-progress not allowed
```

### Pre-commit Checklist

Before committing, ensure:

- [ ] `bunx tsc --noEmit` passes (no TypeScript errors)
- [ ] Code follows the established patterns in AGENTS.md
- [ ] Error handling uses utility functions
- [ ] Schemas are defined in `types/schemas.ts` (not inline)
- [ ] Commit message follows convention
- [ ] Git user is configured as `imarinmed`

## Best Practices

### 1. Error Handling

**ALWAYS use the error handling utilities:**

```typescript
// GOOD - Use the utility functions
import { handleSearchError, handleToolError } from "../../utils/error-handling.js";

// For search operations
catch (error) {
  return handleSearchError(error, "candidates");
}

// For CRUD operations
catch (error) {
  return handleToolError(error, "creating", "Candidate");
}
```

**NEVER write inline error handling:**

```typescript
// BAD - Don't do this
catch (error) {
  if (error instanceof z.ZodError) {
    return { content: [{ type: "text", text: `Validation error: ${formatZodErrors(error.errors)}` }], isError: true };
  }
  // ... more repetitive code
}
```

### 2. Schema Definitions

**ALWAYS define schemas in `types/schemas.ts`:**

```typescript
// In types/schemas.ts
export const updateCandidateWithIdSchema = z.object({
  id: z.string().min(1, "Candidate ID is required"),
  ...updateCandidateSchema.shape,
});
```

**NEVER define schemas inline in tool files:**

```typescript
// BAD - Don't do this in tool files
const updateCandidateWithIdSchema = z.object({
  id: z.string().min(1, "Candidate ID is required"),
  // ... inline definition
});
```

### 3. Code Formatting

**ALWAYS use 2-space indentation:**

```typescript
// GOOD
export function registerCandidateTools(
  server: McpServer,
  client: BoondAPIClient
): void {
  server.registerTool(
    "boond_candidates_search",
    {
      description: "Search candidates",
      inputSchema: searchParamsSchema.shape,
    },
    async (params) => {
      // implementation
    }
  );
}
```

**NEVER use inconsistent indentation:**

```typescript
// BAD - Mixed indentation
      } catch (error) {
         if (error instanceof z.ZodError) {  // 9 spaces - wrong!
```

### 4. Type Safety

**ALWAYS use proper typing:**

```typescript
// GOOD
function formatCandidateList(result: SearchResponse<Candidate>): string {
  // implementation
}

// GOOD - Explicit return types on exported functions
export function registerCandidateTools(
  server: McpServer,
  client: BoondAPIClient
): void {
```

**NEVER use `any` or unsafe type assertions:**

```typescript
// BAD
const data = params as { id: string; [key: string]: unknown };

// GOOD - Use proper schema validation
const validated = updateCandidateSchema.parse(params);
```

### 5. Import Organization

Organize imports in this order:
1. External dependencies (zod, MCP SDK)
2. Type imports from types/
3. API client and error imports
4. Utility imports

```typescript
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import type { Candidate, SearchResponse } from "../../types/boond.js";
import {
  searchParamsSchema,
  createCandidateSchema,
  candidateIdSchema,
} from "../../types/schemas.js";

import { ValidationError } from "../../api/client.js";
import { handleSearchError, handleToolError } from "../../utils/error-handling.js";
```

### 6. Tool Registration Pattern

Follow this consistent pattern for all tools:

```typescript
export function registerXTools(
  server: McpServer,
  client: BoondAPIClient
): void {
  // Search tool
  server.registerTool(
    "boond_x_search",
    {
      description: "Search X by criteria",
      inputSchema: searchParamsSchema.shape,
    },
    async (params) => {
      try {
        const validated = searchParamsSchema.parse(params);
        const result = await client.searchX(validated);
        return {
          content: [{ type: "text", text: formatXList(result) }],
        };
      } catch (error) {
        return handleSearchError(error, "x");
      }
    }
  );

  // Get by ID tool
  server.registerTool(
    "boond_x_get",
    {
      description: "Get an X by ID",
      inputSchema: xIdSchema.shape,
    },
    async (params) => {
      try {
        const validated = xIdSchema.parse(params);
        const item = await client.getX(validated.id);
        return {
          content: [{ type: "text", text: formatX(item) }],
        };
      } catch (error) {
        return handleToolError(error, "retrieving", "X");
      }
    }
  );

  // Create tool
  server.registerTool(
    "boond_x_create",
    {
      description: "Create a new X",
      inputSchema: createXSchema.shape,
    },
    async (params) => {
      try {
        const validated = createXSchema.parse(params);
        const item = await client.createX(validated);
        return {
          content: [{
            type: "text",
            text: `X created successfully!\n\n${formatX(item)}`,
          }],
        };
      } catch (error) {
        return handleToolError(error, "creating", "X");
      }
    }
  );

  // Update tool
  server.registerTool(
    "boond_x_update",
    {
      description: "Update an existing X",
      inputSchema: updateXWithIdSchema.shape,
    },
    async (params) => {
      try {
        const validated = updateXWithIdSchema.parse(params);
        const { id, ...updateData } = validated;
        const item = await client.updateX(id, updateData);
        return {
          content: [{
            type: "text",
            text: `X updated successfully!\n\n${formatX(item)}`,
          }],
        };
      } catch (error) {
        return handleToolError(error, "updating", "X");
      }
    }
  );
}
```

### 7. Formatter Functions

Keep formatter functions simple and consistent:

```typescript
function formatXList(result: SearchResponse<X>): string {
  if (result.data.length === 0) {
    return "No X found.";
  }

  const items = result.data.map((item) => {
    const lines: string[] = [];
    lines.push(`📄 ${item.name} (ID: ${item.id})`);
    if (item.description) lines.push(`   Description: ${item.description}`);
    // ... more fields
    return lines.join("\n");
  });

  const summary = `Found ${result.data.length} X(s) (Page ${result.pagination.page}/${Math.ceil(result.pagination.total / result.pagination.limit)} of ${result.pagination.total} total)`;

  return `${summary}\n\n${items.join("\n\n")}`;
}

function formatX(item: X): string {
  const lines: string[] = [];
  lines.push(`📄 X: ${item.name}`);
  lines.push(`ID: ${item.id}`);
  if (item.description) lines.push(`Description: ${item.description}`);
  if (item.createdAt) lines.push(`Created: ${item.createdAt}`);
  if (item.updatedAt) lines.push(`Updated: ${item.updatedAt}`);

  return lines.join("\n");
}
```

### 8. Testing

When adding tests (future work):
- Test error handling paths
- Mock the API client
- Test formatter functions with edge cases

## Common Issues to Avoid

1. **Duplicate error handling** - Always use the utilities
2. **Inconsistent indentation** - Use 2 spaces everywhere
3. **Inline schema definitions** - Move to schemas.ts
4. **Missing explicit return types** - Add return types to all functions
5. **Unused imports** - Clean up imports after refactoring
6. **Mixed abstraction levels** - Keep formatters separate from API calls

## Refactoring Checklist

When refactoring a tool file:

- [ ] Replace inline error handling with `handleSearchError`/`handleToolError`
- [ ] Fix indentation to 2 spaces consistently
- [ ] Move inline schemas to `types/schemas.ts`
- [ ] Update imports to use error-handling utilities
- [ ] Add explicit return types to formatter functions
- [ ] Remove unused imports (formatZodErrors, NotFoundError if not needed)
- [ ] Verify build passes: `bunx tsc --noEmit`
- [ ] Verify no functional changes

## Environment Variables

Required:
- `BOOND_API_TOKEN` - API authentication token

Optional:
- `BOOND_API_URL` - Custom API base URL (default: https://ui.boondmanager.com/api/1.0)

## Build Commands

```bash
# Type check
bunx tsc --noEmit

# Build
bun run build

# Development watch mode
bun run dev
```

## API Client Configuration

The API client supports:
- Request timeout (30s default, configurable)
- Environment-based base URL
- Automatic error classification
- AbortController for cancellation

## Domain Organization

Tools are organized by business domain:
- **HR**: candidates, contacts, resources, contracts
- **CRM**: companies, opportunities, quotations
- **Finance**: invoices, purchases, orders, banking
- **Projects**: projects, deliveries, actions
- **Time**: timeReports, absences, expenses
- **Admin**: agencies, accounts, businessUnits
- **Documents**: document management
- **System**: apps, settings, alerts

Each domain should follow the same patterns and structure.

## Troubleshooting

### Git Issues

**"fatal: not a git repository" in worktree**
```bash
# Navigate to the worktree directory
cd /path/to/boond-mcp-worktrees/feature-name

# Verify worktree is properly linked
git worktree list

# If not listed, recreate from main worktree
cd /path/to/boond-mcp
git worktree add ../boond-mcp-worktrees/feature-name feature/name
```

**Wrong Git user in commits**
```bash
# Check current config
git config --local user.name
git config --local user.email

# Fix if incorrect
git config --local user.name "imarinmed"
git config --local user.email "imarinmed@users.noreply.github.com"

# Amend last commit if needed
git commit --amend --author="imarinmed <imarinmed@users.noreply.github.com>"
```

**Merge conflicts in worktrees**
```bash
# From the worktree directory
git fetch origin
git rebase origin/main

# Resolve conflicts, then
git add .
git rebase --continue
```

### Build Issues

**TypeScript compilation errors**
```bash
# Check for type errors
bunx tsc --noEmit

# Common fixes:
# 1. Missing type imports - add proper import statements
# 2. Implicit any - add explicit types
# 3. Missing properties - check interface definitions
```

**ESLint errors**
```bash
# Run linter to see errors
bun run lint

# Auto-fix many issues
bun run lint:fix

# For remaining errors, manually fix or disable with comment:
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = fetchData();
```

**Prettier formatting issues**
```bash
# Check formatting
bun run format:check

# Auto-format all files
bun run format
```

### MCP Server Issues

**"BOOND_API_TOKEN not set" error**
```bash
# Create .env file
cp .env.example .env

# Edit and add your token
BOOND_API_TOKEN=your_token_here

# Or set as environment variable
export BOOND_API_TOKEN=your_token_here
```

**Server crashes on startup**
```bash
# Check for stdout output (should only use stderr)
BOOND_API_TOKEN=test bun run build/index.js 2>/dev/null
# Should produce NO output

# Check stderr for errors
BOOND_API_TOKEN=test bun run build/index.js 2>&1 | head -20
```

**Tools not appearing in Claude Desktop**
```bash
# 1. Verify build is successful
bun run build

# 2. Check tool count
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | bun run build/index.js 2>/dev/null | jq '.result.tools | length'

# 3. Restart Claude Desktop after config changes
# 4. Check Claude Desktop logs for errors
```

### API Issues

**401 Authentication errors**
- Verify `BOOND_API_TOKEN` is correct
- Check token hasn't expired
- Ensure token has required permissions

**404 Not Found errors**
- Verify resource ID exists
- Check API endpoint URL
- Ensure resource hasn't been deleted

**422 Validation errors**
- Check required fields are provided
- Verify data types match schema
- Review error message for specific field issues

**Timeout errors**
- Default timeout is 30 seconds
- Check network connectivity
- Consider increasing timeout for slow operations:
  ```typescript
  const client = new BoondAPIClient(token, undefined, 60000); // 60s timeout
  ```

### Development Workflow

**Pre-commit checks failing**
```bash
# Run all validation steps
bun run validate

# Or run individually
bun run typecheck
bun run lint
bun run format:check
bun run build
```

**Worktree out of sync with main**
```bash
# From worktree directory
git fetch origin
git rebase origin/main

# Or merge
git merge origin/main
```

### Getting Help

If you encounter issues not covered here:

1. Check the [GitHub Issues](https://github.com/imarinmed/boond-mcp/issues)
2. Review error messages carefully
3. Check logs with verbose output
4. Create a minimal reproduction case
5. Open a new issue with:
   - Error message
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node/Bun version)

## Repository Hygiene

### AI-Generated Analysis & Reports

This repository uses a clean root with no committed AI-generated analysis documents. All AI-generated analysis, refactoring summaries, and comprehensive reports belong in the `.sisyphus/notepads/` directory, which is git-ignored.

**Policy:**

- AI analysis artifacts (e.g., `COMPREHENSIVE_ANALYSIS.md`, `REFACTORING_SUMMARY.md`) are **never committed** to the repo root
- All local analysis work goes to: `.sisyphus/notepads/{plan-name}/`
- The `.sisyphus/` directory is fully git-ignored and ephemeral (destroyed/recreated across sessions)
- Repository root remains clean and contains only essential project files

**Rationale:** Keeps the repository lean, prevents merge conflicts on auto-generated documents, and maintains clear separation between versioned code and ephemeral AI working notes.
