/**
 * Example: Project Management Workflow
 *
 * This example demonstrates a complete project lifecycle:
 * - Create new project with scope and timeline
 * - Add project deliveries (major milestones)
 * - Create project actions/tasks with assignments
 * - Update project and action status
 * - Track overall project progress
 *
 * This workflow is typical for project managers organizing
 * work and tracking delivery across teams.
 *
 * Tools used:
 * - boond_projects_create: Create new project
 * - boond_projects_get: Retrieve project details
 * - boond_projects_update: Update project status
 * - boond_deliveries_create: Add project deliveries
 * - boond_actions_create: Create project tasks
 * - boond_actions_update: Update task status
 *
 * Prerequisites:
 * - BoondManager account with Projects module access
 * - API token configured in BOOND_API_TOKEN environment variable
 * - Team members assigned to organization
 */

/**
 * STEP 1: Create new project
 *
 * Initialize a new project with name, description, timeline,
 * and budget information.
 */
async function step1CreateProject() {
  console.log('\n=== STEP 1: Create New Project ===\n');

  const createRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'boond_projects_create',
      arguments: {
        name: 'Enterprise Portal Redesign',
        description: 'Complete redesign of customer-facing portal with modern UI/UX',
        startDate: '2026-02-01',
        endDate: '2026-05-31',
        budget: 75000,
        currency: 'EUR',
        status: 'active',
        clientId: 'comp_001',
      },
    },
  };

  console.log('Request: Create new enterprise project');
  console.log(JSON.stringify(createRequest, null, 2));

  console.log('\nExpected response structure:');
  console.log(`{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [{
      "type": "text",
      "text": "Project created successfully!\\n\\n📋 Project: Enterprise Portal Redesign\\nID: proj_2001\\nClient: TechCorp France\\nBudget: €75,000\\nTimeline: 2026-02-01 to 2026-05-31\\nStatus: active..."
    }],
    "isError": false
  }
}`);

  console.log('\nWhat you learn:');
  console.log('✓ How to create projects with timeline and budget');
  console.log('✓ Project status tracking');
  console.log('✓ Client association for billing');

  return 'proj_2001'; // Simulated project ID
}

/**
 * STEP 2: Add project deliveries (milestones)
 *
 * Define major deliverables/milestones that break the project
 * into manageable phases with completion targets.
 */
async function step2AddDeliveries(projectId: string) {
  console.log('\n=== STEP 2: Add Project Deliveries ===\n');

  const deliveries = [
    {
      name: 'Design & Wireframes',
      dueDate: '2026-02-28',
      description: 'UI/UX design and interactive wireframes approved by stakeholders',
    },
    {
      name: 'Frontend Development',
      dueDate: '2026-04-15',
      description: 'Implement responsive frontend with React and modern CSS',
    },
    {
      name: 'Backend Integration & Testing',
      dueDate: '2026-05-15',
      description: 'API integration, security hardening, and comprehensive testing',
    },
    {
      name: 'Deployment & Training',
      dueDate: '2026-05-31',
      description: 'Production deployment and user training',
    },
  ];

  console.log('Request: Add 4 major deliveries to project');
  for (const delivery of deliveries) {
    const deliveryRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'boond_deliveries_create',
        arguments: {
          projectId: projectId,
          name: delivery.name,
          dueDate: delivery.dueDate,
          description: delivery.description,
        },
      },
    };

    console.log(`\nAdding: ${delivery.name}`);
    console.log(JSON.stringify(deliveryRequest, null, 2));
  }

  console.log('\nExpected response for each delivery:');
  console.log(`{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [{
      "type": "text",
      "text": "Delivery created!\\n\\n📦 Delivery: Design & Wireframes\\nID: deliv_001\\nDue: 2026-02-28\\nStatus: pending"
    }],
    "isError": false
  }
}`);

  console.log('\nWhat you learn:');
  console.log('✓ How to break projects into deliverables');
  console.log('✓ Milestone-based tracking');
  console.log('✓ Dependency planning');
}

/**
 * STEP 3: Create project actions/tasks
 *
 * Add individual actions (tasks) to deliveries with assignments,
 * descriptions, and dependencies.
 */
