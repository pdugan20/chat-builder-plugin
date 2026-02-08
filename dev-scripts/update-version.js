const fs = require('fs');
const path = require('path');

// Read the plugin version from the constants file
const pluginConstantsPath = path.join(__dirname, '../src/constants/plugin.ts');
const pluginConstantsContent = fs.readFileSync(pluginConstantsPath, 'utf8');

// Extract version using regex
const versionMatch = pluginConstantsContent.match(/const PLUGIN_VERSION = ['"]([^'"]+)['"]/);
if (!versionMatch) {
  console.error('Could not find PLUGIN_VERSION in constants file');
  process.exit(1);
}

const version = versionMatch[1];

// Read and update package.json
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

packageJson.version = version;

// Write back to package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log(`Updated package.json version to ${version}`);
