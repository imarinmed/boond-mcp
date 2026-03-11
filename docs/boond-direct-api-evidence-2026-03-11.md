# Boond Direct API Evidence — 2026-03-11

This document contains **literal direct Boond API requests and responses** captured outside the MCP layer, focusing exclusively on endpoints that are **still failing at the Boond API level**.

- **Captured at (UTC):** `2026-03-11T12:11:32Z`
- **Base URL:** `https://ui.boondmanager.com/api`
- **Auth mode:** `jwt-client`
- **Auth redaction policy:** `X-Jwt-Client-Boondmanager` is redacted as `<redacted-jwt>`
- **User-Agent used:** `boond-mcp/1.0.0 (direct-evidence-probe)`

## Scope and exclusions

This document is intended for Boond support to investigate **Boond-side API failures only**.

**Excluded from this report:**
- `expenses_search` — Direct API validation shows the endpoint works correctly when `startMonth` and `endMonth` parameters are provided. The remaining issue is an **MCP-side request-shape problem** that we are fixing on our end. Do not investigate this as a Boond API failure.
- `timesreports_search` — Similarly validated as working with proper month parameters.

**Included in this report:**
- `contracts_search` — Fails directly at the Boond edge/API layer
- `documents_search` — Fails directly across all tested variants

## Top-level interpretation

From these direct calls:

1. **Contracts still fail directly** at the Boond edge/API layer (`403` Cloudflare block on base endpoint, then `404`/`405` on search variants).
2. **Documents still fail directly** across all tested variants (`404` / `405`).

This means:

- `documents_search` remains a **Boond-side API compatibility / availability issue**.
- `contracts_search` remains a **Boond-side Cloudflare/WAF / endpoint issue**.

---

## Full captured transcript (failing endpoints only)

