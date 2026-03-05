# Dependency Upgrades Tracker

Tracking the upgrade of all outdated dependencies across 6 phases ordered by risk and dependency chain.

**Started**: 2026-03-05
**Branch prefix**: `chore/deps-`

## Open Dependabot PRs

These existing PRs need to be resolved (merged or closed) as part of this effort.

| PR  | Description                                   | CI   | Merge Status | Action                       |
| --- | --------------------------------------------- | ---- | ------------ | ---------------------------- |
| #5  | `actions/checkout` 4 to 6                     | Pass | Clean        | Closed, superseded by PR #16 |
| #6  | `actions/setup-node` 4 to 6                   | Pass | Clean        | Closed, superseded by PR #16 |
| #7  | Grouped dev deps (8 packages)                 | Pass | Conflicts    | Closed, superseded by PR #16 |
| #9  | `@figma/eslint-plugin-figma-plugins` 0.16-1.0 | Pass | Conflicts    | Closed, superseded by PR #19 |
| #10 | React + @types/react                          | Fail | Conflicts    | Close, Phase 4               |
| #11 | `@typescript-eslint/eslint-plugin` 6-8        | Fail | Conflicts    | Closed, superseded by PR #19 |

## Phase 1: CI Actions and Safe Dev Dependency Patches

Low-risk changes with passing CI. No breaking changes expected.

**Branch**: `chore/deps-phase-1`

- [x] Merge PR #5 - `actions/checkout` 4 to 6 (superseded by PR #16)
- [x] Merge PR #6 - `actions/setup-node` 4 to 6 (superseded by PR #16)
- [x] Rebase and merge PR #7 - grouped dev dependencies (superseded by PR #16):
  - `@testing-library/jest-dom` 6.8.0 to 6.9.1
  - `eslint-plugin-prettier` 5.5.4 to 5.5.5
  - `eslint-plugin-testing-library` 7.6.6 to 7.15.4
  - `prettier` 3.6.2 to 3.8.1
  - `prettier-plugin-tailwindcss` 0.6.14 to 0.7.2
  - `ts-jest` 29.4.1 to 29.4.6
  - `ts-loader` 9.5.2 to 9.5.4
  - `webpack` 5.101.3 to 5.104.1
- [x] All checks passing (lint, types, 88/88 tests, build)

**PR**: #16 | **Verification**: all passed

## Phase 2: Low-Risk Tool Bumps

Minor/major bumps for standalone dev tools unlikely to cause breakage.

**Branch**: `chore/deps-phase-2`

- [x] `markdownlint-cli` 0.42.0 to 0.48.0
- [x] `@commitlint/cli` 19.8.1 to 20.4.3
- [x] `@commitlint/config-conventional` 19.8.1 to 20.4.3
- [x] `lint-staged` 15.5.2 to 16.3.2
- [x] Run full test suite and verify pre-commit hooks still work
- [x] All checks passing (lint, types, 88/88 tests, markdownlint, commitlint)

**PR**: #17 | **Verification**: all passed

## Phase 3: ESLint 9 Migration

Major ecosystem change. ESLint 9 requires flat config (`eslint.config.js`) replacing `.eslintrc.*`. All ESLint-related packages must move together.

**Branch**: `chore/deps-eslint-9`

- [x] Research ESLint 8 to 9 migration guide
- [x] Audit current `.eslintrc` config and all plugin compatibility
- [x] Upgrade `eslint` 8.57.1 to 9.x
- [x] Upgrade `@typescript-eslint/eslint-plugin` 6.21.0 to 8.x
- [x] Upgrade `@typescript-eslint/parser` 6.21.0 to 8.x
- [x] Drop `eslint-config-airbnb` and `eslint-config-airbnb-typescript` (incompatible with ts-eslint v8; rules already covered by individual plugins)
- [x] Drop `eslint-plugin-import` and `eslint-plugin-jsx-a11y` (airbnb dependencies, not used directly)
- [x] Upgrade `eslint-plugin-react-hooks` 4.6.2 to 5.x
- [x] Upgrade `@figma/eslint-plugin-figma-plugins` 0.16.1 to 1.0.0
- [x] Add `typescript-eslint` unified package, `@eslint/js`, `globals`
- [x] Migrate `.eslintrc.js` to `eslint.config.mjs` (flat config)
- [x] Remove stale eslint-disable comments (import/prefer-default-export, no-console, no-restricted-syntax)
- [x] Verify all lint rules still apply correctly (0 errors, 4 pre-existing warnings)
- [x] Close Dependabot PRs #9 and #11
- [x] All checks passing (lint, types, 88/88 tests, build)

**PR**: #19 | **Verification**: all passed

## Phase 4: React 19

React 19 includes breaking changes (removed legacy APIs, new JSX transform requirements). Testing library must also bump.

**Branch**: `chore/deps-react-19`

