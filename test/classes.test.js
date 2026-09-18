const test = require('node:test');
const assert = require('node:assert/strict');
const { Lexer } = require('../src/lexer');
const { Parser } = require('../src/parser');
const { Interpreter } = require('../src/runtime');

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

test('Classes: basic class declaration, instantiation with नया, and method execution', () => {
    // Exact canonical example from Requirement 10
    const code = `
    वर्ग व्यक्ति {
        निर्माण(नाम) {
            स्व.नाम = नाम;
        }
        कार्य परिचय() {
            मुद्रण(स्व.नाम);
        }
    }
    चर राम = नया व्यक्ति("राम");
    राम.परिचय();
    `;
    const out = execute(code);
    assert.deepEqual(out, ['राम']);
});

test('Classes: inheritance, method overriding, and सुपर constructor call', () => {
    const code = `
    वर्ग पशु {
        निर्माण(नाम) {
            स्व.नाम = नाम;
        }
        कार्य आवाज() {
            मुद्रण(स्व.नाम, "आवाज करता है");
        }
    }

    वर्ग कुत्ता विस्तार पशु {
        निर्माण(नाम, नस्ल) {
            सुपर(नाम);
            स्व.नस्ल = नस्ल;
        }
        कार्य आवाज() {
            मुद्रण(स्व.नाम, "भौंकता है");
        }
    }

    चर टॉमी = नया कुत्ता("टॉमी", "लैब्राडोर");
    टॉमी.आवाज();
    मुद्रण("नस्ल:", टॉमी.नस्ल);
    `;
    const out = execute(code);
    assert.deepEqual(out, ['टॉमी भौंकता है', 'नस्ल: लैब्राडोर']);
});

test('Classes: static method execution', () => {
    const code = `
    वर्ग गणित_उपयोग {
        स्थैतिक कार्य दोगुना(x) {
            प्रत्यागम x * २;
        }
    }

    मुद्रण(गणित_उपयोग.दोगुना(२१));
    `;
    const out = execute(code);
    assert.deepEqual(out, ['४२']);
});
