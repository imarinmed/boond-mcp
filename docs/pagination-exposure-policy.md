# Pagination, Truncation, and Exposure Policy

This document defines the baseline for new **collection** and **nested read** tools.

Goals:

- mirror Boond API behavior instead of inventing MCP-only pagination semantics
- keep tool discoverability honest without flooding the MCP client with caveats
- make truncated results explicit and predictable

This policy is **normative for new work** and **advisory for existing tools**.

## 1. Pagination Parameter Exposure

### 1.1 Expose the native pagination family only

- If the Boond endpoint is page-based, expose `page` and `limit`.
- If the Boond endpoint is offset-based, expose `offset` and `limit`.
- If the endpoint has no documented pagination, expose no pagination params.
- Do **not** offer aliases (`page` + `offset`, `pageSize`, `cursor`, etc.) unless the Boond API itself documents them.

### 1.2 Keep pagination pass-through and conservative

- Forward pagination values to Boond unchanged.
- Do **not** synthesize extra pages client-side for normal collection tools.
- Do **not** translate between pagination models unless the translation is required by the Boond endpoint and explicitly documented in code.

### 1.3 Defaults and limits

Use these defaults unless the underlying endpoint or an existing composite tool already requires a stricter cap:

- `page`: default `1`
- `offset`: default `0`
- `limit`: default `20`
- `limit` max: `100`

Composite or cross-entity tools may use a lower effective cap (for example `5` or `10` per entity) when needed to protect MCP output size. When that happens, the tool description or API reference must say so.

### 1.4 Nested read tools follow the same rule

For owner-scoped or nested list tools (`/resource/{id}/children` style endpoints):

- expose the same native pagination family the Boond endpoint supports
- require the owning ID separately from pagination params
- do not invent parent-level pagination if the nested endpoint does not support it

## 2. Result Summaries and Truncation

### 2.1 Summary line is mandatory for collection output

If Boond returns pagination metadata, start the text response with a summary line like:

```text
Found N item(s) (Page P/T of TOTAL total)
```

If the endpoint returns items without pagination metadata, use:

```text
Found N item(s)
```

Do not fabricate page counts when the API did not return them.

### 2.2 Render only a bounded preview

For collection and nested read tools:

- render at most the requested page slice
- after enrichment, cap rendered items to `min(requested limit, returned page size)`
- default human-readable preview should not exceed `20` items unless the tool has a smaller documented cap
- do **not** fetch additional pages just to make the output look more complete

### 2.3 Make truncation explicit

When the rendered output is a subset of the available results, add a closing line such as:

```text
Showing N of TOTAL results.
```

or, when only page-local knowledge is available:

```text
Showing N result(s) from this page.
```

### 2.4 Truncate verbose fields, not identifiers

- Never truncate IDs, names, statuses, dates, amounts, or parent IDs.
- Long free-text fields (`description`, `message`, `notes`, similar) should be shortened to a preview, normally ~`160` characters.
- Use an ellipsis (`…`) or `(truncated)` marker when shortening field content.

## 3. Public Support Language

Tool descriptions and docs must separate **implemented** from **validated**.

| Public label | When to use | Required wording guidance |
|---|---|---|
| `supported` | Endpoint is implemented and tenant-validated, or the path is proven and only normal permissions govern access | Safe to describe plainly without extra caveat |
| `supported (tenant-specific permissions)` | Endpoint/path is validated, but current tenant can receive `403` or equivalent due to scope/permissions | Say availability depends on Boond permissions/tenant configuration |
| `documented by Boond; not tenant-validated` | Endpoint is documented or implemented, but no successful tenant validation exists yet | Do **not** call it fully supported |
| `path requires reconciliation` | Boond docs and working implementation disagree, or only an alternate path currently works | Keep exposure honest and point readers to the coverage matrix |
| `intentionally not exposed` / `owner-scoped only` | Global discovery is not supported safely or by Boond design | Replace broad search promises with guidance to the owning record workflow |

### 3.1 Description-length rule

Standard tool descriptions should stay short. Put longer support nuance in:

- `docs/API_REFERENCE.md`
- `docs/boond-api-coverage-matrix.md`
- task evidence / validation notes

Exception: capability probes, deprecated stubs, and safety-guidance tools may carry richer caveats directly in the tool description because the caveat is the feature.

### 3.2 Never overclaim

Do **not** say an endpoint is "supported" when the current evidence only proves one of these weaker states:

- documented but not validated
- tenant-specific forbidden response
- alternate-path workaround
- owner-scoped discovery only

## 4. Discoverability Rules for MCP Clients

Descriptions should help a model pick the right tool without turning `tools/list` into a wall of warnings.

- Prefer `Action + resource + major constraint`.
- Mention pagination params in the description only when they are the main usable filter or there is no broader query surface.
- Keep validation caveats out of ordinary descriptions unless omitting them would mislead tool selection.
- Put the full status taxonomy in docs, not in every tool card.

Examples:

- Good: `Search projects by criteria`
- Good: `List contracts with pagination only (page, limit)`
- Good for ambiguous coverage: `Probe effective Boond API capabilities/scopes by testing representative read endpoints`
- Bad: `Search fully supported settings across all tenants with complete pagination flexibility`

## 5. Review Checklist for New Tools

- Does the tool expose only Boond-native pagination params?
- Is the default/max limit conservative?
- Does the formatter include a summary line?
- Is the rendered preview explicitly bounded?
- If output is truncated, does the response say so?
- Does the wording distinguish validated support from documented-only coverage?
- Are long caveats pushed into docs instead of repeated in every tool description?

## 6. Representative Baselines Used for This Policy

This policy was derived against current repository patterns including:

- `src/tools/projects/projects.ts`
- `src/tools/hr/contracts.ts`
- `src/tools/time/timeReports.ts`
- `src/tools/time/expenses.ts`
- `src/tools/system/capabilities-probe.ts`
- `src/tools/system/settings.ts`
- `src/tools/finance/banking.ts`

See `.sisyphus/evidence/task-5-policy-audit.txt` and `.sisyphus/evidence/task-5-truncation.txt` for the audit notes.
