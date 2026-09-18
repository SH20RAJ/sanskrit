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

test('Closures: closure observes mutation of outer variable', () => {
    // The exact canonical test case specified in Requirement 7
    const code = `
    चर x = १०;
    कार्य पढ़ो() {
        प्रत्यागम x;
    }
    x = २०;
    मुद्रण(पढ़ो());
    `;
    const out = execute(code);
    assert.deepEqual(out, ['२०']);
});

test('Closures: counter generator maintains its own independent state', () => {
    const code = `
    कार्य गणक_बनाओ() {
        चर गणना = ०;
        कार्य अगला() {
            गणना++;
            प्रत्यागम गणना;
        }
        प्रत्यागम अगला;
    }

    चर गणक१ = गणक_बनाओ();
    मुद्रण(गणक१());
    मुद्रण(गणक१());

    चर गणक२ = गणक_बनाओ();
    मुद्रण(गणक२());
    मुद्रण(गणक१());
    `;
    const out = execute(code);
    assert.deepEqual(out, ['१', '२', '१', '३']);
});

test('Closures: nested functions access parent scopes', () => {
    const code = `
    चर a = "स्तर१";
    कार्य स्तर_एक() {
        चर b = "स्तर२";
        कार्य स्तर_दो() {
            चर c = "स्तर३";
            कार्य स्तर_तीन() {
                प्रत्यागम a + " " + b + " " + c;
            }
            प्रत्यागम स्तर_तीन();
        }
        प्रत्यागम स्तर_दो();
    }
    मुद्रण(स्तर_एक());
    `;
    const out = execute(code);
    assert.deepEqual(out, ['स्तर१ स्तर२ स्तर३']);
});
