import type {
  Candidate,
  Company,
  Contact,
  Resource,
  Contract,
  Opportunity,
  Quotation,
  Project,
  Delivery,
  Action,
  Invoice,
  Purchase,
  Order,
  BankingAccount,
  BankingTransaction,
  TimeReport,
  Absence,
  ExpenseReport,
  Agency,
  BusinessUnit,
  Account,
  Document,
  App,
  Setting,
  Alert,
  SearchResponse,
} from '../../src/types/boond.js';

export const generateId = () => `mock-${Math.random().toString(36).substring(2, 9)}`;
export const generateDate = () => new Date().toISOString();

export const mockCandidate = (overrides?: Partial<Candidate>): Candidate => ({
  id: generateId(),
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+33 1 23 45 67 89',
  status: 'active',
  address: '123 Main St',
  city: 'Paris',
  country: 'France',
  createdAt: generateDate(),
  updatedAt: generateDate(),
  ...overrides,
});

export const mockCompany = (overrides?: Partial<Company>): Company => ({
  id: generateId(),
  name: 'Acme Corporation',
  type: 'client',
  address: '456 Business Ave',
  city: 'Paris',
  country: 'France',
  contacts: [],
  createdAt: generateDate(),
  updatedAt: generateDate(),
  ...overrides,
});

export const mockContact = (overrides?: Partial<Contact>): Contact => ({
  id: generateId(),
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@example.com',
  phone: '+33 1 23 45 67 90',
  companyId: 'comp-123',
  jobTitle: 'HR Manager',
  department: 'Human Resources',
  createdAt: generateDate(),
  updatedAt: generateDate(),
  ...overrides,
});

export const mockResource = (overrides?: Partial<Resource>): Resource => ({
  id: generateId(),
  firstName: 'Alice',
  lastName: 'Johnson',
  email: 'alice.johnson@example.com',
  phone: '+33 1 23 45 67 91',
  status: 'active',
  department: 'Engineering',
  skills: ['TypeScript', 'React', 'Node.js'],
  hourlyRate: 75,
  createdAt: generateDate(),
  updatedAt: generateDate(),
  ...overrides,
});

export const mockContract = (overrides?: Partial<Contract>): Contract => ({
  id: generateId(),
  resourceId: 'res-123',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  type: 'full-time',
  status: 'active',
  hourlyRate: 75,
  createdAt: generateDate(),
  updatedAt: generateDate(),
  ...overrides,
});

export const mockOpportunity = (overrides?: Partial<Opportunity>): Opportunity => ({
  id: generateId(),
  name: 'Senior Developer Position',
  companyId: 'comp-123',
  contactId: 'cont-123',
  status: 'qualified',
  value: 100000,
  probability: 75,
  expectedCloseDate: generateDate(),
  description: 'Looking for a senior full-stack developer',
  createdAt: generateDate(),
  updatedAt: generateDate(),
  ...overrides,
});

export const mockQuotation = (overrides?: Partial<Quotation>): Quotation => ({
  id: generateId(),
  opportunityId: 'opp-123',
  companyId: 'comp-123',
  total: 50000,
  status: 'sent',
  sentAt: generateDate(),
  validUntil: generateDate(),
  description: 'Quote for development services',
  createdAt: generateDate(),
  updatedAt: generateDate(),
  ...overrides,
});

export const mockProject = (overrides?: Partial<Project>): Project => ({
  id: generateId(),
  name: 'Website Redesign',
  status: 'active',
  companyId: 'comp-123',
  startDate: generateDate(),
  endDate: generateDate(),
  description: 'Complete website redesign project',
  budget: 75000,
  createdAt: generateDate(),
  updatedAt: generateDate(),
  ...overrides,
});

export const mockDelivery = (overrides?: Partial<Delivery>): Delivery => ({
  id: generateId(),
  projectId: 'proj-123',
  name: 'Phase 1 Delivery',
  status: 'completed',
  description: 'Initial mockups and wireframes',
  dueDate: '2024-03-15',
  createdAt: generateDate(),
  updatedAt: generateDate(),
  ...overrides,
});

export const mockAction = (overrides?: Partial<Action>): Action => ({
  id: generateId(),
  projectId: 'proj-123',
  name: 'Review Code',
  status: 'open',
  assignedTo: 'res-123',
  dueDate: '2024-03-20',
  priority: 'high',
  description: 'Review pull request #42',
  createdAt: generateDate(),
  updatedAt: generateDate(),
  ...overrides,
});

