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
npm run watch:test    # Dev mode with test data (no API calls)
npm run watch:debug   # Dev mode with debug panel enabled
npm run setup-hooks   # Set up pre-commit hooks
npm run check-all     # Run all quality checks
npm test              # Run tests
npm run test:ci       # Tests with coverage (CI mode)
```

## Tech Stack

- **Frontend**: React 18, TypeScript 5.2, Tailwind CSS
- **Build**: Webpack 5
- **API**: Anthropic Claude API (Sonnet 4.6)
- **Testing**: Jest, React Testing Library
- **Quality**: ESLint (Airbnb), Prettier, markdownlint, Conventional Commits

## Architecture

- `src/api/` - Anthropic API integration
- `src/scripts/` - Core plugin functionality
- `src/services/` - Service layer (validation, loading state, messaging, chat generation)
- `src/ui/` - React UI components
- `src/types/` - TypeScript type definitions
- `src/constants/` - Configuration and constants
- `src/utils/` - Shared utilities

## Documentation

- [End-to-End Flow](docs/END_TO_END_FLOW.md) - Technical walkthrough of user inputs to Figma components
- [Project Guide](CLAUDE.md) - Development setup, architecture, and coding guidelines

## Related

- [chat-app-prototype](https://github.com/pdugan20/chat-app-prototype) - Demo iMessage app built with this plugin

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
