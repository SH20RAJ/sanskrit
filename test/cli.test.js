const test = require('node:test');
const assert = require('node:assert/strict');
const { execSync } = require('node:child_process');
const path = require('node:path');
const { version } = require('../package.json');

const BIN_PATH = path.resolve(__dirname, '../bin/sanskrit');

test('CLI: reports version with --version', () => {
    const stdout = execSync(`node ${BIN_PATH} --version`, { encoding: 'utf8' }).trim();
    assert.equal(stdout, version);
});

test('CLI: displays help with --help', () => {
    const stdout = execSync(`node ${BIN_PATH} --help`, { encoding: 'utf8' });
    assert.ok(stdout.includes('sanskrit'));
    assert.ok(stdout.includes('run'));
    assert.ok(stdout.includes('check'));
    assert.ok(stdout.includes('repl'));
});

test('CLI: check command validates syntax', () => {
    const fixturePath = path.resolve(__dirname, 'main.sns');
    const stdout = execSync(`node ${BIN_PATH} check ${fixturePath}`, { encoding: 'utf8' });
    assert.ok(stdout.includes('Syntax valid'));
});

test('CLI: run executes file successfully', () => {
    const fixturePath = path.resolve(__dirname, 'main.sns');
    const stdout = execSync(`node ${BIN_PATH} run ${fixturePath}`, { encoding: 'utf8' });
    assert.ok(stdout.includes('नमस्ते विश्व!'));
    assert.ok(stdout.includes('३०'));
});

test('CLI: returns non-zero exit code for nonexistent file', () => {
    assert.throws(() => {
        execSync(`node ${BIN_PATH} run nonexistent_file_xyz.sns`, {
            encoding: 'utf8',
            stdio: 'pipe'
        });
    });
});
