/**
 * BoondManager API Client
 * Handles authentication, requests, and error handling for BoondManager API
 *
 * HTTP Status Code Mapping:
 * - 400: Bad Request - invalid parameters or malformed request
 * - 401: Unauthorized - check API token, missing or invalid authentication
 * - 404: Not Found - resource doesn't exist or endpoint not available
 * - 422: Validation Error - check field values, input validation failed
 * - 500/502/503/504: Server Error - temporary server issue, try again later
 */

import type {
  Candidate,
  Company,
  Contact,
  Resource,
  Project,
  TimeReport,
  Absence,
  Opportunity,
  Quotation,
  SearchResponse,
  Delivery,
  Action,
  Invoice,
  Purchase,
  Order,
  BankingAccount,
  BankingTransaction,
  ExpenseReport,
  Agency,
  BusinessUnit,
  Account,
  Document,
  App,
  Setting,
  Alert,
  Contract,
} from "../types/boond.js";
import type {
  SearchParams,
  CreateCandidate,
  UpdateCandidate,
  CreateCompany,
  UpdateCompany,
  CreateContact,
  UpdateContact,
  CreateResource,
  UpdateResource,
  CreateContract,
  UpdateContract,
  CreateOpportunity,
  UpdateOpportunity,
  CreateQuotation,
  UpdateQuotation,
  SearchProjects,
  CreateProject,
  UpdateProject,
  SearchTimeReports,
  CreateTimeReport,
  UpdateTimeReport,
  SearchAbsences,
  CreateAbsence,
  UpdateAbsence,
  CreateDelivery,
  UpdateDelivery,
  CreateAction,
  UpdateAction,
  CreateInvoice,
  UpdateInvoice,
  CreatePurchase,
  UpdatePurchase,
  CreateOrder,
  UpdateOrder,
  CreateExpenseReport,
  UpdateExpenseReport,
  CreateAgency,
  UpdateAgency,
  CreateBusinessUnit,
  UpdateBusinessUnit,
  CreateAccount,
  UpdateAccount,
  UpdateDocument,
  UpdateSetting,
} from "../types/schemas.js";

/**
 * Base API error class
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: string
  ) {
    super(message);
    this.name = "ApiError";
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * 400 Bad Request error
 */
