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
