/**
 * BoondManager API Core Types
 * Phase 1 resource definitions
 */

/**
 * Candidate resource
 */
export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: "active" | "inactive" | "archived";
  address?: string;
  city?: string;
  country?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Company resource
 */
export interface Company {
  id: string;
  name: string;
  type?: "client" | "supplier" | "partner";
  address?: string;
  city?: string;
  country?: string;
  contacts?: string[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Project resource
 */
export interface Project {
  id: string;
  name: string;
  status: "planning" | "active" | "on-hold" | "completed" | "cancelled";
  companyId: string;
  managerId?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  budget?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * TimeReport resource
 */
export interface TimeReport {
  id: string;
  resourceId: string;
  date: string;
  hours: number;
  projectId: string;
  status: "draft" | "submitted" | "approved" | "rejected";
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Delivery resource - Projects domain
 */
export interface Delivery {
  id: string;
  projectId: string;
  name: string;
  status: "pending" | "in-progress" | "completed" | "blocked";
  description?: string;
  dueDate?: string;
  deliveredAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Action resource - Projects domain
 */
export interface Action {
  id: string;
  projectId?: string;
  name: string;
  status: "open" | "in-progress" | "completed" | "cancelled";
  assignedTo?: string;
  dueDate?: string;
  priority?: "low" | "medium" | "high";
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Contact resource - HR domain
 */
export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyId: string;
  jobTitle?: string;
  department?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Resource resource - HR domain
 */
export interface Resource {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: "active" | "inactive" | "archived";
  department?: string;
  skills?: string[];
  hourlyRate?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Contract resource - HR domain
 */
export interface Contract {
  id: string;
  resourceId: string;
  startDate: string;
  endDate?: string;
  type: "full-time" | "part-time" | "freelance";
  status: "active" | "inactive" | "ended";
  hourlyRate?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Opportunity resource - CRM domain
 */
export interface Opportunity {
  id: string;
  name: string;
  companyId: string;
  contactId?: string;
  status: "lead" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
  value?: number;
  probability?: number;
  expectedCloseDate?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Quotation resource - CRM domain
 */
export interface Quotation {
  id: string;
  opportunityId: string;
  companyId: string;
  total: number;
  status: "draft" | "sent" | "accepted" | "rejected" | "expired";
  sentAt?: string;
  validUntil?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * InvoiceItem - Finance domain
 */
export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

/**
 * Invoice resource - Finance domain
 */
export interface Invoice {
  id: string;
  companyId: string;
  total: number;
  status: "draft" | "issued" | "paid" | "overdue" | "cancelled";
  issuedAt: string;
  paidAt?: string;
  items?: InvoiceItem[];
  description?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * PurchaseItem - Finance domain
 */
export interface PurchaseItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

/**
 * Purchase resource - Finance domain
 */
export interface Purchase {
  id: string;
  companyId: string;
  total: number;
  status: "draft" | "ordered" | "received" | "invoiced" | "cancelled";
  orderedAt: string;
  receivedAt?: string;
  items?: PurchaseItem[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Order resource - Finance domain
 */
export interface Order {
  id: string;
  companyId: string;
  projectId?: string;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  createdAt?: string;
  updatedAt?: string;
}

/**
 * BankingAccount resource - Finance domain
 */
export interface BankingAccount {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  balance: number;
  currency?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * BankingTransaction resource - Finance domain
 */
export interface BankingTransaction {
  id: string;
  accountId: string;
  amount: number;
  type: "debit" | "credit";
  date: string;
  description: string;
  reference?: string;
  createdAt?: string;
}

/**
 * Generic search response with pagination
 */
export interface SearchResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

/**
 * Error response
 */
export interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * ============================================================================
 * TIME DOMAIN
 * ============================================================================
 */

/**
 * ExpenseReportItem - nested within ExpenseReport
 */
export interface ExpenseReportItem {
  description: string;
  amount: number;
  date: string;
  category?: string;
}

/**
 * ExpenseReport resource - Time domain
 */
export interface ExpenseReport {
  id: string;
  resourceId: string;
  status: "draft" | "submitted" | "approved" | "rejected" | "paid";
  total: number;
  period: {
    startDate: string;
    endDate: string;
  };
  items?: ExpenseReportItem[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Absence resource - Time domain
 */
export interface Absence {
  id: string;
  resourceId: string;
  type: "vacation" | "sick-leave" | "unpaid-leave" | "training" | "other";
  startDate: string;
  endDate: string;
  status: "draft" | "requested" | "approved" | "rejected";
  reason?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Calendar resource - Time domain
 */
export interface Calendar {
  id: string;
  name: string;
  resourceId?: string;
  isShared?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * ============================================================================
 * ADMIN DOMAIN
 * ============================================================================
 */

/**
 * Agency resource - Admin domain
 */
export interface Agency {
  id: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * BusinessUnit resource - Admin domain
 */
export interface BusinessUnit {
  id: string;
  name: string;
  parentId?: string;
  managerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Account resource - Admin domain
 */
export interface Account {
  id: string;
  username: string;
  email: string;
  role: "admin" | "manager" | "user" | "viewer";
  status: "active" | "inactive" | "suspended";
  createdAt?: string;
  updatedAt?: string;
}

/**
 * ============================================================================
 * DOCUMENTS DOMAIN
 * ============================================================================
 */

/**
 * Document resource - Documents domain
 */
export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  url: string;
  folderId?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * ============================================================================
 * SYSTEM DOMAIN
 * ============================================================================
 */

/**
 * App resource - System domain
 */
export interface App {
  id: string;
  name: string;
  type: "extension" | "integration" | "plugin";
  status: "active" | "inactive" | "disabled";
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Setting resource - System domain
 */
export interface Setting {
  id: string;
  key: string;
  value: unknown;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Alert resource - System domain
 */
export interface Alert {
  id: string;
  type: "warning" | "error" | "info" | "success";
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  createdAt: string;
  resolvedAt?: string;
}
