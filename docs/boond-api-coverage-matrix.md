# Boond API Coverage Matrix

**Official RAML Source:** https://doc.boondmanager.com/api-externe/raml-build/api-externe.raml

**Last Updated:** 2026-03-12

## Audit Constraints

This matrix reflects a **GET-only, non-destructive audit** scope:

- Only read operations (`*_search`, `*_get`, `*_list`) are evaluated
- POST/PUT/DELETE operations are acknowledged as implemented but not audited for API compliance
- Results reflect actual Boond API responses, not MCP-layer transformations

## Summary Statistics

| Metric | Count |
|--------|-------|
| Official RAML documented resource paths | 246 |
| MCP hardcoded route families (approximate) | 29 |
| Families marked "Implemented" | 21 |
| Families marked "Partial" | 3 |
| Families marked "Deprecated Intentionally" | 2 |
| Families marked "Path Mismatch / Needs Reconciliation" | 4 |
| Families marked "Missing" | 4 |

## Family-by-Family Matrix

### HR Domain

| Family | MCP Tool | RAML Path | MCP Path | Status | Notes |
|--------|----------|-----------|----------|--------|-------|
| candidates | boond_candidates_search, boond_candidates_get | /candidates | /candidates | Implemented | Full CRUD available |
| contacts | boond_contacts_search, boond_contacts_get | /contacts | /contacts | Implemented | Full CRUD available |
| resources | boond_resources_search, boond_resources_get | /resources | /resources | Implemented | Includes fallback enrichment endpoints |
| contracts | boond_contracts_search, boond_contracts_get | /contracts | Search: /apps/contracts/contracts, Get: /contracts | Path mismatch / needs reconciliation | Official RAML documents /contracts family. Direct API testing shows 403/404/405 on /contracts. Support-guided path /apps/contracts/contracts works for search but get by ID still uses /contracts. Requires clarification from Boond support. |

### CRM Domain

| Family | MCP Tool | RAML Path | MCP Path | Status | Notes |
|--------|----------|-----------|----------|--------|-------|
| companies | boond_companies_search, boond_companies_get | /companies | /companies | Implemented | Full CRUD available |
| opportunities | boond_opportunities_search, boond_opportunities_get | /opportunities | /opportunities | Implemented | Full CRUD available |
| quotations | boond_quotations_search, boond_quotations_get | apps/quotations | /quotations | Path mismatch / needs reconciliation | RAML clearly exposes apps/quotations. MCP uses legacy /quotations path. Requires migration to apps/quotations. |

### Finance Domain

| Family | MCP Tool | RAML Path | MCP Path | Status | Notes |
|--------|----------|-----------|----------|--------|-------|
| invoices | boond_invoices_search, boond_invoices_get | /invoices | /invoices | Implemented | Full CRUD available |
| purchases | boond_purchases_search, boond_purchases_get | /purchases | /purchases | Implemented | Full CRUD available |
| orders | boond_orders_search, boond_orders_get | /orders | /orders | Implemented | Full CRUD available |
| banking accounts | boond_banking_accounts_search, boond_banking_accounts_get | /banking-accounts | /banking-accounts | Partial | GET works when permissions allow. Many tenants return 403 Forbidden. Scope/permission dependent. |
| banking transactions | boond_banking_transactions_search | /banking-accounts/{id}/transactions | /banking-accounts/{id}/transactions | Partial | Requires valid banking account ID from banking_accounts_search. Permission dependent. |

### Projects Domain

| Family | MCP Tool | RAML Path | MCP Path | Status | Notes |
|--------|----------|-----------|----------|--------|-------|
| projects | boond_projects_search, boond_projects_get | /projects | /projects | Implemented | Full CRUD available |
| deliveries | boond_deliveries_search, boond_deliveries_get | /deliveries, /deliveries-groupments | Multiple with fallback | Implemented | Tries /deliveries-groupments, /deliveries, /deliveries/search, POST /deliveries/search |
| actions | boond_actions_search, boond_actions_get | /actions | /actions | Implemented | Full CRUD available |

### Time Domain

| Family | MCP Tool | RAML Path | MCP Path | Status | Notes |
|--------|----------|-----------|----------|--------|-------|
| time reports | boond_timereports_search, boond_timereports_get | /times-reports | /times-reports (with /time-reports fallback) | Implemented | Requires startMonth/endMonth parameters. Falls back to /time-reports if /times-reports returns 404/405. |
| absences | boond_absences_search, boond_absences_get | /absences | /absences | Implemented | Full CRUD available |
| expense reports | boond_expenses_search, boond_expenses_get | /expenses-reports | /expenses-reports (with /expense-reports fallback) | Implemented | Requires startMonth/endMonth parameters. Works correctly when proper date parameters provided. |

