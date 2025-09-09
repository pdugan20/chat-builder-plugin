#!/bin/bash
# iMessage AI Chat Builder - Local Development Setup Script

set -e  # Exit on any error

echo "iMessage AI Chat Builder - Development Setup"
echo "============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not available"
    exit 1
fi

echo "✅ npm $(npm -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if TypeScript is available globally or locally
if ! command -v tsc &> /dev/null && ! npx tsc --version &> /dev/null; then
    echo "⚠️  TypeScript not found globally, using local version via npx"
fi

# Run initial checks
echo "🔍 Running code quality checks..."

# Format code
echo "  • Running Prettier..."
npm run style:write || { echo "❌ Prettier failed"; exit 1; }

# Lint code
echo "  • Running ESLint..."
npm run lint:fix || { echo "❌ ESLint failed"; exit 1; }

# Type check
echo "  • Running TypeScript type check..."
npx tsc --noEmit --skipLibCheck || { echo "❌ TypeScript check failed"; exit 1; }

# Run tests
echo "  • Running tests..."
npm test -- --passWithNoTests || { echo "❌ Tests failed"; exit 1; }

# Setup git hooks
echo "⚙️  Setting up git hooks..."
chmod +x .githooks/pre-commit
chmod +x scripts/setup-hooks.sh
./scripts/setup-hooks.sh

# Make other scripts executable
chmod +x scripts/*.sh

echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Start development: 'npm run watch'"
echo "2. Build for production: 'npm run build'"
echo "3. Test the plugin in Figma"
echo ""
echo "🎉 Your Figma plugin development environment is ready!"