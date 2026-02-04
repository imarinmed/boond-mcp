# BoondManager MCP Server - Distribution Guide

A comprehensive guide to distributing the BoondManager MCP Server to peers and colleagues. Choose the method that best fits your team's workflow.

**Table of Contents**
- [Overview](#overview)
- [Security Requirements](#security-requirements)
- [Method 1: Git Repository (Recommended)](#method-1-git-repository-recommended)
- [Method 2: NPM Package](#method-2-npm-package)
- [Method 3: Docker Container](#method-3-docker-container)
- [Method 4: Direct Distribution](#method-4-direct-distribution)
- [Comparison Table](#comparison-table)
- [Security Checklist](#security-checklist)

---

## Overview

This MCP server can be distributed via four different methods, each with its own advantages:

1. **Git Repository** - Best for teams using version control
2. **NPM Package** - Best for Node.js/Bun developers
3. **Docker Container** - Best for isolated, consistent environments
4. **Direct Distribution** - Best for simple, offline sharing

All methods require users to provide their own BoondManager API token.

---

## Security Requirements

### ⚠️ CRITICAL - NEVER DO THIS:
- ❌ Commit API tokens to the repository
- ❌ Include credentials in Docker images
- ❌ Share API tokens via email or chat
- ❌ Publish tokens in documentation
- ❌ Use the same token across multiple machines

### ✅ ALWAYS DO THIS:
- ✅ Use `.env` files for local configuration
- ✅ Include `.env` in `.gitignore`
- ✅ Provide `.env.example` template
- ✅ Each user generates their own API token
- ✅ Store tokens in environment variables
- ✅ Document security best practices
- ✅ Use private repositories (not public)

---

## Method 1: Git Repository (Recommended)

**Best for**: Teams already using Git, continuous updates, collaboration.

**Advantages**:
- ✅ Version control and history
- ✅ Easy updates with `git pull`
- ✅ Collaborative development
- ✅ No additional tooling required
- ✅ Easy to fork and customize

**Disadvantages**:
- ❌ Requires Git knowledge
- ❌ Must maintain a Git server
- ❌ Network access to Git server required

### Setup Steps

#### 1. Create a Private Repository (GitHub/GitLab/Gitea)

**On GitHub:**
1. Go to https://github.com/new
2. Create a new repository named `boond-mcp`
3. Set it to **PRIVATE** (critical for security)
4. Do NOT initialize with README (we'll push existing code)

**On GitLab or Gitea**, follow similar steps ensuring the repository is private.

#### 2. Prepare Local Repository

```bash
cd boond-mcp

# Initialize git (if not already done)
git init

# Create a meaningful .gitignore
cat > .gitignore << 'EOF'
node_modules/
build/
dist/
.env
.env.local
.env.*.local
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
.vscode/
.idea/
*.swp
*.swo
*~
.sisyphus/
.git/
EOF

# Stage all files
git add .

# Create initial commit
git commit -m "Initial commit: BoondManager MCP Server with 94+ tools"
```

#### 3. Connect to Remote and Push

```bash
# Add your remote repository
git remote add origin https://github.com/yourusername/boond-mcp.git

# Rename branch to main if needed
git branch -M main

# Push to remote
git push -u origin main
```

#### 4. Add Collaborators

**On GitHub:**
1. Go to repository Settings → Collaborators
2. Click "Add people"
3. Enter team member usernames
4. Select appropriate permissions (pull/push/admin)

**On GitLab:**
1. Go to Project → Members
2. Click "Add members"
3. Select role (Maintainer/Developer/Guest)

#### 5. Team Members: Clone and Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/boond-mcp.git
cd boond-mcp

# Install dependencies
bun install

# Build
bun run build

# Configure environment
cp .env.example .env
# Edit .env with your BoondManager API token

# Update Claude Desktop config with path to build/index.js
```

#### 6. Keep in Sync

```bash
# Pull latest changes
git pull origin main

# Rebuild if necessary
bun run build
```

---

## Method 2: NPM Package

**Best for**: Developers, package managers, version pinning.

**Advantages**:
- ✅ Simple installation via `npm install`
- ✅ Version management with package.json
- ✅ Easy updates
- ✅ Standard Node.js workflow

**Disadvantages**:
- ❌ Requires private NPM registry
- ❌ Additional setup complexity
- ❌ Not ideal for non-developers

### Setup Steps

#### 1. Update package.json

```json
{
  "name": "@yourcompany/boond-mcp",
  "version": "0.1.0",
  "description": "TypeScript MCP server for BoondManager API",
  "type": "module",
  "main": "./build/index.js",
  "bin": {
    "boond-mcp": "./build/index.js"
  },
  "files": [
    "build/",
    "README.md",
    "package.json"
  ],
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/boond-mcp.git"
  }
}
```

#### 2. Create .npmrc for GitHub Packages

```bash
cat > .npmrc << 'EOF'
@yourcompany:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}
EOF
```

#### 3. Create GitHub Actions Workflow (Optional)

Create `.github/workflows/publish.yml`:

```yaml
name: Publish NPM Package

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build
      - uses: actions/setup-node@v3
        with:
          registry-url: 'https://npm.pkg.github.com'
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### 4. Publish the Package

```bash
# Update version in package.json
npm version minor

# Build
bun run build

# Publish to GitHub Packages
npm publish
```

#### 5. Team Members: Install and Use

```bash
# Add .npmrc to your home directory or project
echo "@yourcompany:registry=https://npm.pkg.github.com" >> ~/.npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> ~/.npmrc

# Install
npm install @yourcompany/boond-mcp

# Or with Bun
bun add @yourcompany/boond-mcp
```

#### 6. Configure Claude Desktop

```json
{
  "mcpServers": {
    "boondmanager": {
      "command": "node",
      "args": ["./node_modules/@yourcompany/boond-mcp/build/index.js"],
      "env": {
        "BOOND_API_TOKEN": "your_token_here"
      }
    }
  }
}
```

---

## Method 3: Docker Container

**Best for**: Containerized deployments, consistent environments, DevOps teams.

**Advantages**:
- ✅ No dependency issues
- ✅ Consistent runtime environment
- ✅ Portable across machines
- ✅ Easy version pinning
- ✅ Scalable deployment

**Disadvantages**:
- ❌ Requires Docker knowledge
- ❌ Larger file sizes
- ❌ More complex setup for Claude Desktop

### Setup Steps

#### 1. Build Docker Image

```bash
# Build the image
docker build -t boond-mcp:latest .

# Tag for registry (optional)
docker tag boond-mcp:latest ghcr.io/yourusername/boond-mcp:latest
```

#### 2. Push to Container Registry (Optional)

**GitHub Container Registry:**
```bash
# Login
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Push
docker push ghcr.io/yourusername/boond-mcp:latest
```

**Docker Hub:**
```bash
# Login
docker login

# Tag
docker tag boond-mcp:latest yourusername/boond-mcp:latest

# Push
docker push yourusername/boond-mcp:latest
```

#### 3. Create Docker Compose File (Optional)

```yaml
version: '3.8'
services:
  boond-mcp:
    image: boond-mcp:latest
    environment:
      BOOND_API_TOKEN: ${BOOND_API_TOKEN}
    ports:
      - "127.0.0.1:3000:3000"
    restart: unless-stopped
```

#### 4. Team Members: Run Container

**From local image:**
```bash
docker run -e BOOND_API_TOKEN=your_token_here boond-mcp:latest
```

**From registry:**
```bash
docker pull ghcr.io/yourusername/boond-mcp:latest
docker run -e BOOND_API_TOKEN=your_token_here ghcr.io/yourusername/boond-mcp:latest
```

**With Docker Compose:**
```bash
docker compose up
```

#### 5. Configure Claude Desktop with Docker

**For macOS/Linux:**
```json
{
  "mcpServers": {
    "boondmanager": {
      "command": "docker",
      "args": ["run", "--rm", "-e", "BOOND_API_TOKEN=your_token_here", "boond-mcp:latest"]
    }
  }
}
```

**Note**: Docker must be running for this to work. Restart Claude Desktop after configuration.

---

## Method 4: Direct Distribution

**Best for**: Simple sharing, offline setup, non-technical users.

**Advantages**:
- ✅ Simple file-based sharing
- ✅ No external dependencies
- ✅ Offline distribution possible
- ✅ Works via email or USB drive

**Disadvantages**:
- ❌ Manual updates required
- ❌ Version management difficult
- ❌ Hard to track who has which version

### Setup Steps

#### 1. Create Distribution Archive

```bash
#!/bin/bash
ARCHIVE_NAME="boond-mcp-$(date +%Y-%m-%d).tar.gz"

# Ensure build exists
bun run build

# Create archive
tar --exclude='.git' \
    --exclude='node_modules' \
    --exclude='.env' \
    --exclude='.sisyphus' \
    --exclude='dist' \
    -czf "$ARCHIVE_NAME" \
    boond-mcp/

echo "Distribution archive created: $ARCHIVE_NAME"
echo "Size: $(du -h $ARCHIVE_NAME | cut -f1)"
```

#### 2. Prepare Distribution Package

```bash
# Create distribution directory
mkdir -p distribution/boond-mcp-dist

# Copy essential files
cp -r boond-mcp/build distribution/boond-mcp-dist/
cp boond-mcp/package.json distribution/boond-mcp-dist/
cp boond-mcp/.env.example distribution/boond-mcp-dist/
cp boond-mcp/README.md distribution/boond-mcp-dist/
cp boond-mcp/SETUP.md distribution/boond-mcp-dist/

# Create archive
tar -czf distribution/boond-mcp-dist.tar.gz distribution/boond-mcp-dist/

# Create ZIP for Windows users (optional)
cd distribution && zip -r boond-mcp-dist.zip boond-mcp-dist/ && cd ..
```

#### 3. Create Installation Instructions

```bash
# Create INSTALL.txt in distribution package
cat > distribution/INSTALL.txt << 'EOF'
BoondManager MCP Server - Direct Installation

1. Extract the archive:
   tar xzf boond-mcp-dist.tar.gz
   (Or use 7-Zip/WinRAR on Windows)

2. Navigate to directory:
   cd boond-mcp-dist

3. Install dependencies:
   bun install
   (or: npm install)

4. Create environment file:
   cp .env.example .env
   Edit .env and add your BOOND_API_TOKEN

5. Build the project:
   bun run build
   (or: npm run build)

6. Configure Claude Desktop:
   See SETUP.md for detailed instructions

7. Restart Claude Desktop to load the tools

For help, see README.md and SETUP.md
EOF
```

#### 4. Secure Distribution

**Choose one:**
- Email attachment (smaller archives only)
- Shared cloud storage (Dropbox, OneDrive, Google Drive)
- USB drive (for offline distribution)
- Secure file transfer (Tresorit, Sync.com)

**Never use**: Public file sharing, unencrypted email, public cloud storage.

#### 5. Team Members: Extract and Setup

```bash
# Extract
tar xzf boond-mcp-dist.tar.gz
cd boond-mcp-dist

# Follow SETUP.md instructions
cat SETUP.md

# Install and configure
bun install
bun run build
cp .env.example .env
# Edit .env with your token
```

---

## Comparison Table

| Aspect | Git | NPM | Docker | Direct |
|--------|-----|-----|--------|--------|
| **Setup Difficulty** | Medium | High | Medium | Low |
| **Update Frequency** | Any | Any | Any | Manual |
| **Version Control** | ✅ Excellent | ✅ Excellent | ✅ Good | ❌ Manual |
| **Team Collaboration** | ✅ Yes | ✅ Yes | ✅ Limited | ❌ No |
| **Scalability** | ✅ Good | ✅ Excellent | ✅ Excellent | ❌ Poor |
| **Offline Support** | ❌ No | ❌ No | ✅ (pre-built) | ✅ Yes |
| **Security** | ✅ High | ✅ High | ✅ High | ✅ High |
| **Learning Curve** | Medium | Medium | Medium | Low |

---

## Recommended Approaches

### For Small Teams (2-5 people)
**→ Use Git + SETUP.md**
- Easy to setup
- Good collaboration
- Simple updates
- Low overhead

### For Mid-Size Teams (6-20 people)
**→ Use Git + Docker**
- Git for version control and updates
- Docker for consistent environments
- Both accessible to developers

### For Large/Enterprise Teams
**→ Use NPM Package + Docker**
- NPM for easy dependency management
- Docker for production deployment
- Integrates with existing CI/CD

### For Non-Technical Distribution
**→ Use Direct Distribution**
- Simple zip/tar.gz file
- No external dependencies
- Works offline
- Self-contained instructions

---

## Security Checklist

Before distributing, verify:

- [ ] `.env` file is in `.gitignore`
- [ ] `.env.example` exists without real credentials
- [ ] No hardcoded API tokens in source code
- [ ] No credentials in docker images
- [ ] No credentials in documentation
- [ ] Repository is set to PRIVATE
- [ ] Each team member has their own API token
- [ ] SECURITY requirements documented
- [ ] Distribution method documented
- [ ] Update procedure documented

---

## Troubleshooting Distribution

### "Repository not found" error
- Verify repository URL is correct
- Check repository permissions
- Ensure SSH/HTTPS access is configured

### "Authentication failed" when pulling
- Generate new Personal Access Token (GitHub)
- Configure SSH keys properly
- Check .npmrc credentials

### "Docker image not found"
- Verify image name and tag
- Check image was successfully built
- Verify registry access if using remote registry

### "Module not found" in Claude Desktop
- Verify path is absolute, not relative
- Check that build/ directory exists
- Restart Claude Desktop completely
- Review SETUP.md troubleshooting section

---

## Next Steps

1. Choose your distribution method
2. Follow the setup steps for your chosen method
3. Test with one team member before full rollout
4. Document the procedure for your team
5. Schedule regular update communication
6. Monitor and support team adoption

---

## Support Resources

- **Setup Help**: See SETUP.md
- **Building**: See README.md - Development section
- **API Docs**: https://doc.boondmanager.com/api-externe/
- **Claude Desktop**: https://claude.ai/desktop
- **MCP Protocol**: https://modelcontextprotocol.io/
