# Boond MCP Read Endpoint Matrix (Artifact-Free Audit)

Last updated: 2026-03-03
Target server: `https://boond-mcp-d61y.onrender.com/mcp/http`

## Audit Method (Artifact-Free)

- Audited only read tools (`*_search`, `*_get`, plus global search tools).
- `_get` calls are only executed when a valid sample ID is discovered from a successful corresponding `_search`.
- If no sample ID is available, tool is marked `no_sample_id` (not counted as endpoint failure).
- Known stable IDs used for core verification:
  - `boond_resources_get`: `304`
  - `boond_deliveries_get`: `2980`
  - `boond_timereports_get`: `8358`

## Summary

- Total read tools: **53**
- OK: **38**
- Error: **15**
- No sample ID: **0** (artifact-free run uses discovered IDs or explicit classification)
- Successful outputs containing `undefined`: **0**
- Successful outputs containing `unknown`: **18**

## MCP-Fixed in This Cycle

- Removed `undefined` output in successful read tools.
- Added robust fallback rendering across entities (accounts/actions/alerts/candidates/contacts/finance/contracts/projects/resources/deliveries/timereports).
- Added date-range timereport normalization and detail enrichment.
- Added documents search fallback chain (`GET /documents`, `GET /documents/search`, `POST /documents/search`).
- Relaxed expense search date schema to allow `YYYY-MM-DD` and ISO datetime.

## Current Non-OK (Actionable)

| Tool                                | Status | Classification             | Notes                                                  |
| ----------------------------------- | -----: | -------------------------- | ------------------------------------------------------ |
| `boond_banking_accounts_search`     |  error | Upstream scope/permissions | Forbidden on current account/token                     |
| `boond_banking_transactions_search` |  error | Input requirement          | Requires valid `bankingAccountId`                      |
| `boond_contracts_search`            |  error | Upstream edge/WAF          | Cloudflare/WAF 403                                     |
| `boond_documents_search`            |  error | Endpoint/method mismatch   | Method not allowed on `/documents/search`              |
| `boond_expenses_search`             |  error | API contract/requirements  | Upstream validation still failing with current payload |
| `boond_quotations_search`           |  error | Tenant/API availability    | Resource not found                                     |
| `boond_settings_search`             |  error | Tenant/API availability    | Resource not found                                     |
| `boond_absences_get`                |  error | Data consistency           | ID from search did not resolve on get in this run      |
| `boond_alerts_get`                  |  error | Data consistency           | ID from search did not resolve on get in this run      |
| `boond_banking_accounts_get`        |  error | Scope/ID                   | Not found/forbidden depending on account               |
| `boond_documents_get`               |  error | ID availability            | Not found with sampled ID                              |
| `boond_invoices_get`                |  error | ID availability            | Not found with sampled ID                              |
| `boond_purchases_get`               |  error | ID availability            | Not found with sampled ID                              |
| `boond_quotations_get`              |  error | Tenant/API availability    | Resource not found                                     |
| `boond_settings_get`                |  error | Tenant/API availability    | Resource not found                                     |

## Permissions / Scope Probe (API-side)

There is no single Boond endpoint that returns a full “scope list” for a token.  
The practical method is a **capability probe**: call representative read endpoints and classify result as:

- `ok` -> capability available
- `forbidden (403)` -> scope/permission missing
- `resource not found (404)` -> endpoint unavailable for tenant/API surface
- `method not allowed (405)` -> endpoint/method mismatch

Recent probe highlights:

- `boond_resources_search` -> `ok`
- `boond_projects_search` -> `ok`
- `boond_deliveries_search` -> `ok`
- `boond_timereports_search` -> `ok`
- `boond_contracts_search` -> `forbidden` (Cloudflare/WAF 403)
- `boond_banking_accounts_search` -> `forbidden`
- `boond_quotations_search` -> `not_available`
- `boond_settings_search` -> `not_available`

## Successful but Still Sparse (`unknown`)

These are not crashes and not `undefined`, but upstream payloads still omit key fields in many rows:

- `boond_absences_search` (resource/type/status)
- `boond_accounts_search/get` (status)
- `boond_actions_search/get` (status)
- `boond_alerts_search` (severity)
- `boond_date_range_search` (some timereport rows missing hours/project)
- `boond_invoices_search` (company/total)
- `boond_orders_search/get` (status/company/total)
- `boond_projects_search/get` (status)
- `boond_purchases_search` (company)
- `boond_timereports_search` (some rows missing hours/project)
- `boond_candidates_get` (email/status)
- `boond_contracts_get` (type/status)
- `boond_expenses_get` (period/total)

## Next MCP-Owned Fixes (Priority)

1. **`boond_expenses_search`**: inspect exact upstream required fields in this tenant and align payload.
2. **`boond_documents_search`**: endpoint appears method-restricted; confirm if search is supported or deprecate tool for this tenant.
3. **Sparse `unknown` values**: add opt-in detail-enrichment for more list tools where get endpoints are richer.

## Upstream Escalation Candidates

Escalate to Boond support with logs and timestamps:

- `boond_contracts_search` -> Cloudflare/WAF 403
- banking endpoints -> account scope/permission review
- quotations/settings search -> endpoint availability per tenant
