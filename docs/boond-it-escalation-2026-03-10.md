# Boond IT Escalation Pack — 2026-03-10

Target MCP server: `https://boond-mcp-d61y.onrender.com/mcp/http`

Latest MCP fix deployed: commit `30c2bbea905f5830d2fa6048b5756169f9052ee3`

Latest successful deploy: `dep-d6o0293uibrs738ocqag`

## Executive Summary

Boond MCP is live and healthy.

The MCP-side request compatibility issue for `boond_documents_search` was fixed and re-verified live afterward. The remaining failures below are now upstream Boond responses (`403/404/405`, Cloudflare/WAF block, insufficient permissions, or resource-not-found), not MCP transport/orchestration failures.

Live capability probe on `2026-03-10T11:45:09.816770+00:00` returned:

- `OK=7`
- `Forbidden=2`
- `NotAvailable=3`
- `MethodMismatch=1`
- `Validation=0`
- `Auth=0`
- `InputRequired=1`
- `Error=0`

This means the same deployed MCP instance and same credentials are successfully reading other Boond capabilities in the same environment.

## Must Escalate to Boond IT Now

### 1. `documents_search`

**Classification:** Upstream endpoint/method compatibility or capability exposure issue

**What to say to Boond IT**

> After the MCP-side request compatibility fix, document search still has no working Boond API path in this tenant: none of the tested compatible document-search endpoints returned a successful response. Please confirm the supported endpoint/method for document search and whether this capability is exposed in this environment.

**Live evidence**

- Tool: `boond_documents_search`
- Arguments: `{ "query": "test", "page": 1, "limit": 1 }`
- Timestamp UTC: `2026-03-10T11:45:09.816770+00:00`
- Result:

```text
Error searching documents: Document search failed: no compatible documents search endpoint responded successfully (tried GET /documents, GET /documents/search, POST /documents/search, GET /documents/list, POST /documents/list).
```

**Important note**

- The old ambiguous MCP-side error `Validation failed` is gone.
- The MCP no longer probes `POST /documents` and now returns a precise compatibility diagnostic.

---

### 2. `contracts_search`

**Classification:** Upstream Cloudflare/WAF/perimeter block

**What to say to Boond IT**

> Authenticated requests to contracts search are being blocked upstream by Cloudflare/WAF with `403 Forbidden` before the Boond application responds. Please review WAF/routing rules or allowlisting for this API path so valid MCP traffic can reach the contracts search endpoint.

**Live evidence**

- Tool: `boond_contracts_search`
- Arguments: `{ "page": 1, "limit": 1 }`
- Timestamp UTC: `2026-03-10T11:45:09.816770+00:00`
- Result:

```text
Error searching contracts: Forbidden by Cloudflare/WAF while reaching Boond API. Verify API host, auth mode, and endpoint permissions.
```

---

### 3. `expenses_search`

**Classification:** Upstream endpoint availability / method / permission issue

**What to say to Boond IT**

> Expense report search could not be completed because all tested expense-search routes returned `403`, `404`, or `405`, with no successful endpoint/method combination. Please confirm the supported expense report search endpoint, HTTP method, and required permissions, or confirm that this capability is not exposed for this tenant/API version.

**Live evidence**

- Tool: `boond_expenses_search`
- Arguments: `{ "page": 1, "limit": 1 }`
- Timestamp UTC: `2026-03-10T11:45:09.816770+00:00`
- Result:

```text
Error searching expense reports: All expense report search endpoints returned 403/404/405. This endpoint may require specific permissions or may be unavailable in your Boond instance.
```

## Do Not Escalate as MCP Bug

These should be framed as permission/support/availability questions, not as MCP defects.

### `banking_accounts_search`

**Classification:** Current credentials lack permission

**What to say**

> This is not an MCP defect: the current Boond credentials do not have sufficient permission to search banking accounts. Please verify user role/API entitlement only if banking account search is expected for this account.

**Live evidence**

```text
Error searching banking accounts: Forbidden: insufficient permissions for this endpoint
```

---

### `quotations_search`

**Classification:** Resource not found / confirm tenant support

**What to say**

> Quotations search is returning upstream `resource not found`. Please confirm whether quotations search exists for this tenant/API version; if not, classify this as unavailable/unsupported rather than an MCP bug.

**Live evidence**

```text
Error searching quotations: Resource not found
```

---

### `settings_search`

**Classification:** Resource not found / confirm tenant support

**What to say**

> Settings search is returning upstream `resource not found`. Please confirm whether settings search is exposed via the API for this tenant; if not, classify this as unavailable/unsupported rather than an MCP bug.

**Live evidence**

```text
Error searching settings: Resource not found
```

## Shared Capability-Probe Evidence

Tool: `boond_capabilities_probe`

Arguments:

```json
{ "limit": 1 }
```

Timestamp UTC: `2026-03-10T11:45:09.816770+00:00`

Summary:

```text
OK=7 | Forbidden=2 | NotAvailable=3 | MethodMismatch=1 | Validation=0 | Auth=0 | InputRequired=1 | Error=0
```

Detailed breakdown:

- ok: `resources_search`, `projects_search`, `deliveries_search`, `timereports_search`, `apps_search`, `alerts_search`, `accounts_search`
- not_available: `expenses_search`, `quotations_search`, `settings_search`
- forbidden: `contracts_search`, `banking_accounts_search`
- method_mismatch: `documents_search`
- input_required: `banking_transactions_search` (blocked because banking accounts are inaccessible)

This is the strongest proof that the MCP itself is functioning correctly in the same runtime and credential context.

## MCP-Side Items Already Fixed (Do Not Escalate)

These were MCP-owned issues and have already been fixed, deployed, and/or validated:

- Removed the old generic documents-search `Validation failed` masking error.
- Stopped probing unsupported `POST /documents` during document search fallback.
- Added precise document-search compatibility diagnostics.
- Enforced requested `limit` in `actions_search` and `alerts_search` outputs.
- Added fallback resolution for `absences_get` when direct lookup fails but search shows the record.
- Fixed output-quality issues for invalid dates, zero-byte document sizes, and falsy expense resource IDs.

## Evidence Checklist to Attach to Boond IT Ticket

For every escalated item, include:

- exact UTC timestamp of the test
- exact tool/action called
- exact argument payload used
- returned message / classification
- statement that the same deployed MCP instance successfully accesses 7 other Boond capabilities

Additional per-issue evidence:

- **Permission issue** (`banking_accounts_search` if they dispute scope): include credential role expectations and the exact `Forbidden: insufficient permissions` message.
- **WAF/perimeter issue** (`contracts_search`): include any block-body text, Cloudflare wording, response headers, and request timestamp if available.
- **Endpoint unavailable/resource not found** (`expenses_search`, `quotations_search`, `settings_search`, `documents_search`): include exact endpoint-method family attempted and the returned exhaustion/resource-not-found message.

## Suggested One-Paragraph Cover Note

> Boond MCP is live and healthy, and we re-verified the failing capabilities after fixing the MCP-side documents request compatibility issue. In the same environment and with the same credentials, 7 representative capabilities succeed. The remaining failures are now upstream responses from Boond (`403/404/405`, Cloudflare/WAF block, insufficient permissions, or resource-not-found), not MCP transport or orchestration failures. We are escalating the items below for Boond-side confirmation of supported endpoints, tenant exposure, permissions, and perimeter allowlisting.
