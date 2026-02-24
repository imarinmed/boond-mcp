import type { SearchResponse } from '../../../src/types/boond';

export function assertSearchResponse<T>(response: SearchResponse<T>) {
  if (!response) {
    throw new Error('Response is undefined');
  }

  if (!Array.isArray(response.data)) {
    throw new Error(`Expected data to be array, got ${typeof response.data}`);
  }

  if (!response.pagination) {
    throw new Error('Response missing pagination');
  }

  if (typeof response.pagination.page !== 'number') {
    throw new Error('Pagination page is not a number');
  }

  if (typeof response.pagination.limit !== 'number') {
    throw new Error('Pagination limit is not a number');
  }

  if (typeof response.pagination.total !== 'number') {
    throw new Error('Pagination total is not a number');
  }
}

export function assertEntityResponse(entity: any, requiredFields: string[]) {
  if (!entity) {
    throw new Error('Entity is undefined');
  }

  if (!entity.id) {
    throw new Error('Entity missing id field');
  }

  for (const field of requiredFields) {
    if (!(field in entity)) {
      throw new Error(`Entity missing required field: ${field}`);
    }
  }
}

export function assertNoError(response: any) {
  if (response && response.isError) {
    throw new Error(`Response contains error: ${JSON.stringify(response.content)}`);
  }
}

export function assertErrorResponse(error: any, expectedStatus?: number) {
  if (!error) {
    throw new Error('Expected an error but got none');
  }

  if (expectedStatus && error.status !== expectedStatus) {
    throw new Error(`Expected status ${expectedStatus}, got ${error.status}`);
  }
}

export function assertPaginationValid(pagination: { page: number; limit: number; total: number }) {
  if (pagination.page < 1) {
    throw new Error(`Invalid page number: ${pagination.page}`);
  }

  if (pagination.limit < 1 || pagination.limit > 1000) {
    throw new Error(`Invalid limit: ${pagination.limit}`);
  }

  if (pagination.total < 0) {
    throw new Error(`Invalid total: ${pagination.total}`);
  }
}
