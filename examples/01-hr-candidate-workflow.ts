/**
 * Example: HR Candidate Management Workflow
 *
 * This example demonstrates a complete recruiting workflow:
 * - Search candidates by skills and criteria
 * - Retrieve detailed candidate information
 * - Create a contact record from candidate data
 * - Update candidate status as they progress through pipeline
 *
 * This workflow is typical for recruiting teams managing candidate pipelines
 * from initial search through to hiring.
 *
 * Tools used:
 * - boond_candidates_search: Find candidates by keywords/skills
 * - boond_candidates_get: Retrieve full candidate details
 * - boond_contacts_create: Create contact record for candidate
 * - boond_candidates_update: Update candidate status and notes
 * - boond_resources_search: Search existing team resources
 *
 * Prerequisites:
 * - BoondManager account with HR module access
 * - API token configured in BOOND_API_TOKEN environment variable
 * - Existing candidates in the system to search
 */

/**
 * STEP 1: Search candidates by skills
 *
 * This step demonstrates finding candidates who have specific technical skills.
 * We're looking for TypeScript developers in the available candidate pool.
 */
async function step1SearchCandidates() {
  console.log('\n=== STEP 1: Search Candidates by Skills ===\n');

  const searchRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'boond_candidates_search',
      arguments: {
        keywords: 'TypeScript',
        limit: 10,
        offset: 0,
      },
    },
  };

  console.log('Request: Search for candidates with TypeScript skills');
  console.log(JSON.stringify(searchRequest, null, 2));

  console.log('\nExpected response structure:');
  console.log(`{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [{
      "type": "text",
      "text": "Found 3 candidate(s) (Page 1/1 of 3 total)\\n\\n📋 John Smith (ID: cand_123)...\\n\\n..."
    }],
    "isError": false
  }
}`);

  console.log('\nWhat you learn:');
  console.log('✓ How to search candidates by skills');
  console.log('✓ Pagination parameters (limit, offset)');
  console.log('✓ Response format contains candidate IDs for next steps');

  return 'cand_123'; // Simulated ID for next step
}

/**
 * STEP 2: Get detailed candidate information
 *
 * Now we retrieve the full profile of the top candidate to review
 * qualifications, experience, and contact information.
 */
async function step2GetCandidateDetails(candidateId: string) {
  console.log('\n=== STEP 2: Get Candidate Details ===\n');

  const getRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'boond_candidates_get',
      arguments: {
        id: candidateId,
      },
    },
  };

  console.log(`Request: Get full details for candidate ${candidateId}`);
  console.log(JSON.stringify(getRequest, null, 2));

  console.log('\nExpected response structure:');
  console.log(`{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [{
      "type": "text",
      "text": "📋 Candidate: John Smith\\nID: cand_123\\nEmail: john@example.com\\nPhone: +1-555-0123\\nSkills: TypeScript, React, Node.js\\nExperience: 5 years..."
    }],
    "isError": false
  }
}`);

  console.log('\nWhat you learn:');
  console.log('✓ How to retrieve full candidate profile');
  console.log('✓ Candidate details include contact info, skills, experience');
  console.log('✓ Use this ID for creating contacts or updating records');
}

/**
 * STEP 3: Create contact record from candidate
 *
 * Once we decide to interview this candidate, we create a formal contact
 * record in the CRM to track all future interactions and communications.
 */
async function step3CreateContact(candidateId: string) {
  console.log('\n=== STEP 3: Create Contact from Candidate ===\n');

  const createContactRequest = {
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'boond_contacts_create',
      arguments: {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john@example.com',
        phone: '+1-555-0123',
        company: "John's Current Company",
        title: 'Senior Software Engineer',
        notes: `Candidate ID: ${candidateId}. Skills: TypeScript, React, Node.js. 5 years experience. Referred via skills search.`,
      },
    },
  };

  console.log('Request: Create contact record for promising candidate');
  console.log(JSON.stringify(createContactRequest, null, 2));

  console.log('\nExpected response structure:');
  console.log(`{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [{
      "type": "text",
      "text": "Contact created successfully!\\n\\n👤 Contact: John Smith\\nID: contact_456\\nEmail: john@example.com\\nPhone: +1-555-0123..."
    }],
    "isError": false
  }
}`);

  console.log('\nWhat you learn:');
  console.log('✓ How to bridge candidate and contact management');
  console.log('✓ Include candidate ID in notes for traceability');
  console.log('✓ Contact record enables email tracking and scheduling');
}

