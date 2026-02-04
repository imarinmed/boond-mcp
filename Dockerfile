# BoondManager MCP Server - Production Docker Image
# Uses Bun runtime for optimal performance

FROM oven/bun:1-alpine

# Set working directory
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies with frozen lockfile for reproducibility
RUN bun install --frozen-lockfile

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Build the project
RUN bun run build

# Remove source code to reduce image size (optional, keep for debugging)
# RUN rm -rf src tsconfig.json

# Create a non-root user for security
RUN addgroup -S boond && adduser -S boond -G boond
USER boond

# Health check (optional - verifies the MCP server is responsive)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | bun build/index.js >/dev/null 2>&1 || exit 1

# Set environment variable placeholder (user must provide actual token)
ENV BOOND_API_TOKEN=""

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Run the MCP server
CMD ["bun", "build/index.js"]
