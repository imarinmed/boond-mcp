# Long-Term Support (LTS) Policy

This document outlines the Long-Term Support (LTS) policy for the BoondManager MCP Server. Our goal is to provide a stable, predictable, and secure platform for integrating BoondManager with AI assistants.

## 1. Overview

Starting with the v1.0.0 release, the BoondManager MCP Server enters a stable phase. We commit to supporting major versions for a defined period to ensure that users can rely on the server for production workloads without fear of sudden breaking changes or unpatched security vulnerabilities.

## 2. Support Lifecycle

Each major version of the BoondManager MCP Server follows a structured support lifecycle.

| Phase                 | Duration  | Description                                                        |
| --------------------- | --------- | ------------------------------------------------------------------ |
| **Active Support**    | 12 Months | New features, minor enhancements, bug fixes, and security updates. |
| **Maintenance (LTS)** | 24 Months | Critical bug fixes and security patches only. No new features.     |
| **End of Life (EOL)** | -         | No further updates or support provided.                            |

### v1.x Support Timeline

- **Release Date**: February 7, 2026
- **Active Support Ends**: February 7, 2027
- **Maintenance (LTS) Ends**: February 7, 2028

## 3. Semantic Versioning

We strictly adhere to [Semantic Versioning 2.0.0 (SemVer)](https://semver.org/).

- **MAJOR (X.0.0)**: Breaking changes to the API or fundamental behavior.
- **MINOR (1.X.0)**: Backward-compatible new features or enhancements.
- **PATCH (1.0.X)**: Backward-compatible bug fixes and security patches.

For more details on what constitutes a breaking change, see [API_STABILITY.md](API_STABILITY.md).

## 4. Security Update Policy

Security is a top priority. We handle security vulnerabilities as follows:

- **Critical Vulnerabilities**: Patched in the current active version and all supported LTS versions as soon as possible.
- **Dependency Updates**: Regular updates to internal dependencies to address known vulnerabilities (CVEs).
- **Reporting**: Security issues should be reported via GitHub Issues with the `security` label or by contacting the maintainers directly.

## 5. Deprecation Policy

When a feature or tool is slated for removal, we provide a clear transition period:

1.  **Notice**: The feature is marked as `deprecated` in documentation and code.
2.  **Duration**: Deprecated features will remain functional for at least **6 months** or until the next major version release, whichever is longer.
3.  **Migration**: Every deprecation notice will include a clear migration path to the recommended alternative.

## 6. Runtime Support Policy

We support the following runtimes for the BoondManager MCP Server:

- **Node.js**: Current LTS and Active LTS versions (currently 18, 20, 22).
- **Bun**: v1.0.0 and later.

Support for a runtime version is dropped only when it reaches its own End of Life (EOL) or when a major version of this server is released.

## 7. Upgrade Path

### From v0.x to v1.x

The transition from v0.x to v1.0.0 involved a significant expansion of tools (from 12 to 121) and a reorganization into domains.

- **Breaking Changes**: Some tool names from v0.x may have changed to fit the new `boond_<domain>_<action>` pattern.
- **Migration**: Users upgrading from v0.x should review the [README.md](../README.md) for the updated tool list and parameter schemas.
- **Compatibility**: v1.0.0 is NOT backward compatible with v0.x configurations if specific tool names were hardcoded in custom integrations.

## 8. Breaking Changes

Breaking changes are **only** introduced in Major version releases (e.g., v2.0.0). We aim to minimize breaking changes and will always provide:

- A minimum 6-month deprecation warning.
- A comprehensive migration guide.
- A beta period for the new major version to allow for testing.

## 9. End of Life (EOL)

Once a version reaches EOL, it will no longer receive any updates, including security patches. We strongly recommend all users to upgrade to a supported version before the EOL date.

---

_Last Updated: February 8, 2026_
