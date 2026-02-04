import { z } from "zod";

export const searchParamsSchema = z.object({
  query: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const candidateIdSchema = z.object({
  id: z.string().min(1, "Candidate ID is required"),
});

export const timeReportIdSchema = z.object({
  id: z.string().min(1, "Time report ID is required"),
});

export const createCandidateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

export const updateCandidateSchema = createCandidateSchema.partial();

export const updateCandidateWithIdSchema = z.object({
  id: z.string().min(1, "Candidate ID is required"),
  ...updateCandidateSchema.shape,
});

export const createCompanySchema = z.object({
  name: z.string().min(1),
  type: z.enum(["client", "supplier", "partner"]).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  contacts: z.array(z.string()).optional(),
});

export const updateCompanySchema = createCompanySchema.partial();

export const companyIdSchema = z.object({
  id: z.string().min(1, "Company ID is required"),
});

export const updateCompanyWithIdSchema = z.object({
  id: z.string().min(1, "Company ID is required"),
  ...updateCompanySchema.shape,
});

export const opportunityIdSchema = z.object({
  id: z.string().min(1, "Opportunity ID is required"),
});

export const createOpportunitySchema = z.object({
  name: z.string().min(1),
  companyId: z.string().min(1),
  contactId: z.string().optional(),
  status: z
    .enum(["lead", "qualified", "proposal", "negotiation", "won", "lost"])
    .optional(),
  value: z.number().positive().optional(),
  probability: z.number().min(0).max(100).optional(),
  expectedCloseDate: z.string().datetime().optional(),
  description: z.string().optional(),
});

export const updateOpportunitySchema = createOpportunitySchema.partial();

export const updateOpportunityWithIdSchema = z.object({
  id: z.string().min(1, "Opportunity ID is required"),
  ...updateOpportunitySchema.shape,
});

// ============================================================================
// CRM DOMAIN - QUOTATIONS
// ============================================================================

export const quotationIdSchema = z.object({
  id: z.string().min(1, "Quotation ID is required"),
});

export const createQuotationSchema = z.object({
  opportunityId: z.string().min(1),
  companyId: z.string().min(1),
  total: z.number().positive(),
  status: z
    .enum(["draft", "sent", "accepted", "rejected", "expired"])
    .optional(),
  sentAt: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
  description: z.string().optional(),
});

export const updateQuotationSchema = createQuotationSchema.partial();

export const updateQuotationWithIdSchema = z.object({
  id: z.string().min(1, "Quotation ID is required"),
  ...updateQuotationSchema.shape,
});

export const projectIdSchema = z.object({
  id: z.string().min(1, "Project ID is required"),
});

export const searchProjectsSchema = z.object({
  query: z.string().optional(),
  status: z
    .enum(["planning", "active", "on-hold", "completed", "cancelled"])
    .optional(),
  companyId: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const createProjectSchema = z.object({
  name: z.string().min(1),
  status: z.enum(["planning", "active", "on-hold", "completed", "cancelled"]),
  companyId: z.string(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  description: z.string().optional(),
  budget: z.number().positive().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const searchTimeReportsSchema = z.object({
  resourceId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(["draft", "submitted", "approved", "rejected"]).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const createTimeReportSchema = z.object({
  resourceId: z.string(),
  date: z.string().datetime(),
  hours: z.number().positive().max(24),
  projectId: z.string(),
  status: z.enum(["draft", "submitted", "approved", "rejected"]).optional(),
  description: z.string().optional(),
});

export const updateTimeReportSchema = createTimeReportSchema.partial();

export const absenceIdSchema = z.object({
  id: z.string().min(1, "Absence ID is required"),
});

export const searchAbsencesSchema = z.object({
  resourceId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(["draft", "requested", "approved", "rejected"]).optional(),
  type: z.enum(["vacation", "sick-leave", "unpaid-leave", "training", "other"]).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const createAbsenceSchema = z.object({
  resourceId: z.string(),
  type: z.enum(["vacation", "sick-leave", "unpaid-leave", "training", "other"]),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  status: z.enum(["draft", "requested", "approved", "rejected"]).optional(),
  reason: z.string().optional(),
});

export const updateAbsenceSchema = createAbsenceSchema.partial();

export const updateAbsenceWithIdSchema = z.object({
  id: z.string().min(1, "Absence ID is required"),
  ...updateAbsenceSchema.shape,
});

// ============================================================================
// PROJECTS DOMAIN
// ============================================================================

export const deliveryIdSchema = z.object({
  id: z.string().min(1, "Delivery ID is required"),
});

export const searchDeliveriesSchema = z.object({
  query: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const createDeliverySchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  name: z.string().min(1, "Delivery name is required"),
  status: z.enum(["pending", "in-progress", "completed", "blocked"]).optional(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
});

export const updateDeliverySchema = createDeliverySchema.partial();

export const updateDeliveryWithIdSchema = z.object({
  id: z.string().min(1, "Delivery ID is required"),
  ...updateDeliverySchema.shape,
});

export const actionIdSchema = z.object({
  id: z.string().min(1, "Action ID is required"),
});

export const searchActionsSchema = z.object({
  query: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  status: z.enum(["open", "in-progress", "completed", "cancelled"]).optional(),
  projectId: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

export const createActionSchema = z.object({
  name: z.string().min(1, "Action name is required"),
  projectId: z.string().optional(),
  status: z.enum(["open", "in-progress", "completed", "cancelled"]).optional(),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  description: z.string().optional(),
});

export const updateActionSchema = createActionSchema.partial();

export const updateActionWithIdSchema = z.object({
  id: z.string().min(1, "Action ID is required"),
  ...updateActionSchema.shape,
});

// ============================================================================
// FINANCE DOMAIN
// ============================================================================

export const createInvoiceSchema = z.object({
  companyId: z.string(),
  total: z.number().positive(),
  status: z.enum(["draft", "issued", "paid", "overdue", "cancelled"]).optional(),
  issuedAt: z.string().datetime(),
  paidAt: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  description: z.string().optional(),
});

export const updateInvoiceSchema = createInvoiceSchema.partial();

export const invoiceIdSchema = z.object({
  id: z.string().min(1, "Invoice ID is required"),
});

export const updateInvoiceWithIdSchema = z.object({
  id: z.string().min(1, "Invoice ID is required"),
  ...updateInvoiceSchema.shape,
});

export const createPurchaseSchema = z.object({
  companyId: z.string(),
  total: z.number().positive(),
  status: z.enum(["draft", "ordered", "received", "invoiced", "cancelled"]).optional(),
  orderedAt: z.string().datetime(),
  receivedAt: z.string().datetime().optional(),
});

export const updatePurchaseSchema = createPurchaseSchema.partial();

export const purchaseIdSchema = z.object({
  id: z.string().min(1, "Purchase ID is required"),
});

export const updatePurchaseWithIdSchema = z.object({
  id: z.string().min(1, "Purchase ID is required"),
  ...updatePurchaseSchema.shape,
});

export const createOrderSchema = z.object({
  companyId: z.string(),
  projectId: z.string().optional(),
  total: z.number().positive(),
  status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]).optional(),
});

export const updateOrderSchema = createOrderSchema.partial();

export const orderIdSchema = z.object({
  id: z.string().min(1, "Order ID is required"),
});

export const updateOrderWithIdSchema = z.object({
  id: z.string().min(1, "Order ID is required"),
  ...updateOrderSchema.shape,
});

export const bankingAccountIdSchema = z.object({
  id: z.string().min(1, "Banking account ID is required"),
});

export const createBankingTransactionSchema = z.object({
  accountId: z.string(),
  amount: z.number(),
  type: z.enum(["debit", "credit"]),
  date: z.string().datetime(),
  description: z.string().min(1),
  reference: z.string().optional(),
});

// ============================================================================
// TIME DOMAIN
// ============================================================================

export const expenseReportIdSchema = z.object({
  id: z.string().min(1, "Expense report ID is required"),
});

export const searchExpenseReportsSchema = z.object({
  resourceId: z.string().optional(),
  status: z.enum(["draft", "submitted", "approved", "rejected", "paid"]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const createExpenseReportSchema = z.object({
  resourceId: z.string(),
  status: z.enum(["draft", "submitted", "approved", "rejected", "paid"]).optional(),
  total: z.number().positive(),
  period: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  }),
});

export const updateExpenseReportSchema = createExpenseReportSchema.partial();

export const updateExpenseReportWithIdSchema = z.object({
  id: z.string().min(1, "Expense report ID is required"),
  ...updateExpenseReportSchema.shape,
});

export const rejectExpenseReportSchema = z.object({
  id: z.string().min(1, "Expense report ID is required"),
  reason: z.string().min(1, "Rejection reason is required"),
});

// ============================================================================
// ADMIN DOMAIN
// ============================================================================

export const agencyIdSchema = z.object({
  id: z.string().min(1, "Agency ID is required"),
});

export const createAgencySchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

export const updateAgencySchema = createAgencySchema.partial();

export const updateAgencyWithIdSchema = z.object({
  id: z.string().min(1, "Agency ID is required"),
  ...updateAgencySchema.shape,
});

export const businessUnitIdSchema = z.object({
  id: z.string().min(1, "Business Unit ID is required"),
});

export const createBusinessUnitSchema = z.object({
  name: z.string().min(1),
  parentId: z.string().optional(),
  managerId: z.string().optional(),
});

export const updateBusinessUnitSchema = createBusinessUnitSchema.partial();

export const updateBusinessUnitWithIdSchema = z.object({
  id: z.string().min(1, "Business Unit ID is required"),
  ...updateBusinessUnitSchema.shape,
});

export const accountIdSchema = z.object({
  id: z.string().min(1, "Account ID is required"),
});

export const createAccountSchema = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["admin", "manager", "user", "viewer"]),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
});

export const updateAccountSchema = createAccountSchema.partial();

export const updateAccountWithIdSchema = z.object({
  id: z.string().min(1, "Account ID is required"),
  ...updateAccountSchema.shape,
});

// ============================================================================
// DOCUMENTS DOMAIN
// ============================================================================

export const documentIdSchema = z.object({
  id: z.string().min(1, "Document ID is required"),
});

export const updateDocumentSchema = z.object({
  name: z.string().optional(),
  folderId: z.string().optional(),
});

export const updateDocumentWithIdSchema = z.object({
  id: z.string().min(1, "Document ID is required"),
  ...updateDocumentSchema.shape,
});

// ============================================================================
// SYSTEM DOMAIN
// ============================================================================

export const appIdSchema = z.object({
  id: z.string().min(1, "App ID is required"),
});

export const settingIdSchema = z.object({
  id: z.string().min(1, "Setting ID is required"),
});

export const updateSettingSchema = z.object({
  value: z.unknown().optional(),
  category: z.string().optional(),
});

export const updateSettingWithIdSchema = z.object({
  id: z.string().min(1, "Setting ID is required"),
  ...updateSettingSchema.shape,
});

export const alertIdSchema = z.object({
  id: z.string().min(1, "Alert ID is required"),
});

export const updateAlertSchema = z.object({
  resolved: z.boolean().optional(),
});

export const updateAlertWithIdSchema = z.object({
  id: z.string().min(1, "Alert ID is required"),
  ...updateAlertSchema.shape,
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type SearchParams = z.infer<typeof searchParamsSchema>;
export type CandidateId = z.infer<typeof candidateIdSchema>;
export type CreateCandidate = z.infer<typeof createCandidateSchema>;
export type UpdateCandidate = z.infer<typeof updateCandidateSchema>;
export type CreateCompany = z.infer<typeof createCompanySchema>;
export type UpdateCompany = z.infer<typeof updateCompanySchema>;
export type OpportunityId = z.infer<typeof opportunityIdSchema>;
export type CreateOpportunity = z.infer<typeof createOpportunitySchema>;
export type UpdateOpportunity = z.infer<typeof updateOpportunitySchema>;
export type QuotationId = z.infer<typeof quotationIdSchema>;
export type CreateQuotation = z.infer<typeof createQuotationSchema>;
export type UpdateQuotation = z.infer<typeof updateQuotationSchema>;
export type SearchProjects = z.infer<typeof searchProjectsSchema>;
export type CreateProject = z.infer<typeof createProjectSchema>;
export type UpdateProject = z.infer<typeof updateProjectSchema>;
export type SearchTimeReports = z.infer<typeof searchTimeReportsSchema>;
export type CreateTimeReport = z.infer<typeof createTimeReportSchema>;
export type UpdateTimeReport = z.infer<typeof updateTimeReportSchema>;
export type AbsenceId = z.infer<typeof absenceIdSchema>;
export type SearchAbsences = z.infer<typeof searchAbsencesSchema>;
export type CreateAbsence = z.infer<typeof createAbsenceSchema>;
export type UpdateAbsence = z.infer<typeof updateAbsenceSchema>;

// Projects domain types
export type ProjectId = z.infer<typeof projectIdSchema>;
export type CreateDelivery = z.infer<typeof createDeliverySchema>;
export type UpdateDelivery = z.infer<typeof updateDeliverySchema>;
export type DeliveryId = z.infer<typeof deliveryIdSchema>;
export type SearchDeliveries = z.infer<typeof searchDeliveriesSchema>;
export type UpdateDeliveryWithId = z.infer<typeof updateDeliveryWithIdSchema>;
export type CreateAction = z.infer<typeof createActionSchema>;
export type UpdateAction = z.infer<typeof updateActionSchema>;
export type ActionId = z.infer<typeof actionIdSchema>;
export type SearchActions = z.infer<typeof searchActionsSchema>;
export type UpdateActionWithId = z.infer<typeof updateActionWithIdSchema>;

// Finance domain types
export type InvoiceId = z.infer<typeof invoiceIdSchema>;
export type CreateInvoice = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoice = z.infer<typeof updateInvoiceSchema>;
export type PurchaseId = z.infer<typeof purchaseIdSchema>;
export type CreatePurchase = z.infer<typeof createPurchaseSchema>;
export type UpdatePurchase = z.infer<typeof updatePurchaseSchema>;
export type OrderId = z.infer<typeof orderIdSchema>;
export type CreateOrder = z.infer<typeof createOrderSchema>;
export type UpdateOrder = z.infer<typeof updateOrderSchema>;
export type BankingAccountId = z.infer<typeof bankingAccountIdSchema>;

// Time domain types
export type ExpenseReportId = z.infer<typeof expenseReportIdSchema>;
export type SearchExpenseReports = z.infer<typeof searchExpenseReportsSchema>;
export type CreateExpenseReport = z.infer<typeof createExpenseReportSchema>;
export type UpdateExpenseReport = z.infer<typeof updateExpenseReportSchema>;
export type UpdateExpenseReportWithId = z.infer<typeof updateExpenseReportWithIdSchema>;
export type RejectExpenseReport = z.infer<typeof rejectExpenseReportSchema>;
export type UpdateAbsenceWithId = z.infer<typeof updateAbsenceWithIdSchema>;

// Admin domain types
export type AgencyId = z.infer<typeof agencyIdSchema>;
export type CreateAgency = z.infer<typeof createAgencySchema>;
export type UpdateAgency = z.infer<typeof updateAgencySchema>;
export type UpdateAgencyWithId = z.infer<typeof updateAgencyWithIdSchema>;
export type BusinessUnitId = z.infer<typeof businessUnitIdSchema>;
export type CreateBusinessUnit = z.infer<typeof createBusinessUnitSchema>;
export type UpdateBusinessUnit = z.infer<typeof updateBusinessUnitSchema>;
export type UpdateBusinessUnitWithId = z.infer<typeof updateBusinessUnitWithIdSchema>;
export type AccountId = z.infer<typeof accountIdSchema>;
export type CreateAccount = z.infer<typeof createAccountSchema>;
export type UpdateAccount = z.infer<typeof updateAccountSchema>;
export type UpdateAccountWithId = z.infer<typeof updateAccountWithIdSchema>;

// Documents domain types
export type DocumentId = z.infer<typeof documentIdSchema>;
export type UpdateDocument = z.infer<typeof updateDocumentSchema>;
export type UpdateDocumentWithId = z.infer<typeof updateDocumentWithIdSchema>;

// System domain types
export type AppId = z.infer<typeof appIdSchema>;
export type SettingId = z.infer<typeof settingIdSchema>;
export type UpdateSetting = z.infer<typeof updateSettingSchema>;
export type UpdateSettingWithId = z.infer<typeof updateSettingWithIdSchema>;
export type AlertId = z.infer<typeof alertIdSchema>;
export type UpdateAlert = z.infer<typeof updateAlertSchema>;
export type UpdateAlertWithId = z.infer<typeof updateAlertWithIdSchema>;

// ============================================================================
// HR DOMAIN - CONTACTS
// ============================================================================

export const contactIdSchema = z.object({
  id: z.string().min(1, "Contact ID is required"),
});

export const createContactSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  companyId: z.string(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
});

export const updateContactSchema = createContactSchema.partial();

export const updateContactWithIdSchema = z.object({
  id: z.string().min(1, "Contact ID is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  companyId: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
});

// HR Domain Types
export type ContactId = z.infer<typeof contactIdSchema>;
export type CreateContact = z.infer<typeof createContactSchema>;
export type UpdateContact = z.infer<typeof updateContactSchema>;

// ============================================================================
// HR DOMAIN - RESOURCES
// ============================================================================

export const resourceIdSchema = z.object({
  id: z.string().min(1, "Resource ID is required"),
});

export const createResourceSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  status: z.enum(["active", "inactive", "archived"]).optional(),
  department: z.string().optional(),
  skills: z.array(z.string()).optional(),
  hourlyRate: z.number().positive().optional(),
});

export const updateResourceSchema = createResourceSchema.partial();

export const updateResourceWithIdSchema = z.object({
  id: z.string().min(1, "Resource ID is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  status: z.enum(["active", "inactive", "archived"]).optional(),
  department: z.string().optional(),
  skills: z.array(z.string()).optional(),
  hourlyRate: z.number().positive().optional(),
});

// HR Domain Types
export type ResourceId = z.infer<typeof resourceIdSchema>;
export type CreateResource = z.infer<typeof createResourceSchema>;
export type UpdateResource = z.infer<typeof updateResourceSchema>;

// ============================================================================
// HR DOMAIN - CONTRACTS
// ============================================================================

export const contractIdSchema = z.object({
  id: z.string().min(1, "Contract ID is required"),
});

export const createContractSchema = z.object({
  resourceId: z.string().min(1, "Resource ID is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  type: z.enum(["full-time", "part-time", "freelance"]),
  status: z.enum(["active", "inactive", "ended"]).optional(),
  hourlyRate: z.number().optional(),
});

export const updateContractSchema = createContractSchema.partial();

export const updateContractWithIdSchema = z.object({
  id: z.string().min(1, "Contract ID is required"),
  resourceId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  type: z.enum(["full-time", "part-time", "freelance"]).optional(),
  status: z.enum(["active", "inactive", "ended"]).optional(),
  hourlyRate: z.number().optional(),
});

// HR Domain Types
export type ContractId = z.infer<typeof contractIdSchema>;
export type CreateContract = z.infer<typeof createContractSchema>;
export type UpdateContract = z.infer<typeof updateContractSchema>;
