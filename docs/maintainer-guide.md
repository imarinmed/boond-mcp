# Boond MCP Maintainer Guide

This guide helps maintainers and support staff understand, troubleshoot, and escalate issues with the Boond MCP server.

---

## Placeholder Values Guide

When the MCP server extracts data from Boond API responses, it normalizes fields to ensure consistent output. Sometimes the API returns incomplete data or fields with unexpected names. In these cases, the server uses placeholder values.

### When 'unknown' vs 'not available' Is Used

| Placeholder | Used When | Example Functions |
|-------------|-----------|-------------------|
| `'unknown'` | No valid value could be extracted from any candidate field | `pickStatus()`, `pickCompanyId()`, `pickTotal()`, `pickType()`, `pickResourceId()`, `pickProjectId()`, `pickDate()` |
| `'not available'` | Specifically for email fields when no email is found | `pickEmail()` |
| `''` (empty string) | For name fields when no identifier is found | `pickName()` |

### Candidate Field Pattern

The normalization functions try multiple candidate field names in priority order. For example, `pickStatus()` checks:

```typescript
const candidates = ['status', 'state', 'workflowStatus', 'validationStatus', 'activity', 'active'];
```

The first non-empty string match wins. If none match, the function returns `'unknown'`.

### DEBUG_FIELDS Mode

Enable debug output by setting the environment variable:

```bash
BOOND_DEBUG_FIELDS=true
```

When enabled:
- `formatUnknown()` appends `[debug: no valid candidates found]` to placeholder values
- `formatUnknownWithDebug()` shows the actual candidate values that were checked

**Example output difference:**

```text
# Normal mode
Status: unknown

# DEBUG_FIELDS=true
Status: unknown [debug: no valid candidates found]
```

Use this mode when investigating why a field appears as 'unknown' to see which candidates were checked.

### Common Normalized Fields

The `_normalized` object attached to entities contains:

| Entity Type | Normalized Fields |
|-------------|-------------------|
| Invoice/Order/Purchase | `status`, `companyId`, `total` |
| Contract | `resourceId`, `type`, `status`, `startDate` |
| Action | `name`, `status` |
| Alert | `type`, `status` (severity), `name` (message) |
| Absence | `resourceId`, `type`, `status`, `startDate`, `endDate` |

---

## Error Classification Reference

The MCP classifies all API errors into standardized categories. This helps determine the root cause and whether to escalate.

### Error Class to Boond-Side Cause Mapping

| Classification | HTTP Status | Likely Boond-Side Cause | Example Message Patterns |
|----------------|-------------|------------------------|--------------------------|
| `permission_denied` | 403 | Credentials lack required role/permission | "Forbidden: insufficient permissions for this endpoint" |
| `provider_blocked` | 403 | Cloudflare/WAF blocking the request | "cloudflare", "waf", "attention required", "just a moment" |
| `resource_not_found` | 404 | Resource does not exist or endpoint unavailable | "Resource not found" |
| `unsupported_endpoint` | 405 | HTTP method not supported for this endpoint | "Method not allowed", 405 response |
| `validation_rejected` | 422 | Request body does not match API contract | "Validation failed", invalid field format |
| `input_required` | Any | Missing required parameter in request | "missing required", "required parameter", "must be provided" |
| `unknown_error` | Other | Unclassified error | Any other error message |

### How Classification Works

The `classifyError()` function in `src/utils/error-classification.ts`:

1. Checks for input required patterns first (regex match on message)
2. For 403 errors: distinguishes permission issues from Cloudflare blocks
3. Maps status codes directly: 404, 405, 422
4. Falls back to `unknown_error` for unclassified cases

### Using Classification in Tools

All tools use standardized error handlers that automatically classify errors:

```typescript
import { handleSearchError, handleToolError } from '../../utils/error-handling.js';

// For search operations
catch (error) {
  return handleSearchError(error, 'candidates');
}

// For CRUD operations
catch (error) {
  return handleToolError(error, 'creating', 'Candidate');
}
```

---

## Escalation Decision Tree

### What to Escalate to Boond IT

Escalate when the issue is clearly upstream (Boond API or infrastructure):

#### 1. Endpoint/Method Compatibility Issues

**Symptom:** Document search fails with "no compatible endpoint responded successfully"

**What to say:**

> After the MCP-side request compatibility fix, document search still has no working Boond API path in this tenant: none of the tested compatible document-search endpoints returned a successful response. Please confirm the supported endpoint/method for document search and whether this capability is exposed in this environment.

**Evidence to gather:**
- Tool name: `boond_documents_search`
- Arguments used: `{ "query": "test", "page": 1, "limit": 1 }`
- Exact error message
- UTC timestamp of test

#### 2. Cloudflare/WAF Blocks

**Symptom:** 403 Forbidden with Cloudflare keywords

**What to say:**

> Authenticated requests to contracts search are being blocked upstream by Cloudflare/WAF with `403 Forbidden` before the Boond application responds. Please review WAF/routing rules or allowlisting for this API path so valid MCP traffic can reach the contracts search endpoint.

**Evidence to gather:**
- Tool name: `boond_contracts_search`
- Any response headers mentioning Cloudflare
- Request timestamp
- Classification: `provider_blocked`

#### 3. Endpoint Exhaustion (All Routes Fail)

**Symptom:** All tested endpoints for a capability return 403/404/405

**What to say:**

> Expense report search could not be completed because all tested expense-search routes returned `403`, `404`, or `405`, with no successful endpoint/method combination. Please confirm the supported expense report search endpoint, HTTP method, and required permissions, or confirm that this capability is not exposed for this tenant/API version.

