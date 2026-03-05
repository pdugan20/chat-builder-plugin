# Dependency Upgrades Tracker

Tracking the upgrade of all outdated dependencies across 6 phases ordered by risk and dependency chain.

**Started**: 2026-03-05
**Branch prefix**: `chore/deps-`

## Open Dependabot PRs

These existing PRs need to be resolved (merged or closed) as part of this effort.

| PR  | Description                                   | CI   | Merge Status | Action           |
| --- | --------------------------------------------- | ---- | ------------ | ---------------- |
| #5  | `actions/checkout` 4 to 6                     | Pass | Clean        | Merge in Phase 1 |
| #6  | `actions/setup-node` 4 to 6                   | Pass | Clean        | Merge in Phase 1 |
| #7  | Grouped dev deps (8 packages)                 | Pass | Conflicts    | Merge in Phase 1 |
| #9  | `@figma/eslint-plugin-figma-plugins` 0.16-1.0 | Pass | Conflicts    | Close, Phase 3   |
| #10 | React + @types/react                          | Fail | Conflicts    | Close, Phase 4   |
| #11 | `@typescript-eslint/eslint-plugin` 6-8        | Fail | Conflicts    | Close, Phase 3   |

## Phase 1: CI Actions and Safe Dev Dependency Patches

Low-risk changes with passing CI. No breaking changes expected.

**Branch**: `chore/deps-phase-1`

- [ ] Merge PR #5 - `actions/checkout` 4 to 6
- [ ] Merge PR #6 - `actions/setup-node` 4 to 6
- [ ] Rebase and merge PR #7 - grouped dev dependencies:
  - `@testing-library/jest-dom` 6.8.0 to 6.9.1
  - `eslint-plugin-prettier` 5.5.4 to 5.5.5
  - `eslint-plugin-testing-library` 7.6.6 to 7.15.4
  - `prettier` 3.6.2 to 3.8.1
  - `prettier-plugin-tailwindcss` 0.6.14 to 0.7.2
  - `ts-jest` 29.4.1 to 29.4.6
  - `ts-loader` 9.5.2 to 9.5.4
  - `webpack` 5.101.3 to 5.104.1

**Verification**: `npm test`, `npm run build`, `npm run lint:fix`

## Phase 2: Low-Risk Tool Bumps

Minor/major bumps for standalone dev tools unlikely to cause breakage.

**Branch**: `chore/deps-phase-2`

- [ ] `markdownlint-cli` 0.42.0 to 0.48.0
- [ ] `@commitlint/cli` 19.8.1 to 20.x
- [ ] `@commitlint/config-conventional` 19.8.1 to 20.x
- [ ] `lint-staged` 15.5.2 to 16.x
- [ ] Run full test suite and verify pre-commit hooks still work

**Verification**: `npm test`, `npm run lint:md`, test a sample commit

## Phase 3: ESLint 9 Migration

Major ecosystem change. ESLint 9 requires flat config (`eslint.config.js`) replacing `.eslintrc.*`. All ESLint-related packages must move together.

**Branch**: `chore/deps-eslint-9`

- [ ] Research ESLint 8 to 9 migration guide
- [ ] Audit current `.eslintrc` config and all plugin compatibility
- [ ] Upgrade `eslint` 8.57.1 to 9.x
- [ ] Upgrade `@typescript-eslint/eslint-plugin` 6.21.0 to 8.x
- [ ] Upgrade `@typescript-eslint/parser` 6.21.0 to 8.x
- [ ] Upgrade `eslint-config-airbnb-typescript` 17.1.0 to 18.x
- [ ] Upgrade `eslint-plugin-react-hooks` 4.6.2 to 7.x
- [ ] Upgrade `@figma/eslint-plugin-figma-plugins` 0.16.1 to 1.0.0
- [ ] Migrate `.eslintrc` to `eslint.config.js` (flat config)
- [ ] Verify all lint rules still apply correctly
- [ ] Close Dependabot PRs #9 and #11

**Verification**: `npm run lint:fix`, `npx tsc --noEmit --skipLibCheck`, `npm test`

## Phase 4: React 19

React 19 includes breaking changes (removed legacy APIs, new JSX transform requirements). Testing library must also bump.

**Branch**: `chore/deps-react-19`

- [ ] Review React 19 migration guide and breaking changes
- [ ] Upgrade `react` 18.3.1 to 19.x
- [ ] Upgrade `react-dom` 18.3.1 to 19.x
- [ ] Upgrade `@types/react` 18.3.28 to 19.x
- [ ] Upgrade `@types/react-dom` 18.3.7 to 19.x
- [ ] Upgrade `@testing-library/react` 14.3.1 to 16.x
- [ ] Check `figma-kit` compatibility with React 19
- [ ] Check `react-textarea-autosize` compatibility with React 19
- [ ] Check `react-router` compatibility with React 19
- [ ] Fix any breaking API changes in components
- [ ] Run full test suite and manually test plugin in Figma
- [ ] Close Dependabot PR #10

**Verification**: `npm test`, `npm run build`, manual Figma plugin test

## Phase 5: Webpack and Build Tooling

Loader and CLI major version bumps. These can break the build pipeline.

**Branch**: `chore/deps-build-tooling`

- [ ] Upgrade `css-loader` 6.11.0 to 7.x
- [ ] Upgrade `style-loader` 3.3.4 to 4.x
- [ ] Upgrade `postcss-loader` 7.3.4 to 8.x
- [ ] Upgrade `webpack-cli` 5.1.4 to 6.x
- [ ] Upgrade `webpack-merge` 5.10.0 to 6.x
- [ ] Verify webpack config compatibility with new loader APIs
- [ ] Test dev (`npm run watch`) and production (`npm run build`) builds

**Verification**: `npm run build`, `npm run watch` (manual check), `npm test`

## Phase 6: Tailwind CSS 4 (Evaluate)

Tailwind CSS 4 is a ground-up rewrite with a new engine and config format. This is the highest-effort upgrade and may not be worth doing depending on project roadmap.

**Branch**: `chore/deps-tailwind-4`

- [ ] Review Tailwind CSS 4 migration guide
- [ ] Evaluate effort vs. benefit for this project
- [ ] Decision: proceed or defer
- [ ] If proceeding:
  - [ ] Migrate `tailwind.config.js` to new format
  - [ ] Update `@tailwindcss/*` plugins for v4 compatibility
  - [ ] Audit all custom Tailwind classes for breaking changes
  - [ ] Test all UI screens in Figma plugin

**Verification**: `npm run build`, visual regression check in Figma

## Other Noted Upgrades

- [ ] `@types/jest` 29.x to 30.x - evaluate after Phase 5 (may require Jest 30)

## Completion Log

| Phase   | Date | Notes |
| ------- | ---- | ----- |
| Phase 1 |      |       |
| Phase 2 |      |       |
| Phase 3 |      |       |
| Phase 4 |      |       |
| Phase 5 |      |       |
| Phase 6 |      |       |
