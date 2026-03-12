# Boond API Read-Only Coverage Matrix

Last updated: 2026-03-12
Primary source: `https://doc.boondmanager.com/api-externe/raml-build/api-externe.raml`

## Scope

- Inventory covers official Boond read/search/list/get endpoints used by current MCP read surface.
- `documented` is based on RAML endpoint presence.
- `/apps/*` endpoints are listed but flagged `intentionally_not_exposed` (explicitly out of plan scope).
- Write or state-changing actions (`create`, `update`, `delete`, `send`, `certify`, `reject`, `install`, `uninstall`) are excluded.

## Status Taxonomy

- `documented`: endpoint exists in official Boond external API docs.
- `implemented`: MCP tool exists for this endpoint mapping.
- `tenant_validated`: verified working against live tenant (`docs/endpoint-matrix.md`, 2026-03-03 run).
- `ambiguous`: docs/behavior mismatch or inconsistent runtime behavior.
- `unsupported_for_tenant`: endpoint exists but tenant returns 403/404 or unavailable surface.
- `intentionally_not_exposed`: endpoint is documented but intentionally out of exposed plan scope.

## Coverage Matrix

| Method | Official path | Source section | documented | implemented | tenant_validated | ambiguous | unsupported_for_tenant | intentionally_not_exposed | intended_mcp_tool | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/absences` | `resources/absences/search.raml` | yes | yes | yes | no | no | no | `boond_absences_search` | Official list/search endpoint. |
| GET | `/absences/{id}` | _not in RAML root index_ | no | yes | no | yes | no | no | `boond_absences_get` | Implemented via inferred path; search->get ID consistency failed in prior tenant run. |
| GET | `/accounts` | `resources/accounts/search.raml` | yes | yes | yes | no | no | no | `boond_accounts_search` | Official list/search endpoint. |
| GET | `/accounts/{id}` | `resources/accounts/profile.raml` | yes | yes | yes | no | no | no | `boond_accounts_get` | Official profile endpoint. |
| GET | `/actions` | `resources/actions/search.raml` | yes | yes | yes | no | no | no | `boond_actions_search` | Official list/search endpoint. |
| GET | `/actions/{id}` | `resources/actions/profile.raml` | yes | yes | yes | no | no | no | `boond_actions_get` | Official profile endpoint. |
| GET | `/agencies` | `resources/agencies/search.raml` | yes | yes | yes | no | no | no | `boond_agencies_search` | Official list/search endpoint. |
| GET | `/agencies/{id}` | `resources/agencies/profile.raml` | yes | yes | yes | no | no | no | `boond_agencies_get` | Official profile endpoint. |
| GET | `/alerts` | `resources/alerts/search.raml` | yes | yes | yes | no | no | no | `boond_alerts_search` | Official list/search endpoint. |
| GET | `/alerts/{id}` | _not in RAML root index_ | no | yes | no | yes | no | no | `boond_alerts_get` | Tool assumes profile route; docs index exposes `/alerts/{id}/values` instead. |
| GET | `/application/settings` | `resources/application/settings.raml` | yes | yes | no | no | yes | no | `boond_settings_search` | Official settings read endpoint, but unavailable on current tenant run. |
| GET | `/application/settings` (ID filtered in tool) | `resources/application/settings.raml` | yes | yes | no | yes | yes | no | `boond_settings_get` | Tool performs client-side filtering from settings list (no documented `/application/settings/{id}` profile route). |
| GET | `/apps` | `resources/apps/search.raml` | yes | yes | n/a | no | no | yes | `boond_apps_search` | Explicitly excluded from read-only parity scope. |
| GET | `/apps/{id}` | `resources/apps/profile.raml` | yes | yes | n/a | no | no | yes | `boond_apps_get` | Explicitly excluded from read-only parity scope. |
| GET | `/apps/quotations/quotations` | `resources/apps/quotations/profile.raml` | yes | yes | no | no | yes | yes | `boond_quotations_search` | Only official quotations surface is under `/apps/*`; excluded by plan. |
| GET | `/apps/quotations/quotations/{id}` | `resources/apps/quotations/profile.raml` | yes | yes | no | no | yes | yes | `boond_quotations_get` | Only official quotations profile surface is under `/apps/*`; excluded by plan. |
| GET | `/banking-accounts` | `resources/bankingAccounts/search.raml` | yes | yes | no | no | yes | no | `boond_banking_accounts_search` | Endpoint documented; tenant currently returns forbidden. |
| GET | `/banking-accounts/{id}` | _not in RAML root index_ | no | yes | no | yes | yes | no | `boond_banking_accounts_get` | Tool uses inferred profile route not listed in official root index. |
| GET | `/banking-transactions` | `resources/bankingTransactions/search.raml` | yes | yes | no | yes | no | no | `boond_banking_transactions_search` | Tool currently calls nested account path; official index exposes top-level transactions search. |
| GET | `/banking-transactions/{id}` | `resources/bankingTransactions/profile.raml` | yes | no | no | no | no | no | `boond_banking_transactions_get` | Documented read profile route; missing MCP tool. |
| GET | `/business-units` | `resources/businessUnits/search.raml` | yes | yes | yes | no | no | no | `boond_businessunits_search` | Official list/search endpoint. |
| GET | `/business-units/{id}` | `resources/businessUnits/profile.raml` | yes | yes | yes | no | no | no | `boond_businessunits_get` | Official profile endpoint. |
| GET | `/candidates` | `resources/candidates/search.raml` | yes | yes | yes | no | no | no | `boond_candidates_search` | Official list/search endpoint. |
| GET | `/candidates/{id}` | `resources/candidates/profile.raml` | yes | yes | yes | no | no | no | `boond_candidates_get` | Official profile endpoint. |
| GET | `/companies` | `resources/companies/search.raml` | yes | yes | yes | no | no | no | `boond_companies_search` | Official list/search endpoint. |
| GET | `/companies/{id}` | `resources/companies/profile.raml` | yes | yes | yes | no | no | no | `boond_companies_get` | Official profile endpoint. |
| GET | `/contacts` | `resources/contacts/search.raml` | yes | yes | yes | no | no | no | `boond_contacts_search` | Official list/search endpoint. |
| GET | `/contacts/{id}` | `resources/contacts/profile.raml` | yes | yes | yes | no | no | no | `boond_contacts_get` | Official profile endpoint. |
| POST | `/contracts` | `resources/contracts/search.raml` | yes | yes | no | no | yes | no | `boond_contracts_search` | Official search is POST; tenant blocked by provider/WAF. |
| GET | `/contracts/{id}` | `resources/contracts/profile.raml` | yes | yes | yes | no | no | no | `boond_contracts_get` | Official profile endpoint. |
| POST | `/deliveries` | `resources/deliveries/search.raml` | yes | yes | yes | no | no | no | `boond_deliveries_search` | Official deliveries search endpoint is POST. |
| GET | `/deliveries/{id}` | `resources/deliveries/profile.raml` | yes | yes | yes | no | no | no | `boond_deliveries_get` | Official profile endpoint. |
| POST | `/documents` | `resources/documents/search.raml` | yes | yes | no | yes | no | no | `boond_documents_search` | Method behavior inconsistent in tenant (`/documents/search` 405, fallback logic in client). |
| GET | `/documents/{id}` | `resources/documents/profile.raml` | yes | yes | no | yes | no | no | `boond_documents_get` | Document profile lookups fail for sampled IDs in prior run. |
| GET | `/expenses-reports` | `resources/expensesReports/search.raml` | yes | yes | no | yes | no | no | `boond_expenses_search` | Search payload/validation behavior is tenant-sensitive; currently failing validation. |
| GET | `/expenses-reports/{id}` | `resources/expensesReports/profile.raml` | yes | yes | yes | no | no | no | `boond_expenses_get` | Official profile endpoint. |
| GET | `/invoices` | `resources/invoices/search.raml` | yes | yes | yes | no | no | no | `boond_invoices_search` | Official list/search endpoint. |
| GET | `/invoices/{id}` | `resources/invoices/profile.raml` | yes | yes | no | yes | no | no | `boond_invoices_get` | Profile fetch failed with sampled IDs in prior run. |
| GET | `/opportunities` | `resources/opportunities/search.raml` | yes | yes | yes | no | no | no | `boond_opportunities_search` | Official list/search endpoint. |
| GET | `/opportunities/{id}` | `resources/opportunities/profile.raml` | yes | yes | yes | no | no | no | `boond_opportunities_get` | Official profile endpoint. |
| GET | `/orders` | `resources/orders/search.raml` | yes | yes | yes | no | no | no | `boond_orders_search` | Official list/search endpoint. |
| GET | `/orders/{id}` | `resources/orders/profile.raml` | yes | yes | yes | no | no | no | `boond_orders_get` | Official profile endpoint. |
| GET | `/projects` | `resources/projects/search.raml` | yes | yes | yes | no | no | no | `boond_projects_search` | Official list/search endpoint. |
| GET | `/projects/{id}` | `resources/projects/profile.raml` | yes | yes | yes | no | no | no | `boond_projects_get` | Official profile endpoint. |
| GET | `/purchases` | `resources/purchases/search.raml` | yes | yes | yes | no | no | no | `boond_purchases_search` | Official list/search endpoint. |
| GET | `/purchases/{id}` | `resources/purchases/profile.raml` | yes | yes | no | yes | no | no | `boond_purchases_get` | Profile fetch failed with sampled IDs in prior run. |
| GET | `/resources` | `resources/resources/search.raml` | yes | yes | yes | no | no | no | `boond_resources_search` | Official list/search endpoint. |
| GET | `/resources/{id}` | `resources/resources/profile.raml` | yes | yes | yes | no | no | no | `boond_resources_get` | Official profile endpoint. |
| GET | `/times-reports` | `resources/timesReports/search.raml` | yes | yes | yes | no | no | no | `boond_timereports_search` | Official list/search endpoint; client also supports legacy `/time-reports` fallback. |
| GET | `/times-reports/{id}` | `resources/timesReports/profile.raml` | yes | yes | yes | no | no | no | `boond_timereports_get` | Official profile endpoint. |

## Read Tools Without a Single Official Endpoint Mapping

These are implemented read tools, but each orchestrates multiple endpoints or synthetic aggregation:

- `boond_fulltext_search`
- `boond_faceted_search`
- `boond_advanced_search`
- `boond_date_range_search`
- `boond_capabilities_probe`

## Explicit Exclusions

- `/apps/*` sub-resources: excluded by plan design (`intentionally_not_exposed`).
- Any write/action routes, including but not limited to:
  - `POST` create endpoints where `POST` is not documented as search/list
  - `PUT`, `DELETE`, `PATCH`
  - action routes containing `/send`, `/certify`, `/reject`, `/install`, `/uninstall`

## Notes

- Required draft file `.sisyphus/drafts/boond-read-only-get-coverage.md` is not present in this worktree (path does not exist).
- Tenant validation flags are sourced from `docs/endpoint-matrix.md` (2026-03-03 artifact-free audit run).
