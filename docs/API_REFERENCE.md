# BoondManager MCP Tools - API Reference

Complete reference for all 121 tools provided by the BoondManager MCP server.

## Table of Contents

- [HR Tools](#hr-tools) (29 tools)
- [CRM Tools](#crm-tools) (19 tools)
- [Finance Tools](#finance-tools) (17 tools)
- [Project Tools](#project-tools) (13 tools)
- [Time Tools](#time-tools) (13 tools)
- [Admin Tools](#admin-tools) (12 tools)
- [Document Tools](#document-tools) (4 tools)
- [System Tools](#system-tools) (14 tools)

---

## HR Tools

### Candidates

#### `boond_candidates_search`

Search for candidates by name, email, or other criteria.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | No | Search term for name/email |
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Results per page (default: 20, max: 100) |

**Returns:** `SearchResponse<Candidate>`

**Example:**

```json
{
  "query": "john",
  "page": 1,
  "limit": 10
}
```

#### `boond_candidates_get`

Get a candidate by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Candidate ID |

**Returns:** `Candidate`

**Example:**

```json
{
  "id": "cand_123"
}
```

#### `boond_candidates_create`

Create a new candidate.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `firstName` | string | Yes | First name |
| `lastName` | string | Yes | Last name |
| `email` | string | Yes | Email address |
| `phone` | string | No | Phone number |
| `address` | string | No | Street address |
| `city` | string | No | City |
| `country` | string | No | Country |

**Returns:** `Candidate`

**Example:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com"
}
```

#### `boond_candidates_update`

Update an existing candidate.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Candidate ID |
| `firstName` | string | No | First name |
| `lastName` | string | No | Last name |
| `email` | string | No | Email address |
| `phone` | string | No | Phone number |
| `address` | string | No | Street address |
| `city` | string | No | City |
| `country` | string | No | Country |

**Returns:** `Candidate`

**Example:**

```json
{
  "id": "cand_123",
  "city": "Paris"
}
```

#### `boond_candidates_delete`

Delete a candidate by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Candidate ID |

**Returns:** `void`

**Example:**

```json
{
  "id": "cand_123"
}
```

#### `boond_candidates_bulk_create`

Create multiple candidates in a single operation (max 50).

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `candidates` | array | Yes | Array of candidate objects |

**Returns:** `BulkResult`

**Example:**

```json
{
  "candidates": [
    { "firstName": "Alice", "lastName": "Smith", "email": "alice@example.com" },
    { "firstName": "Bob", "lastName": "Jones", "email": "bob@example.com" }
  ]
}
```

#### `boond_candidates_bulk_update`

Update multiple candidates in a single operation (max 50).

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `updates` | array | Yes | Array of update objects (must include `id`) |

**Returns:** `BulkResult`

**Example:**

```json
{
  "updates": [
    { "id": "cand_1", "city": "London" },
    { "id": "cand_2", "city": "Berlin" }
  ]
}
```

#### `boond_candidates_bulk_delete`

Delete multiple candidates in a single operation (max 50).

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `ids` | array | Yes | Array of candidate IDs |

**Returns:** `BulkResult`

**Example:**

```json
{
  "ids": ["cand_1", "cand_2"]
}
```

### Contacts

#### `boond_contacts_search`

Search for contacts by name, email, or other criteria.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | No | Search term |
| `page` | number | No | Page number |
| `limit` | number | No | Results per page |

**Returns:** `SearchResponse<Contact>`

#### `boond_contacts_get`

Get a contact by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Contact ID |

**Returns:** `Contact`

#### `boond_contacts_create`

Create a new contact.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `firstName` | string | Yes | First name |
| `lastName` | string | Yes | Last name |
| `email` | string | Yes | Email address |
| `companyId` | string | Yes | Company ID |
| `phone` | string | No | Phone number |
| `jobTitle` | string | No | Job title |
| `department` | string | No | Department |

**Returns:** `Contact`

#### `boond_contacts_update`

Update an existing contact.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Contact ID |
| `firstName` | string | No | First name |
| `lastName` | string | No | Last name |
| `email` | string | No | Email address |
| `phone` | string | No | Phone number |
| `jobTitle` | string | No | Job title |
| `department` | string | No | Department |

**Returns:** `Contact`

#### `boond_contacts_delete`

Delete a contact by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Contact ID |

**Returns:** `void`

#### `boond_contacts_bulk_create`

Create multiple contacts in a single operation (max 50).

#### `boond_contacts_bulk_update`

Update multiple contacts in a single operation (max 50).

#### `boond_contacts_bulk_delete`

Delete multiple contacts in a single operation (max 50).

### Resources

#### `boond_resources_search`

Search for resources by name, email, or other criteria.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | No | Search term |
| `page` | number | No | Page number |
| `limit` | number | No | Results per page |

**Returns:** `SearchResponse<Resource>`

#### `boond_resources_get`

Get a resource by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Resource ID |

**Returns:** `Resource`

#### `boond_resources_create`

Create a new resource.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `firstName` | string | Yes | First name |
| `lastName` | string | Yes | Last name |
| `email` | string | Yes | Email address |
| `phone` | string | No | Phone number |
| `status` | string | No | Status (active/inactive/archived) |
| `department` | string | No | Department |
| `skills` | array | No | Array of skills |
| `hourlyRate` | number | No | Hourly rate |

**Returns:** `Resource`

#### `boond_resources_update`

Update an existing resource.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Resource ID |
| `firstName` | string | No | First name |
| `lastName` | string | No | Last name |
| `email` | string | No | Email address |
| `status` | string | No | Status |
| `department` | string | No | Department |
| `skills` | array | No | Array of skills |
| `hourlyRate` | number | No | Hourly rate |

**Returns:** `Resource`

#### `boond_resources_delete`

Delete a resource by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Resource ID |

**Returns:** `void`

#### `boond_resources_bulk_create`

Create multiple resources in a single operation (max 50).

#### `boond_resources_bulk_update`

Update multiple resources in a single operation (max 50).

#### `boond_resources_bulk_delete`

Delete multiple resources in a single operation (max 50).

### Contracts

#### `boond_contracts_search`

Search for contracts by resource, type, or other criteria.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | No | Search term |
| `page` | number | No | Page number |
| `limit` | number | No | Results per page |

**Returns:** `SearchResponse<Contract>`

#### `boond_contracts_get`

Get a contract by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Contract ID |

**Returns:** `Contract`

#### `boond_contracts_create`

Create a new contract.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `resourceId` | string | Yes | Resource ID |
| `startDate` | string | Yes | Start date (ISO 8601) |
| `endDate` | string | No | End date (ISO 8601) |
| `type` | string | Yes | Type (full-time/part-time/freelance) |
| `status` | string | No | Status (active/inactive/ended) |
| `hourlyRate` | number | No | Hourly rate |

**Returns:** `Contract`

#### `boond_contracts_update`

Update an existing contract.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Contract ID |
| `resourceId` | string | No | Resource ID |
| `startDate` | string | No | Start date |
| `endDate` | string | No | End date |
| `type` | string | No | Type |
| `status` | string | No | Status |
| `hourlyRate` | number | No | Hourly rate |

**Returns:** `Contract`

#### `boond_contracts_delete`

Delete a contract by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Contract ID |

**Returns:** `void`

---

## CRM Tools

### Companies

#### `boond_companies_search`

Search for companies by name or criteria.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | No | Search term |
| `page` | number | No | Page number |
| `limit` | number | No | Results per page |

**Returns:** `SearchResponse<Company>`

#### `boond_companies_get`

Get a company by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Company ID |

**Returns:** `Company`

#### `boond_companies_create`

Create a new company.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | Company name |
| `type` | string | No | Type (client/supplier/partner) |
| `address` | string | No | Address |
| `city` | string | No | City |
| `country` | string | No | Country |
| `contacts` | array | No | Array of contact IDs |

**Returns:** `Company`

#### `boond_companies_update`

Update an existing company.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Company ID |
| `name` | string | No | Company name |
| `type` | string | No | Type |
| `address` | string | No | Address |
| `city` | string | No | City |
| `country` | string | No | Country |
| `contacts` | array | No | Array of contact IDs |

**Returns:** `Company`

#### `boond_companies_delete`

Delete a company by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Company ID |

**Returns:** `void`

#### `boond_companies_bulk_create`

Create multiple companies in a single operation (max 50).

#### `boond_companies_bulk_update`

Update multiple companies in a single operation (max 50).

#### `boond_companies_bulk_delete`

Delete multiple companies in a single operation (max 50).

### Opportunities

#### `boond_opportunities_search`

Search for opportunities by name or criteria.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | No | Search term |
| `page` | number | No | Page number |
| `limit` | number | No | Results per page |

**Returns:** `SearchResponse<Opportunity>`

#### `boond_opportunities_get`

Get an opportunity by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Opportunity ID |

**Returns:** `Opportunity`

#### `boond_opportunities_create`

Create a new opportunity.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | Opportunity name |
| `companyId` | string | Yes | Company ID |
| `contactId` | string | No | Contact ID |
| `status` | string | No | Status (lead/qualified/proposal/negotiation/won/lost) |
| `value` | number | No | Value |
| `probability` | number | No | Probability (0-100) |
| `expectedCloseDate` | string | No | Expected close date (ISO 8601) |
| `description` | string | No | Description |

**Returns:** `Opportunity`

#### `boond_opportunities_update`

Update an existing opportunity.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Opportunity ID |
| `name` | string | No | Name |
| `status` | string | No | Status |
| `value` | number | No | Value |
| `probability` | number | No | Probability |
| `expectedCloseDate` | string | No | Expected close date |
| `description` | string | No | Description |

**Returns:** `Opportunity`

#### `boond_opportunities_delete`

Delete an opportunity by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Opportunity ID |

**Returns:** `void`

### Quotations

#### `boond_quotations_search`

Search for quotations by criteria.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | No | Search term |
| `page` | number | No | Page number |
| `limit` | number | No | Results per page |

**Returns:** `SearchResponse<Quotation>`

#### `boond_quotations_get`

Get a quotation by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Quotation ID |

**Returns:** `Quotation`

#### `boond_quotations_create`

Create a new quotation.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `opportunityId` | string | Yes | Opportunity ID |
| `companyId` | string | Yes | Company ID |
| `total` | number | Yes | Total amount |
| `status` | string | No | Status (draft/sent/accepted/rejected/expired) |
| `sentAt` | string | No | Sent date (ISO 8601) |
| `validUntil` | string | No | Valid until date (ISO 8601) |
| `description` | string | No | Description |

**Returns:** `Quotation`

#### `boond_quotations_update`

Update an existing quotation.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Quotation ID |
| `total` | number | No | Total amount |
| `status` | string | No | Status |
| `sentAt` | string | No | Sent date |
| `validUntil` | string | No | Valid until date |
| `description` | string | No | Description |

**Returns:** `Quotation`

#### `boond_quotations_send`

Send a quotation.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Quotation ID |

**Returns:** `Quotation`

#### `boond_quotations_delete`

Delete a quotation by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Quotation ID |

**Returns:** `void`

---

## Finance Tools

### Invoices

#### `boond_invoices_search`

Search for invoices by criteria.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | No | Search term |
| `page` | number | No | Page number |
| `limit` | number | No | Results per page |

**Returns:** `SearchResponse<Invoice>`

#### `boond_invoices_get`

Get an invoice by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Invoice ID |

**Returns:** `Invoice`

#### `boond_invoices_create`

Create a new invoice.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `companyId` | string | Yes | Company ID |
| `total` | number | Yes | Total amount |
| `status` | string | No | Status (draft/issued/paid/overdue/cancelled) |
| `issuedAt` | string | Yes | Issued date (ISO 8601) |
| `paidAt` | string | No | Paid date (ISO 8601) |
| `dueDate` | string | No | Due date (ISO 8601) |
| `description` | string | No | Description |

**Returns:** `Invoice`

#### `boond_invoices_update`

Update an existing invoice.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Invoice ID |
| `total` | number | No | Total amount |
| `status` | string | No | Status |
| `paidAt` | string | No | Paid date |
| `dueDate` | string | No | Due date |
| `description` | string | No | Description |

**Returns:** `Invoice`

#### `boond_invoices_delete`

Delete an invoice by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Invoice ID |

**Returns:** `void`

### Purchases

#### `boond_purchases_search`

Search for purchases by criteria.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | No | Search term |
| `page` | number | No | Page number |
| `limit` | number | No | Results per page |

**Returns:** `SearchResponse<Purchase>`

#### `boond_purchases_get`

Get a purchase by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Purchase ID |

**Returns:** `Purchase`

#### `boond_purchases_create`

Create a new purchase.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `companyId` | string | Yes | Company ID |
| `total` | number | Yes | Total amount |
| `status` | string | No | Status (draft/ordered/received/invoiced/cancelled) |
| `orderedAt` | string | Yes | Ordered date (ISO 8601) |
| `receivedAt` | string | No | Received date (ISO 8601) |

**Returns:** `Purchase`

#### `boond_purchases_update`

Update an existing purchase.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Purchase ID |
| `total` | number | No | Total amount |
| `status` | string | No | Status |
| `orderedAt` | string | No | Ordered date |
| `receivedAt` | string | No | Received date |

**Returns:** `Purchase`

#### `boond_purchases_delete`

Delete a purchase by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Purchase ID |

**Returns:** `void`

### Orders

#### `boond_orders_search`

Search for orders by criteria.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | No | Search term |
| `page` | number | No | Page number |
| `limit` | number | No | Results per page |

**Returns:** `SearchResponse<Order>`

#### `boond_orders_get`

Get an order by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Order ID |

**Returns:** `Order`

#### `boond_orders_create`

Create a new order.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `companyId` | string | Yes | Company ID |
| `projectId` | string | No | Project ID |
| `total` | number | Yes | Total amount |
| `status` | string | No | Status (pending/confirmed/shipped/delivered/cancelled) |

**Returns:** `Order`

#### `boond_orders_update`

Update an existing order.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Order ID |
| `total` | number | No | Total amount |
| `status` | string | No | Status |

**Returns:** `Order`

### Banking

#### `boond_banking_accounts_search`

Search banking accounts.

**Parameters:** None

**Returns:** `SearchResponse<BankingAccount>`

#### `boond_banking_accounts_get`

Get a banking account by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Banking account ID |

**Returns:** `BankingAccount`

#### `boond_banking_transactions_search`

Search banking transactions for a specific account.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `accountId` | string | Yes | Banking account ID |
| `query` | string | No | Search term |
| `page` | number | No | Page number |
| `limit` | number | No | Results per page |

**Returns:** `SearchResponse<BankingTransaction>`

---

## Project Tools

### Projects

#### `boond_projects_search`

Search projects by criteria.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | No | Search query |
| `page` | number | No | Page number |
| `limit` | number | No | Results per page |
| `status` | string | No | Filter by status (planning/active/on-hold/completed/cancelled) |
| `companyId` | string | No | Filter by company ID |

**Returns:** `SearchResponse<Project>`

#### `boond_projects_get`

Get a project by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Project ID |

**Returns:** `Project`

#### `boond_projects_delete`

Delete a project by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Project ID |

**Returns:** `void`

### Deliveries

#### `boond_deliveries_search`

Search deliveries by criteria.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | No | Search query |
| `page` | number | No | Page number |
| `limit` | number | No | Results per page |

**Returns:** `SearchResponse<Delivery>`

#### `boond_deliveries_get`

Get a delivery by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Delivery ID |

**Returns:** `Delivery`

#### `boond_deliveries_create`

Create a new delivery.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | Delivery name |
| `projectId` | string | Yes | Project ID |
| `description` | string | No | Description |
| `dueDate` | string | No | Due date (ISO 8601) |

**Returns:** `Delivery`

#### `boond_deliveries_update`

Update an existing delivery.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Delivery ID |
| `name` | string | No | Name |
| `description` | string | No | Description |
| `dueDate` | string | No | Due date |
| `status` | string | No | Status (pending/in-progress/completed/blocked) |

**Returns:** `Delivery`

#### `boond_deliveries_send`

Send a delivery notification.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Delivery ID |

**Returns:** `Delivery`

### Actions

#### `boond_actions_search`

Search actions by criteria.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | No | Search query |
| `page` | number | No | Page number |
| `limit` | number | No | Results per page |
| `status` | string | No | Filter by status (open/in-progress/completed/cancelled) |
| `projectId` | string | No | Filter by project ID |
| `priority` | string | No | Filter by priority (low/medium/high) |

**Returns:** `SearchResponse<Action>`

#### `boond_actions_get`

Get an action by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Action ID |

**Returns:** `Action`

#### `boond_actions_create`

Create a new action.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | Action name |
| `projectId` | string | No | Project ID |
| `status` | string | No | Status (open/in-progress/completed/cancelled) |
| `assignedTo` | string | No | User ID to assign to |
| `dueDate` | string | No | Due date (ISO 8601) |
| `priority` | string | No | Priority (low/medium/high) |
| `description` | string | No | Description |

**Returns:** `Action`

#### `boond_actions_update`

Update an existing action.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Action ID |
| `name` | string | No | Name |
| `status` | string | No | Status |
| `assignedTo` | string | No | User ID |
| `dueDate` | string | No | Due date |
| `priority` | string | No | Priority |
| `description` | string | No | Description |

**Returns:** `Action`

#### `boond_actions_delete`

Delete an action by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Action ID |

**Returns:** `void`

---

## Time Tools

### Time Reports

#### `boond_timereports_search`

Search time reports by resource, date range, or status.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `resourceId` | string | No | Filter by resource ID |
| `startDate` | string | No | Start date (ISO 8601) |
| `endDate` | string | No | End date (ISO 8601) |
| `status` | string | No | Filter by status (draft/submitted/approved/rejected) |
| `page` | number | No | Page number |
| `limit` | number | No | Results per page |

**Returns:** `SearchResponse<TimeReport>`

#### `boond_timereports_get`

Get a time report by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Time report ID |

**Returns:** `TimeReport`

#### `boond_timereports_create`

Create a new time report.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `resourceId` | string | Yes | Resource ID |
| `date` | string | Yes | Date (ISO 8601) |
| `hours` | number | Yes | Number of hours |
| `projectId` | string | Yes | Project ID |
| `status` | string | No | Status |
| `description` | string | No | Description |

**Returns:** `TimeReport`

### Absences

#### `boond_absences_search`

Search absences by resource, date range, status, or type.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `resourceId` | string | No | Filter by resource ID |
| `startDate` | string | No | Start date |
| `endDate` | string | No | End date |
| `status` | string | No | Filter by status (draft/requested/approved/rejected) |
| `type` | string | No | Filter by type (vacation/sick-leave/unpaid-leave/training/other) |
| `page` | number | No | Page number |
| `limit` | number | No | Results per page |

**Returns:** `SearchResponse<Absence>`

#### `boond_absences_get`

Get an absence by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Absence ID |

**Returns:** `Absence`

#### `boond_absences_create`

Create a new absence.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `resourceId` | string | Yes | Resource ID |
| `type` | string | Yes | Type |
| `startDate` | string | Yes | Start date |
| `endDate` | string | Yes | End date |
| `status` | string | No | Status |
| `reason` | string | No | Reason |

**Returns:** `Absence`

#### `boond_absences_update`

Update an existing absence.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Absence ID |
| `type` | string | No | Type |
| `startDate` | string | No | Start date |
| `endDate` | string | No | End date |
| `status` | string | No | Status |
| `reason` | string | No | Reason |

**Returns:** `Absence`

### Expenses

#### `boond_expenses_search`

Search expense reports by resource, date range, or status.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `resourceId` | string | No | Filter by resource ID |
| `status` | string | No | Filter by status (draft/submitted/approved/rejected/paid) |
| `startDate` | string | No | Start date |
| `endDate` | string | No | End date |
| `page` | number | No | Page number |
| `limit` | number | No | Results per page |

**Returns:** `SearchResponse<ExpenseReport>`

#### `boond_expenses_get`

Get an expense report by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Expense report ID |

**Returns:** `ExpenseReport`

#### `boond_expenses_create`

Create a new expense report.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `resourceId` | string | Yes | Resource ID |
| `status` | string | No | Status |
| `total` | number | Yes | Total amount |
| `period` | object | Yes | Period object with `startDate` and `endDate` |

**Returns:** `ExpenseReport`

#### `boond_expenses_update`

Update an existing expense report.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Expense report ID |
| `status` | string | No | Status |
| `total` | number | No | Total amount |
| `period` | object | No | Period object |

**Returns:** `ExpenseReport`

#### `boond_expenses_certify`

Certify an expense report (approve for payment).

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Expense report ID |

**Returns:** `void`

#### `boond_expenses_reject`

Reject an expense report with a reason.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Expense report ID |
| `reason` | string | Yes | Rejection reason |

**Returns:** `void`

---

## Admin Tools

### Agencies

#### `boond_agencies_search`

Search agencies by name or criteria.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | No | Search term |
| `page` | number | No | Page number |
| `limit` | number | No | Results per page |

**Returns:** `SearchResponse<Agency>`

#### `boond_agencies_get`

Get an agency by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Agency ID |

**Returns:** `Agency`

#### `boond_agencies_create`

Create a new agency.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | Agency name |
| `address` | string | No | Address |
| `city` | string | No | City |
| `country` | string | No | Country |

**Returns:** `Agency`

#### `boond_agencies_update`

Update an existing agency.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Agency ID |
| `name` | string | No | Name |
| `address` | string | No | Address |
| `city` | string | No | City |
| `country` | string | No | Country |

**Returns:** `Agency`

### Business Units

#### `boond_businessunits_search`

Search business units by name or criteria.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | No | Search term |
| `page` | number | No | Page number |
| `limit` | number | No | Results per page |

**Returns:** `SearchResponse<BusinessUnit>`

#### `boond_businessunits_get`

Get a business unit by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Business unit ID |

**Returns:** `BusinessUnit`

#### `boond_businessunits_create`

Create a new business unit.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | Business unit name |
| `parentId` | string | No | Parent business unit ID |
| `managerId` | string | No | Manager ID |

**Returns:** `BusinessUnit`

#### `boond_businessunits_update`

Update an existing business unit.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Business unit ID |
| `name` | string | No | Name |
| `parentId` | string | No | Parent ID |
| `managerId` | string | No | Manager ID |

**Returns:** `BusinessUnit`

### Accounts

#### `boond_accounts_search`

Search accounts by username or criteria.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | No | Search term |
| `page` | number | No | Page number |
| `limit` | number | No | Results per page |

**Returns:** `SearchResponse<Account>`

#### `boond_accounts_get`

Get an account by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Account ID |

**Returns:** `Account`

#### `boond_accounts_create`

Create a new account.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `username` | string | Yes | Username |
| `email` | string | Yes | Email address |
| `role` | string | Yes | Role (admin/manager/user/viewer) |
| `status` | string | No | Status (active/inactive/suspended) |

**Returns:** `Account`

#### `boond_accounts_update`

Update an existing account.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Account ID |
| `username` | string | No | Username |
| `email` | string | No | Email |
| `role` | string | No | Role |
| `status` | string | No | Status |

**Returns:** `Account`

---

## Document Tools

#### `boond_documents_search`

Search documents by criteria.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | No | Search term |
| `page` | number | No | Page number |
| `limit` | number | No | Results per page |

**Returns:** `SearchResponse<Document>`

#### `boond_documents_get`

Get a document by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Document ID |

**Returns:** `Document`

#### `boond_documents_update`

Update document metadata (name, folder).

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Document ID |
| `name` | string | No | Document name |
| `folderId` | string | No | Folder ID |

**Returns:** `Document`

#### `boond_documents_download`

Get document download URL.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Document ID |

**Returns:** `string` (Download URL)

---

## System Tools

### Apps

#### `boond_apps_search`

Search apps by name or criteria.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | No | Search term |
| `page` | number | No | Page number |
| `limit` | number | No | Results per page |

**Returns:** `SearchResponse<App>`

#### `boond_apps_get`

Get an app by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | App ID |

**Returns:** `App`

#### `boond_apps_install`

Install an app by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | App ID |

**Returns:** `App`

#### `boond_apps_uninstall`

Uninstall an app by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | App ID |

**Returns:** `void`

### Settings

#### `boond_settings_search`

Search all system settings.

**Parameters:** None

**Returns:** `SearchResponse<Setting>`

#### `boond_settings_get`

Get a setting by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Setting ID |

**Returns:** `Setting`

#### `boond_settings_update`

Update a setting by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Setting ID |
| `value` | any | No | New value |
| `category` | string | No | Category |

**Returns:** `Setting`

### Alerts

#### `boond_alerts_search`

Search alerts by criteria.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | No | Search term |
| `page` | number | No | Page number |
| `limit` | number | No | Results per page |

**Returns:** `SearchResponse<Alert>`

#### `boond_alerts_get`

Get an alert by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Alert ID |

**Returns:** `Alert`

#### `boond_alerts_update`

Update an alert status (mark as resolved).

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Alert ID |
| `resolved` | boolean | No | Resolved status |

**Returns:** `Alert`

### Search Tools

#### `boond_fulltext_search`

Perform full-text search across multiple entity types.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | Yes | Search query |
| `entities` | array | No | Entity types to search (candidates/companies/contacts/resources/projects/opportunities) |
| `page` | number | No | Page number |
| `limit` | number | No | Results per page |

**Returns:** `FullTextSearchResult`

#### `boond_faceted_search`

Perform faceted search with filter criteria on specific entity type.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `entity` | string | Yes | Entity type |
| `query` | string | No | Search query |
| `status` | string | No | Status filter |
| `page` | number | No | Page number |
| `limit` | number | No | Results per page |

**Returns:** `FacetedSearchResult`

#### `boond_advanced_search`

Search entities by specific field values.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `entity` | string | Yes | Entity type |
| `field` | string | Yes | Field name (email/phone/city/country/status/type) |
| `value` | string | Yes | Search value |
| `page` | number | No | Page number |
| `limit` | number | No | Results per page |

**Returns:** `AdvancedSearchResult`

#### `boond_date_range_search`

Search entities within a specific date range.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `entity` | string | Yes | Entity type (timereports/absences/projects) |
| `dateFrom` | string | Yes | Start date (YYYY-MM-DD) |
| `dateTo` | string | Yes | End date (YYYY-MM-DD) |
| `status` | string | No | Status filter |
| `page` | number | No | Page number |
| `limit` | number | No | Results per page |

**Returns:** `DateRangeSearchResult`
