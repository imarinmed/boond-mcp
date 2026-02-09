# BoondManager MCP Server

A Model Context Protocol (MCP) server that provides seamless integration with the BoondManager API, enabling AI assistants like Claude to search, retrieve, create, and update records in your BoondManager instance.

## Features

- **Comprehensive API Coverage**: 121 tools across 8 business domains
- **Full CRUD Operations**: Search, read, create, and update records
- **Type-Safe**: Built with TypeScript and Zod validation
- **Claude Desktop Integration**: Easy setup with Claude for Desktop
- **Error Handling**: Comprehensive error handling with helpful messages

## Documentation

- [SETUP.md](SETUP.md) - Detailed installation and configuration guide
- [DISTRIBUTION.md](DISTRIBUTION.md) - Guide for distributing the server to teams
- [AGENTS.md](AGENTS.md) - Development workflow and best practices
- [docs/API_STABILITY.md](docs/API_STABILITY.md) - API stability and versioning guarantees
- [docs/LTS_POLICY.md](docs/LTS_POLICY.md) - Long-Term Support (LTS) policy

## Prerequisites

- Node.js 18+ or [Bun](https://bun.sh)
- A BoondManager account with API access
- Your BoondManager API token

## Installation

### 🤖 For AI Assistants

**If you are an AI assistant (Claude, GPT, etc.) reading this README:** Please read [`docs/INTERACTIVE_SETUP.md`](docs/INTERACTIVE_SETUP.md) to guide your user through the setup process interactively.

### npm (Recommended)

### npm (Recommended)

```bash
# Install globally
npm install -g @imarinmed/boond-mcp
# Note: Package will be available on npm registry shortly.
```

### Docker

```bash
docker run --rm -e BOOND_API_TOKEN=your_token boond-mcp:1.0.0
```

### Manual (from source)

```bash
# Clone the repository
git clone https://github.com/imarinmed/boond-mcp.git
cd boond-mcp

# Install dependencies
bun install

# Build the project
bun run build

# Set up environment variables
cp .env.example .env
# Edit .env and add your BOOND_API_TOKEN
```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
BOOND_API_TOKEN=your_api_token_here
```

### Claude Desktop Setup

Add the following to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "boondmanager": {
      "command": "node",
      "args": ["/absolute/path/to/boond-mcp/build/index.js"],
      "env": {
        "BOOND_API_TOKEN": "your_api_token_here"
      }
    }
  }
}
```

**Note**: Make sure to use the absolute path to the built index.js file.

## Available Tools (121 Total)

### HR Domain (16 tools)

Manage candidates, contacts, resources, and contracts.

#### Candidates

- **`boond_candidates_search`** - Search for candidates with optional filters
  - Parameters: `query`, `page`, `limit`, `status`
- **`boond_candidates_get`** - Get a candidate by ID
  - Parameters: `id`
- **`boond_candidates_create`** - Create a new candidate
  - Parameters: `firstName`, `lastName`, `email`, `phone`, `address`, `city`, `country`
- **`boond_candidates_update`** - Update an existing candidate
  - Parameters: `id`, plus any fields to update

#### Contacts

- **`boond_contacts_search`** - Search for contacts
  - Parameters: `query`, `page`, `limit`, `companyId`
- **`boond_contacts_get`** - Get a contact by ID
  - Parameters: `id`
- **`boond_contacts_create`** - Create a new contact
  - Parameters: `firstName`, `lastName`, `email`, `companyId`, `phone`, `title`
- **`boond_contacts_update`** - Update an existing contact
  - Parameters: `id`, plus any fields to update

#### Resources

- **`boond_resources_search`** - Search for resources
  - Parameters: `query`, `page`, `limit`, `status`
- **`boond_resources_get`** - Get a resource by ID
  - Parameters: `id`
- **`boond_resources_create`** - Create a new resource
  - Parameters: `firstName`, `lastName`, `email`, `type`, `startDate`
- **`boond_resources_update`** - Update an existing resource
  - Parameters: `id`, plus any fields to update

#### Contracts

- **`boond_contracts_search`** - Search for contracts
  - Parameters: `query`, `page`, `limit`, `status`
- **`boond_contracts_get`** - Get a contract by ID
  - Parameters: `id`
- **`boond_contracts_create`** - Create a new contract
  - Parameters: `resourceId`, `startDate`, `endDate`, `type`, `salary`
- **`boond_contracts_update`** - Update an existing contract
  - Parameters: `id`, plus any fields to update

### CRM Domain (15 tools)

Manage companies, opportunities, and quotations.

#### Companies

- **`boond_companies_search`** - Search for companies
  - Parameters: `query`, `page`, `limit`, `type`
- **`boond_companies_get`** - Get a company by ID
  - Parameters: `id`
- **`boond_companies_create`** - Create a new company
  - Parameters: `name`, `type`, `address`, `city`, `country`, `phone`, `email`
- **`boond_companies_update`** - Update an existing company
  - Parameters: `id`, plus any fields to update

#### Opportunities

- **`boond_opportunities_search`** - Search for opportunities
  - Parameters: `query`, `page`, `limit`, `status`, `companyId`
- **`boond_opportunities_get`** - Get an opportunity by ID
  - Parameters: `id`
- **`boond_opportunities_create`** - Create a new opportunity
  - Parameters: `title`, `companyId`, `value`, `currency`, `probability`, `expectedCloseDate`
- **`boond_opportunities_update`** - Update an existing opportunity
  - Parameters: `id`, plus any fields to update

#### Quotations

- **`boond_quotations_search`** - Search for quotations
  - Parameters: `query`, `page`, `limit`, `status`, `opportunityId`
- **`boond_quotations_get`** - Get a quotation by ID
  - Parameters: `id`
- **`boond_quotations_create`** - Create a new quotation
  - Parameters: `opportunityId`, `title`, `total`, `currency`, `validUntil`
- **`boond_quotations_update`** - Update an existing quotation
  - Parameters: `id`, plus any fields to update
- **`boond_quotations_send`** - Send a quotation to client
  - Parameters: `id`, `email`, `message`

### Finance Domain (16 tools)

Manage invoices, purchases, orders, and banking.

#### Invoices

- **`boond_invoices_search`** - Search for invoices
  - Parameters: `query`, `page`, `limit`, `status`, `dateFrom`, `dateTo`
- **`boond_invoices_get`** - Get an invoice by ID
  - Parameters: `id`
- **`boond_invoices_create`** - Create a new invoice
  - Parameters: `companyId`, `projectId`, `amount`, `currency`, `dueDate`
- **`boond_invoices_update`** - Update an existing invoice
  - Parameters: `id`, plus any fields to update

#### Purchases

- **`boond_purchases_search`** - Search for purchases
  - Parameters: `query`, `page`, `limit`, `status`, `dateFrom`, `dateTo`
- **`boond_purchases_get`** - Get a purchase by ID
  - Parameters: `id`
- **`boond_purchases_create`** - Create a new purchase
  - Parameters: `supplierId`, `amount`, `currency`, `description`, `date`
- **`boond_purchases_update`** - Update an existing purchase
  - Parameters: `id`, plus any fields to update

#### Orders

- **`boond_orders_search`** - Search for orders
  - Parameters: `query`, `page`, `limit`, `status`, `dateFrom`, `dateTo`
- **`boond_orders_get`** - Get an order by ID
  - Parameters: `id`
- **`boond_orders_create`** - Create a new order
  - Parameters: `companyId`, `projectId`, `amount`, `currency`, `description`
- **`boond_orders_update`** - Update an existing order
  - Parameters: `id`, plus any fields to update

#### Banking

- **`boond_banking_accounts_search`** - Search banking accounts
  - Parameters: `query`, `page`, `limit`
- **`boond_banking_accounts_get`** - Get a banking account by ID
  - Parameters: `id`
- **`boond_banking_transactions_search`** - Search banking transactions
  - Parameters: `accountId`, `dateFrom`, `dateTo`, `page`, `limit`

### Projects Domain (13 tools)

Manage projects, deliveries, and actions.

#### Projects

- **`boond_projects_search`** - Search for projects
  - Parameters: `query`, `page`, `limit`, `status`, `companyId`
- **`boond_projects_get`** - Get a project by ID
  - Parameters: `id`

#### Deliveries

- **`boond_deliveries_search`** - Search for deliveries
  - Parameters: `query`, `page`, `limit`, `projectId`, `status`
- **`boond_deliveries_get`** - Get a delivery by ID
  - Parameters: `id`
- **`boond_deliveries_create`** - Create a new delivery
  - Parameters: `projectId`, `name`, `description`, `dueDate`
- **`boond_deliveries_update`** - Update an existing delivery
  - Parameters: `id`, plus any fields to update
- **`boond_deliveries_send`** - Send a delivery notification
  - Parameters: `id`, `email`, `message`

#### Actions

- **`boond_actions_search`** - Search for actions
  - Parameters: `query`, `page`, `limit`, `projectId`, `status`, `assignedTo`
- **`boond_actions_get`** - Get an action by ID
  - Parameters: `id`
- **`boond_actions_create`** - Create a new action
  - Parameters: `projectId`, `name`, `description`, `assignedTo`, `dueDate`, `priority`
- **`boond_actions_update`** - Update an existing action
  - Parameters: `id`, plus any fields to update
- **`boond_actions_delete`** - Delete an action
  - Parameters: `id`

### Time Domain (16 tools)

Manage time reports, absences, and expenses.

#### Time Reports

- **`boond_timereports_search`** - Search time reports
  - Parameters: `resourceId`, `startDate`, `endDate`, `status`, `page`, `limit`
- **`boond_timereports_get`** - Get a time report by ID
  - Parameters: `id`
- **`boond_timereports_create`** - Create a new time report
  - Parameters: `resourceId`, `date`, `hours`, `projectId`, `description`

#### Absences

- **`boond_absences_search`** - Search for absences
  - Parameters: `resourceId`, `startDate`, `endDate`, `type`, `status`, `page`, `limit`
- **`boond_absences_get`** - Get an absence by ID
  - Parameters: `id`
- **`boond_absences_create`** - Create a new absence
  - Parameters: `resourceId`, `startDate`, `endDate`, `type`, `reason`
- **`boond_absences_update`** - Update an existing absence
  - Parameters: `id`, plus any fields to update

#### Expenses

- **`boond_expenses_search`** - Search for expense reports
  - Parameters: `resourceId`, `startDate`, `endDate`, `status`, `page`, `limit`
- **`boond_expenses_get`** - Get an expense report by ID
  - Parameters: `id`
- **`boond_expenses_create`** - Create a new expense report
  - Parameters: `resourceId`, `date`, `amount`, `currency`, `category`, `description`
- **`boond_expenses_update`** - Update an existing expense report
  - Parameters: `id`, plus any fields to update
- **`boond_expenses_certify`** - Certify an expense report
  - Parameters: `id`
- **`boond_expenses_reject`** - Reject an expense report
  - Parameters: `id`, `reason`

### Admin Domain (12 tools)

Manage agencies, business units, and accounts.

#### Agencies

- **`boond_agencies_search`** - Search for agencies
  - Parameters: `query`, `page`, `limit`
- **`boond_agencies_get`** - Get an agency by ID
  - Parameters: `id`
- **`boond_agencies_create`** - Create a new agency
  - Parameters: `name`, `address`, `city`, `country`, `phone`, `email`
- **`boond_agencies_update`** - Update an existing agency
  - Parameters: `id`, plus any fields to update

#### Business Units

- **`boond_businessunits_search`** - Search for business units
  - Parameters: `query`, `page`, `limit`
- **`boond_businessunits_get`** - Get a business unit by ID
  - Parameters: `id`
- **`boond_businessunits_create`** - Create a new business unit
  - Parameters: `name`, `code`, `description`, `managerId`
- **`boond_businessunits_update`** - Update an existing business unit
  - Parameters: `id`, plus any fields to update

#### Accounts

- **`boond_accounts_search`** - Search for accounts
  - Parameters: `query`, `page`, `limit`
- **`boond_accounts_get`** - Get an account by ID
  - Parameters: `id`
- **`boond_accounts_create`** - Create a new account
  - Parameters: `name`, `type`, `number`, `currency`, `balance`
- **`boond_accounts_update`** - Update an existing account
  - Parameters: `id`, plus any fields to update

### Documents Domain (4 tools)

Manage documents and files.

- **`boond_documents_search`** - Search for documents
  - Parameters: `query`, `page`, `limit`, `folderId`
- **`boond_documents_get`** - Get a document by ID
  - Parameters: `id`
- **`boond_documents_update`** - Update document metadata
  - Parameters: `id`, `name`, `folderId`
- **`boond_documents_download`** - Get document download URL
  - Parameters: `id`

### System Domain (10 tools)

Manage apps, settings, and alerts.

#### Apps

- **`boond_apps_search`** - Search for apps
  - Parameters: `query`, `page`, `limit`, `type`
- **`boond_apps_get`** - Get an app by ID
  - Parameters: `id`
- **`boond_apps_install`** - Install an app
  - Parameters: `id`
- **`boond_apps_uninstall`** - Uninstall an app
  - Parameters: `id`

#### Settings

- **`boond_settings_search`** - Search for settings
  - Parameters: `query`, `page`, `limit`, `category`
- **`boond_settings_get`** - Get a setting by ID
  - Parameters: `id`
- **`boond_settings_update`** - Update a setting
  - Parameters: `id`, `value`, `category`

#### Alerts

- **`boond_alerts_search`** - Search for alerts
  - Parameters: `query`, `page`, `limit`, `status`, `severity`
- **`boond_alerts_get`** - Get an alert by ID
  - Parameters: `id`
- **`boond_alerts_update`** - Update an alert (resolve)
  - Parameters: `id`, `status`, `resolution`

## Usage Examples

### With Claude Desktop

Once configured, you can ask Claude to:

**HR Management:**

```
"Find candidates with React experience in Paris"
"Create a new contact for John Doe at Acme Corp"
"Get resource details for employee ID 12345"
"Update contract end date for resource 67890"
```

**CRM Operations:**

```
"Search for all client companies"
"Create a new opportunity worth €50,000 for Company XYZ"
"Send quotation ID 12345 to the client"
"Get all active opportunities for Q1"
```

**Financial Management:**

```
"Search for unpaid invoices from last month"
"Create a new purchase order for €5,000"
"Get banking transaction history for account 12345"
"Update invoice status to paid for ID 67890"
```

**Project Management:**

```
"Show me all active projects"
"Create a new delivery milestone for Project ABC"
"Assign action item to John for Project XYZ"
"Get project details including all deliveries"
```

**Time & Expenses:**

```
"Create a time report for resource 123 on project 456 for 8 hours today"
"Search time reports for resource 123 from January 1st to January 31st"
"Submit expense report for €150 in travel costs"
"Certify expense report ID 789"
```

**Administration:**

```
"Search for all agencies"
"Create a new business unit called 'Sales Team'"
"Get account balance for account ID 12345"
"Update agency address for Paris office"
```

**Document Management:**

```
"Search for documents in folder 'Contracts'"
"Get download URL for document ID 12345"
"Update document name to 'Updated Contract v2'"
```

**System Configuration:**

```
"Search for email notification settings"
"Install the Gmail integration app"
"Get all active alerts"
"Resolve alert ID 12345"
```

### Direct MCP Protocol

You can also interact with the server directly using the MCP protocol:

```bash
# List available tools
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node build/index.js

# Search candidates
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"boond_candidates_search","arguments":{"query":"developer","limit":5}}}' | node build/index.js

# Get company by ID
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"boond_companies_get","arguments":{"id":"12345"}}}' | node build/index.js

# Create time report
echo '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"boond_timereports_create","arguments":{"resourceId":"123","date":"2024-01-15","hours":8,"projectId":"456","description":"Worked on feature X"}}}' | node build/index.js
```

## Development

```bash
# Build the project
bun run build

# Watch mode for development
bun run dev

# Run the server
bun start

# Type check
bunx tsc --noEmit

# Count registered tools
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | BOOND_API_TOKEN=test bun run src/index.ts 2>/dev/null | jq '.result.tools | length'
```

## Project Structure

```
boond-mcp/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── api/
│   │   ├── client.ts         # BoondManager API client
│   │   └── index.ts          # API exports
│   ├── tools/
│   │   ├── index.ts          # Main tool exports
│   │   ├── hr/               # HR domain tools
│   │   │   ├── candidates.ts
│   │   │   ├── contacts.ts
│   │   │   ├── resources.ts
│   │   │   ├── contracts.ts
│   │   │   └── index.ts
│   │   ├── crm/              # CRM domain tools
│   │   │   ├── companies.ts
│   │   │   ├── opportunities.ts
│   │   │   ├── quotations.ts
│   │   │   └── index.ts
│   │   ├── finance/          # Finance domain tools
│   │   │   ├── invoices.ts
│   │   │   ├── purchases.ts
│   │   │   ├── orders.ts
│   │   │   ├── banking.ts
│   │   │   └── index.ts
│   │   ├── projects/         # Projects domain tools
│   │   │   ├── projects.ts
│   │   │   ├── deliveries.ts
│   │   │   ├── actions.ts
│   │   │   └── index.ts
│   │   ├── time/             # Time domain tools
│   │   │   ├── timeReports.ts
│   │   │   ├── absences.ts
│   │   │   ├── expenses.ts
│   │   │   └── index.ts
│   │   ├── admin/            # Admin domain tools
│   │   │   ├── agencies.ts
│   │   │   ├── businessUnits.ts
│   │   │   ├── accounts.ts
│   │   │   └── index.ts
│   │   ├── documents/        # Documents domain tools
│   │   │   ├── documents.ts
│   │   │   └── index.ts
│   │   └── system/           # System domain tools
│   │       ├── apps.ts
│   │       ├── settings.ts
│   │       ├── alerts.ts
│   │       └── index.ts
│   └── types/
│       ├── boond.ts          # BoondManager API types
│       ├── mcp.ts            # MCP-specific types
│       ├── schemas.ts        # Zod validation schemas
│       └── index.ts          # Type exports
├── build/                    # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

## Troubleshooting

### "BOOND_API_TOKEN environment variable is not set"

Make sure you've set the `BOOND_API_TOKEN` environment variable either in your `.env` file or in the Claude Desktop configuration.

### "Authentication failed" or 401 errors

- Verify your API token is correct
- Check that the token has the necessary permissions
- Ensure your BoondManager instance URL is correct (default: https://ui.boondmanager.com)

### "Resource not found" or 404 errors

- Verify the ID you're using exists in your BoondManager instance
- Check that you have permission to access that resource

### "Validation error" or 422 errors

- Check that all required parameters are provided
- Verify parameter types (e.g., dates should be in ISO format)
- Ensure enum values match allowed options

### Server won't start

- Ensure you've run `bun run build` to compile the TypeScript
- Check that all dependencies are installed (`bun install`)
- Verify Node.js version is 18 or higher
- Check that `BOOND_API_TOKEN` is set

### Tool not found

If you get "Tool not found" errors:

- Verify the tool name is correct (check spelling)
- Ensure the server has been rebuilt after adding new tools
- Check that the tool is properly registered in `src/index.ts`

## API Reference

This MCP server wraps the BoondManager API. For detailed API documentation, visit:
https://doc.boondmanager.com/api-externe/

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Changelog

### v1.0.0 (2026-02-08)

- **Stable Production Release**
- Finalized 121 tools across 8 domains
- Added Docker support and installation guides
- Comprehensive security audit and stability guarantees
- Improved CLI diagnostics with `boond-mcp doctor`

### v0.2.0 (2026-02-03)

- Expanded from 12 to 94 tools
- Added 8 domain-based tool organization
- New domains: HR, CRM, Finance, Projects, Time, Admin, Documents, System
- Full CRUD operations across all domains
- Comprehensive documentation

### v0.1.0 (2026-01-15)

- Initial release with 12 tools
- Basic CRUD for candidates, companies, projects, time reports