export class BadRequestError extends ApiError {
  constructor(message: string, code: string = "BAD_REQUEST") {
    super(400, message, code);
    this.name = "BadRequestError";
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

/**
 * 401 Authentication error
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = "Authentication failed", code: string = "AUTH_ERROR") {
    super(401, message, code);
    this.name = "AuthenticationError";
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * 404 Not Found error
 */
export class NotFoundError extends ApiError {
  constructor(message: string = "Resource not found", code: string = "NOT_FOUND") {
    super(404, message, code);
    this.name = "NotFoundError";
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * 422 Validation error
 */
export class ValidationError extends ApiError {
  constructor(message: string = "Validation failed", code: string = "VALIDATION_ERROR") {
    super(422, message, code);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * 500 Server error
 */
export class ServerError extends ApiError {
  constructor(message: string = "Server error", code: string = "SERVER_ERROR") {
    super(500, message, code);
    this.name = "ServerError";
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

/**
 * BoondManager API Client
 * Handles all API requests with authentication and error handling
 */
export class BoondAPIClient {
  private baseUrl: string;
  private apiToken: string;

  private requestTimeout: number;

  constructor(
    apiToken: string,
    baseUrl: string = process.env["BOOND_API_URL"] || "https://ui.boondmanager.com/api/1.0",
    requestTimeout: number = 30000
  ) {
    this.baseUrl = baseUrl;
    this.apiToken = apiToken;
    this.requestTimeout = requestTimeout;
  }

  /**
   * Internal request method
   * Handles HTTP requests with auth headers and error handling
   */
  private async request<T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    endpoint: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Token": this.apiToken,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

      const options: RequestInit = {
        method,
        headers,
        signal: controller.signal,
      };

      if (body !== undefined && method !== "GET") {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        let errorData: unknown;
        const contentType = response.headers.get("content-type");

        try {
          if (contentType?.includes("application/json")) {
            errorData = await response.json();
          } else {
            errorData = await response.text();
          }
        } catch {
          errorData = `HTTP ${response.status}`;
        }

        // Map HTTP status codes to error types
        switch (response.status) {
          case 400:
            console.error(
              "Bad request error:",
              typeof errorData === "object" ? JSON.stringify(errorData) : errorData
            );
            throw new BadRequestError(
              typeof errorData === "object" && errorData !== null && "message" in errorData
                ? String((errorData as Record<string, unknown>)["message"])
                : "Bad request"
            );

          case 401:
            console.error("Authentication error");
            throw new AuthenticationError("Invalid API token or authentication failed");

          case 404:
            console.error(
              "Not found error:",
              typeof errorData === "object" ? JSON.stringify(errorData) : errorData
            );
            throw new NotFoundError("Resource not found");

          case 422:
            console.error(
              "Validation error:",
              typeof errorData === "object" ? JSON.stringify(errorData) : errorData
            );
            throw new ValidationError(
              typeof errorData === "object" && errorData !== null && "message" in errorData
                ? String((errorData as Record<string, unknown>)["message"])
                : "Validation failed"
            );

          case 500:
          case 502:
          case 503:
          case 504:
            console.error(
              "Server error:",
              typeof errorData === "object" ? JSON.stringify(errorData) : errorData
            );
            throw new ServerError(`Server error: HTTP ${response.status}`);

          default:
            console.error(
              `HTTP ${response.status} error:`,
              typeof errorData === "object" ? JSON.stringify(errorData) : errorData
            );
            throw new ApiError(
              response.status,
              `HTTP ${response.status}: ${typeof errorData === "string" ? errorData : "Unknown error"}`,
              "HTTP_ERROR"
            );
        }
      }

      // Parse successful response
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new ApiError(response.status, "Invalid response format: expected JSON", "INVALID_RESPONSE");
      }

      const data = await response.json() as T;
      return data;
    } catch (error) {
      // Re-throw API errors
      if (error instanceof ApiError) {
        throw error;
      }

      // Handle timeout errors
      if (error instanceof Error && error.name === "AbortError") {
        throw new ApiError(0, `Request timeout after ${this.requestTimeout}ms`, "TIMEOUT_ERROR");
      }

      // Log and wrap network errors
      if (error instanceof TypeError) {
        console.error("Network error:", error.message);
        throw new ApiError(0, `Network error: ${error.message}`, "NETWORK_ERROR");
      }

      // Log and wrap unexpected errors
      console.error("Unexpected error:", error instanceof Error ? error.message : String(error));
      throw new ApiError(0, "Unexpected error", "UNEXPECTED_ERROR");
    }
  }

  /**
   * Search candidates
   */
  async searchCandidates(params: SearchParams): Promise<SearchResponse<Candidate>> {
    const query = new URLSearchParams({
      ...(params.query && { query: params.query }),
      page: String(params.page),
      limit: String(Math.min(params.limit, 100)), // Cap at 100
    });

    return this.request<SearchResponse<Candidate>>(
      "GET",
      `/candidates?${query.toString()}`
    );
  }

  /**
   * Get candidate by ID
   */
  async getCandidate(id: string): Promise<Candidate> {
    return this.request<Candidate>("GET", `/candidates/${encodeURIComponent(id)}`);
  }

  /**
   * Create candidate
   */
  async createCandidate(data: CreateCandidate): Promise<Candidate> {
    return this.request<Candidate>("POST", "/candidates", data);
  }

  /**
   * Update candidate
   */
  async updateCandidate(id: string, data: UpdateCandidate): Promise<Candidate> {
    return this.request<Candidate>(
      "PUT",
      `/candidates/${encodeURIComponent(id)}`,
      data
    );
  }

  /**
   * Search companies
   */
  async searchCompanies(params: SearchParams): Promise<SearchResponse<Company>> {
    const query = new URLSearchParams({
      ...(params.query && { query: params.query }),
      page: String(params.page),
      limit: String(Math.min(params.limit, 100)), // Cap at 100
    });

    return this.request<SearchResponse<Company>>(
      "GET",
      `/companies?${query.toString()}`
    );
  }

  /**
   * Get company by ID
   */
  async getCompany(id: string): Promise<Company> {
    return this.request<Company>("GET", `/companies/${encodeURIComponent(id)}`);
  }

  /**
   * Create company
   */
  async createCompany(data: CreateCompany): Promise<Company> {
    return this.request<Company>("POST", "/companies", data);
  }

  /**
   * Update company
   */
  async updateCompany(id: string, data: UpdateCompany): Promise<Company> {
    return this.request<Company>(
      "PUT",
      `/companies/${encodeURIComponent(id)}`,
      data
    );
  }

  /**
   * Search opportunities
   */
  async searchOpportunities(params: SearchParams): Promise<SearchResponse<Opportunity>> {
    const query = new URLSearchParams({
      ...(params.query && { query: params.query }),
      page: String(params.page),
      limit: String(Math.min(params.limit, 100)), // Cap at 100
    });

    return this.request<SearchResponse<Opportunity>>(
      "GET",
      `/opportunities?${query.toString()}`
    );
  }

  /**
   * Get opportunity by ID
   */
  async getOpportunity(id: string): Promise<Opportunity> {
    return this.request<Opportunity>(
      "GET",
      `/opportunities/${encodeURIComponent(id)}`
    );
  }

  /**
   * Create opportunity
   */
  async createOpportunity(data: CreateOpportunity): Promise<Opportunity> {
    return this.request<Opportunity>("POST", "/opportunities", data);
  }

   /**
    * Update opportunity
    */
   async updateOpportunity(id: string, data: UpdateOpportunity): Promise<Opportunity> {
     return this.request<Opportunity>(
       "PUT",
       `/opportunities/${encodeURIComponent(id)}`,
       data
     );
   }

   /**
    * Search quotations
    */
   async searchQuotations(params: SearchParams): Promise<SearchResponse<Quotation>> {
     const query = new URLSearchParams({
       ...(params.query && { query: params.query }),
       page: String(params.page),
       limit: String(Math.min(params.limit, 100)), // Cap at 100
     });

     return this.request<SearchResponse<Quotation>>(
       "GET",
       `/quotations?${query.toString()}`
     );
   }

   /**
    * Get quotation by ID
    */
   async getQuotation(id: string): Promise<Quotation> {
     return this.request<Quotation>(
       "GET",
       `/quotations/${encodeURIComponent(id)}`
     );
   }

   /**
    * Create quotation
    */
   async createQuotation(data: CreateQuotation): Promise<Quotation> {
     return this.request<Quotation>("POST", "/quotations", data);
   }

   /**
    * Update quotation
    */
   async updateQuotation(id: string, data: UpdateQuotation): Promise<Quotation> {
     return this.request<Quotation>(
       "PUT",
       `/quotations/${encodeURIComponent(id)}`,
       data
     );
   }

   /**
    * Send quotation
    */
   async sendQuotation(id: string): Promise<Quotation> {
     return this.request<Quotation>(
       "POST",
       `/quotations/${encodeURIComponent(id)}/send`
     );
   }

   /**
    * Search contacts
    */
  async searchContacts(params: SearchParams): Promise<SearchResponse<Contact>> {
    const query = new URLSearchParams({
      ...(params.query && { query: params.query }),
      page: String(params.page),
      limit: String(Math.min(params.limit, 100)), // Cap at 100
    });

    return this.request<SearchResponse<Contact>>(
      "GET",
      `/contacts?${query.toString()}`
    );
  }

  /**
   * Get contact by ID
   */
  async getContact(id: string): Promise<Contact> {
    return this.request<Contact>("GET", `/contacts/${encodeURIComponent(id)}`);
  }

  /**
   * Create contact
   */
  async createContact(data: CreateContact): Promise<Contact> {
    return this.request<Contact>("POST", "/contacts", data);
  }

  /**
   * Update contact
   */
  async updateContact(id: string, data: UpdateContact): Promise<Contact> {
    return this.request<Contact>(
      "PUT",
      `/contacts/${encodeURIComponent(id)}`,
      data
    );
  }

  /**
   * Search resources
   */
  async searchResources(params: SearchParams): Promise<SearchResponse<Resource>> {
    const query = new URLSearchParams({
      ...(params.query && { query: params.query }),
      page: String(params.page),
      limit: String(Math.min(params.limit, 100)), // Cap at 100
    });

    return this.request<SearchResponse<Resource>>(
      "GET",
      `/resources?${query.toString()}`
    );
  }

  /**
   * Get resource by ID
   */
  async getResource(id: string): Promise<Resource> {
    return this.request<Resource>("GET", `/resources/${encodeURIComponent(id)}`);
  }

  /**
   * Create resource
   */
  async createResource(data: CreateResource): Promise<Resource> {
    return this.request<Resource>("POST", "/resources", data);
  }

  /**
   * Update resource
   */
  async updateResource(id: string, data: UpdateResource): Promise<Resource> {
    return this.request<Resource>(
      "PUT",
      `/resources/${encodeURIComponent(id)}`,
      data
    );
  }

  /**
   * Search contracts
   */
  async searchContracts(params: SearchParams): Promise<SearchResponse<Contract>> {
    const query = new URLSearchParams({
      ...(params.query && { query: params.query }),
      page: String(params.page),
      limit: String(Math.min(params.limit, 100)), // Cap at 100
    });

    return this.request<SearchResponse<Contract>>(
      "GET",
      `/contracts?${query.toString()}`
    );
  }

  /**
   * Get contract by ID
   */
  async getContract(id: string): Promise<Contract> {
    return this.request<Contract>("GET", `/contracts/${encodeURIComponent(id)}`);
  }

  /**
   * Create contract
   */
  async createContract(data: CreateContract): Promise<Contract> {
    return this.request<Contract>("POST", "/contracts", data);
  }

  /**
   * Update contract
   */
  async updateContract(id: string, data: UpdateContract): Promise<Contract> {
    return this.request<Contract>(
      "PUT",
      `/contracts/${encodeURIComponent(id)}`,
      data
    );
  }

  /**
   * Search projects
   */
  async searchProjects(params: SearchProjects): Promise<SearchResponse<Project>> {
    const query = new URLSearchParams({
      ...(params.query && { query: params.query }),
      ...(params.status && { status: params.status }),
      ...(params.companyId && { companyId: params.companyId }),
      page: String(params.page),
      limit: String(Math.min(params.limit, 100)), // Cap at 100
    });

    return this.request<SearchResponse<Project>>(
      "GET",
      `/projects?${query.toString()}`
    );
  }

  /**
   * Get project by ID
   */
  async getProject(id: string): Promise<Project> {
    return this.request<Project>("GET", `/projects/${encodeURIComponent(id)}`);
  }

  /**
   * Create project
   */
  async createProject(data: CreateProject): Promise<Project> {
    return this.request<Project>("POST", "/projects", data);
  }

  /**
   * Update project
   */
  async updateProject(id: string, data: UpdateProject): Promise<Project> {
    return this.request<Project>(
      "PUT",
      `/projects/${encodeURIComponent(id)}`,
      data
    );
  }

  /**
   * Search time reports
   */
  async searchTimeReports(params: SearchTimeReports): Promise<SearchResponse<TimeReport>> {
    const query = new URLSearchParams({
      ...(params.resourceId && { resourceId: params.resourceId }),
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate }),
      ...(params.status && { status: params.status }),
      page: String(params.page),
      limit: String(Math.min(params.limit, 100)), // Cap at 100
    });

    return this.request<SearchResponse<TimeReport>>(
      "GET",
      `/time-reports?${query.toString()}`
    );
  }

  /**
   * Get time report by ID
   */
  async getTimeReport(id: string): Promise<TimeReport> {
    return this.request<TimeReport>("GET", `/time-reports/${encodeURIComponent(id)}`);
  }

  /**
   * Create time report
   */
  async createTimeReport(data: CreateTimeReport): Promise<TimeReport> {
    return this.request<TimeReport>("POST", "/time-reports", data);
  }

   /**
     * Update time report
     */
    async updateTimeReport(id: string, data: UpdateTimeReport): Promise<TimeReport> {
      return this.request<TimeReport>(
        "PUT",
        `/time-reports/${encodeURIComponent(id)}`,
        data
      );
    }

  /**
   * Search absences
   */
  async searchAbsences(params: SearchAbsences): Promise<SearchResponse<Absence>> {
    const query = new URLSearchParams({
      ...(params.resourceId && { resourceId: params.resourceId }),
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate }),
      ...(params.status && { status: params.status }),
      ...(params.type && { type: params.type }),
      page: String(params.page),
      limit: String(Math.min(params.limit, 100)), // Cap at 100
    });

    return this.request<SearchResponse<Absence>>(
      "GET",
      `/absences?${query.toString()}`
    );
  }

  /**
   * Get absence by ID
   */
  async getAbsence(id: string): Promise<Absence> {
    return this.request<Absence>("GET", `/absences/${encodeURIComponent(id)}`);
  }

  /**
   * Create absence
   */
  async createAbsence(data: CreateAbsence): Promise<Absence> {
    return this.request<Absence>("POST", "/absences", data);
  }

  /**
   * Update absence
   */
  async updateAbsence(id: string, data: UpdateAbsence): Promise<Absence> {
    return this.request<Absence>(
      "PUT",
      `/absences/${encodeURIComponent(id)}`,
      data
    );
  }

    // ============================================================================
    // PROJECTS DOMAIN
    // ============================================================================

   /**
    * Search deliveries
    */
   async searchDeliveries(params: SearchParams): Promise<SearchResponse<Delivery>> {
     const query = new URLSearchParams({
       ...(params.query && { query: params.query }),
       page: String(params.page),
       limit: String(Math.min(params.limit, 100)),
     });

     return this.request<SearchResponse<Delivery>>(
       "GET",
       `/deliveries?${query.toString()}`
     );
   }

   /**
    * Get delivery by ID
    */
   async getDelivery(id: string): Promise<Delivery> {
     return this.request<Delivery>("GET", `/deliveries/${encodeURIComponent(id)}`);
   }

   /**
    * Create delivery
    */
   async createDelivery(data: CreateDelivery): Promise<Delivery> {
     return this.request<Delivery>("POST", "/deliveries", data);
   }

   /**
    * Update delivery
    */
   async updateDelivery(id: string, data: UpdateDelivery): Promise<Delivery> {
     return this.request<Delivery>(
       "PUT",
       `/deliveries/${encodeURIComponent(id)}`,
       data
     );
   }

   /**
    * Send delivery
    */
   async sendDelivery(id: string): Promise<Delivery> {
     return this.request<Delivery>(
       "POST",
       `/deliveries/${encodeURIComponent(id)}/send`
     );
   }

   /**
    * Search actions
    */
   async searchActions(params: SearchParams): Promise<SearchResponse<Action>> {
     const query = new URLSearchParams({
       ...(params.query && { query: params.query }),
       page: String(params.page),
       limit: String(Math.min(params.limit, 100)),
     });

     return this.request<SearchResponse<Action>>(
       "GET",
       `/actions?${query.toString()}`
     );
   }

   /**
    * Get action by ID
    */
   async getAction(id: string): Promise<Action> {
     return this.request<Action>("GET", `/actions/${encodeURIComponent(id)}`);
   }

   /**
    * Create action
    */
   async createAction(data: CreateAction): Promise<Action> {
     return this.request<Action>("POST", "/actions", data);
   }

   /**
    * Update action
    */
   async updateAction(id: string, data: UpdateAction): Promise<Action> {
     return this.request<Action>(
       "PUT",
       `/actions/${encodeURIComponent(id)}`,
       data
     );
   }

   /**
    * Delete action
    */
    async deleteAction(id: string): Promise<void> {
      await this.request<void>(
        "DELETE",
        `/actions/${encodeURIComponent(id)}`
      );
    }

   // ============================================================================
   // FINANCE DOMAIN
   // ============================================================================

   /**
    * Search invoices
    */
   async searchInvoices(params: SearchParams): Promise<SearchResponse<Invoice>> {
     const query = new URLSearchParams({
       ...(params.query && { query: params.query }),
       page: String(params.page),
       limit: String(Math.min(params.limit, 100)),
     });

     return this.request<SearchResponse<Invoice>>(
       "GET",
       `/invoices?${query.toString()}`
     );
   }

   /**
    * Get invoice by ID
    */
   async getInvoice(id: string): Promise<Invoice> {
     return this.request<Invoice>("GET", `/invoices/${encodeURIComponent(id)}`);
   }

   /**
    * Create invoice
    */
   async createInvoice(data: CreateInvoice): Promise<Invoice> {
     return this.request<Invoice>("POST", "/invoices", data);
   }

   /**
    * Update invoice
    */
   async updateInvoice(id: string, data: UpdateInvoice): Promise<Invoice> {
     return this.request<Invoice>(
       "PUT",
       `/invoices/${encodeURIComponent(id)}`,
       data
     );
   }

   /**
    * Search purchases
    */
   async searchPurchases(params: SearchParams): Promise<SearchResponse<Purchase>> {
     const query = new URLSearchParams({
       ...(params.query && { query: params.query }),
       page: String(params.page),
       limit: String(Math.min(params.limit, 100)),
     });

     return this.request<SearchResponse<Purchase>>(
       "GET",
       `/purchases?${query.toString()}`
     );
   }

   /**
    * Get purchase by ID
    */
   async getPurchase(id: string): Promise<Purchase> {
     return this.request<Purchase>("GET", `/purchases/${encodeURIComponent(id)}`);
   }

   /**
    * Create purchase
    */
   async createPurchase(data: CreatePurchase): Promise<Purchase> {
     return this.request<Purchase>("POST", "/purchases", data);
   }

   /**
    * Update purchase
    */
   async updatePurchase(id: string, data: UpdatePurchase): Promise<Purchase> {
     return this.request<Purchase>(
       "PUT",
       `/purchases/${encodeURIComponent(id)}`,
       data
     );
   }

   /**
    * Search orders
    */
   async searchOrders(params: SearchParams): Promise<SearchResponse<Order>> {
     const query = new URLSearchParams({
       ...(params.query && { query: params.query }),
       page: String(params.page),
       limit: String(Math.min(params.limit, 100)),
     });

     return this.request<SearchResponse<Order>>(
       "GET",
       `/orders?${query.toString()}`
     );
   }

   /**
    * Get order by ID
    */
   async getOrder(id: string): Promise<Order> {
     return this.request<Order>("GET", `/orders/${encodeURIComponent(id)}`);
   }

   /**
    * Create order
    */
   async createOrder(data: CreateOrder): Promise<Order> {
     return this.request<Order>("POST", "/orders", data);
   }

   /**
    * Update order
    */
   async updateOrder(id: string, data: UpdateOrder): Promise<Order> {
     return this.request<Order>(
       "PUT",
       `/orders/${encodeURIComponent(id)}`,
       data
     );
   }

   /**
    * Search banking accounts
    */
   async searchBankingAccounts(): Promise<SearchResponse<BankingAccount>> {
     return this.request<SearchResponse<BankingAccount>>(
       "GET",
       "/banking-accounts"
     );
   }

   /**
    * Get banking account by ID
    */
   async getBankingAccount(id: string): Promise<BankingAccount> {
     return this.request<BankingAccount>("GET", `/banking-accounts/${encodeURIComponent(id)}`);
   }

   /**
    * Search banking transactions for an account
    */
   async searchBankingTransactions(
     accountId: string,
     params: SearchParams
   ): Promise<SearchResponse<BankingTransaction>> {
     const query = new URLSearchParams({
       ...(params.query && { query: params.query }),
       page: String(params.page),
       limit: String(Math.min(params.limit, 100)),
     });

     return this.request<SearchResponse<BankingTransaction>>(
       "GET",
       `/banking-accounts/${encodeURIComponent(accountId)}/transactions?${query.toString()}`
     );
   }

   // ============================================================================
   // TIME DOMAIN
   // ============================================================================

   /**
    * Search expense reports
    */
   async searchExpenseReports(
     params: SearchParams
   ): Promise<SearchResponse<ExpenseReport>> {
     const query = new URLSearchParams({
       ...(params.query && { query: params.query }),
       page: String(params.page),
       limit: String(Math.min(params.limit, 100)),
     });

     return this.request<SearchResponse<ExpenseReport>>(
       "GET",
       `/expense-reports?${query.toString()}`
     );
   }

   /**
    * Get expense report by ID
    */
   async getExpenseReport(id: string): Promise<ExpenseReport> {
     return this.request<ExpenseReport>(
       "GET",
       `/expense-reports/${encodeURIComponent(id)}`
     );
   }

   /**
    * Create expense report
    */
   async createExpenseReport(data: CreateExpenseReport): Promise<ExpenseReport> {
     return this.request<ExpenseReport>("POST", "/expense-reports", data);
   }

   /**
    * Update expense report
    */
   async updateExpenseReport(
     id: string,
     data: UpdateExpenseReport
   ): Promise<ExpenseReport> {
     return this.request<ExpenseReport>(
       "PUT",
       `/expense-reports/${encodeURIComponent(id)}`,
       data
     );
   }

   /**
    * Certify expense report
    */
   async certifyExpenseReport(id: string): Promise<ExpenseReport> {
     return this.request<ExpenseReport>(
       "POST",
       `/expense-reports/${encodeURIComponent(id)}/certify`
     );
   }

    /**
     * Reject expense report
     */
    async rejectExpenseReport(id: string, reason: string): Promise<ExpenseReport> {
      return this.request<ExpenseReport>(
        "POST",
        `/expense-reports/${encodeURIComponent(id)}/reject`,
        { reason }
      );
    }

    // ============================================================================
    // ADMIN DOMAIN
    // ============================================================================

    /**
     * Search agencies
     */
    async searchAgencies(params: SearchParams): Promise<SearchResponse<Agency>> {
      const query = new URLSearchParams({
        ...(params.query && { query: params.query }),
        page: String(params.page),
        limit: String(Math.min(params.limit, 100)),
      });

      return this.request<SearchResponse<Agency>>(
        "GET",
        `/agencies?${query.toString()}`
      );
    }

    /**
     * Get agency by ID
     */
    async getAgency(id: string): Promise<Agency> {
      return this.request<Agency>("GET", `/agencies/${encodeURIComponent(id)}`);
    }

    /**
     * Create agency
     */
    async createAgency(data: CreateAgency): Promise<Agency> {
      return this.request<Agency>("POST", "/agencies", data);
    }

    /**
     * Update agency
     */
    async updateAgency(id: string, data: UpdateAgency): Promise<Agency> {
      return this.request<Agency>(
        "PUT",
        `/agencies/${encodeURIComponent(id)}`,
        data
      );
    }

    /**
     * Search business units
     */
    async searchBusinessUnits(params: SearchParams): Promise<SearchResponse<BusinessUnit>> {
      const query = new URLSearchParams({
        ...(params.query && { query: params.query }),
        page: String(params.page),
        limit: String(Math.min(params.limit, 100)),
      });

      return this.request<SearchResponse<BusinessUnit>>(
        "GET",
        `/business-units?${query.toString()}`
      );
    }

    /**
     * Get business unit by ID
     */
    async getBusinessUnit(id: string): Promise<BusinessUnit> {
      return this.request<BusinessUnit>("GET", `/business-units/${encodeURIComponent(id)}`);
    }

    /**
     * Create business unit
     */
    async createBusinessUnit(data: CreateBusinessUnit): Promise<BusinessUnit> {
      return this.request<BusinessUnit>("POST", "/business-units", data);
    }

    /**
     * Update business unit
     */
    async updateBusinessUnit(id: string, data: UpdateBusinessUnit): Promise<BusinessUnit> {
      return this.request<BusinessUnit>(
        "PUT",
        `/business-units/${encodeURIComponent(id)}`,
        data
      );
    }

    /**
     * Search accounts
     */
    async searchAccounts(params: SearchParams): Promise<SearchResponse<Account>> {
      const query = new URLSearchParams({
        ...(params.query && { query: params.query }),
        page: String(params.page),
        limit: String(Math.min(params.limit, 100)),
      });

      return this.request<SearchResponse<Account>>(
        "GET",
        `/accounts?${query.toString()}`
      );
    }

    /**
     * Get account by ID
     */
    async getAccount(id: string): Promise<Account> {
      return this.request<Account>("GET", `/accounts/${encodeURIComponent(id)}`);
    }

    /**
     * Create account
     */
    async createAccount(data: CreateAccount): Promise<Account> {
      return this.request<Account>("POST", "/accounts", data);
    }

    /**
     * Update account
     */
    async updateAccount(id: string, data: UpdateAccount): Promise<Account> {
      return this.request<Account>(
        "PUT",
        `/accounts/${encodeURIComponent(id)}`,
        data
      );
    }

    // ============================================================================
    // DOCUMENTS DOMAIN
    // ============================================================================

    /**
     * Search documents
     */
    async searchDocuments(params: SearchParams): Promise<SearchResponse<Document>> {
      const query = new URLSearchParams({
        ...(params.query && { query: params.query }),
        page: String(params.page),
        limit: String(Math.min(params.limit, 100)),
      });

      return this.request<SearchResponse<Document>>(
        "GET",
        `/documents?${query.toString()}`
      );
    }

    /**
     * Get document by ID
     */
    async getDocument(id: string): Promise<Document> {
      return this.request<Document>("GET", `/documents/${encodeURIComponent(id)}`);
    }

    /**
     * Update document
     */
    async updateDocument(id: string, data: UpdateDocument): Promise<Document> {
      return this.request<Document>(
        "PUT",
        `/documents/${encodeURIComponent(id)}`,
        data
      );
    }

    // ============================================================================
    // SYSTEM DOMAIN
    // ============================================================================

    /**
     * Search apps
     */
    async searchApps(params: SearchParams): Promise<SearchResponse<App>> {
      const query = new URLSearchParams({
        ...(params.query && { query: params.query }),
        page: String(params.page),
        limit: String(Math.min(params.limit, 100)),
      });

      return this.request<SearchResponse<App>>(
        "GET",
        `/apps?${query.toString()}`
      );
    }

    /**
     * Get app by ID
     */
    async getApp(id: string): Promise<App> {
      return this.request<App>("GET", `/apps/${encodeURIComponent(id)}`);
    }

    /**
     * Install app
     */
    async installApp(id: string): Promise<App> {
      return this.request<App>(
        "POST",
        `/apps/${encodeURIComponent(id)}/install`
      );
    }

    /**
     * Uninstall app
     */
    async uninstallApp(id: string): Promise<void> {
      await this.request<void>(
        "POST",
        `/apps/${encodeURIComponent(id)}/uninstall`
      );
    }

    /**
     * Get current user
     */
    async getCurrentUser(): Promise<Account> {
      return this.request<Account>("GET", "/me");
    }

    /**
     * Search settings
     */
    async searchSettings(): Promise<SearchResponse<Setting>> {
      return this.request<SearchResponse<Setting>>(
        "GET",
        "/settings"
      );
    }

    /**
     * Update setting
     */
    async updateSetting(id: string, data: UpdateSetting): Promise<Setting> {
      return this.request<Setting>(
        "PUT",
        `/settings/${encodeURIComponent(id)}`,
        data
      );
    }

    /**
     * Search alerts
     */
    async searchAlerts(params: SearchParams): Promise<SearchResponse<Alert>> {
      const query = new URLSearchParams({
        ...(params.query && { query: params.query }),
        page: String(params.page),
        limit: String(Math.min(params.limit, 100)),
      });

      return this.request<SearchResponse<Alert>>(
        "GET",
        `/alerts?${query.toString()}`
      );
    }

    async getAlert(id: string): Promise<Alert> {
      return this.request<Alert>("GET", `/alerts/${encodeURIComponent(id)}`);
    }

    async updateAlert(id: string, data: { resolved?: boolean }): Promise<Alert> {
      return this.request<Alert>(
        "PUT",
        `/alerts/${encodeURIComponent(id)}`,
        data
      );
    }
}
