module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
        },
      },
    ],
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/ui/index.tsx',
    '!src/plugin/index.ts',
    '!src/typings/**',
    '!src/services/component.ts', // Legacy service, not part of refactor
  ],
  coverageThreshold: {
    // Service layer - refactored services with 90%+ coverage
    './src/services/validation.ts': {
      branches: 93,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    './src/services/loading-state.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    './src/services/plugin-messenger.ts': {
      branches: 95,
      functions: 100,
      lines: 95,
      statements: 95,
    },
    './src/services/api.ts': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './src/services/chat-generation.ts': {
      branches: 70, // Some error paths not fully tested
      functions: 90,
      lines: 85,
      statements: 85,
    },
    // Integration layer - hooks and components
    './src/ui/hooks/use-chat-generation.ts': {
      branches: 70,
      functions: 70,
      lines: 80,
      statements: 80,
    },
    './src/ui/components/overlays/loading.tsx': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
};
