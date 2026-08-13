# Chat Builder Figma Plugin

[![CI](https://github.com/pdugan20/figma-chat-builder/actions/workflows/ci.yml/badge.svg)](https://github.com/pdugan20/figma-chat-builder/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/pdugan20/figma-chat-builder?logo=github&logoColor=white)](https://github.com/pdugan20/figma-chat-builder/releases/latest)
[![Figma Plugin](https://img.shields.io/badge/Figma-Community-F24E1E?logo=figma&logoColor=white)](https://www.figma.com/community/plugin/1519731262843198057/imessage-ai-chat-builder)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?logo=opensourceinitiative&logoColor=white)](LICENSE)

A Figma plugin that generates realistic iMessage chat interfaces using Claude. Supports 2+ participants with unique personas, light and dark iMessage themes, and an interactive prototype view with emoji reactions and status indicators. A test data mode lets you iterate without hitting the API.

## Getting Started

```bash
git clone https://github.com/pdugan20/figma-chat-builder.git
cd figma-chat-builder
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

## Documentation

- [End-to-End Flow](docs/architecture/end-to-end-flow.md) - Technical walkthrough of user inputs to Figma components
- [Chat Building Architecture](docs/architecture/chat-building-architecture.md) - Component structure and rendering pipeline
- [Prompt Engineering Guide](docs/architecture/prompt-engineering-guide.md) - AI prompt design and message generation
- [Project Guide](CLAUDE.md) - Development setup, architecture, and coding guidelines