**Evidence to gather:**
- Tool name: `boond_expenses_search`
- List of endpoints attempted
- Response codes from each

### What NOT to Escalate

These are expected behaviors or MCP-side issues that have been fixed:

#### Permission Issues (Current Credentials)

**Example:** `banking_accounts_search` returning "Forbidden: insufficient permissions"

**How to respond:**

> This is not an MCP defect: the current Boond credentials do not have sufficient permission to search banking accounts. Please verify user role/API entitlement only if banking account search is expected for this account.

**Why not escalate:** The MCP is correctly reporting what the Boond API returned. The credentials simply lack permission.

#### Resource Not Found (Tenant Capability)

**Examples:** `quotations_search`, `settings_search` returning "Resource not found"

**How to respond:**

> Quotations search is returning upstream `resource not found`. Please confirm whether quotations search exists for this tenant/API version; if not, classify this as unavailable/unsupported rather than an MCP bug.

**Why not escalate:** The tenant may not have this capability enabled. This is a configuration question, not a defect.

#### MCP-Side Issues Already Fixed

Do not escalate these (they've been resolved):

- Documents search "Validation failed" masking error (fixed)
- POST /documents probing during fallback (removed)
- Actions/alerts not respecting requested `limit` (fixed)
- `absences_get` fallback resolution (added)
- Invalid date formatting (fixed)
- Zero-byte document size display (fixed)
- Falsy expense resource ID handling (fixed)

### Evidence Checklist for Support Tickets

For every escalated item, include:

- [ ] Exact UTC timestamp of the test
- [ ] Exact tool/action called
- [ ] Exact argument payload used
- [ ] Returned message and classification
- [ ] Statement that the same deployed MCP instance successfully accesses 7+ other Boond capabilities

**Additional per-issue evidence:**

| Issue Type | Additional Evidence |
|------------|---------------------|
| Permission issue | Credential role expectations, exact "Forbidden: insufficient permissions" message |
| WAF/perimeter block | Response body text, Cloudflare wording, response headers, request timestamp |
| Endpoint unavailable | List of endpoint-method combinations attempted, exhaustion message |

---

## Verification Quick Reference

### Running the Capabilities Probe

The fastest way to verify MCP health and identify which endpoints are working:

```bash
# Using the MCP tool directly
echo '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "boond_capabilities_probe",
    "arguments": { "limit": 1 }
  }
}' | BOOND_API_TOKEN=your_token node build/index.js 2>/dev/null
```

Or via HTTP if running in HTTP mode:

```bash
curl -X POST http://localhost:3000/mcp/http \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_mcp_api_key" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "boond_capabilities_probe",
      "arguments": { "limit": 1 }
    }
  }'
```

### Interpreting Probe Results

The probe returns a summary like:

```text
OK=7 | Forbidden=2 | NotAvailable=3 | MethodMismatch=1 | Validation=0 | Auth=0 | InputRequired=1 | Error=0
```

| Category | Meaning | Action |
|----------|---------|--------|
| `OK` | Tool executed successfully | No action needed |
| `Forbidden` | 403 response (permission or WAF block) | Check credentials or escalate if WAF |
| `NotAvailable` | 404 response (resource not found) | Check if capability exists for tenant |
| `MethodMismatch` | 405 response (wrong HTTP method) | Escalate endpoint compatibility |
| `Validation` | 422 response (validation failed) | Check request payload |
| `Auth` | 401 response (authentication failed) | Check API token |
| `InputRequired` | Missing required parameters | Expected for tools with dependencies |
| `Error` | Other errors | Investigate individually |

### Checking Individual Endpoint Health

Test a specific tool:

```bash
echo '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "boond_candidates_search",
    "arguments": { "limit": 1 }
  }
}' | BOOND_API_TOKEN=your_token node build/index.js 2>/dev/null
```

### What Good Health Looks Like

A healthy MCP deployment shows:

- Multiple `OK` responses (7+ tools working)
- Consistent behavior across tools in the same domain
- No `Validation` or `Auth` errors with valid credentials
- `Forbidden` errors isolated to specific tools (permission issues)

If only 1-2 tools fail while others succeed, the MCP is working correctly and the issue is upstream.

---

## Related Documentation

- [Boond IT Escalation Pack](./boond-it-escalation-2026-03-10.md) - Detailed escalation examples and evidence from 2026-03-10
- [AGENTS.md](./AGENTS.md) - Development workflow and code patterns
- [API_STABILITY.md](./API_STABILITY.md) - API stability guarantees
- [LTS_POLICY.md](./LTS_POLICY.md) - Long-term support policy

---

## Quick Reference Card

```
ERROR CLASSIFICATIONS:
  permission_denied  → 403, credentials issue
  provider_blocked   → 403, Cloudflare/WAF
  resource_not_found → 404, missing resource
  unsupported_endpoint → 405, method mismatch
  validation_rejected → 422, contract mismatch
  input_required     → missing required params

DEBUGGING:
  BOOND_DEBUG_FIELDS=true  → Show field extraction details

VERIFICATION:
  boond_capabilities_probe → Check all endpoints
  Summary: OK=X | Forbidden=X | NotAvailable=X | ...

ESCALATE WHEN:
  ✓ Multiple endpoints fail with same error
  ✓ Cloudflare/WAF blocking
  ✓ Method/endpoint compatibility issue
  
DO NOT ESCALATE:
  ✗ Single permission issue (expected)
  ✗ Resource not found (tenant config)
  ✗ MCP-side bugs (already fixed)
```
