# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- AI skill file (`docs/skills/boond-mcp.md`) with full tool catalog, workflows, auth setup, and error handling hints for AI assistants
- AI skills installation guide (`docs/AI_SKILLS.md`) for users and AI assistants
- Skill install instructions in README `For AI Assistants` section
- Prettier configuration for code formatting
- GitHub Actions CI/CD pipeline for automated validation
- New npm scripts: lint, lint:fix, format, format:check, typecheck, validate
- Git worktree documentation in AGENTS.md
- Contributing guidelines in CONTRIBUTING.md
- Git workflow documentation with commit conventions

### Changed
- Updated package.json with development tooling dependencies
- Improved code quality enforcement through automated checks

## [0.1.0] - 2026-02-05

### Added
- Initial release of BoondManager MCP Server
- 95 MCP tools across 8 business domains:
  - HR: candidates, contacts, resources, contracts
  - CRM: companies, opportunities, quotations
  - Projects: projects, deliveries, actions
  - Finance: invoices, purchases, orders, banking
  - Time: time reports, expenses, absences
  - Admin: agencies, business units, accounts
  - Documents: document management
  - System: apps, settings, alerts
- Complete API client with error handling and timeout support
- TypeScript type definitions for all resources
- Zod validation schemas for all inputs
- Centralized error handling utilities
- Comprehensive documentation (README, AGENTS.md, SETUP.md, DISTRIBUTION.md)
- Support for multiple distribution methods (npm, Docker, Smithery)

### Features
- Full CRUD operations for all major resources
- Search functionality with pagination
- Proper error handling with typed errors
- Environment-based configuration
- Request timeout with AbortController
- Stdio transport for MCP compliance

[Unreleased]: https://github.com/imarinmed/boond-mcp/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/imarinmed/boond-mcp/releases/tag/v0.1.0
