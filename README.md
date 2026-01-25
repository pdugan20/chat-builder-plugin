# iMessage AI Chat Builder - Figma Plugin

[![CI Status](https://github.com/pdugan20/chat-builder-plugin/actions/workflows/lint-and-format.yml/badge.svg)](https://github.com/pdugan20/chat-builder-plugin/actions/workflows/lint-and-format.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.7-green.svg)](https://github.com/pdugan20/chat-builder-plugin/releases)
[![Figma Plugin](https://img.shields.io/badge/Figma-Community-purple.svg)](https://www.figma.com/community/plugin/1519731262843198057/imessage-ai-chat-builder)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg)](https://reactjs.org/)

A Figma plugin that allows you to generate realistic iMessage chat interfaces using AI. Create engaging chat conversations with customizable participants, message counts, and styling options.

## Features

- **AI-Powered Generation**: Generate realistic iMessage chat conversations using Claude API
- **Customizable Participants**: Support for 2+ participants with unique names and personas
- **Message Control**: Set maximum number of messages per conversation
- **Theme Support**: Choose between light and dark iMessage themes
- **Interactive Prototypes**: Include fully interactive prototype view
- **Rich Interactions**: Support for emoji reactions and message status indicators
- **Authentic UI**: Uses official iMessage UI components and styling
- **Test Mode**: Built-in test data mode for development without API calls

## Prerequisites

- [Node.js](https://nodejs.org) (v18 or higher)
- [Figma desktop app](https://figma.com/downloads/)
- [Anthropic API key](https://docs.anthropic.com/en/api/overview) (for chat generation)
- [Apple SF Pro typeface](https://developer.apple.com/fonts/)
- [iMessage Chat Builder UI kit](https://www.figma.com/community/file/1519446101653617639/imessage-chat-builder) (components accessible in Figma)

## Installation

1. Clone this repository:

```bash
git clone https://github.com/patdugan/chat-builder-plugin.git
cd chat-builder-plugin
```

2. Install dependencies:

```bash
npm install
```

3. Build the plugin:

```bash
npm run build
```

4. Install in Figma:
   - Open Figma desktop app
   - Go to Menu > Plugins > Development > Import plugin from manifest...
   - Select the `manifest.json` file from the project directory

## Development

### Quick Start

To start development with hot reloading:

```bash
npm run watch
```

This will automatically rebuild the plugin when you make changes to the code.

### Setup Git Hooks

Set up pre-commit hooks for automated code quality checks:

```bash
npm run setup-hooks
```

This configures git to use local pre-commit hooks that will automatically run linting, formatting, and type checking before each commit.

## Code Quality Tools

This project uses multiple code quality tools to ensure consistency and catch issues early:

### Linting & Formatting

- **Prettier** - Code formatting (JavaScript, TypeScript, JSON, Markdown)
- **ESLint** - JavaScript/TypeScript linting with Airbnb style guide + Figma plugin rules
- **markdownlint** - Markdown formatting and style
- **TypeScript** - Static type checking with strict mode enabled

Run all checks:

```bash
npm run check-all
```

### Git Hooks

Pre-commit hooks automatically run on staged files:

- Prettier formatting
- ESLint with auto-fix
- markdownlint with auto-fix
- TypeScript type checking
- Jest tests (only changed files)

Commit message validation enforces [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>(<scope>): <subject>

Examples:
  feat(ui): add dark mode support
  fix(api): handle retry logic correctly
  docs: update installation guide
```

### Manual Commands

```bash
# Format code
npm run style:write

# Lint markdown
npm run lint:md:fix

# Fix ESLint issues
npm run lint:fix

# Type check
npx tsc --noEmit --skipLibCheck

# Run tests
npm test
```

## Usage

1. Open your Figma file
2. Ensure the file has access to iMessage Chat Builder UI Kit components
3. Run the Chat Builder plugin
4. Configure your chat generation settings:
   - Select number of participants
   - Set maximum number of messages
   - Choose theme (light/dark)
   - Enter a prompt to guide the conversation
   - Optionally enable prototype view
5. Click "Generate chat" to create your iMessage conversation

### Test Data

To enable test data mode:

1. Open `src/ui/app.tsx`
2. Setting `USE_TEST_DATA = true` will only generate chats using local test data
3. Setting `USE_TEST_DATA = false` will enable the plugin to query the Anthropic API

## Architecture

### Service Layer (New in v1.0.7)

The plugin uses a modular service architecture for maintainability and testability:

- **ValidationService**: Input validation for prompts, API keys, and chat data
- **LoadingStateManager**: Progress tracking through generation stages
- **PluginMessengerService**: Message passing between UI and plugin layers
- **APIService**: Anthropic API integration with streaming support
- **ChatGenerationService**: Orchestrates the chat generation workflow

### Tech Stack

- **Frontend**: React 18 + TypeScript 5.2
- **Styling**: Tailwind CSS with custom Figma design system
- **Build**: Webpack 5 with hot module replacement
- **API**: Anthropic Claude API (Sonnet 3.5)
- **Testing**: Jest + React Testing Library
- **Code Quality**: ESLint, Prettier, TypeScript strict mode

## Testing

This project has comprehensive test coverage for the service layer and integration points.

**87 tests** covering 456 lines of service code with **85-100% coverage**.

### Running Tests

Run all tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate coverage report:

```bash
npm run test:coverage
```

Run tests in CI mode:

```bash
npm run test:ci
```

### Coverage Thresholds

The project enforces 80% minimum coverage for:

- Branches
- Functions
- Lines
- Statements

### Test Organization

- **Unit tests**: `src/**/__tests__/**/*.test.ts`
- **Service tests**: `src/services/__tests__/*.test.ts`
- **Component tests**: `src/ui/components/**/__tests__/*.test.tsx`
- **Hook tests**: `src/ui/hooks/__tests__/*.test.tsx`

### Test Coverage

| Service/Component        | Tests | Coverage Target |
| ------------------------ | ----- | --------------- |
| ValidationService        | 20    | 100%            |
| LoadingStateManager      | 18    | 100%            |
| PluginMessengerService   | 10    | 95%             |
| APIService               | 13    | 90%             |
| ChatGenerationService    | 10    | 90%             |
| use-chat-generation hook | 5     | 80%             |
| LoadingOverlay component | 7     | 85%             |

## Documentation

- [End-to-End Flow](docs/END_TO_END_FLOW.md) - Detailed technical walkthrough of how user inputs become Figma components
- [Project Guide](CLAUDE.md) - Development setup, architecture overview, and coding guidelines

## Project Structure

```text
src/
├── api/           # External API integrations (Anthropic)
├── constants/     # Configuration and constants
├── scripts/       # Core plugin functionality
├── services/      # Service classes and utilities
├── types/         # TypeScript type definitions
├── ui/            # React UI components
└── utils/         # Shared utility functions and helpers
```

## Available Scripts

- `npm run build` - Build the plugin for production
- `npm run watch` - Start development mode with hot reloading
- `npm run setup-hooks` - Set up pre-commit hooks for code quality checks
- `npm run lint:fix` - Fix linting issues
- `npm run style:write` - Format code with Prettier
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report

## Dependency Management

This project uses **Dependabot** for automated dependency updates:

- Weekly dependency checks (Mondays at 9am ET)
- Grouped minor/patch updates to reduce PR noise
- Auto-merge for non-breaking updates after CI passes
- Manual review required for major version updates

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests and quality checks (`npm test`, `npm run lint:fix`)
4. Commit using [Conventional Commits](https://www.conventionalcommits.org/) format
5. Push to your branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

All PRs must pass:

- ESLint + Prettier checks
- TypeScript type checking
- Jest test suite with coverage thresholds
- Markdown linting

## Future Improvements

- **WebWorkers**: Implement WebWorkers for heavy JSON parsing and validation to improve UI responsiveness during large API response processing
- **Enhanced Caching**: Expand component caching strategies for better performance with large chat generations
- **Batch Operations**: Further optimize bulk property setting and component manipulation operations

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with React, TypeScript, and Tailwind CSS
- Uses Anthropic's Claude API for chat generation
