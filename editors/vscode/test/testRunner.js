const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('Running Sanskrit Next VS Code Extension Test Suite...\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✕ ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

// 1. Package Manifest Tests
test('package.json has correct metadata and activation events', () => {
  const pkgPath = path.resolve(__dirname, '../package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  assert.strictEqual(pkg.name, 'sanskrit-vscode');
  assert.strictEqual(pkg.displayName, 'Sanskrit Next');
  assert.ok(/^\d+\.\d+\.\d+/.test(pkg.version), 'version should follow semantic versioning');
  assert.ok(pkg.activationEvents.includes('onLanguage:sanskrit'));
  assert.ok(pkg.activationEvents.includes('onCommand:sanskrit.run'));
  assert.ok(pkg.activationEvents.includes('onCommand:sanskrit.runInTerminal'));
  assert.ok(pkg.activationEvents.includes('onCommand:sanskrit.openTensorInspector'));
});

// 2. Syntax Grammar Tests
test('syntaxes/sanskrit.tmLanguage.json is valid TextMate grammar', () => {
  const grammarPath = path.resolve(__dirname, '../syntaxes/sanskrit.tmLanguage.json');
  const grammar = JSON.parse(fs.readFileSync(grammarPath, 'utf8'));
  assert.strictEqual(grammar.scopeName, 'source.sanskrit');
  assert.ok(grammar.repository.keywords, 'keywords repository missing');
  assert.ok(grammar.repository.types, 'types repository missing');
  assert.ok(grammar.repository.numbers, 'numbers repository missing');
  assert.ok(grammar.repository.builtins, 'builtins repository missing');
});

// 3. Language Configuration Tests
test('syntaxes/sanskrit-configuration.json defines comments and brackets', () => {
  const configPath = path.resolve(__dirname, '../syntaxes/sanskrit-configuration.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  assert.strictEqual(config.comments.lineComment, '//');
  assert.ok(config.brackets.length >= 3);
});

// 4. Snippets Tests
test('snippets/sanskrit.json defines Devanagari and ASCII snippets', () => {
  const snippetPath = path.resolve(__dirname, '../snippets/sanskrit.json');
  const snippets = JSON.parse(fs.readFileSync(snippetPath, 'utf8'));
  assert.ok(snippets['Function Declaration (Devanagari)']);
  assert.ok(snippets['Function Declaration (ASCII)']);
  assert.ok(snippets['Tensor Allocation']);
  assert.ok(snippets['Automatic Differentiation Dual']);
});

// 5. Build Artifact Verification
test('dist/extension.js is built and bundle exists', () => {
  const bundlePath = path.resolve(__dirname, '../dist/extension.js');
  assert.ok(fs.existsSync(bundlePath), 'dist/extension.js does not exist');
  const stat = fs.statSync(bundlePath);
  assert.ok(stat.size > 100000, `Bundle too small (${stat.size} bytes)`);
});

// 6. Media Assets Verification
test('media/icon.png and CSS assets exist', () => {
  assert.ok(fs.existsSync(path.resolve(__dirname, '../media/icon.png')));
  assert.ok(fs.existsSync(path.resolve(__dirname, '../media/icon.svg')));
  assert.ok(fs.existsSync(path.resolve(__dirname, '../media/tensor-inspector.css')));
  assert.ok(fs.existsSync(path.resolve(__dirname, '../media/benchmark.css')));
});

console.log(`\nTest Results: ${passed} passed, ${failed} failed.\n`);
if (failed > 0) {
  process.exit(1);
}
