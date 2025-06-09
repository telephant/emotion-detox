#!/bin/bash

set -e

DOTENV_PATH=.env
echo "Building project..."
cd ../../
pnpm install
cd apps/backend

echo "Generating Prisma client..."
pnpm prisma:generate:prod

echo "Building and bundling..."
pnpm run build

echo "Creating Lambda package..."
# Create temporary directory for packaging
TEMP_DIR="temp_package"
rm -rf $TEMP_DIR
mkdir -p $TEMP_DIR

# Copy bundled files
echo "Copying bundled files..."
cp -r dist/* $TEMP_DIR/

# Copy Prisma files (these are needed at runtime)
echo "Copying Prisma files..."
mkdir -p $TEMP_DIR/node_modules/@prisma/client
mkdir -p $TEMP_DIR/node_modules/.prisma/client

# Copy the Linux ARM64 Query Engine
QUERY_ENGINE="libquery_engine-linux-arm64-openssl-3.0.x.so.node"
QUERY_ENGINE_PATH="../../node_modules/.pnpm/@prisma+client@6.8.1_prisma@6.8.1_typescript@5.8.3__typescript@5.8.3/node_modules/.prisma/client/$QUERY_ENGINE"

if [ -f "$QUERY_ENGINE_PATH" ]; then
    echo "Copying Linux ARM64 Query Engine..."
    # Copy to root directory
    cp "$QUERY_ENGINE_PATH" $TEMP_DIR/
    # Also copy to node_modules for compatibility
    cp "$QUERY_ENGINE_PATH" $TEMP_DIR/node_modules/.prisma/client/
else
    echo "Error: Could not find Linux ARM64 Query Engine at $QUERY_ENGINE_PATH"
    exit 1
fi

# Copy other Prisma files
cp -r node_modules/@prisma/client/* $TEMP_DIR/node_modules/@prisma/client/ 2>/dev/null || true
cp -r node_modules/.prisma/client/* $TEMP_DIR/node_modules/.prisma/client/ 2>/dev/null || true

# If using pnpm, we need to get the actual prisma client from the workspace
PNPM_PRISMA_CLIENT_PATH="../../node_modules/.pnpm/@prisma+client@6.8.1_prisma@6.8.1_typescript@5.8.3__typescript@5.8.3/node_modules/@prisma/client"
if [ -d "$PNPM_PRISMA_CLIENT_PATH" ]; then
    echo "Copying pnpm Prisma client..."
    cp -r "$PNPM_PRISMA_CLIENT_PATH"/* $TEMP_DIR/node_modules/@prisma/client/
fi

# Copy SSL certificate
echo "Copying SSL certificate..."
mkdir -p $TEMP_DIR/certs
cp certs/eu-north-1-bundle.pem $TEMP_DIR/certs/

# Copy serverless config
echo "Copying config files..."
cp serverless.yml $TEMP_DIR/

# Create zip package
echo "Creating zip file..."
cd $TEMP_DIR
zip -r ../backend-$(date +%Y%m%d_%H%M%S).zip .

# Clean up
cd ..
rm -rf $TEMP_DIR

echo "Lambda package created successfully!"
