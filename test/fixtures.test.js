const test = require('node:test');
const assert = require('node:assert/strict');
const { execSync } = require('node:child_process');
const path = require('node:path');

const BIN_PATH = path.resolve(__dirname, '../bin/sanskrit');

test('Fixtures: main.sns executes cleanly', () => {
    const file = path.resolve(__dirname, 'main.sns');
    const stdout = execSync(`node ${BIN_PATH} run ${file}`, { encoding: 'utf8' });
    assert.ok(stdout.includes('नमस्ते विश्व!'));
    assert.ok(stdout.includes('३०'));
    assert.ok(stdout.includes('संस्कृत भाषा'));
});

test('Fixtures: advanced_features.sns executes cleanly', () => {
    const file = path.resolve(__dirname, 'advanced_features.sns');
    const stdout = execSync(`node ${BIN_PATH} run ${file}`, { encoding: 'utf8' });
    assert.ok(stdout.includes('नाम: राम'));
    assert.ok(stdout.includes('व्यक्ति का नाम: सीता'));
    assert.ok(stdout.includes('वयस्क है'));
    assert.ok(stdout.includes('५ का वर्ग: २५'));
    assert.ok(stdout.includes('सभी परीक्षण पूर्ण!'));
});

test('Fixtures: class_example.sns executes cleanly', () => {
    const file = path.resolve(__dirname, 'class_example.sns');
    const stdout = execSync(`node ${BIN_PATH} run ${file}`, { encoding: 'utf8' });
    assert.ok(stdout.includes('नमस्ते, मेरा नाम राम है'));
    assert.ok(stdout.includes('जन्मदिन मुबारक!'));
    assert.ok(stdout.includes('अर्जुन कक्षा दसवीं में अध्ययन कर रहा है।'));
    assert.ok(stdout.includes('मानव'));
});

test('Fixtures: error_handling.sns executes cleanly', () => {
    const file = path.resolve(__dirname, 'error_handling.sns');
    const stdout = execSync(`node ${BIN_PATH} run ${file}`, { encoding: 'utf8' });
    assert.ok(stdout.includes('१० ÷ २ = ५'));
    assert.ok(stdout.includes('त्रुटि पकड़ी गई: शून्य से भाग नहीं किया जा सकता'));
    assert.ok(stdout.includes('सफाई का काम पूरा'));
    assert.ok(stdout.includes('वैध पहुंच: ३'));
    assert.ok(stdout.includes('अवैध पहुंच: शून्य'));
});

test('Fixtures: algorithms.sns executes cleanly', () => {
    const file = path.resolve(__dirname, 'algorithms.sns');
    const stdout = execSync(`node ${BIN_PATH} run ${file}`, { encoding: 'utf8' });
    assert.ok(stdout.includes('F(10) = ५५'));
    assert.ok(stdout.includes('5! = १२०'));
    assert.ok(stdout.includes('२ अभाज्य है'));
    assert.ok(stdout.includes('क्रमबद्ध सरणी: [११, १२, २२, २५, ३४, ६४, ९०]'));
    assert.ok(stdout.includes('७ का स्थान: ३'));
    assert.ok(stdout.includes('GCD(४८, १८) = ६'));
});
