# Contributing to BoondManager MCP Server

Thank you for your interest in contributing to the BoondManager MCP Server! This document provides guidelines and best practices for contributing to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Git Workflow](#git-workflow)
- [Code Style](#code-style)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.0.0 or higher)
- Git
- A BoondManager API token

### Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/boond-mcp.git
cd boond-mcp

# Add upstream remote
git remote add upstream https://github.com/imarinmed/boond-mcp.git
```

## Development Setup

### Install Dependencies

```bash
bun install
```

### Environment Configuration

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your BoondManager API token:

```
BOOND_API_TOKEN=your_api_token_here
```

### Verify Setup

```bash
# Type check
bunx tsc --noEmit

# Build
bun run build

# Run in development mode
bun run dev
```

## Git Workflow

### Git Configuration

**IMPORTANT: Always use the correct Git user configuration:**

```bash
# Configure for this repository only
git config --local user.name "imarinmed"
git config --local user.email "imarinmed@users.noreply.github.com"

# Verify
git config --local user.name   # Should output: imarinmed
git config --local user.email  # Should output: imarinmed@users.noreply.github.com
```

### Git Worktrees

We use Git worktrees for parallel development. This allows you to work on multiple features simultaneously.

#### Creating a Worktree

```bash
# Create a new worktree for your feature
git worktree add ../boond-mcp-worktrees/feature-name -b feature/name

# Example
git worktree add ../boond-mcp-worktrees/feature-time-calendar -b feature/time-calendar
```

#### Working in a Worktree

```bash
# Navigate to the worktree
cd ../boond-mcp-worktrees/feature-time-calendar

# Make your changes
# ... edit files ...

# Commit
git add .
git commit -m "feat(time): add calendar integration"

# Push from the main worktree
cd ../../boond-mcp
git push origin feature/time-calendar
```

#### Managing Worktrees

```bash
# List all worktrees
git worktree list

# Remove a worktree when done
git worktree remove ../boond-mcp-worktrees/feature-time-calendar
git branch -d feature/time-calendar
```

### Branch Naming

Follow these conventions:

- `feature/<domain>-<description>` - New features (e.g., `feature/time-calendar`)
- `fix/<domain>-<description>` - Bug fixes (e.g., `fix/hr-candidate-search`)
- `refactor/<component>` - Code refactoring (e.g., `refactor/api-client`)
- `docs/<section>` - Documentation updates (e.g., `docs/api-reference`)
- `chore/<task>` - Maintenance tasks (e.g., `chore/update-dependencies`)

### Commit Messages

Follow **Conventional Commits**:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New features or tools
- `fix`: Bug fixes
- `refactor`: Code restructuring
- `docs`: Documentation updates
- `style`: Code style changes
- `test`: Adding or updating tests
- `chore`: Build process, dependencies
- `perf`: Performance improvements

**Scopes:**
- `hr`, `crm`, `finance`, `projects`, `time`, `admin`, `documents`, `system`
- `api`, `types`, `utils`, `schemas`

**Examples:**

```bash
# Good
feat(time): add calendar event creation tool
fix(hr): resolve candidate search pagination bug
refactor(api): split client into domain modules
docs: add Git workflow documentation

# Bad
update
fixed stuff
WIP
```

## Code Style

### TypeScript

- Use strict TypeScript mode
- Avoid `any` types
- Add explicit return types to exported functions
- Use proper typing for all parameters

### Formatting

- Use 2-space indentation
- Use semicolons
- Use single quotes for strings
- Trailing commas in multi-line objects/arrays

### Import Organization

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

### Error Handling

**Always use the error handling utilities:**

```typescript
// GOOD
import { handleSearchError, handleToolError } from "../../utils/error-handling.js";

catch (error) {
  return handleSearchError(error, "candidates");
}

// BAD - Don't write inline error handling
catch (error) {
  if (error instanceof z.ZodError) {
    // ... verbose error handling
  }
}
```

### Schema Definitions

**Always define schemas in `types/schemas.ts`:**

```typescript
// In types/schemas.ts
export const updateCandidateWithIdSchema = z.object({
  id: z.string().min(1, "Candidate ID is required"),
  ...updateCandidateSchema.shape,
});
```

**Never define schemas inline in tool files.**

## Testing

### Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run tests with coverage
bun test --coverage
```

### Writing Tests

- Test error handling paths
- Mock the API client
- Test formatter functions with edge cases
- Aim for >80% code coverage

## Submitting Changes

### Before Submitting

Run these checks:

```bash
# Type check
bunx tsc --noEmit

# Build
bun run build

# Run tests
bun test
```

### Pull Request Process

1. **Create a feature branch** using worktrees
2. **Make your changes** following the code style guidelines
3. **Commit** with conventional commit messages
4. **Push** to your fork
5. **Create a Pull Request** against the main repository

### PR Checklist

- [ ] Branch is up to date with `main`
- [ ] All tests pass
- [ ] TypeScript compiles without errors
- [ ] Code follows project style guidelines
- [ ] Commit messages follow conventional commits
- [ ] Git user is configured as `imarinmed`

### PR Description

Include in your PR description:

1. **What** - What changes were made
2. **Why** - Why these changes were necessary
3. **How** - How the changes were implemented
4. **Testing** - How the changes were tested

Example:

```markdown
## Summary
Added calendar integration tools for the Time domain.

## Changes
- Added `boond_calendar_create` tool
- Added `boond_calendar_list` tool
- Updated documentation

## Testing
- Added unit tests for new tools
- Tested against live BoondManager API
- All existing tests pass

## Related Issues
Closes #123
```

## Questions?

If you have questions or need help:

1. Check the [AGENTS.md](AGENTS.md) file for detailed best practices
2. Open an issue on GitHub
3. Reach out to the maintainers

Thank you for contributing!