/**
 * STEP 4: Update candidate status as they progress
 *
 * After the interview, we update the candidate's status to reflect
 * their progress in the hiring pipeline.
 */
async function step4UpdateCandidateStatus(candidateId: string) {
  console.log('\n=== STEP 4: Update Candidate Status ===\n');

  const updateRequest = {
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: {
      name: 'boond_candidates_update',
      arguments: {
        id: candidateId,
        status: 'interview_scheduled',
        notes:
          'First technical interview scheduled for Monday 2PM. Reviewed TypeScript expertise - excellent fit.',
      },
    },
  };

  console.log('Request: Update candidate status after interview scheduling');
  console.log(JSON.stringify(updateRequest, null, 2));

  console.log('\nExpected response structure:');
  console.log(`{
  "jsonrpc": "2.0",
  "id": 4,
  "result": {
    "content": [{
      "type": "text",
      "text": "Candidate updated successfully!\\n\\n📋 Candidate: John Smith\\nStatus: interview_scheduled\\nNotes: First technical interview scheduled..."
    }],
    "isError": false
  }
}`);

  console.log('\nWhat you learn:');
  console.log('✓ How to update candidate status in pipeline');
  console.log('✓ Status transitions: new → screening → interview → offer → hired');
  console.log('✓ Always add notes to maintain recruiting history');
}

/**
 * STEP 5: Search for team resources (existing employees)
 *
 * Before making a final offer, verify the team structure and
 * find similar resource profiles to understand comparable levels.
 */
async function step5VerifyTeamResources() {
  console.log('\n=== STEP 5: Verify Team Resources ===\n');

  const resourceRequest = {
    jsonrpc: '2.0',
    id: 5,
    method: 'tools/call',
    params: {
      name: 'boond_resources_search',
      arguments: {
        keywords: 'TypeScript',
        limit: 5,
      },
    },
  };

  console.log('Request: Find existing team members with TypeScript skills');
  console.log(JSON.stringify(resourceRequest, null, 2));

  console.log('\nExpected response structure:');
  console.log(`{
  "jsonrpc": "2.0",
  "id": 5,
  "result": {
    "content": [{
      "type": "text",
      "text": "Found 2 resource(s)...\\n\\n👨‍💼 Alice Johnson (Resource ID: res_001)...\\n\\n..."
    }],
    "isError": false
  }
}`);

  console.log('\nWhat you learn:');
  console.log('✓ How to search existing team resources');
  console.log('✓ Compare candidate to existing similar roles');
  console.log('✓ Helps with salary benchmarking and role fit');
}

/**
 * WORKFLOW SUMMARY
 *
 * This recruiting workflow demonstrates the complete candidate journey:
 * 1. Search for candidates with needed skills
 * 2. Review detailed candidate profiles
 * 3. Create contact records for promising candidates
 * 4. Track status updates as candidates progress
 * 5. Reference team resources for benchmarking
 *
 * Common next steps:
 * - Schedule interviews using calendar integration
 * - Send offer documents
 * - Create contract records
 * - Assign to projects once hired
 */
async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║  HR Candidate Management Workflow Example  ║');
  console.log('╚════════════════════════════════════════════╝');

  try {
    await step1SearchCandidates();
    await step2GetCandidateDetails('cand_123');
    await step3CreateContact('cand_123');
    await step4UpdateCandidateStatus('cand_123');
    await step5VerifyTeamResources();

    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║          Workflow Complete!                ║');
    console.log('╚════════════════════════════════════════════╝');

    console.log("\nYou've learned how to:");
    console.log('✓ Search candidates by skills');
    console.log('✓ Retrieve detailed candidate profiles');
    console.log('✓ Create contact records from candidates');
    console.log('✓ Update candidate status through hiring pipeline');
    console.log('✓ Verify team structure with resources');

    console.log('\nNext steps:');
    console.log('• Automate candidate screening with AI analysis');
    console.log('• Create contracts for hired candidates');
    console.log('• Schedule interviews using calendar tools');
    console.log('• Track hiring metrics and pipeline health');
  } catch (error) {
    console.error('Workflow error:', error);
  }
}

main();
