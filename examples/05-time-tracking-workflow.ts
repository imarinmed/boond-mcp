/**
 * Example: Time Tracking & Expense Workflow
 *
 * This example demonstrates a complete time and expense tracking workflow:
 * - Create time reports for weekly tracking
 * - Add daily time entries (billable hours)
 * - Record absence (vacation, sick leave, etc.)
 * - Submit time reports for approval
 * - Track expenses and mileage
 * - Generate timesheet for payroll
 *
 * This workflow is typical for employees tracking billable time
 * and expenses for projects, and managers approving timesheets.
 *
 * Tools used:
 * - boond_time_reports_create: Create weekly/monthly time report
 * - boond_time_reports_add_entry: Log daily work hours
 * - boond_time_reports_submit: Submit for manager approval
 * - boond_absences_create: Record time off (vacation, sick)
 * - boond_expenses_create: Log expenses and mileage
 *
 * Prerequisites:
 * - BoondManager account with Time module access
 * - API token configured in BOOND_API_TOKEN environment variable
 * - Employee resources and projects already created
 */

/**
 * STEP 1: Create time report
 *
 * Initialize a time report for a specific week. This serves as
 * the container for all daily time entries.
 */
async function step1CreateTimeReport() {
  console.log('\n=== STEP 1: Create Weekly Time Report ===\n');

  const createRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'boond_time_reports_create',
      arguments: {
        resourceId: 'res_001',
        startDate: '2026-02-02',
        endDate: '2026-02-06',
        reportType: 'weekly',
        description: 'Week of February 2-6, 2026',
      },
    },
  };

  console.log('Request: Create weekly time report');
  console.log(JSON.stringify(createRequest, null, 2));

  console.log('\nExpected response structure:');
  console.log(`{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [{
      "type": "text",
      "text": "Time report created!\\n\\n⏱️  Report: Week of 2026-02-02 to 2026-02-06\\nID: timereport_001\\nEmployee: John Smith\\nStatus: draft\\nTotal Hours: 0 (ready for entries)..."
    }],
    "isError": false
  }
}`);

  console.log('\nWhat you learn:');
  console.log('✓ How to create time reports');
  console.log('✓ Weekly vs monthly tracking periods');
  console.log('✓ Draft status for adding entries');

  return 'timereport_001'; // Simulated report ID
}

/**
 * STEP 2: Add daily time entries
 *
 * Log work hours for each day, assigned to specific projects.
 * This shows billable time tracking for client projects.
 */
async function step2AddTimeEntries(reportId: string) {
  console.log('\n=== STEP 2: Add Daily Time Entries ===\n');

  const timeEntries = [
    {
      date: '2026-02-02',
      project: 'proj_2001',
      hours: 8,
      description: 'Enterprise Portal Redesign - Design kickoff meeting and requirements review',
    },
    {
      date: '2026-02-03',
      project: 'proj_2001',
      hours: 7.5,
      description: 'Enterprise Portal Redesign - Wireframe design and stakeholder feedback',
    },
    {
      date: '2026-02-04',
      project: 'proj_2001',
      hours: 8,
      description: 'Enterprise Portal Redesign - Final design mockups and handoff to development',
    },
    {
      date: '2026-02-05',
      project: 'proj_2001',
      hours: 6.5,
      description: 'Enterprise Portal Redesign - Design review and revisions',
    },
    {
      date: '2026-02-06',
      project: 'proj_2001',
      hours: 8,
      description: 'Enterprise Portal Redesign - Polish and documentation',
    },
  ];

  console.log('Request: Add 5 daily work entries (37.5 billable hours)');
  for (const entry of timeEntries) {
    const entryRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'boond_time_reports_add_entry',
        arguments: {
          reportId: reportId,
          date: entry.date,
          projectId: entry.project,
          hours: entry.hours,
          description: entry.description,
          billable: true,
        },
      },
    };

    console.log(`\n${entry.date}: ${entry.hours} hours - ${entry.description}`);
    console.log(JSON.stringify(entryRequest, null, 2));
  }

  console.log('\nExpected response for each entry:');
  console.log(`{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [{
      "type": "text",
      "text": "Time entry added!\\n\\n✓ Date: 2026-02-02\\nHours: 8\\nProject: Enterprise Portal Redesign\\nBillable: Yes\\nReport Total: 8 hours"
    }],
    "isError": false
  }
}`);

  console.log('\nWhat you learn:');
  console.log('✓ How to log billable time to projects');
  console.log('✓ Daily granularity for accurate tracking');
  console.log('✓ Project assignment for cost tracking');
}

/**
 * STEP 3: Record absences
 *
 * Log any time off during the week (vacation, sick leave, etc.)
 * This impacts total billable hours available.
 */
async function step3RecordAbsences(reportId: string) {
  console.log('\n=== STEP 3: Record Absences (Time Off) ===\n');

  const absenceRequest = {
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'boond_absences_create',
      arguments: {
        resourceId: 'res_001',
        startDate: '2026-02-09',
        endDate: '2026-02-13',
        absenceType: 'vacation',
        reason: 'Planned vacation',
        approvalStatus: 'pending',
        comment: 'Approved by manager - booking confirmed',
      },
    },
  };

  console.log('Request: Record week-long vacation');
  console.log(JSON.stringify(absenceRequest, null, 2));

  console.log('\nExpected response structure:');
  console.log(`{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [{
      "type": "text",
      "text": "Absence recorded!\\n\\n📅 Absence: Vacation\\nID: absence_001\\nDates: 2026-02-09 to 2026-02-13 (5 days)\\nEmployee: John Smith\\nStatus: pending approval\\nComment: Approved by manager - booking confirmed"
    }],
    "isError": false
  }
}`);

  console.log('\nWhat you learn:');
  console.log('✓ How to record different absence types');
  console.log('✓ Vacation, sick leave, training, etc.');
  console.log('✓ Impact on resource availability');
}

