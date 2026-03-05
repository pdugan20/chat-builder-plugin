const fs = require('fs');
const path = require('path');

// Read the version from package.json (source of truth)
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

// Update the plugin constants file
const pluginConstantsPath = path.join(__dirname, '../src/constants/plugin.ts');
const pluginConstantsContent = fs.readFileSync(pluginConstantsPath, 'utf8');

const updatedContent = pluginConstantsContent.replace(
  /const PLUGIN_VERSION = ['"][^'"]+['"](.*)/,
  `const PLUGIN_VERSION = '${version}'$1`
);

if (updatedContent === pluginConstantsContent && !pluginConstantsContent.includes(version)) {
  console.error('Could not find PLUGIN_VERSION in constants file');
  process.exit(1);
}

fs.writeFileSync(pluginConstantsPath, updatedContent);

console.log(`Updated plugin.ts version to ${version}`);
