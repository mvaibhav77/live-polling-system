# Express API Server

A simple TypeScript-based Express.js server boilerplate.

## Features

- TypeScript for better type safety
- Express.js web framework
- Development server with hot reload
- Build process for production

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

## API Endpoints

- `GET /` - Welcome message
- `GET /api/health` - Health check
