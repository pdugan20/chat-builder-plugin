# Changelog

## [2.0.1](https://github.com/pdugan20/figma-chat-builder/compare/v2.0.0...v2.0.1) (2026-08-15)


### Documentation

* mark pr-lint empty run-body allowlist as a security control ([#114](https://github.com/pdugan20/figma-chat-builder/issues/114)) ([e6bdaea](https://github.com/pdugan20/figma-chat-builder/commit/e6bdaeac54714b253e1b64a97d48b0981e04ce40))

## [2.0.0](https://github.com/pdugan20/figma-chat-builder/compare/v1.3.1...v2.0.0) (2026-08-13)


### ⚠ BREAKING CHANGES

* standardize on Node 24 and TypeScript 6 ([#111](https://github.com/pdugan20/figma-chat-builder/issues/111))

### Documentation

* standardize README title and badges ([#112](https://github.com/pdugan20/figma-chat-builder/issues/112)) ([e789df1](https://github.com/pdugan20/figma-chat-builder/commit/e789df1933831a376dca967931b747ddc495c866))
* streamline readme ([6692b3e](https://github.com/pdugan20/figma-chat-builder/commit/6692b3eee712ead88ad898d6a00324f3e7759061))


### Miscellaneous

* standardize on Node 24 and TypeScript 6 ([#111](https://github.com/pdugan20/figma-chat-builder/issues/111)) ([6bdc718](https://github.com/pdugan20/figma-chat-builder/commit/6bdc718ab68cdd53e6e0415ed8b8cd3b3d3cf816))

## [1.3.1](https://github.com/pdugan20/figma-chat-builder/compare/v1.3.0...v1.3.1) (2026-08-11)


### Bug Fixes

* **release:** use plain version tags ([#107](https://github.com/pdugan20/figma-chat-builder/issues/107)) ([14e4525](https://github.com/pdugan20/figma-chat-builder/commit/14e4525ec90dd82b3b26983d0ff63d6cdf8dc2f6))

## [1.3.0](https://github.com/pdugan20/figma-chat-builder/compare/v1.2.0...v1.3.0) (2026-07-21)

### Features

- **api:** improve prompt engineering and fix parameter threading ([33f83ba](https://github.com/pdugan20/figma-chat-builder/commit/33f83bac25b82d74237b4835b1373840070d3136))
- **deps:** upgrade to React 19 and testing-library 16 ([fbd524b](https://github.com/pdugan20/figma-chat-builder/commit/fbd524bd0363ba9e8c733bc6415f61b3d6d26469))
- **deps:** upgrade to React 19 and testing-library 16 ([19d5754](https://github.com/pdugan20/figma-chat-builder/commit/19d5754c1a7a0515d94bc18a750dbb299b8f1560))
- upgrade to Claude Sonnet 4.6 and add automated release pipeline ([2405136](https://github.com/pdugan20/figma-chat-builder/commit/24051365b4855b32e31e869fbab803a729feb390))

### Bug Fixes

- add spacing between Learn more link and Add key button ([689d148](https://github.com/pdugan20/figma-chat-builder/commit/689d148ea9c0c9823b426687da52beb02c46a002))
- resolve API response parsing and restore loading overlay ([08a9ec2](https://github.com/pdugan20/figma-chat-builder/commit/08a9ec2b813f96a110ca1e1fed5fc7844ef604f1))
- resolve double ellipsis, error handling mismatch, and env flag injection ([7193ffd](https://github.com/pdugan20/figma-chat-builder/commit/7193ffd1fc2df5ef21a7cb525aa38f0005234df3))
- **test:** polyfill TextEncoder/TextDecoder for jsdom ([#88](https://github.com/pdugan20/figma-chat-builder/issues/88)) ([9c8185f](https://github.com/pdugan20/figma-chat-builder/commit/9c8185f9767f530429dce33170c2c59de99f483d))
- unblock production build broken by @anthropic-ai/sdk node: imports ([#81](https://github.com/pdugan20/figma-chat-builder/issues/81)) ([b1dc5ff](https://github.com/pdugan20/figma-chat-builder/commit/b1dc5ff7e2b6103173af1e0f69cae6c0bddbbf58))

### Refactoring

- **hooks:** refactor use-chat-generation to use services (Sprint 5) ([301af9f](https://github.com/pdugan20/figma-chat-builder/commit/301af9f555cfb103eca34bd3a6cab47be49bf5ae))
- **lint:** migrate to ESLint 9 flat config ([3c74303](https://github.com/pdugan20/figma-chat-builder/commit/3c74303d79b78e2ac952ce6db8f2db267068cf48))
- **lint:** migrate to ESLint 9 flat config ([e8d2a3b](https://github.com/pdugan20/figma-chat-builder/commit/e8d2a3bec479b2f7b4baad8e526f02559853d3bc))
- remove dead code, unused deps, and reorganize project structure ([7119f16](https://github.com/pdugan20/figma-chat-builder/commit/7119f16184c4a5f39f3859e046e0cacf710c203a))
- replace hardcoded dev flags with build-time env injection ([9498a62](https://github.com/pdugan20/figma-chat-builder/commit/9498a62deeb1ca10e5e649eeeb628844325b87af))
- **services:** create APIService (Sprint 3) ([68c28ac](https://github.com/pdugan20/figma-chat-builder/commit/68c28acf09d55b1682470a38353d070323b1f164))
- **services:** create ChatGenerationService (Sprint 4) ([317a41e](https://github.com/pdugan20/figma-chat-builder/commit/317a41e1503813954ca409da965f7af969a03864))
- **services:** create PluginMessengerService and context (Sprint 2) ([f3291a1](https://github.com/pdugan20/figma-chat-builder/commit/f3291a1470892fe899d9319207a042741033781b))
- **services:** create ValidationService and LoadingStateManager (Sprint 1) ([65a55b1](https://github.com/pdugan20/figma-chat-builder/commit/65a55b18a97063efe065bf54747cc30defd2aec3))

### Documentation

- bump Node prerequisite v20+ to v22+ ([#60](https://github.com/pdugan20/figma-chat-builder/issues/60)) ([66796b6](https://github.com/pdugan20/figma-chat-builder/commit/66796b6cddf73e6aba5512ee84acc0a119b06bd1))
- clean up README - remove test coverage details and simplify title ([b937d98](https://github.com/pdugan20/figma-chat-builder/commit/b937d98f0fdadfab4a421f214f1771885dc3930a))
- consolidate documentation and fix inaccuracies ([#33](https://github.com/pdugan20/figma-chat-builder/issues/33)) ([63ba850](https://github.com/pdugan20/figma-chat-builder/commit/63ba850a402d59ad80d300ebd0be7dd6ad79599b))
- drop tech stack section ([7f46e55](https://github.com/pdugan20/figma-chat-builder/commit/7f46e558a237ec7da81701a30b9d04a9f4788f37))
- enhance documentation with badges and contribution guidelines ([a69cd4a](https://github.com/pdugan20/figma-chat-builder/commit/a69cd4af085697e009d416b886dd268c424d6182))
- finalize dependency upgrade tracker ([9b4223a](https://github.com/pdugan20/figma-chat-builder/commit/9b4223a0ede660c73a54fdff81457f7b20e187ce))
- finalize dependency upgrade tracker ([0a7c1f9](https://github.com/pdugan20/figma-chat-builder/commit/0a7c1f9690feb69bbcbcdefa41d92067cc028db0))
- fold Features into intro prose ([#61](https://github.com/pdugan20/figma-chat-builder/issues/61)) ([a95ccdb](https://github.com/pdugan20/figma-chat-builder/commit/a95ccdb1991a87b04e0c18a2c69db7e085d38229))
- remove extra license section from README ([c50bf97](https://github.com/pdugan20/figma-chat-builder/commit/c50bf97d525976e06c4ba1725e1c0f51498420a7))
- rename repo to figma-chat-builder, title 'Chat Builder Figma Plugin' ([0b1c17e](https://github.com/pdugan20/figma-chat-builder/commit/0b1c17e199acfed40c50090bbd03997da469fded))
- reorganize docs folder and add dependency upgrade tracker ([8eba182](https://github.com/pdugan20/figma-chat-builder/commit/8eba182a176990e44e3ced4a46cc424f554ee128))
- replace end-to-end flow prose with mermaid architecture diagram ([aabbdf0](https://github.com/pdugan20/figma-chat-builder/commit/aabbdf0a9906efb0e662e4831048f793aff223a8))
- restore clean concise README ([c6a747c](https://github.com/pdugan20/figma-chat-builder/commit/c6a747c4f8278524bfdb2a1cdec74e5db4f040f7))
- title README 'iMessage Chat Builder for Figma' ([98c6c62](https://github.com/pdugan20/figma-chat-builder/commit/98c6c627c4227712aac8c3f70b8466642f1005d6))
- trim README badges to CI, Release, Figma Community, License ([4caa534](https://github.com/pdugan20/figma-chat-builder/commit/4caa5340a1b5db24b3606a0d9a81ed07f0d308ab))
- update README badges, versions, and doc links ([c02b702](https://github.com/pdugan20/figma-chat-builder/commit/c02b70230038cbbc15788b8b3b53f6dbb1238be0))

## [1.2.0](https://github.com/pdugan20/figma-chat-builder/compare/v1.1.0...v1.2.0) (2026-03-05)

### Features

- **api:** improve prompt engineering and fix parameter threading ([33f83ba](https://github.com/pdugan20/figma-chat-builder/commit/33f83bac25b82d74237b4835b1373840070d3136))
- **deps:** upgrade to React 19 and testing-library 16 ([fbd524b](https://github.com/pdugan20/figma-chat-builder/commit/fbd524bd0363ba9e8c733bc6415f61b3d6d26469))
- **deps:** upgrade to React 19 and testing-library 16 ([19d5754](https://github.com/pdugan20/figma-chat-builder/commit/19d5754c1a7a0515d94bc18a750dbb299b8f1560))

### Refactoring

- **lint:** migrate to ESLint 9 flat config ([3c74303](https://github.com/pdugan20/figma-chat-builder/commit/3c74303d79b78e2ac952ce6db8f2db267068cf48))
- **lint:** migrate to ESLint 9 flat config ([e8d2a3b](https://github.com/pdugan20/figma-chat-builder/commit/e8d2a3bec479b2f7b4baad8e526f02559853d3bc))

### Documentation

- finalize dependency upgrade tracker ([9b4223a](https://github.com/pdugan20/figma-chat-builder/commit/9b4223a0ede660c73a54fdff81457f7b20e187ce))
- finalize dependency upgrade tracker ([0a7c1f9](https://github.com/pdugan20/figma-chat-builder/commit/0a7c1f9690feb69bbcbcdefa41d92067cc028db0))
- reorganize docs folder and add dependency upgrade tracker ([8eba182](https://github.com/pdugan20/figma-chat-builder/commit/8eba182a176990e44e3ced4a46cc424f554ee128))
- update README badges, versions, and doc links ([c02b702](https://github.com/pdugan20/figma-chat-builder/commit/c02b70230038cbbc15788b8b3b53f6dbb1238be0))

## [1.1.0](https://github.com/pdugan20/figma-chat-builder/releases/tag/v1.1.0) (2026-03-05)

### Features

- upgrade to Claude Sonnet 4.6 and add automated release pipeline ([2405136](https://github.com/pdugan20/figma-chat-builder/commit/24051365b4855b32e31e869fbab803a729feb390))

### Bug Fixes

- resolve API response parsing and restore loading overlay ([08a9ec2](https://github.com/pdugan20/figma-chat-builder/commit/08a9ec2b813f96a110ca1e1fed5fc7844ef604f1))
- resolve double ellipsis, error handling mismatch, and env flag injection ([7193ffd](https://github.com/pdugan20/figma-chat-builder/commit/7193ffd1fc2df5ef21a7cb525aa38f0005234df3))

### Refactoring

- **hooks:** refactor use-chat-generation to use services (Sprint 5) ([301af9f](https://github.com/pdugan20/figma-chat-builder/commit/301af9f555cfb103eca34bd3a6cab47be49bf5ae))
- remove dead code, unused deps, and reorganize project structure ([7119f16](https://github.com/pdugan20/figma-chat-builder/commit/7119f16184c4a5f39f3859e046e0cacf710c203a))
- replace hardcoded dev flags with build-time env injection ([9498a62](https://github.com/pdugan20/figma-chat-builder/commit/9498a62deeb1ca10e5e649eeeb628844325b87af))
- **services:** create APIService (Sprint 3) ([68c28ac](https://github.com/pdugan20/figma-chat-builder/commit/68c28acf09d55b1682470a38353d070323b1f164))
- **services:** create ChatGenerationService (Sprint 4) ([317a41e](https://github.com/pdugan20/figma-chat-builder/commit/317a41e1503813954ca409da965f7af969a03864))
- **services:** create PluginMessengerService and context (Sprint 2) ([f3291a1](https://github.com/pdugan20/figma-chat-builder/commit/f3291a1470892fe899d9319207a042741033781b))
- **services:** create ValidationService and LoadingStateManager (Sprint 1) ([65a55b1](https://github.com/pdugan20/figma-chat-builder/commit/65a55b18a97063efe065bf54747cc30defd2aec3))

### Documentation

- clean up README - remove test coverage details and simplify title ([b937d98](https://github.com/pdugan20/figma-chat-builder/commit/b937d98f0fdadfab4a421f214f1771885dc3930a))
- enhance documentation with badges and contribution guidelines ([a69cd4a](https://github.com/pdugan20/figma-chat-builder/commit/a69cd4af085697e009d416b886dd268c424d6182))
- remove extra license section from README ([c50bf97](https://github.com/pdugan20/figma-chat-builder/commit/c50bf97d525976e06c4ba1725e1c0f51498420a7))
- restore clean concise README ([c6a747c](https://github.com/pdugan20/figma-chat-builder/commit/c6a747c4f8278524bfdb2a1cdec74e5db4f040f7))

## Changelog

All notable changes to the iMessage AI Chat Builder plugin will be documented in this file.

This changelog is automatically generated by [release-please](https://github.com/googleapis/release-please) from [Conventional Commits](https://www.conventionalcommits.org/).
