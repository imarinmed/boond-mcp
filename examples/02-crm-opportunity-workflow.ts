/**
 * Example: CRM Opportunity Management Workflow
 *
 * This example demonstrates a complete sales workflow:
 * - Search companies by industry and criteria
 * - Create new opportunities for prospects
 * - Update opportunity stage as deals progress
 * - Generate quotations for opportunities
 * - Download quotations as PDF for client delivery
 *
 * This workflow is typical for sales teams managing deal pipelines
 * from prospect identification through quotation and closing.
 *
 * Tools used:
 * - boond_companies_search: Find companies by industry/keywords
 * - boond_companies_get: Retrieve company details
 * - boond_opportunities_create: Create new sales opportunity
 * - boond_opportunities_update: Update opportunity progress
 * - boond_quotations_create: Generate quotation for opportunity
 * - boond_quotations_generate_pdf: Export quotation as PDF
 *
 * Prerequisites:
 * - BoondManager account with CRM module access
 * - API token configured in BOOND_API_TOKEN environment variable
 * - Existing companies in the system to search
 */

/**
 * STEP 1: Search for companies in target industry
 *
 * We search for companies that match our target market criteria.
 * This helps sales teams identify qualified prospects to contact.
 */
async function step1SearchCompanies() {
  console.log('\n=== STEP 1: Search Companies by Industry ===\n');

  const searchRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'boond_companies_search',
      arguments: {
        industry: 'Technology',
        country: 'France',
        limit: 10,
        offset: 0,
      },
    },
  };

  console.log('Request: Search for technology companies in France');
  console.log(JSON.stringify(searchRequest, null, 2));

  console.log('\nExpected response structure:');
  console.log(`{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [{
      "type": "text",
      "text": "Found 15 company(ies) (Page 1/2 of 15 total)\\n\\n🏢 TechCorp France (ID: comp_001)...\\n\\n..."
    }],
    "isError": false
  }
}`);

  console.log('\nWhat you learn:');
  console.log('✓ How to search companies by industry and location');
  console.log('✓ Pagination for handling large prospect lists');
  console.log('✓ Company IDs are used for creating opportunities');

  return 'comp_001'; // Simulated company ID
}

/**
 * STEP 2: Get detailed company information
 *
 * Retrieve the full company profile including contact information,
 * revenue size, and existing opportunities.
 */
async function step2GetCompanyDetails(companyId: string) {
  console.log('\n=== STEP 2: Get Company Details ===\n');

  const getRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'boond_companies_get',
      arguments: {
        id: companyId,
      },
    },
  };

  console.log(`Request: Get full details for company ${companyId}`);
  console.log(JSON.stringify(getRequest, null, 2));

  console.log('\nExpected response structure:');
  console.log(`{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [{
      "type": "text",
      "text": "🏢 Company: TechCorp France\\nID: comp_001\\nRevenue: €50M+\\nEmployees: 250-500\\nIndustry: Technology\\nWebsite: www.techcorp.fr\\nMain Contact: contact@techcorp.fr..."
    }],
    "isError": false
  }
}`);

  console.log('\nWhat you learn:');
  console.log('✓ How to retrieve company profile with all details');
  console.log('✓ Company details help qualify opportunity value');
  console.log('✓ Contact information is needed for follow-up');
}

/**
 * STEP 3: Create new opportunity for the company
 *
 * Once we've identified a qualified prospect, we create an opportunity
 * record to track the sales process and deal progress.
 */
async function step3CreateOpportunity(companyId: string) {
  console.log('\n=== STEP 3: Create Sales Opportunity ===\n');

  const createRequest = {
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'boond_opportunities_create',
      arguments: {
        companyId: companyId,
        name: 'Enterprise Software License Deal',
        value: 150000,
        currency: 'EUR',
        expectedCloseDate: '2026-03-31',
        stage: 'qualification',
        description:
          'TechCorp France interested in enterprise license for 250+ users. First call scheduled.',
      },
    },
  };

  console.log('Request: Create new opportunity for TechCorp');
  console.log(JSON.stringify(createRequest, null, 2));

  console.log('\nExpected response structure:');
  console.log(`{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [{
      "type": "text",
      "text": "Opportunity created successfully!\\n\\n💼 Opportunity: Enterprise Software License Deal\\nID: opp_789\\nCompany: TechCorp France\\nValue: €150,000\\nStage: qualification\\nExpected Close: 2026-03-31..."
    }],
    "isError": false
  }
}`);

  console.log('\nWhat you learn:');
  console.log('✓ How to create opportunity records');
  console.log('✓ Opportunity value and currency tracking');
  console.log('✓ Stage management (qualification → proposal → negotiation → close)');

  return 'opp_789'; // Simulated opportunity ID
}

/**
 * STEP 4: Update opportunity stage as deal progresses
 *
 * As we move through the sales process (first call, proposal sent, etc.),
 * we update the opportunity stage to track progress toward closing.
 */
async function step4UpdateOpportunityStage(opportunityId: string) {
  console.log('\n=== STEP 4: Update Opportunity Stage ===\n');

  const updateRequest = {
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: {
      name: 'boond_opportunities_update',
      arguments: {
        id: opportunityId,
        stage: 'proposal',
        description:
          'First call completed. Client very interested. Proposal sent with pricing for 250, 500, 1000 user tiers.',
        probability: 75,
      },
    },
  };

  console.log('Request: Update opportunity to proposal stage');
  console.log(JSON.stringify(updateRequest, null, 2));

  console.log('\nExpected response structure:');
  console.log(`{
  "jsonrpc": "2.0",
  "id": 4,
  "result": {
    "content": [{
      "type": "text",
      "text": "Opportunity updated successfully!\\n\\n💼 Opportunity: Enterprise Software License Deal\\nStage: proposal\\nProbability: 75%\\nDescription: First call completed. Client very interested..."
    }],
    "isError": false
  }
}`);

  console.log('\nWhat you learn:');
  console.log('✓ How to update opportunity progress');
  console.log('✓ Probability tracking for deal forecasting');
  console.log('✓ Maintaining sales pipeline health');
}

