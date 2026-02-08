#!/bin/bash
# iMessage AI Chat Builder - Run All Code Quality Checks

set -e  # Exit on any error

echo "Running all code quality checks..."
echo "================================="
echo ""

# Format code
echo "[STEP 1/5] Running Prettier..."
npm run style:write

# Lint markdown
echo "[STEP 2/5] Running markdownlint..."
npm run lint:md:fix

# Lint code
echo "[STEP 3/5] Running ESLint..."
npm run lint:fix

# Type check
echo "[STEP 4/5] Running TypeScript type check..."
npx tsc --noEmit --skipLibCheck

# Run tests
echo "[STEP 5/5] Running tests..."
npm test -- --passWithNoTests

echo ""
echo "[SUCCESS] All checks passed!"