const test = require('node:test');
const assert = require('node:assert/strict');
const { Lexer } = require('../src/lexer');
const { Parser } = require('../src/parser');
const { NodeTypes } = require('../src/ast');
const { ParserError } = require('../src/diagnostics/errors');

function parseCode(code) {
    const lexer = new Lexer(code, 'test.sns');
    const parser = new Parser(lexer, 'test.sns');
    return parser.parse();
}

test('Parser: parses variable declarations and constants', () => {
    const ast = parseCode('चर x = १०; स्थिर y = २०;');
    assert.equal(ast.body.length, 2);

    const varDecl = ast.body[0];
    assert.equal(varDecl.type, NodeTypes.VARIABLE_DECLARATION);
    assert.equal(varDecl.id.name, 'x');
    assert.equal(varDecl.init.value, 10);
    assert.equal(varDecl.isConstant, false);

    const constDecl = ast.body[1];
    assert.equal(constDecl.type, NodeTypes.VARIABLE_DECLARATION);
    assert.equal(constDecl.id.name, 'y');
    assert.equal(constDecl.init.value, 20);
    assert.equal(constDecl.isConstant, true);
});

test('Parser: parses function declarations with parameters', () => {
    const ast = parseCode('कार्य योग(क, ख) { प्रत्यागम क + ख; }');
    assert.equal(ast.body.length, 1);

    const fn = ast.body[0];
    assert.equal(fn.type, NodeTypes.FUNCTION_DECLARATION);
    assert.equal(fn.id.name, 'योग');
    assert.equal(fn.params.length, 2);
    assert.equal(fn.params[0].name, 'क');
    assert.equal(fn.params[1].name, 'ख');
    assert.equal(fn.body.type, NodeTypes.BLOCK_STATEMENT);
});

test('Parser: parses class declarations with constructor and methods', () => {
    const code = `
    वर्ग व्यक्ति {
        निर्माण(नाम) {
            स्व.नाम = नाम;
        }
        कार्य परिचय() {
            मुद्रण(स्व.नाम);
        }
    }
    `;
    const ast = parseCode(code);
    assert.equal(ast.body.length, 1);

    const cls = ast.body[0];
    assert.equal(cls.type, NodeTypes.CLASS_DECLARATION);
    assert.equal(cls.id.name, 'व्यक्ति');
    assert.equal(cls.body.length, 2);

    const ctor = cls.body[0];
    assert.equal(ctor.isConstructor, true);
    assert.equal(ctor.params.length, 1);

    const method = cls.body[1];
    assert.equal(method.isConstructor, false);
    assert.equal(method.id.name, 'परिचय');
});

test('Parser: parses operator precedence correctly', () => {
    // 2 + 3 * 4 should be 2 + (3 * 4)
    const ast = parseCode('चर r = २ + ३ * ४;');
    const init = ast.body[0].init;

    assert.equal(init.type, NodeTypes.BINARY_EXPRESSION);
    assert.equal(init.operator, '+');
    assert.equal(init.left.value, 2);
    assert.equal(init.right.type, NodeTypes.BINARY_EXPRESSION);
    assert.equal(init.right.operator, '*');
    assert.equal(init.right.left.value, 3);
    assert.equal(init.right.right.value, 4);
});

test('Parser: parses if-else conditionals', () => {
    const code = 'यदि (x > ०) { मुद्रण("धनात्मक"); } अन्यथा { मुद्रण("ऋणात्मक"); }';
    const ast = parseCode(code);

    const ifStmt = ast.body[0];
    assert.equal(ifStmt.type, NodeTypes.IF_STATEMENT);
    assert.equal(ifStmt.test.operator, '>');
    assert.ok(ifStmt.consequent);
    assert.ok(ifStmt.alternate);
});

test('Parser: parses try-catch-finally statements', () => {
    const code = 'प्रयत्न { फेंक "त्रुटि"; } पकड़ (err) { मुद्रण(err); } अंततः { मुद्रण("done"); }';
    const ast = parseCode(code);

    const tryStmt = ast.body[0];
    assert.equal(tryStmt.type, NodeTypes.TRY_STATEMENT);
    assert.ok(tryStmt.block);
    assert.equal(tryStmt.handler.param.name, 'err');
    assert.ok(tryStmt.finalizer);
});

test('Parser: throws ParserError on malformed syntax', () => {
    assert.throws(() => {
        parseCode('कार्य (invalid) { }');
    }, ParserError);
});
