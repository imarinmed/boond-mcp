/**
 * Example: Finance Invoice Management Workflow
 *
 * This example demonstrates a complete billing workflow:
 * - Create invoice records with customer details
 * - Add multiple line items (products/services)
 * - Calculate subtotal, tax, and total automatically
 * - Finalize invoices for payment processing
 * - Generate and download PDF for delivery
 *
 * This workflow is typical for finance/billing teams managing
 * invoicing from creation through payment collection.
 *
 * Tools used:
 * - boond_invoices_create: Create new invoice record
 * - boond_invoices_add_line: Add product/service line items
 * - boond_invoices_calculate: Auto-calculate totals and tax
 * - boond_invoices_finalize: Complete invoice for payment
 * - boond_invoices_download_pdf: Export as professional PDF
 *
 * Prerequisites:
 * - BoondManager account with Finance module access
 * - API token configured in BOOND_API_TOKEN environment variable
 * - Customer/company records already created
 */

/**
 * STEP 1: Create new invoice
 *
 * Initialize a new invoice record with customer information
 * and payment terms. This creates the base for line items.
 */
async function step1CreateInvoice() {
  console.log('\n=== STEP 1: Create New Invoice ===\n');

  const createRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'boond_invoices_create',
      arguments: {
        customerId: 'comp_001',
        invoiceNumber: 'INV-2026-001',
        invoiceDate: '2026-02-01',
        dueDate: '2026-03-01',
        currency: 'EUR',
        notes: 'Monthly subscription invoice for February 2026',
        paymentTerms: 'Net 30',
      },
    },
  };

  console.log('Request: Create new invoice for customer');
  console.log(JSON.stringify(createRequest, null, 2));

  console.log('\nExpected response structure:');
  console.log(`{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [{
      "type": "text",
      "text": "Invoice created successfully!\\n\\n📄 Invoice: INV-2026-001\\nID: inv_5001\\nCustomer: TechCorp France\\nDate: 2026-02-01\\nDue: 2026-03-01\\nStatus: draft..."
    }],
    "isError": false
  }
}`);

  console.log('\nWhat you learn:');
  console.log('✓ How to create invoice records');
  console.log('✓ Invoice numbering and sequencing');
  console.log('✓ Payment terms configuration');

  return 'inv_5001'; // Simulated invoice ID
}

/**
 * STEP 2: Add line items to invoice
 *
 * Add multiple products and services to the invoice. Each line item
 * includes quantity, unit price, and tax information.
 */
async function step2AddLineItems(invoiceId: string) {
  console.log('\n=== STEP 2: Add Line Items ===\n');

  const lineItems = [
    {
      description: 'Enterprise License - Monthly Subscription',
      quantity: 1,
      unitPrice: 5000,
      taxRate: 20,
    },
    {
      description: 'Support & Maintenance - 250 users',
      quantity: 1,
      unitPrice: 2500,
      taxRate: 20,
    },
    {
      description: 'Custom Integration Development',
      quantity: 80,
      unitPrice: 125,
      taxRate: 20,
    },
  ];

  console.log('Request: Add 3 line items to invoice');
  for (const item of lineItems) {
    const addLineRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'boond_invoices_add_line',
        arguments: {
          invoiceId: invoiceId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
        },
      },
    };

    console.log(`\nAdding: ${item.description}`);
    console.log(JSON.stringify(addLineRequest, null, 2));
  }

  console.log('\nExpected response structure for each line:');
  console.log(`{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [{
      "type": "text",
      "text": "Line item added!\\n\\nDescription: Enterprise License - Monthly Subscription\\nQuantity: 1\\nUnit Price: €5,000\\nTax (20%): €1,000\\nLine Total: €6,000"
    }],
    "isError": false
  }
}`);

  console.log('\nWhat you learn:');
  console.log('✓ How to add multiple line items');
  console.log('✓ Automatic tax calculation per line');
  console.log('✓ Flexible quantity and pricing');
}

/**
 * STEP 3: Calculate invoice totals
 *
 * The system automatically calculates subtotal, tax, and final total
 * based on all line items and tax rates.
 */
async function step3CalculateTotals(invoiceId: string) {
  console.log('\n=== STEP 3: Calculate Invoice Totals ===\n');

  const calculateRequest = {
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'boond_invoices_calculate',
      arguments: {
        invoiceId: invoiceId,
      },
    },
  };

  console.log('Request: Calculate totals for all line items');
  console.log(JSON.stringify(calculateRequest, null, 2));

  console.log('\nExpected response structure:');
  console.log(`{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [{
      "type": "text",
      "text": "Invoice totals calculated!\\n\\n📊 Summary:\\nSubtotal: €10,500\\nTax (20%): €2,100\\nTotal Due: €12,600\\n\\nPayment Terms: Net 30\\nDue Date: 2026-03-01"
    }],
    "isError": false
  }
}`);

  console.log('\nWhat you learn:');
  console.log('✓ How totals are automatically calculated');
  console.log('✓ Tax aggregation across line items');
  console.log('✓ Invoice balance tracking');
}

