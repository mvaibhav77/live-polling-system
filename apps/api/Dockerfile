# Dockerfile for API deployment on Render
FROM node:22-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy package.json files for all workspaces
COPY apps/api/package.json ./apps/api/
COPY packages/*/package.json ./packages/*/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the API
RUN pnpm build --filter=api

# Production stage
FROM node:22-alpine AS production

# Install pnpm
RUN npm install -g pnpm

# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/*/package.json ./packages/*/

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built application
COPY --from=base /app/apps/api/dist ./apps/api/dist
COPY --from=base /app/packages ./packages

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S api -u 1001 -G nodejs

# Change ownership
RUN chown -R api:nodejs /app
USER api

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Change to API directory and start
WORKDIR /app/apps/api
CMD ["node", "dist/index.js"]
