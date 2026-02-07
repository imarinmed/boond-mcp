# Distribution Guide - BoondManager MCP Server

This document outlines the various methods available for distributing and deploying the BoondManager MCP Server.

## Overview

The BoondManager MCP Server is designed to be flexible and can be distributed through multiple channels depending on your organization's needs and security requirements.

| Method                  | Best For                   | Complexity | Maintenance            |
| ----------------------- | -------------------------- | ---------- | ---------------------- |
| **Git Repository**      | Developers & Customization | Low        | Manual Updates         |
| **NPM Package**         | Standard Users             | Very Low   | Automatic (npm update) |
| **Docker**              | Consistent Environments    | Medium     | Image Based            |
| **Direct Distribution** | Air-gapped / Offline       | High       | Manual                 |

---

## 1. Git Repository (Recommended)

The primary method for distribution is via the official GitHub repository. This allows users to stay up-to-date with the latest features and contribute back to the project.

### How to Distribute

1. Provide the repository URL: `https://github.com/imarinmed/boond-mcp`
2. Users clone the repository and build locally.

### Advantages

- Full access to source code.
- Ability to customize tools or add new ones.
- Easy to switch between versions using Git tags.

---

## 2. NPM Package

For users who want a "plug-and-play" experience without managing source code, the server can be distributed as an NPM package.

### How to Distribute

1. Publish the package to the NPM registry: `npm publish`
2. Users install it globally or as a dependency: `npm install -g boond-mcp`

### Advantages

- Simplest installation process.
- Version management via semver.
- No need for local build steps.

---

## 3. Docker

Docker distribution ensures that the server runs in an identical environment regardless of the host machine's configuration.

### How to Distribute

1. Build and push the Docker image to a registry (e.g., Docker Hub, GitHub Packages).
2. Users pull and run the image.

### Advantages

- Isolated environment.
- No dependency on local Node.js/Bun versions.
- Ideal for server-side deployments.

---

## 4. Direct Distribution (Offline)

For organizations with strict security policies or air-gapped environments, the server can be distributed as a pre-built bundle.

### How to Distribute

1. Run the distribution script: `bun run dist`
2. This creates a `dist/` directory containing the compiled JavaScript and necessary configuration files.
3. Compress the `dist/` directory and share it via secure channels.

### Advantages

- Works without internet access.
- No build tools required on the target machine.

---

## Security Best Practices

When distributing the BoondManager MCP Server, follow these security guidelines:

### 1. API Token Management

- **NEVER** include a `BOOND_API_TOKEN` in the distributed source code or Docker images.
- Each user must generate their own token from their BoondManager account.
- Use environment variables or secure secret managers to provide the token at runtime.

### 2. Private Repositories

- If you have customized the server with proprietary logic, use a private Git repository for distribution.

### 3. Input Validation

- The server uses Zod for strict input validation. Ensure these schemas are not bypassed if you modify the code.

### 4. Regular Updates

- Encourage users to update regularly to receive security patches and API compatibility fixes.

---

## Versioning Policy

This project follows [Semantic Versioning (SemVer)](https://semver.org/):

- **Major**: Breaking changes or significant architectural shifts.
- **Minor**: New tools or features (e.g., adding a new domain).
- **Patch**: Bug fixes and minor improvements.

Refer to the [Changelog](README.md#changelog) for version history.