export const mockInvoice = (overrides?: Partial<Invoice>): Invoice => ({
  id: generateId(),
  companyId: 'comp-123',
  total: 25000,
  status: 'issued',
  issuedAt: generateDate(),
  paidAt: undefined,
  dueDate: generateDate(),
  description: 'Invoice for Q1 services',
  createdAt: generateDate(),
  updatedAt: generateDate(),
  ...overrides,
});

export const mockPurchase = (overrides?: Partial<Purchase>): Purchase => ({
  id: generateId(),
  companyId: 'comp-123',
  total: 5000,
  status: 'received',
  orderedAt: generateDate(),
  receivedAt: generateDate(),
  createdAt: generateDate(),
  updatedAt: generateDate(),
  ...overrides,
});

export const mockOrder = (overrides?: Partial<Order>): Order => ({
  id: generateId(),
  companyId: 'comp-123',
  projectId: 'proj-123',
  total: 15000,
  status: 'delivered',
  createdAt: generateDate(),
  updatedAt: generateDate(),
  ...overrides,
});

export const mockBankingAccount = (overrides?: Partial<BankingAccount>): BankingAccount => ({
  id: generateId(),
  name: 'Main Account',
  bankName: 'BNP Paribas',
  accountNumber: 'FR7612345678901234567890123',
  balance: 50000,
  currency: 'EUR',
  createdAt: generateDate(),
  updatedAt: generateDate(),
  ...overrides,
});

export const mockBankingTransaction = (
  overrides?: Partial<BankingTransaction>
): BankingTransaction => ({
  id: generateId(),
  accountId: 'acc-123',
  amount: 1000,
  type: 'credit',
  date: generateDate(),
  description: 'Client payment',
  reference: 'INV-001',
  createdAt: generateDate(),
  ...overrides,
});

export const mockTimeReport = (overrides?: Partial<TimeReport>): TimeReport => ({
  id: generateId(),
  resourceId: 'res-123',
  date: generateDate(),
  hours: 8,
  projectId: 'proj-123',
  status: 'approved',
  description: 'Worked on feature implementation',
  createdAt: generateDate(),
  updatedAt: generateDate(),
  ...overrides,
});

export const mockAbsence = (overrides?: Partial<Absence>): Absence => ({
  id: generateId(),
  resourceId: 'res-123',
  type: 'vacation',
  startDate: generateDate(),
  endDate: generateDate(),
  status: 'approved',
  reason: 'Summer vacation',
  createdAt: generateDate(),
  updatedAt: generateDate(),
  ...overrides,
});

export const mockExpenseReport = (overrides?: Partial<ExpenseReport>): ExpenseReport => ({
  id: generateId(),
  resourceId: 'res-123',
  status: 'submitted',
  total: 350.5,
  period: {
    startDate: generateDate(),
    endDate: generateDate(),
  },
  createdAt: generateDate(),
  updatedAt: generateDate(),
  ...overrides,
});

export const mockAgency = (overrides?: Partial<Agency>): Agency => ({
  id: generateId(),
  name: 'Paris Agency',
  address: '123 Agency St',
  city: 'Paris',
  country: 'France',
  createdAt: generateDate(),
  updatedAt: generateDate(),
  ...overrides,
});

export const mockBusinessUnit = (overrides?: Partial<BusinessUnit>): BusinessUnit => ({
  id: generateId(),
  name: 'Engineering Division',
  parentId: undefined,
  managerId: 'res-123',
  createdAt: generateDate(),
  updatedAt: generateDate(),
  ...overrides,
});

export const mockAccount = (overrides?: Partial<Account>): Account => ({
  id: generateId(),
  username: 'admin_user',
  email: 'admin@example.com',
  role: 'admin',
  status: 'active',
  createdAt: generateDate(),
  updatedAt: generateDate(),
  ...overrides,
});

export const mockDocument = (overrides?: Partial<Document>): Document => ({
  id: generateId(),
  name: 'Contract.pdf',
  type: 'application/pdf',
  size: 1024000,
  uploadedAt: generateDate(),
  uploadedBy: 'user-123',
  url: 'https://example.com/docs/contract.pdf',
  folderId: 'folder-123',
  createdAt: generateDate(),
  updatedAt: generateDate(),
  ...overrides,
});

export const mockApp = (overrides?: Partial<App>): App => ({
  id: generateId(),
  name: 'BoondManager',
  type: 'extension',
  status: 'active',
  createdAt: generateDate(),
  updatedAt: generateDate(),
  ...overrides,
});

