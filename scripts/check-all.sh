#!/bin/bash
# iMessage AI Chat Builder - Run All Code Quality Checks

set -e  # Exit on any error

echo "Running all code quality checks..."
echo "================================="

# Format code
echo "📝 Running Prettier..."
npm run style:write

# Lint code
echo "🔍 Running ESLint..."
npm run lint:fix

# Type check
echo "🔧 Running TypeScript type check..."
npx tsc --noEmit --skipLibCheck

# Run tests
echo "🧪 Running tests..."
npm test -- --passWithNoTests

echo ""
echo "✅ All checks passed!"