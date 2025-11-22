#!/bin/bash
set -e

echo "Installing dependencies..."
pnpm install --shamefully-hoist

echo "Building project..."
pnpm run build

echo "Build completed successfully!"
