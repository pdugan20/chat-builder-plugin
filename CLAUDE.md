# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Figma plugin called "iMessage AI Chat Builder" that generates realistic iMessage chat interfaces using Anthropic's Claude API. The plugin allows users to create AI-powered chat conversations with customizable participants and styling.

## Essential Commands

### Development

- `npm run watch` - Run the plugin in development mode with hot reloading
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
- `npm test -- path/to/test.spec.ts` - Run a specific test file

### Version Management

- `npm run update-version` - Update plugin version across all files

## Architecture Overview

### Core Structure

The plugin follows a layered architecture:

1. **Plugin Layer** (`src/plugin/index.ts`) - Figma plugin API interface
2. **UI Layer** (`src/ui/`) - React application with routing
3. **Scripts Layer** (`src/scripts/`) - Core business logic for chat generation
4. **API Layer** (`src/api/`) - External service integrations (Anthropic)

### Key Components

- **Chat Generation**: `src/scripts/build-chat-ui.ts` handles the main chat UI creation with optimized rendering
- **Anthropic Integration**: `src/api/anthropic.ts` manages Claude API with streaming and retry logic
- **Service Classes**: `src/services/` contains modular service classes for component management with caching and safe property handling
- **Utilities**: `src/utils/` provides shared utility functions including chat analysis, component helpers, and node finding patterns
- **Constants**: `src/constants/` contains organized constants including component properties, string values, and configuration options
- **State Management**: React Context providers in `src/ui/context/`
- **Component Library**: Checks for required Figma components via `src/scripts/check-components.ts`

### Message Flow

1. UI sends messages to plugin via `parent.postMessage`
2. Plugin processes in `index.ts` and delegates to appropriate scripts
3. Scripts interact with Figma API and external services
4. Results sent back to UI via `figma.ui.postMessage`

## Development Workflow

### Adding New Features

1. UI changes go in `src/ui/components/` or `src/ui/screens/`
2. Plugin logic goes in `src/scripts/`
3. Update types in `src/types/` as needed
4. Use existing patterns from similar components

### Working with Figma API

- All Figma API calls must be in `src/plugin/` or `src/scripts/`
- UI layer cannot directly access Figma API
- Use message passing between UI and plugin layers

### Styling

- Use Tailwind CSS classes
- Custom styles in `src/ui/styles/`
- Follow existing component patterns for consistency

## Important Notes

- The plugin requires specific Figma components to be available (checks on load)
- Anthropic API key is stored in plugin clientStorage
- Font loading (Apple SF Pro) happens asynchronously
- Test data mode available for development without API calls
- Chat rendering is optimized to prevent visual artifacts during assembly
- ESLint configuration has been tuned for this codebase with appropriate rule exceptions
