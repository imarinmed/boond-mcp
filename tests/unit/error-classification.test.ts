import { describe, expect, it } from 'vitest';
import { ApiError } from '../../src/api/client.js';
import { classifyError } from '../../src/utils/error-classification.js';

describe('error classification taxonomy', () => {
  it('classifies 401 as auth_error', () => {
    const result = classifyError(new ApiError(401, 'Invalid API credentials', 'AUTH_ERROR'));
    expect(result.classification).toBe('auth_error');
  });

  it('classifies explicit permission failures as permission_denied', () => {
    const result = classifyError(new ApiError(403, 'Forbidden: insufficient permissions', 'FORBIDDEN'));
    expect(result.classification).toBe('permission_denied');
  });

  it('classifies cloudflare or waf blocks as provider_blocked', () => {
    const result = classifyError(
      new ApiError(
        403,
        'Forbidden by Cloudflare/WAF while reaching Boond API',
        'CLOUDFLARE_BLOCK'
      )
    );
    expect(result.classification).toBe('provider_blocked');
  });

  it('classifies 404 as resource_not_found', () => {
    const result = classifyError(new ApiError(404, 'Resource not found', 'NOT_FOUND'));
    expect(result.classification).toBe('resource_not_found');
  });

  it('classifies endpoint unavailable errors as unsupported_endpoint', () => {
    const result = classifyError(
      new ApiError(405, 'Method not allowed for endpoint /foo', 'METHOD_NOT_ALLOWED')
    );
    expect(result.classification).toBe('unsupported_endpoint');
  });

  it('classifies semantic validation failures as validation_rejected', () => {
    const result = classifyError(new ApiError(422, 'Validation failed: invalid field', 'VALIDATION_ERROR'));
    expect(result.classification).toBe('validation_rejected');
  });

  it('classifies missing required params as input_required', () => {
    const result = classifyError(new ApiError(400, 'Missing required parameter: accountId', 'BAD_REQUEST'));
    expect(result.classification).toBe('input_required');
  });
});