/**
 * STEP 4: Create expense reports
 *
 * Log project expenses: mileage, meals, materials, etc.
 * These are tracked separately from time but submitted together.
 */
async function step4CreateExpenses() {
  console.log('\n=== STEP 4: Create Expense Reports ===\n');

  const expenses = [
    {
      date: '2026-02-03',
      type: 'mileage',
      description: 'Client site visit for requirements gathering',
      amount: 85.5,
    },
    {
      date: '2026-02-04',
      type: 'meals',
      description: 'Team lunch meeting with stakeholders',
      amount: 42.75,
    },
    {
      date: '2026-02-05',
      type: 'materials',
      description: 'Design software subscription renewal (monthly portion)',
      amount: 25.0,
    },
  ];

  console.log('Request: Log 3 project expenses');
  for (const expense of expenses) {
    const expenseRequest = {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'boond_expenses_create',
        arguments: {
          resourceId: 'res_001',
          projectId: 'proj_2001',
          date: expense.date,
          expenseType: expense.type,
          description: expense.description,
          amount: expense.amount,
          currency: 'EUR',
          requiresReceipt: true,
        },
      },
    };

    console.log(`\n${expense.date}: ${expense.type} - €${expense.amount.toFixed(2)}`);
    console.log(JSON.stringify(expenseRequest, null, 2));
  }

  console.log('\nExpected response for each expense:');
  console.log(`{
  "jsonrpc": "2.0",
  "id": 4,
  "result": {
    "content": [{
      "type": "text",
      "text": "Expense recorded!\\n\\n💳 Type: Mileage\\nAmount: €85.50\\nDate: 2026-02-03\\nProject: Enterprise Portal Redesign\\nStatus: pending receipt\\nReport Total: €153.25"
    }],
    "isError": false
  }
}`);

  console.log('\nWhat you learn:');
  console.log('✓ How to track project expenses');
  console.log('✓ Mileage, meals, materials tracking');
  console.log('✓ Currency and receipt management');
}

/**
 * STEP 5: Submit time report for approval
 *
 * Once all entries are complete and accurate, submit the report
 * for manager review and approval.
 */
async function step5SubmitTimeReport(reportId: string) {
  console.log('\n=== STEP 5: Submit Time Report for Approval ===\n');

  const submitRequest = {
    jsonrpc: '2.0',
    id: 5,
    method: 'tools/call',
    params: {
      name: 'boond_time_reports_submit',
      arguments: {
        reportId: reportId,
        submissionNotes: 'Week complete. 37.5 billable hours logged. Expenses attached: €153.25',
        expectedPayoutDate: '2026-02-20',
      },
    },
  };

  console.log('Request: Submit time report for manager approval');
  console.log(JSON.stringify(submitRequest, null, 2));

  console.log('\nExpected response structure:');
  console.log(`{
  "jsonrpc": "2.0",
  "id": 5,
  "result": {
    "content": [{
      "type": "text",
      "text": "Time report submitted!\\n\\n✅ Status: submitted\\nReport ID: timereport_001\\nTotal Billable Hours: 37.5\\nExpenses: €153.25 (3 items)\\nSubmitted To: Manager Jane Doe\\nExpected Action: 2026-02-10\\nPayout Date: 2026-02-20"
    }],
    "isError": false
  }
}`);

  console.log('\nWhat you learn:');
  console.log('✓ How to submit reports for approval');
  console.log('✓ Manager notification workflow');
  console.log('✓ Expense aggregation with time entries');
  console.log('✓ Payout scheduling and tracking');
}

/**
 * WORKFLOW SUMMARY
 *
 * This time tracking workflow demonstrates complete timesheet management:
 * 1. Create weekly/monthly time reports
 * 2. Log daily work hours by project
 * 3. Record any absences (vacation, sick)
 * 4. Track project expenses (mileage, meals, materials)
 * 5. Submit for manager approval
 *
 * Common next steps:
 * - Manager approves and signs off on reports
 * - Auto-generate payroll from approved hours
 * - Invoice clients based on billable hours
 * - Track project profitability
 * - Build dashboard for time analytics
 * - Create reports: project utilization, employee productivity
 *
 * Typical monthly pattern:
 * - Monday: Manager reviews previous week's submissions
 * - Friday: Employees submit current week's reports
 * - End of month: Approve all reports and process payroll
 */
async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Time Tracking & Expense Workflow         ║');
  console.log('╚════════════════════════════════════════════╝');

  try {
    const reportId = await step1CreateTimeReport();
    await step2AddTimeEntries(reportId);
    await step3RecordAbsences(reportId);
    await step4CreateExpenses();
    await step5SubmitTimeReport(reportId);

    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║          Workflow Complete!                ║');
    console.log('╚════════════════════════════════════════════╝');

    console.log("\nYou've learned how to:");
    console.log('✓ Create and manage time reports');
    console.log('✓ Log billable hours by project');
    console.log('✓ Record absences and time off');
    console.log('✓ Track project expenses');
    console.log('✓ Submit reports for approval');

    console.log('\nNext steps:');
    console.log('• Build manager approval dashboard');
    console.log('• Generate payroll from approved hours');
    console.log('• Create client invoices from billable time');
    console.log('• Build project profitability analytics');
    console.log('• Implement timesheet templates');
  } catch (error) {
    console.error('Workflow error:', error);
  }
}

main();