- [x] Review React 19 migration guide and breaking changes
- [x] Upgrade `react` 18.3.1 to 19.2.4
- [x] Upgrade `react-dom` 18.3.1 to 19.2.4
- [x] Upgrade `@types/react` 18.3.28 to 19.x
- [x] Upgrade `@types/react-dom` 18.3.7 to 19.x
- [x] Upgrade `@testing-library/react` 14.3.1 to 16.3.2
- [x] Add `@testing-library/dom` (now a required peer dep of testing-library v16)
- [x] Check `figma-kit` compatibility with React 19 (works via --legacy-peer-deps, peer dep still ^18)
- [x] Check `react-textarea-autosize` compatibility (supports React 19 natively)
- [x] Check `react-router` compatibility (supports React >=18)
- [x] No breaking API changes needed in components
- [x] All checks passing (lint, types, 88/88 tests, build)
- [ ] Close Dependabot PR #10
- [ ] Manual Figma plugin test (recommended before merging)

**PR**: #20 | **Verification**: all automated checks passed

## Phase 5: Webpack and Build Tooling

Loader and CLI major version bumps. These can break the build pipeline.

**Branch**: `chore/deps-build-tooling`

- [x] Upgrade `css-loader` 6.11.0 to 7.x
- [x] Upgrade `style-loader` 3.3.4 to 4.x
- [x] Upgrade `postcss-loader` 7.3.4 to 8.x
- [x] Upgrade `webpack-cli` 5.1.4 to 6.x
- [x] Upgrade `webpack-merge` 5.10.0 to 6.x
- [x] Webpack config compatible with new loader APIs (no changes needed)
- [x] All checks passing (lint, types, 88/88 tests, build)

**PR**: #21 | **Verification**: all passed

## Phase 6: Tailwind CSS 4

Tailwind CSS 4 is a ground-up rewrite with a new engine and config format. Uses CSS-native configuration with `@config` bridge for legacy JS presets.

**Branch**: `chore/deps-tailwind-4`

- [x] Upgrade `tailwindcss` 3.4.19 to 4.2.1
- [x] Add `@tailwindcss/postcss` 4.2.1 (replaces both `tailwindcss` and `autoprefixer` in PostCSS)
- [x] Remove `autoprefixer` (handled by TW4 natively)
- [x] Remove `@tailwindcss/aspect-ratio` (native in TW4)
- [x] Remove `@tailwindcss/container-queries` (native in TW4)
- [x] Extract figma-kit Tailwind preset to `src/ui/styles/figma-tailwind-preset.js`
- [x] Update `tailwind.config.js` to use local preset, remove dropped plugins and `content`/`darkMode`
- [x] Update `postcss.config.js` to use `@tailwindcss/postcss`
- [x] Migrate `app.css` from `@tailwind` directives to `@import "tailwindcss"` + `@config` + `@plugin` + `@custom-variant`
- [x] Remove `eslint-plugin-tailwindcss` (v4 beta too unstable; `prettier-plugin-tailwindcss` handles class sorting)
- [x] Update `.prettierrc.yml` with `tailwindStylesheet` for TW4 class sorting
- [x] Add `.npmrc` with `legacy-peer-deps=true` (fixes CI failure from figma-kit React 18 peer dep)
- [x] All checks passing (lint, types, 88/88 tests, build)

**PR**: #26 | **Verification**: all passed (CI green)

## Phase 7: Jest 30

Jest 30 with JSDOM v26, updated types, and ts-jest compatibility.

**Branch**: `chore/deps-jest-30`

- [x] Upgrade `jest` 29.7.0 to 30.2.0
- [x] Upgrade `jest-environment-jsdom` 29.7.0 to 30.2.0
- [x] Upgrade `@types/jest` 29.5.14 to 30.0.0
- [x] `ts-jest` 29.4.6 compatible with Jest 30 (no upgrade needed)
- [x] No config changes needed (`jest.config.js` unchanged)
- [x] All checks passing (lint, types, 88/88 tests, build)

**PR**: #24 | **Verification**: all passed

## Other Noted Upgrades (Deferred)

- [ ] `eslint-plugin-tailwindcss` - re-add when v4 stable releases (currently at 4.0.0-beta.0, crashes on v4 configs)
- [ ] `figma-kit` - no real update available (stuck at 1.0.0-beta.22, React 18 peer dep)
- [ ] Convert figma-kit preset from JS `@config` bridge to CSS-native `@theme` (optional, bridge works fine)

## Completion Log

| Phase   | Date       | Notes                                                                                   |
| ------- | ---------- | --------------------------------------------------------------------------------------- |
| Phase 1 | 2026-03-05 | PR #16. Closed dependabot PRs #5, #6, #7.                                               |
| Phase 2 | 2026-03-05 | PR #18. commitlint 20, lint-staged 16, markdownlint-cli 0.48.                           |
| Phase 3 | 2026-03-05 | PR #19. ESLint 9 flat config. Dropped airbnb, added typescript-eslint unified.          |
| Phase 4 | 2026-03-05 | PR #20. React 19, testing-library 16. figma-kit works via legacy-peer-deps.             |
| Phase 5 | 2026-03-05 | PR #21. css-loader 7, style-loader 4, postcss-loader 8, webpack-cli 6, webpack-merge 6. |
| Phase 6 | 2026-03-05 | PR #26. Tailwind 4, extracted preset, removed 3 deps, added .npmrc, Node 20. CI green.  |