/**
 * STEP 4: Finalize invoice
 *
 * Once all line items are added and verified, finalize the invoice
 * to lock it for payment processing. This prevents further edits.
 */
async function step4FinalizeInvoice(invoiceId: string) {
  console.log('\n=== STEP 4: Finalize Invoice ===\n');

  const finalizeRequest = {
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: {
      name: 'boond_invoices_finalize',
      arguments: {
        invoiceId: invoiceId,
        sendToCustomer: true,
      },
    },
  };

  console.log('Request: Finalize invoice for payment processing');
  console.log(JSON.stringify(finalizeRequest, null, 2));

  console.log('\nExpected response structure:');
  console.log(`{
  "jsonrpc": "2.0",
  "id": 4,
  "result": {
    "content": [{
      "type": "text",
      "text": "Invoice finalized successfully!\\n\\n✅ Status: finalized\\nInvoice Number: INV-2026-001\\nTotal Due: €12,600\\nPayment Status: unpaid\\nSent to Customer: Yes\\n\\nCustomer will receive email with PDF attachment."
    }],
    "isError": false
  }
}`);

  console.log('\nWhat you learn:');
  console.log('✓ How to finalize invoices');
  console.log('✓ Automatic customer notification');
  console.log('✓ Payment status tracking');
}

/**
 * STEP 5: Download PDF for archiving
 *
 * Generate and download the professional PDF version of the invoice
 * for customer records, archiving, and payment proof.
 */
async function step5DownloadPDF(invoiceId: string) {
  console.log('\n=== STEP 5: Download Invoice PDF ===\n');

  const pdfRequest = {
    jsonrpc: '2.0',
    id: 5,
    method: 'tools/call',
    params: {
      name: 'boond_invoices_download_pdf',
      arguments: {
        invoiceId: invoiceId,
        format: 'A4',
        includePaymentInstructions: true,
      },
    },
  };

  console.log('Request: Generate PDF of finalized invoice');
  console.log(JSON.stringify(pdfRequest, null, 2));

  console.log('\nExpected response structure:');
  console.log(`{
  "jsonrpc": "2.0",
  "id": 5,
  "result": {
    "content": [{
      "type": "text",
      "text": "PDF generated successfully!\\n\\n📄 File: INV-2026-001.pdf\\nSize: 156 KB\\nFormat: A4\\nDownload URL: https://api.boondmanager.com/downloads/INV-2026-001.pdf\\nExpires: 2026-03-01"
    }],
    "isError": false
  }
}`);

  console.log('\nWhat you learn:');
  console.log('✓ How to generate professional invoice PDFs');
  console.log('✓ Automatic payment instruction inclusion');
  console.log('✓ Direct download mechanism for archiving');
}

/**
 * WORKFLOW SUMMARY
 *
 * This billing workflow demonstrates the complete invoice lifecycle:
 * 1. Create invoice with customer and terms
 * 2. Add all products/services as line items
 * 3. Auto-calculate totals and tax
 * 4. Finalize for payment and send to customer
 * 5. Archive with PDF download
 *
 * Common next steps:
 * - Track payment status and reminders
 * - Match payments to invoices
 * - Generate aging reports
 * - Create credit notes for adjustments
 * - Reconcile accounts receivable
 */
async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║     Finance Invoice Management Workflow    ║');
  console.log('╚════════════════════════════════════════════╝');

  try {
    const invoiceId = await step1CreateInvoice();
    await step2AddLineItems(invoiceId);
    await step3CalculateTotals(invoiceId);
    await step4FinalizeInvoice(invoiceId);
    await step5DownloadPDF(invoiceId);

    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║          Workflow Complete!                ║');
    console.log('╚════════════════════════════════════════════╝');

    console.log("\nYou've learned how to:");
    console.log('✓ Create and structure invoices');
    console.log('✓ Add multiple line items with tax');
    console.log('✓ Auto-calculate totals and balances');
    console.log('✓ Finalize for payment processing');
    console.log('✓ Generate professional PDF invoices');

    console.log('\nNext steps:');
    console.log('• Automate invoice generation from contracts');
    console.log('• Implement payment tracking and reminders');
    console.log('• Build aging report dashboards');
    console.log('• Integrate with accounting software');
  } catch (error) {
    console.error('Workflow error:', error);
  }
}

main();
