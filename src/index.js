// Sanskrit Programming Language
// Top-Level Public API

const AST = require('./ast');
const LexerModule = require('./lexer');
const ParserModule = require('./parser');
const Runtime = require('./runtime');
const VM = require('./vm');
const Diagnostics = require('./diagnostics/errors');
const { Compiler } = require('./compiler');

module.exports = {
    // Core compiler & execution
    Compiler,
    Sanskrit: Compiler,
    VM,
    ...AST,
    ...LexerModule,
    ...ParserModule,
    ...Runtime,
    ...Diagnostics
};
