# Dockerfile for API deployment on Render
FROM node:22-alpine AS base

# Install specific pnpm version to match lockfile
RUN npm install -g pnpm@8.12.0

# Set working directory
WORKDIR /app

# Copy root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy package.json files for all workspaces
COPY apps/api/package.json ./apps/api/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/ui/package.json ./packages/ui/

# Copy package source files needed for workspace dependencies
COPY packages/eslint-config/ ./packages/eslint-config/
COPY packages/typescript-config/ ./packages/typescript-config/
COPY packages/ui/ ./packages/ui/

# Install dependencies with fallback
RUN pnpm install --frozen-lockfile || pnpm install --no-frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client and build
WORKDIR /app/apps/api
RUN pnpm db:generate
WORKDIR /app
RUN pnpm build --filter=api

# Production stage
FROM node:22-alpine AS production

# Install specific pnpm version
RUN npm install -g pnpm@8.12.0

# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/ui/package.json ./packages/ui/

# Copy package source files for production
COPY packages/eslint-config/ ./packages/eslint-config/
COPY packages/typescript-config/ ./packages/typescript-config/
COPY packages/ui/ ./packages/ui/

# Install only production dependencies with fallback
RUN pnpm install --prod --frozen-lockfile || pnpm install --prod --no-frozen-lockfile

# Copy built application and Prisma files
COPY --from=base /app/apps/api/dist ./apps/api/dist
COPY --from=base /app/apps/api/prisma ./apps/api/prisma
# Copy the entire node_modules/.prisma directory which contains the generated client
COPY --from=base /app/node_modules/.prisma ./node_modules/.prisma

# Generate Prisma client in production (now that prisma CLI is available)
WORKDIR /app/apps/api
RUN pnpm exec prisma generate

# Create non-root user
WORKDIR /app
RUN addgroup -g 1001 -S nodejs
RUN adduser -S api -u 1001 -G nodejs

# Change ownership
RUN chown -R api:nodejs /app
USER api

# Expose port (this is for documentation, but use PORT env var at runtime)
EXPOSE 3001

# Set production environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0

# Health check - use PORT env var if available, fallback to 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://0.0.0.0:${PORT:-3001}/api/health || exit 1

# Change to API directory and start with migrations
WORKDIR /app/apps/api
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/index.js"]