export const mockSetting = (overrides?: Partial<Setting>): Setting => ({
  id: generateId(),
  key: 'theme',
  value: 'dark',
  category: 'appearance',
  createdAt: generateDate(),
  updatedAt: generateDate(),
  ...overrides,
});

export const mockAlert = (overrides?: Partial<Alert>): Alert => ({
  id: generateId(),
  type: 'info',
  message: 'A new candidate has applied',
  severity: 'low',
  createdAt: generateDate(),
  ...overrides,
});

export function createSearchResponse<T>(
  data: T[],
  page: number = 1,
  limit: number = 20,
  total?: number
): SearchResponse<T> {
  const actualTotal = total ?? data.length;
  return {
    data,
    pagination: { page, limit, total: actualTotal },
  };
}

export interface MockAPICall {
  method: string;
  args: unknown[];
  timestamp: number;
}

export class MockBoondAPIClient {
  calls: MockAPICall[] = [];
  shouldFail: boolean = false;
  failureError: Error = new Error('Mock API Error');
  delay: number = 0;
  private entities: Map<string, Map<string, unknown>> = new Map();

  constructor() {
    const domains = [
      'candidates',
      'companies',
      'contacts',
      'resources',
      'contracts',
      'opportunities',
      'quotations',
      'projects',
      'deliveries',
      'actions',
      'invoices',
      'purchases',
      'orders',
      'timeReports',
      'absences',
      'expenseReports',
      'agencies',
      'businessUnits',
      'accounts',
      'documents',
      'apps',
      'settings',
      'alerts',
    ];
    domains.forEach(domain => {
      this.entities.set(domain, new Map());
    });
  }

  private recordCall(method: string, args: unknown[]): void {
    this.calls.push({ method, args, timestamp: Date.now() });
  }

