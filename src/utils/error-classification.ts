import { ApiError } from '../api/client.js';

export type ErrorClassification =
  | 'permission_denied'
  | 'provider_blocked'
  | 'resource_not_found'
  | 'unsupported_endpoint'
  | 'validation_rejected'
  | 'input_required'
  | 'unknown_error';

export interface ClassifiedError {
  classification: ErrorClassification;
  details: string;
}

function isInputRequiredMessage(message: string): boolean {
  return /missing required|required parameter|required field|must be provided/i.test(message);
}

function isProviderBlocked(error: ApiError): boolean {
  return (
    error.code === 'CLOUDFLARE_BLOCK' ||
    /cloudflare|waf|attention required|just a moment|upstream block/i.test(error.message)
  );
}

export function classifyError(error: unknown): ClassifiedError {
  if (error instanceof ApiError) {
    if (isInputRequiredMessage(error.message)) {
      return { classification: 'input_required', details: error.message };
    }

    if (error.statusCode === 403) {
      return {
        classification: isProviderBlocked(error) ? 'provider_blocked' : 'permission_denied',
        details: error.message,
      };
    }

    if (error.statusCode === 404) {
      return { classification: 'resource_not_found', details: error.message };
    }

    if (error.statusCode === 405) {
      return { classification: 'unsupported_endpoint', details: error.message };
    }

    if (error.statusCode === 422) {
      return { classification: 'validation_rejected', details: error.message };
    }

    return {
      classification: 'unknown_error',
      details: `${error.code}: ${error.message}`,
    };
  }

  if (error instanceof Error) {
    if (isInputRequiredMessage(error.message)) {
      return { classification: 'input_required', details: error.message };
    }

    return { classification: 'unknown_error', details: error.message };
  }

  return { classification: 'unknown_error', details: String(error) };
}
