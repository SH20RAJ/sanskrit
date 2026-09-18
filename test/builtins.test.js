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

test('Built-ins: लंबाई (length) for arrays, strings, and objects', () => {
    const code = `
    मुद्रण(लंबाई("संस्कृत"));
    मुद्रण(लंबाई([१, २, ३, ४]));
    मुद्रण(लंबाई({ क: १, ख: २, ग: ३ }));
    `;
    const out = execute(code);
    assert.deepEqual(out, ['७', '४', '३']);
});

test('Built-ins: प्रकार (typeof) for all language types', () => {
    const code = `
    मुद्रण(प्रकार(४२));
    मुद्रण(प्रकार("नमस्ते"));
    मुद्रण(प्रकार(सत्य));
    मुद्रण(प्रकार([१, २]));
    मुद्रण(प्रकार({}));
    मुद्रण(प्रकार(शून्य));
    मुद्रण(प्रकार(अपरिभाषित));
    `;
    const out = execute(code);
    assert.deepEqual(out, [
        'संख्या',
        'स्ट्रिंग',
        'बूलियन',
        'सूची',
        'वस्तु',
        'शून्य',
        'अपरिभाषित'
    ]);
});

test('Built-ins: पार्स_संख्या and type conversions', () => {
    const code = `
    मुद्रण(पार्स_संख्या("१२३"));
    मुद्रण(संख्या("४५६"));
    मुद्रण(बूलियन(१));
    मुद्रण(बूलियन(०));
    `;
    const out = execute(code);
    assert.deepEqual(out, ['१२३', '४५६', 'सत्य', 'असत्य']);
});

test('Built-ins: math utilities', () => {
    const code = `
    मुद्रण(गणित_वर्ग(१६));
    मुद्रण(गणित_शक्ति(२, ३));
    मुद्रण(गणित_न्यूनतम(१०, ५, २०));
    मुद्रण(गणित_अधिकतम(१०, ५, २०));
    मुद्रण(गणित_पूर्णांक(३.७));
    `;
    const out = execute(code);
    assert.deepEqual(out, ['४', '८', '५', '२०', '३']);
});
