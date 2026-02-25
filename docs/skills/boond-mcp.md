---
name: boond-mcp
version: 1.0.0
description: Expert usage of the Boond MCP server — all tools, auth setup, workflows, and error handling
---

# Boond MCP Skill

You have access to the **Boond MCP server**, which connects to the BoondManager ERP/CRM API. This skill teaches you exactly how to use it.

---

## Auth & Configuration

The MCP server requires these environment variables to be set on the server side (not by the user at call time):

| Variable             | Description                     |
| -------------------- | ------------------------------- |
| `BOOND_CLIENT_TOKEN` | BoondManager client token (hex) |
| `BOOND_CLIENT_KEY`   | BoondManager client key         |
| `BOOND_USER_TOKEN`   | BoondManager user token         |
| `BOOND_JWT_MODE`     | JWT mode — usually `normal`     |

The MCP server itself is protected by an `x-api-key` header (configured in the user's MCP client). If the user hasn't set this up yet, refer them to `docs/AI_SKILLS.md` or `docs/OPENCODE_SETUP_GUIDE.md`.

---

## Tool Catalog

All tools follow the pattern `boond_{domain}_{action}`. Search tools accept `page` (default 1) and `limit` (default 25, max 100). Most also accept a `query` string for free-text search.

### HR Domain

| Tool                      | Description                           | Key params               |
| ------------------------- | ------------------------------------- | ------------------------ |
| `boond_candidates_search` | Search candidates/applicants          | `query`, `page`, `limit` |
| `boond_candidates_get`    | Get a single candidate by ID          | `id` (required)          |
| `boond_resources_search`  | Search internal resources (employees) | `query`, `page`, `limit` |
| `boond_contacts_search`   | Search contacts                       | `query`, `page`, `limit` |
| `boond_contracts_search`  | Search employment contracts           | `page`, `limit`          |

### CRM Domain

| Tool                         | Description                 | Key params               |
| ---------------------------- | --------------------------- | ------------------------ |
| `boond_companies_search`     | Search client companies     | `query`, `page`, `limit` |
| `boond_opportunities_search` | Search sales opportunities  | `query`, `page`, `limit` |
| `boond_quotations_search`    | Search quotations/proposals | `page`, `limit`          |

### Finance Domain

| Tool                     | Description             | Key params               |
| ------------------------ | ----------------------- | ------------------------ |
| `boond_invoices_search`  | Search invoices         | `query`, `page`, `limit` |
| `boond_invoices_pay`     | Mark an invoice as paid | `id` (required)          |
| `boond_purchases_search` | Search purchase orders  | `page`, `limit`          |
| `boond_orders_search`    | Search orders           | `page`, `limit`          |

### Projects Domain

| Tool                      | Description                  | Key params               |
| ------------------------- | ---------------------------- | ------------------------ |
| `boond_projects_search`   | Search projects              | `query`, `page`, `limit` |
| `boond_deliveries_search` | Search deliveries/milestones | `page`, `limit`          |
| `boond_actions_search`    | Search actions/tasks         | `page`, `limit`          |

### Time Domain

| Tool                       | Description                    | Key params      |
| -------------------------- | ------------------------------ | --------------- |
| `boond_timereports_search` | Search time reports            | `page`, `limit` |
| `boond_absences_search`    | Search absences/leaves         | `page`, `limit` |
| `boond_expenses_search`    | Search expense reports         | `page`, `limit` |
| `boond_expenses_pay`       | Mark an expense report as paid | `id` (required) |

### Admin Domain

| Tool                         | Description                      | Key params      |
| ---------------------------- | -------------------------------- | --------------- |
| `boond_agencies_search`      | Search agencies                  | `page`, `limit` |
| `boond_businessunits_search` | Search business units            | `page`, `limit` |
| `boond_accounts_search`      | Search accounts/billing entities | `page`, `limit` |

### Documents Domain

| Tool                     | Description      | Key params               |
| ------------------------ | ---------------- | ------------------------ |
| `boond_documents_search` | Search documents | `query`, `page`, `limit` |

### System Domain

| Tool                    | Description                       | Key params      |
| ----------------------- | --------------------------------- | --------------- |
| `boond_apps_search`     | List configured apps/integrations | `page`, `limit` |
| `boond_settings_search` | Search system settings            | `page`, `limit` |
| `boond_alerts_search`   | Search system alerts              | `page`, `limit` |

---

## Common Workflows

### Find a candidate by name

```
boond_candidates_search({ query: "Jean Dupont", limit: 5 })
→ returns list with id, firstName, lastName, email, status
```

### Get full candidate details

```
boond_candidates_search({ query: "Jean Dupont" })
→ pick the id from results
boond_candidates_get({ id: "628" })
→ returns full profile
```

### List all active projects

```
boond_projects_search({ query: "active", page: 1, limit: 25 })
```

### Find unpaid invoices

```
boond_invoices_search({ page: 1, limit: 50 })
→ filter results where status indicates unpaid
```

### Pay an invoice

```
boond_invoices_pay({ id: "INV-001" })
```

### Find a resource's absences

```
boond_resources_search({ query: "Marie Martin" })
→ get resource id
boond_absences_search({ page: 1, limit: 25 })
→ filter by resource id client-side
```

### Paginate through large result sets

```
boond_candidates_search({ page: 1, limit: 100 })
→ result.pagination.total tells you total count
→ result.pagination.page is current page
→ repeat with page: 2, 3, ... until all retrieved
```

---

## Response Format

All search tools return:

```json
{
  "content": [
    {
      "type": "text",
      "text": "formatted summary string"
    }
  ],
  "isError": false
}
```

The `text` field contains a human-readable summary. For structured data, call the tool and parse the text, or chain with a `_get` tool using the ID from search results.

---

## Error Handling

- **`isError: true`** in the response means the tool ran but the API returned an error. The `content[0].text` will contain the error message.
- **Common causes**: 403 (insufficient permissions for that endpoint), 404 (resource not found), 405 (method not allowed — endpoint may not support listing).
- **Endpoints that may fail** depending on account permissions: `contracts`, `quotations`, `deliveries`, `documents`, `settings`. This is normal — inform the user and continue with other tools.
- **Auth errors** (401): BoondManager credentials need to be reconfigured on the server. Refer user to setup docs.

---

## Tips

- Always start with a **search** before a **get** — use search to find the ID, then get for full details.
- Use `limit: 5` for quick lookups, `limit: 100` when you need comprehensive data.
- The `query` param does free-text search across names, emails, and titles — use it liberally.
- Tool names use no underscores between domain and type: `timereports` not `time_reports`, `businessunits` not `business_units`.
