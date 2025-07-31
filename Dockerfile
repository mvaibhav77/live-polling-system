# Dockerfile for the entire monorepo
# This is a multi-stage build that can build any app in the monorepo

ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-alpine AS base
# Install pnpm
RUN npm install -g pnpm

# Setup workspace
FROM base AS builder
WORKDIR /app

# Copy root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy all package.json files
COPY apps/*/package.json ./apps/*/
COPY packages/*/package.json ./packages/*/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build all apps and packages
RUN pnpm build

# Production image for API
FROM base AS api
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/*/package.json ./packages/*/

# Install production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built API
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages ./packages

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S api -u 1001 -G nodejs
RUN chown -R api:nodejs /app
USER api

EXPOSE 3001
WORKDIR /app/apps/api

CMD ["node", "dist/index.js"]

# Production image for Web
FROM nginx:alpine AS web
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
