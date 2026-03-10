import { z } from 'zod';
import {
  SearchParams,
  CreateCandidate,
  UpdateCandidate,
  Candidate,
  Company,
  CreateCompany,
  UpdateCompany,
  Opportunity,
  CreateOpportunity,
  UpdateOpportunity,
  Quotation,
  CreateQuotation,
  UpdateQuotation,
  Contact,
  CreateContact,
  UpdateContact,
  Resource,
  CreateResource,
  UpdateResource,
  Contract,
  CreateContract,
  UpdateContract,
  Project,
  CreateProject,
  UpdateProject,
  TimeReport,
  CreateTimeReport,
  UpdateTimeReport,
  Absence,
  CreateAbsence,
  UpdateAbsence,
  Delivery,
  CreateDelivery,
  UpdateDelivery,
  Action,
  CreateAction,
  UpdateAction,
  Invoice,
  CreateInvoice,
  UpdateInvoice,
  Purchase,
  CreatePurchase,
  UpdatePurchase,
  Order,
  CreateOrder,
  UpdateOrder,
  BankingAccount,
  BankingTransaction,
  ExpenseReport,
  CreateExpenseReport,
  UpdateExpenseReport,
  Agency,
  CreateAgency,
  UpdateAgency,
  BusinessUnit,
  CreateBusinessUnit,
  UpdateBusinessUnit,
  Account,
  CreateAccount,
  UpdateAccount,
  Document,
  UpdateDocument,
  App,
  Setting,
  UpdateSetting,
  Alert,
  UpdateAlert,
  SearchResponse,
} from '../types/boond.js';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: string = 'API_ERROR'
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string = 'Bad request') {
    super(400, message, 'BAD_REQUEST');
    this.name = 'BadRequestError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Invalid API credentials or authentication failed') {
    super(401, message, 'AUTH_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(404, message, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string = 'Validation failed', code: string = 'VALIDATION_ERROR') {
    super(422, message, code);
    this.name = 'ValidationError';
  }
}

export class ServerError extends ApiError {
  constructor(message: string = 'Server error') {
    super(500, message, 'SERVER_ERROR');
    this.name = 'ServerError';
  }
}

interface AuthConfig {
  apiToken: string;
  clientToken?: string;
  clientKey?: string;
  userToken?: string;
  jwtMode?: 'legacy' | 'normal';
}

function normalizeJsonApiEntity(item: {
  id: string;
  type?: string;
  attributes?: Record<string, unknown>;
  relationships?: unknown;
}): Record<string, unknown> {
  const normalized = {
    id: item.id,
    ...(item.attributes ?? {}),
  };

  if (item.relationships && typeof item.relationships === 'object') {
    const relationships = item.relationships as Record<string, unknown>;
    for (const [key, relValue] of Object.entries(relationships)) {
      if (relValue && typeof relValue === 'object' && 'data' in relValue) {
        const data = (relValue as { data?: unknown }).data;
        if (Array.isArray(data)) {
          normalized[`${key}Ids`] = data
            .filter(entry => entry && typeof entry === 'object' && 'id' in entry)
            .map(entry => String((entry as { id: unknown }).id));
        } else if (data && typeof data === 'object' && 'id' in data) {
          normalized[`${key}Id`] = String((data as { id: unknown }).id);
        }
      }
    }
  }

  return normalized;
}

function getApiStatusCode(error: unknown): number | undefined {
  return error instanceof ApiError ? error.statusCode : undefined;
}

export class BoondAPIClient {
  private baseUrl: string;
  private requestTimeout: number;
  private authConfig: AuthConfig;

  constructor(apiToken: string, baseUrl?: string, timeout: number = 30000) {
    this.baseUrl = baseUrl || process.env['BOOND_API_URL'] || 'https://ui.boondmanager.com/api';
    this.requestTimeout = timeout;

    this.authConfig = {
      apiToken,
      clientToken: process.env['BOOND_CLIENT_TOKEN'],
      clientKey: process.env['BOOND_CLIENT_KEY'],
      userToken: process.env['BOOND_USER_TOKEN'],
      jwtMode: (process.env['BOOND_JWT_MODE'] as 'legacy' | 'normal' | undefined) ?? 'legacy',
    };
  }