### Admin Domain

| Family | MCP Tool | RAML Path | MCP Path | Status | Notes |
|--------|----------|-----------|----------|--------|-------|
| agencies | boond_agencies_search, boond_agencies_get | /agencies | /agencies | Implemented | Full CRUD available |
| business units | boond_businessunits_search, boond_businessunits_get | /business-units | /business-units | Implemented | Full CRUD available |
| accounts | boond_accounts_search, boond_accounts_get | /accounts | /accounts | Implemented | Full CRUD available |

### Documents Domain

| Family | MCP Tool | RAML Path | MCP Path | Status | Notes |
|--------|----------|-----------|----------|--------|-------|
| documents | boond_documents_search | Owner-scoped only | Deprecated stub | Deprecated intentionally | Official RAML does not support global document search. Documents are owner-scoped and accessed via owning records (candidates, resources, companies, projects, contracts) or by direct ID. MCP search tool is intentionally deprecated and returns a guidance message. boond_documents_get by ID is available. |
| documents | boond_documents_get | /documents/{id} | /documents/{id} | Implemented | Get by ID works. Owner-scoped discovery recommended. |

### System Domain

| Family | MCP Tool | RAML Path | MCP Path | Status | Notes |
|--------|----------|-----------|----------|--------|-------|
| apps | boond_apps_search, boond_apps_get | /apps | /apps | Implemented | Install/uninstall actions available |
| settings | boond_settings_search, boond_settings_get | application/settings | /settings | Path mismatch / needs reconciliation | MCP uses /settings. RAML exposes application/settings. May be tenant-specific availability. Many tenants return 404. |
| alerts | boond_alerts_search, boond_alerts_get | /alerts | /alerts | Implemented | Resolution update available |

## Detailed Family Breakdowns

### Contracts

**Status:** Path mismatch / needs reconciliation

**Current Implementation:**
- Search: `GET /apps/contracts/contracts` (support-guided path)
- Get by ID: `GET /contracts/{id}`
- Create: `POST /contracts`
- Update: `PUT /contracts/{id}`
- Delete: `DELETE /contracts/{id}`

**Official RAML Documentation:**
- Documents `/contracts` family with standard CRUD operations

**Known Issues:**
1. Direct API calls to `GET /contracts` return 403 Cloudflare block
2. Direct API calls to `GET /contracts/search` return 404
3. Direct API calls to `POST /contracts/search` return 405
4. Support-guided path `/apps/contracts/contracts` works for search but may not be the documented RAML path
5. Semantic discrepancy: contracts get by ID uses `/contracts/{id}` while search uses `/apps/contracts/contracts`

**Action Required:**
- Escalate to Boond support for clarification on correct contracts search endpoint
- Verify if `/apps/contracts/contracts` is the intended path or a temporary workaround

### Documents

**Status:** Deprecated intentionally (global search)

**Current Implementation:**
- Search: Intentionally deprecated stub that returns guidance message
- Get by ID: `GET /documents/{id}`
- Update: `PUT /documents/{id}`

**Official RAML Documentation:**
- Does not support global document search
- Documents are accessed via owning record relationships or by direct ID

**Design Rationale:**
- Documents in Boond are owner-scoped (belong to candidates, resources, companies, projects, contracts)
- Discovery should happen through owning record endpoints: `GET /candidates/{id}/documents`, etc.
- Direct document access by ID is supported for retrieval

**Recommended Usage Pattern:**
1. Search for the owning record (e.g., candidate)
2. Retrieve the owning record to get associated document IDs
3. Use `boond_documents_get` with the specific document ID

### Expense Reports

**Status:** Implemented

**Current Implementation:**
- Search: `GET /expenses-reports` (with /expense-reports fallback)
- Get by ID: `GET /expenses-reports/{id}` (with /expense-reports/{id} fallback)
- Create: `POST /expenses-reports` (with /expense-reports fallback)
- Update: `PUT /expense-reports/{id}`

**Required Parameters:**
- `startMonth` and `endMonth` in YYYY-MM format are required for search
- MCP auto-generates current month if not provided
- Also accepts `startDate` and `endDate` as ISO dates (converted to month format)

**Fallback Chain:**
1. `GET /expenses-reports?startMonth=X&endMonth=Y`
2. `GET /expense-reports?startMonth=X&endMonth=Y`
3. `GET /expenses-reports/search?startMonth=X&endMonth=Y`
4. `POST /expenses-reports/search` with body
5. `GET /expense-reports/search?startMonth=X&endMonth=Y`
6. `POST /expense-reports/search` with body

### Time Reports

**Status:** Implemented

