# Contributing to iMessage AI Chat Builder

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork:

   ```bash
   git clone https://github.com/YOUR_USERNAME/chat-builder-plugin.git
   cd chat-builder-plugin
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Set up git hooks:

   ```bash
   npm run setup-hooks
   ```

5. Create a feature branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running the Plugin

Start development mode with hot reloading:

```bash
npm run watch
```

Then load the plugin in Figma:

- Open Figma desktop app
- Go to Menu > Plugins > Development > Import plugin from manifest...
- Select the `manifest.json` file

### Making Changes

1. **Write Code**: Make your changes in the appropriate files
2. **Add Tests**: Write tests for new functionality (see Testing Guidelines)
3. **Run Quality Checks**: Ensure all checks pass before committing

```bash
npm run style:write          # Format code
npm run lint:fix             # Fix linting issues
npx tsc --noEmit --skipLibCheck  # Type check
npm test                     # Run tests
```

### Commit Guidelines

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>(<scope>): <subject>

Types:
- feat:     New feature
- fix:      Bug fix
- docs:     Documentation changes
- style:    Code formatting (no logic changes)
- refactor: Code restructuring (no behavior change)
- perf:     Performance improvement
- test:     Adding or updating tests
- chore:    Maintenance, dependencies, config
- build:    Build system changes
- ci:       CI/CD changes

Examples:
  feat(ui): add participant avatar customization
  fix(api): handle streaming timeout correctly
  docs: update testing guide
  refactor(services): extract validation logic
```

The commit-msg hook will validate your commit message format automatically.

## Testing Guidelines

### Writing Tests

All new features and bug fixes should include tests:

**Service Layer Tests**:

- Create tests in `src/services/__tests__/`
- Test in isolation with mocked dependencies
- Use `createMockChatItem()` helper for test data
- Aim for 90%+ coverage

**Component Tests**:

- Create tests in `src/ui/components/**/__tests__/`
- Use custom render from `src/test-utils.tsx`
- Test user interactions and state changes
- Aim for 80%+ coverage

**Hook Tests**:

- Create tests in `src/ui/hooks/__tests__/`
- Use `renderHook` from `@testing-library/react`
- Mock service dependencies
- Aim for 80%+ coverage

### Test Utilities

- `createMockChatItem(overrides)` - Create valid ChatItem objects
- Custom render with providers in `src/test-utils.tsx`
- Jest fake timers for testing timeouts and debouncing

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode for development
npm run test:coverage # Generate coverage report
```

## Code Quality Standards

### Pre-commit Checks

Git hooks automatically run on every commit:

- Prettier formatting
- ESLint with auto-fix
- markdownlint with auto-fix
- TypeScript type checking
- Jest tests (only changed files)

### TypeScript

- Strict mode enabled
- No `any` types (use `unknown` with type guards)
- Explicit return types for exported functions
- Handle null/undefined explicitly

### ESLint

- Airbnb style guide + TypeScript rules
- Figma plugin-specific rules
- Testing Library best practices

### Prettier

- Automatic code formatting
- Configured with Tailwind CSS plugin

## Pull Request Process

1. **Update Documentation**: Update README.md if you changed functionality
2. **Add Tests**: Ensure your changes are covered by tests
3. **Run All Checks**: Verify all quality checks pass:

   ```bash
   npm run style:write
   npm run lint:fix
   npx tsc --noEmit --skipLibCheck
   npm run test:coverage
   ```

4. **Push to Your Fork**:

   ```bash
   git push origin feature/your-feature-name
   ```

5. **Open Pull Request**:
   - Provide a clear description of changes
   - Reference any related issues
   - Include screenshots for UI changes
   - Ensure all CI checks pass

### CI Checks

All PRs must pass:

- ESLint + Prettier checks
- TypeScript type checking
- Jest test suite with coverage thresholds
- Markdown linting

## Project Structure

```text
src/
├── api/           # External API integrations (Anthropic)
├── constants/     # Configuration and constants
├── scripts/       # Core plugin functionality
├── services/      # Service classes and utilities
│   ├── validation.ts          # Input validation
│   ├── loading-state.ts       # Progress tracking
│   ├── plugin-messenger.ts    # Message passing
│   ├── api.ts                 # API service
│   └── chat-generation.ts     # Generation orchestration
├── types/         # TypeScript type definitions
├── ui/            # React UI components
│   ├── components/  # Reusable UI components
│   ├── context/     # React context providers
│   ├── hooks/       # Custom React hooks
│   └── screens/     # Main application screens
└── utils/         # Shared utility functions
```

## Architecture Principles

1. **Separation of Concerns**: UI, plugin logic, and external services are separate
2. **Service Layer**: Business logic extracted into testable service classes
3. **Message Passing**: UI and plugin communicate via window.postMessage
4. **Dependency Injection**: Services receive dependencies via constructor
5. **Error Handling**: Graceful degradation with user-friendly error messages

## Need Help?

- Check existing issues or create a new one
- Review the [Project Guide](CLAUDE.md) for detailed development info
- Read the [End-to-End Flow](docs/END_TO_END_FLOW.md) to understand the architecture

## Code of Conduct

- Be respectful and constructive in discussions
- Follow the coding standards and conventions
- Write clear, descriptive commit messages
- Test your changes thoroughly before submitting
