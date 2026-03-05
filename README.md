# iMessage Chat Builder

[![CI](https://github.com/pdugan20/chat-builder-plugin/actions/workflows/ci.yml/badge.svg)](https://github.com/pdugan20/chat-builder-plugin/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/Node.js-18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Figma Plugin](https://img.shields.io/badge/Figma-Community-F24E1E?logo=figma&logoColor=white)](https://www.figma.com/community/plugin/1519731262843198057/imessage-ai-chat-builder)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?logo=opensourceinitiative&logoColor=white)](LICENSE)

A Figma plugin for generating realistic iMessage chat interfaces using AI. Create engaging conversations with customizable participants, message counts, and styling options.

## Features

- AI-powered chat generation using Claude API
- Support for 2+ participants with unique names and personas
- Light and dark iMessage themes
- Interactive prototype view with emoji reactions and status indicators
- Built-in test data mode for development without API calls

## Prerequisites

- [Node.js](https://nodejs.org) v18+
- [Figma desktop app](https://figma.com/downloads/)
- [Anthropic API key](https://docs.anthropic.com/en/api/overview)
- [Apple SF Pro typeface](https://developer.apple.com/fonts/)
- [iMessage Chat Builder UI kit](https://www.figma.com/community/file/1519446101653617639/imessage-chat-builder)

## Getting Started

```bash
git clone https://github.com/pdugan20/chat-builder-plugin.git
cd chat-builder-plugin
npm install
npm run build
```

Install in Figma: Plugins > Development > Import plugin from manifest... and select `manifest.json`.

## Development

```bash
npm run watch         # Dev mode with hot reloading
npm run setup-hooks   # Set up pre-commit hooks
npm run check-all     # Run all quality checks
npm test              # Run tests
npm run test:ci       # Tests with coverage (CI mode)
```

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

To run in test data mode (generates chats using local data instead of the Anthropic API):

```bash
npm run watch:test
```

To enable the debug panel in the settings screen:

```bash
npm run watch:debug
```

## Architecture

- `src/api/` - Anthropic API integration
- `src/scripts/` - Core plugin functionality
- `src/services/` - Service layer (validation, loading state, messaging, chat generation)
- `src/ui/` - React UI components
- `src/types/` - TypeScript type definitions
- `src/constants/` - Configuration and constants
- `src/utils/` - Shared utilities

### Service Layer

- **ValidationService**: Input validation for prompts, API keys, and chat data
- **LoadingStateManager**: Progress tracking through generation stages
- **PluginMessengerService**: Message passing between UI and plugin layers
- **APIService**: Anthropic API integration with streaming support
- **ChatGenerationService**: Orchestrates the chat generation workflow

### Tech Stack

- **Frontend**: React 18 + TypeScript 5.2
- **Styling**: Tailwind CSS with custom Figma design system
- **Build**: Webpack 5 with hot module replacement
- **API**: Anthropic Claude API (Sonnet 4.6)
- **Testing**: Jest + React Testing Library
- **Code Quality**: ESLint, Prettier, TypeScript strict mode

## Testing

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

## Documentation

- [End-to-End Flow](docs/END_TO_END_FLOW.md) - Technical walkthrough of user inputs to Figma components
- [Project Guide](CLAUDE.md) - Development setup, architecture, and coding guidelines

## Related

- [chat-app-prototype](https://github.com/pdugan20/chat-app-prototype) - Demo iMessage app built with this plugin

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
- `npm run watch:test` - Development mode with test data (no API calls)
- `npm run watch:debug` - Development mode with debug panel enabled
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
