# iMessage Chat Builder

[![CI](https://github.com/pdugan20/chat-builder-plugin/actions/workflows/ci.yml/badge.svg)](https://github.com/pdugan20/chat-builder-plugin/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/pdugan20/chat-builder-plugin?logo=github&logoColor=white)](https://github.com/pdugan20/chat-builder-plugin/releases/latest)
[![Figma Plugin](https://img.shields.io/badge/Figma-Community-F24E1E?logo=figma&logoColor=white)](https://www.figma.com/community/plugin/1519731262843198057/imessage-ai-chat-builder)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?logo=opensourceinitiative&logoColor=white)](LICENSE)

A Figma plugin for generating realistic iMessage chat interfaces using AI. Create engaging conversations with customizable participants, message counts, and styling options.

## Features

- AI-powered chat generation using Claude API
- Support for 2+ participants with unique names and personas
- Light and dark iMessage themes
- Interactive prototype view with emoji reactions and status indicators
- Built-in test data mode for development without API calls

## Prerequisites

- [Node.js](https://nodejs.org) v20+
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
npm test              # Run tests
npm run test:ci       # Tests with coverage (CI mode)
```

## Tech Stack

- **Build**: Webpack 5
- **API**: Anthropic Claude API (Haiku 4.5)
- **Testing**: Jest 30, React Testing Library
- **Quality**: ESLint 9, Prettier, markdownlint, Conventional Commits

## Documentation

- [End-to-End Flow](docs/architecture/end-to-end-flow.md) - Technical walkthrough of user inputs to Figma components
- [Chat Building Architecture](docs/architecture/chat-building-architecture.md) - Component structure and rendering pipeline
- [Prompt Engineering Guide](docs/architecture/prompt-engineering-guide.md) - AI prompt design and message generation
- [Project Guide](CLAUDE.md) - Development setup, architecture, and coding guidelines

## Related

- [chat-app-prototype](https://github.com/pdugan20/chat-app-prototype) - Demo iMessage app built with this plugin
