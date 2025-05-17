# Emotion Detox Backend API

This is the backend API service for the Emotion Detox application. It provides endpoints for tracking and managing urge actions.

## Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- pnpm package manager

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up your PostgreSQL database and update the connection string in `src/prisma/.env`:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/emotiondetox?schema=public"
   ```

3. Run Prisma migrations to set up the database:
   ```bash
   pnpm prisma:migrate
   ```

4. Generate Prisma client:
   ```bash
   pnpm prisma:generate
   ```

## Running the Server

For development:
```bash
pnpm dev
```

For production:
```bash
pnpm start
```

## API Endpoints

### Health Check
- `GET /api/health`
  - Returns: `{ status: "ok" }`

### Delay Urge Action
- `POST /api/urges/delay`
  - Body: `{ type: string, userId?: string }`
  - Increments the count for a specific urge type
  - Returns: `{ success: true, urge: { ... } }`

### Get Urge Statistics
- `GET /api/urges?userId=optional_user_id`
  - Returns statistics for all urges or filtered by userId
  - Returns: `{ success: true, urges: [ ... ] }` 