/**
 * STEP 5: Generate quotation for the opportunity
 *
 * Create a formal quotation document that includes pricing, terms,
 * and product/service details for client delivery.
 */
async function step5GenerateQuotation(opportunityId: string) {
  console.log('\n=== STEP 5: Generate Quotation ===\n');

  const quotationRequest = {
    jsonrpc: '2.0',
    id: 5,
    method: 'tools/call',
    params: {
      name: 'boond_quotations_create',
      arguments: {
        opportunityId: opportunityId,
        validUntil: '2026-02-28',
        lineItems: [
          {
            description: 'Enterprise License - 250 users',
            quantity: 1,
            unitPrice: 50000,
            tax: 9600,
          },
          {
            description: 'Implementation & Training',
            quantity: 1,
            unitPrice: 20000,
            tax: 3840,
          },
          {
            description: 'First Year Support (24/7)',
            quantity: 1,
            unitPrice: 30000,
            tax: 5760,
          },
        ],
      },
    },
  };

  console.log('Request: Generate quotation with pricing breakdown');
  console.log(JSON.stringify(quotationRequest, null, 2));

  console.log('\nExpected response structure:');
  console.log(`{
  "jsonrpc": "2.0",
  "id": 5,
  "result": {
    "content": [{
      "type": "text",
      "text": "Quotation created successfully!\\n\\nQuotation: QT-2026-001\\nOpportunity: Enterprise Software License Deal\\nSubtotal: €100,000\\nTax: €19,200\\nTotal: €119,200\\nValid Until: 2026-02-28..."
    }],
    "isError": false
  }
}`);

  console.log('\nWhat you learn:');
  console.log('✓ How to create quotations with line items');
  console.log('✓ Tax calculation for different services');
  console.log('✓ Quotation validity dates for deal tracking');

  return 'QT-2026-001'; // Simulated quotation ID
}

/**
 * STEP 6: Generate PDF for client delivery
 *
 * Export the quotation as a professional PDF document that can be
 * sent directly to the prospect for review and signing.
 */
async function step6GeneratePDF(quotationId: string) {
  console.log('\n=== STEP 6: Generate Quotation PDF ===\n');

  const pdfRequest = {
    jsonrpc: '2.0',
    id: 6,
    method: 'tools/call',
    params: {
      name: 'boond_quotations_generate_pdf',
      arguments: {
        id: quotationId,
        format: 'A4',
        language: 'fr',
      },
    },
  };

  console.log('Request: Generate PDF of quotation for client delivery');
  console.log(JSON.stringify(pdfRequest, null, 2));

  console.log('\nExpected response structure:');
  console.log(`{
  "jsonrpc": "2.0",
  "id": 6,
  "result": {
    "content": [{
      "type": "text",
      "text": "PDF generated successfully!\\n\\nFile: QT-2026-001.pdf\\nSize: 245 KB\\nLanguage: French\\nDownload URL: https://api.boondmanager.com/downloads/QT-2026-001.pdf\\nExpires: 2026-02-28"
    }],
    "isError": false
  }
}`);

  console.log('\nWhat you learn:');
  console.log('✓ How to generate professional PDF quotations');
  console.log('✓ Multi-language support for international clients');
  console.log('✓ Direct delivery mechanism for client communications');
}

/**
 * WORKFLOW SUMMARY
 *
 * This sales workflow demonstrates the complete opportunity lifecycle:
 * 1. Identify qualified prospects via company search
 * 2. Review company details and fit
 * 3. Create opportunity record for tracking
 * 4. Progress through sales stages (qualification → proposal → negotiation)
 * 5. Generate formal quotations with pricing
 * 6. Export for client delivery
 *
 * Common next steps:
 * - Send PDF via email with follow-up scheduling
 * - Track email opens and quotation views
 * - Update stage to "negotiation" when client responds
 * - Create contract once quotation is accepted
 * - Generate invoice for delivery
 */
async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   CRM Opportunity Management Workflow      ║');
  console.log('╚════════════════════════════════════════════╝');

  try {
    const companyId = await step1SearchCompanies();
    await step2GetCompanyDetails(companyId);
    const opportunityId = await step3CreateOpportunity(companyId);
    await step4UpdateOpportunityStage(opportunityId);
    const quotationId = await step5GenerateQuotation(opportunityId);
    await step6GeneratePDF(quotationId);

    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║          Workflow Complete!                ║');
    console.log('╚════════════════════════════════════════════╝');

    console.log("\nYou've learned how to:");
    console.log('✓ Search and qualify companies');
    console.log('✓ Create sales opportunities');
    console.log('✓ Track opportunity progress through pipeline');
    console.log('✓ Generate professional quotations');
    console.log('✓ Export quotations as PDF for delivery');

    console.log('\nNext steps:');
    console.log('• Automate prospect research with company data');
    console.log('• Create email templates for quotation delivery');
    console.log('• Build dashboards for sales pipeline visibility');
    console.log('• Track quotation performance metrics');
  } catch (error) {
    console.error('Workflow error:', error);
  }
}

main();
