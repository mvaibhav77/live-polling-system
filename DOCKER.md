# Docker Setup for Live Polling System

This monorepo is fully dockerized with support for both development and production environments.

## Prerequisites

- Docker
- Docker Compose
- pnpm (for local development)

## Services

### Production Services

- **postgres**: PostgreSQL 15 database
- **redis**: Redis for caching and sessions
- **api**: Express.js API server
- **web**: React frontend served by Nginx

### Development Services

- **api-dev**: API with hot reload
- **web-dev**: Vite dev server with hot reload

## Quick Start

### Production Environment

1. Copy environment file:

```bash
cp .env.example .env
```

2. Edit `.env` file with your configurations (especially passwords)

3. Build and start all services:

```bash
pnpm docker:up
```

4. Check logs:

```bash
pnpm docker:logs
```

5. Stop services:

```bash
pnpm docker:down
```

### Development Environment

1. Copy development environment:

```bash
cp .env.development .env
```

2. Start development services:

```bash
pnpm docker:dev
```

3. Access services:
   - Frontend: http://localhost:5173
   - API: http://localhost:3001
   - Database: localhost:5432

4. Stop development services:

```bash
pnpm docker:dev-down
```

## Available Commands

```bash
# Build all images
pnpm docker:build

# Start production services
pnpm docker:up

# Start development services (with hot reload)
pnpm docker:dev

# Stop all services
pnpm docker:down

# Stop development services
pnpm docker:dev-down

# View logs
pnpm docker:logs

# Clean up (remove volumes and unused images)
pnpm docker:clean
```

## Manual Docker Commands

### Build specific services

```bash
docker-compose build api
docker-compose build web
```

### Run individual services

```bash
docker-compose up postgres redis  # Just database services
docker-compose up api            # Just API
```

### Database management

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d live_polling

# View database logs
docker-compose logs postgres

# Backup database
docker-compose exec postgres pg_dump -U postgres live_polling > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres live_polling < backup.sql
```

### Redis management

```bash
# Connect to Redis CLI
docker-compose exec redis redis-cli

# View Redis logs
docker-compose logs redis
```

## Environment Variables

### Database Configuration

- `POSTGRES_DB`: Database name
- `POSTGRES_USER`: Database user
- `POSTGRES_PASSWORD`: Database password
- `POSTGRES_PORT`: Database port (default: 5432)

### API Configuration

- `API_PORT`: API server port (default: 3001)
- `NODE_ENV`: Environment (development/production)
- `DATABASE_URL`: Full database connection string
- `REDIS_URL`: Redis connection string
- `CORS_ORIGIN`: Allowed CORS origins

### Web Configuration

- `WEB_PORT`: Web server port (default: 3000 for production, 5173 for dev)

## Development Workflow

1. **Start development environment:**

   ```bash
   pnpm docker:dev
   ```

2. **Make changes to your code** - changes will be hot-reloaded

3. **View logs:**

   ```bash
   docker-compose logs -f api-dev web-dev
   ```

4. **Access services:**
   - Web app: http://localhost:5173
   - API: http://localhost:3001
   - API health: http://localhost:3001/api/health

## Production Deployment

1. **Set production environment variables**
2. **Build and deploy:**

   ```bash
   pnpm docker:build
   pnpm docker:up
   ```

3. **Services will be available at:**
   - Web app: http://localhost:3000
   - API: http://localhost:3001

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in `.env` file
2. **Permission issues**: Ensure Docker daemon is running
3. **Database connection issues**: Check if PostgreSQL container is healthy

### Useful debugging commands

```bash
# Check container status
docker-compose ps

# View container logs
docker-compose logs <service-name>

# Execute commands in containers
docker-compose exec <service-name> sh

# Restart specific service
docker-compose restart <service-name>

# Rebuild and restart
docker-compose up --build <service-name>
```

### Health Checks

All services include health checks. View status with:

```bash
docker-compose ps
```

Healthy services will show "healthy" status.

## File Structure

```
.
├── Dockerfile                 # Multi-stage build for production
├── Dockerfile.dev            # Development builds with hot reload
├── docker-compose.yml        # All services configuration
├── .dockerignore             # Files to exclude from Docker context
├── .env.example              # Environment variables template
├── .env.development          # Development environment
├── init-scripts/             # Database initialization scripts
│   └── 01-init.sql
└── apps/
    ├── api/                  # API application
    └── web/                  # Web application
        └── nginx.conf        # Nginx configuration for production
```
