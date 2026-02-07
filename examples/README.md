# BoondManager MCP Examples

Real-world workflow examples demonstrating how to use the BoondManager MCP server effectively.

## Quick Start

### What are these examples?

These examples show realistic workflows using BoondManager MCP tools. Each example:

- Demonstrates a complete business process
- Shows actual MCP JSON-RPC calls
- Includes realistic parameters and data
- Explains what each step accomplishes
- Lists expected responses

### Who should read these?

- **Developers** learning how to call MCP tools
- **Teams** automating BoondManager workflows
- **Claude Desktop users** building AI-powered workflows
- **Integration engineers** building connectors

## The 5 Examples

### 1. HR Candidate Management (`01-hr-candidate-workflow.ts`)

**What it shows:** Complete recruiting workflow from candidate search to hiring

**Business use case:** Recruiting teams managing candidate pipelines

**Key tools:**

- `boond_candidates_search` - Find candidates by skills
- `boond_candidates_get` - Review candidate profile
- `boond_contacts_create` - Create CRM contact
- `boond_candidates_update` - Update candidate status
- `boond_resources_search` - Compare with existing team

**Workflow steps:**

1. Search candidates by technical skills (TypeScript)
2. Retrieve detailed candidate profile
3. Create contact record for promising candidate
4. Update status as they progress through pipeline
5. Check existing team for comparison

**What you'll learn:**

- How to search and qualify candidates
- Moving candidates through hiring pipeline
- Linking candidates to CRM contacts
- Resource benchmarking

---

### 2. CRM Opportunity Management (`02-crm-opportunity-workflow.ts`)

**What it shows:** Complete sales workflow from prospect to quotation

**Business use case:** Sales teams managing deal pipelines

**Key tools:**

- `boond_companies_search` - Find qualified prospects
- `boond_companies_get` - Review company details
- `boond_opportunities_create` - Create sales opportunity
- `boond_opportunities_update` - Track deal progress
- `boond_quotations_create` - Generate pricing
- `boond_quotations_generate_pdf` - Export for client

**Workflow steps:**

1. Search for companies in target industry/location
2. Review company details and fit
3. Create opportunity record
4. Update stage as deal progresses (qualification → proposal)
5. Generate quotation with pricing breakdown
6. Export quotation as professional PDF

**What you'll learn:**

- Prospect discovery and qualification
- Managing opportunity pipeline stages
- Generating professional quotations
- Client delivery workflows

---

### 3. Finance Invoice Management (`03-finance-invoice-workflow.ts`)

**What it shows:** Complete invoicing workflow from creation to payment

**Business use case:** Finance teams managing billing and AR

**Key tools:**

- `boond_invoices_create` - Create new invoice
- `boond_invoices_add_line` - Add product/service lines
- `boond_invoices_calculate` - Auto-calculate totals & tax
- `boond_invoices_finalize` - Complete invoice
- `boond_invoices_download_pdf` - Export for delivery

**Workflow steps:**

1. Create invoice with customer and payment terms
2. Add multiple line items (products, services)
3. Calculate subtotal, tax, and total
4. Finalize invoice for payment processing
5. Download PDF for delivery to customer

**What you'll learn:**

- Creating structured invoices
- Line-item management with tax
- Auto-calculation of totals
- PDF generation and delivery

---

### 4. Project Management (`04-project-management-workflow.ts`)

**What it shows:** Complete project lifecycle from creation to completion

**Business use case:** Project managers organizing teams and tracking delivery

**Key tools:**

- `boond_projects_create` - Create new project
- `boond_projects_update` - Update project status
- `boond_deliveries_create` - Add project milestones
- `boond_actions_create` - Create project tasks
- `boond_actions_update` - Update task progress

**Workflow steps:**

1. Create project with timeline and budget
2. Define major deliverables/milestones
3. Create individual tasks with assignments
4. Track overall project progress
5. Update task status as work completes

**What you'll learn:**

- Project structure and planning
- Work breakdown with deliverables
- Task assignment and tracking
- Progress aggregation

---

### 5. Time Tracking & Expenses (`05-time-tracking-workflow.ts`)

**What it shows:** Complete timesheet workflow from creation to submission

**Business use case:** Employees tracking billable time, managers approving timesheets

**Key tools:**

- `boond_time_reports_create` - Create weekly timesheet
- `boond_time_reports_add_entry` - Log daily hours
- `boond_time_reports_submit` - Submit for approval
- `boond_absences_create` - Record time off
- `boond_expenses_create` - Track project expenses

**Workflow steps:**

1. Create weekly time report
2. Log daily work hours by project
3. Record any absences (vacation, sick)
4. Track project expenses (mileage, meals)
5. Submit for manager approval

**What you'll learn:**

- Creating and managing timesheets
- Billable hour tracking
- Absence and time-off management
- Expense reporting
- Approval workflows

---

## How to Use These Examples

### Option 1: Read and Learn (Recommended to start)

Each example file shows the complete workflow with:

