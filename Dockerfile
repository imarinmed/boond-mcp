# BoondManager MCP Server - Production Docker Image
# Multi-stage build for optimal image size and performance

# Stage 1: Build
FROM oven/bun:latest AS builder

WORKDIR /build

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Build the project
RUN bun run build

# Stage 2: Production
FROM oven/bun:latest

WORKDIR /app

# Create non-root user for security
RUN id -u bun >/dev/null 2>&1 || (groupadd -r bun && useradd -r -g bun bun)

# Copy only built artifacts from builder
COPY --from=builder --chown=bun:bun /build/build ./build
COPY --from=builder --chown=bun:bun /build/package.json ./package.json
COPY --from=builder --chown=bun:bun /build/node_modules ./node_modules

# Copy documentation (README, SETUP, DISTRIBUTION files that exist)
COPY README.md ./
COPY SETUP.md ./
COPY DISTRIBUTION.md ./

# Switch to non-root user
USER bun

# Set environment for MCP server
ENV NODE_ENV=production

# Health check to verify the server can start
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD bun build/index.js --version 2>&1 | grep -q "boond-mcp" || exit 1

# Run the MCP server
# MCP servers communicate via stdio, so we run the server directly
CMD ["bun", "run", "build/index.js"]
