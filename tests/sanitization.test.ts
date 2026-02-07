import { describe, expect, it, vi } from 'vitest';

import {
  applyInputSanitizationToServer,
  sanitizeInput,
  wrapToolHandlerWithInputSanitization,
} from '../src/utils/input-sanitization';

describe('input sanitization', () => {
  it('keeps benign input unchanged', () => {
    const input = {
      query: 'react developer paris',
      page: 1,
      includeArchived: false,
    };

    const sanitized = sanitizeInput(input);
    expect(sanitized).toEqual(input);
  });

  it('sanitizes nested objects and arrays recursively', () => {
    const input = {
      filters: {
        company: '<Acme>',
        tags: ['safe', '<img src=x onerror=alert(1)>'],
      },
      metadata: [{ note: 'ok' }, { note: '<b>danger</b>' }],
    };

    const sanitized = sanitizeInput(input);

    expect(sanitized.filters.company).toBe('&lt;Acme&gt;');
    expect(sanitized.filters.tags[0]).toBe('safe');
    expect(sanitized.filters.tags[1]).toBe('&lt;img src=x onerror=alert(1)&gt;');
    expect(sanitized.metadata[0].note).toBe('ok');
    expect(sanitized.metadata[1].note).toBe('&lt;b&gt;danger&lt;/b&gt;');
  });

  it('neutralizes script-tag style payloads', () => {
    const payload = '<script>alert("xss");</script>';
    const sanitized = sanitizeInput(payload);

    expect(sanitized).toBe('&lt;script&gt;alert(&quot;xss&quot;) &lt;/script&gt;');
  });

  it('neutralizes basic injection-like tokens', () => {
    const payload = "' OR 1=1; DROP TABLE users; --";
    const sanitized = sanitizeInput(payload);

    expect(sanitized).toContain('&#39;');
    expect(sanitized).not.toContain('; DROP');
    expect(sanitized).not.toContain('--');
  });

  it('sanitizes tool callback arguments at ingress', async () => {
    const seen = vi.fn();
    const wrapped = wrapToolHandlerWithInputSanitization(async (...args) => {
      seen(args[0]);

      return {
        content: [{ type: 'text', text: 'ok' }],
      };
    });

    await wrapped({ query: '<script>alert(1)</script>' });

    expect(seen).toHaveBeenCalledWith({ query: '&lt;script&gt;alert(1)&lt;/script&gt;' });
  });

  it('patches server.registerTool to sanitize incoming params centrally', async () => {
    const registerTool = vi.fn();
    const mockServer = {
      registerTool,
    };

    applyInputSanitizationToServer(mockServer as never);

    const originalHandler = vi.fn(async (params: unknown) => {
      return {
        content: [{ type: 'text', text: JSON.stringify(params) }],
      };
    });

    mockServer.registerTool('tool', { description: 'desc', inputSchema: {} }, originalHandler);

    const callback = registerTool.mock.calls[0]?.[2] as
      | ((params: unknown) => Promise<unknown>)
      | undefined;
    await callback?.({ query: '<script>1</script>; --' });

    expect(originalHandler).toHaveBeenCalledWith({
      query: '&lt;script&gt;1&lt;/script&gt;   - - ',
    });
  });
});
