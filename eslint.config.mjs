import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettierPlugin from 'eslint-plugin-prettier/recommended';
import testingLibraryPlugin from 'eslint-plugin-testing-library';
import figmaPlugin from '@figma/eslint-plugin-figma-plugins';
import globals from 'globals';

export default tseslint.config(
  // Global ignores (replaces ignorePatterns)
  {
    ignores: ['node_modules/', 'dist/', '**/*.js', '!eslint.config.mjs', 'src/test/setup.ts'],
  },

  // Base JS recommended rules
  js.configs.recommended,

  // TypeScript recommended rules
  ...tseslint.configs.recommended,

  // Global settings for all TS/TSX files
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest,
      },
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 2021,
        sourceType: 'module',
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      '@figma/figma-plugins': figmaPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // React
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/require-default-props': 'off',

      // Figma plugin rules
      ...figmaPlugin.configs.recommended.rules,

      // TypeScript
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
      '@typescript-eslint/no-shadow': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-loop-func': 'off',

      // General JS rules relaxed for this codebase
      'no-param-reassign': 'off',
      'no-await-in-loop': 'off',
      'no-restricted-syntax': 'off',
      'no-control-regex': 'off',
      'no-useless-escape': 'off',
      'no-continue': 'off',
      'no-promise-executor-return': 'off',
      'no-case-declarations': 'off',
      'no-restricted-globals': 'off',
    },
  },

  // Testing library - test files only
  {
    files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
    ...testingLibraryPlugin.configs['flat/react'],
  },

  // Prettier must be last
  prettierPlugin
);
