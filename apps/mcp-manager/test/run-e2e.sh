#!/bin/bash

# Start PostgreSQL container (if not running)
echo "🐳 Checking/starting PostgreSQL container..."
if ! docker ps | grep -q fossa-mcp-postgres; then
  docker compose up -d postgres
fi

# Wait for the database container to be ready
echo "⏳ Waiting for database to become available..."
until docker exec fossa-mcp-postgres pg_isready -U fossa >/dev/null 2>&1; do
  echo -n "."
  sleep 2
done
echo ""
echo "✅ Database is available!"

# Create test database (if it doesn't exist)
echo "🗄️ Creating test database..."
docker exec fossa-mcp-postgres psql -U fossa -d fossa_mcp -c "DROP DATABASE IF EXISTS fossa_mcp_test;"
docker exec fossa-mcp-postgres psql -U fossa -d fossa_mcp -c "CREATE DATABASE fossa_mcp_test;"

# Wait a bit to ensure the database is available
sleep 2

# Run migrations on the test database
echo "🔄 Running migrations on test database..."
yarn run migration:run

if [ $? -eq 0 ]; then
  echo "✅ Migrations executed successfully!"
else
  echo "❌ Error executing migrations"
  exit 1
fi

# Run E2E tests
echo "🧪 Running E2E tests..."
yarn jest --config jest.config.json --verbose --detectOpenHandles --forceExit --coverage --runInBand

# Capture test exit code
TEST_EXIT_CODE=$?

# Clean up test database after tests
echo "🧹 Cleaning up test database..."
docker exec fossa-mcp-postgres psql -U fossa -d fossa_mcp -c "DROP DATABASE IF EXISTS fossa_mcp_test;" 2>/dev/null || echo "Error cleaning up test database (not critical)"

if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo "✅ E2E tests completed successfully!"
else
  echo "❌ E2E tests failed!"
  exit $TEST_EXIT_CODE
fi
