import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BoondAPIClient } from '../../src/api/client.js';

const originalFetch = global.fetch;

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Map([['content-type', 'application/json']]),
    json: async () => body,
  };
}

describe('official GET/read endpoint reconciliation', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock as typeof global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('uses GET /apps/quotations/quotations for quotations search', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        data: [{ id: 'q-1', status: 'draft' }],
        pagination: { page: 1, limit: 20, total: 1 },
      })
    );

    const client = new BoondAPIClient('test-token');
    await client.searchQuotations({ query: 'react', page: 1, limit: 20 });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const firstCallUrl = String(fetchMock.mock.calls[0]?.[0]);
    const firstCallOptions = fetchMock.mock.calls[0]?.[1] as { method?: string };

    const requestUrl = new URL(firstCallUrl);

    expect(requestUrl.pathname).toBe('/api/apps/quotations/quotations');
    expect(requestUrl.searchParams.get('query')).toBe('react');
    expect(requestUrl.searchParams.get('page')).toBe('1');
    expect(requestUrl.searchParams.get('limit')).toBe('20');
    expect(firstCallOptions.method).toBe('GET');
  });

  it('uses GET /apps/quotations/quotations/{id} for quotation profile', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        id: 'q-42',
        status: 'sent',
      })
    );

    const client = new BoondAPIClient('test-token');
    await client.getQuotation('q-42');

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const firstCallUrl = String(fetchMock.mock.calls[0]?.[0]);
    const firstCallOptions = fetchMock.mock.calls[0]?.[1] as { method?: string };

    expect(firstCallUrl).toContain('/apps/quotations/quotations/q-42');
    expect(firstCallOptions.method).toBe('GET');
  });

  it('uses GET /application/settings for settings read/search', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        data: [{ id: 's-1', key: 'timezone', value: 'UTC' }],
        pagination: { page: 1, limit: 100, total: 1 },
      })
    );

    const client = new BoondAPIClient('test-token');
    await client.searchSettings();

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const firstCallUrl = String(fetchMock.mock.calls[0]?.[0]);
    const firstCallOptions = fetchMock.mock.calls[0]?.[1] as { method?: string };

    expect(firstCallUrl).toContain('/application/settings');
    expect(firstCallOptions.method).toBe('GET');
  });

  // COLLECTION PATTERN TESTS (list/search endpoints)

  describe('collection pattern (list/search)', () => {
    it('uses GET /candidates for candidates list/search', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(200, {
          data: [{ id: 'c-1', firstName: 'John', lastName: 'Doe' }],
          pagination: { page: 1, limit: 20, total: 1 },
        })
      );

      const client = new BoondAPIClient('test-token');
      await client.searchCandidates({ query: 'john', page: 1, limit: 20 });

      expect(fetchMock).toHaveBeenCalledTimes(1);

      const firstCallUrl = String(fetchMock.mock.calls[0]?.[0]);
      const firstCallOptions = fetchMock.mock.calls[0]?.[1] as { method?: string };
      const requestUrl = new URL(firstCallUrl);

      expect(requestUrl.pathname).toBe('/api/candidates');
      expect(requestUrl.searchParams.get('query')).toBe('john');
      expect(firstCallOptions.method).toBe('GET');
    });

    it('uses GET /companies for companies list/search', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(200, {
          data: [{ id: 'co-1', name: 'Acme Corp' }],
          pagination: { page: 1, limit: 20, total: 1 },
        })
      );

      const client = new BoondAPIClient('test-token');
      await client.searchCompanies({ query: 'acme', page: 1, limit: 20 });

      expect(fetchMock).toHaveBeenCalledTimes(1);

      const firstCallUrl = String(fetchMock.mock.calls[0]?.[0]);
      const firstCallOptions = fetchMock.mock.calls[0]?.[1] as { method?: string };
      const requestUrl = new URL(firstCallUrl);

      expect(requestUrl.pathname).toBe('/api/companies');
      expect(firstCallOptions.method).toBe('GET');
    });

    it('uses GET /opportunities for opportunities list/search', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(200, {
          data: [{ id: 'o-1', title: 'Project Alpha' }],
          pagination: { page: 1, limit: 20, total: 1 },
        })
      );

      const client = new BoondAPIClient('test-token');
      await client.searchOpportunities({ query: 'alpha', page: 1, limit: 20 });

      expect(fetchMock).toHaveBeenCalledTimes(1);

      const firstCallUrl = String(fetchMock.mock.calls[0]?.[0]);
      const firstCallOptions = fetchMock.mock.calls[0]?.[1] as { method?: string };
      const requestUrl = new URL(firstCallUrl);

      expect(requestUrl.pathname).toBe('/api/opportunities');
      expect(firstCallOptions.method).toBe('GET');
    });

    it('uses GET /invoices for invoices list/search', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(200, {
          data: [{ id: 'inv-1', number: 'INV-001' }],
          pagination: { page: 1, limit: 20, total: 1 },
        })
      );

      const client = new BoondAPIClient('test-token');
      await client.searchInvoices({ query: 'inv', page: 1, limit: 20 });

      expect(fetchMock).toHaveBeenCalledTimes(1);

      const firstCallUrl = String(fetchMock.mock.calls[0]?.[0]);
      const firstCallOptions = fetchMock.mock.calls[0]?.[1] as { method?: string };
      const requestUrl = new URL(firstCallUrl);

      expect(requestUrl.pathname).toBe('/api/invoices');
      expect(firstCallOptions.method).toBe('GET');
    });

    it('uses GET /projects for projects list/search', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(200, {
          data: [{ id: 'p-1', name: 'Project A' }],
          pagination: { page: 1, limit: 20, total: 1 },
        })
      );

      const client = new BoondAPIClient('test-token');
      await client.searchProjects({ query: 'project', page: 1, limit: 20 });

      expect(fetchMock).toHaveBeenCalledTimes(1);

      const firstCallUrl = String(fetchMock.mock.calls[0]?.[0]);
      const firstCallOptions = fetchMock.mock.calls[0]?.[1] as { method?: string };
      const requestUrl = new URL(firstCallUrl);

      expect(requestUrl.pathname).toBe('/api/projects');
      expect(firstCallOptions.method).toBe('GET');
    });
  });

  // PROFILE PATTERN TESTS (get by ID)

  describe('profile pattern (get by ID)', () => {
    it('uses GET /candidates/{id} for candidate profile', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(200, {
          id: 'c-42',
          firstName: 'John',
          lastName: 'Doe',
        })
      );

      const client = new BoondAPIClient('test-token');
      await client.getCandidate('c-42');

      expect(fetchMock).toHaveBeenCalledTimes(1);

      const firstCallUrl = String(fetchMock.mock.calls[0]?.[0]);
      const firstCallOptions = fetchMock.mock.calls[0]?.[1] as { method?: string };

      expect(firstCallUrl).toContain('/api/candidates/c-42');
      expect(firstCallOptions.method).toBe('GET');
    });

    it('uses GET /companies/{id} for company profile', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(200, {
          id: 'co-42',
          name: 'Acme Corp',
        })
      );

      const client = new BoondAPIClient('test-token');
      await client.getCompany('co-42');

      expect(fetchMock).toHaveBeenCalledTimes(1);

      const firstCallUrl = String(fetchMock.mock.calls[0]?.[0]);
      const firstCallOptions = fetchMock.mock.calls[0]?.[1] as { method?: string };

      expect(firstCallUrl).toContain('/api/companies/co-42');
      expect(firstCallOptions.method).toBe('GET');
    });

    it('uses GET /opportunities/{id} for opportunity profile', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(200, {
          id: 'o-42',
          title: 'Project Alpha',
        })
      );

      const client = new BoondAPIClient('test-token');
      await client.getOpportunity('o-42');

      expect(fetchMock).toHaveBeenCalledTimes(1);

      const firstCallUrl = String(fetchMock.mock.calls[0]?.[0]);
      const firstCallOptions = fetchMock.mock.calls[0]?.[1] as { method?: string };

      expect(firstCallUrl).toContain('/api/opportunities/o-42');
      expect(firstCallOptions.method).toBe('GET');
    });

    it('uses GET /invoices/{id} for invoice profile', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(200, {
          id: 'inv-42',
          number: 'INV-001',
        })
      );

      const client = new BoondAPIClient('test-token');
      await client.getInvoice('inv-42');

      expect(fetchMock).toHaveBeenCalledTimes(1);

      const firstCallUrl = String(fetchMock.mock.calls[0]?.[0]);
      const firstCallOptions = fetchMock.mock.calls[0]?.[1] as { method?: string };

      expect(firstCallUrl).toContain('/api/invoices/inv-42');
      expect(firstCallOptions.method).toBe('GET');
    });

    it('uses GET /projects/{id} for project profile', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(200, {
          id: 'p-42',
          name: 'Project A',
        })
      );

      const client = new BoondAPIClient('test-token');
      await client.getProject('p-42');

      expect(fetchMock).toHaveBeenCalledTimes(1);

      const firstCallUrl = String(fetchMock.mock.calls[0]?.[0]);
      const firstCallOptions = fetchMock.mock.calls[0]?.[1] as { method?: string };

      expect(firstCallUrl).toContain('/api/projects/p-42');
      expect(firstCallOptions.method).toBe('GET');
    });
  });

  // NESTED/TAB PATTERN TESTS (sub-resources)

  describe('nested/tab pattern (sub-resources)', () => {
    it('uses GET /candidates/{id}/information for candidate information tab', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(200, {
          id: 'c-42',
          email: 'john@example.com',
          phone: '555-1234',
        })
      );

      const client = new BoondAPIClient('test-token');
      await client.getCandidateInformation('c-42');

      expect(fetchMock).toHaveBeenCalledTimes(1);

      const firstCallUrl = String(fetchMock.mock.calls[0]?.[0]);
      const firstCallOptions = fetchMock.mock.calls[0]?.[1] as { method?: string };
      const requestUrl = new URL(firstCallUrl);

      expect(requestUrl.pathname).toBe('/api/candidates/c-42/information');
      expect(firstCallOptions.method).toBe('GET');
    });

    it('uses GET /companies/{id}/contacts for company contacts sub-resource', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(200, {
          data: [{ id: 'ct-1', firstName: 'Jane' }],
          pagination: { page: 1, limit: 20, total: 1 },
        })
      );

      const client = new BoondAPIClient('test-token');
      await client.getCompanyContacts('co-42');

      expect(fetchMock).toHaveBeenCalledTimes(1);

      const firstCallUrl = String(fetchMock.mock.calls[0]?.[0]);
      const firstCallOptions = fetchMock.mock.calls[0]?.[1] as { method?: string };
      const requestUrl = new URL(firstCallUrl);

      expect(requestUrl.pathname).toBe('/api/companies/co-42/contacts');
      expect(firstCallOptions.method).toBe('GET');
    });

    it('uses GET /projects/{id}/deliveries for project deliveries sub-resource', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(200, {
          data: [{ id: 'd-1', name: 'Delivery 1' }],
          pagination: { page: 1, limit: 20, total: 1 },
        })
      );

      const client = new BoondAPIClient('test-token');
      await client.getProjectDeliveries('p-42');

      expect(fetchMock).toHaveBeenCalledTimes(1);

      const firstCallUrl = String(fetchMock.mock.calls[0]?.[0]);
      const firstCallOptions = fetchMock.mock.calls[0]?.[1] as { method?: string };
      const requestUrl = new URL(firstCallUrl);

      expect(requestUrl.pathname).toBe('/api/projects/p-42/deliveries');
      expect(firstCallOptions.method).toBe('GET');
    });

    it('uses GET /opportunities/{id}/quotations for opportunity quotations sub-resource', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(200, {
          data: [{ id: 'q-1', status: 'draft' }],
          pagination: { page: 1, limit: 20, total: 1 },
        })
      );

      const client = new BoondAPIClient('test-token');
      await client.getOpportunityQuotations('o-42');

      expect(fetchMock).toHaveBeenCalledTimes(1);

      const firstCallUrl = String(fetchMock.mock.calls[0]?.[0]);
      const firstCallOptions = fetchMock.mock.calls[0]?.[1] as { method?: string };
      const requestUrl = new URL(firstCallUrl);

      expect(requestUrl.pathname).toBe('/api/opportunities/o-42/quotations');
      expect(firstCallOptions.method).toBe('GET');
    });

    it('uses GET /resources/{id}/contracts for resource contracts sub-resource', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(200, {
          data: [{ id: 'ct-1', type: 'permanent' }],
          pagination: { page: 1, limit: 20, total: 1 },
        })
      );

      const client = new BoondAPIClient('test-token');
      await client.getResourceContracts('r-42');

      expect(fetchMock).toHaveBeenCalledTimes(1);

      const firstCallUrl = String(fetchMock.mock.calls[0]?.[0]);
      const firstCallOptions = fetchMock.mock.calls[0]?.[1] as { method?: string };
      const requestUrl = new URL(firstCallUrl);

      expect(requestUrl.pathname).toBe('/api/resources/r-42/contracts');
      expect(firstCallOptions.method).toBe('GET');
    });
  });

  // /DEFAULT PATTERN TESTS (template/default payload)

  describe('/default pattern (template endpoints)', () => {
    it('uses GET /candidates/default for candidate default template', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(200, {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
        })
      );

      const client = new BoondAPIClient('test-token');
      await client.getCandidateDefault();

      expect(fetchMock).toHaveBeenCalledTimes(1);

      const firstCallUrl = String(fetchMock.mock.calls[0]?.[0]);
      const firstCallOptions = fetchMock.mock.calls[0]?.[1] as { method?: string };
      const requestUrl = new URL(firstCallUrl);

      expect(requestUrl.pathname).toBe('/api/candidates/default');
      expect(firstCallOptions.method).toBe('GET');
    });

    it('uses GET /companies/default for company default template', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(200, {
          name: '',
          type: 'client',
          address: '',
        })
      );

      const client = new BoondAPIClient('test-token');
      await client.getCompanyDefault();

      expect(fetchMock).toHaveBeenCalledTimes(1);

      const firstCallUrl = String(fetchMock.mock.calls[0]?.[0]);
      const firstCallOptions = fetchMock.mock.calls[0]?.[1] as { method?: string };
      const requestUrl = new URL(firstCallUrl);

      expect(requestUrl.pathname).toBe('/api/companies/default');
      expect(firstCallOptions.method).toBe('GET');
    });

    it('uses GET /invoices/default for invoice default template', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(200, {
          number: '',
          amount: 0,
          currency: 'EUR',
        })
      );

      const client = new BoondAPIClient('test-token');
      await client.getInvoiceDefault();

      expect(fetchMock).toHaveBeenCalledTimes(1);

      const firstCallUrl = String(fetchMock.mock.calls[0]?.[0]);
      const firstCallOptions = fetchMock.mock.calls[0]?.[1] as { method?: string };
      const requestUrl = new URL(firstCallUrl);

      expect(requestUrl.pathname).toBe('/api/invoices/default');
      expect(firstCallOptions.method).toBe('GET');
    });

    it('uses GET /projects/default for project default template', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(200, {
          name: '',
          status: 'active',
        })
      );

      const client = new BoondAPIClient('test-token');
      await client.getProjectDefault();

      expect(fetchMock).toHaveBeenCalledTimes(1);

      const firstCallUrl = String(fetchMock.mock.calls[0]?.[0]);
      const firstCallOptions = fetchMock.mock.calls[0]?.[1] as { method?: string };
      const requestUrl = new URL(firstCallUrl);

      expect(requestUrl.pathname).toBe('/api/projects/default');
      expect(firstCallOptions.method).toBe('GET');
    });

    it('uses GET /opportunities/default for opportunity default template', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(200, {
          title: '',
          probability: 0,
          currency: 'EUR',
        })
      );

      const client = new BoondAPIClient('test-token');
      await client.getOpportunityDefault();

      expect(fetchMock).toHaveBeenCalledTimes(1);

      const firstCallUrl = String(fetchMock.mock.calls[0]?.[0]);
      const firstCallOptions = fetchMock.mock.calls[0]?.[1] as { method?: string };
      const requestUrl = new URL(firstCallUrl);

      expect(requestUrl.pathname).toBe('/api/opportunities/default');
      expect(firstCallOptions.method).toBe('GET');
    });
  });
});
