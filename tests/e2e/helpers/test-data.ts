export const generateTimestamp = () => new Date().toISOString().replace(/[:.]/g, '-');

export const generateTestId = () =>
  `test-${generateTimestamp()}-${Math.random().toString(36).substring(2, 7)}`;

export function createTestCandidate() {
  return {
    firstName: `Test-${generateTimestamp()}`,
    lastName: 'Candidate',
    email: `test-${generateTimestamp()}@example.com`,
    phone: '+33 1 23 45 67 89',
    status: 'active' as const,
    address: '123 Test Street',
    city: 'Paris',
    country: 'France',
  };
}

export function createTestCompany() {
  return {
    name: `Test Company ${generateTimestamp()}`,
    type: 'client' as const,
    address: '456 Business Ave',
    city: 'Paris',
    country: 'France',
  };
}

export function createTestContact(companyId: string) {
  return {
    firstName: `Test-${generateTimestamp()}`,
    lastName: 'Contact',
    email: `contact-${generateTimestamp()}@example.com`,
    phone: '+33 1 23 45 67 90',
    companyId,
    jobTitle: 'Test Manager',
    department: 'Testing',
  };
}

export function createTestResource() {
  return {
    firstName: `Test-${generateTimestamp()}`,
    lastName: 'Resource',
    email: `resource-${generateTimestamp()}@example.com`,
    phone: '+33 1 23 45 67 91',
    status: 'active' as const,
    department: 'Engineering',
    skills: ['TypeScript', 'Testing'],
    hourlyRate: 100,
  };
}

export function createTestProject(companyId: string) {
  return {
    name: `Test Project ${generateTimestamp()}`,
    status: 'active' as const,
    companyId,
    description: 'Test project for E2E validation',
    budget: 50000,
  };
}

export function createTestOpportunity(companyId: string) {
  return {
    name: `Test Opportunity ${generateTimestamp()}`,
    companyId,
    status: 'lead' as const,
    value: 100000,
    probability: 50,
    description: 'Test opportunity for E2E validation',
  };
}

export function createTestInvoice(companyId: string) {
  return {
    companyId,
    total: 5000,
    description: `Test Invoice ${generateTimestamp()}`,
    issuedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

export function createTestAbsence(resourceId: string) {
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

  return {
    resourceId,
    type: 'vacation' as const,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    reason: 'Test absence for E2E validation',
  };
}

export function createTestExpenseReport(resourceId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    resourceId,
    total: 250,
    period: {
      startDate: startOfMonth.toISOString(),
      endDate: endOfMonth.toISOString(),
    },
    description: 'Test expense report',
  };
}
