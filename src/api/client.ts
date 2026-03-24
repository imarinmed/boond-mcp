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

import { createHmac } from 'crypto';

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
  Flag,
  Perimeter,
  CurrentUser,
} from '../types/boond.js';
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
  SearchExpenseReports,
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
} from '../types/schemas.js';
import { classifyError } from '../utils/error-classification.js';

type BoondJwtMode = 'normal' | 'god';

type JsonApiEntity = {
  id: string;
  attributes?: Record<string, unknown>;
  relationships?: unknown;
};

function toCamelCase(value: string): string {
  return value.replace(/[_-]([a-z])/g, (_, char: string) => char.toUpperCase());
}

function normalizeKeys(record: Record<string, unknown>): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    normalized[toCamelCase(key)] = value;
  }
  return normalized;
}

function extractRelationshipIds(relationships: unknown): Record<string, unknown> {
  if (!relationships || typeof relationships !== 'object') {
    return {};
  }

  const output: Record<string, unknown> = {};
  for (const [relName, relValue] of Object.entries(relationships as Record<string, unknown>)) {
    if (!relValue || typeof relValue !== 'object' || !('data' in relValue)) {
      continue;
    }

    const data = (relValue as { data?: unknown }).data;
    const normalizedName = toCamelCase(relName);

    if (Array.isArray(data)) {
      const ids = data
        .map(item => {
          if (item && typeof item === 'object' && 'id' in item) {
            return String((item as { id: unknown }).id);
          }
          return undefined;
        })
        .filter((id): id is string => Boolean(id));

      if (ids.length > 0) {
        output[`${normalizedName}Ids`] = ids;
      }
      continue;
    }

    if (data && typeof data === 'object' && 'id' in data) {
      output[`${normalizedName}Id`] = String((data as { id: unknown }).id);
    }
  }

  return output;
}

function applyAliases(record: Record<string, unknown>): Record<string, unknown> {
  const aliases: Array<{ target: string; sources: string[] }> = [
    {
      target: 'status',
      sources: [
        'state',
        'workflowState',
        'currentState',
        'activity',
        'enabled',
        'validationStatus',
        'workflowStatus',
      ],
    },
    { target: 'email', sources: ['email1', 'email_1', 'mail', 'primaryEmail'] },
    { target: 'firstName', sources: ['firstname', 'givenName'] },
    { target: 'lastName', sources: ['lastname', 'familyName'] },
    {
      target: 'name',
      sources: ['title', 'reference', 'label', 'projectName', 'projectTitle', 'fullName'],
    },
    { target: 'companyId', sources: ['clientId', 'customerId', 'accountId'] },
    { target: 'projectId', sources: ['missionId', 'assignmentId'] },
    { target: 'resourceId', sources: ['dependsOnId', 'consultantId'] },
    { target: 'total', sources: ['amount', 'amountTotal', 'totalAmount', 'sum'] },
    {
      target: 'dailyRate',
      sources: [
        'rate',
        'tjm',
        'dailySellRate',
        'salesDailyRate',
        'saleDailyRate',
        'averageDailyRate',
      ],
    },
    { target: 'hourlyRate', sources: ['hourRate'] },
    {
      target: 'salaryAnnual',
      sources: ['annualSalary', 'yearlySalary', 'salary', 'grossAnnualSalary'],
    },
    {
      target: 'hours',
      sources: ['duration', 'workedHours', 'quantity', 'time', 'nbHours', 'numberOfHours'],
    },
    { target: 'date', sources: ['workDate', 'day', 'workedOn', 'reportedAt', 'startsAt'] },
  ];

  for (const alias of aliases) {
    if (record[alias.target] !== undefined && record[alias.target] !== null) {
      continue;
    }

    const sourceKey = alias.sources.find(
      source => record[source] !== undefined && record[source] !== null
    );
    if (sourceKey) {
      record[alias.target] = record[sourceKey];
    }
  }

  if (!record['fullName']) {
    const firstName = typeof record['firstName'] === 'string' ? record['firstName'] : '';
    const lastName = typeof record['lastName'] === 'string' ? record['lastName'] : '';
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName.length > 0) {
      record['fullName'] = fullName;
    }
  }

  if (!record['email']) {
    const emails = record['emails'];
    if (Array.isArray(emails)) {
      const firstEmail = emails.find(value => typeof value === 'string') as string | undefined;
      if (firstEmail) {
        record['email'] = firstEmail;
      }
    } else if (emails && typeof emails === 'object') {
      const candidate = Object.values(emails as Record<string, unknown>).find(
        value => typeof value === 'string'
      );
      if (typeof candidate === 'string') {
        record['email'] = candidate;
      }
    }
  }

  if (record['status'] === undefined || record['status'] === null) {
    const isActive = record['isActive'];
    if (typeof isActive === 'boolean') {
      record['status'] = isActive ? 'active' : 'inactive';
    }
  }

  return record;
}

function normalizeJsonApiEntity(entity: JsonApiEntity): Record<string, unknown> {
  const normalizedAttributes = normalizeKeys(entity.attributes ?? {});
  const relationshipIds = extractRelationshipIds(entity.relationships);
  return applyAliases({
    id: entity.id,
    ...normalizedAttributes,
    ...relationshipIds,
  });
}

function getApiStatusCode(error: unknown): number | undefined {
  if (!error || typeof error !== 'object' || !('statusCode' in error)) {
    return undefined;
  }

  const status = (error as { statusCode?: unknown }).statusCode;
  return typeof status === 'number' ? status : undefined;
}

function shouldShortCircuitFallback(error: unknown): boolean {
  const classification = classifyError(error).classification;
  return classification === 'permission_denied' || classification === 'provider_blocked';
}

function toYearMonth(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value.slice(0, 7);
  }

  const year = parsed.getUTCFullYear();
  const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