  private async simulateDelay(): Promise<void> {
    if (this.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.delay));
    }
  }

  private maybeThrow(): void {
    if (this.shouldFail) {
      throw this.failureError;
    }
  }

  private getStore(domain: string): Map<string, unknown> {
    return this.entities.get(domain)!;
  }

  reset(): void {
    this.calls = [];
    this.shouldFail = false;
    this.failureError = new Error('Mock API Error');
    this.delay = 0;
    this.entities.forEach(store => store.clear());
  }

  setFailure(error?: Error): void {
    this.shouldFail = true;
    if (error) {
      this.failureError = error;
    }
  }

  setDelay(ms: number): void {
    this.delay = ms;
  }

  async searchCandidates(params: {
    query?: string;
    page?: number;
    limit?: number;
  }): Promise<SearchResponse<Candidate>> {
    this.recordCall('searchCandidates', [params]);
    await this.simulateDelay();
    this.maybeThrow();
    const candidates = Array.from({ length: 5 }, () => mockCandidate());
    return createSearchResponse(candidates, params.page, params.limit);
  }

  async getCandidate(id: string): Promise<Candidate> {
    this.recordCall('getCandidate', [id]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockCandidate({ id });
  }

  async createCandidate(data: Partial<Candidate>): Promise<Candidate> {
    this.recordCall('createCandidate', [data]);
    await this.simulateDelay();
    this.maybeThrow();
    const candidate = mockCandidate(data);
    this.getStore('candidates').set(candidate.id, candidate);
    return candidate;
  }

  async updateCandidate(id: string, data: Partial<Candidate>): Promise<Candidate> {
    this.recordCall('updateCandidate', [id, data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockCandidate({ id, ...data });
  }

  async deleteCandidate(id: string): Promise<void> {
    this.recordCall('deleteCandidate', [id]);
    await this.simulateDelay();
    this.maybeThrow();
    this.getStore('candidates').delete(id);
  }

  async searchContacts(params: {
    query?: string;
    page?: number;
    limit?: number;
  }): Promise<SearchResponse<Contact>> {
    this.recordCall('searchContacts', [params]);
    await this.simulateDelay();
    this.maybeThrow();
    return createSearchResponse(
      Array.from({ length: 5 }, () => mockContact()),
      params.page,
      params.limit
    );
  }

  async getContact(id: string): Promise<Contact> {
    this.recordCall('getContact', [id]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockContact({ id });
  }

  async createContact(data: Partial<Contact>): Promise<Contact> {
    this.recordCall('createContact', [data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockContact(data);
  }

  async updateContact(id: string, data: Partial<Contact>): Promise<Contact> {
    this.recordCall('updateContact', [id, data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockContact({ id, ...data });
  }

  async deleteContact(id: string): Promise<void> {
    this.recordCall('deleteContact', [id]);
    await this.simulateDelay();
    this.maybeThrow();
  }

  async searchResources(params: {
    query?: string;
    page?: number;
    limit?: number;
  }): Promise<SearchResponse<Resource>> {
    this.recordCall('searchResources', [params]);
    await this.simulateDelay();
    this.maybeThrow();
    return createSearchResponse(
      Array.from({ length: 5 }, () => mockResource()),
      params.page,
      params.limit
    );
  }

  async getResource(id: string): Promise<Resource> {
    this.recordCall('getResource', [id]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockResource({ id });
  }

  async createResource(data: Partial<Resource>): Promise<Resource> {
    this.recordCall('createResource', [data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockResource(data);
  }

  async updateResource(id: string, data: Partial<Resource>): Promise<Resource> {
    this.recordCall('updateResource', [id, data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockResource({ id, ...data });
  }

  async deleteResource(id: string): Promise<void> {
    this.recordCall('deleteResource', [id]);
    await this.simulateDelay();
    this.maybeThrow();
  }

  async searchContracts(params: {
    query?: string;
    page?: number;
    limit?: number;
  }): Promise<SearchResponse<Contract>> {
    this.recordCall('searchContracts', [params]);
    await this.simulateDelay();
    this.maybeThrow();
    return createSearchResponse(
      Array.from({ length: 5 }, () => mockContract()),
      params.page,
      params.limit
    );
  }

  async getContract(id: string): Promise<Contract> {
    this.recordCall('getContract', [id]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockContract({ id });
  }

  async createContract(data: Partial<Contract>): Promise<Contract> {
    this.recordCall('createContract', [data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockContract(data);
  }

  async updateContract(id: string, data: Partial<Contract>): Promise<Contract> {
    this.recordCall('updateContract', [id, data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockContract({ id, ...data });
  }

  async deleteContract(id: string): Promise<void> {
    this.recordCall('deleteContract', [id]);
    await this.simulateDelay();
    this.maybeThrow();
  }

  async searchCompanies(params: {
    query?: string;
    page?: number;
    limit?: number;
  }): Promise<SearchResponse<Company>> {
    this.recordCall('searchCompanies', [params]);
    await this.simulateDelay();
    this.maybeThrow();
    return createSearchResponse(
      Array.from({ length: 5 }, () => mockCompany()),
      params.page,
      params.limit
    );
  }

  async getCompany(id: string): Promise<Company> {
    this.recordCall('getCompany', [id]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockCompany({ id });
  }

  async createCompany(data: Partial<Company>): Promise<Company> {
    this.recordCall('createCompany', [data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockCompany(data);
  }

  async updateCompany(id: string, data: Partial<Company>): Promise<Company> {
    this.recordCall('updateCompany', [id, data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockCompany({ id, ...data });
  }

  async deleteCompany(id: string): Promise<void> {
    this.recordCall('deleteCompany', [id]);
    await this.simulateDelay();
    this.maybeThrow();
  }

  async searchOpportunities(params: {
    query?: string;
    page?: number;
    limit?: number;
  }): Promise<SearchResponse<Opportunity>> {
    this.recordCall('searchOpportunities', [params]);
    await this.simulateDelay();
    this.maybeThrow();
    return createSearchResponse(
      Array.from({ length: 5 }, () => mockOpportunity()),
      params.page,
      params.limit
    );
  }

  async getOpportunity(id: string): Promise<Opportunity> {
    this.recordCall('getOpportunity', [id]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockOpportunity({ id });
  }

  async createOpportunity(data: Partial<Opportunity>): Promise<Opportunity> {
    this.recordCall('createOpportunity', [data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockOpportunity(data);
  }

  async updateOpportunity(id: string, data: Partial<Opportunity>): Promise<Opportunity> {
    this.recordCall('updateOpportunity', [id, data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockOpportunity({ id, ...data });
  }

  async deleteOpportunity(id: string): Promise<void> {
    this.recordCall('deleteOpportunity', [id]);
    await this.simulateDelay();
    this.maybeThrow();
  }

  async searchQuotations(params: {
    query?: string;
    page?: number;
    limit?: number;
  }): Promise<SearchResponse<Quotation>> {
    this.recordCall('searchQuotations', [params]);
    await this.simulateDelay();
    this.maybeThrow();
    return createSearchResponse(
      Array.from({ length: 5 }, () => mockQuotation()),
      params.page,
      params.limit
    );
  }

  async getQuotation(id: string): Promise<Quotation> {
    this.recordCall('getQuotation', [id]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockQuotation({ id });
  }

  async createQuotation(data: Partial<Quotation>): Promise<Quotation> {
    this.recordCall('createQuotation', [data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockQuotation(data);
  }

  async updateQuotation(id: string, data: Partial<Quotation>): Promise<Quotation> {
    this.recordCall('updateQuotation', [id, data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockQuotation({ id, ...data });
  }

  async deleteQuotation(id: string): Promise<void> {
    this.recordCall('deleteQuotation', [id]);
    await this.simulateDelay();
    this.maybeThrow();
  }

  async sendQuotation(id: string): Promise<Quotation> {
    this.recordCall('sendQuotation', [id]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockQuotation({ id, status: 'sent' });
  }

  async searchProjects(params: {
    query?: string;
    status?: string;
    companyId?: string;
    page?: number;
    limit?: number;
  }): Promise<SearchResponse<Project>> {
    this.recordCall('searchProjects', [params]);
    await this.simulateDelay();
    this.maybeThrow();
    return createSearchResponse(
      Array.from({ length: 5 }, () => mockProject()),
      params.page,
      params.limit
    );
  }

  async getProject(id: string): Promise<Project> {
    this.recordCall('getProject', [id]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockProject({ id });
  }

  async searchDeliveries(params: {
    query?: string;
    page?: number;
    limit?: number;
  }): Promise<SearchResponse<Delivery>> {
    this.recordCall('searchDeliveries', [params]);
    await this.simulateDelay();
    this.maybeThrow();
    return createSearchResponse(
      Array.from({ length: 5 }, () => mockDelivery()),
      params.page,
      params.limit
    );
  }

  async getDelivery(id: string): Promise<Delivery> {
    this.recordCall('getDelivery', [id]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockDelivery({ id });
  }

  async createDelivery(data: Partial<Delivery>): Promise<Delivery> {
    this.recordCall('createDelivery', [data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockDelivery(data);
  }

  async updateDelivery(id: string, data: Partial<Delivery>): Promise<Delivery> {
    this.recordCall('updateDelivery', [id, data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockDelivery({ id, ...data });
  }

  async deleteDelivery(id: string): Promise<void> {
    this.recordCall('deleteDelivery', [id]);
    await this.simulateDelay();
    this.maybeThrow();
  }

  async searchActions(params: {
    query?: string;
    status?: string;
    projectId?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }): Promise<SearchResponse<Action>> {
    this.recordCall('searchActions', [params]);
    await this.simulateDelay();
    this.maybeThrow();
    return createSearchResponse(
      Array.from({ length: 5 }, () => mockAction()),
      params.page,
      params.limit
    );
  }

  async getAction(id: string): Promise<Action> {
    this.recordCall('getAction', [id]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockAction({ id });
  }

  async createAction(data: Partial<Action>): Promise<Action> {
    this.recordCall('createAction', [data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockAction(data);
  }

  async updateAction(id: string, data: Partial<Action>): Promise<Action> {
    this.recordCall('updateAction', [id, data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockAction({ id, ...data });
  }

  async deleteAction(id: string): Promise<void> {
    this.recordCall('deleteAction', [id]);
    await this.simulateDelay();
    this.maybeThrow();
  }

  async searchInvoices(params: {
    query?: string;
    page?: number;
    limit?: number;
  }): Promise<SearchResponse<Invoice>> {
    this.recordCall('searchInvoices', [params]);
    await this.simulateDelay();
    this.maybeThrow();
    return createSearchResponse(
      Array.from({ length: 5 }, () => mockInvoice()),
      params.page,
      params.limit
    );
  }

  async getInvoice(id: string): Promise<Invoice> {
    this.recordCall('getInvoice', [id]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockInvoice({ id });
  }

  async createInvoice(data: Partial<Invoice>): Promise<Invoice> {
    this.recordCall('createInvoice', [data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockInvoice(data);
  }

  async updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice> {
    this.recordCall('updateInvoice', [id, data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockInvoice({ id, ...data });
  }

  async deleteInvoice(id: string): Promise<void> {
    this.recordCall('deleteInvoice', [id]);
    await this.simulateDelay();
    this.maybeThrow();
  }

  async payInvoice(id: string): Promise<Invoice> {
    this.recordCall('payInvoice', [id]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockInvoice({ id, status: 'paid', paidAt: generateDate() });
  }

  async searchPurchases(params: {
    query?: string;
    page?: number;
    limit?: number;
  }): Promise<SearchResponse<Purchase>> {
    this.recordCall('searchPurchases', [params]);
    await this.simulateDelay();
    this.maybeThrow();
    return createSearchResponse(
      Array.from({ length: 5 }, () => mockPurchase()),
      params.page,
      params.limit
    );
  }

  async getPurchase(id: string): Promise<Purchase> {
    this.recordCall('getPurchase', [id]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockPurchase({ id });
  }

  async createPurchase(data: Partial<Purchase>): Promise<Purchase> {
    this.recordCall('createPurchase', [data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockPurchase(data);
  }

  async updatePurchase(id: string, data: Partial<Purchase>): Promise<Purchase> {
    this.recordCall('updatePurchase', [id, data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockPurchase({ id, ...data });
  }

  async deletePurchase(id: string): Promise<void> {
    this.recordCall('deletePurchase', [id]);
    await this.simulateDelay();
    this.maybeThrow();
  }

  async searchOrders(params: {
    query?: string;
    page?: number;
    limit?: number;
  }): Promise<SearchResponse<Order>> {
    this.recordCall('searchOrders', [params]);
    await this.simulateDelay();
    this.maybeThrow();
    return createSearchResponse(
      Array.from({ length: 5 }, () => mockOrder()),
      params.page,
      params.limit
    );
  }

  async getOrder(id: string): Promise<Order> {
    this.recordCall('getOrder', [id]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockOrder({ id });
  }

  async createOrder(data: Partial<Order>): Promise<Order> {
    this.recordCall('createOrder', [data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockOrder(data);
  }

  async updateOrder(id: string, data: Partial<Order>): Promise<Order> {
    this.recordCall('updateOrder', [id, data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockOrder({ id, ...data });
  }

  async deleteOrder(id: string): Promise<void> {
    this.recordCall('deleteOrder', [id]);
    await this.simulateDelay();
    this.maybeThrow();
  }

  async searchBankingAccounts(): Promise<SearchResponse<BankingAccount>> {
    this.recordCall('searchBankingAccounts', []);
    await this.simulateDelay();
    this.maybeThrow();
    return createSearchResponse([mockBankingAccount(), mockBankingAccount({ name: 'Savings' })]);
  }

  async createBankingTransaction(
    data: Omit<BankingTransaction, 'id' | 'createdAt'>
  ): Promise<BankingTransaction> {
    this.recordCall('createBankingTransaction', [data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockBankingTransaction(data);
  }

  async searchTimeReports(params: {
    resourceId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<SearchResponse<TimeReport>> {
    this.recordCall('searchTimeReports', [params]);
    await this.simulateDelay();
    this.maybeThrow();
    return createSearchResponse(
      Array.from({ length: 5 }, () => mockTimeReport()),
      params.page,
      params.limit
    );
  }

  async getTimeReport(id: string): Promise<TimeReport> {
    this.recordCall('getTimeReport', [id]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockTimeReport({ id });
  }

  async createTimeReport(data: Partial<TimeReport>): Promise<TimeReport> {
    this.recordCall('createTimeReport', [data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockTimeReport(data);
  }

  async updateTimeReport(id: string, data: Partial<TimeReport>): Promise<TimeReport> {
    this.recordCall('updateTimeReport', [id, data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockTimeReport({ id, ...data });
  }

  async searchAbsences(params: {
    resourceId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<SearchResponse<Absence>> {
    this.recordCall('searchAbsences', [params]);
    await this.simulateDelay();
    this.maybeThrow();
    return createSearchResponse(
      Array.from({ length: 5 }, () => mockAbsence()),
      params.page,
      params.limit
    );
  }

  async getAbsence(id: string): Promise<Absence> {
    this.recordCall('getAbsence', [id]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockAbsence({ id });
  }

  async createAbsence(data: Partial<Absence>): Promise<Absence> {
    this.recordCall('createAbsence', [data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockAbsence(data);
  }

  async updateAbsence(id: string, data: Partial<Absence>): Promise<Absence> {
    this.recordCall('updateAbsence', [id, data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockAbsence({ id, ...data });
  }

  async deleteAbsence(id: string): Promise<void> {
    this.recordCall('deleteAbsence', [id]);
    await this.simulateDelay();
    this.maybeThrow();
  }

  async approveAbsence(id: string): Promise<Absence> {
    this.recordCall('approveAbsence', [id]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockAbsence({ id, status: 'approved' });
  }

  async rejectAbsence(id: string): Promise<Absence> {
    this.recordCall('rejectAbsence', [id]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockAbsence({ id, status: 'rejected' });
  }

  async searchExpenseReports(params: {
    resourceId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<SearchResponse<ExpenseReport>> {
    this.recordCall('searchExpenseReports', [params]);
    await this.simulateDelay();
    this.maybeThrow();
    return createSearchResponse(
      Array.from({ length: 5 }, () => mockExpenseReport()),
      params.page,
      params.limit
    );
  }

  async getExpenseReport(id: string): Promise<ExpenseReport> {
    this.recordCall('getExpenseReport', [id]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockExpenseReport({ id });
  }

  async createExpenseReport(data: Partial<ExpenseReport>): Promise<ExpenseReport> {
    this.recordCall('createExpenseReport', [data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockExpenseReport(data);
  }

  async updateExpenseReport(id: string, data: Partial<ExpenseReport>): Promise<ExpenseReport> {
    this.recordCall('updateExpenseReport', [id, data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockExpenseReport({ id, ...data });
  }

  async submitExpenseReport(id: string): Promise<ExpenseReport> {
    this.recordCall('submitExpenseReport', [id]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockExpenseReport({ id, status: 'submitted' });
  }

  async approveExpenseReport(id: string): Promise<ExpenseReport> {
    this.recordCall('approveExpenseReport', [id]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockExpenseReport({ id, status: 'approved' });
  }

  async rejectExpenseReport(id: string, reason: string): Promise<ExpenseReport> {
    this.recordCall('rejectExpenseReport', [id, reason]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockExpenseReport({ id, status: 'rejected' });
  }

  async payExpenseReport(id: string): Promise<ExpenseReport> {
    this.recordCall('payExpenseReport', [id]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockExpenseReport({ id, status: 'paid' });
  }

  async searchAgencies(params: {
    query?: string;
    page?: number;
    limit?: number;
  }): Promise<SearchResponse<Agency>> {
    this.recordCall('searchAgencies', [params]);
    await this.simulateDelay();
    this.maybeThrow();
    return createSearchResponse(
      Array.from({ length: 5 }, () => mockAgency()),
      params.page,
      params.limit
    );
  }

  async getAgency(id: string): Promise<Agency> {
    this.recordCall('getAgency', [id]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockAgency({ id });
  }

  async createAgency(data: Partial<Agency>): Promise<Agency> {
    this.recordCall('createAgency', [data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockAgency(data);
  }

  async updateAgency(id: string, data: Partial<Agency>): Promise<Agency> {
    this.recordCall('updateAgency', [id, data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockAgency({ id, ...data });
  }

  async deleteAgency(id: string): Promise<void> {
    this.recordCall('deleteAgency', [id]);
    await this.simulateDelay();
    this.maybeThrow();
  }

  async searchBusinessUnits(params: {
    query?: string;
    page?: number;
    limit?: number;
  }): Promise<SearchResponse<BusinessUnit>> {
    this.recordCall('searchBusinessUnits', [params]);
    await this.simulateDelay();
    this.maybeThrow();
    return createSearchResponse(
      Array.from({ length: 5 }, () => mockBusinessUnit()),
      params.page,
      params.limit
    );
  }

  async getBusinessUnit(id: string): Promise<BusinessUnit> {
    this.recordCall('getBusinessUnit', [id]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockBusinessUnit({ id });
  }

  async createBusinessUnit(data: Partial<BusinessUnit>): Promise<BusinessUnit> {
    this.recordCall('createBusinessUnit', [data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockBusinessUnit(data);
  }

  async updateBusinessUnit(id: string, data: Partial<BusinessUnit>): Promise<BusinessUnit> {
    this.recordCall('updateBusinessUnit', [id, data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockBusinessUnit({ id, ...data });
  }

  async deleteBusinessUnit(id: string): Promise<void> {
    this.recordCall('deleteBusinessUnit', [id]);
    await this.simulateDelay();
    this.maybeThrow();
  }

  async searchAccounts(params: {
    query?: string;
    page?: number;
    limit?: number;
  }): Promise<SearchResponse<Account>> {
    this.recordCall('searchAccounts', [params]);
    await this.simulateDelay();
    this.maybeThrow();
    return createSearchResponse(
      Array.from({ length: 5 }, () => mockAccount()),
      params.page,
      params.limit
    );
  }

  async getAccount(id: string): Promise<Account> {
    this.recordCall('getAccount', [id]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockAccount({ id });
  }

  async createAccount(data: Partial<Account>): Promise<Account> {
    this.recordCall('createAccount', [data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockAccount(data);
  }

  async updateAccount(id: string, data: Partial<Account>): Promise<Account> {
    this.recordCall('updateAccount', [id, data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockAccount({ id, ...data });
  }

  async deleteAccount(id: string): Promise<void> {
    this.recordCall('deleteAccount', [id]);
    await this.simulateDelay();
    this.maybeThrow();
  }

  async searchDocuments(params: {
    query?: string;
    page?: number;
    limit?: number;
  }): Promise<SearchResponse<Document>> {
    this.recordCall('searchDocuments', [params]);
    await this.simulateDelay();
    this.maybeThrow();
    return createSearchResponse(
      Array.from({ length: 5 }, () => mockDocument()),
      params.page,
      params.limit
    );
  }

  async getDocument(id: string): Promise<Document> {
    this.recordCall('getDocument', [id]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockDocument({ id });
  }

  async updateDocument(id: string, data: Partial<Document>): Promise<Document> {
    this.recordCall('updateDocument', [id, data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockDocument({ id, ...data });
  }

  async deleteDocument(id: string): Promise<void> {
    this.recordCall('deleteDocument', [id]);
    await this.simulateDelay();
    this.maybeThrow();
  }

  async searchApps(): Promise<SearchResponse<App>> {
    this.recordCall('searchApps', []);
    await this.simulateDelay();
    this.maybeThrow();
    return createSearchResponse([mockApp(), mockApp({ name: 'Mobile App' })]);
  }

  async getApp(id: string): Promise<App> {
    this.recordCall('getApp', [id]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockApp({ id });
  }

  async searchSettings(params: {
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<SearchResponse<Setting>> {
    this.recordCall('searchSettings', [params]);
    await this.simulateDelay();
    this.maybeThrow();
    return createSearchResponse(
      Array.from({ length: 5 }, () => mockSetting()),
      params.page,
      params.limit
    );
  }

  async getSetting(id: string): Promise<Setting> {
    this.recordCall('getSetting', [id]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockSetting({ id });
  }

  async updateSetting(id: string, data: Partial<Setting>): Promise<Setting> {
    this.recordCall('updateSetting', [id, data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockSetting({ id, ...data });
  }

  async searchAlerts(params: {
    resolved?: boolean;
    page?: number;
    limit?: number;
  }): Promise<SearchResponse<Alert>> {
    this.recordCall('searchAlerts', [params]);
    await this.simulateDelay();
    this.maybeThrow();
    return createSearchResponse(
      Array.from({ length: 5 }, () => mockAlert()),
      params.page,
      params.limit
    );
  }

  async getAlert(id: string): Promise<Alert> {
    this.recordCall('getAlert', [id]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockAlert({ id });
  }

  async updateAlert(id: string, data: Partial<Alert>): Promise<Alert> {
    this.recordCall('updateAlert', [id, data]);
    await this.simulateDelay();
    this.maybeThrow();
    return mockAlert({ id, ...data });
  }

  async search(params: {
    query: string;
    page?: number;
    limit?: number;
  }): Promise<SearchResponse<unknown>> {
    this.recordCall('search', [params]);
    await this.simulateDelay();
    this.maybeThrow();
    return createSearchResponse(
      [mockCandidate(), mockCompany(), mockContact()],
      params.page,
      params.limit
    );
  }

  async facetedSearch(params: {
    query?: string;
    filters?: Record<string, string | string[]>;
    page?: number;
    limit?: number;
  }): Promise<SearchResponse<unknown>> {
    this.recordCall('facetedSearch', [params]);
    await this.simulateDelay();
    this.maybeThrow();
    return createSearchResponse([mockCandidate(), mockCompany()], params.page, params.limit);
  }

  async advancedSearch(params: {
    query?: string;
    criteria?: Record<string, unknown>;
    page?: number;
    limit?: number;
  }): Promise<SearchResponse<unknown>> {
    this.recordCall('advancedSearch', [params]);
    await this.simulateDelay();
    this.maybeThrow();
    return createSearchResponse([mockCandidate()], params.page, params.limit);
  }

  async dateSearch(params: {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<SearchResponse<unknown>> {
    this.recordCall('dateSearch', [params]);
    await this.simulateDelay();
    this.maybeThrow();
    return createSearchResponse([mockTimeReport(), mockAbsence()], params.page, params.limit);
  }
}

export const mockClient = new MockBoondAPIClient();
