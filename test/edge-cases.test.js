const test = require('node:test');
const assert = require('node:assert/strict');
const { Lexer } = require('../src/lexer');
const { Parser } = require('../src/parser');
const { Interpreter } = require('../src/runtime');
const { SanskritError, TypeError } = require('../src/diagnostics/errors');

function runCode(code) {
    const outputs = [];
    const lexer = new Lexer(code);
    const parser = new Parser(lexer);
    const ast = parser.parse();
    const interpreter = new Interpreter({
        outputStream: (msg) => outputs.push(msg)
    });
    interpreter.interpret(ast);
    return outputs;
}

test('Edge Cases: empty source code executes without error', () => {
    const outputs = runCode('');
    assert.deepEqual(outputs, []);

    const whitespaceOutputs = runCode('   \n\n\t  // comment only\n  ');
    assert.deepEqual(whitespaceOutputs, []);
});

test('Edge Cases: huge numbers and negative numbers', () => {
    const code = `
    चर विशाल = १०००००००००००००;
    चर ऋणात्मक = -५०;
    मुद्रण(विशाल + ऋणात्मक);
    `;
    const outputs = runCode(code);
    assert.equal(outputs.length, 1);
});

test('Edge Cases: division by zero returns Infinity in math', () => {
    const code = `
    चर परिणाम = १० / ०;
    मुद्रण(परिणाम === अनंत);
    `;
    const outputs = runCode(code);
    assert.deepEqual(outputs, ['सत्य']);
});

test('Edge Cases: invalid array index returns undefined', () => {
    const code = `
    चर सूची = [१, २, ३];
    मुद्रण(सूची[१००]);
    `;
    const outputs = runCode(code);
    assert.deepEqual(outputs, ['अपरिभाषित']);
});

test('Edge Cases: deeply nested blocks and expressions', () => {
    const code = `
    {
        {
            {
                चर x = (((१ + २) * (३ + ४)) - ५);
                मुद्रण(x);
            }
        }
    }
    `;
    const outputs = runCode(code);
    assert.deepEqual(outputs, ['१६']);
});

test('Edge Cases: calling a non-function throws TypeError', () => {
    const code = `
    चर संख्या_चर = ४२;
    संख्या_चर();
    `;
    assert.throws(() => {
        runCode(code);
    }, TypeError);
});

test('Edge Cases: calling new on a non-class throws TypeError', () => {
    const code = `
    चर सामान्य_चर = "नमस्ते";
    चर वस्तु = नया सामान्य_चर();
    `;
    assert.throws(() => {
        runCode(code);
    }, TypeError);
});

test('Fuzz: randomized string inputs do not hang the lexer or parser', () => {
    const characters = 'अआइईउऊऋएऐओऔकखगघचछजझटठडढतथदधनपफबभमयरलवशषसह१२३४५६७८९०(){}[].,;:"\'=!+-*/%^&| \n\t\\';

    // Run 50 random fuzz strings
    for (let iteration = 0; iteration < 50; iteration++) {
        let randomStr = '';
        const len = Math.floor(Math.random() * 60) + 1;
        for (let i = 0; i < len; i++) {
            const idx = Math.floor(Math.random() * characters.length);
            randomStr += characters[idx];
        }

        try {
            const lexer = new Lexer(randomStr, '<fuzz>');
            const tokens = lexer.getAllTokens();
            const parser = new Parser(new Lexer(randomStr, '<fuzz>'), '<fuzz>');
            parser.parse();
        } catch (err) {
            // Must be a controlled error, never an unhandled hang or infinite loop
            assert.ok(err instanceof Error);
        }
    }
});
