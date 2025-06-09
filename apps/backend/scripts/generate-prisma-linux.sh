#!/bin/bash

# Ensure we're in the backend directory
cd "$(dirname "$0")/.." || exit

# Remove existing Prisma generated files
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client

# Use Docker to generate Prisma client for Linux
docker run --rm \
  -v "$(pwd):/app" \
  -w /app \
  node:18-buster \
  bash -c "corepack enable && corepack prepare pnpm@latest --activate && pnpm install && pnpm prisma generate"

echo "✅ Generated Linux Prisma binary" 