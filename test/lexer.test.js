const test = require('node:test');
const assert = require('node:assert/strict');
const { Lexer, TokenTypes } = require('../src/lexer');
const { LexerError } = require('../src/diagnostics/errors');

test('Lexer: tokenizes basic identifiers and keywords', () => {
    const code = 'चर नाम = "राम"; स्थिर पाई = ३.१४;';
    const lexer = new Lexer(code);
    const tokens = lexer.getAllTokens();

    assert.equal(tokens[0].type, TokenTypes.KEYWORD);
    assert.equal(tokens[0].value, 'चर');

    assert.equal(tokens[1].type, TokenTypes.IDENTIFIER);
    assert.equal(tokens[1].value, 'नाम');

    assert.equal(tokens[2].type, TokenTypes.OPERATOR);
    assert.equal(tokens[2].value, '=');

    assert.equal(tokens[3].type, TokenTypes.STRING);
    assert.equal(tokens[3].value, 'राम');

    assert.equal(tokens[4].type, TokenTypes.DELIMITER);
    assert.equal(tokens[4].value, ';');

    assert.equal(tokens[5].type, TokenTypes.KEYWORD);
    assert.equal(tokens[5].value, 'स्थिर');

    assert.equal(tokens[6].type, TokenTypes.IDENTIFIER);
    assert.equal(tokens[6].value, 'पाई');

    assert.equal(tokens[8].type, TokenTypes.NUMBER);
    assert.equal(tokens[8].value, 3.14);
});

test('Lexer: converts Devanagari numerals accurately', () => {
    const code = '० १० २५ १०० १०००';
    const lexer = new Lexer(code);
    const tokens = lexer.getAllTokens().filter(t => t.type === TokenTypes.NUMBER);

    assert.deepEqual(tokens.map(t => t.value), [0, 10, 25, 100, 1000]);
});

test('Lexer: correctly tokenizes multi-character comparison operators', () => {
    const code = 'a === b !== c == d != e <= f >= g && h || i ** j += k';
    const lexer = new Lexer(code);
    const opTokens = lexer.getAllTokens().filter(t => t.type === TokenTypes.OPERATOR);

    const ops = opTokens.map(t => t.value);
    assert.deepEqual(ops, [
        '===', '!==', '==', '!=', '<=', '>=', '&&', '||', '**', '+='
    ]);
});

test('Lexer: tokenizes dot delimiter for member access', () => {
    const code = 'व्यक्ति.नाम';
    const lexer = new Lexer(code);
    const tokens = lexer.getAllTokens();

    assert.equal(tokens[0].value, 'व्यक्ति');
    assert.equal(tokens[1].type, TokenTypes.DELIMITER);
    assert.equal(tokens[1].value, '.');
    assert.equal(tokens[2].value, 'नाम');
});

test('Lexer: handles string escape sequences', () => {
    const code = '"नमस्ते\\nविश्व\\t\\"संस्कृत\\""';
    const lexer = new Lexer(code);
    const token = lexer.getNextToken();

    assert.equal(token.type, TokenTypes.STRING);
    assert.equal(token.value, 'नमस्ते\nविश्व\t"संस्कृत"');
});

test('Lexer: skips single-line and multi-line comments', () => {
    const code = `
    // single line
    चर a = १;
    /* multi
       line */
    चर b = २;
    `;
    const lexer = new Lexer(code);
    const tokens = lexer.getAllTokens().filter(t => t.type !== TokenTypes.EOF);

    assert.equal(tokens.length, 10); // चर a = 1 ; चर b = 2 ;
});

test('Lexer: reports error on unterminated string', () => {
    const code = 'चर str = "unterminated;';
    const lexer = new Lexer(code, 'test.sns');

    assert.throws(() => {
        lexer.getAllTokens();
    }, LexerError);
});

test('Lexer: reports error on unterminated block comment', () => {
    const code = '/* unfinished comment';
    const lexer = new Lexer(code, 'test.sns');

    assert.throws(() => {
        lexer.getAllTokens();
    }, LexerError);
});

test('Lexer: reports error on invalid number format (multiple decimal points)', () => {
    const code = 'चर num = १.२.३;';
    const lexer = new Lexer(code, 'test.sns');

    assert.throws(() => {
        lexer.getAllTokens();
    }, LexerError);
});