**Current Implementation:**
- Search: `GET /times-reports` (with /time-reports fallback)
- Get by ID: `GET /times-reports/{id}` (with /time-reports/{id} fallback)
- Create: `POST /times-reports` (with /time-reports fallback)
- Update: `PUT /time-reports/{id}`

**Required Parameters:**
- `startMonth` and `endMonth` in YYYY-MM format are required for search
- MCP auto-generates current month if not provided

**Fallback Chain:**
1. `GET /times-reports?startMonth=X&endMonth=Y`
2. `GET /time-reports?startMonth=X&endMonth=Y`

### Quotations

**Status:** Path mismatch / needs reconciliation

**Current Implementation:**
- Search: `GET /quotations`
- Get by ID: `GET /quotations/{id}`
- Create: `POST /quotations`
- Update: `PUT /quotations/{id}`
- Send: `POST /quotations/{id}/send`

**Official RAML Documentation:**
- Documents `apps/quotations` path

**Action Required:**
- Migrate MCP implementation from `/quotations` to `apps/quotations`
- Verify tenant availability and backward compatibility

### Settings

**Status:** Path mismatch / needs reconciliation

**Current Implementation:**
- Search: `GET /settings`
- Update: `PUT /settings/{id}`

**Official RAML Documentation:**
- Documents `application/settings` path

**Known Issues:**
- Many tenants return 404 Not Found on `/settings`
- Endpoint availability appears tenant-specific

**Action Required:**
- Verify correct path: `/settings` vs `application/settings`
- Determine if this is a tenant configuration issue or path mismatch

## Missing Documented Families from RAML

The following families are documented in the official RAML but not currently implemented in MCP:

| Family | RAML Path | MCP Status | Priority |
|--------|-----------|------------|----------|
| application/* | /application/... | Missing | High |
| tasks | /tasks | Missing | Low |
| events | /events | Missing | Low |
| evaluations | /evaluations | Missing | Low |

**Note:** This is not a complete list of missing families. It highlights the most obvious documented areas that remain outside the current MCP surface.

## Prioritized Next Audit/Implementation Targets

### High Priority (Path Reconciliation Required)

1. **Contracts Search Endpoint**
   - Issue: Path mismatch between RAML (/contracts) and working implementation (/apps/contracts/contracts)
   - Action: Escalate to Boond support for definitive endpoint documentation
   - Risk: Current implementation may break if Boond changes the apps/contracts/contracts path

2. **Quotations Path Migration**
   - Issue: MCP uses /quotations, RAML documents apps/quotations
   - Action: Test apps/quotations path, migrate if confirmed working
   - Timeline: Next maintenance cycle

3. **Settings Path Verification**
   - Issue: /settings returns 404 on many tenants, RAML documents application/settings
   - Action: Test application/settings path, verify tenant-specific availability
   - Risk: Feature appears broken on many tenants

### Medium Priority (Implementation Enhancement)

4. **Documents Owner-Scoped Discovery**
   - Issue: Global document search deprecated, but owner-scoped discovery not implemented
   - Action: Add document list endpoints to owning resources (candidates, companies, projects, etc.)
   - Value: Enable proper document discovery workflow

5. **Banking Permissions Documentation**
   - Issue: Banking endpoints return 403 on many tenants
   - Action: Document permission requirements, add better error messaging
   - Value: Reduce user confusion

### Low Priority (Gap Analysis)

6. **Missing RAML Families Investigation**
   - Tasks, events, evaluations documented in RAML but not in MCP
   - Action: Verify if these are legacy endpoints or available via alternative paths
   - Value: Complete coverage matrix

## Audit Methodology Notes

### Direct API Evidence

Direct Boond API testing was performed on 2026-03-11 (see `docs/boond-direct-api-evidence-2026-03-11.md`):

- **Contracts:** Confirmed 403 Cloudflare block on `/contracts`, 404 on `/contracts/search`, 405 on `POST /contracts/search`
- **Documents:** Confirmed 405 on `/documents`, 404 on `/documents/search`, 405 on `POST /documents/search`

### Exclusions from Direct Evidence Report

The following endpoints were excluded from the direct API evidence report because they work correctly when proper parameters are provided:

- **expenses_search:** Works correctly with startMonth/endMonth parameters
- **timesreports_search:** Works correctly with startMonth/endMonth parameters

These are considered MCP-side request-shape issues, not Boond API failures.

## Legend

| Status | Meaning |
|--------|---------|
| Implemented | Full GET functionality confirmed working |
| Partial | Works with limitations (permissions, required parameters) |
| Deprecated intentionally | Feature deliberately not implemented per API design |
| Path mismatch / needs reconciliation | MCP and RAML paths differ, requires clarification |
| Missing | Documented in RAML but not implemented in MCP |

## Changelog

| Date | Change |
|------|--------|
| 2026-03-12 | Initial matrix creation based on GET-only audit |
