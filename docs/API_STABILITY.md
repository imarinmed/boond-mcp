# BoondManager MCP Server - API Stability (v1.0.0)

This document outlines the API stability guarantees for the BoondManager MCP Server, starting from the v1.0.0 stable release. It defines what constitutes the stable API surface, our versioning policy, and how we handle changes and deprecations.

## 1. Introduction

The BoondManager MCP Server is designed to provide a reliable and predictable interface for AI assistants to interact with BoondManager. As we move to v1.0.0, we are committing to API stability to ensure that integrations built on top of this server continue to function correctly as the project evolves.

### v1.0.0 Stability Guarantees

- **Backward Compatibility**: We guarantee that any integration working with v1.0.0 will continue to work with all subsequent 1.x releases.
- **Predictability**: Tool names, parameter structures, and response formats will remain consistent.
- **Reliability**: Error codes and validation rules will follow established patterns.

## 2. Frozen API Surface

The following elements of the BoondManager MCP Server API are considered **FROZEN** as of v1.0. Any changes to these elements will follow the Semantic Versioning and Deprecation policies outlined below.

### Tool Names

All 121 tools registered with the server are frozen. This includes the naming convention `boond_<domain>_<action>`.

**Examples of Frozen Tool Names:**

- `boond_candidates_search`, `boond_candidates_get`, `boond_candidates_create`, `boond_candidates_update`
- `boond_companies_search`, `boond_companies_get`, `boond_companies_create`, `boond_companies_update`
- `boond_timereports_search`, `boond_timereports_get`, `boond_timereports_create`
- `boond_invoices_search`, `boond_invoices_get`, `boond_invoices_create`

### Tool Parameters

The input schemas for all tools (defined via Zod in `src/types/schemas.ts`) are frozen.

- **Required Fields**: Fields marked as required in v1.0 will remain required.
- **Field Names**: Parameter names (e.g., `firstName`, `companyId`, `startDate`) are locked.
- **Data Types**: The expected types (string, number, boolean, enum) are fixed.
- **Validation Rules**: Minimum/maximum values, string patterns, and email formats are stable.

### Response Formats

The structure of data returned by the tools is frozen.

- **Search Responses**: All search tools return a `SearchResponse<T>` structure containing `data` (array of items) and `pagination` metadata.
- **Single Item Responses**: Tools that retrieve or create a single record return the resource object directly.
- **Text Output Patterns**: The human-readable text formatting used for tool responses in MCP clients is maintained for consistency.

### Error Codes and Handling

The error classification and reporting mechanism is frozen.

- **ValidationError**: Returned when input parameters fail Zod validation.
- **NotFoundError**: Returned when a requested resource (by ID) does not exist.
- **APIError**: Returned for BoondManager API-specific errors (401, 403, 500, etc.).
- **HTTP Status Mapping**: The mapping between BoondManager API status codes and MCP error responses is stable.

## 3. Semantic Versioning Policy

We strictly follow [Semantic Versioning 2.0.0 (SemVer)](https://semver.org/).

### Major Version (X.0.0)

**Breaking changes** require a major version bump. Examples include:

- Removing a tool.
- Renaming a tool.
- Adding a new required parameter to an existing tool.
- Removing or renaming an existing parameter.
- Changing the structure of a response in an incompatible way.
- Changing the fundamental behavior of a tool.

### Minor Version (1.X.0)

**Backward-compatible additions** result in a minor version bump. Examples include:

- Adding a new tool.
- Adding an optional parameter to an existing tool.
- Adding new fields to a response object.
- Improving the human-readable formatting of responses.
- Adding new error types that don't break existing handling.

### Patch Version (1.0.X)

**Backward-compatible bug fixes** result in a patch version bump. Examples include:

- Fixing internal implementation bugs.
- Improving performance without changing the API.
- Updating documentation and examples.
- Security patches.
- Refining error messages (text content, not error codes).

## 4. Deprecation Process

When a feature or tool needs to be replaced or removed, we follow a transparent deprecation process:

1.  **Announcement**: The feature is marked as `deprecated` in the documentation (`API_REFERENCE.md`).
2.  **Warning**: If supported by the MCP client, a deprecation warning is included in the tool's response.
3.  **Maintenance**: The deprecated feature is maintained for at least one full major version cycle.
4.  **Removal**: The feature is removed in the next major version (e.g., v2.0.0).
5.  **Migration Path**: We will always provide a clear migration path and documentation for moving to the replacement feature.

## 5. What Can Change

### Safe to Change (Non-Breaking)

- **Internal Logic**: How the server processes requests or interacts with the BoondManager API.
- **Performance**: Optimizations that make the server faster or more efficient.
- **Documentation**: Improvements to READMEs, guides, and inline comments.
- **Dependencies**: Updating internal libraries as long as they don't affect the public API.
- **Log Output**: Changes to internal server logging.

### Cannot Change (Breaking)

- **Tool Signatures**: Names, required parameters, and parameter types.
- **Response Contracts**: The JSON structure of the data returned.
- **Error Contracts**: The types of errors thrown and their identifying codes.
- **Validation Strictness**: Making validation rules more restrictive (e.g., making an optional field required).

## 6. Version Support

### v1.x LTS (Long Term Support)

- **Security Fixes**: Guaranteed for 2 years after the v1.0.0 release.
- **Critical Bug Fixes**: Guaranteed for 1 year after the v1.0.0 release.
- **New Features**: Will be added to the current minor version of the v1.x branch.

---

_Last Updated: February 8, 2026_
