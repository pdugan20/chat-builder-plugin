module.exports = {
  '*.{ts,tsx}': ['prettier --write', 'eslint --fix', () => 'tsc --noEmit --skipLibCheck'],
  '*.md': ['prettier --write', 'markdownlint --fix'],
  '*.{json,yml,yaml}': ['prettier --write'],
  '*.css': ['prettier --write'],
};