type BoondAuthConfig =
  | {
      type: 'x-token';
      apiToken: string;
    }
  | {
      type: 'x-jwt-client';
      clientToken: string;
      clientKey: string;
      userToken: string;
      mode?: BoondJwtMode;
    };

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
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * 400 Bad Request error
 */
export class BadRequestError extends ApiError {
  constructor(message: string, code: string = 'BAD_REQUEST') {
    super(400, message, code);
    this.name = 'BadRequestError';
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

/**
 * 401 Authentication error
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication failed', code: string = 'AUTH_ERROR') {
    super(401, message, code);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * 404 Not Found error
 */
export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found', code: string = 'NOT_FOUND') {
    super(404, message, code);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * 422 Validation error
 */
export class ValidationError extends ApiError {
  constructor(message: string = 'Validation failed', code: string = 'VALIDATION_ERROR') {
    super(422, message, code);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * 500 Server error
 */
export class ServerError extends ApiError {
  constructor(message: string = 'Server error', code: string = 'SERVER_ERROR') {
    super(500, message, code);
    this.name = 'ServerError';
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

/**
 * BoondManager API Client
 * Handles all API requests with authentication and error handling
 */
export class BoondAPIClient {
  private baseUrl: string;
  private authConfig: BoondAuthConfig;
  private requestTimeout: number;

  constructor(
    authOrToken: BoondAuthConfig | string,
    baseUrl: string = process.env['BOOND_API_URL'] || 'https://ui.boondmanager.com/api',
    requestTimeout: number = 30000
  ) {
    this.baseUrl = baseUrl;
    this.authConfig =
      typeof authOrToken === 'string' ? { type: 'x-token', apiToken: authOrToken } : authOrToken;
    this.requestTimeout = requestTimeout;
  }

  private static base64UrlEncode(input: string): string {
    return Buffer.from(input)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  private generateJwtClientHeader(): string {
    if (this.authConfig.type !== 'x-jwt-client') {
      throw new AuthenticationError('Invalid authentication configuration');
    }

    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const payload = {
      userToken: this.authConfig.userToken,
      clientToken: this.authConfig.clientToken,
      time: Math.floor(Date.now() / 1000),
      mode: this.authConfig.mode || 'normal',
    };

    const encodedHeader = BoondAPIClient.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = BoondAPIClient.base64UrlEncode(JSON.stringify(payload));
    const dataToSign = `${encodedHeader}.${encodedPayload}`;
    const signature = createHmac('sha256', this.authConfig.clientKey)
      .update(dataToSign)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return `${dataToSign}.${signature}`;
  }

  private buildAuthHeaders(): Record<string, string> {
    if (this.authConfig.type === 'x-jwt-client') {
      return {
        'X-Jwt-Client-Boondmanager': this.generateJwtClientHeader(),
      };
    }

    return {
      // Legacy compatibility
      'X-Token': this.authConfig.apiToken,
      // Official Boond header name
      'X-Token-BoondManager': this.authConfig.apiToken,
    };
  }

  /**
   * Internal request method
   * Handles HTTP requests with auth headers and error handling
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': 'boond-mcp/1.0.0 (https://github.com/imarinmed/boond-mcp)',
      ...this.buildAuthHeaders(),
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

      const options: RequestInit = {
        method,
        headers,
        signal: controller.signal,
      };

      if (body !== undefined && method !== 'GET') {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        let errorData: unknown;
        const contentType = response.headers.get('content-type');

        try {
          if (contentType?.includes('application/json')) {
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
              'Bad request error:',
              typeof errorData === 'object' ? JSON.stringify(errorData) : errorData
            );
            throw new BadRequestError(
              typeof errorData === 'object' && errorData !== null && 'message' in errorData
                ? String((errorData as Record<string, unknown>)['message'])
                : 'Bad request'
            );

          case 401:
            console.error('Authentication error');
            throw new AuthenticationError('Invalid API credentials or authentication failed');

          case 404:
            console.error(
              'Not found error:',
              typeof errorData === 'object' ? JSON.stringify(errorData) : errorData
            );
            throw new NotFoundError('Resource not found');

          case 422:
            console.error(
              'Validation error:',
              typeof errorData === 'object' ? JSON.stringify(errorData) : errorData
            );
            throw new ValidationError(
              typeof errorData === 'object' && errorData !== null && 'message' in errorData
                ? String((errorData as Record<string, unknown>)['message'])
                : 'Validation failed'
            );

          case 500:
          case 502:
          case 503:
          case 504:
            console.error(
              'Server error:',
              typeof errorData === 'object' ? JSON.stringify(errorData) : errorData
            );
            throw new ServerError(`Server error: HTTP ${response.status}`);

          case 403: {
            const bodyText = typeof errorData === 'string' ? errorData : JSON.stringify(errorData);
            const isCloudflare = /cloudflare|attention required|just a moment/i.test(bodyText);
            const message = isCloudflare
              ? 'Forbidden by Cloudflare/WAF while reaching Boond API. Verify API host, auth mode, and endpoint permissions.'
              : 'Forbidden: insufficient permissions for this endpoint';

            throw new ApiError(403, message, isCloudflare ? 'CLOUDFLARE_BLOCK' : 'FORBIDDEN');
          }

          case 405:
            throw new ApiError(
              405,
              `Method not allowed for endpoint ${endpoint}. Verify Boond API method/path compatibility.`,
              'METHOD_NOT_ALLOWED'
            );

          default:
            console.error(
              `HTTP ${response.status} error:`,
              typeof errorData === 'object' ? JSON.stringify(errorData) : errorData
            );
            throw new ApiError(
              response.status,
              `HTTP ${response.status}: ${typeof errorData === 'string' ? errorData : 'Unknown error'}`,
              'HTTP_ERROR'
            );
        }
      }

      // Parse successful response
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new ApiError(
          response.status,
          'Invalid response format: expected JSON',
          'INVALID_RESPONSE'
        );
      }

      const rawData = (await response.json()) as unknown;

      // Transform JSON:API format (Boond /api/* responses) to internal SearchResponse format
      // Transform JSON:API list format: { meta: { totals: { rows } }, data: [...] }
      if (
        rawData !== null &&
        typeof rawData === 'object' &&
        'meta' in rawData &&
        'data' in rawData &&
        Array.isArray((rawData as Record<string, unknown>)['data'])
      ) {
        const jsonApi = rawData as {
          meta: { totals?: { rows?: number }; [key: string]: unknown };
          data: Array<{
            id: string;
            type?: string;
            attributes?: Record<string, unknown>;
            relationships?: unknown;
          }>;
        };
        const rows = jsonApi.meta?.totals?.rows ?? jsonApi.data.length;
        const transformed = {
          data: jsonApi.data.map(item => normalizeJsonApiEntity(item)),
          pagination: {
            page: 1,
            limit: jsonApi.data.length || 25,
            total: rows,
          },
        };
        return transformed as T;
      }

      // Transform JSON:API single-item format: { meta: {...}, data: { id, attributes } }
      if (
        rawData !== null &&
        typeof rawData === 'object' &&
        'data' in rawData &&
        !Array.isArray((rawData as Record<string, unknown>)['data']) &&
        typeof (rawData as Record<string, unknown>)['data'] === 'object' &&
        (rawData as Record<string, unknown>)['data'] !== null
      ) {
        const jsonApi = rawData as {
          meta?: Record<string, unknown>;
          data: {
            id: string;
            type?: string;
            attributes?: Record<string, unknown>;
            relationships?: unknown;
          };
        };
        return normalizeJsonApiEntity(jsonApi.data) as T;
      }

      return rawData as T;
    } catch (error) {
      // Re-throw API errors
      if (error instanceof ApiError) {
        throw error;
      }

      // Handle timeout errors
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError(0, `Request timeout after ${this.requestTimeout}ms`, 'TIMEOUT_ERROR');
      }

      // Log and wrap network errors
      if (error instanceof TypeError) {
        console.error('Network error:', error.message);
        throw new ApiError(0, `Network error: ${error.message}`, 'NETWORK_ERROR');
      }

      // Log and wrap unexpected errors
      console.error('Unexpected error:', error instanceof Error ? error.message : String(error));
      throw new ApiError(0, 'Unexpected error', 'UNEXPECTED_ERROR');
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

    return this.request<SearchResponse<Candidate>>('GET', `/candidates?${query.toString()}`);
  }

  /**
   * Get candidate by ID
   */
  async getCandidate(id: string): Promise<Candidate> {
    return this.request<Candidate>('GET', `/candidates/${encodeURIComponent(id)}`);
  }

  async getCandidateInformation(id: string): Promise<Candidate> {
    return this.request<Candidate>('GET', `/candidates/${encodeURIComponent(id)}/information`);
  }

  async getCandidateDefault(): Promise<Candidate> {
    return this.request<Candidate>('GET', '/candidates/default');
  }

  /**
   * Create candidate
   */
  async createCandidate(data: CreateCandidate): Promise<Candidate> {
    return this.request<Candidate>('POST', '/candidates', data);
  }

  /**
   * Update candidate
   */
  async updateCandidate(id: string, data: UpdateCandidate): Promise<Candidate> {
    return this.request<Candidate>('PUT', `/candidates/${encodeURIComponent(id)}`, data);
  }

  /**
   * Delete candidate
   */
  async deleteCandidate(id: string): Promise<void> {
    await this.request<void>('DELETE', `/candidates/${encodeURIComponent(id)}`);
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

    return this.request<SearchResponse<Company>>('GET', `/companies?${query.toString()}`);
  }

  /**
   * Get company by ID
   */
  async getCompany(id: string): Promise<Company> {
    return this.request<Company>('GET', `/companies/${encodeURIComponent(id)}`);
  }

  async getCompanyContacts(id: string): Promise<SearchResponse<Contact>> {
    return this.request<SearchResponse<Contact>>(
      'GET',
      `/companies/${encodeURIComponent(id)}/contacts`
    );
  }

  async getCompanyDefault(): Promise<Company> {
    return this.request<Company>('GET', '/companies/default');
  }

  /**
   * Create company
   */
  async createCompany(data: CreateCompany): Promise<Company> {
    return this.request<Company>('POST', '/companies', data);
  }

  /**
   * Update company
   */
  async updateCompany(id: string, data: UpdateCompany): Promise<Company> {
    return this.request<Company>('PUT', `/companies/${encodeURIComponent(id)}`, data);
  }

  /**
   * Delete company
   */
  async deleteCompany(id: string): Promise<void> {
    await this.request<void>('DELETE', `/companies/${encodeURIComponent(id)}`);
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

    return this.request<SearchResponse<Opportunity>>('GET', `/opportunities?${query.toString()}`);
  }

  /**
   * Get opportunity by ID
   */
  async getOpportunity(id: string): Promise<Opportunity> {
    return this.request<Opportunity>('GET', `/opportunities/${encodeURIComponent(id)}`);
  }

  async getOpportunityQuotations(id: string): Promise<SearchResponse<Quotation>> {
    return this.request<SearchResponse<Quotation>>(
      'GET',
      `/opportunities/${encodeURIComponent(id)}/quotations`
    );
  }

  async getOpportunityDefault(): Promise<Opportunity> {
    return this.request<Opportunity>('GET', '/opportunities/default');
  }

  /**
   * Create opportunity
   */
  async createOpportunity(data: CreateOpportunity): Promise<Opportunity> {
    return this.request<Opportunity>('POST', '/opportunities', data);
  }

  /**
   * Update opportunity
   */
  async updateOpportunity(id: string, data: UpdateOpportunity): Promise<Opportunity> {
    return this.request<Opportunity>('PUT', `/opportunities/${encodeURIComponent(id)}`, data);
  }

  /**
   * Delete opportunity
   */
  async deleteOpportunity(id: string): Promise<void> {
    await this.request<void>('DELETE', `/opportunities/${encodeURIComponent(id)}`);
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
      'GET',
      `/apps/quotations/quotations?${query.toString()}`
    );
  }

  /**
   * Get quotation by ID
   */
  async getQuotation(id: string): Promise<Quotation> {
    return this.request<Quotation>('GET', `/apps/quotations/quotations/${encodeURIComponent(id)}`);
  }

  /**
   * Create quotation
   */
  async createQuotation(data: CreateQuotation): Promise<Quotation> {
    return this.request<Quotation>('POST', '/quotations', data);
  }

  /**
   * Update quotation
   */
  async updateQuotation(id: string, data: UpdateQuotation): Promise<Quotation> {
    return this.request<Quotation>('PUT', `/quotations/${encodeURIComponent(id)}`, data);
  }

  /**
   * Delete quotation
   */
  async deleteQuotation(id: string): Promise<void> {
    await this.request<void>('DELETE', `/quotations/${encodeURIComponent(id)}`);
  }

  /**
   * Send quotation
   */
  async sendQuotation(id: string): Promise<Quotation> {
    return this.request<Quotation>('POST', `/quotations/${encodeURIComponent(id)}/send`);
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

    return this.request<SearchResponse<Contact>>('GET', `/contacts?${query.toString()}`);
  }

  /**
   * Get contact by ID
   */
  async getContact(id: string): Promise<Contact> {
    return this.request<Contact>('GET', `/contacts/${encodeURIComponent(id)}`);
  }

  /**
   * Create contact
   */
  async createContact(data: CreateContact): Promise<Contact> {
    return this.request<Contact>('POST', '/contacts', data);
  }

  /**
   * Update contact
   */
  async updateContact(id: string, data: UpdateContact): Promise<Contact> {
    return this.request<Contact>('PUT', `/contacts/${encodeURIComponent(id)}`, data);
  }

  /**
   * Delete contact
   */
  async deleteContact(id: string): Promise<void> {
    await this.request<void>('DELETE', `/contacts/${encodeURIComponent(id)}`);
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

    return this.request<SearchResponse<Resource>>('GET', `/resources?${query.toString()}`);
  }

  /**
   * Get resource by ID
   */
  async getResource(id: string): Promise<Resource> {
    const resource = await this.request<Resource>('GET', `/resources/${encodeURIComponent(id)}`);

    const resourceRecord = resource as unknown as Record<string, unknown>;
    const hasEmail =
      typeof resourceRecord['email'] === 'string' || typeof resourceRecord['email1'] === 'string';
    const hasStatus =
      resourceRecord['status'] !== undefined || resourceRecord['state'] !== undefined;

    if (hasEmail && hasStatus) {
      return resource;
    }

    const fallbackEndpoints = [
      `/resources-information/${encodeURIComponent(id)}`,
      `/resourcesInformation/${encodeURIComponent(id)}`,
      `/resources/${encodeURIComponent(id)}/information`,
      `/resources/${encodeURIComponent(id)}/profile`,
    ];

    let merged = resource as unknown as Record<string, unknown>;

    for (const endpoint of fallbackEndpoints) {
      try {
        const info = await this.request<Record<string, unknown>>('GET', endpoint);
        merged = {
          ...merged,
          ...info,
        };
        if (merged['email'] || merged['email1'] || merged['status'] || merged['state']) {
          break;
        }
      } catch {
        continue;
      }
    }

    return merged as unknown as Resource;
  }

  async getResourceContracts(id: string): Promise<SearchResponse<Contract>> {
    return this.request<SearchResponse<Contract>>(
      'GET',
      `/resources/${encodeURIComponent(id)}/contracts`
    );
  }

  /**
   * Create resource
   */
  async createResource(data: CreateResource): Promise<Resource> {
    return this.request<Resource>('POST', '/resources', data);
  }

  /**
   * Update resource
   */
  async updateResource(id: string, data: UpdateResource): Promise<Resource> {
    return this.request<Resource>('PUT', `/resources/${encodeURIComponent(id)}`, data);
  }

  /**
   * Delete resource
   */
  async deleteResource(id: string): Promise<void> {
    await this.request<void>('DELETE', `/resources/${encodeURIComponent(id)}`);
  }

  /**
   * Search contracts
   */
  async searchContracts(params: SearchParams): Promise<SearchResponse<Contract>> {
    const query = new URLSearchParams({
      page: String(params.page),
      limit: String(Math.min(params.limit, 100)),
    });

    return this.request<SearchResponse<Contract>>(
      'GET',
      `/apps/contracts/contracts?${query.toString()}`
    );
  }

  /**
   * Get contract by ID
   */
  async getContract(id: string): Promise<Contract> {
    return this.request<Contract>('GET', `/contracts/${encodeURIComponent(id)}`);
  }

  /**
   * Create contract
   */
  async createContract(data: CreateContract): Promise<Contract> {
    return this.request<Contract>('POST', '/contracts', data);
  }

  /**
   * Update contract
   */
  async updateContract(id: string, data: UpdateContract): Promise<Contract> {
    return this.request<Contract>('PUT', `/contracts/${encodeURIComponent(id)}`, data);
  }

  /**
   * Delete contract
   */
  async deleteContract(id: string): Promise<void> {
    await this.request<void>('DELETE', `/contracts/${encodeURIComponent(id)}`);
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

    return this.request<SearchResponse<Project>>('GET', `/projects?${query.toString()}`);
  }

  /**
   * Get project by ID
   */
  async getProject(id: string): Promise<Project> {
    return this.request<Project>('GET', `/projects/${encodeURIComponent(id)}`);
  }

  async getProjectDeliveries(id: string): Promise<SearchResponse<Delivery>> {
    return this.request<SearchResponse<Delivery>>(
      'GET',
      `/projects/${encodeURIComponent(id)}/deliveries`
    );
  }

  async getProjectDefault(): Promise<Project> {
    return this.request<Project>('GET', '/projects/default');
  }

  /**
   * Create project
   */
  async createProject(data: CreateProject): Promise<Project> {
    return this.request<Project>('POST', '/projects', data);
  }

  /**
   * Update project
   */
  async updateProject(id: string, data: UpdateProject): Promise<Project> {
    return this.request<Project>('PUT', `/projects/${encodeURIComponent(id)}`, data);
  }

  /**
   * Delete project
   */
  async deleteProject(id: string): Promise<void> {
    await this.request<void>('DELETE', `/projects/${encodeURIComponent(id)}`);
  }

  /**
   * Search time reports
   */
  async searchTimeReports(params: SearchTimeReports): Promise<SearchResponse<TimeReport>> {
    const currentMonth = toYearMonth(new Date().toISOString());
    const startMonth =
      params.startMonth || (params.startDate ? toYearMonth(params.startDate) : currentMonth);
    const endMonth = params.endMonth || (params.endDate ? toYearMonth(params.endDate) : startMonth);

    const query = new URLSearchParams({
      ...(params.resourceId && { resourceId: params.resourceId }),
      startMonth,
      endMonth,
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate }),
      ...(params.status && { status: params.status }),
      page: String(params.page),
      limit: String(Math.min(params.limit, 100)), // Cap at 100
    });

    try {
      return await this.request<SearchResponse<TimeReport>>(
        'GET',
        `/times-reports?${query.toString()}`
      );
    } catch (error) {
      const statusCode = getApiStatusCode(error);
      if (statusCode === 404 || statusCode === 405 || statusCode === 422) {
        return this.request<SearchResponse<TimeReport>>('GET', `/time-reports?${query.toString()}`);
      }
      throw error;
    }
  }

  /**
   * Get time report by ID
   */
  async getTimeReport(id: string): Promise<TimeReport> {
    try {
      return await this.request<TimeReport>('GET', `/times-reports/${encodeURIComponent(id)}`);
    } catch (error) {
      const statusCode = getApiStatusCode(error);
      if (statusCode === 404 || statusCode === 405) {
        return this.request<TimeReport>('GET', `/time-reports/${encodeURIComponent(id)}`);
      }
      throw error;
    }
  }

  /**
   * Create time report
   */
  async createTimeReport(data: CreateTimeReport): Promise<TimeReport> {
    try {
      return await this.request<TimeReport>('POST', '/times-reports', data);
    } catch (error) {
      const statusCode = getApiStatusCode(error);
      if (statusCode === 404 || statusCode === 405) {
        return this.request<TimeReport>('POST', '/time-reports', data);
      }
      throw error;
    }
  }

  /**
   * Update time report
   */
  async updateTimeReport(id: string, data: UpdateTimeReport): Promise<TimeReport> {
    return this.request<TimeReport>('PUT', `/time-reports/${encodeURIComponent(id)}`, data);
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

    return this.request<SearchResponse<Absence>>('GET', `/absences?${query.toString()}`);
  }

  /**
   * Get absence by ID
   */
  async getAbsence(id: string): Promise<Absence> {
    return this.request<Absence>('GET', `/absences/${encodeURIComponent(id)}`);
  }

  /**
   * Create absence
   */
  async createAbsence(data: CreateAbsence): Promise<Absence> {
    return this.request<Absence>('POST', '/absences', data);
  }

  /**
   * Update absence
   */
  async updateAbsence(id: string, data: UpdateAbsence): Promise<Absence> {
    return this.request<Absence>('PUT', `/absences/${encodeURIComponent(id)}`, data);
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
      ...(params.query && { keywords: params.query }),
      page: String(params.page),
      limit: String(Math.min(params.limit, 100)),
    });

    const listEndpoints: Array<{
      method: 'GET' | 'POST';
      path: string;
      body?: Record<string, unknown>;
    }> = [
      { method: 'GET', path: `/deliveries-groupments?${query.toString()}` },
      { method: 'GET', path: `/deliveries?${query.toString()}` },
      { method: 'GET', path: `/deliveries/search?${query.toString()}` },
      {
        method: 'POST',
        path: '/deliveries/search',
        body: {
          ...(params.query ? { query: params.query } : {}),
          ...(params.query ? { keywords: params.query } : {}),
          page: params.page,
          limit: Math.min(params.limit, 100),
        },
      },
    ];

    let lastError: unknown;
    for (const endpoint of listEndpoints) {
      try {
        return await this.request<SearchResponse<Delivery>>(
          endpoint.method,
          endpoint.path,
          endpoint.body
        );
      } catch (error) {
        const statusCode = getApiStatusCode(error);
        if (statusCode !== 404 && statusCode !== 405) {
          throw error;
        }
        lastError = error;
      }
    }

    throw lastError;
  }

  /**
   * Get delivery by ID
   */
  async getDelivery(id: string): Promise<Delivery> {
    return this.request<Delivery>('GET', `/deliveries/${encodeURIComponent(id)}`);
  }

  /**
   * Create delivery
   */
  async createDelivery(data: CreateDelivery): Promise<Delivery> {
    return this.request<Delivery>('POST', '/deliveries', data);
  }

  /**
   * Update delivery
   */
  async updateDelivery(id: string, data: UpdateDelivery): Promise<Delivery> {
    return this.request<Delivery>('PUT', `/deliveries/${encodeURIComponent(id)}`, data);
  }

  /**
   * Send delivery
   */
  async sendDelivery(id: string): Promise<Delivery> {
    return this.request<Delivery>('POST', `/deliveries/${encodeURIComponent(id)}/send`);
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

    return this.request<SearchResponse<Action>>('GET', `/actions?${query.toString()}`);
  }

  /**
   * Get action by ID
   */
  async getAction(id: string): Promise<Action> {
    return this.request<Action>('GET', `/actions/${encodeURIComponent(id)}`);
  }

  /**
   * Create action
   */
  async createAction(data: CreateAction): Promise<Action> {
    return this.request<Action>('POST', '/actions', data);
  }

  /**
   * Update action
   */
  async updateAction(id: string, data: UpdateAction): Promise<Action> {
    return this.request<Action>('PUT', `/actions/${encodeURIComponent(id)}`, data);
  }

  /**
   * Delete action
   */
  async deleteAction(id: string): Promise<void> {
    await this.request<void>('DELETE', `/actions/${encodeURIComponent(id)}`);
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

    return this.request<SearchResponse<Invoice>>('GET', `/invoices?${query.toString()}`);
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(id: string): Promise<Invoice> {
    return this.request<Invoice>('GET', `/invoices/${encodeURIComponent(id)}`);
  }

  async getInvoiceDefault(): Promise<Invoice> {
    return this.request<Invoice>('GET', '/invoices/default');
  }

  /**
   * Create invoice
   */
  async createInvoice(data: CreateInvoice): Promise<Invoice> {
    return this.request<Invoice>('POST', '/invoices', data);
  }

  /**
   * Update invoice
   */
  async updateInvoice(id: string, data: UpdateInvoice): Promise<Invoice> {
    return this.request<Invoice>('PUT', `/invoices/${encodeURIComponent(id)}`, data);
  }

  /**
   * Delete invoice
   */
  async deleteInvoice(id: string): Promise<void> {
    await this.request<void>('DELETE', `/invoices/${encodeURIComponent(id)}`);
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

    return this.request<SearchResponse<Purchase>>('GET', `/purchases?${query.toString()}`);
  }

  /**
   * Get purchase by ID
   */
  async getPurchase(id: string): Promise<Purchase> {
    return this.request<Purchase>('GET', `/purchases/${encodeURIComponent(id)}`);
  }

  /**
   * Create purchase
   */
  async createPurchase(data: CreatePurchase): Promise<Purchase> {
    return this.request<Purchase>('POST', '/purchases', data);
  }

  /**
   * Update purchase
   */
  async updatePurchase(id: string, data: UpdatePurchase): Promise<Purchase> {
    return this.request<Purchase>('PUT', `/purchases/${encodeURIComponent(id)}`, data);
  }

  /**
   * Delete purchase
   */
  async deletePurchase(id: string): Promise<void> {
    await this.request<void>('DELETE', `/purchases/${encodeURIComponent(id)}`);
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

    return this.request<SearchResponse<Order>>('GET', `/orders?${query.toString()}`);
  }

  /**
   * Get order by ID
   */
  async getOrder(id: string): Promise<Order> {
    return this.request<Order>('GET', `/orders/${encodeURIComponent(id)}`);
  }

  /**
   * Create order
   */
  async createOrder(data: CreateOrder): Promise<Order> {
    return this.request<Order>('POST', '/orders', data);
  }

  /**
   * Update order
   */
  async updateOrder(id: string, data: UpdateOrder): Promise<Order> {
    return this.request<Order>('PUT', `/orders/${encodeURIComponent(id)}`, data);
  }

  /**
   * Search banking accounts
   */
  async searchBankingAccounts(): Promise<SearchResponse<BankingAccount>> {
    return this.request<SearchResponse<BankingAccount>>('GET', '/banking-accounts');
  }

  /**
   * Get banking account by ID
   */
  async getBankingAccount(id: string): Promise<BankingAccount> {
    return this.request<BankingAccount>('GET', `/banking-accounts/${encodeURIComponent(id)}`);
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
      'GET',
      `/banking-accounts/${encodeURIComponent(accountId)}/transactions?${query.toString()}`
    );
  }

  // ============================================================================
  // TIME DOMAIN
  // ============================================================================

  /**
   * Search expense reports
   */
  async searchExpenseReports(params: SearchExpenseReports): Promise<SearchResponse<ExpenseReport>> {
    const currentMonth = toYearMonth(new Date().toISOString());
    const startMonth =
      params.startMonth || (params.startDate ? toYearMonth(params.startDate) : currentMonth);
    const endMonth = params.endMonth || (params.endDate ? toYearMonth(params.endDate) : startMonth);

    const today = new Date();
    const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1))
      .toISOString()
      .slice(0, 10);
    const monthEnd = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0))
      .toISOString()
      .slice(0, 10);

    const startDate = params.startDate || monthStart;
    const endDate = params.endDate || monthEnd;

    const queryBase = {
      ...(params.query && { query: params.query }),
      startMonth,
      endMonth,
      startDate,
      endDate,
      dateFrom: startDate,
      dateTo: endDate,
      page: String(params.page),
      limit: String(Math.min(params.limit, 100)),
    };

    const query = new URLSearchParams(queryBase);
    const bodyPayload = {
      ...(params.query ? { query: params.query } : {}),
      startMonth,
      endMonth,
      startDate,
      endDate,
      dateFrom: startDate,
      dateTo: endDate,
      page: params.page,
      limit: Math.min(params.limit, 100),
    };

    const attempts: Array<{
      method: 'GET' | 'POST';
      path: string;
      body?: Record<string, unknown>;
    }> = [
      { method: 'GET', path: `/expenses-reports?${query.toString()}` },
      { method: 'GET', path: `/expense-reports?${query.toString()}` },
      { method: 'GET', path: `/expenses-reports/search?${query.toString()}` },
      { method: 'POST', path: '/expenses-reports/search', body: bodyPayload },
      { method: 'GET', path: `/expense-reports/search?${query.toString()}` },
      { method: 'POST', path: '/expense-reports/search', body: bodyPayload },
    ];

    let lastError: unknown;
    for (const attempt of attempts) {
      try {
        return await this.request<SearchResponse<ExpenseReport>>(
          attempt.method,
          attempt.path,
          attempt.body
        );
      } catch (error) {
        const statusCode = getApiStatusCode(error);
        if (shouldShortCircuitFallback(error)) {
          throw error;
        }
        if (statusCode === 403 || statusCode === 404 || statusCode === 405 || statusCode === 422) {
          lastError = error;
          continue;
        }
        throw error;
      }
    }

    if (lastError) {
      throw new ApiError(
        getApiStatusCode(lastError) ?? 403,
        'All expense report search endpoints returned 403/404/405. This endpoint may require specific permissions or may be unavailable in your Boond instance.',
        'EXPENSE_SEARCH_UNAVAILABLE'
      );
    }

    throw lastError;
  }

  /**
   * Get expense report by ID
   */
  async getExpenseReport(id: string): Promise<ExpenseReport> {
    try {
      return await this.request<ExpenseReport>(
        'GET',
        `/expenses-reports/${encodeURIComponent(id)}`
      );
    } catch (error) {
      const statusCode = getApiStatusCode(error);
      if (statusCode === 404 || statusCode === 405) {
        return this.request<ExpenseReport>('GET', `/expense-reports/${encodeURIComponent(id)}`);
      }
      throw error;
    }
  }

  /**
   * Create expense report
   */
  async createExpenseReport(data: CreateExpenseReport): Promise<ExpenseReport> {
    try {
      return await this.request<ExpenseReport>('POST', '/expenses-reports', data);
    } catch (error) {
      const statusCode = getApiStatusCode(error);
      if (statusCode === 404 || statusCode === 405) {
        return this.request<ExpenseReport>('POST', '/expense-reports', data);
      }
      throw error;
    }
  }

  /**
   * Update expense report
   */
  async updateExpenseReport(id: string, data: UpdateExpenseReport): Promise<ExpenseReport> {
    return this.request<ExpenseReport>('PUT', `/expense-reports/${encodeURIComponent(id)}`, data);
  }

  /**
   * Certify expense report
   */
  async certifyExpenseReport(id: string): Promise<ExpenseReport> {
    return this.request<ExpenseReport>(
      'POST',
      `/expense-reports/${encodeURIComponent(id)}/certify`
    );
  }

  /**
   * Reject expense report
   */
  async rejectExpenseReport(id: string, reason: string): Promise<ExpenseReport> {
    return this.request<ExpenseReport>(
      'POST',
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

    return this.request<SearchResponse<Agency>>('GET', `/agencies?${query.toString()}`);
  }

  /**
   * Get agency by ID
   */
  async getAgency(id: string): Promise<Agency> {
    return this.request<Agency>('GET', `/agencies/${encodeURIComponent(id)}`);
  }

  /**
   * Create agency
   */
  async createAgency(data: CreateAgency): Promise<Agency> {
    return this.request<Agency>('POST', '/agencies', data);
  }

  /**
   * Update agency
   */
  async updateAgency(id: string, data: UpdateAgency): Promise<Agency> {
    return this.request<Agency>('PUT', `/agencies/${encodeURIComponent(id)}`, data);
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

    return this.request<SearchResponse<BusinessUnit>>('GET', `/business-units?${query.toString()}`);
  }

  /**
   * Get business unit by ID
   */
  async getBusinessUnit(id: string): Promise<BusinessUnit> {
    return this.request<BusinessUnit>('GET', `/business-units/${encodeURIComponent(id)}`);
  }

  /**
   * Create business unit
   */
  async createBusinessUnit(data: CreateBusinessUnit): Promise<BusinessUnit> {
    return this.request<BusinessUnit>('POST', '/business-units', data);
  }

  /**
   * Update business unit
   */
  async updateBusinessUnit(id: string, data: UpdateBusinessUnit): Promise<BusinessUnit> {
    return this.request<BusinessUnit>('PUT', `/business-units/${encodeURIComponent(id)}`, data);
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

    return this.request<SearchResponse<Account>>('GET', `/accounts?${query.toString()}`);
  }

  /**
   * Get account by ID
   */
  async getAccount(id: string): Promise<Account> {
    return this.request<Account>('GET', `/accounts/${encodeURIComponent(id)}`);
  }

  /**
   * Create account
   */
  async createAccount(data: CreateAccount): Promise<Account> {
    return this.request<Account>('POST', '/accounts', data);
  }

  /**
   * Update account
   */
  async updateAccount(id: string, data: UpdateAccount): Promise<Account> {
    return this.request<Account>('PUT', `/accounts/${encodeURIComponent(id)}`, data);
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

    const bodyPayload = {
      ...(params.query ? { query: params.query } : {}),
      page: params.page,
      limit: Math.min(params.limit, 100),
    };

    const attempts: Array<{
      method: 'GET' | 'POST';
      path: string;
      body?: Record<string, unknown>;
    }> = [
      { method: 'GET', path: `/documents?${query.toString()}` },
      { method: 'GET', path: `/documents/search?${query.toString()}` },
      { method: 'POST', path: '/documents/search', body: bodyPayload },
      { method: 'GET', path: `/documents/list?${query.toString()}` },
      { method: 'POST', path: '/documents/list', body: bodyPayload },
    ];

    let lastError: unknown;
    for (const attempt of attempts) {
      try {
        return await this.request<SearchResponse<Document>>(
          attempt.method,
          attempt.path,
          attempt.body
        );
      } catch (error) {
        const statusCode = getApiStatusCode(error);
        if (statusCode === 422) {
          throw new ApiError(
            422,
            `Document search validation failed on ${attempt.method} ${attempt.path}: this Boond instance rejected the search request format.`,
            'DOCUMENT_SEARCH_VALIDATION_ERROR'
          );
        }

        if (shouldShortCircuitFallback(error)) {
          throw error;
        }

        if (statusCode === 403 || statusCode === 404 || statusCode === 405) {
          lastError = error;
          continue;
        }
        throw error;
      }
    }

    if (lastError) {
      throw new ApiError(
        getApiStatusCode(lastError) ?? 403,
        'Document search failed: no compatible documents search endpoint responded successfully (tried GET /documents, GET /documents/search, POST /documents/search, GET /documents/list, POST /documents/list).',
        'DOCUMENT_SEARCH_UNAVAILABLE'
      );
    }

    throw lastError;
  }

  /**
   * Get document by ID
   */
  async getDocument(id: string): Promise<Document> {
    return this.request<Document>('GET', `/documents/${encodeURIComponent(id)}`);
  }

  /**
   * Update document
   */
  async updateDocument(id: string, data: UpdateDocument): Promise<Document> {
    return this.request<Document>('PUT', `/documents/${encodeURIComponent(id)}`, data);
  }

  /**
   * Download document
   */
  async downloadDocument(
    id: string
  ): Promise<{ url: string; contentType: string; filename: string }> {
    const url = `${this.baseUrl}/documents/${encodeURIComponent(id)}/download`;

    // Return the download URL and metadata
    // The actual download can be done by the caller if needed
    return {
      url,
      contentType: 'application/octet-stream',
      filename: `document-${id}`,
    };
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

    return this.request<SearchResponse<App>>('GET', `/apps?${query.toString()}`);
  }

  /**
   * Get app by ID
   */
  async getApp(id: string): Promise<App> {
    return this.request<App>('GET', `/apps/${encodeURIComponent(id)}`);
  }

  /**
   * Install app
   */
  async installApp(id: string): Promise<App> {
    return this.request<App>('POST', `/apps/${encodeURIComponent(id)}/install`);
  }

  /**
   * Uninstall app
   */
  async uninstallApp(id: string): Promise<void> {
    await this.request<void>('POST', `/apps/${encodeURIComponent(id)}/uninstall`);
  }

  async getMe(): Promise<CurrentUser> {
    const attempts: Array<() => Promise<CurrentUser>> = [
      () => this.request<CurrentUser>('GET', '/accounts/me'),
      () => this.getCurrentUser(),
      () => this.request<CurrentUser>('GET', '/me'),
    ];

    let lastError: unknown;

    for (const attempt of attempts) {
      try {
        return await attempt();
      } catch (error) {
        lastError = error;
        const classification = classifyError(error).classification;
        if (classification === 'resource_not_found' || classification === 'unsupported_endpoint') {
          continue;
        }
        throw error;
      }
    }

    throw lastError;
  }

  /**
   * Search settings
   */
  async searchSettings(): Promise<SearchResponse<Setting>> {
    return this.request<SearchResponse<Setting>>('GET', '/application/settings');
  }

  async getSetting(id: string): Promise<Setting> {
    return this.request<Setting>('GET', `/settings/${encodeURIComponent(id)}`);
  }

  /**
   * Get application dictionary
   */
  async getDictionary(params?: {
    language?: 'fr' | 'en' | 'es';
    mergeAllLanguages?: boolean;
  }): Promise<{ meta: Record<string, unknown>; data: { setting: Record<string, unknown> } }> {
    const query = new URLSearchParams();
    if (params?.language) {
      query.set('language', params.language);
    }
    if (params?.mergeAllLanguages !== undefined) {
      query.set('mergeAllLanguages', String(params.mergeAllLanguages));
    }
    const qs = query.toString();
    const path = qs ? `/application/dictionary?${qs}` : '/application/dictionary';
    return this.request<{
      meta: Record<string, unknown>;
      data: { setting: Record<string, unknown> };
    }>('GET', path);
  }

  /**
   * Update setting
   */
  async updateSetting(id: string, data: UpdateSetting): Promise<Setting> {
    return this.request<Setting>('PUT', `/settings/${encodeURIComponent(id)}`, data);
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

    return this.request<SearchResponse<Alert>>('GET', `/alerts?${query.toString()}`);
  }

  /**
   * Get alert by ID
   */
  async getAlert(id: string): Promise<Alert> {
    return this.request<Alert>('GET', `/alerts/${encodeURIComponent(id)}`);
  }

  /**
   * Update alert
   */
  async updateAlert(id: string, data: { resolved?: boolean }): Promise<Alert> {
    return this.request<Alert>('PUT', `/alerts/${encodeURIComponent(id)}`, data);
  }

  // ============================================================================
  // FLAGS DOMAIN (Task 8)
  // ============================================================================

  /**
   * Search flags
   */
  async searchFlags(params: SearchParams): Promise<SearchResponse<Flag>> {
    const query = new URLSearchParams({
      ...(params.query && { query: params.query }),
      page: String(params.page),
      limit: String(Math.min(params.limit, 100)),
    });

    return this.request<SearchResponse<Flag>>('GET', `/flags?${query.toString()}`);
  }

  /**
   * Get flag by ID
   */
  async getFlag(id: string): Promise<Flag> {
    return this.request<Flag>('GET', `/flags/${encodeURIComponent(id)}`);
  }

  // ============================================================================
  // PERIMETERS DOMAIN (Task 8)
  // ============================================================================

  /**
   * Get application perimeters
   * Returns perimeter configuration, optionally filtered by module
   */
  async getPerimeters(params?: { module?: string }): Promise<Perimeter> {
    const query = new URLSearchParams();
    if (params?.module) {
      query.set('module', params.module);
    }
    const qs = query.toString();
    const path = qs ? `/application/perimeters?${qs}` : '/application/perimeters';
    return this.request<Perimeter>('GET', path);
  }

  async getCurrentUser(): Promise<CurrentUser> {
    return this.request<CurrentUser>('GET', '/application/current-user');
  }
}
