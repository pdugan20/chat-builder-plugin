# iMessage AI Chat Builder - Figma Plugin

A Figma plugin that allows you to generate realistic iMessage chat interfaces using AI. Create engaging chat conversations with customizable participants, message counts, and styling options. ([View in Figma](https://www.figma.com/community/plugin/1519731262843198057/imessage-ai-chat-builder)).

## Features

- Generate realistic iMessage chat conversations using AI
- Customize number of participants (2+)
- Control maximum number of messages
- Choose between light and dark themes
- Include interactive prototype view
- Support for emoji reactions and message status indicators
- Realistic iMessage UI components and styling

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

To start development with hot reloading:

```bash
npm run watch
```

This will automatically rebuild the plugin when you make changes to the code.

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

## Project Structure

```
src/
├── constants/     # Configuration and constants
├── scripts/       # Core plugin functionality
├── services/      # External service integrations
├── types/         # TypeScript type definitions
├── ui/            # React UI components
└── utils/         # Utility functions
```

## Available Scripts

- `npm run build` - Build the plugin for production
- `npm run watch` - Start development mode with hot reloading
- `npm run lint:fix` - Fix linting issues
- `npm run style:write` - Format code with Prettier
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with React, TypeScript, and Tailwind CSS
- Uses Anthropic's Claude API for chat generation
