#!/usr/bin/env bash
set -e

echo "🚀 Simulating Production Environment (using DEV Infra + Bake)..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found! Please create one."
    exit 1
fi

# Ensure DEV infra is up (databases)
echo "🐘 Checking if DEV databases are running..."
docker compose -f docker-compose.dev.yml --profile infra --profile local-db up -d db_postgres db_mongodb

echo "🔨 Building Production Images (Bake)..."
# Use the official bake script to mirror production build process
./scripts/docker/bake-local.sh

echo "▶️ Starting Production Apps (using baked images)..."
# Start the containers using the local images
docker compose -f docker-compose.sim.yml up -d --force-recreate

echo "🎉 Production simulation is running!"
echo "   API: http://localhost:3331"
echo "   Webhooks: http://localhost:3333"
echo "   Logs: docker compose -f docker-compose.sim.yml logs -f"
