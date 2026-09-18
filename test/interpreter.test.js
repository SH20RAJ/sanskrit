const test = require('node:test');
const assert = require('node:assert/strict');
const { Lexer } = require('../src/lexer');
const { Parser } = require('../src/parser');
const { Interpreter } = require('../src/runtime');
const { ConstantError, NameError } = require('../src/diagnostics/errors');

function execute(code) {
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

test('Interpreter: executes basic arithmetic and comparisons', () => {
    const code = `
    मुद्रण(१० + २०);
    मुद्रण(५० - १५);
    मुद्रण(६ * ७);
    मुद्रण(२० / ४);
    मुद्रण(१७ % ५);
    मुद्रण(२ ** ८);
    `;
    const out = execute(code);
    assert.deepEqual(out, ['३०', '३५', '४२', '५', '२', '२५६']);
});

test('Interpreter: prevents constant reassignment', () => {
    const code = `
    स्थिर पाई = ३.१४;
    पाई = ३.१४१५९;
    `;
    assert.throws(() => {
        execute(code);
    }, ConstantError);
});

test('Interpreter: throws NameError on undefined variable lookup', () => {
    const code = `
    मुद्रण(अज्ञात_चर);
    `;
    assert.throws(() => {
        execute(code);
    }, NameError);
});

test('Interpreter: executes while loop with break and continue', () => {
    const code = `
    चर i = ०;
    यावत् (i < १०) {
        i++;
        यदि (i === ३) {
            जारी;
        }
        यदि (i === ६) {
            तोड़;
        }
        मुद्रण(i);
    }
    `;
    const out = execute(code);
    assert.deepEqual(out, ['१', '२', '४', '५']);
});

test('Interpreter: executes for loop', () => {
    const code = `
    पुनः (चर i = १; i <= ३; i++) {
        मुद्रण(i);
    }
    `;
    const out = execute(code);
    assert.deepEqual(out, ['१', '२', '३']);
});

test('Interpreter: executes recursive functions', () => {
    const code = `
    कार्य गुणनखंड(n) {
        यदि (n <= १) {
            प्रत्यागम १;
        }
        प्रत्यागम n * गुणनखंड(n - १);
    }
    मुद्रण(गुणनखंड(५));
    `;
    const out = execute(code);
    assert.deepEqual(out, ['१२०']);
});

test('Interpreter: supports arrays and objects manipulation', () => {
    const code = `
    चर सूची = [१०, २०, ३०];
    सूची[१] = ९९;
    मुद्रण(सूची[१]);

    चर वस्तु = { नाम: "सीता", आयु: २५ };
    वस्तु.आयु = २६;
    मुद्रण(वस्तु.आयु);
    `;
    const out = execute(code);
    assert.deepEqual(out, ['९९', '२६']);
});