async function step3CreateActions(projectId: string) {
  console.log('\n=== STEP 3: Create Project Actions/Tasks ===\n');

  const actions = [
    {
      title: 'Competitive analysis and requirements gathering',
      assignee: 'res_001',
      dueDate: '2026-02-07',
      priority: 'high',
    },
    {
      title: 'Create wireframes for main pages',
      assignee: 'res_002',
      dueDate: '2026-02-21',
      priority: 'high',
    },
    {
      title: 'Gather design feedback from stakeholders',
      assignee: 'res_001',
      dueDate: '2026-02-28',
      priority: 'medium',
    },
  ];

  console.log('Request: Add 3 project actions to design delivery');
  for (const action of actions) {
    const actionRequest = {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'boond_actions_create',
        arguments: {
          projectId: projectId,
          title: action.title,
          assigneeId: action.assignee,
          dueDate: action.dueDate,
          priority: action.priority,
          description: `Task for Enterprise Portal Redesign project - Phase 1: Design`,
        },
      },
    };

    console.log(`\nAdding: ${action.title}`);
    console.log(JSON.stringify(actionRequest, null, 2));
  }

  console.log('\nExpected response for each action:');
  console.log(`{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [{
      "type": "text",
      "text": "Action created!\\n\\n✓ Action: Competitive analysis and requirements gathering\\nID: action_001\\nAssignee: John Smith\\nDue: 2026-02-07\\nPriority: high\\nStatus: assigned"
    }],
    "isError": false
  }
}`);

  console.log('\nWhat you learn:');
  console.log('✓ How to create individual tasks with assignments');
  console.log('✓ Priority and deadline management');
  console.log('✓ Task distribution to team members');
}

/**
 * STEP 4: Update project status
 *
 * As the project progresses, update overall status and
 * track percent complete.
 */
async function step4UpdateProjectStatus(projectId: string) {
  console.log('\n=== STEP 4: Update Project Status ===\n');

  const updateRequest = {
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: {
      name: 'boond_projects_update',
      arguments: {
        projectId: projectId,
        status: 'in_progress',
        percentComplete: 35,
        notes:
          'Design phase 60% complete. Wireframes approved by client. Starting frontend development planning.',
      },
    },
  };

  console.log('Request: Update project with progress');
  console.log(JSON.stringify(updateRequest, null, 2));

  console.log('\nExpected response structure:');
  console.log(`{
  "jsonrpc": "2.0",
  "id": 4,
  "result": {
    "content": [{
      "type": "text",
      "text": "Project updated!\\n\\n📊 Enterprise Portal Redesign\\nStatus: in_progress\\nProgress: 35% complete\\nCurrent Phase: Design finalization, Frontend kickoff planning..."
    }],
    "isError": false
  }
}`);

  console.log('\nWhat you learn:');
  console.log('✓ How to track project progress');
  console.log('✓ Status transitions (planning → in_progress → testing → complete)');
  console.log('✓ Progress visibility for stakeholders');
}

/**
 * STEP 5: Update action status
 *
 * Mark individual tasks complete as team members finish work,
 * automatically updating overall project progress.
 */
async function step5UpdateActionStatus() {
  console.log('\n=== STEP 5: Update Action Status ===\n');

  const completedActions = [
    'action_001', // Competitive analysis
    'action_002', // Wireframes
  ];

  for (const actionId of completedActions) {
    const updateRequest = {
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'boond_actions_update',
        arguments: {
          actionId: actionId,
          status: 'completed',
          percentComplete: 100,
          completedDate: '2026-02-21',
        },
      },
    };

    console.log(`\nMarketing action ${actionId} as complete`);
    console.log(JSON.stringify(updateRequest, null, 2));
  }

  console.log('\nExpected response for each action completion:');
  console.log(`{
  "jsonrpc": "2.0",
  "id": 5,
  "result": {
    "content": [{
      "type": "text",
      "text": "Action completed!\\n\\n✅ Competitive analysis and requirements gathering\\nStatus: completed\\nCompleted: 2026-02-21\\nAssignee: John Smith\\nProject Progress Updated: 40% complete"
    }],
    "isError": false
  }
}`);

  console.log('\nWhat you learn:');
  console.log('✓ How to mark tasks complete');
  console.log('✓ Automatic project progress calculation');
  console.log('✓ Team productivity tracking');
}

/**
 * WORKFLOW SUMMARY
 *
 * This project management workflow demonstrates full project lifecycle:
 * 1. Create project with timeline and budget
 * 2. Define major deliveries/milestones
 * 3. Create and assign individual tasks
 * 4. Track overall project progress
 * 5. Update task status as work completes
 *
 * Common next steps:
 * - Generate project reports and dashboards
 * - Track resource allocation and utilization
 * - Monitor budget vs. actuals
 * - Manage project risks and issues
 * - Create templates for recurring project types
 */
async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║    Project Management Workflow Example     ║');
  console.log('╚════════════════════════════════════════════╝');

  try {
    const projectId = await step1CreateProject();
    await step2AddDeliveries(projectId);
    await step3CreateActions(projectId);
    await step4UpdateProjectStatus(projectId);
    await step5UpdateActionStatus();

    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║          Workflow Complete!                ║');
    console.log('╚════════════════════════════════════════════╝');

    console.log("\nYou've learned how to:");
    console.log('✓ Create and structure projects');
    console.log('✓ Define project deliverables');
    console.log('✓ Create and assign tasks');
    console.log('✓ Track project progress');
    console.log('✓ Update task status');

    console.log('\nNext steps:');
    console.log('• Build resource allocation dashboards');
    console.log('• Implement project templates');
    console.log('• Create budget tracking reports');
    console.log('• Integrate project calendar with team scheduling');
  } catch (error) {
    console.error('Workflow error:', error);
  }
}

main();