  private buildAuthHeaders(): Record<string, string> {
    const { clientToken, clientKey, userToken, jwtMode } = this.authConfig;
    if (clientToken && clientKey && userToken) {
      if (jwtMode === 'normal') {
        return {
          'X-Jwt-Client-Boondmanager': clientToken,
          'X-Jwt-Key-Boondmanager': clientKey,
          'X-Jwt-Token-Boondmanager': userToken,
        };
      }

      return {
        'X-Client-Token': clientToken,
        'X-Client-Key': clientKey,
        'X-User-Token': userToken,
      };
    }

    return {
      'X-Token': this.authConfig.apiToken,
      'X-Token-BoondManager': this.authConfig.apiToken,
    };
  }

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

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new ApiError(
          response.status,
          'Invalid response format: expected JSON',
          'INVALID_RESPONSE'
        );
      }

      const rawData = (await response.json()) as unknown;

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
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError(0, `Request timeout after ${this.requestTimeout}ms`, 'TIMEOUT_ERROR');
      }

      if (error instanceof TypeError) {
        console.error('Network error:', error.message);
        throw new ApiError(0, `Network error: ${error.message}`, 'NETWORK_ERROR');
      }

      console.error('Unexpected error:', error instanceof Error ? error.message : String(error));
      throw new ApiError(0, 'Unexpected error', 'UNEXPECTED_ERROR');
    }
  }

  async searchCandidates(params: SearchParams): Promise<SearchResponse<Candidate>> {
    const query = new URLSearchParams({
      ...(params.query && { query: params.query }),
      page: String(params.page),
      limit: String(Math.min(params.limit, 100)),
    });

    return this.request<SearchResponse<Candidate>>('GET', `/candidates?${query.toString()}`);
  }

  async getCandidate(id: string): Promise<Candidate> {
    return this.request<Candidate>('GET', `/candidates/${encodeURIComponent(id)}`);
  }

  async createCandidate(data: CreateCandidate): Promise<Candidate> {
    return this.request<Candidate>('POST', '/candidates', data);
  }

  async updateCandidate(id: string, data: UpdateCandidate): Promise<Candidate> {
    return this.request<Candidate>('PUT', `/candidates/${encodeURIComponent(id)}`, data);
  }

  async deleteCandidate(id: string): Promise<void> {
    await this.request<void>('DELETE', `/candidates/${encodeURIComponent(id)}`);
  }

  async searchCompanies(params: SearchParams): Promise<SearchResponse<Company>> {
    const query = new URLSearchParams({
      ...(params.query && { query: params.query }),
      page: String(params.page),
      limit: String(Math.min(params.limit, 100)),
    });

    return this.request<SearchResponse<Company>>('GET', `/companies?${query.toString()}`);
  }

  async getCompany(id: string): Promise<Company> {
    return this.request<Company>('GET', `/companies/${encodeURIComponent(id)}`);
  }

  async createCompany(data: CreateCompany): Promise<Company> {
    return this.request<Company>('POST', '/companies', data);
  }

  async updateCompany(id: string, data: UpdateCompany): Promise<Company> {
    return this.request<Company>('PUT', `/companies/${encodeURIComponent(id)}`, data);
  }

  async deleteCompany(id: string): Promise<void> {
    await this.request<void>('DELETE', `/companies/${encodeURIComponent(id)}`);
  }

  async searchOpportunities(params: SearchParams): Promise<SearchResponse<Opportunity>> {
    const query = new URLSearchParams({
      ...(params.query && { query: params.query }),
      page: String(params.page),
      limit: String(Math.min(params.limit, 100)),
    });

    return this.request<SearchResponse<Opportunity>>('GET', `/opportunities?${query.toString()}`);
  }

  async getOpportunity(id: string): Promise<Opportunity> {
    return this.request<Opportunity>('GET', `/opportunities/${encodeURIComponent(id)}`);
  }

  async createOpportunity(data: CreateOpportunity): Promise<Opportunity> {
    return this.request<Opportunity>('POST', '/opportunities', data);
  }

  async updateOpportunity(id: string, data: UpdateOpportunity): Promise<Opportunity> {
    return this.request<Opportunity>('PUT', `/opportunities/${encodeURIComponent(id)}`, data);
  }

  async deleteOpportunity(id: string): Promise<void> {
    await this.request<void>('DELETE', `/opportunities/${encodeURIComponent(id)}`);
  }

  async searchQuotations(params: SearchParams): Promise<SearchResponse<Quotation>> {
    const query = new URLSearchParams({
      ...(params.query && { query: params.query }),
      page: String(params.page),
      limit: String(Math.min(params.limit, 100)),
    });

    return this.request<SearchResponse<Quotation>>('GET', `/quotations?${query.toString()}`);
  }

  async getQuotation(id: string): Promise<Quotation> {
    return this.request<Quotation>('GET', `/quotations/${encodeURIComponent(id)}`);
  }

  async createQuotation(data: CreateQuotation): Promise<Quotation> {
    return this.request<Quotation>('POST', '/quotations', data);
  }

  async updateQuotation(id: string, data: UpdateQuotation): Promise<Quotation> {
    return this.request<Quotation>('PUT', `/quotations/${encodeURIComponent(id)}`, data);
  }

  async deleteQuotation(id: string): Promise<void> {
    await this.request<void>('DELETE', `/quotations/${encodeURIComponent(id)}`);
  }

  async sendQuotation(id: string): Promise<Quotation> {
    return this.request<Quotation>('POST', `/quotations/${encodeURIComponent(id)}/send`);
  }

  async searchContacts(params: SearchParams): Promise<SearchResponse<Contact>> {
    const query = new URLSearchParams({
      ...(params.query && { query: params.query }),
      page: String(params.page),
      limit: String(Math.min(params.limit, 100)),
    });

    return this.request<SearchResponse<Contact>>('GET', `/contacts?${query.toString()}`);
  }

  async getContact(id: string): Promise<Contact> {
    return this.request<Contact>('GET', `/contacts/${encodeURIComponent(id)}`);
  }

  async createContact(data: CreateContact): Promise<Contact> {
    return this.request<Contact>('POST', '/contacts', data);
  }

  async updateContact(id: string, data: UpdateContact): Promise<Contact> {
    return this.request<Contact>('PUT', `/contacts/${encodeURIComponent(id)}`, data);
  }

  async deleteContact(id: string): Promise<void> {
    await this.request<void>('DELETE', `/contacts/${encodeURIComponent(id)}`);
  }

  async searchResources(params: SearchParams): Promise<SearchResponse<Resource>> {
    const query = new URLSearchParams({
      ...(params.query && { query: params.query }),
      page: String(params.page),
      limit: String(Math.min(params.limit, 100)),
    });

    return this.request<SearchResponse<Resource>>('GET', `/resources?${query.toString()}`);
  }

  async getResource(id: string): Promise<Resource> {
    const resource = await this.request<Resource>('GET', `/resources/${encodeURIComponent(id)}`);
    return resource;
  }

  async getResourceCapabilities(id: string): Promise<Record<string, unknown>> {
    const endpoints = [
      `/resources/${encodeURIComponent(id)}/capabilities`,
      `/resources/${encodeURIComponent(id)}/permissions`,
      `/resources/${encodeURIComponent(id)}/rights`,
      `/resources/${encodeURIComponent(id)}/scopes`,
    ];

    let lastError: unknown;
    for (const endpoint of endpoints) {
      try {
        const info = await this.request<Record<string, unknown>>('GET', endpoint);
        return info;
      } catch (error) {
        const statusCode = getApiStatusCode(error);
        if (statusCode === 403 || statusCode === 404 || statusCode === 405) {
          lastError = error;
          continue;
        }
        throw error;
      }
    }

    throw (
      lastError ??
      new ApiError(
        404,
        'Resource capability endpoints are not available for this Boond instance or account.',
        'RESOURCE_CAPABILITIES_UNAVAILABLE'
      )
    );
  }

  async createResource(data: CreateResource): Promise<Resource> {
    return this.request<Resource>('POST', '/resources', data);
  }

  async updateResource(id: string, data: UpdateResource): Promise<Resource> {
    return this.request<Resource>('PUT', `/resources/${encodeURIComponent(id)}`, data);
  }

  async deleteResource(id: string): Promise<void> {
    await this.request<void>('DELETE', `/resources/${encodeURIComponent(id)}`);
  }

  async searchContracts(params: SearchParams): Promise<SearchResponse<Contract>> {
    const query = new URLSearchParams({
      ...(params.query && { query: params.query }),
      page: String(params.page),
      limit: String(Math.min(params.limit, 100)),
    });

    try {
      return await this.request<SearchResponse<Contract>>('GET', `/contracts?${query.toString()}`);
    } catch (error) {
      const statusCode = getApiStatusCode(error);
      if (statusCode === 403 || statusCode === 404 || statusCode === 405) {
        try {
          return await this.request<SearchResponse<Contract>>(
            'GET',
            `/contracts/search?${query.toString()}`
          );
        } catch (fallbackError) {
          const fallbackStatus = getApiStatusCode(fallbackError);
          if (fallbackStatus === 403 || fallbackStatus === 404 || fallbackStatus === 405) {
            return this.request<SearchResponse<Contract>>('POST', '/contracts/search', {
              ...(params.query ? { query: params.query } : {}),
              page: params.page,
              limit: Math.min(params.limit, 100),
            });
          }
          throw fallbackError;
        }
      }
      throw error;
    }
  }

  async getContract(id: string): Promise<Contract> {
    return this.request<Contract>('GET', `/contracts/${encodeURIComponent(id)}`);
  }

  async createContract(data: CreateContract): Promise<Contract> {
    return this.request<Contract>('POST', '/contracts', data);
  }

  async updateContract(id: string, data: UpdateContract): Promise<Contract> {
    return this.request<Contract>('PUT', `/contracts/${encodeURIComponent(id)}`, data);
  }

  async deleteContract(id: string): Promise<void> {
    await this.request<void>('DELETE', `/contracts/${encodeURIComponent(id)}`);
  }

  async searchProjects(params: SearchParams): Promise<SearchResponse<Project>> {
    const query = new URLSearchParams({
      ...(params.query && { query: params.query }),
      page: String(params.page),
      limit: String(Math.min(params.limit, 100)),
    });

    return this.request<SearchResponse<Project>>('GET', `/projects?${query.toString()}`);
  }

  async getProject(id: string): Promise<Project> {
    return this.request<Project>('GET', `/projects/${encodeURIComponent(id)}`);
  }

  async createProject(data: CreateProject): Promise<Project> {
    return this.request<Project>('POST', '/projects', data);
  }

  async updateProject(id: string, data: UpdateProject): Promise<Project> {
    return this.request<Project>('PUT', `/projects/${encodeURIComponent(id)}`, data);
  }

  async deleteProject(id: string): Promise<void> {
    await this.request<void>('DELETE', `/projects/${encodeURIComponent(id)}`);
  }

  async searchTimeReports(params: SearchParams): Promise<SearchResponse<TimeReport>> {
    const query = new URLSearchParams({
      ...(params.query && { query: params.query }),
      page: String(params.page),
      limit: String(Math.min(params.limit, 100)),
    });

    try {
      return await this.request<SearchResponse<TimeReport>>(
        'GET',
        `/times-reports?${query.toString()}`
      );
    } catch (error) {
      const statusCode = getApiStatusCode(error);
      if (statusCode === 403 || statusCode === 404 || statusCode === 405) {
        return this.request<SearchResponse<TimeReport>>('GET', `/time-reports?${query.toString()}`);
      }
      throw error;
    }
  }

  async getTimeReport(id: string): Promise<TimeReport> {
    try {
      return await this.request<TimeReport>('GET', `/times-reports/${encodeURIComponent(id)}`);
    } catch (error) {
      const statusCode = getApiStatusCode(error);
      if (statusCode === 403 || statusCode === 404 || statusCode === 405) {
        return this.request<TimeReport>('GET', `/time-reports/${encodeURIComponent(id)}`);
      }
      throw error;
    }
  }

  async createTimeReport(data: CreateTimeReport): Promise<TimeReport> {
    try {
      return await this.request<TimeReport>('POST', '/times-reports', data);
    } catch (error) {
      const statusCode = getApiStatusCode(error);
      if (statusCode === 403 || statusCode === 404 || statusCode === 405) {
        return this.request<TimeReport>('POST', '/time-reports', data);
      }
      throw error;
    }
  }

  async updateTimeReport(id: string, data: UpdateTimeReport): Promise<TimeReport> {
    return this.request<TimeReport>('PUT', `/time-reports/${encodeURIComponent(id)}`, data);
  }

  async searchAbsences(params: SearchParams): Promise<SearchResponse<Absence>> {
    const query = new URLSearchParams({
      ...(params.query && { query: params.query }),
      page: String(params.page),
      limit: String(Math.min(params.limit, 100)),
    });

    return this.request<SearchResponse<Absence>>('GET', `/absences?${query.toString()}`);
  }

  async getAbsence(id: string): Promise<Absence> {
    return this.request<Absence>('GET', `/absences/${encodeURIComponent(id)}`);
  }

  async createAbsence(data: CreateAbsence): Promise<Absence> {
    return this.request<Absence>('POST', '/absences', data);
  }

  async updateAbsence(id: string, data: UpdateAbsence): Promise<Absence> {
    return this.request<Absence>('PUT', `/absences/${encodeURIComponent(id)}`, data);
  }

  async deleteAbsence(id: string): Promise<void> {
    await this.request<void>('DELETE', `/absences/${encodeURIComponent(id)}`);
  }

  async searchDeliveries(params: SearchParams): Promise<SearchResponse<Delivery>> {
    const query = new URLSearchParams({
      ...(params.query && { query: params.query }),
      page: String(params.page),
      limit: String(Math.min(params.limit, 100)),
    });

    try {
      return await this.request<SearchResponse<Delivery>>('GET', `/deliveries?${query.toString()}`);
    } catch (error) {
      const statusCode = getApiStatusCode(error);
      if (statusCode === 403 || statusCode === 404 || statusCode === 405) {
        return this.request<SearchResponse<Delivery>>('GET', `/delivery?${query.toString()}`);
      }
      throw error;
    }
  }

  async getDelivery(id: string): Promise<Delivery> {
    return this.request<Delivery>('GET', `/deliveries/${encodeURIComponent(id)}`);
  }

  async createDelivery(data: CreateDelivery): Promise<Delivery> {
    return this.request<Delivery>('POST', '/deliveries', data);
  }

  async updateDelivery(id: string, data: UpdateDelivery): Promise<Delivery> {
    return this.request<Delivery>('PUT', `/deliveries/${encodeURIComponent(id)}`, data);
  }

  async sendDelivery(id: string): Promise<Delivery> {
    return this.request<Delivery>('POST', `/deliveries/${encodeURIComponent(id)}/send`);
  }

  async searchActions(params: SearchParams): Promise<SearchResponse<Action>> {
    const query = new URLSearchParams({
      ...(params.query && { query: params.query }),
      page: String(params.page),
      limit: String(Math.min(params.limit, 100)),
    });

    return this.request<SearchResponse<Action>>('GET', `/actions?${query.toString()}`);
  }

  async getAction(id: string): Promise<Action> {
    return this.request<Action>('GET', `/actions/${encodeURIComponent(id)}`);
  }

  async createAction(data: CreateAction): Promise<Action> {
    return this.request<Action>('POST', '/actions', data);
  }

  async updateAction(id: string, data: UpdateAction): Promise<Action> {
    return this.request<Action>('PUT', `/actions/${encodeURIComponent(id)}`, data);
  }

  async deleteAction(id: string): Promise<void> {
    await this.request<void>('DELETE', `/actions/${encodeURIComponent(id)}`);
  }

  async searchInvoices(params: SearchParams): Promise<SearchResponse<Invoice>> {
    const query = new URLSearchParams({
      ...(params.query && { query: params.query }),
      page: String(params.page),
      limit: String(Math.min(params.limit, 100)),
    });

    return this.request<SearchResponse<Invoice>>('GET', `/invoices?${query.toString()}`);
  }

  async getInvoice(id: string): Promise<Invoice> {
    return this.request<Invoice>('GET', `/invoices/${encodeURIComponent(id)}`);
  }

  async createInvoice(data: CreateInvoice): Promise<Invoice> {
    return this.request<Invoice>('POST', '/invoices', data);
  }

  async updateInvoice(id: string, data: UpdateInvoice): Promise<Invoice> {
    return this.request<Invoice>('PUT', `/invoices/${encodeURIComponent(id)}`, data);
  }

  async deleteInvoice(id: string): Promise<void> {
    await this.request<void>('DELETE', `/invoices/${encodeURIComponent(id)}`);
  }

  async searchPurchases(params: SearchParams): Promise<SearchResponse<Purchase>> {
    const query = new URLSearchParams({
      ...(params.query && { query: params.query }),
      page: String(params.page),
      limit: String(Math.min(params.limit, 100)),
    });

    return this.request<SearchResponse<Purchase>>('GET', `/purchases?${query.toString()}`);
  }

  async getPurchase(id: string): Promise<Purchase> {
    return this.request<Purchase>('GET', `/purchases/${encodeURIComponent(id)}`);
  }

  async createPurchase(data: CreatePurchase): Promise<Purchase> {
    return this.request<Purchase>('POST', '/purchases', data);
  }

  async updatePurchase(id: string, data: UpdatePurchase): Promise<Purchase> {
    return this.request<Purchase>('PUT', `/purchases/${encodeURIComponent(id)}`, data);
  }

  async deletePurchase(id: string): Promise<void> {
    await this.request<void>('DELETE', `/purchases/${encodeURIComponent(id)}`);
  }

  async searchOrders(params: SearchParams): Promise<SearchResponse<Order>> {
    const query = new URLSearchParams({
      ...(params.query && { query: params.query }),
      page: String(params.page),
      limit: String(Math.min(params.limit, 100)),
    });

    return this.request<SearchResponse<Order>>('GET', `/orders?${query.toString()}`);
  }

  async getOrder(id: string): Promise<Order> {
    return this.request<Order>('GET', `/orders/${encodeURIComponent(id)}`);
  }

  async createOrder(data: CreateOrder): Promise<Order> {
    return this.request<Order>('POST', '/orders', data);
  }

  async updateOrder(id: string, data: UpdateOrder): Promise<Order> {
    return this.request<Order>('PUT', `/orders/${encodeURIComponent(id)}`, data);
  }

  async searchBankingAccounts(): Promise<SearchResponse<BankingAccount>> {
    return this.request<SearchResponse<BankingAccount>>('GET', '/banking-accounts');
  }

  async getBankingAccount(id: string): Promise<BankingAccount> {
    return this.request<BankingAccount>('GET', `/banking-accounts/${encodeURIComponent(id)}`);
  }

  async searchBankingTransactions(
    bankingAccountId: string,
    params: SearchParams
  ): Promise<SearchResponse<BankingTransaction>> {
    const query = new URLSearchParams({
      page: String(params.page),
      limit: String(Math.min(params.limit, 100)),
    });

    return this.request<SearchResponse<BankingTransaction>>(
      'GET',
      `/banking-accounts/${encodeURIComponent(bankingAccountId)}/transactions?${query.toString()}`
    );
  }

  async searchExpenseReports(params: SearchParams): Promise<SearchResponse<ExpenseReport>> {
    const query = new URLSearchParams({
      ...(params.query && { query: params.query }),
      page: String(params.page),
      limit: String(Math.min(params.limit, 100)),
    });

    try {
      return await this.request<SearchResponse<ExpenseReport>>(
        'GET',
        `/expenses-reports?${query.toString()}`
      );
    } catch (error) {
      const statusCode = getApiStatusCode(error);
      if (statusCode === 403 || statusCode === 404 || statusCode === 405) {
        try {
          return await this.request<SearchResponse<ExpenseReport>>(
            'GET',
            `/expense-reports?${query.toString()}`
          );
        } catch (fallbackError) {
          const fallbackStatus = getApiStatusCode(fallbackError);
          if (fallbackStatus === 403 || fallbackStatus === 404 || fallbackStatus === 405) {
            throw new ApiError(
              getApiStatusCode(fallbackError) ?? 404,
              'All expense search endpoints returned 403/404/405. This endpoint may require specific permissions or may be unavailable in your Boond instance.',
              'EXPENSE_SEARCH_UNAVAILABLE'
            );
          }
          throw fallbackError;
        }
      }
      throw error;
    }
  }

  async getExpenseReport(id: string): Promise<ExpenseReport> {
    try {
      return await this.request<ExpenseReport>('GET', `/expenses-reports/${encodeURIComponent(id)}`);
    } catch (error) {
      const statusCode = getApiStatusCode(error);
      if (statusCode === 403 || statusCode === 404 || statusCode === 405) {
        return this.request<ExpenseReport>('GET', `/expense-reports/${encodeURIComponent(id)}`);
      }
      throw error;
    }
  }

  async createExpenseReport(data: CreateExpenseReport): Promise<ExpenseReport> {
    try {
      return await this.request<ExpenseReport>('POST', '/expenses-reports', data);
    } catch (error) {
      const statusCode = getApiStatusCode(error);
      if (statusCode === 403 || statusCode === 404 || statusCode === 405) {
        return this.request<ExpenseReport>('POST', '/expense-reports', data);
      }
      throw error;
    }
  }

  async updateExpenseReport(id: string, data: UpdateExpenseReport): Promise<ExpenseReport> {
    return this.request<ExpenseReport>('PUT', `/expense-reports/${encodeURIComponent(id)}`, data);
  }

  async certifyExpenseReport(id: string): Promise<ExpenseReport> {
    return this.request<ExpenseReport>('POST', `/expense-reports/${encodeURIComponent(id)}/certify`);
  }

  async rejectExpenseReport(id: string, reason: string): Promise<ExpenseReport> {
    return this.request<ExpenseReport>('POST', `/expense-reports/${encodeURIComponent(id)}/reject`, {
      reason,
    });
  }

  async searchAgencies(params: SearchParams): Promise<SearchResponse<Agency>> {
    const query = new URLSearchParams({
      ...(params.query && { query: params.query }),
      page: String(params.page),
      limit: String(Math.min(params.limit, 100)),
    });

    return this.request<SearchResponse<Agency>>('GET', `/agencies?${query.toString()}`);
  }

  async getAgency(id: string): Promise<Agency> {
    return this.request<Agency>('GET', `/agencies/${encodeURIComponent(id)}`);
  }

  async createAgency(data: CreateAgency): Promise<Agency> {
    return this.request<Agency>('POST', '/agencies', data);
  }

  async updateAgency(id: string, data: UpdateAgency): Promise<Agency> {
    return this.request<Agency>('PUT', `/agencies/${encodeURIComponent(id)}`, data);
  }

  async searchBusinessUnits(params: SearchParams): Promise<SearchResponse<BusinessUnit>> {
    const query = new URLSearchParams({
      ...(params.query && { query: params.query }),
      page: String(params.page),
      limit: String(Math.min(params.limit, 100)),
    });

    return this.request<SearchResponse<BusinessUnit>>('GET', `/business-units?${query.toString()}`);
  }

  async getBusinessUnit(id: string): Promise<BusinessUnit> {
    return this.request<BusinessUnit>('GET', `/business-units/${encodeURIComponent(id)}`);
  }

  async createBusinessUnit(data: CreateBusinessUnit): Promise<BusinessUnit> {
    return this.request<BusinessUnit>('POST', '/business-units', data);
  }

  async updateBusinessUnit(id: string, data: UpdateBusinessUnit): Promise<BusinessUnit> {
    return this.request<BusinessUnit>('PUT', `/business-units/${encodeURIComponent(id)}`, data);
  }

  async searchAccounts(params: SearchParams): Promise<SearchResponse<Account>> {
    const query = new URLSearchParams({
      ...(params.query && { query: params.query }),
      page: String(params.page),
      limit: String(Math.min(params.limit, 100)),
    });

    return this.request<SearchResponse<Account>>('GET', `/accounts?${query.toString()}`);
  }

  async getAccount(id: string): Promise<Account> {
    return this.request<Account>('GET', `/accounts/${encodeURIComponent(id)}`);
  }

  async createAccount(data: CreateAccount): Promise<Account> {
    return this.request<Account>('POST', '/accounts', data);
  }

  async updateAccount(id: string, data: UpdateAccount): Promise<Account> {
    return this.request<Account>('PUT', `/accounts/${encodeURIComponent(id)}`, data);
  }

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

  async getDocument(id: string): Promise<Document> {
    return this.request<Document>('GET', `/documents/${encodeURIComponent(id)}`);
  }

  async updateDocument(id: string, data: UpdateDocument): Promise<Document> {
    return this.request<Document>('PUT', `/documents/${encodeURIComponent(id)}`, data);
  }

  async searchApps(params: SearchParams): Promise<SearchResponse<App>> {
    const query = new URLSearchParams({
      ...(params.query && { query: params.query }),
      page: String(params.page),
      limit: String(Math.min(params.limit, 100)),
    });

    return this.request<SearchResponse<App>>('GET', `/apps?${query.toString()}`);
  }

  async getApp(id: string): Promise<App> {
    return this.request<App>('GET', `/apps/${encodeURIComponent(id)}`);
  }

  async installApp(id: string): Promise<App> {
    return this.request<App>('POST', `/apps/${encodeURIComponent(id)}/install`);
  }

  async uninstallApp(id: string): Promise<void> {
    await this.request<void>('POST', `/apps/${encodeURIComponent(id)}/uninstall`);
  }

  async getMe(): Promise<Account> {
    return this.request<Account>('GET', '/me');
  }

  async searchSettings(): Promise<SearchResponse<Setting>> {
    return this.request<SearchResponse<Setting>>('GET', '/settings');
  }

  async updateSetting(id: string, data: UpdateSetting): Promise<Setting> {
    return this.request<Setting>('PUT', `/settings/${encodeURIComponent(id)}`, data);
  }

  async searchAlerts(params: SearchParams): Promise<SearchResponse<Alert>> {
    const query = new URLSearchParams({
      ...(params.query && { query: params.query }),
      page: String(params.page),
      limit: String(Math.min(params.limit, 100)),
    });

    return this.request<SearchResponse<Alert>>('GET', `/alerts?${query.toString()}`);
  }

  async getAlert(id: string): Promise<Alert> {
    return this.request<Alert>('GET', `/alerts/${encodeURIComponent(id)}`);
  }

  async updateAlert(id: string, data: UpdateAlert): Promise<Alert> {
    return this.request<Alert>('PUT', `/alerts/${encodeURIComponent(id)}`, data);
  }
}