```json
{
  "captured_at_utc": "2026-03-11T12:11:32Z",
  "base_url": "https://ui.boondmanager.com/api",
  "auth_mode": "jwt-client",
  "scope": "boond-side-failures-only",
  "results": [
    {
      "label": "contracts-base",
      "request": {
        "method": "GET",
        "url": "https://ui.boondmanager.com/api/contracts?page=1&limit=1",
        "headers": {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "User-Agent": "boond-mcp/1.0.0 (direct-evidence-probe)",
          "X-Jwt-Client-Boondmanager": "<redacted-jwt>"
        }
      },
      "response": {
        "status": 403,
        "headers": {
          "Date": "Wed, 11 Mar 2026 12:11:30 GMT",
          "Content-Type": "text/html; charset=UTF-8",
          "Transfer-Encoding": "chunked",
          "Connection": "close",
          "Cache-Control": "private, max-age=0, no-store, no-cache, must-revalidate, post-check=0, pre-check=0",
          "Expires": "Thu, 01 Jan 1970 00:00:01 GMT",
          "Referrer-Policy": "same-origin",
          "X-Frame-Options": "SAMEORIGIN",
          "Strict-Transport-Security": "max-age=15552000; includeSubDomains; preload",
          "X-Content-Type-Options": "nosniff",
          "Server": "cloudflare",
          "CF-RAY": "9daa764d98e399c6-CDG"
        },
        "body": "<!DOCTYPE html>\n<!--[if lt IE 7]> <html class=\"no-js ie6 oldie\" lang=\"en-US\"> <![endif]-->\n<!--[if IE 7]>    <html class=\"no-js ie7 oldie\" lang=\"en-US\"> <![endif]-->\n<!--[if IE 8]>    <html class=\"no-js ie8 oldie\" lang=\"en-US\"> <![endif]-->\n<!--[if gt IE 8]><!--> <html class=\"no-js\" lang=\"en-US\"> <!--<![endif]-->\n<head>\n<title>Attention Required! | Cloudflare</title>\n<meta charset=\"UTF-8\" />\n<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />\n<meta http-equiv=\"X-UA-Compatible\" content=\"IE=Edge\" />\n<meta name=\"robots\" content=\"noindex, nofollow\" />\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\" />\n<link rel=\"stylesheet\" id=\"cf_styles-css\" href=\"/cdn-cgi/styles/cf.errors.css\" />\n<!--[if lt IE 9]><link rel=\"stylesheet\" id='cf_styles-ie-css' href=\"/cdn-cgi/styles/cf.errors.ie.css\" /><![endif]-->\n<style>body{margin:0;padding:0}</style>\n\n\n<!--[if gte IE 10]><!-->\n<script>\n  if (!navigator.cookieEnabled) {\n    window.addEventListener('DOMContentLoaded', function () {\n      var cookieEl = document.getElementById('cookie-alert');\n      cookieEl.style.display = 'block';\n    })\n  }\n</script>\n<!--<![endif]-->\n\n</head>\n<body>\n  <div id=\"cf-wrapper\">\n    <div class=\"cf-alert cf-alert-error cf-cookie-error\" id=\"cookie-alert\" data-translate=\"enable_cookies\">Please enable cookies.</div>\n    <div id=\"cf-error-details\" class=\"cf-error-details-wrapper\">\n      <div class=\"cf-wrapper cf-header cf-error-overview\">\n        <h1 data-translate=\"block_headline\">Sorry, you have been blocked</h1>\n        <h2 class=\"cf-subheadline\"><span data-translate=\"unable_to_access\">You are unable to access</span> boondmanager.com</h2>\n      </div><!-- /.header -->\n\n      <div class=\"cf-section cf-highlight\">\n        <div class=\"cf-wrapper\">\n          <div class=\"cf-screenshot-container cf-screenshot-full\">\n            \n              <span cla...
      }
    },
    {
      "label": "contracts-search-get",
      "request": {
        "method": "GET",
        "url": "https://ui.boondmanager.com/api/contracts/search?page=1&limit=1",
        "headers": {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "User-Agent": "boond-mcp/1.0.0 (direct-evidence-probe)",
          "X-Jwt-Client-Boondmanager": "<redacted-jwt>"
        }
      },
      "response": {
        "status": 404,
        "headers": {
          "Date": "Wed, 11 Mar 2026 12:11:31 GMT",
          "Content-Type": "application/json",
          "Content-Length": "487",
          "Connection": "close",
          "Server": "cloudflare",
          "x-powered-by": "Fat-Free Framework",
          "x-frame-options": "SAMEORIGIN",
          "x-xss-protection": "1; mode=block",
          "x-content-type-options": "nosniff",
          "expires": "Thu, 01 Jan 1970 01:00:00 +0100",
          "last-modified": "Wed, 11 Mar 2026 13:11:31 +0100",
          "Cache-Control": "post-check=0, pre-check=0",
          "pragma": "no-cache",
          "Content-Encoding": "none",
          "access-control-allow-methods": "POST, GET, PUT, OPTIONS, PATCH, DELETE",
          "access-control-allow-headers": "content-type, cache-control, x-requested-with, authorization, x-jwt-app-boondmanager, x-jwt-client-boondmanager, x-token-boondmanager, x-front-boondmanager, x-front-version, x-csrf-boondmanager, traceparent, elastic-apm-traceparent, x-clockwork-id, x-clockwork-parent, content-encoding",
          "access-control-allow-credentials": "true",
          "strict-transport-security": "max-age=15552000; includeSubDomains; preload",
          "referrer-policy": "no-referrer-when-downgrade",
          "cf-cache-status": "DYNAMIC",
          "vary": "accept-encoding",
          "CF-RAY": "9daa764eea3e0247-WAW"
        },
        "body": "{\n    \"meta\": {\n        \"version\": \"9.1.34.0\",\n        \"androidMinVersion\": \"2.30.0\",\n        \"iosMinVersion\": \"2.27.0\",\n        \"isLogged\": true,\n        \"language\": \"en\",\n        \"timestamp\": 1773231091235,\n        \"login\": \"jsebban@inno-it.es\",\n        \"customer\": \"innoit\"\n    },\n    \"errors\": [\n        {\n            \"status\": \"404\",\n            \"code\": \"404\",\n            \"detail\": \"HTTP 404 (GET /api/contracts/search?page=1&limit=1)\",\n            \"title\": \"404\"\n        }\n    ]\n}"
      }
    },
    {
      "label": "contracts-search-post",
      "request": {
        "method": "POST",
        "url": "https://ui.boondmanager.com/api/contracts/search",
        "headers": {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "User-Agent": "boond-mcp/1.0.0 (direct-evidence-probe)",
          "X-Jwt-Client-Boondmanager": "<redacted-jwt>"
        },
        "json_body": {
          "page": 1,
          "limit": 1
        }
      },
      "response": {
        "status": 405,
        "headers": {
          "Date": "Wed, 11 Mar 2026 12:11:31 GMT",
          "Content-Type": "application/json",
          "Content-Length": "405",
          "Connection": "close",
          "Server": "cloudflare",
          "allow": "",
          "x-powered-by": "Fat-Free Framework",
          "x-frame-options": "SAMEORIGIN",
          "x-xss-protection": "1; mode=block",
          "x-content-type-options": "nosniff",
          "expires": "Thu, 01 Jan 1970 01:00:00 +0100",
          "last-modified": "Wed, 11 Mar 2026 13:11:31 +0100",
          "Cache-Control": "post-check=0, pre-check=0",
          "pragma": "no-cache",
          "Content-Encoding": "none",
          "access-control-allow-methods": "POST, GET, PUT, OPTIONS, PATCH, DELETE",
          "access-control-allow-headers": "content-type, cache-control, x-requested-with, authorization, x-jwt-app-boondmanager, x-jwt-client-boondmanager, x-token-boondmanager, x-front-boondmanager, x-front-version, x-csrf-boondmanager, traceparent, elastic-apm-traceparent, x-clockwork-id, x-clockwork-parent, content-encoding",
          "access-control-allow-credentials": "true",
          "strict-transport-security": "max-age=15552000; includeSubDomains; preload",
          "referrer-policy": "no-referrer-when-downgrade",
          "cf-cache-status": "DYNAMIC",
          "vary": "accept-encoding",
          "CF-RAY": "9daa7651edca3bcf-WAW"
        },
        "body": "{\n    \"meta\": {\n        \"version\": \"9.1.34.0\",\n        \"androidMinVersion\": \"2.30.0\",\n        \"iosMinVersion\": \"2.27.0\",\n        \"isLogged\": false,\n        \"language\": \"en\",\n        \"timestamp\": 1773231091541\n    },\n    \"errors\": [\n        {\n            \"status\": \"405\",\n            \"code\": \"405\",\n            \"detail\": \"HTTP 405 (POST /api/contracts/search)\",\n            \"title\": \"405\"\n        }\n    ]\n}"
      }
    },
    {
      "label": "documents-base-get",
      "request": {
        "method": "GET",
        "url": "https://ui.boondmanager.com/api/documents?query=test&page=1&limit=1",
        "headers": {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "User-Agent": "boond-mcp/1.0.0 (direct-evidence-probe)",
          "X-Jwt-Client-Boondmanager": "<redacted-jwt>"
        }
      },
      "response": {
        "status": 405,
        "headers": {
          "Date": "Wed, 11 Mar 2026 12:11:31 GMT",
          "Content-Type": "application/json",
          "Content-Length": "423",
          "Connection": "close",
          "Server": "cloudflare",
          "allow": "",
          "x-powered-by": "Fat-Free Framework",
          "x-frame-options": "SAMEORIGIN",
          "x-xss-protection": "1; mode=block",
          "x-content-type-options": "nosniff",
          "expires": "Thu, 01 Jan 1970 01:00:00 +0100",
          "last-modified": "Wed, 11 Mar 2026 13:11:31 +0100",
          "Cache-Control": "post-check=0, pre-check=0",
          "pragma": "no-cache",
          "Content-Encoding": "none",
          "access-control-allow-methods": "POST, GET, PUT, OPTIONS, PATCH, DELETE",
          "access-control-allow-headers": "content-type, cache-control, x-requested-with, authorization, x-jwt-app-boondmanager, x-jwt-client-boondmanager, x-token-boondmanager, x-front-boondmanager, x-front-version, x-csrf-boondmanager, traceparent, elastic-apm-traceparent, x-clockwork-id, x-clockwork-parent, content-encoding",
          "access-control-allow-credentials": "true",
          "strict-transport-security": "max-age=15552000; includeSubDomains; preload",
          "referrer-policy": "no-referrer-when-downgrade",
          "cf-cache-status": "DYNAMIC",
          "vary": "accept-encoding",
          "CF-RAY": "9daa76537b1af1a8-CDG"
        },
        "body": "{\n    \"meta\": {\n        \"version\": \"9.1.34.0\",\n        \"androidMinVersion\": \"2.30.0\",\n        \"iosMinVersion\": \"2.27.0\",\n        \"isLogged\": false,\n        \"language\": \"en\",\n        \"timestamp\": 1773231091777\n    },\n    \"errors\": [\n        {\n            \"status\": \"405\",\n            \"code\": \"405\",\n            \"detail\": \"HTTP 405 (GET /api/documents?query=test&page=1&limit=1)\",\n            \"title\": \"405\"\n        }\n    ]\n}"
      }
    },
    {
      "label": "documents-search-get",
      "request": {
        "method": "GET",
        "url": "https://ui.boondmanager.com/api/documents/search?query=test&page=1&limit=1",
        "headers": {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "User-Agent": "boond-mcp/1.0.0 (direct-evidence-probe)",
          "X-Jwt-Client-Boondmanager": "<redacted-jwt>"
        }
      },
      "response": {
        "status": 404,
        "headers": {
          "Date": "Wed, 11 Mar 2026 12:11:32 GMT",
          "Content-Type": "application/json",
          "Content-Length": "498",
          "Connection": "close",
          "Server": "cloudflare",
          "x-powered-by": "Fat-Free Framework",
          "x-frame-options": "SAMEORIGIN",
          "x-xss-protection": "1; mode=block",
          "x-content-type-options": "nosniff",
          "expires": "Thu, 01 Jan 1970 01:00:00 +0100",
          "last-modified": "Wed, 11 Mar 2026 13:11:32 +0100",
          "Cache-Control": "post-check=0, pre-check=0",
          "pragma": "no-cache",
          "Content-Encoding": "none",
          "access-control-allow-methods": "POST, GET, PUT, OPTIONS, PATCH, DELETE",
          "access-control-allow-headers": "content-type, cache-control, x-requested-with, authorization, x-jwt-app-boondmanager, x-jwt-client-boondmanager, x-token-boondmanager, x-front-boondmanager, x-front-version, x-csrf-boondmanager, traceparent, elastic-apm-traceparent, x-clockwork-id, x-clockwork-parent, content-encoding",
          "access-control-allow-credentials": "true",
          "strict-transport-security": "max-age=15552000; includeSubDomains; preload",
          "referrer-policy": "no-referrer-when-downgrade",
          "cf-cache-status": "DYNAMIC",
          "vary": "accept-encoding",
          "CF-RAY": "9daa76547e93f0fc-CDG"
        },
        "body": "{\n    \"meta\": {\n        \"version\": \"9.1.34.0\",\n        \"androidMinVersion\": \"2.30.0\",\n        \"iosMinVersion\": \"2.27.0\",\n        \"isLogged\": true,\n        \"language\": \"en\",\n        \"timestamp\": 1773231092074,\n        \"login\": \"jsebban@inno-it.es\",\n        \"customer\": \"innoit\"\n    },\n    \"errors\": [\n        {\n            \"status\": \"404\",\n            \"code\": \"404\",\n            \"detail\": \"HTTP 404 (GET /api/documents/search?query=test&page=1&limit=1)\",\n            \"title\": \"404\"\n        }\n    ]\n}"
      }
    },
    {
      "label": "documents-search-post",
      "request": {
        "method": "POST",
        "url": "https://ui.boondmanager.com/api/documents/search",
        "headers": {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "User-Agent": "boond-mcp/1.0.0 (direct-evidence-probe)",
          "X-Jwt-Client-Boondmanager": "<redacted-jwt>"
        },
        "json_body": {
          "query": "test",
          "page": 1,
          "limit": 1
        }
      },
      "response": {
        "status": 405,
        "headers": {
          "Date": "Wed, 11 Mar 2026 12:11:32 GMT",
          "Content-Type": "application/json",
          "Content-Length": "405",
          "Connection": "close",
          "Server": "cloudflare",
          "allow": "",
          "x-powered-by": "Fat-Free Framework",
          "x-frame-options": "SAMEORIGIN",
          "x-xss-protection": "1; mode=block",
          "x-content-type-options": "nosniff",
          "expires": "Thu, 01 Jan 1970 01:00:00 +0100",
          "last-modified": "Wed, 11 Mar 2026 13:11:32 +0100",
          "Cache-Control": "post-check=0, pre-check=0",
          "pragma": "no-cache",
          "Content-Encoding": "none",
          "access-control-allow-methods": "POST, GET, PUT, OPTIONS, PATCH, DELETE",
          "access-control-allow-headers": "content-type, cache-control, x-requested-with, authorization, x-jwt-app-boondmanager, x-jwt-client-boondmanager, x-token-boondmanager, x-front-boondmanager, x-front-version, x-csrf-boondmanager, traceparent, elastic-apm-traceparent, x-clockwork-id, x-clockwork-parent, content-encoding",
          "access-control-allow-credentials": "true",
          "strict-transport-security": "max-age=15552000; includeSubDomains; preload",
          "referrer-policy": "no-referrer-when-downgrade",
          "cf-cache-status": "DYNAMIC",
          "vary": "accept-encoding",
          "CF-RAY": "9daa7656cbe3ef97-WAW"
        },
        "body": "{\n    \"meta\": {\n        \"version\": \"9.1.34.0\",\n        \"androidMinVersion\": \"2.30.0\",\n        \"iosMinVersion\": \"2.27.0\",\n        \"isLogged\": false,\n        \"language\": \"en\",\n        \"timestamp\": 1773231092316\n    },\n    \"errors\": [\n        {\n            \"status\": \"405\",\n            \"code\": \"405\",\n            \"detail\": \"HTTP 405 (POST /api/documents/search)\",\n            \"title\": \"405\"\n        }\n    ]\n}"
      }
    },
    {
      "label": "documents-list-get",
      "request": {
        "method": "GET",
        "url": "https://ui.boondmanager.com/api/documents/list?query=test&page=1&limit=1",
        "headers": {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "User-Agent": "boond-mcp/1.0.0 (direct-evidence-probe)",
          "X-Jwt-Client-Boondmanager": "<redacted-jwt>"
        }
      },
      "response": {
        "status": 404,
        "headers": {
          "Date": "Wed, 11 Mar 2026 12:11:32 GMT",
          "Content-Type": "application/json",
          "Content-Length": "496",
          "Connection": "close",
          "Server": "cloudflare",
          "x-powered-by": "Fat-Free Framework",
          "x-frame-options": "SAMEORIGIN",
          "x-xss-protection": "1; mode=block",
          "x-content-type-options": "nosniff",
          "expires": "Thu, 01 Jan 1970 01:00:00 +0100",
          "last-modified": "Wed, 11 Mar 2026 13:11:32 +0100",
          "Cache-Control": "post-check=0, pre-check=0",
          "pragma": "no-cache",
          "Content-Encoding": "none",
          "access-control-allow-methods": "POST, GET, PUT, OPTIONS, PATCH, DELETE",
          "access-control-allow-headers": "content-type, cache-control, x-requested-with, authorization, x-jwt-app-boondmanager, x-jwt-client-boondmanager, x-token-boondmanager, x-front-boondmanager, x-front-version, x-csrf-boondmanager, traceparent, elastic-apm-traceparent, x-clockwork-id, x-clockwork-parent, content-encoding",
          "access-control-allow-credentials": "true",
          "strict-transport-security": "max-age=15552000; includeSubDomains; preload",
          "referrer-policy": "no-referrer-when-downgrade",
          "cf-cache-status": "DYNAMIC",
          "vary": "accept-encoding",
          "CF-RAY": "9daa7657eac93ccf-CDG"
        },
        "body": "{\n    \"meta\": {\n        \"version\": \"9.1.34.0\",\n        \"androidMinVersion\": \"2.30.0\",\n        \"iosMinVersion\": \"2.27.0\",\n        \"isLogged\": true,\n        \"language\": \"en\",\n        \"timestamp\": 1773231092661,\n        \"login\": \"jsebban@inno-it.es\",\n        \"customer\": \"innoit\"\n    },\n    \"errors\": [\n        {\n            \"status\": \"404\",\n            \"code\": \"404\",\n            \"detail\": \"HTTP 404 (GET /api/documents/list?query=test&page=1&limit=1)\",\n            \"title\": \"404\"\n        }\n    ]\n}"
      }
    },
    {
      "label": "documents-list-post",
      "request": {
        "method": "POST",
        "url": "https://ui.boondmanager.com/api/documents/list",
        "headers": {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "User-Agent": "boond-mcp/1.0.0 (direct-evidence-probe)",
          "X-Jwt-Client-Boondmanager": "<redacted-jwt>"
        },
        "json_body": {
          "query": "test",
          "page": 1,
          "limit": 1
        }
      },
      "response": {
        "status": 405,
        "headers": {
          "Date": "Wed, 11 Mar 2026 12:11:32 GMT",
          "Content-Type": "application/json",
          "Content-Length": "403",
          "Connection": "close",
          "Server": "cloudflare",
          "allow": "",
          "x-powered-by": "Fat-Free Framework",
          "x-frame-options": "SAMEORIGIN",
          "x-xss-protection": "1; mode=block",
          "x-content-type-options": "nosniff",
          "expires": "Thu, 01 Jan 1970 01:00:00 +0100",
          "last-modified": "Wed, 11 Mar 2026 13:11:32 +0100",
          "Cache-Control": "post-check=0, pre-check=0",
          "pragma": "no-cache",
          "Content-Encoding": "none",
          "access-control-allow-methods": "POST, GET, PUT, OPTIONS, PATCH, DELETE",
          "access-control-allow-headers": "content-type, cache-control, x-requested-with, authorization, x-jwt-app-boondmanager, x-jwt-client-boondmanager, x-token-boondmanager, x-front-boondmanager, x-front-version, x-csrf-boondmanager, traceparent, elastic-apm-traceparent, x-clockwork-id, x-clockwork-parent, content-encoding",
          "access-control-allow-credentials": "true",
          "strict-transport-security": "max-age=15552000; includeSubDomains; preload",
          "referrer-policy": "no-referrer-when-downgrade",
          "cf-cache-status": "DYNAMIC",
          "vary": "accept-encoding",
          "CF-RAY": "9daa7659ec613bc5-WAW"
        },
        "body": "{\n    \"meta\": {\n        \"version\": \"9.1.34.0\",\n        \"androidMinVersion\": \"2.30.0\",\n        \"iosMinVersion\": \"2.27.0\",\n        \"isLogged\": false,\n        \"language\": \"en\",\n        \"timestamp\": 1773231092823\n    },\n    \"errors\": [\n        {\n            \"status\": \"405\",\n            \"code\": \"405\",\n            \"detail\": \"HTTP 405 (POST /api/documents/list)\",\n            \"title\": \"405\"\n        }\n    ]\n}"
      }
    }
  ]
}
```

---

## Summary for Boond support

### Confirmed directly against Boond API (still failing)

#### Contracts
- `GET /api/contracts?page=1&limit=1` → `403` Cloudflare block page
- `GET /api/contracts/search?page=1&limit=1` → `404`
- `POST /api/contracts/search` → `405`

#### Documents
- `GET /api/documents?query=test&page=1&limit=1` → `405`
- `GET /api/documents/search?query=test&page=1&limit=1` → `404`
- `POST /api/documents/search` → `405`
- `GET /api/documents/list?query=test&page=1&limit=1` → `404`
- `POST /api/documents/list` → `405`

### Classification

- `documents_search`: **Boond-side endpoint/method compatibility problem**
- `contracts_search`: **Boond-side WAF / endpoint availability problem**

### Note on excluded endpoints

`expenses_search` and `timesreports_search` were validated separately and work correctly when the required `startMonth` / `endMonth` parameters are provided. These are being addressed as MCP-side request-shape fixes and should not be treated as Boond API failures.