- Step-by-step descriptions
- MCP JSON-RPC requests (the actual calls you'd make)
- Expected response structure
- What you learn from each step

Simply read through the file to understand the workflow pattern and tool calling sequence.

```bash
# Read an example
cat examples/01-hr-candidate-workflow.ts

# View the structure and comments
grep -A 20 "STEP 1" examples/01-hr-candidate-workflow.ts
```

### Option 2: Use with Claude Desktop

1. **Install/Configure MCP Server:**

   ```bash
   # Follow setup instructions in ../../docs/SETUP.md
   ```

2. **Add to Claude Desktop Config:**
   Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

   ```json
   {
     "mcpServers": {
       "boond": {
         "command": "node",
         "args": ["/path/to/boond-mcp/build/index.js"],
         "env": {
           "BOOND_API_TOKEN": "your-token-here"
         }
       }
     }
   }
   ```

3. **Ask Claude to Run Workflows:**
   ```
   "Follow the workflow in examples/01-hr-candidate-workflow.ts"
   "Execute the sales pipeline from 02-crm-opportunity-workflow.ts"
   ```

Claude will execute each tool call using the MCP server.

### Option 3: Direct Integration

Use the MCP SDK to run workflows programmatically:

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function runWorkflow() {
  // 1. Start MCP server
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['build/index.js'],
    env: { BOOND_API_TOKEN: 'your-token' },
  });

  const client = new Client({ name: 'example', version: '1.0' });
  await client.connect(transport);

  // 2. Call tools following workflow pattern
  const candidates = await client.request(
    {
      method: 'tools/call',
      params: {
        name: 'boond_candidates_search',
        arguments: { keywords: 'TypeScript', limit: 10 },
      },
    },
    s => {}
  );

  // 3. Process results and continue workflow
  console.log(candidates);

  await client.close();
}

runWorkflow();
```

---

## Key Concepts

### Tool Calling Pattern

All examples follow this pattern:

```typescript
// 1. Define the MCP JSON-RPC request
const request = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/call',
  params: {
    name: 'boond_<domain>_<action>',
    arguments: {
      // tool-specific parameters
    },
  },
};

// 2. Send request (handled by MCP SDK)
// 3. Process response
// 4. Use results in next step
```

### Tool Naming Convention

All tools follow the pattern: `boond_<domain>_<action>`

Examples:

- `boond_candidates_search` - HR domain, search candidates
- `boond_opportunities_create` - CRM domain, create opportunity
- `boond_invoices_finalize` - Finance domain, finalize invoice
- `boond_projects_update` - Projects domain, update project
- `boond_time_reports_submit` - Time domain, submit report

### Response Structure

All tools return a consistent structure:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Human-readable formatted response"
      }
    ],
    "isError": false
  }
}
```

---

## Common Workflows Beyond These Examples

Once you understand these 5 examples, here are related workflows:

### HR + Projects

- Hire candidates → Assign to projects → Track resource allocation

### CRM + Finance

- Create opportunity → Generate quotation → Create invoice → Track AR

### Projects + Time

- Create project → Assign tasks → Track time → Generate invoices

### All Domains

- Search → Create → Update → Track → Report

---

## Next Steps

### Build Dashboards

- Show pipeline health (HR, CRM)
- Project status and budget tracking
- Timesheet submission and approval status
- Invoice aging and AR metrics

### Automate Workflows

- Auto-create opportunities from website leads
- Auto-generate invoices from delivered projects
- Auto-calculate project profitability
- Auto-send approval reminders

### Integrate with External Systems

- Sync candidates to job boards
- Push invoices to accounting software
- Sync time entries to payroll
- Export project data to BI tools

### Advanced Features

- AI-powered candidate screening
- Predictive deal closing probability
- Project budget forecasting
- Timesheet pattern analysis

---

## Debugging & Troubleshooting

### Tool Not Found

```
Error: Tool 'boond_candidates_search' not found
```

- Verify tool name in [API_REFERENCE.md](../docs/API_REFERENCE.md)
- Check MCP server is running: `ps aux | grep boond`
- Restart Claude Desktop if recently updated

### Missing Parameters

```
Error: Missing required parameter 'keywords' for boond_candidates_search
```

- Check example for required vs optional parameters
- Review tool documentation in API_REFERENCE.md
- Look at expected request structure in example comments

### Authentication Issues

```
Error: 401 Unauthorized
```

- Verify `BOOND_API_TOKEN` is set correctly
- Check token hasn't expired
- Ensure token has required permissions

### Response Parsing

```
Error: Cannot parse tool response
```

- Check MCP server logs: `BOOND_API_TOKEN=token node build/index.js`
- Verify response JSON is valid
- Check for network timeouts

---

## File Structure

```
examples/
├── README.md                              (this file)
├── 01-hr-candidate-workflow.ts            (recruitment workflow)
├── 02-crm-opportunity-workflow.ts         (sales workflow)
├── 03-finance-invoice-workflow.ts         (billing workflow)
├── 04-project-management-workflow.ts      (project workflow)
└── 05-time-tracking-workflow.ts           (timesheet workflow)
```

---

## Additional Resources

- **[API Reference](../docs/API_REFERENCE.md)** - Complete tool catalog
- **[Getting Started](../docs/GETTING_STARTED.md)** - Setup guide
- **[Setup Instructions](../docs/SETUP.md)** - Environment configuration

---

## Learning Path

1. **Start here:** Read this README
2. **Pick a domain:** Choose an example matching your use case
3. **Study the workflow:** Review the step-by-step example
4. **Try with Claude:** Use the example as a prompt in Claude Desktop
5. **Combine workflows:** Mix examples for multi-domain automation
6. **Build custom solutions:** Adapt examples for your specific needs

---

## Contributing

Found an issue or want to add an example? Check the main project README for contribution guidelines.

---

**Last Updated:** February 2026  
**MCP Version:** 0.8.0  
**Examples Status:** Production-ready
