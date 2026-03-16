# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Figma plugin called "iMessage AI Chat Builder" that generates realistic iMessage chat interfaces using Anthropic's Claude API. The plugin allows users to create AI-powered chat conversations with customizable participants and styling.

## Essential Commands

### Development

- `npm run watch` - Run the plugin in development mode with hot reloading
- `npm run watch:test` - Development mode with test data (no API calls needed)
- `npm run watch:debug` - Development mode with debug panel enabled
- `npm run build` - Create a production build

### Code Quality

- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run style:write` - Format code with Prettier
- `npx tsc --noEmit --skipLibCheck` - Check for TypeScript type errors

**Important**: When checking for errors, always run ALL three checks:

1. `npm run style:write` - Format code with Prettier
2. `npm run lint:fix` - Fix ESLint issues
3. `npx tsc --noEmit --skipLibCheck` - Check TypeScript types

ESLint only checks code style/quality rules, NOT TypeScript type errors. You must run the TypeScript compiler separately to catch type-related issues.

### Testing

- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm test -- <test-file>` - Run a specific test file

### Version Management

Versioning is automated via [release-please](https://github.com/googleapis/release-please). On push to `main`, release-please creates a Release PR based on conventional commits. Merging that PR bumps the version in `package.json` and `src/constants/plugin.ts`, creates a git tag, generates a CHANGELOG entry, and creates a GitHub Release with build artifacts.

- `npm run update-version` - Manually sync version from `package.json` to `src/constants/plugin.ts` (convenience script; release-please handles this automatically)

## Code Quality Standards

### Commit Messages

Conventional Commits format enforced by commitlint (commit-msg hook validates automatically). Run `npm run lint:md:fix` to auto-fix markdown issues.

### Testing Standards

All new code should include tests. Per-file coverage thresholds are enforced in `jest.config.js`.

- **Service tests**: `src/services/__tests__/*.test.ts` — test in isolation with mocked dependencies
- **Hook/component tests**: `src/ui/hooks/__tests__/*.test.tsx`, `src/ui/components/**/__tests__/*.test.tsx` — use custom render from `src/test/test-helpers`
- **Test data helpers**: Use `createMockChatItem()` for valid test data

## Architecture Overview

Layered architecture: Plugin (`src/plugin/`) &rarr; Scripts (`src/scripts/`) &rarr; API (`src/api/`), with a React UI (`src/ui/`) communicating via `postMessage`. See `docs/architecture/` for detailed flow diagrams.

### Key Rules

- All Figma API calls must be in `src/plugin/` or `src/scripts/` (UI cannot access Figma API directly)
- Use Tailwind CSS classes; custom styles in `src/ui/styles/`
- State management via React Context providers in `src/ui/context/`

## Important Notes

- The plugin requires specific Figma components to be available (checks on load)
- Anthropic API key is stored in plugin clientStorage
- Font loading (Apple SF Pro) happens asynchronously
- Test data mode available via `npm run watch:test` (injected at build time, no source code changes needed)
- Chat rendering is optimized to prevent visual artifacts during assembly
- ESLint configuration has been tuned for this codebase with appropriate rule exceptions
