// Sanskrit Browser Runtime Bundle (Self-contained)
(function(global) {
    const modules = {};
    const moduleCache = {};

    function define(id, factory) {
        modules[id] = factory;
    }

    function requireModule(currentPath, relativePath) {
        let target = relativePath;
        if (target.startsWith('.')) {
            const dir = pathDirname(currentPath);
            target = pathNormalize(dir + '/' + target);
        }

        const candidates = [
            target,
            target + '.js',
            target + '/index.js'
        ];

        let found = null;
        for (const cand of candidates) {
            if (modules[cand]) {
                found = cand;
                break;
            }
        }

        if (!found) {
            throw new Error('Cannot find module: ' + relativePath + ' from ' + currentPath);
        }

        if (moduleCache[found]) {
            return moduleCache[found].exports;
        }

        const module = { exports: {} };
        moduleCache[found] = module;
        modules[found](function(reqPath) {
            return requireModule(found, reqPath);
        }, module, module.exports);

        return module.exports;
    }

    function pathDirname(p) {
        const parts = p.split('/');
        parts.pop();
        return parts.join('/');
    }

    function pathNormalize(p) {
        const parts = p.split('/');
        const res = [];
        for (const part of parts) {
            if (part === '' || part === '.') continue;
            if (part === '..') {
                res.pop();
            } else {
                res.push(part);
            }
        }
        return res.join('/');
    }

    define('src/ast/node-types.js', function(require, module, exports) {
// Canonical AST Node Types for Sanskrit Language

const NodeTypes = {
    // Root & Identifiers
    PROGRAM: 'Program',
    IDENTIFIER: 'Identifier',

    // Literals
    NUMERIC_LITERAL: 'NumericLiteral',
    STRING_LITERAL: 'StringLiteral',
    BOOLEAN_LITERAL: 'BooleanLiteral',
    NULL_LITERAL: 'NullLiteral',
    UNDEFINED_LITERAL: 'UndefinedLiteral',
    ARRAY_LITERAL: 'ArrayLiteral',
    OBJECT_LITERAL: 'ObjectLiteral',
    PROPERTY: 'Property',

    // Declarations & Statements
    VARIABLE_DECLARATION: 'VariableDeclaration',
    FUNCTION_DECLARATION: 'FunctionDeclaration',
    BLOCK_STATEMENT: 'BlockStatement',
    EXPRESSION_STATEMENT: 'ExpressionStatement',
    IF_STATEMENT: 'IfStatement',
    WHILE_STATEMENT: 'WhileStatement',
    FOR_STATEMENT: 'ForStatement',
    FOR_EACH_STATEMENT: 'ForEachStatement',
    RETURN_STATEMENT: 'ReturnStatement',
    BREAK_STATEMENT: 'BreakStatement',
    CONTINUE_STATEMENT: 'ContinueStatement',

    // Exceptions
    TRY_STATEMENT: 'TryStatement',
    CATCH_CLAUSE: 'CatchClause',
    THROW_STATEMENT: 'ThrowStatement',

    // Classes & OOP
    CLASS_DECLARATION: 'ClassDeclaration',
    METHOD_DECLARATION: 'MethodDeclaration',
    NEW_EXPRESSION: 'NewExpression',
    THIS_EXPRESSION: 'ThisExpression',
    SUPER_EXPRESSION: 'SuperExpression',

    // Expressions
    CALL_EXPRESSION: 'CallExpression',
    MEMBER_EXPRESSION: 'MemberExpression',
    ASSIGNMENT_EXPRESSION: 'AssignmentExpression',
    BINARY_EXPRESSION: 'BinaryExpression',
    LOGICAL_EXPRESSION: 'LogicalExpression',
    UNARY_EXPRESSION: 'UnaryExpression',
    UPDATE_EXPRESSION: 'UpdateExpression',

    // Pythonic & Functional Extensions
    SLICE_EXPRESSION: 'SliceExpression',
    COMPREHENSION: 'Comprehension',
    ARROW_FUNCTION: 'ArrowFunction',
    CONDITIONAL_EXPRESSION: 'ConditionalExpression'
};

module.exports = { NodeTypes };

    });

    define('src/ast/nodes.js', function(require, module, exports) {
// Sanskrit Language Canonical AST Nodes
const { NodeTypes } = require('./node-types');

class ASTNode {
    constructor(type, loc = null) {
        this.type = type;
        this.loc = loc;
    }
}

class ProgramNode extends ASTNode {
    constructor(body = [], loc = null) {
        super(NodeTypes.PROGRAM, loc);
        this.body = body;
    }
}

class IdentifierNode extends ASTNode {
    constructor(name, loc = null) {
        super(NodeTypes.IDENTIFIER, loc);
        this.name = name;
    }
}

class NumericLiteralNode extends ASTNode {
    constructor(value, raw = '', loc = null) {
        super(NodeTypes.NUMERIC_LITERAL, loc);
        this.value = value;
        this.raw = raw;
    }
}

class StringLiteralNode extends ASTNode {
    constructor(value, raw = '', loc = null) {
        super(NodeTypes.STRING_LITERAL, loc);
        this.value = value;
        this.raw = raw;
    }
}

class BooleanLiteralNode extends ASTNode {
    constructor(value, loc = null) {
        super(NodeTypes.BOOLEAN_LITERAL, loc);
        this.value = Boolean(value);
    }
}

class NullLiteralNode extends ASTNode {
    constructor(loc = null) {
        super(NodeTypes.NULL_LITERAL, loc);
        this.value = null;
    }
}

class UndefinedLiteralNode extends ASTNode {
    constructor(loc = null) {
        super(NodeTypes.UNDEFINED_LITERAL, loc);
        this.value = undefined;
    }
}

class ArrayLiteralNode extends ASTNode {
    constructor(elements = [], loc = null) {
        super(NodeTypes.ARRAY_LITERAL, loc);
        this.elements = elements;
    }
}

class PropertyNode extends ASTNode {
    constructor(key, value, loc = null) {
        super(NodeTypes.PROPERTY, loc);
        this.key = key;
        this.value = value;
    }
}

class ObjectLiteralNode extends ASTNode {
    constructor(properties = [], loc = null) {
        super(NodeTypes.OBJECT_LITERAL, loc);
        this.properties = properties;
    }
}

class VariableDeclarationNode extends ASTNode {
    constructor(id, init = null, isConstant = false, loc = null) {
        super(NodeTypes.VARIABLE_DECLARATION, loc);
        this.id = id;
        this.init = init;
        this.isConstant = isConstant;
    }
}

class FunctionDeclarationNode extends ASTNode {
    constructor(id, params = [], body = null, loc = null) {
        super(NodeTypes.FUNCTION_DECLARATION, loc);
        this.id = id;
        this.params = params;
        this.body = body;
    }
}

class BlockStatementNode extends ASTNode {
    constructor(body = [], loc = null) {
        super(NodeTypes.BLOCK_STATEMENT, loc);
        this.body = body;
    }
}

class ExpressionStatementNode extends ASTNode {
    constructor(expression, loc = null) {
        super(NodeTypes.EXPRESSION_STATEMENT, loc);
        this.expression = expression;
    }
}

class IfStatementNode extends ASTNode {
    constructor(test, consequent, alternate = null, loc = null) {
        super(NodeTypes.IF_STATEMENT, loc);
        this.test = test;
        this.consequent = consequent;
        this.alternate = alternate;
    }
}

class WhileStatementNode extends ASTNode {
    constructor(test, body, loc = null) {
        super(NodeTypes.WHILE_STATEMENT, loc);
        this.test = test;
        this.body = body;
    }
}

class ForStatementNode extends ASTNode {
    constructor(init, test, update, body, loc = null) {
        super(NodeTypes.FOR_STATEMENT, loc);
        this.init = init;
        this.test = test;
        this.update = update;
        this.body = body;
    }
}

class ForEachStatementNode extends ASTNode {
    constructor(left, right, body, loc = null) {
        super(NodeTypes.FOR_EACH_STATEMENT, loc);
        this.left = left;
        this.right = right;
        this.body = body;
    }
}

class ReturnStatementNode extends ASTNode {
    constructor(argument = null, loc = null) {
        super(NodeTypes.RETURN_STATEMENT, loc);
        this.argument = argument;
    }
}

class BreakStatementNode extends ASTNode {
    constructor(loc = null) {
        super(NodeTypes.BREAK_STATEMENT, loc);
    }
}

class ContinueStatementNode extends ASTNode {
    constructor(loc = null) {
        super(NodeTypes.CONTINUE_STATEMENT, loc);
    }
}

class TryStatementNode extends ASTNode {
    constructor(block, handler = null, finalizer = null, loc = null) {
        super(NodeTypes.TRY_STATEMENT, loc);
        this.block = block;
        this.handler = handler;
        this.finalizer = finalizer;
    }
}

class CatchClauseNode extends ASTNode {
    constructor(param, body, loc = null) {
        super(NodeTypes.CATCH_CLAUSE, loc);
        this.param = param;
        this.body = body;
    }
}

class ThrowStatementNode extends ASTNode {
    constructor(argument, loc = null) {
        super(NodeTypes.THROW_STATEMENT, loc);
        this.argument = argument;
    }
}

class ClassDeclarationNode extends ASTNode {
    constructor(id, superClass = null, body = [], loc = null) {
        super(NodeTypes.CLASS_DECLARATION, loc);
        this.id = id;
        this.superClass = superClass;
        this.body = body;
    }
}

class MethodDeclarationNode extends ASTNode {
    constructor(id, params = [], body = null, isConstructor = false, isStatic = false, modifiers = [], loc = null) {
        super(NodeTypes.METHOD_DECLARATION, loc);
        this.id = id;
        this.params = params;
        this.body = body;
        this.isConstructor = isConstructor;
        this.isStatic = isStatic;
        this.modifiers = modifiers;
    }
}

class NewExpressionNode extends ASTNode {
    constructor(callee, args = [], loc = null) {
        super(NodeTypes.NEW_EXPRESSION, loc);
        this.callee = callee;
        this.arguments = args;
    }
}

class CallExpressionNode extends ASTNode {
    constructor(callee, args = [], loc = null) {
        super(NodeTypes.CALL_EXPRESSION, loc);
        this.callee = callee;
        this.arguments = args;
    }
}

class MemberExpressionNode extends ASTNode {
    constructor(object, property, computed = false, loc = null) {
        super(NodeTypes.MEMBER_EXPRESSION, loc);
        this.object = object;
        this.property = property;
        this.computed = computed;
    }
}

class ThisExpressionNode extends ASTNode {
    constructor(loc = null) {
        super(NodeTypes.THIS_EXPRESSION, loc);
    }
}

class SuperExpressionNode extends ASTNode {
    constructor(loc = null) {
        super(NodeTypes.SUPER_EXPRESSION, loc);
    }
}

class AssignmentExpressionNode extends ASTNode {
    constructor(operator, left, right, loc = null) {
        super(NodeTypes.ASSIGNMENT_EXPRESSION, loc);
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
}

class BinaryExpressionNode extends ASTNode {
    constructor(operator, left, right, loc = null) {
        super(NodeTypes.BINARY_EXPRESSION, loc);
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
}

class LogicalExpressionNode extends ASTNode {
    constructor(operator, left, right, loc = null) {
        super(NodeTypes.LOGICAL_EXPRESSION, loc);
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
}

class UnaryExpressionNode extends ASTNode {
    constructor(operator, argument, prefix = true, loc = null) {
        super(NodeTypes.UNARY_EXPRESSION, loc);
        this.operator = operator;
        this.argument = argument;
        this.prefix = prefix;
    }
}

class UpdateExpressionNode extends ASTNode {
    constructor(operator, argument, prefix = false, loc = null) {
        super(NodeTypes.UPDATE_EXPRESSION, loc);
        this.operator = operator;
        this.argument = argument;
        this.prefix = prefix;
    }
}

class SliceExpressionNode extends ASTNode {
    constructor(start = null, stop = null, step = null, loc = null) {
        super(NodeTypes.SLICE_EXPRESSION, loc);
        this.start = start;
        this.stop = stop;
        this.step = step;
    }
}

class ComprehensionNode extends ASTNode {
    constructor(expression, variable, collection, filterCondition = null, loc = null) {
        super(NodeTypes.COMPREHENSION, loc);
        this.expression = expression;
        this.variable = variable;
        this.collection = collection;
        this.filterCondition = filterCondition;
    }
}

class ArrowFunctionNode extends ASTNode {
    constructor(params = [], body = null, isExpressionBody = true, loc = null) {
        super(NodeTypes.ARROW_FUNCTION, loc);
        this.params = params;
        this.body = body;
        this.isExpressionBody = isExpressionBody;
    }
}

class ConditionalExpressionNode extends ASTNode {
    constructor(test, consequent, alternate, loc = null) {
        super(NodeTypes.CONDITIONAL_EXPRESSION, loc);
        this.test = test;
        this.consequent = consequent;
        this.alternate = alternate;
    }
}

module.exports = {
    ASTNode,
    ProgramNode,
    IdentifierNode,
    NumericLiteralNode,
    StringLiteralNode,
    BooleanLiteralNode,
    NullLiteralNode,
    UndefinedLiteralNode,
    ArrayLiteralNode,
    PropertyNode,
    ObjectLiteralNode,
    VariableDeclarationNode,
    FunctionDeclarationNode,
    BlockStatementNode,
    ExpressionStatementNode,
    IfStatementNode,
    WhileStatementNode,
    ForStatementNode,
    ForEachStatementNode,
    ReturnStatementNode,
    BreakStatementNode,
    ContinueStatementNode,
    TryStatementNode,
    CatchClauseNode,
    ThrowStatementNode,
    ClassDeclarationNode,
    MethodDeclarationNode,
    NewExpressionNode,
    CallExpressionNode,
    MemberExpressionNode,
    ThisExpressionNode,
    SuperExpressionNode,
    AssignmentExpressionNode,
    BinaryExpressionNode,
    LogicalExpressionNode,
    UnaryExpressionNode,
    UpdateExpressionNode,
    SliceExpressionNode,
    ComprehensionNode,
    ArrowFunctionNode,
    ConditionalExpressionNode
};

    });

    define('src/ast/index.js', function(require, module, exports) {
// Sanskrit Language AST Exports
const { NodeTypes } = require('./node-types');
const Nodes = require('./nodes');

module.exports = {
    NodeTypes,
    ...Nodes
};

    });

    define('src/diagnostics/errors.js', function(require, module, exports) {
// Sanskrit Programming Language Diagnostics & Errors
// Standardized error representations with source snippets and caret pointers.

class SanskritError extends Error {
    constructor(message, options = {}) {
        super(message);
        this.name = options.name || 'SanskritError';
        this.code = options.code || 'E0000';
        this.line = options.line || 1;
        this.column = options.column || 1;
        this.filename = options.filename || '<anonymous>';
        this.sourceCode = options.sourceCode || null;
        this.hint = options.hint || null;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, SanskritError);
        }
    }

    format() {
        let output = `[त्रुटि ${this.code}] ${this.name}: ${this.message}\n`;
        output += `  --> ${this.filename}:${this.line}:${this.column}`;

        if (this.sourceCode) {
            const lines = this.sourceCode.split('\n');
            const lineIdx = this.line - 1;
            if (lineIdx >= 0 && lineIdx < lines.length) {
                const targetLine = lines[lineIdx];
                const lineNumStr = String(this.line).padStart(4, ' ');
                output += `\n${lineNumStr} | ${targetLine}\n`;
                const indent = ' '.repeat(lineNumStr.length + 3 + Math.max(0, this.column - 1));
                output += `${indent}^`;
            }
        }

        if (this.hint) {
            output += `\n  संकेत (Hint): ${this.hint}`;
        }

        return output;
    }
}

class LexerError extends SanskritError {
    constructor(message, options = {}) {
        super(message, {
            name: 'LexerError',
            code: options.code || 'E1001',
            ...options
        });
    }
}

class ParserError extends SanskritError {
    constructor(message, options = {}) {
        super(message, {
            name: 'ParserError',
            code: options.code || 'E2001',
            ...options
        });
    }
}

class RuntimeError extends SanskritError {
    constructor(message, options = {}) {
        super(message, {
            name: 'RuntimeError',
            code: options.code || 'E3001',
            ...options
        });
    }
}

class NameError extends RuntimeError {
    constructor(message, options = {}) {
        super(message, {
            name: 'NameError',
            code: 'E3002',
            ...options
        });
    }
}

class TypeError extends RuntimeError {
    constructor(message, options = {}) {
        super(message, {
            name: 'TypeError',
            code: 'E3003',
            ...options
        });
    }
}

class ConstantError extends RuntimeError {
    constructor(message, options = {}) {
        super(message, {
            name: 'ConstantError',
            code: 'E3004',
            ...options
        });
    }
}

module.exports = {
    SanskritError,
    LexerError,
    ParserError,
    RuntimeError,
    NameError,
    TypeError,
    ConstantError
};

    });

    define('src/lexer/tokens.js', function(require, module, exports) {
// Sanskrit Language Token Definitions and Keywords

const TokenTypes = {
    KEYWORD: 'KEYWORD',
    IDENTIFIER: 'IDENTIFIER',
    NUMBER: 'NUMBER',
    STRING: 'STRING',
    OPERATOR: 'OPERATOR',
    DELIMITER: 'DELIMITER',
    EOF: 'EOF'
};

// Sanskrit Language Keywords with English equivalents & meanings
const Keywords = new Map([
    // Declarations
    ['कार्य', { english: 'function', category: 'declaration', description: 'Function declaration' }],
    ['चर', { english: 'var/let', category: 'declaration', description: 'Mutable variable declaration' }],
    ['स्थिर', { english: 'const', category: 'declaration', description: 'Constant variable declaration' }],

    // Object-Oriented Programming
    ['वर्ग', { english: 'class', category: 'oop', description: 'Class declaration' }],
    ['विस्तार', { english: 'extends', category: 'oop', description: 'Class inheritance' }],
    ['निर्माण', { english: 'constructor', category: 'oop', description: 'Class constructor method' }],
    ['स्व', { english: 'this', category: 'oop', description: 'Current instance reference' }],
    ['सुपर', { english: 'super', category: 'oop', description: 'Parent class reference' }],
    ['स्थैतिक', { english: 'static', category: 'oop', description: 'Static class method/property' }],
    ['नया', { english: 'new', category: 'oop', description: 'Instantiate class' }],

    // Control Flow
    ['यदि', { english: 'if', category: 'control_flow', description: 'Conditional statement' }],
    ['अन्यथा', { english: 'else', category: 'control_flow', description: 'Alternative branch' }],
    ['यावत्', { english: 'while', category: 'control_flow', description: 'While loop' }],
    ['पुनः', { english: 'for', category: 'control_flow', description: 'For loop' }],
    ['प्रत्येक', { english: 'foreach', category: 'control_flow', description: 'For-each iteration' }],
    ['में', { english: 'in', category: 'control_flow', description: 'In collection' }],
    ['का', { english: 'of', category: 'control_flow', description: 'Of collection' }],
    ['स्विच', { english: 'switch', category: 'control_flow', description: 'Switch statement' }],
    ['केस', { english: 'case', category: 'control_flow', description: 'Switch case branch' }],
    ['डिफ़ॉल्ट', { english: 'default', category: 'control_flow', description: 'Default case branch' }],
    ['तोड़', { english: 'break', category: 'control_flow', description: 'Break loop/switch' }],
    ['जारी', { english: 'continue', category: 'control_flow', description: 'Continue loop' }],
    ['प्रत्यागम', { english: 'return', category: 'control_flow', description: 'Return value from function' }],

    // Error Handling
    ['प्रयत्न', { english: 'try', category: 'error_handling', description: 'Try block' }],
    ['पकड़', { english: 'catch', category: 'error_handling', description: 'Catch error block' }],
    ['अंततः', { english: 'finally', category: 'error_handling', description: 'Finally block' }],
    ['फेंक', { english: 'throw', category: 'error_handling', description: 'Throw error' }],

    // Literal Keywords
    ['सत्य', { english: 'true', category: 'literal', description: 'Boolean true' }],
    ['असत्य', { english: 'false', category: 'literal', description: 'Boolean false' }],
    ['शून्य', { english: 'null', category: 'literal', description: 'Null literal' }],
    ['अपरिभाषित', { english: 'undefined', category: 'literal', description: 'Undefined literal' }],

    // Logical Operators as Keywords
    ['और', { english: 'and', category: 'operator', description: 'Logical AND (&&)' }],
    ['या', { english: 'or', category: 'operator', description: 'Logical OR (||)' }],
    ['नहीं', { english: 'not', category: 'operator', description: 'Logical NOT (!)' }]
]);

class Token {
    constructor(type, value, line, column, raw = value) {
        this.type = type;
        this.value = value;
        this.line = line;
        this.column = column;
        this.raw = raw;
    }

    toString() {
        return `Token(${this.type}, ${JSON.stringify(this.value)}, line: ${this.line}, col: ${this.column})`;
    }
}

module.exports = {
    TokenTypes,
    Keywords,
    Token
};

    });

    define('src/lexer/lexer.js', function(require, module, exports) {
// Sanskrit Language Lexer (Unicode-safe, Devanagari-aware)
const { TokenTypes, Keywords, Token } = require('./tokens');
const { LexerError } = require('../diagnostics/errors');

class Lexer {
    constructor(input, filename = '<anonymous>') {
        this.input = String(input);
        this.filename = filename;
        this.position = 0;
        this.line = 1;
        this.column = 1;
        this.currentChar = this.input.length > 0 ? this.input[0] : null;
    }

    advance() {
        if (this.currentChar === '\n') {
            this.line++;
            this.column = 1;
        } else {
            this.column++;
        }
        this.position++;
        this.currentChar = this.position < this.input.length ? this.input[this.position] : null;
    }

    peek(offset = 1) {
        const targetPos = this.position + offset;
        return targetPos < this.input.length ? this.input[targetPos] : null;
    }

    getState() {
        return {
            position: this.position,
            line: this.line,
            column: this.column,
            currentChar: this.currentChar
        };
    }

    setState(state) {
        this.position = state.position;
        this.line = state.line;
        this.column = state.column;
        this.currentChar = state.currentChar;
    }

    skipWhitespace() {
        while (this.currentChar && /\s/.test(this.currentChar)) {
            this.advance();
        }
    }

    skipComment() {
        const startLine = this.line;
        const startColumn = this.column;

        if (this.currentChar === '/' && this.peek() === '/') {
            // Single-line comment
            while (this.currentChar && this.currentChar !== '\n') {
                this.advance();
            }
            if (this.currentChar === '\n') {
                this.advance();
            }
        } else if (this.currentChar === '/' && this.peek() === '*') {
            // Multi-line block comment
            this.advance(); // consume '/'
            this.advance(); // consume '*'

            while (this.currentChar && !(this.currentChar === '*' && this.peek() === '/')) {
                this.advance();
            }

            if (!this.currentChar) {
                throw new LexerError('Unterminated block comment', {
                    filename: this.filename,
                    line: startLine,
                    column: startColumn,
                    sourceCode: this.input,
                    hint: 'Close comment with */'
                });
            }

            this.advance(); // consume '*'
            this.advance(); // consume '/'
        }
    }

    readNumber() {
        const startLine = this.line;
        const startColumn = this.column;
        let raw = '';
        let hasDecimal = false;

        while (this.currentChar && /[\d०-९.]/.test(this.currentChar)) {
            if (this.currentChar === '.') {
                if (hasDecimal) {
                    throw new LexerError('Invalid number format: multiple decimal points', {
                        filename: this.filename,
                        line: startLine,
                        column: startColumn,
                        sourceCode: this.input,
                        hint: 'A number can only contain one decimal point'
                    });
                }
                // Check if the character after '.' is a digit
                const next = this.peek();
                if (!next || !/[\d०-९]/.test(next)) {
                    // It's a member access dot immediately following a number (e.g., 5.toString())
                    break;
                }
                hasDecimal = true;
            }
            raw += this.currentChar;
            this.advance();
        }

        // Convert Devanagari digits (०-९) to Arabic digits (0-9)
        const normalized = raw.replace(/[०-९]/g, d =>
            String.fromCharCode(d.charCodeAt(0) - 0x0966 + 0x30)
        );

        const value = Number(normalized);
        if (isNaN(value)) {
            throw new LexerError(`Invalid number literal: ${raw}`, {
                filename: this.filename,
                line: startLine,
                column: startColumn,
                sourceCode: this.input
            });
        }

        return new Token(TokenTypes.NUMBER, value, startLine, startColumn, raw);
    }

    readIdentifier() {
        const startLine = this.line;
        const startColumn = this.column;
        let value = '';

        // Match Devanagari letters, vowel marks, virama, and Latin identifiers
        while (this.currentChar && /[\u0900-\u097F\u200C\u200D]|[a-zA-Z0-9_]/.test(this.currentChar)) {
            value += this.currentChar;
            this.advance();
        }

        // Dual-Script Invariance: map Latin and alternate keywords to canonical Devanagari
        const CANONICAL_MAP = {
            'fn': 'कार्य',
            'function': 'कार्य',
            'let': 'चर',
            'var': 'चर',
            'mut': 'चर',
            'मान': 'चर',
            'man': 'चर',
            'const': 'स्थिर',
            'class': 'वर्ग',
            'extends': 'विस्तार',
            'constructor': 'निर्माण',
            'this': 'स्व',
            'super': 'सुपर',
            'new': 'नया',
            'static': 'स्थैतिक',
            'if': 'यदि',
            'else': 'अन्यथा',
            'while': 'यावत्',
            'for': 'पुनः',
            'foreach': 'प्रत्येक',
            'in': 'में',
            'of': 'का',
            'switch': 'स्विच',
            'case': 'केस',
            'default': 'डिफ़ॉल्ट',
            'break': 'तोड़',
            'continue': 'जारी',
            'return': 'प्रत्यागम',
            'try': 'प्रयत्न',
            'catch': 'पकड़',
            'finally': 'अंततः',
            'throw': 'फेंक',
            'true': 'सत्य',
            'सत्यम्': 'सत्य',
            'false': 'असत्य',
            'असत्यम्': 'असत्य',
            'null': 'शून्य',
            'शून्यम्': 'शून्य',
            'undefined': 'अपरिभाषित',
            'and': 'और',
            'or': 'या',
            'not': 'नहीं'
        };

        const canonical = CANONICAL_MAP[value] || value;
        const isKeyword = Keywords.has(canonical);
        const type = isKeyword ? TokenTypes.KEYWORD : TokenTypes.IDENTIFIER;
        return new Token(type, isKeyword ? canonical : value, startLine, startColumn, value);
    }

    readString() {
        const startLine = this.line;
        const startColumn = this.column;
        const quote = this.currentChar;
        let result = '';
        let raw = quote;

        this.advance(); // Skip opening quote

        while (this.currentChar && this.currentChar !== quote) {
            raw += this.currentChar;
            if (this.currentChar === '\\') {
                this.advance(); // consume '\'
                if (!this.currentChar) break;
                raw += this.currentChar;
                switch (this.currentChar) {
                    case 'n': result += '\n'; break;
                    case 't': result += '\t'; break;
                    case 'r': result += '\r'; break;
                    case '\\': result += '\\'; break;
                    case '"': result += '"'; break;
                    case "'": result += "'"; break;
                    case '0': result += '\0'; break;
                    default: result += this.currentChar; break;
                }
            } else {
                if (this.currentChar === '\n') {
                    throw new LexerError('Unterminated string literal (newline in string)', {
                        filename: this.filename,
                        line: startLine,
                        column: startColumn,
                        sourceCode: this.input,
                        hint: 'Use escape sequence \\n for newlines inside strings'
                    });
                }
                result += this.currentChar;
            }
            this.advance();
        }

        if (this.currentChar !== quote) {
            throw new LexerError('Unterminated string literal', {
                filename: this.filename,
                line: startLine,
                column: startColumn,
                sourceCode: this.input,
                hint: `Close string with matching quote (${quote})`
            });
        }

        raw += this.currentChar;
        this.advance(); // Skip closing quote

        return new Token(TokenTypes.STRING, result, startLine, startColumn, raw);
    }

    getNextToken() {
        while (this.currentChar !== null) {
            if (/\s/.test(this.currentChar)) {
                this.skipWhitespace();
                continue;
            }

            if (this.currentChar === '/' && (this.peek() === '/' || this.peek() === '*')) {
                this.skipComment();
                continue;
            }

            // Check for digits (Arabic or Devanagari)
            if (/[\d०-९]/.test(this.currentChar)) {
                return this.readNumber();
            }

            // Check for Devanagari characters or Latin identifier start
            if (/[\u0900-\u097F\u200C\u200D]|[a-zA-Z_]/.test(this.currentChar)) {
                return this.readIdentifier();
            }

            // Check for strings
            if (this.currentChar === '"' || this.currentChar === "'") {
                return this.readString();
            }

            const startLine = this.line;
            const startColumn = this.column;

            // Delimiters (including dot)
            if (/[(){}\[\],;:.]/.test(this.currentChar)) {
                const delimiter = this.currentChar;
                this.advance();
                return new Token(TokenTypes.DELIMITER, delimiter, startLine, startColumn);
            }

            // Operators (order matters: check 3-char, 2-char, 1-char)
            if (/[+\-*\/=<>!&|^%~]/.test(this.currentChar)) {
                const c1 = this.currentChar;
                const c2 = this.peek(1);
                const c3 = this.peek(2);

                // 3-char operators
                const op3 = c1 + (c2 || '') + (c3 || '');
                if (['===', '!==', '**=', '>>>', '...'].includes(op3)) {
                    this.advance();
                    this.advance();
                    this.advance();
                    return new Token(TokenTypes.OPERATOR, op3, startLine, startColumn);
                }

                // 2-char operators
                const op2 = c1 + (c2 || '');
                if (['==', '!=', '<=', '>=', '&&', '||', '+=', '-=', '*=', '/=', '%=', '**', '++', '--', '<<', '>>', '=>', '->'].includes(op2)) {
                    this.advance();
                    this.advance();
                    return new Token(TokenTypes.OPERATOR, op2, startLine, startColumn);
                }

                // 1-char operator
                this.advance();
                return new Token(TokenTypes.OPERATOR, c1, startLine, startColumn);
            }

            // Unrecognized character
            throw new LexerError(`Unexpected character: '${this.currentChar}'`, {
                filename: this.filename,
                line: startLine,
                column: startColumn,
                sourceCode: this.input
            });
        }

        return new Token(TokenTypes.EOF, null, this.line, this.column, '');
    }

    getAllTokens() {
        const tokens = [];
        let token;
        while ((token = this.getNextToken()).type !== TokenTypes.EOF) {
            tokens.push(token);
        }
        tokens.push(token); // include EOF
        return tokens;
    }
}

module.exports = { Lexer };

    });

    define('src/lexer/index.js', function(require, module, exports) {
// Sanskrit Language Lexer Module
const { TokenTypes, Keywords, Token } = require('./tokens');
const { Lexer } = require('./lexer');

module.exports = {
    TokenTypes,
    Keywords,
    Token,
    Lexer
};

    });

    define('src/parser/parser.js', function(require, module, exports) {
// Sanskrit Language Parser (produces Canonical AST)
const { TokenTypes } = require('../lexer/tokens');
const { ParserError } = require('../diagnostics/errors');
const Nodes = require('../ast/nodes');

class Parser {
    constructor(lexer, filename = '<anonymous>') {
        this.lexer = lexer;
        this.filename = filename || (lexer && lexer.filename) || '<anonymous>';
        this.sourceCode = (lexer && lexer.input) || '';
        this.currentToken = this.lexer.getNextToken();
    }

    peek() {
        return this.currentToken;
    }

    getState() {
        return {
            currentToken: this.currentToken,
            lexerState: this.lexer.getState()
        };
    }

    setState(state) {
        this.currentToken = state.currentToken;
        this.lexer.setState(state.lexerState);
    }

    match(type, value = null) {
        if (this.currentToken.type !== type) return false;
        if (value !== null && this.currentToken.value !== value) return false;
        return true;
    }

    eat(tokenType, expectedValue = null) {
        const token = this.currentToken;

        if (token.type !== tokenType) {
            const expected = expectedValue ? `'${expectedValue}' (${tokenType})` : tokenType;
            throw new ParserError(`Expected ${expected} but got ${token.type} ('${token.value}')`, {
                filename: this.filename,
                line: token.line,
                column: token.column,
                sourceCode: this.sourceCode
            });
        }

        if (expectedValue !== null && token.value !== expectedValue) {
            throw new ParserError(`Expected '${expectedValue}' but got '${token.value}'`, {
                filename: this.filename,
                line: token.line,
                column: token.column,
                sourceCode: this.sourceCode
            });
        }

        this.currentToken = this.lexer.getNextToken();
        return token;
    }

    parse() {
        const body = [];
        const startLine = this.currentToken.line;
        const startCol = this.currentToken.column;

        while (this.currentToken.type !== TokenTypes.EOF) {
            const stmt = this.statement();
            if (stmt) {
                body.push(stmt);
            }
        }

        return new Nodes.ProgramNode(body, { line: startLine, column: startCol });
    }

    statement() {
        // Skip stray semicolons
        if (this.match(TokenTypes.DELIMITER, ';')) {
            this.eat(TokenTypes.DELIMITER, ';');
            return null;
        }

        if (this.match(TokenTypes.DELIMITER, '{')) {
            return this.blockStatement();
        }

        if (this.currentToken.type === TokenTypes.KEYWORD) {
            switch (this.currentToken.value) {
                case 'कार्य':
                    return this.functionDeclaration();
                case 'चर':
                case 'स्थिर':
                    return this.variableDeclaration();
                case 'वर्ग':
                    return this.classDeclaration();
                case 'यदि':
                    return this.ifStatement();
                case 'यावत्':
                    return this.whileStatement();
                case 'पुनः':
                    return this.forStatement();
                case 'प्रत्येक':
                    return this.forEachStatement();
                case 'प्रत्यागम':
                    return this.returnStatement();
                case 'तोड़':
                    return this.breakStatement();
                case 'जारी':
                    return this.continueStatement();
                case 'प्रयत्न':
                    return this.tryStatement();
                case 'फेंक':
                    return this.throwStatement();
            }
        }

        // Default to expression statement (covers identifiers, 'स्व', 'सुपर', literals, calls, assignments)
        return this.expressionStatement();
    }

    blockStatement() {
        const startToken = this.eat(TokenTypes.DELIMITER, '{');
        const body = [];

        while (!this.match(TokenTypes.DELIMITER, '}') && this.currentToken.type !== TokenTypes.EOF) {
            const stmt = this.statement();
            if (stmt) {
                body.push(stmt);
            }
        }

        this.eat(TokenTypes.DELIMITER, '}');
        return new Nodes.BlockStatementNode(body, { line: startToken.line, column: startToken.column });
    }

    functionDeclaration() {
        const startToken = this.eat(TokenTypes.KEYWORD, 'कार्य');
        let nameToken;
        if (this.match(TokenTypes.IDENTIFIER) || this.match(TokenTypes.KEYWORD)) {
            nameToken = this.eat(this.currentToken.type);
        } else {
            nameToken = this.eat(TokenTypes.IDENTIFIER);
        }
        const id = new Nodes.IdentifierNode(nameToken.value, { line: nameToken.line, column: nameToken.column });

        this.eat(TokenTypes.DELIMITER, '(');
        const params = [];

        if (!this.match(TokenTypes.DELIMITER, ')')) {
            do {
                if (params.length > 0) {
                    this.eat(TokenTypes.DELIMITER, ',');
                }
                const paramToken = this.eat(TokenTypes.IDENTIFIER);
                params.push(new Nodes.IdentifierNode(paramToken.value, { line: paramToken.line, column: paramToken.column }));
            } while (this.match(TokenTypes.DELIMITER, ','));
        }

        this.eat(TokenTypes.DELIMITER, ')');
        const body = this.blockStatement();

        return new Nodes.FunctionDeclarationNode(id, params, body, { line: startToken.line, column: startToken.column });
    }

    variableDeclaration(consumeSemicolon = true) {
        const isConstant = this.currentToken.value === 'स्थिर';
        const startToken = this.eat(TokenTypes.KEYWORD); // 'चर' or 'स्थिर'

        let nameToken;
        if (this.match(TokenTypes.IDENTIFIER) || this.match(TokenTypes.KEYWORD)) {
            nameToken = this.eat(this.currentToken.type);
        } else {
            nameToken = this.eat(TokenTypes.IDENTIFIER);
        }
        const id = new Nodes.IdentifierNode(nameToken.value, { line: nameToken.line, column: nameToken.column });

        let init = null;
        if (this.match(TokenTypes.OPERATOR, '=')) {
            this.eat(TokenTypes.OPERATOR, '=');
            init = this.expression();
        }

        if (consumeSemicolon && this.match(TokenTypes.DELIMITER, ';')) {
            this.eat(TokenTypes.DELIMITER, ';');
        }

        return new Nodes.VariableDeclarationNode(id, init, isConstant, { line: startToken.line, column: startToken.column });
    }

    classDeclaration() {
        const startToken = this.eat(TokenTypes.KEYWORD, 'वर्ग');
        const nameToken = this.eat(TokenTypes.IDENTIFIER);
        const id = new Nodes.IdentifierNode(nameToken.value, { line: nameToken.line, column: nameToken.column });

        let superClass = null;
        if (this.match(TokenTypes.KEYWORD, 'विस्तार')) {
            this.eat(TokenTypes.KEYWORD, 'विस्तार');
            const superToken = this.eat(TokenTypes.IDENTIFIER);
            superClass = new Nodes.IdentifierNode(superToken.value, { line: superToken.line, column: superToken.column });
        }

        this.eat(TokenTypes.DELIMITER, '{');
        const methods = [];

        while (!this.match(TokenTypes.DELIMITER, '}') && this.currentToken.type !== TokenTypes.EOF) {
            // Skip stray semicolons in class body
            if (this.match(TokenTypes.DELIMITER, ';')) {
                this.eat(TokenTypes.DELIMITER, ';');
                continue;
            }

            const method = this.methodDeclaration();
            methods.push(method);
        }

        this.eat(TokenTypes.DELIMITER, '}');
        return new Nodes.ClassDeclarationNode(id, superClass, methods, { line: startToken.line, column: startToken.column });
    }

    methodDeclaration() {
        const startToken = this.currentToken;
        let isStatic = false;

        if (this.match(TokenTypes.KEYWORD, 'स्थैतिक')) {
            this.eat(TokenTypes.KEYWORD, 'स्थैतिक');
            isStatic = true;
        }

        let isConstructor = false;
        let nameToken;

        if (this.match(TokenTypes.KEYWORD, 'निर्माण')) {
            isConstructor = true;
            nameToken = this.eat(TokenTypes.KEYWORD, 'निर्माण');
        } else {
            // Optional 'कार्य' before method name
            if (this.match(TokenTypes.KEYWORD, 'कार्य')) {
                this.eat(TokenTypes.KEYWORD, 'कार्य');
            }
            nameToken = this.eat(TokenTypes.IDENTIFIER);
        }

        const id = new Nodes.IdentifierNode(nameToken.value, { line: nameToken.line, column: nameToken.column });

        this.eat(TokenTypes.DELIMITER, '(');
        const params = [];

        if (!this.match(TokenTypes.DELIMITER, ')')) {
            do {
                if (params.length > 0) {
                    this.eat(TokenTypes.DELIMITER, ',');
                }
                const pToken = this.eat(TokenTypes.IDENTIFIER);
                params.push(new Nodes.IdentifierNode(pToken.value, { line: pToken.line, column: pToken.column }));
            } while (this.match(TokenTypes.DELIMITER, ','));
        }

        this.eat(TokenTypes.DELIMITER, ')');
        const body = this.blockStatement();

        return new Nodes.MethodDeclarationNode(id, params, body, isConstructor, isStatic, [], {
            line: startToken.line,
            column: startToken.column
        });
    }

    ifStatement() {
        const startToken = this.eat(TokenTypes.KEYWORD, 'यदि');
        this.eat(TokenTypes.DELIMITER, '(');
        const test = this.expression();
        this.eat(TokenTypes.DELIMITER, ')');

        const consequent = this.blockStatement();
        let alternate = null;

        if (this.match(TokenTypes.KEYWORD, 'अन्यथा')) {
            this.eat(TokenTypes.KEYWORD, 'अन्यथा');
            if (this.match(TokenTypes.KEYWORD, 'यदि')) {
                alternate = this.ifStatement(); // else if
            } else {
                alternate = this.blockStatement(); // else block
            }
        }

        return new Nodes.IfStatementNode(test, consequent, alternate, { line: startToken.line, column: startToken.column });
    }

    whileStatement() {
        const startToken = this.eat(TokenTypes.KEYWORD, 'यावत्');
        this.eat(TokenTypes.DELIMITER, '(');
        const test = this.expression();
        this.eat(TokenTypes.DELIMITER, ')');
        const body = this.blockStatement();

        return new Nodes.WhileStatementNode(test, body, { line: startToken.line, column: startToken.column });
    }

    forStatement() {
        const startToken = this.eat(TokenTypes.KEYWORD, 'पुनः');
        this.eat(TokenTypes.DELIMITER, '(');

        let init = null;
        if (!this.match(TokenTypes.DELIMITER, ';')) {
            if (this.match(TokenTypes.KEYWORD, 'चर') || this.match(TokenTypes.KEYWORD, 'स्थिर')) {
                init = this.variableDeclaration(false);
            } else {
                init = this.expression();
            }
        }
        this.eat(TokenTypes.DELIMITER, ';');

        let test = null;
        if (!this.match(TokenTypes.DELIMITER, ';')) {
            test = this.expression();
        }
        this.eat(TokenTypes.DELIMITER, ';');

        let update = null;
        if (!this.match(TokenTypes.DELIMITER, ')')) {
            update = this.expression();
        }
        this.eat(TokenTypes.DELIMITER, ')');

        const body = this.blockStatement();

        return new Nodes.ForStatementNode(init, test, update, body, { line: startToken.line, column: startToken.column });
    }

    forEachStatement() {
        const startToken = this.eat(TokenTypes.KEYWORD, 'प्रत्येक');
        this.eat(TokenTypes.DELIMITER, '(');

        // Optional 'चर'
        if (this.match(TokenTypes.KEYWORD, 'चर')) {
            this.eat(TokenTypes.KEYWORD, 'चर');
        }

        const varToken = this.eat(TokenTypes.IDENTIFIER);
        const left = new Nodes.IdentifierNode(varToken.value, { line: varToken.line, column: varToken.column });

        if (this.match(TokenTypes.KEYWORD, 'में')) {
            this.eat(TokenTypes.KEYWORD, 'में');
        } else if (this.match(TokenTypes.KEYWORD, 'का')) {
            this.eat(TokenTypes.KEYWORD, 'का');
        } else {
            throw new ParserError(`Expected 'में' or 'का' in foreach statement`, {
                filename: this.filename,
                line: this.currentToken.line,
                column: this.currentToken.column,
                sourceCode: this.sourceCode
            });
        }

        const right = this.expression();
        this.eat(TokenTypes.DELIMITER, ')');
        const body = this.blockStatement();

        return new Nodes.ForEachStatementNode(left, right, body, { line: startToken.line, column: startToken.column });
    }

    returnStatement() {
        const startToken = this.eat(TokenTypes.KEYWORD, 'प्रत्यागम');
        let argument = null;

        if (!this.match(TokenTypes.DELIMITER, ';')) {
            argument = this.expression();
        }

        if (this.match(TokenTypes.DELIMITER, ';')) {
            this.eat(TokenTypes.DELIMITER, ';');
        }

        return new Nodes.ReturnStatementNode(argument, { line: startToken.line, column: startToken.column });
    }

    breakStatement() {
        const startToken = this.eat(TokenTypes.KEYWORD, 'तोड़');
        if (this.match(TokenTypes.DELIMITER, ';')) {
            this.eat(TokenTypes.DELIMITER, ';');
        }
        return new Nodes.BreakStatementNode({ line: startToken.line, column: startToken.column });
    }

    continueStatement() {
        const startToken = this.eat(TokenTypes.KEYWORD, 'जारी');
        if (this.match(TokenTypes.DELIMITER, ';')) {
            this.eat(TokenTypes.DELIMITER, ';');
        }
        return new Nodes.ContinueStatementNode({ line: startToken.line, column: startToken.column });
    }

    tryStatement() {
        const startToken = this.eat(TokenTypes.KEYWORD, 'प्रयत्न');
        const block = this.blockStatement();

        let handler = null;
        let finalizer = null;

        if (this.match(TokenTypes.KEYWORD, 'पकड़')) {
            const catchToken = this.eat(TokenTypes.KEYWORD, 'पकड़');
            this.eat(TokenTypes.DELIMITER, '(');
            const errToken = this.eat(TokenTypes.IDENTIFIER);
            const param = new Nodes.IdentifierNode(errToken.value, { line: errToken.line, column: errToken.column });
            this.eat(TokenTypes.DELIMITER, ')');
            const catchBody = this.blockStatement();
            handler = new Nodes.CatchClauseNode(param, catchBody, { line: catchToken.line, column: catchToken.column });
        }

        if (this.match(TokenTypes.KEYWORD, 'अंततः')) {
            this.eat(TokenTypes.KEYWORD, 'अंततः');
            finalizer = this.blockStatement();
        }

        if (!handler && !finalizer) {
            throw new ParserError("Try statement must have at least a 'पकड़' (catch) or 'अंततः' (finally) block", {
                filename: this.filename,
                line: startToken.line,
                column: startToken.column,
                sourceCode: this.sourceCode
            });
        }

        return new Nodes.TryStatementNode(block, handler, finalizer, { line: startToken.line, column: startToken.column });
    }

    throwStatement() {
        const startToken = this.eat(TokenTypes.KEYWORD, 'फेंक');
        const argument = this.expression();

        if (this.match(TokenTypes.DELIMITER, ';')) {
            this.eat(TokenTypes.DELIMITER, ';');
        }

        return new Nodes.ThrowStatementNode(argument, { line: startToken.line, column: startToken.column });
    }

    expressionStatement() {
        const expr = this.expression();
        if (this.match(TokenTypes.DELIMITER, ';')) {
            this.eat(TokenTypes.DELIMITER, ';');
        }
        return new Nodes.ExpressionStatementNode(expr, expr.loc);
    }

    expression() {
        return this.assignmentExpression();
    }

    assignmentExpression() {
        const left = this.conditionalExpression();

        if (this.currentToken.type === TokenTypes.OPERATOR &&
            ['=', '+=', '-=', '*=', '/=', '%=', '**='].includes(this.currentToken.value)) {
            const opToken = this.eat(TokenTypes.OPERATOR);
            const right = this.assignmentExpression(); // Right-associative

            if (!(left instanceof Nodes.IdentifierNode) && !(left instanceof Nodes.MemberExpressionNode)) {
                throw new ParserError(`Invalid left-hand side in assignment expression`, {
                    filename: this.filename,
                    line: opToken.line,
                    column: opToken.column,
                    sourceCode: this.sourceCode
                });
            }

            return new Nodes.AssignmentExpressionNode(opToken.value, left, right, left.loc);
        }

        return left;
    }

    conditionalExpression() {
        let expr = this.logicalOrExpression();

        if (this.currentToken.type === TokenTypes.KEYWORD && this.currentToken.value === 'यदि') {
            const ifToken = this.eat(TokenTypes.KEYWORD, 'यदि');
            const test = this.logicalOrExpression();
            this.eat(TokenTypes.KEYWORD, 'अन्यथा');
            const alternate = this.conditionalExpression();
            return new Nodes.ConditionalExpressionNode(test, expr, alternate, expr.loc);
        }

        return expr;
    }

    logicalOrExpression() {
        let left = this.logicalAndExpression();

        while (this.currentToken.type === TokenTypes.OPERATOR && ['||', 'या'].includes(this.currentToken.value)) {
            const opToken = this.eat(TokenTypes.OPERATOR);
            const right = this.logicalAndExpression();
            left = new Nodes.LogicalExpressionNode(opToken.value, left, right, left.loc);
        }

        return left;
    }

    logicalAndExpression() {
        let left = this.bitwiseOrExpression();

        while (this.currentToken.type === TokenTypes.OPERATOR && ['&&', 'और'].includes(this.currentToken.value)) {
            const opToken = this.eat(TokenTypes.OPERATOR);
            const right = this.bitwiseOrExpression();
            left = new Nodes.LogicalExpressionNode(opToken.value, left, right, left.loc);
        }

        return left;
    }

    bitwiseOrExpression() {
        let left = this.bitwiseXorExpression();

        while (this.currentToken.type === TokenTypes.OPERATOR && this.currentToken.value === '|') {
            const opToken = this.eat(TokenTypes.OPERATOR);
            const right = this.bitwiseXorExpression();
            left = new Nodes.BinaryExpressionNode(opToken.value, left, right, left.loc);
        }

        return left;
    }

    bitwiseXorExpression() {
        let left = this.bitwiseAndExpression();

        while (this.currentToken.type === TokenTypes.OPERATOR && this.currentToken.value === '^') {
            const opToken = this.eat(TokenTypes.OPERATOR);
            const right = this.bitwiseAndExpression();
            left = new Nodes.BinaryExpressionNode(opToken.value, left, right, left.loc);
        }

        return left;
    }

    bitwiseAndExpression() {
        let left = this.equalityExpression();

        while (this.currentToken.type === TokenTypes.OPERATOR && this.currentToken.value === '&') {
            const opToken = this.eat(TokenTypes.OPERATOR);
            const right = this.equalityExpression();
            left = new Nodes.BinaryExpressionNode(opToken.value, left, right, left.loc);
        }

        return left;
    }

    equalityExpression() {
        let left = this.relationalExpression();

        while (this.currentToken.type === TokenTypes.OPERATOR &&
               ['===', '!==', '==', '!='].includes(this.currentToken.value)) {
            const opToken = this.eat(TokenTypes.OPERATOR);
            const right = this.relationalExpression();
            left = new Nodes.BinaryExpressionNode(opToken.value, left, right, left.loc);
        }

        return left;
    }

    relationalExpression() {
        let left = this.shiftExpression();

        while (this.currentToken.type === TokenTypes.OPERATOR &&
               ['<', '>', '<=', '>='].includes(this.currentToken.value)) {
            const opToken = this.eat(TokenTypes.OPERATOR);
            const right = this.shiftExpression();
            left = new Nodes.BinaryExpressionNode(opToken.value, left, right, left.loc);
        }

        return left;
    }

    shiftExpression() {
        let left = this.additiveExpression();

        while (this.currentToken.type === TokenTypes.OPERATOR &&
               ['<<', '>>', '>>>'].includes(this.currentToken.value)) {
            const opToken = this.eat(TokenTypes.OPERATOR);
            const right = this.additiveExpression();
            left = new Nodes.BinaryExpressionNode(opToken.value, left, right, left.loc);
        }

        return left;
    }

    additiveExpression() {
        let left = this.multiplicativeExpression();

        while (this.currentToken.type === TokenTypes.OPERATOR && ['+', '-'].includes(this.currentToken.value)) {
            const opToken = this.eat(TokenTypes.OPERATOR);
            const right = this.multiplicativeExpression();
            left = new Nodes.BinaryExpressionNode(opToken.value, left, right, left.loc);
        }

        return left;
    }

    multiplicativeExpression() {
        let left = this.exponentiationExpression();

        while (this.currentToken.type === TokenTypes.OPERATOR && ['*', '/', '%'].includes(this.currentToken.value)) {
            const opToken = this.eat(TokenTypes.OPERATOR);
            const right = this.exponentiationExpression();
            left = new Nodes.BinaryExpressionNode(opToken.value, left, right, left.loc);
        }

        return left;
    }

    exponentiationExpression() {
        const left = this.unaryExpression();

        if (this.currentToken.type === TokenTypes.OPERATOR && this.currentToken.value === '**') {
            const opToken = this.eat(TokenTypes.OPERATOR);
            const right = this.exponentiationExpression(); // Right-associative
            return new Nodes.BinaryExpressionNode(opToken.value, left, right, left.loc);
        }

        return left;
    }

    unaryExpression() {
        if (this.currentToken.type === TokenTypes.OPERATOR &&
            ['+', '-', '!', '~', '++', '--', 'नहीं'].includes(this.currentToken.value)) {
            const opToken = this.eat(TokenTypes.OPERATOR);
            const operand = this.unaryExpression();
            const operator = opToken.value === 'नहीं' ? '!' : opToken.value;

            if (operator === '++' || operator === '--') {
                return new Nodes.UpdateExpressionNode(operator, operand, true, {
                    line: opToken.line,
                    column: opToken.column
                });
            }

            return new Nodes.UnaryExpressionNode(operator, operand, true, {
                line: opToken.line,
                column: opToken.column
            });
        }

        return this.postfixExpression();
    }

    postfixExpression() {
        let node = this.memberExpression();

        while (this.currentToken.type === TokenTypes.OPERATOR && ['++', '--'].includes(this.currentToken.value)) {
            const opToken = this.eat(TokenTypes.OPERATOR);
            node = new Nodes.UpdateExpressionNode(opToken.value, node, false, node.loc);
        }

        return node;
    }

    memberExpression(allowCall = true) {
        let node = this.primaryExpression();

        while (true) {
            if (this.match(TokenTypes.DELIMITER, '.')) {
                this.eat(TokenTypes.DELIMITER, '.');
                let propToken;
                if (this.match(TokenTypes.IDENTIFIER) || this.match(TokenTypes.KEYWORD)) {
                    propToken = this.eat(this.currentToken.type);
                } else {
                    propToken = this.eat(TokenTypes.IDENTIFIER);
                }
                const property = new Nodes.IdentifierNode(propToken.value, {
                    line: propToken.line,
                    column: propToken.column
                });
                node = new Nodes.MemberExpressionNode(node, property, false, node.loc);
            } else if (this.match(TokenTypes.DELIMITER, '[')) {
                const bracketToken = this.eat(TokenTypes.DELIMITER, '[');
                let property;

                if (this.match(TokenTypes.DELIMITER, ':')) {
                    // e.g. [:stop] or [:] or [::step]
                    this.eat(TokenTypes.DELIMITER, ':');
                    let stop = null;
                    let step = null;

                    if (!this.match(TokenTypes.DELIMITER, ':') && !this.match(TokenTypes.DELIMITER, ']')) {
                        stop = this.expression();
                    }
                    if (this.match(TokenTypes.DELIMITER, ':')) {
                        this.eat(TokenTypes.DELIMITER, ':');
                        if (!this.match(TokenTypes.DELIMITER, ']')) {
                            step = this.expression();
                        }
                    }
                    this.eat(TokenTypes.DELIMITER, ']');
                    property = new Nodes.SliceExpressionNode(null, stop, step, {
                        line: bracketToken.line,
                        column: bracketToken.column
                    });
                } else {
                    const firstExpr = this.expression();
                    if (this.match(TokenTypes.DELIMITER, ':')) {
                        // e.g. [start:stop] or [start:] or [start:stop:step]
                        this.eat(TokenTypes.DELIMITER, ':');
                        let stop = null;
                        let step = null;

                        if (!this.match(TokenTypes.DELIMITER, ':') && !this.match(TokenTypes.DELIMITER, ']')) {
                            stop = this.expression();
                        }
                        if (this.match(TokenTypes.DELIMITER, ':')) {
                            this.eat(TokenTypes.DELIMITER, ':');
                            if (!this.match(TokenTypes.DELIMITER, ']')) {
                                step = this.expression();
                            }
                        }
                        this.eat(TokenTypes.DELIMITER, ']');
                        property = new Nodes.SliceExpressionNode(firstExpr, stop, step, {
                            line: bracketToken.line,
                            column: bracketToken.column
                        });
                    } else {
                        this.eat(TokenTypes.DELIMITER, ']');
                        property = firstExpr;
                    }
                }

                node = new Nodes.MemberExpressionNode(node, property, true, node.loc);
            } else if (allowCall && this.match(TokenTypes.DELIMITER, '(')) {
                // Function call
                this.eat(TokenTypes.DELIMITER, '(');
                const args = [];

                if (!this.match(TokenTypes.DELIMITER, ')')) {
                    do {
                        if (args.length > 0) {
                            this.eat(TokenTypes.DELIMITER, ',');
                        }
                        args.push(this.expression());
                    } while (this.match(TokenTypes.DELIMITER, ','));
                }

                this.eat(TokenTypes.DELIMITER, ')');
                node = new Nodes.CallExpressionNode(node, args, node.loc);
            } else {
                break;
            }
        }

        return node;
    }

    primaryExpression() {
        const token = this.currentToken;

        // New Expression: नया ClassName(args)
        if (token.type === TokenTypes.KEYWORD && token.value === 'नया') {
            const startToken = this.eat(TokenTypes.KEYWORD, 'नया');
            const callee = this.memberExpression(false);
            const args = [];

            if (this.match(TokenTypes.DELIMITER, '(')) {
                this.eat(TokenTypes.DELIMITER, '(');
                if (!this.match(TokenTypes.DELIMITER, ')')) {
                    do {
                        if (args.length > 0) {
                            this.eat(TokenTypes.DELIMITER, ',');
                        }
                        args.push(this.expression());
                    } while (this.match(TokenTypes.DELIMITER, ','));
                }
                this.eat(TokenTypes.DELIMITER, ')');
            }

            return new Nodes.NewExpressionNode(callee, args, { line: startToken.line, column: startToken.column });
        }

        // Numbers
        if (token.type === TokenTypes.NUMBER) {
            this.eat(TokenTypes.NUMBER);
            return new Nodes.NumericLiteralNode(token.value, token.raw, { line: token.line, column: token.column });
        }

        // Strings
        if (token.type === TokenTypes.STRING) {
            this.eat(TokenTypes.STRING);
            return new Nodes.StringLiteralNode(token.value, token.raw, { line: token.line, column: token.column });
        }

        // Function expression or Arrow function: कार्य(...) => ... or कार्य(...) { ... }
        if (token.type === TokenTypes.KEYWORD && token.value === 'कार्य') {
            const startToken = this.eat(TokenTypes.KEYWORD, 'कार्य');
            let id = null;
            if (this.match(TokenTypes.IDENTIFIER)) {
                const nameToken = this.eat(TokenTypes.IDENTIFIER);
                id = new Nodes.IdentifierNode(nameToken.value, { line: nameToken.line, column: nameToken.column });
            }

            this.eat(TokenTypes.DELIMITER, '(');
            const params = [];
            if (!this.match(TokenTypes.DELIMITER, ')')) {
                do {
                    if (params.length > 0) {
                        this.eat(TokenTypes.DELIMITER, ',');
                    }
                    const paramToken = this.eat(TokenTypes.IDENTIFIER);
                    params.push(new Nodes.IdentifierNode(paramToken.value, { line: paramToken.line, column: paramToken.column }));
                } while (this.match(TokenTypes.DELIMITER, ','));
            }
            this.eat(TokenTypes.DELIMITER, ')');

            if (this.match(TokenTypes.OPERATOR, '=>') || this.match(TokenTypes.OPERATOR, '->')) {
                this.eat(TokenTypes.OPERATOR);
                if (this.match(TokenTypes.DELIMITER, '{')) {
                    const body = this.blockStatement();
                    return new Nodes.ArrowFunctionNode(params, body, false, { line: startToken.line, column: startToken.column });
                } else {
                    const body = this.expression();
                    return new Nodes.ArrowFunctionNode(params, body, true, { line: startToken.line, column: startToken.column });
                }
            }

            const body = this.blockStatement();
            return new Nodes.FunctionDeclarationNode(id, params, body, { line: startToken.line, column: startToken.column });
        }

        // Keywords
        if (token.type === TokenTypes.KEYWORD) {
            switch (token.value) {
                case 'सत्य':
                    this.eat(TokenTypes.KEYWORD, 'सत्य');
                    return new Nodes.BooleanLiteralNode(true, { line: token.line, column: token.column });
                case 'असत्य':
                    this.eat(TokenTypes.KEYWORD, 'असत्य');
                    return new Nodes.BooleanLiteralNode(false, { line: token.line, column: token.column });
                case 'शून्य':
                    this.eat(TokenTypes.KEYWORD, 'शून्य');
                    return new Nodes.NullLiteralNode({ line: token.line, column: token.column });
                case 'अपरिभाषित':
                    this.eat(TokenTypes.KEYWORD, 'अपरिभाषित');
                    return new Nodes.UndefinedLiteralNode({ line: token.line, column: token.column });
                case 'स्व':
                    this.eat(TokenTypes.KEYWORD, 'स्व');
                    return new Nodes.ThisExpressionNode({ line: token.line, column: token.column });
                case 'सुपर':
                    this.eat(TokenTypes.KEYWORD, 'सुपर');
                    return new Nodes.SuperExpressionNode({ line: token.line, column: token.column });
                case 'वर्ग':
                    this.eat(TokenTypes.KEYWORD, 'वर्ग');
                    return new Nodes.IdentifierNode('वर्ग', { line: token.line, column: token.column });
            }
        }

        // Identifiers or Single-Param Arrow Function: x => x * 2
        if (token.type === TokenTypes.IDENTIFIER) {
            const idToken = this.eat(TokenTypes.IDENTIFIER);

            if (this.match(TokenTypes.OPERATOR, '=>') || this.match(TokenTypes.OPERATOR, '->')) {
                this.eat(TokenTypes.OPERATOR);
                const params = [new Nodes.IdentifierNode(idToken.value, { line: idToken.line, column: idToken.column })];
                if (this.match(TokenTypes.DELIMITER, '{')) {
                    const body = this.blockStatement();
                    return new Nodes.ArrowFunctionNode(params, body, false, { line: idToken.line, column: idToken.column });
                } else {
                    const body = this.expression();
                    return new Nodes.ArrowFunctionNode(params, body, true, { line: idToken.line, column: idToken.column });
                }
            }

            return new Nodes.IdentifierNode(idToken.value, { line: idToken.line, column: idToken.column });
        }

        // Array Literal or Comprehension: [elem1, elem2] or [expr पुनः (var में coll) यदि (cond)]
        if (this.match(TokenTypes.DELIMITER, '[')) {
            const startToken = this.eat(TokenTypes.DELIMITER, '[');
            if (this.match(TokenTypes.DELIMITER, ']')) {
                this.eat(TokenTypes.DELIMITER, ']');
                return new Nodes.ArrayLiteralNode([], { line: startToken.line, column: startToken.column });
            }

            const firstExpr = this.expression();

            // List comprehension
            if (this.match(TokenTypes.KEYWORD, 'पुनः')) {
                this.eat(TokenTypes.KEYWORD, 'पुनः');
                let hasParen = false;
                if (this.match(TokenTypes.DELIMITER, '(')) {
                    hasParen = true;
                    this.eat(TokenTypes.DELIMITER, '(');
                }

                const varToken = this.eat(TokenTypes.IDENTIFIER);
                const variable = new Nodes.IdentifierNode(varToken.value, {
                    line: varToken.line,
                    column: varToken.column
                });

                this.eat(TokenTypes.KEYWORD, 'में');
                const collection = this.expression();

                if (hasParen) {
                    this.eat(TokenTypes.DELIMITER, ')');
                }

                let filterCondition = null;
                if (this.match(TokenTypes.KEYWORD, 'यदि')) {
                    this.eat(TokenTypes.KEYWORD, 'यदि');
                    filterCondition = this.expression();
                }

                this.eat(TokenTypes.DELIMITER, ']');
                return new Nodes.ComprehensionNode(firstExpr, variable, collection, filterCondition, {
                    line: startToken.line,
                    column: startToken.column
                });
            }

            // Normal array literal
            const elements = [firstExpr];
            while (this.match(TokenTypes.DELIMITER, ',')) {
                this.eat(TokenTypes.DELIMITER, ',');
                if (this.match(TokenTypes.DELIMITER, ']')) break;
                elements.push(this.expression());
            }

            this.eat(TokenTypes.DELIMITER, ']');
            return new Nodes.ArrayLiteralNode(elements, { line: startToken.line, column: startToken.column });
        }

        // Object Literal: { key: value, ... }
        if (this.match(TokenTypes.DELIMITER, '{')) {
            const startToken = this.eat(TokenTypes.DELIMITER, '{');
            const properties = [];

            if (!this.match(TokenTypes.DELIMITER, '}')) {
                do {
                    if (properties.length > 0) {
                        this.eat(TokenTypes.DELIMITER, ',');
                    }
                    if (this.match(TokenTypes.DELIMITER, '}')) break;

                    let key;
                    if (this.currentToken.type === TokenTypes.IDENTIFIER) {
                        const idToken = this.eat(TokenTypes.IDENTIFIER);
                        key = new Nodes.IdentifierNode(idToken.value, { line: idToken.line, column: idToken.column });
                    } else if (this.currentToken.type === TokenTypes.STRING) {
                        const strToken = this.eat(TokenTypes.STRING);
                        key = new Nodes.StringLiteralNode(strToken.value, strToken.raw, {
                            line: strToken.line,
                            column: strToken.column
                        });
                    } else if (this.currentToken.type === TokenTypes.NUMBER) {
                        const numToken = this.eat(TokenTypes.NUMBER);
                        key = new Nodes.NumericLiteralNode(numToken.value, numToken.raw, {
                            line: numToken.line,
                            column: numToken.column
                        });
                    } else {
                        throw new ParserError(`Expected property name but got ${this.currentToken.type}`, {
                            filename: this.filename,
                            line: this.currentToken.line,
                            column: this.currentToken.column,
                            sourceCode: this.sourceCode
                        });
                    }

                    this.eat(TokenTypes.DELIMITER, ':');
                    const value = this.expression();
                    properties.push(new Nodes.PropertyNode(key, value, key.loc));
                } while (this.match(TokenTypes.DELIMITER, ','));
            }

            this.eat(TokenTypes.DELIMITER, '}');
            return new Nodes.ObjectLiteralNode(properties, { line: startToken.line, column: startToken.column });
        }

        // Arrow function or Grouped Expression: (params) => expr vs (expr)
        if (this.match(TokenTypes.DELIMITER, '(')) {
            const saved = this.getState();
            this.eat(TokenTypes.DELIMITER, '(');

            let isArrow = true;
            const params = [];

            if (!this.match(TokenTypes.DELIMITER, ')')) {
                while (true) {
                    if (this.match(TokenTypes.IDENTIFIER)) {
                        const idToken = this.eat(TokenTypes.IDENTIFIER);
                        params.push(new Nodes.IdentifierNode(idToken.value, { line: idToken.line, column: idToken.column }));
                        if (this.match(TokenTypes.DELIMITER, ',')) {
                            this.eat(TokenTypes.DELIMITER, ',');
                        } else {
                            break;
                        }
                    } else {
                        isArrow = false;
                        break;
                    }
                }
            }

            if (isArrow && this.match(TokenTypes.DELIMITER, ')')) {
                this.eat(TokenTypes.DELIMITER, ')');
                if (this.match(TokenTypes.OPERATOR, '=>') || this.match(TokenTypes.OPERATOR, '->')) {
                    this.eat(TokenTypes.OPERATOR);
                    if (this.match(TokenTypes.DELIMITER, '{')) {
                        const body = this.blockStatement();
                        return new Nodes.ArrowFunctionNode(params, body, false, {
                            line: saved.currentToken.line,
                            column: saved.currentToken.column
                        });
                    } else {
                        const body = this.expression();
                        return new Nodes.ArrowFunctionNode(params, body, true, {
                            line: saved.currentToken.line,
                            column: saved.currentToken.column
                        });
                    }
                }
            }

            // Backtrack to parse grouped expression
            this.setState(saved);
            this.eat(TokenTypes.DELIMITER, '(');
            const expr = this.expression();
            this.eat(TokenTypes.DELIMITER, ')');
            return expr;
        }

        throw new ParserError(`Unexpected token ${token.type} ('${token.value}')`, {
            filename: this.filename,
            line: token.line,
            column: token.column,
            sourceCode: this.sourceCode
        });
    }
}

module.exports = { Parser };

    });

    define('src/parser/index.js', function(require, module, exports) {
// Sanskrit Language Parser Module
const { Parser } = require('./parser');

module.exports = { Parser };

    });

    define('src/runtime/signals.js', function(require, module, exports) {
// Sanskrit Language Control Flow Signals
// Replaces global mutable flags on the interpreter

class ControlFlowSignal {
    constructor(type) {
        this.type = type;
    }
}

class ReturnSignal extends ControlFlowSignal {
    constructor(value) {
        super('RETURN');
        this.value = value;
    }
}

class BreakSignal extends ControlFlowSignal {
    constructor() {
        super('BREAK');
    }
}

class ContinueSignal extends ControlFlowSignal {
    constructor() {
        super('CONTINUE');
    }
}

class ThrowSignal extends ControlFlowSignal {
    constructor(value, loc = null) {
        super('THROW');
        this.value = value;
        this.loc = loc;
    }
}

module.exports = {
    ControlFlowSignal,
    ReturnSignal,
    BreakSignal,
    ContinueSignal,
    ThrowSignal
};

    });

    define('src/runtime/values.js', function(require, module, exports) {
// Sanskrit Language Object Model & Runtime Values
const { ReturnSignal } = require('./signals');
const { RuntimeError, TypeError } = require('../diagnostics/errors');

class SanskritFunction {
    constructor(name, params, body, closure, isExpressionBody = false) {
        this.name = name;
        this.params = params; // array of string names
        this.body = body;
        this.closure = closure; // Environment
        this.isExpressionBody = isExpressionBody;
    }

    call(interpreter, args = [], loc = null) {
        const callEnv = this.closure.createChild();

        // Bind arguments to parameters
        for (let i = 0; i < this.params.length; i++) {
            const paramName = this.params[i];
            const argVal = i < args.length ? args[i] : undefined;
            callEnv.declare(paramName, argVal, false, loc);
        }

        if (this.isExpressionBody) {
            return interpreter.evaluate(this.body, callEnv);
        }

        try {
            interpreter.execute(this.body, callEnv);
        } catch (signal) {
            if (signal instanceof ReturnSignal) {
                return signal.value;
            }
            throw signal;
        }

        return undefined;
    }

    toString() {
        return `<कार्य ${this.name || 'गुमनाम'}>`;
    }
}

class SanskritClass {
    constructor(name, superClass = null) {
        this.name = name;
        this.superClass = superClass; // SanskritClass or null
        this.methods = new Map();
        this.staticMethods = new Map();
        this.constructorMethod = null;
        this.closure = null; // Environment where class was defined
    }

    findMethod(name) {
        if (this.methods.has(name)) {
            return this.methods.get(name);
        }
        if (this.superClass) {
            return this.superClass.findMethod(name);
        }
        return null;
    }

    findStaticMethod(name) {
        if (this.staticMethods.has(name)) {
            return this.staticMethods.get(name);
        }
        if (this.superClass) {
            return this.superClass.findStaticMethod(name);
        }
        return null;
    }

    findConstructor() {
        if (this.constructorMethod) {
            return this.constructorMethod;
        }
        if (this.superClass) {
            return this.superClass.findConstructor();
        }
        return null;
    }

    instantiate(interpreter, args = [], loc = null) {
        const instance = new SanskritInstance(this);
        const ctor = this.findConstructor();

        if (ctor) {
            const boundCtor = new SanskritBoundMethod(instance, ctor, this.closure);
            boundCtor.call(interpreter, args, loc);
        }

        return instance;
    }

    get(prop, loc = null) {
        const staticMethod = this.findStaticMethod(prop);
        if (staticMethod) {
            return new SanskritBoundMethod(this, staticMethod, this.closure, true);
        }
        return undefined;
    }

    toString() {
        return `<वर्ग ${this.name}>`;
    }
}

class SanskritInstance {
    constructor(sanskritClass) {
        this.sanskritClass = sanskritClass;
        this.fields = new Map();
    }

    get(prop, loc = null) {
        if (this.fields.has(prop)) {
            return this.fields.get(prop);
        }

        const method = this.sanskritClass.findMethod(prop);
        if (method) {
            return new SanskritBoundMethod(this, method, this.sanskritClass.closure);
        }

        return undefined;
    }

    set(prop, value) {
        this.fields.set(prop, value);
        return value;
    }

    toString() {
        return `<${this.sanskritClass.name} वस्तु>`;
    }
}

class SanskritBoundMethod {
    constructor(instanceOrClass, methodNode, closure, isStatic = false) {
        this.target = instanceOrClass; // instance (or class for static)
        this.methodNode = methodNode;
        this.closure = closure;
        this.isStatic = isStatic;
    }

    call(interpreter, args = [], loc = null) {
        const callEnv = (this.closure || interpreter.globalEnv).createChild();

        // Bind 'स्व' (this)
        callEnv.declare('स्व', this.target, false, loc);

        // Bind 'सुपर' (super) if target is instance and class has superClass
        if (!this.isStatic && this.target instanceof SanskritInstance && this.target.sanskritClass.superClass) {
            const superClass = this.target.sanskritClass.superClass;
            const superCtor = (...superArgs) => {
                const parentCtor = superClass.findConstructor();
                if (parentCtor) {
                    const bound = new SanskritBoundMethod(this.target, parentCtor, superClass.closure);
                    return bound.call(interpreter, superArgs, loc);
                }
            };
            callEnv.declare('सुपर', superCtor, false, loc);
        }

        // Bind parameters
        const paramNames = this.methodNode.params.map(p => p.name);
        for (let i = 0; i < paramNames.length; i++) {
            const pName = paramNames[i];
            const pVal = i < args.length ? args[i] : undefined;
            callEnv.declare(pName, pVal, false, loc);
        }

        try {
            interpreter.execute(this.methodNode.body, callEnv);
        } catch (signal) {
            if (signal instanceof ReturnSignal) {
                return signal.value;
            }
            throw signal;
        }

        return undefined;
    }

    toString() {
        return `<विधि ${this.methodNode.id ? this.methodNode.id.name : 'कार्य'}>`;
    }
}

module.exports = {
    SanskritFunction,
    SanskritClass,
    SanskritInstance,
    SanskritBoundMethod
};

    });

    define('src/runtime/environment.js', function(require, module, exports) {
// Sanskrit Language Lexical Environment
const { NameError, ConstantError, RuntimeError } = require('../diagnostics/errors');

class Environment {
    constructor(parent = null) {
        this.parent = parent;
        this.bindings = new Map();
    }

    createChild() {
        return new Environment(this);
    }

    declare(name, value = undefined, isConstant = false, loc = null) {
        if (this.bindings.has(name)) {
            throw new RuntimeError(`Identifier '${name}' has already been declared in this scope`, {
                line: loc ? loc.line : 1,
                column: loc ? loc.column : 1,
                hint: `Choose a different name or assign without 'चर' / 'स्थिर'`
            });
        }

        this.bindings.set(name, {
            value,
            isConstant: Boolean(isConstant)
        });

        return value;
    }

    assign(name, value, loc = null) {
        if (this.bindings.has(name)) {
            const binding = this.bindings.get(name);
            if (binding.isConstant) {
                throw new ConstantError(`Assignment to constant variable '${name}'`, {
                    line: loc ? loc.line : 1,
                    column: loc ? loc.column : 1,
                    hint: `'${name}' was declared with 'स्थिर' (const) and cannot be reassigned`
                });
            }
            binding.value = value;
            return value;
        }

        if (this.parent) {
            return this.parent.assign(name, value, loc);
        }

        throw new NameError(`Variable '${name}' is not defined`, {
            line: loc ? loc.line : 1,
            column: loc ? loc.column : 1,
            hint: `Declare it first using: चर ${name} = ...;`
        });
    }

    lookup(name, loc = null) {
        if (this.bindings.has(name)) {
            return this.bindings.get(name).value;
        }

        if (this.parent) {
            return this.parent.lookup(name, loc);
        }

        throw new NameError(`Variable '${name}' is not defined`, {
            line: loc ? loc.line : 1,
            column: loc ? loc.column : 1,
            hint: `Make sure '${name}' is spelled correctly and in scope`
        });
    }

    exists(name) {
        if (this.bindings.has(name)) return true;
        if (this.parent) return this.parent.exists(name);
        return false;
    }
}

module.exports = { Environment };

    });

    define('src/runtime/builtins.js', function(require, module, exports) {
// Sanskrit Language Standard Library Built-ins
const { SanskritInstance, SanskritClass, SanskritFunction } = require('./values');

function toDevanagariDigits(num) {
    return String(num).replace(/[0-9]/g, d =>
        String.fromCharCode(d.charCodeAt(0) - 0x30 + 0x0966)
    );
}

function parseToNumber(val) {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
        const normalized = val.replace(/[०-९]/g, d =>
            String.fromCharCode(d.charCodeAt(0) - 0x0966 + 0x30)
        );
        const num = Number(normalized);
        return isNaN(num) ? undefined : num;
    }
    return undefined;
}

function formatValue(val) {
    if (val === null) return 'शून्य';
    if (val === undefined) return 'अपरिभाषित';
    if (val === true) return 'सत्य';
    if (val === false) return 'असत्य';

    if (typeof val === 'number') {
        return toDevanagariDigits(val);
    }

    if (typeof val === 'string') {
        return val;
    }

    if (Array.isArray(val)) {
        return '[' + val.map(formatValue).join(', ') + ']';
    }

    if (val instanceof SanskritInstance) {
        const entries = [];
        for (const [k, v] of val.fields.entries()) {
            entries.push(`${k}: ${formatValue(v)}`);
        }
        return `${val.sanskritClass.name} { ${entries.join(', ')} }`;
    }

    if (val instanceof SanskritClass) {
        return `<वर्ग ${val.name}>`;
    }

    if (val instanceof SanskritFunction) {
        return `<कार्य ${val.name || 'गुमनाम'}>`;
    }

    if (val && typeof val.toString === 'function' && val.toString !== Object.prototype.toString) {
        return val.toString();
    }

    if (typeof val === 'object') {
        const entries = Object.entries(val).map(([k, v]) => `${k}: ${formatValue(v)}`);
        return '{ ' + entries.join(', ') + ' }';
    }

    return String(val);
}

function createBuiltins(outputStream = console.log, interpreter = null) {
    const builtins = new Map();

    function callUserFunction(fn, args) {
        if (!fn) throw new Error('Cannot invoke null or undefined');
        if (fn instanceof SanskritFunction || (fn.constructor && fn.constructor.name === 'SanskritBoundMethod')) {
            if (interpreter) {
                return fn.call(interpreter, args);
            }
        }
        if (typeof fn === 'function') {
            return fn(...args);
        }
        if (typeof fn.call === 'function') {
            return fn.call(interpreter || null, args);
        }
        throw new Error(`Value is not a callable function`);
    }

    // मुद्रण (print)
    builtins.set('मुद्रण', (...args) => {
        const formatted = args.map(formatValue).join(' ');
        outputStream(formatted);
        return undefined;
    });

    // लंबाई (length)
    builtins.set('लंबाई', (obj) => {
        if (typeof obj === 'string' || Array.isArray(obj)) {
            return obj.length;
        }
        if (obj instanceof SanskritInstance) {
            return obj.fields.size;
        }
        if (obj && typeof obj === 'object') {
            return Object.keys(obj).length;
        }
        return 0;
    });

    // प्रकार (typeof)
    builtins.set('प्रकार', (obj) => {
        if (obj === null) return 'शून्य';
        if (obj === undefined) return 'अपरिभाषित';
        if (typeof obj === 'boolean') return 'बूलियन';
        if (typeof obj === 'number') return 'संख्या';
        if (typeof obj === 'string') return 'स्ट्रिंग';
        if (Array.isArray(obj)) return 'सूची';
        if (obj instanceof SanskritFunction || typeof obj === 'function') return 'कार्य';
        if (obj instanceof SanskritClass) return 'वर्ग';
        if (obj instanceof SanskritInstance || typeof obj === 'object') return 'वस्तु';
        return typeof obj;
    });

    // पार्स_संख्या (parse number)
    builtins.set('पार्स_संख्या', (str) => {
        return parseToNumber(str);
    });

    // Type casting
    builtins.set('स्ट्रिंग', (val) => formatValue(val));
    builtins.set('संख्या', (val) => parseToNumber(val) || 0);
    builtins.set('बूलियन', (val) => Boolean(val));

    // गणित (Math) utilities
    builtins.set('गणित_वर्ग', (x) => Math.sqrt(x));
    builtins.set('गणित_शक्ति', (base, exp) => Math.pow(base, exp));
    builtins.set('गणित_न्यूनतम', (...args) => {
        if (args.length === 1) return Math.floor(args[0]);
        return Math.min(...args);
    });
    builtins.set('गणित_अधिकतम', (...args) => Math.max(...args));
    builtins.set('गणित_पूर्णांक', (x) => Math.floor(x));
    builtins.set('गणित_तली', (x) => Math.floor(x));
    builtins.set('गणित_छत', (x) => Math.ceil(x));
    builtins.set('गणित_गोल', (x) => Math.round(x));
    builtins.set('गणित_यादृच्छिक', () => Math.random());

    // Pythonic & Functional Utilities
    // श्रेणी (range)
    builtins.set('श्रेणी', (...args) => {
        let start = 0, stop = 0, step = 1;
        if (args.length === 1) {
            stop = Number(args[0]) || 0;
        } else if (args.length === 2) {
            start = Number(args[0]) || 0;
            stop = Number(args[1]) || 0;
        } else if (args.length >= 3) {
            start = Number(args[0]) || 0;
            stop = Number(args[1]) || 0;
            step = Number(args[2]) || 1;
        }
        if (step === 0) throw new Error('श्रेणी (range) step cannot be zero');
        const result = [];
        if (step > 0) {
            for (let i = start; i < stop; i += step) result.push(i);
        } else {
            for (let i = start; i > stop; i += step) result.push(i);
        }
        return result;
    });

    // मानचित्रण (map)
    builtins.set('मानचित्रण', (arg1, arg2) => {
        const fn = typeof arg1 === 'function' || (arg1 && arg1 instanceof SanskritFunction) ? arg1 : arg2;
        const list = fn === arg1 ? arg2 : arg1;
        if (!list || typeof list[Symbol.iterator] !== 'function') {
            throw new Error('मानचित्रण (map) requires an iterable collection');
        }
        const result = [];
        let idx = 0;
        for (const item of list) {
            result.push(callUserFunction(fn, [item, idx++]));
        }
        return result;
    });

    // शोधन (filter)
    builtins.set('शोधन', (arg1, arg2) => {
        const fn = typeof arg1 === 'function' || (arg1 && arg1 instanceof SanskritFunction) ? arg1 : arg2;
        const list = fn === arg1 ? arg2 : arg1;
        if (!list || typeof list[Symbol.iterator] !== 'function') {
            throw new Error('शोधन (filter) requires an iterable collection');
        }
        const result = [];
        let idx = 0;
        for (const item of list) {
            const keep = callUserFunction(fn, [item, idx++]);
            if (keep) result.push(item);
        }
        return result;
    });

    // संक्षिप्त (reduce)
    builtins.set('संक्षिप्त', (fn, list, initial) => {
        if (!list || typeof list[Symbol.iterator] !== 'function') {
            throw new Error('संक्षिप्त (reduce) requires an iterable collection');
        }
        const arr = Array.isArray(list) ? list : Array.from(list);
        let accumulator = initial;
        let startIdx = 0;
        if (accumulator === undefined) {
            if (arr.length === 0) throw new Error('संक्षिप्त (reduce) of empty sequence with no initial value');
            accumulator = arr[0];
            startIdx = 1;
        }
        for (let i = startIdx; i < arr.length; i++) {
            accumulator = callUserFunction(fn, [accumulator, arr[i], i]);
        }
        return accumulator;
    });

    // योग (sum)
    builtins.set('योग', (coll, start = 0) => {
        if (!coll || typeof coll[Symbol.iterator] !== 'function') return Number(coll) || 0;
        let total = start;
        for (const x of coll) total += Number(x) || 0;
        return total;
    });

    // सभी (all)
    builtins.set('सभी', (coll) => {
        if (!coll || typeof coll[Symbol.iterator] !== 'function') return Boolean(coll);
        for (const x of coll) {
            if (!x) return false;
        }
        return true;
    });

    // कोई (any)
    builtins.set('कोई', (coll) => {
        if (!coll || typeof coll[Symbol.iterator] !== 'function') return Boolean(coll);
        for (const x of coll) {
            if (x) return true;
        }
        return false;
    });

    // उलटा (reversed)
    builtins.set('उलटा', (coll) => {
        if (typeof coll === 'string') return coll.split('').reverse().join('');
        if (Array.isArray(coll)) return [...coll].reverse();
        if (coll && typeof coll[Symbol.iterator] === 'function') return Array.from(coll).reverse();
        return coll;
    });

    // क्रमबद्ध (sorted)
    builtins.set('क्रमबद्ध', (coll, keyFn = null) => {
        const arr = Array.isArray(coll) ? [...coll] : Array.from(coll || []);
        if (keyFn) {
            return arr.sort((a, b) => {
                const ka = callUserFunction(keyFn, [a]);
                const kb = callUserFunction(keyFn, [b]);
                return ka < kb ? -1 : (ka > kb ? 1 : 0);
            });
        }
        return arr.sort((a, b) => (a < b ? -1 : (a > b ? 1 : 0)));
    });

    // संयोजन (zip)
    builtins.set('संयोजन', (...iterables) => {
        if (iterables.length === 0) return [];
        const arrays = iterables.map(it => Array.isArray(it) ? it : Array.from(it || []));
        const minLen = Math.min(...arrays.map(a => a.length));
        const result = [];
        for (let i = 0; i < minLen; i++) {
            result.push(arrays.map(a => a[i]));
        }
        return result;
    });

    // क्रमांकन (enumerate)
    builtins.set('क्रमांकन', (coll, start = 0) => {
        if (!coll || typeof coll[Symbol.iterator] !== 'function') return [];
        const result = [];
        let idx = Number(start) || 0;
        for (const item of coll) {
            result.push([idx++, item]);
        }
        return result;
    });

    // समय & प्रतीक्षा
    builtins.set('समय', () => Date.now());
    builtins.set('प्रतीक्षा', async (ms) => new Promise(resolve => setTimeout(resolve, ms)));

    // =========================================================================
    // Sanskrit Next v2.0 AI/ML First-Class Primitives: Tensor & Autodiff
    // =========================================================================
    class SanskritTensor {
        constructor(data, shape) {
            this.data = Array.isArray(data) ? data : [data];
            this.shape = Array.isArray(shape) ? shape : [this.data.length];
        }

        static zeros(shape) {
            const size = shape.reduce((a, b) => a * b, 1);
            return new SanskritTensor(new Array(size).fill(0), shape);
        }

        static ones(shape) {
            const size = shape.reduce((a, b) => a * b, 1);
            return new SanskritTensor(new Array(size).fill(1), shape);
        }

        static from_vec(data, shape) {
            return new SanskritTensor(data, shape);
        }

        static from_array(data, shape) {
            return new SanskritTensor(data, shape);
        }

        matmul(other) {
            if (!other || !other.shape) {
                throw new Error('Tensor.matmul expects a valid Tensor operand');
            }
            const [r1, c1] = this.shape;
            const [r2, c2] = other.shape;
            if (c1 !== r2) {
                throw new Error(`Dimension mismatch: cannot multiply [${r1}, ${c1}] by [${r2}, ${c2}]`);
            }
            const out = new Array(r1 * c2).fill(0);
            for (let i = 0; i < r1; i++) {
                for (let j = 0; j < c2; j++) {
                    let sum = 0;
                    for (let k = 0; k < c1; k++) {
                        sum += this.data[i * c1 + k] * other.data[k * c2 + j];
                    }
                    out[i * c2 + j] = sum;
                }
            }
            return new SanskritTensor(out, [r1, c2]);
        }

        add(other) {
            if (other instanceof SanskritTensor) {
                return new SanskritTensor(this.data.map((v, i) => v + (other.data[i] || 0)), this.shape);
            }
            return new SanskritTensor(this.data.map(v => v + other), this.shape);
        }

        sub(other) {
            if (other instanceof SanskritTensor) {
                return new SanskritTensor(this.data.map((v, i) => v - (other.data[i] || 0)), this.shape);
            }
            return new SanskritTensor(this.data.map(v => v - other), this.shape);
        }

        toString() {
            if (this.shape.length === 2) {
                const [rows, cols] = this.shape;
                const lines = [];
                for (let r = 0; r < rows; r++) {
                    const row = this.data.slice(r * cols, (r + 1) * cols);
                    lines.push('  [' + row.join(', ') + ']');
                }
                return `Tensor(shape=[${this.shape.join(', ')}], dtype=F32, data=[\n${lines.join(',\n')}\n])`;
            }
            return `Tensor(shape=[${this.shape.join(', ')}], data=[${this.data.join(', ')}])`;
        }
    }

    function autodiffFn(fn, x) {
        const xVal = typeof x === 'number' ? x : Number(x);
        if (isNaN(xVal)) throw new Error('autodiff expects a numerical point');

        // Central difference forward-mode analytical approximation
        const h = 1e-7;
        const fx = callUserFunction(fn, [xVal]);
        const fxPlus = callUserFunction(fn, [xVal + h]);
        const fxMinus = callUserFunction(fn, [xVal - h]);
        const deriv = (fxPlus - fxMinus) / (2 * h);
        const roundedDeriv = Math.round(deriv * 10000) / 10000;
        return {
            value: fx,
            derivative: roundedDeriv,
            toString: () => `DerivativeResult(value=${fx}, derivative=${roundedDeriv})`
        };
    }

    const mathObj = {
        sqrt: Math.sqrt,
        pow: Math.pow,
        abs: Math.abs,
        sin: Math.sin,
        cos: Math.cos,
        tan: Math.tan,
        exp: Math.exp,
        log: Math.log,
        min: Math.min,
        max: Math.max,
        floor: Math.floor,
        ceil: Math.ceil,
        round: Math.round,
        random: Math.random,
        PI: Math.PI,
        E: Math.E,
        वर्ग: Math.sqrt,
        शक्ति: Math.pow,
        तली: Math.floor,
        छत: Math.ceil,
        गोल: Math.round,
        यादृच्छिक: Math.random
    };

    function assertFn(condition, message = 'Assertion failed') {
        if (!condition) throw new Error('AssertionError (निश्चय): ' + message);
        return true;
    }

    function panicFn(message = 'Program panic') {
        throw new Error('Panic (विफल): ' + message);
    }

    // Register Sanskrit Next v2.0 AI/ML primitives
    builtins.set('Tensor', SanskritTensor);
    builtins.set('दिश', SanskritTensor);
    builtins.set('autodiff', autodiffFn);
    builtins.set('अवकलन', autodiffFn);
    builtins.set('Math', mathObj);
    builtins.set('गणित', mathObj);
    builtins.set('assert', assertFn);
    builtins.set('निश्चय', assertFn);
    builtins.set('panic', panicFn);
    builtins.set('विफल', panicFn);

    // Dual-Script Parity Aliases
    builtins.set('print', builtins.get('मुद्रण'));
    builtins.set('len', builtins.get('लंबाई'));
    builtins.set('length', builtins.get('लंबाई'));
    builtins.set('typeof', builtins.get('प्रकार'));
    builtins.set('range', builtins.get('श्रेणी'));
    builtins.set('map', builtins.get('मानचित्रण'));
    builtins.set('filter', builtins.get('शोधन'));
    builtins.set('reduce', builtins.get('संक्षिप्त'));
    builtins.set('sum', builtins.get('योग'));
    builtins.set('all', builtins.get('सभी'));
    builtins.set('any', builtins.get('कोई'));
    builtins.set('zip', builtins.get('संयोजन'));
    builtins.set('enumerate', builtins.get('क्रमांकन'));
    builtins.set('time', builtins.get('समय'));
    builtins.set('sleep', builtins.get('प्रतीक्षा'));

    return builtins;
}

module.exports = {
    createBuiltins,
    formatValue,
    toDevanagariDigits,
    parseToNumber
};

    });

    define('src/runtime/interpreter.js', function(require, module, exports) {
// Sanskrit Language Interpreter
const { Environment } = require('./environment');
const { ControlFlowSignal, ReturnSignal, BreakSignal, ContinueSignal, ThrowSignal } = require('./signals');
const { SanskritFunction, SanskritClass, SanskritInstance, SanskritBoundMethod } = require('./values');
const { createBuiltins, formatValue } = require('./builtins');
const { NodeTypes } = require('../ast/node-types');
const { RuntimeError, TypeError, NameError } = require('../diagnostics/errors');

class Interpreter {
    constructor(options = {}) {
        this.filename = options.filename || '<anonymous>';
        this.outputStream = options.outputStream || console.log;
        this.globalEnv = new Environment();
        this.setupGlobals();
    }

    setupGlobals() {
        const builtinsEnv = new Environment();

        // Built-in constants
        builtinsEnv.declare('सत्य', true, true);
        builtinsEnv.declare('असत्य', false, true);
        builtinsEnv.declare('शून्य', null, true);
        builtinsEnv.declare('अपरिभाषित', undefined, true);
        builtinsEnv.declare('अनंत', Infinity, true);
        builtinsEnv.declare('NaN', NaN, true);

        // Standard built-in functions
        const builtins = createBuiltins(this.outputStream, this);
        for (const [name, fn] of builtins.entries()) {
            builtinsEnv.declare(name, fn, false);
        }

        this.globalEnv = builtinsEnv.createChild();
    }

    interpret(ast) {
        return this.execute(ast, this.globalEnv);
    }

    execute(node, env) {
        if (!node) return undefined;

        switch (node.type) {
            case NodeTypes.PROGRAM: {
                let result = undefined;
                for (const stmt of node.body) {
                    result = this.execute(stmt, env);
                }
                return result;
            }

            case NodeTypes.BLOCK_STATEMENT: {
                const blockEnv = env.createChild();
                let result = undefined;
                for (const stmt of node.body) {
                    result = this.execute(stmt, blockEnv);
                }
                return result;
            }

            case NodeTypes.VARIABLE_DECLARATION: {
                const initVal = node.init ? this.evaluate(node.init, env) : undefined;
                env.declare(node.id.name, initVal, node.isConstant, node.loc);
                return initVal;
            }

            case NodeTypes.FUNCTION_DECLARATION: {
                const func = new SanskritFunction(
                    node.id.name,
                    node.params.map(p => p.name),
                    node.body,
                    env
                );
                env.declare(node.id.name, func, false, node.loc);
                return func;
            }

            case NodeTypes.CLASS_DECLARATION: {
                let parentClass = null;
                if (node.superClass) {
                    parentClass = env.lookup(node.superClass.name, node.superClass.loc);
                    if (!(parentClass instanceof SanskritClass)) {
                        throw new TypeError(`'${node.superClass.name}' is not a class and cannot be extended`, {
                            filename: this.filename,
                            line: node.superClass.loc ? node.superClass.loc.line : 1,
                            column: node.superClass.loc ? node.superClass.loc.column : 1
                        });
                    }
                }

                const cls = new SanskritClass(node.id.name, parentClass);
                cls.closure = env;

                for (const method of node.body) {
                    if (method.isConstructor) {
                        cls.constructorMethod = method;
                    } else if (method.isStatic) {
                        cls.staticMethods.set(method.id.name, method);
                    } else {
                        cls.methods.set(method.id.name, method);
                    }
                }

                env.declare(node.id.name, cls, false, node.loc);
                return cls;
            }

            case NodeTypes.EXPRESSION_STATEMENT: {
                return this.evaluate(node.expression, env);
            }

            case NodeTypes.IF_STATEMENT: {
                const condition = this.evaluate(node.test, env);
                if (this.isTruthy(condition)) {
                    return this.execute(node.consequent, env);
                } else if (node.alternate) {
                    return this.execute(node.alternate, env);
                }
                return undefined;
            }

            case NodeTypes.WHILE_STATEMENT: {
                let result = undefined;
                while (this.isTruthy(this.evaluate(node.test, env))) {
                    try {
                        result = this.execute(node.body, env);
                    } catch (signal) {
                        if (signal instanceof BreakSignal) break;
                        if (signal instanceof ContinueSignal) continue;
                        throw signal;
                    }
                }
                return result;
            }

            case NodeTypes.FOR_STATEMENT: {
                const forEnv = env.createChild();
                if (node.init) {
                    if (node.init.type === NodeTypes.VARIABLE_DECLARATION) {
                        this.execute(node.init, forEnv);
                    } else {
                        this.evaluate(node.init, forEnv);
                    }
                }

                let result = undefined;
                while (!node.test || this.isTruthy(this.evaluate(node.test, forEnv))) {
                    try {
                        result = this.execute(node.body, forEnv);
                    } catch (signal) {
                        if (signal instanceof BreakSignal) break;
                        if (signal instanceof ContinueSignal) {
                            // Continue goes to update step
                        } else {
                            throw signal;
                        }
                    }

                    if (node.update) {
                        this.evaluate(node.update, forEnv);
                    }
                }
                return result;
            }

            case NodeTypes.FOR_EACH_STATEMENT: {
                const collection = this.evaluate(node.right, env);
                let items = [];

                if (Array.isArray(collection)) {
                    items = collection;
                } else if (typeof collection === 'string') {
                    items = Array.from(collection);
                } else if (collection instanceof SanskritInstance) {
                    items = Array.from(collection.fields.keys());
                } else if (collection && typeof collection === 'object') {
                    items = Object.keys(collection);
                }

                let result = undefined;
                for (const item of items) {
                    const loopEnv = env.createChild();
                    loopEnv.declare(node.left.name, item, false, node.loc);

                    try {
                        result = this.execute(node.body, loopEnv);
                    } catch (signal) {
                        if (signal instanceof BreakSignal) break;
                        if (signal instanceof ContinueSignal) continue;
                        throw signal;
                    }
                }
                return result;
            }

            case NodeTypes.RETURN_STATEMENT: {
                const val = node.argument ? this.evaluate(node.argument, env) : undefined;
                throw new ReturnSignal(val);
            }

            case NodeTypes.BREAK_STATEMENT: {
                throw new BreakSignal();
            }

            case NodeTypes.CONTINUE_STATEMENT: {
                throw new ContinueSignal();
            }

            case NodeTypes.TRY_STATEMENT: {
                try {
                    return this.execute(node.block, env);
                } catch (err) {
                    if (err instanceof ControlFlowSignal && !(err instanceof ThrowSignal)) {
                        throw err; // Let return/break/continue propagate unless finally runs
                    }

                    if (node.handler) {
                        const catchEnv = env.createChild();
                        const caughtVal = err instanceof ThrowSignal ? err.value : err.message;
                        catchEnv.declare(node.handler.param.name, caughtVal, false, node.handler.loc);
                        return this.execute(node.handler.body, catchEnv);
                    } else {
                        throw err;
                    }
                } finally {
                    if (node.finalizer) {
                        this.execute(node.finalizer, env);
                    }
                }
            }

            case NodeTypes.THROW_STATEMENT: {
                const val = this.evaluate(node.argument, env);
                throw new ThrowSignal(val, node.loc);
            }

            default:
                return this.evaluate(node, env);
        }
    }

    evaluate(node, env) {
        if (!node) return undefined;

        switch (node.type) {
            case NodeTypes.NUMERIC_LITERAL:
                return node.value;

            case NodeTypes.STRING_LITERAL:
                return node.value;

            case NodeTypes.BOOLEAN_LITERAL:
                return node.value;

            case NodeTypes.NULL_LITERAL:
                return null;

            case NodeTypes.UNDEFINED_LITERAL:
                return undefined;

            case NodeTypes.IDENTIFIER:
                return env.lookup(node.name, node.loc);

            case NodeTypes.THIS_EXPRESSION:
                return env.lookup('स्व', node.loc);

            case NodeTypes.SUPER_EXPRESSION:
                return env.lookup('सुपर', node.loc);

            case NodeTypes.ARRAY_LITERAL:
                return node.elements.map(elem => this.evaluate(elem, env));

            case NodeTypes.OBJECT_LITERAL: {
                const obj = {};
                for (const prop of node.properties) {
                    const key = prop.key.type === NodeTypes.IDENTIFIER ? prop.key.name : prop.key.value;
                    obj[key] = this.evaluate(prop.value, env);
                }
                return obj;
            }

            case NodeTypes.NEW_EXPRESSION: {
                const callee = this.evaluate(node.callee, env);
                if (!(callee instanceof SanskritClass)) {
                    const name = node.callee.name || 'Object';
                    throw new TypeError(`'${name}' is not a class and cannot be instantiated with 'नया'`, {
                        filename: this.filename,
                        line: node.loc ? node.loc.line : 1,
                        column: node.loc ? node.loc.column : 1,
                        hint: `Define '${name}' using 'वर्ग ${name} { ... }'`
                    });
                }
                const args = node.arguments.map(arg => this.evaluate(arg, env));
                return callee.instantiate(this, args, node.loc);
            }

            case NodeTypes.CALL_EXPRESSION: {
                let fn;
                let target = null;

                if (node.callee.type === NodeTypes.MEMBER_EXPRESSION) {
                    target = this.evaluate(node.callee.object, env);
                    const prop = node.callee.computed
                        ? this.evaluate(node.callee.property, env)
                        : node.callee.property.name;

                    if (target instanceof SanskritInstance || target instanceof SanskritClass) {
                        fn = target.get(prop, node.loc);
                    } else if (target !== null && target !== undefined) {
                        fn = target[prop];
                    }
                } else {
                    fn = this.evaluate(node.callee, env);
                }

                const evaluatedArgs = node.arguments.map(arg => this.evaluate(arg, env));

                if (fn instanceof SanskritFunction) {
                    return fn.call(this, evaluatedArgs, node.loc);
                }
                if (fn instanceof SanskritBoundMethod) {
                    return fn.call(this, evaluatedArgs, node.loc);
                }
                if (typeof fn === 'function') {
                    return fn.apply(target, evaluatedArgs);
                }

                const calleeName = node.callee.name || (node.callee.property ? node.callee.property.name : 'expression');
                throw new TypeError(`'${calleeName}' is not a function`, {
                    filename: this.filename,
                    line: node.loc ? node.loc.line : 1,
                    column: node.loc ? node.loc.column : 1,
                    hint: `Check that '${calleeName}' is defined as a function or method`
                });
            }

            case NodeTypes.MEMBER_EXPRESSION: {
                const object = this.evaluate(node.object, env);

                if (node.property.type === NodeTypes.SLICE_EXPRESSION) {
                    return this.evaluateSlice(object, node.property, env);
                }

                const property = node.computed
                    ? this.evaluate(node.property, env)
                    : node.property.name;

                if (property && property.isSlice) {
                    return this.evaluateSlice(object, property, env);
                }

                if (object === null || object === undefined) {
                    throw new TypeError(`Cannot read property '${property}' of ${object}`, {
                        filename: this.filename,
                        line: node.loc ? node.loc.line : 1,
                        column: node.loc ? node.loc.column : 1
                    });
                }

                if (object instanceof SanskritInstance || object instanceof SanskritClass) {
                    return object.get(property, node.loc);
                }

                return object[property];
            }

            case NodeTypes.ASSIGNMENT_EXPRESSION: {
                const value = this.evaluate(node.right, env);

                if (node.left.type === NodeTypes.IDENTIFIER) {
                    const varName = node.left.name;
                    if (node.operator === '=') {
                        return env.assign(varName, value, node.loc);
                    }
                    const currentVal = env.lookup(varName, node.loc);
                    const newVal = this.applyCompound(currentVal, value, node.operator, node.loc);
                    return env.assign(varName, newVal, node.loc);
                }

                if (node.left.type === NodeTypes.MEMBER_EXPRESSION) {
                    const targetObj = this.evaluate(node.left.object, env);
                    const prop = node.left.computed
                        ? this.evaluate(node.left.property, env)
                        : node.left.property.name;

                    if (targetObj === null || targetObj === undefined) {
                        throw new TypeError(`Cannot set property '${prop}' of ${targetObj}`, {
                            filename: this.filename,
                            line: node.loc ? node.loc.line : 1,
                            column: node.loc ? node.loc.column : 1
                        });
                    }

                    if (node.operator === '=') {
                        if (targetObj instanceof SanskritInstance) {
                            return targetObj.set(prop, value);
                        }
                        targetObj[prop] = value;
                        return value;
                    }

                    const currentVal = targetObj instanceof SanskritInstance
                        ? targetObj.get(prop, node.loc)
                        : targetObj[prop];
                    const newVal = this.applyCompound(currentVal, value, node.operator, node.loc);

                    if (targetObj instanceof SanskritInstance) {
                        return targetObj.set(prop, newVal);
                    }
                    targetObj[prop] = newVal;
                    return newVal;
                }

                throw new RuntimeError(`Invalid target in assignment expression`, {
                    filename: this.filename,
                    line: node.loc ? node.loc.line : 1,
                    column: node.loc ? node.loc.column : 1
                });
            }

            case NodeTypes.UPDATE_EXPRESSION: {
                if (node.argument.type === NodeTypes.IDENTIFIER) {
                    const varName = node.argument.name;
                    const currentVal = env.lookup(varName, node.loc);
                    const delta = node.operator === '++' ? 1 : -1;
                    const newVal = currentVal + delta;
                    env.assign(varName, newVal, node.loc);
                    return node.prefix ? newVal : currentVal;
                }

                if (node.argument.type === NodeTypes.MEMBER_EXPRESSION) {
                    const targetObj = this.evaluate(node.argument.object, env);
                    const prop = node.argument.computed
                        ? this.evaluate(node.argument.property, env)
                        : node.argument.property.name;

                    const currentVal = targetObj instanceof SanskritInstance
                        ? targetObj.get(prop, node.loc)
                        : targetObj[prop];
                    const delta = node.operator === '++' ? 1 : -1;
                    const newVal = currentVal + delta;

                    if (targetObj instanceof SanskritInstance) {
                        targetObj.set(prop, newVal);
                    } else {
                        targetObj[prop] = newVal;
                    }

                    return node.prefix ? newVal : currentVal;
                }

                throw new RuntimeError(`Invalid operand in update expression`, {
                    filename: this.filename,
                    line: node.loc ? node.loc.line : 1,
                    column: node.loc ? node.loc.column : 1
                });
            }

            case NodeTypes.BINARY_EXPRESSION: {
                const left = this.evaluate(node.left, env);
                const right = this.evaluate(node.right, env);

                switch (node.operator) {
                    case '+': return left + right;
                    case '-': return left - right;
                    case '*': return left * right;
                    case '/': return left / right;
                    case '%': return left % right;
                    case '**': return Math.pow(left, right);
                    case '===': return left === right;
                    case '!==': return left !== right;
                    case '==': return left == right;
                    case '!=': return left != right;
                    case '<': return left < right;
                    case '>': return left > right;
                    case '<=': return left <= right;
                    case '>=': return left >= right;
                    case '&': return left & right;
                    case '|': return left | right;
                    case '^': return left ^ right;
                    case '<<': return left << right;
                    case '>>': return left >> right;
                    case '>>>': return left >>> right;
                    default:
                        throw new RuntimeError(`Unknown binary operator: '${node.operator}'`, {
                            filename: this.filename,
                            line: node.loc ? node.loc.line : 1,
                            column: node.loc ? node.loc.column : 1
                        });
                }
            }

            case NodeTypes.LOGICAL_EXPRESSION: {
                const left = this.evaluate(node.left, env);

                if (node.operator === '&&' || node.operator === 'और') {
                    return this.isTruthy(left) ? this.evaluate(node.right, env) : left;
                }
                if (node.operator === '||' || node.operator === 'या') {
                    return this.isTruthy(left) ? left : this.evaluate(node.right, env);
                }

                throw new RuntimeError(`Unknown logical operator: '${node.operator}'`, {
                    filename: this.filename,
                    line: node.loc ? node.loc.line : 1,
                    column: node.loc ? node.loc.column : 1
                });
            }

            case NodeTypes.UNARY_EXPRESSION: {
                const operand = this.evaluate(node.argument, env);

                switch (node.operator) {
                    case '+': return +operand;
                    case '-': return -operand;
                    case '!': return !this.isTruthy(operand);
                    case '~': return ~operand;
                    default:
                        throw new RuntimeError(`Unknown unary operator: '${node.operator}'`, {
                            filename: this.filename,
                            line: node.loc ? node.loc.line : 1,
                            column: node.loc ? node.loc.column : 1
                        });
                }
            }

            case NodeTypes.SLICE_EXPRESSION: {
                return {
                    isSlice: true,
                    start: node.start ? this.evaluate(node.start, env) : null,
                    stop: node.stop ? this.evaluate(node.stop, env) : null,
                    step: node.step ? this.evaluate(node.step, env) : null
                };
            }

            case NodeTypes.COMPREHENSION: {
                const collection = this.evaluate(node.collection, env);
                if (!collection || typeof collection[Symbol.iterator] !== 'function') {
                    throw new TypeError(`Target in comprehension is not iterable`, {
                        filename: this.filename,
                        line: node.loc ? node.loc.line : 1,
                        column: node.loc ? node.loc.column : 1
                    });
                }

                const result = [];
                for (const item of collection) {
                    const compEnv = env.createChild();
                    compEnv.declare(node.variable.name, item, false, node.variable.loc);

                    if (node.filterCondition) {
                        const keep = this.evaluate(node.filterCondition, compEnv);
                        if (!this.isTruthy(keep)) {
                            continue;
                        }
                    }

                    result.push(this.evaluate(node.expression, compEnv));
                }

                return result;
            }

            case NodeTypes.ARROW_FUNCTION: {
                return new SanskritFunction(
                    null,
                    node.params.map(p => p.name),
                    node.body,
                    env,
                    node.isExpressionBody
                );
            }

            case NodeTypes.CONDITIONAL_EXPRESSION: {
                const test = this.evaluate(node.test, env);
                if (this.isTruthy(test)) {
                    return this.evaluate(node.consequent, env);
                } else {
                    return this.evaluate(node.alternate, env);
                }
            }

            default:
                throw new RuntimeError(`Unknown AST node type: '${node.type}'`, {
                    filename: this.filename,
                    line: node.loc ? node.loc.line : 1,
                    column: node.loc ? node.loc.column : 1
                });
        }
    }

    evaluateSlice(object, slice, env) {
        if (object === null || object === undefined) {
            throw new TypeError(`Cannot slice ${object}`, {
                filename: this.filename,
                line: slice.loc ? slice.loc.line : 1,
                column: slice.loc ? slice.loc.column : 1
            });
        }

        const isStr = typeof object === 'string';
        const isArr = Array.isArray(object);

        if (!isStr && !isArr) {
            throw new TypeError(`Object of type '${typeof object}' is not sliceable`, {
                filename: this.filename,
                line: slice.loc ? slice.loc.line : 1,
                column: slice.loc ? slice.loc.column : 1
            });
        }

        const len = object.length;
        let start = slice.start;
        let stop = slice.stop;
        let step = slice.step;

        // If AST nodes, evaluate them
        if (start && typeof start === 'object' && start.type) start = this.evaluate(start, env);
        if (stop && typeof stop === 'object' && stop.type) stop = this.evaluate(stop, env);
        if (step && typeof step === 'object' && step.type) step = this.evaluate(step, env);

        if (step === null || step === undefined) {
            step = 1;
        }

        if (step === 0) {
            throw new RuntimeError(`Slice step cannot be zero`, {
                filename: this.filename,
                line: slice.loc ? slice.loc.line : 1,
                column: slice.loc ? slice.loc.column : 1
            });
        }

        let startIndex, stopIndex;
        if (step > 0) {
            startIndex = start === null ? 0 : (start < 0 ? Math.max(0, len + start) : Math.min(len, start));
            stopIndex = stop === null ? len : (stop < 0 ? Math.max(0, len + stop) : Math.min(len, stop));
        } else {
            startIndex = start === null ? len - 1 : (start < 0 ? Math.max(-1, len + start) : Math.min(len - 1, start));
            stopIndex = stop === null ? -1 : (stop < 0 ? Math.max(-1, len + stop) : Math.min(len, stop));
        }

        const result = [];
        if (step > 0) {
            for (let i = startIndex; i < stopIndex; i += step) {
                result.push(object[i]);
            }
        } else {
            for (let i = startIndex; i > stopIndex; i += step) {
                result.push(object[i]);
            }
        }

        return isStr ? result.join('') : result;
    }

    applyCompound(left, right, operator, loc) {
        switch (operator) {
            case '+=': return left + right;
            case '-=': return left - right;
            case '*=': return left * right;
            case '/=': return left / right;
            case '%=': return left % right;
            case '**=': return Math.pow(left, right);
            default:
                throw new RuntimeError(`Unknown compound assignment operator: '${operator}'`, {
                    filename: this.filename,
                    line: loc ? loc.line : 1,
                    column: loc ? loc.column : 1
                });
        }
    }

    isTruthy(val) {
        if (val === null || val === undefined) return false;
        if (typeof val === 'boolean') return val;
        if (typeof val === 'number') return val !== 0 && !isNaN(val);
        if (typeof val === 'string') return val.length > 0;
        return true;
    }
}

module.exports = { Interpreter };

    });

    define('src/runtime/index.js', function(require, module, exports) {
// Sanskrit Language Runtime Module Exports
const { Environment } = require('./environment');
const { Interpreter } = require('./interpreter');
const { ControlFlowSignal, ReturnSignal, BreakSignal, ContinueSignal, ThrowSignal } = require('./signals');
const { SanskritFunction, SanskritClass, SanskritInstance, SanskritBoundMethod } = require('./values');
const { createBuiltins, formatValue, toDevanagariDigits, parseToNumber } = require('./builtins');

module.exports = {
    Environment,
    Interpreter,
    ControlFlowSignal,
    ReturnSignal,
    BreakSignal,
    ContinueSignal,
    ThrowSignal,
    SanskritFunction,
    SanskritClass,
    SanskritInstance,
    SanskritBoundMethod,
    createBuiltins,
    formatValue,
    toDevanagariDigits,
    parseToNumber
};

    });

    define('src/vm/opcodes.js', function(require, module, exports) {
// Sanskrit Bytecode Virtual Machine Opcodes
const Opcodes = {
    // Literals & Constants
    OP_CONSTANT: 1,
    OP_NULL: 2,
    OP_UNDEFINED: 3,
    OP_TRUE: 4,
    OP_FALSE: 5,

    // Stack Operations
    OP_POP: 6,
    OP_DUP: 7,

    // Variables & Scopes
    OP_GET_GLOBAL: 8,
    OP_SET_GLOBAL: 9,
    OP_DEFINE_GLOBAL: 10,
    OP_GET_LOCAL: 11,
    OP_SET_LOCAL: 12,

    // Binary Arithmetic Operators
    OP_ADD: 13,
    OP_SUBTRACT: 14,
    OP_MULTIPLY: 15,
    OP_DIVIDE: 16,
    OP_MODULO: 17,
    OP_POWER: 18,

    // Unary Operators
    OP_NEGATE: 19,
    OP_NOT: 20,

    // Comparisons
    OP_EQUAL: 21,
    OP_NOT_EQUAL: 22,
    OP_STRICT_EQUAL: 23,
    OP_STRICT_NOT_EQUAL: 24,
    OP_GREATER: 25,
    OP_GREATER_EQUAL: 26,
    OP_LESS: 27,
    OP_LESS_EQUAL: 28,

    // Control Flow & Branching
    OP_JUMP: 29,
    OP_JUMP_IF_FALSE: 30,
    OP_LOOP: 31,

    // Functions & Execution
    OP_CLOSURE: 32,
    OP_CALL: 33,
    OP_RETURN: 34,

    // Data Structures
    OP_BUILD_LIST: 35,
    OP_BUILD_MAP: 36,
    OP_GET_INDEX: 37,
    OP_SET_INDEX: 38,
    OP_SLICE: 39,

    // Native / Halting
    OP_PRINT: 40,
    OP_HALT: 41
};

// Inverted lookup map for disassembly
const OpcodeNames = Object.fromEntries(
    Object.entries(Opcodes).map(([name, code]) => [code, name])
);

module.exports = {
    Opcodes,
    OpcodeNames
};

    });

    define('src/vm/chunk.js', function(require, module, exports) {
// Sanskrit Bytecode Chunk
const { Opcodes, OpcodeNames } = require('./opcodes');

class Chunk {
    constructor(name = '<script>') {
        this.name = name;
        this.code = [];
        this.constants = [];
        this.lines = [];
    }

    write(byte, line = 1) {
        this.code.push(byte);
        this.lines.push(line);
        return this.code.length - 1;
    }

    addConstant(value) {
        this.constants.push(value);
        return this.constants.length - 1;
    }

    disassemble(label = null) {
        const header = `== Disassembly: ${label || this.name} ==`;
        const lines = [header];
        let offset = 0;

        while (offset < this.code.length) {
            const [disassembled, nextOffset] = this.disassembleInstruction(offset);
            lines.push(disassembled);
            offset = nextOffset;
        }

        return lines.join('\n');
    }

    disassembleInstruction(offset) {
        const op = this.code[offset];
        const opName = OpcodeNames[op] || `UNKNOWN(${op})`;
        const line = this.lines[offset];
        const offsetStr = String(offset).padStart(4, '0');

        switch (op) {
            case Opcodes.OP_CONSTANT:
            case Opcodes.OP_GET_GLOBAL:
            case Opcodes.OP_SET_GLOBAL:
            case Opcodes.OP_DEFINE_GLOBAL: {
                const constIdx = this.code[offset + 1];
                const val = JSON.stringify(this.constants[constIdx]);
                return [`${offsetStr}  ${opName.padEnd(16)} [idx: ${constIdx}] -> ${val}`, offset + 2];
            }

            case Opcodes.OP_GET_LOCAL:
            case Opcodes.OP_SET_LOCAL:
            case Opcodes.OP_CALL:
            case Opcodes.OP_BUILD_LIST:
            case Opcodes.OP_BUILD_MAP: {
                const operand = this.code[offset + 1];
                return [`${offsetStr}  ${opName.padEnd(16)} ${operand}`, offset + 2];
            }

            case Opcodes.OP_JUMP:
            case Opcodes.OP_JUMP_IF_FALSE: {
                const target = this.code[offset + 1];
                return [`${offsetStr}  ${opName.padEnd(16)} -> ${String(target).padStart(4, '0')}`, offset + 2];
            }

            case Opcodes.OP_LOOP: {
                const target = this.code[offset + 1];
                return [`${offsetStr}  ${opName.padEnd(16)} <- ${String(target).padStart(4, '0')}`, offset + 2];
            }

            case Opcodes.OP_CLOSURE: {
                const constIdx = this.code[offset + 1];
                return [`${offsetStr}  ${opName.padEnd(16)} [proto idx: ${constIdx}]`, offset + 2];
            }

            default:
                return [`${offsetStr}  ${opName}`, offset + 1];
        }
    }
}

module.exports = { Chunk };

    });

    define('src/vm/compiler.js', function(require, module, exports) {
// Sanskrit AST to Bytecode Compiler
const { Opcodes } = require('./opcodes');
const { Chunk } = require('./chunk');
const { NodeTypes } = require('../ast/node-types');
const { RuntimeError } = require('../diagnostics/errors');

class Local {
    constructor(name, depth) {
        this.name = name;
        this.depth = depth;
    }
}

class BytecodeCompiler {
    constructor(parent = null, functionType = 'TYPE_SCRIPT') {
        this.parent = parent;
        this.functionType = functionType;
        this.chunk = new Chunk();
        this.locals = [];
        this.scopeDepth = 0;
        this.loopContexts = [];

        // Claim slot 0 for function closure / call frame
        this.locals.push(new Local('', 0));
    }

    compile(ast) {
        this.visit(ast);
        this.emitReturn();
        return this.chunk;
    }

    emit(byte, line = 1) {
        return this.chunk.write(byte, line);
    }

    emitConstant(value, line = 1) {
        const constIdx = this.chunk.addConstant(value);
        this.emit(Opcodes.OP_CONSTANT, line);
        this.emit(constIdx, line);
    }

    emitJump(instruction, line = 1) {
        this.emit(instruction, line);
        return this.emit(0xff, line); // Placeholder jump offset
    }

    patchJump(offset) {
        this.chunk.code[offset] = this.chunk.code.length;
    }

    emitLoop(loopStart, line = 1) {
        this.emit(Opcodes.OP_LOOP, line);
        this.emit(loopStart, line);
    }

    emitReturn(line = 1) {
        this.emit(Opcodes.OP_UNDEFINED, line);
        this.emit(Opcodes.OP_RETURN, line);
    }

    beginScope() {
        this.scopeDepth++;
    }

    endScope(line = 1) {
        this.scopeDepth--;
        while (this.locals.length > 0 && this.locals[this.locals.length - 1].depth > this.scopeDepth) {
            this.emit(Opcodes.OP_POP, line);
            this.locals.pop();
        }
    }

    resolveLocal(name) {
        for (let i = this.locals.length - 1; i >= 0; i--) {
            if (this.locals[i].name === name) {
                return i;
            }
        }
        return -1;
    }

    addLocal(name, line = 1) {
        for (let i = this.locals.length - 1; i >= 0; i--) {
            const local = this.locals[i];
            if (local.depth < this.scopeDepth) break;
            if (local.name === name) {
                throw new RuntimeError(`Identifier '${name}' already declared in this scope`, { line });
            }
        }
        this.locals.push(new Local(name, this.scopeDepth));
        return this.locals.length - 1;
    }

    visit(node) {
        if (!node) return;
        const line = (node.loc && node.loc.line) || 1;

        switch (node.type) {
            case NodeTypes.PROGRAM:
                for (const stmt of node.body) {
                    this.visit(stmt);
                }
                break;

            case NodeTypes.BLOCK_STATEMENT:
                this.beginScope();
                for (const stmt of node.body) {
                    this.visit(stmt);
                }
                this.endScope(line);
                break;

            case NodeTypes.EXPRESSION_STATEMENT:
                this.visit(node.expression);
                this.emit(Opcodes.OP_POP, line);
                break;

            case NodeTypes.NUMERIC_LITERAL:
                this.emitConstant(node.value, line);
                break;

            case NodeTypes.STRING_LITERAL:
                this.emitConstant(node.value, line);
                break;

            case NodeTypes.BOOLEAN_LITERAL:
                this.emit(node.value ? Opcodes.OP_TRUE : Opcodes.OP_FALSE, line);
                break;

            case NodeTypes.NULL_LITERAL:
                this.emit(Opcodes.OP_NULL, line);
                break;

            case NodeTypes.UNDEFINED_LITERAL:
                this.emit(Opcodes.OP_UNDEFINED, line);
                break;

            case NodeTypes.IDENTIFIER: {
                const localIdx = this.resolveLocal(node.name);
                if (localIdx !== -1) {
                    this.emit(Opcodes.OP_GET_LOCAL, line);
                    this.emit(localIdx, line);
                } else {
                    const constIdx = this.chunk.addConstant(node.name);
                    this.emit(Opcodes.OP_GET_GLOBAL, line);
                    this.emit(constIdx, line);
                }
                break;
            }

            case NodeTypes.VARIABLE_DECLARATION: {
                const varName = node.id.name;
                if (node.init) {
                    this.visit(node.init);
                } else {
                    this.emit(Opcodes.OP_UNDEFINED, line);
                }

                if (this.scopeDepth > 0) {
                    this.addLocal(varName, line);
                } else {
                    const constIdx = this.chunk.addConstant(varName);
                    this.emit(Opcodes.OP_DEFINE_GLOBAL, line);
                    this.emit(constIdx, line);
                }
                break;
            }

            case NodeTypes.ASSIGNMENT_EXPRESSION: {
                this.visit(node.right);

                if (node.left.type === NodeTypes.IDENTIFIER) {
                    const varName = node.left.name;
                    const localIdx = this.resolveLocal(varName);

                    if (node.operator !== '=') {
                        // Compound assignment: load current value, apply operator
                        if (localIdx !== -1) {
                            this.emit(Opcodes.OP_GET_LOCAL, line);
                            this.emit(localIdx, line);
                        } else {
                            const constIdx = this.chunk.addConstant(varName);
                            this.emit(Opcodes.OP_GET_GLOBAL, line);
                            this.emit(constIdx, line);
                        }
                        this.emitCompoundOp(node.operator, line);
                    }

                    if (localIdx !== -1) {
                        this.emit(Opcodes.OP_SET_LOCAL, line);
                        this.emit(localIdx, line);
                    } else {
                        const constIdx = this.chunk.addConstant(varName);
                        this.emit(Opcodes.OP_SET_GLOBAL, line);
                        this.emit(constIdx, line);
                    }
                } else if (node.left.type === NodeTypes.MEMBER_EXPRESSION) {
                    this.visit(node.left.object);
                    if (node.left.computed) {
                        this.visit(node.left.property);
                    } else {
                        this.emitConstant(node.left.property.name, line);
                    }
                    this.emit(Opcodes.OP_SET_INDEX, line);
                }
                break;
            }

            case NodeTypes.BINARY_EXPRESSION: {
                this.visit(node.left);
                this.visit(node.right);

                switch (node.operator) {
                    case '+': this.emit(Opcodes.OP_ADD, line); break;
                    case '-': this.emit(Opcodes.OP_SUBTRACT, line); break;
                    case '*': this.emit(Opcodes.OP_MULTIPLY, line); break;
                    case '/': this.emit(Opcodes.OP_DIVIDE, line); break;
                    case '%': this.emit(Opcodes.OP_MODULO, line); break;
                    case '**': this.emit(Opcodes.OP_POWER, line); break;
                    case '==': this.emit(Opcodes.OP_EQUAL, line); break;
                    case '!=': this.emit(Opcodes.OP_NOT_EQUAL, line); break;
                    case '===': this.emit(Opcodes.OP_STRICT_EQUAL, line); break;
                    case '!==': this.emit(Opcodes.OP_STRICT_NOT_EQUAL, line); break;
                    case '<': this.emit(Opcodes.OP_LESS, line); break;
                    case '<=': this.emit(Opcodes.OP_LESS_EQUAL, line); break;
                    case '>': this.emit(Opcodes.OP_GREATER, line); break;
                    case '>=': this.emit(Opcodes.OP_GREATER_EQUAL, line); break;
                }
                break;
            }

            case NodeTypes.LOGICAL_EXPRESSION: {
                this.visit(node.left);

                if (node.operator === '||' || node.operator === 'या') {
                    const elseJump = this.emitJump(Opcodes.OP_JUMP_IF_FALSE, line);
                    const endJump = this.emitJump(Opcodes.OP_JUMP, line);

                    this.patchJump(elseJump);
                    this.emit(Opcodes.OP_POP, line);
                    this.visit(node.right);
                    this.patchJump(endJump);
                } else if (node.operator === '&&' || node.operator === 'और') {
                    const endJump = this.emitJump(Opcodes.OP_JUMP_IF_FALSE, line);
                    this.emit(Opcodes.OP_POP, line);
                    this.visit(node.right);
                    this.patchJump(endJump);
                }
                break;
            }

            case NodeTypes.UNARY_EXPRESSION: {
                this.visit(node.argument);
                if (node.operator === '-') {
                    this.emit(Opcodes.OP_NEGATE, line);
                } else if (node.operator === '!' || node.operator === 'नहीं') {
                    this.emit(Opcodes.OP_NOT, line);
                }
                break;
            }

            case NodeTypes.UPDATE_EXPRESSION: {
                if (node.argument.type === NodeTypes.IDENTIFIER) {
                    const varName = node.argument.name;
                    const localIdx = this.resolveLocal(varName);

                    // Load current value
                    if (localIdx !== -1) {
                        this.emit(Opcodes.OP_GET_LOCAL, line);
                        this.emit(localIdx, line);
                    } else {
                        const constIdx = this.chunk.addConstant(varName);
                        this.emit(Opcodes.OP_GET_GLOBAL, line);
                        this.emit(constIdx, line);
                    }

                    if (!node.prefix) {
                        this.emit(Opcodes.OP_DUP, line);
                    }

                    this.emitConstant(1, line);
                    this.emit(node.operator === '++' ? Opcodes.OP_ADD : Opcodes.OP_SUBTRACT, line);

                    if (localIdx !== -1) {
                        this.emit(Opcodes.OP_SET_LOCAL, line);
                        this.emit(localIdx, line);
                    } else {
                        const constIdx = this.chunk.addConstant(varName);
                        this.emit(Opcodes.OP_SET_GLOBAL, line);
                        this.emit(constIdx, line);
                    }

                    if (!node.prefix) {
                        this.emit(Opcodes.OP_POP, line);
                    }
                }
                break;
            }

            case NodeTypes.IF_STATEMENT: {
                this.visit(node.test);
                const thenJump = this.emitJump(Opcodes.OP_JUMP_IF_FALSE, line);
                this.emit(Opcodes.OP_POP, line);

                this.visit(node.consequent);
                const elseJump = this.emitJump(Opcodes.OP_JUMP, line);

                this.patchJump(thenJump);
                this.emit(Opcodes.OP_POP, line);

                if (node.alternate) {
                    this.visit(node.alternate);
                }
                this.patchJump(elseJump);
                break;
            }

            case NodeTypes.CONDITIONAL_EXPRESSION: {
                this.visit(node.test);
                const thenJump = this.emitJump(Opcodes.OP_JUMP_IF_FALSE, line);
                this.emit(Opcodes.OP_POP, line);

                this.visit(node.consequent);
                const elseJump = this.emitJump(Opcodes.OP_JUMP, line);

                this.patchJump(thenJump);
                this.emit(Opcodes.OP_POP, line);

                this.visit(node.alternate);
                this.patchJump(elseJump);
                break;
            }

            case NodeTypes.WHILE_STATEMENT: {
                const loopStart = this.chunk.code.length;
                this.loopContexts.push({ breaks: [], continues: [], start: loopStart });

                this.visit(node.test);
                const exitJump = this.emitJump(Opcodes.OP_JUMP_IF_FALSE, line);
                this.emit(Opcodes.OP_POP, line);

                this.visit(node.body);
                this.emitLoop(loopStart, line);

                this.patchJump(exitJump);
                this.emit(Opcodes.OP_POP, line);

                const loopCtx = this.loopContexts.pop();
                for (const brk of loopCtx.breaks) {
                    this.patchJump(brk);
                }
                break;
            }

            case NodeTypes.BREAK_STATEMENT: {
                if (this.loopContexts.length === 0) {
                    throw new RuntimeError("'तोड़' (break) used outside loop", { line });
                }
                const brkJump = this.emitJump(Opcodes.OP_JUMP, line);
                this.loopContexts[this.loopContexts.length - 1].breaks.push(brkJump);
                break;
            }

            case NodeTypes.CONTINUE_STATEMENT: {
                if (this.loopContexts.length === 0) {
                    throw new RuntimeError("'जारी' (continue) used outside loop", { line });
                }
                const ctx = this.loopContexts[this.loopContexts.length - 1];
                this.emitLoop(ctx.start, line);
                break;
            }

            case NodeTypes.FUNCTION_DECLARATION: {
                const subCompiler = new BytecodeCompiler(this, 'TYPE_FUNCTION');
                subCompiler.chunk.name = node.id ? node.id.name : '<anonymous>';

                // Add parameters as local slots
                for (const param of node.params) {
                    subCompiler.addLocal(param.name, line);
                }

                subCompiler.visit(node.body);
                subCompiler.emitReturn(line);

                const proto = {
                    name: node.id ? node.id.name : '<anonymous>',
                    arity: node.params.length,
                    chunk: subCompiler.chunk
                };

                const protoIdx = this.chunk.addConstant(proto);
                this.emit(Opcodes.OP_CLOSURE, line);
                this.emit(protoIdx, line);

                if (node.id) {
                    if (this.scopeDepth > 0) {
                        this.addLocal(node.id.name, line);
                    } else {
                        const constIdx = this.chunk.addConstant(node.id.name);
                        this.emit(Opcodes.OP_DEFINE_GLOBAL, line);
                        this.emit(constIdx, line);
                    }
                }
                break;
            }

            case NodeTypes.ARROW_FUNCTION: {
                const subCompiler = new BytecodeCompiler(this, 'TYPE_FUNCTION');
                subCompiler.chunk.name = '<lambda>';

                for (const param of node.params) {
                    subCompiler.addLocal(param.name, line);
                }

                if (node.isExpressionBody) {
                    subCompiler.visit(node.body);
                    subCompiler.emit(Opcodes.OP_RETURN, line);
                } else {
                    subCompiler.visit(node.body);
                    subCompiler.emitReturn(line);
                }

                const proto = {
                    name: '<lambda>',
                    arity: node.params.length,
                    chunk: subCompiler.chunk
                };

                const protoIdx = this.chunk.addConstant(proto);
                this.emit(Opcodes.OP_CLOSURE, line);
                this.emit(protoIdx, line);
                break;
            }

            case NodeTypes.CALL_EXPRESSION: {
                this.visit(node.callee);
                for (const arg of node.arguments) {
                    this.visit(arg);
                }
                this.emit(Opcodes.OP_CALL, line);
                this.emit(node.arguments.length, line);
                break;
            }

            case NodeTypes.RETURN_STATEMENT: {
                if (node.argument) {
                    this.visit(node.argument);
                } else {
                    this.emit(Opcodes.OP_UNDEFINED, line);
                }
                this.emit(Opcodes.OP_RETURN, line);
                break;
            }

            case NodeTypes.ARRAY_LITERAL: {
                for (const elem of node.elements) {
                    this.visit(elem);
                }
                this.emit(Opcodes.OP_BUILD_LIST, line);
                this.emit(node.elements.length, line);
                break;
            }

            case NodeTypes.OBJECT_LITERAL: {
                for (const prop of node.properties) {
                    const key = prop.key.type === NodeTypes.IDENTIFIER ? prop.key.name : prop.key.value;
                    this.emitConstant(key, line);
                    this.visit(prop.value);
                }
                this.emit(Opcodes.OP_BUILD_MAP, line);
                this.emit(node.properties.length, line);
                break;
            }

            case NodeTypes.MEMBER_EXPRESSION: {
                this.visit(node.object);

                if (node.property.type === NodeTypes.SLICE_EXPRESSION) {
                    // Slicing: push start, stop, step
                    const slice = node.property;
                    if (slice.start) this.visit(slice.start); else this.emit(Opcodes.OP_NULL, line);
                    if (slice.stop) this.visit(slice.stop); else this.emit(Opcodes.OP_NULL, line);
                    if (slice.step) this.visit(slice.step); else this.emitConstant(1, line);
                    this.emit(Opcodes.OP_SLICE, line);
                } else if (node.computed) {
                    this.visit(node.property);
                    this.emit(Opcodes.OP_GET_INDEX, line);
                } else {
                    this.emitConstant(node.property.name, line);
                    this.emit(Opcodes.OP_GET_INDEX, line);
                }
                break;
            }

            default:
                // Fallback for statements/nodes
                break;
        }
    }

    emitCompoundOp(operator, line) {
        switch (operator) {
            case '+=': this.emit(Opcodes.OP_ADD, line); break;
            case '-=': this.emit(Opcodes.OP_SUBTRACT, line); break;
            case '*=': this.emit(Opcodes.OP_MULTIPLY, line); break;
            case '/=': this.emit(Opcodes.OP_DIVIDE, line); break;
            case '%=': this.emit(Opcodes.OP_MODULO, line); break;
            case '**=': this.emit(Opcodes.OP_POWER, line); break;
        }
    }
}

module.exports = { BytecodeCompiler };

    });

    define('src/vm/vm.js', function(require, module, exports) {
// Sanskrit Bytecode Virtual Machine Execution Engine
const { Opcodes } = require('./opcodes');
const { createBuiltins, formatValue } = require('../runtime/builtins');
const { RuntimeError, TypeError } = require('../diagnostics/errors');

class CallFrame {
    constructor(closure, slots = 0) {
        this.closure = closure; // { name, arity, chunk }
        this.ip = 0;
        this.slots = slots; // Base index in VM stack
    }

    get chunk() {
        return this.closure.chunk;
    }
}

class VirtualMachine {
    constructor(options = {}) {
        this.outputStream = options.outputStream || console.log;
        this.stack = [];
        this.frames = [];
        this.globals = new Map();
        this.setupGlobals();
    }

    setupGlobals() {
        this.globals.set('सत्य', true);
        this.globals.set('असत्य', false);
        this.globals.set('शून्य', null);
        this.globals.set('अपरिभाषित', undefined);
        this.globals.set('अनंत', Infinity);
        this.globals.set('NaN', NaN);

        // Standard built-ins
        const builtins = createBuiltins(this.outputStream);
        for (const [name, fn] of builtins.entries()) {
            this.globals.set(name, fn);
        }
    }

    push(val) {
        this.stack.push(val);
    }

    pop() {
        return this.stack.pop();
    }

    peek(distance = 0) {
        return this.stack[this.stack.length - 1 - distance];
    }

    interpret(chunk) {
        this.stack = [];
        this.frames = [];

        const mainClosure = {
            name: '<main>',
            arity: 0,
            chunk
        };

        this.push(mainClosure);
        this.frames.push(new CallFrame(mainClosure, 0));

        return this.run();
    }

    run() {
        let frame = this.frames[this.frames.length - 1];

        while (true) {
            const instruction = frame.chunk.code[frame.ip++];

            switch (instruction) {
                case Opcodes.OP_CONSTANT: {
                    const constIdx = frame.chunk.code[frame.ip++];
                    this.push(frame.chunk.constants[constIdx]);
                    break;
                }

                case Opcodes.OP_NULL:
                    this.push(null);
                    break;

                case Opcodes.OP_UNDEFINED:
                    this.push(undefined);
                    break;

                case Opcodes.OP_TRUE:
                    this.push(true);
                    break;

                case Opcodes.OP_FALSE:
                    this.push(false);
                    break;

                case Opcodes.OP_POP:
                    this.pop();
                    break;

                case Opcodes.OP_DUP:
                    this.push(this.peek(0));
                    break;

                case Opcodes.OP_GET_GLOBAL: {
                    const constIdx = frame.chunk.code[frame.ip++];
                    const name = frame.chunk.constants[constIdx];
                    if (!this.globals.has(name)) {
                        throw new RuntimeError(`Undefined variable '${name}' in VM`);
                    }
                    this.push(this.globals.get(name));
                    break;
                }

                case Opcodes.OP_SET_GLOBAL: {
                    const constIdx = frame.chunk.code[frame.ip++];
                    const name = frame.chunk.constants[constIdx];
                    const val = this.peek(0);
                    this.globals.set(name, val);
                    break;
                }

                case Opcodes.OP_DEFINE_GLOBAL: {
                    const constIdx = frame.chunk.code[frame.ip++];
                    const name = frame.chunk.constants[constIdx];
                    const val = this.pop();
                    this.globals.set(name, val);
                    break;
                }

                case Opcodes.OP_GET_LOCAL: {
                    const slot = frame.chunk.code[frame.ip++];
                    this.push(this.stack[frame.slots + slot]);
                    break;
                }

                case Opcodes.OP_SET_LOCAL: {
                    const slot = frame.chunk.code[frame.ip++];
                    this.stack[frame.slots + slot] = this.peek(0);
                    break;
                }

                case Opcodes.OP_ADD: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(a + b);
                    break;
                }

                case Opcodes.OP_SUBTRACT: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(a - b);
                    break;
                }

                case Opcodes.OP_MULTIPLY: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(a * b);
                    break;
                }

                case Opcodes.OP_DIVIDE: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(a / b);
                    break;
                }

                case Opcodes.OP_MODULO: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(a % b);
                    break;
                }

                case Opcodes.OP_POWER: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(Math.pow(a, b));
                    break;
                }

                case Opcodes.OP_NEGATE: {
                    const val = this.pop();
                    this.push(-val);
                    break;
                }

                case Opcodes.OP_NOT: {
                    const val = this.pop();
                    this.push(!val);
                    break;
                }

                case Opcodes.OP_EQUAL: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(a == b);
                    break;
                }

                case Opcodes.OP_NOT_EQUAL: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(a != b);
                    break;
                }

                case Opcodes.OP_STRICT_EQUAL: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(a === b);
                    break;
                }

                case Opcodes.OP_STRICT_NOT_EQUAL: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(a !== b);
                    break;
                }

                case Opcodes.OP_GREATER: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(a > b);
                    break;
                }

                case Opcodes.OP_GREATER_EQUAL: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(a >= b);
                    break;
                }

                case Opcodes.OP_LESS: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(a < b);
                    break;
                }

                case Opcodes.OP_LESS_EQUAL: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(a <= b);
                    break;
                }

                case Opcodes.OP_JUMP: {
                    const offset = frame.chunk.code[frame.ip++];
                    frame.ip = offset;
                    break;
                }

                case Opcodes.OP_JUMP_IF_FALSE: {
                    const offset = frame.chunk.code[frame.ip++];
                    const cond = this.peek(0);
                    if (!cond) {
                        frame.ip = offset;
                    }
                    break;
                }

                case Opcodes.OP_LOOP: {
                    const offset = frame.chunk.code[frame.ip++];
                    frame.ip = offset;
                    break;
                }

                case Opcodes.OP_CLOSURE: {
                    const protoIdx = frame.chunk.code[frame.ip++];
                    const proto = frame.chunk.constants[protoIdx];
                    this.push(proto);
                    break;
                }

                case Opcodes.OP_CALL: {
                    const argCount = frame.chunk.code[frame.ip++];
                    const callee = this.peek(argCount);

                    if (callee && callee.chunk) {
                        // VM Bytecode function call
                        const nextSlots = this.stack.length - argCount - 1;
                        this.frames.push(new CallFrame(callee, nextSlots));
                        frame = this.frames[this.frames.length - 1];
                    } else if (typeof callee === 'function') {
                        // Native JavaScript function / built-in call
                        const args = [];
                        for (let i = 0; i < argCount; i++) {
                            args.unshift(this.pop());
                        }
                        this.pop(); // Pop callee
                        const result = callee(...args);
                        this.push(result);
                    } else {
                        throw new TypeError(`'${callee}' is not a function in VM`);
                    }
                    break;
                }

                case Opcodes.OP_RETURN: {
                    const result = this.pop();
                    this.frames.pop();

                    if (this.frames.length === 0) {
                        return result;
                    }

                    // Reset stack back to frame slot
                    this.stack.length = frame.slots;
                    this.push(result);
                    frame = this.frames[this.frames.length - 1];
                    break;
                }

                case Opcodes.OP_BUILD_LIST: {
                    const count = frame.chunk.code[frame.ip++];
                    const items = [];
                    for (let i = 0; i < count; i++) {
                        items.unshift(this.pop());
                    }
                    this.push(items);
                    break;
                }

                case Opcodes.OP_BUILD_MAP: {
                    const count = frame.chunk.code[frame.ip++];
                    const map = {};
                    for (let i = 0; i < count; i++) {
                        const val = this.pop();
                        const key = this.pop();
                        map[key] = val;
                    }
                    this.push(map);
                    break;
                }

                case Opcodes.OP_GET_INDEX: {
                    const index = this.pop();
                    const target = this.pop();
                    this.push(target[index]);
                    break;
                }

                case Opcodes.OP_SET_INDEX: {
                    const val = this.pop();
                    const index = this.pop();
                    const target = this.pop();
                    target[index] = val;
                    this.push(val);
                    break;
                }

                case Opcodes.OP_SLICE: {
                    let step = this.pop();
                    let stop = this.pop();
                    let start = this.pop();
                    const seq = this.pop();

                    if (step === null || step === undefined) step = 1;
                    const len = seq.length;
                    const isStr = typeof seq === 'string';

                    let startIndex, stopIndex;
                    if (step > 0) {
                        startIndex = start === null ? 0 : (start < 0 ? Math.max(0, len + start) : Math.min(len, start));
                        stopIndex = stop === null ? len : (stop < 0 ? Math.max(0, len + stop) : Math.min(len, stop));
                    } else {
                        startIndex = start === null ? len - 1 : (start < 0 ? Math.max(-1, len + start) : Math.min(len - 1, start));
                        stopIndex = stop === null ? -1 : (stop < 0 ? Math.max(-1, len + stop) : Math.min(len, stop));
                    }

                    const res = [];
                    if (step > 0) {
                        for (let i = startIndex; i < stopIndex; i += step) res.push(seq[i]);
                    } else {
                        for (let i = startIndex; i > stopIndex; i += step) res.push(seq[i]);
                    }

                    this.push(isStr ? res.join('') : res);
                    break;
                }

                case Opcodes.OP_PRINT: {
                    const val = this.pop();
                    this.outputStream(formatValue(val));
                    this.push(undefined);
                    break;
                }

                case Opcodes.OP_HALT:
                    return this.pop();

                default:
                    throw new RuntimeError(`Unknown VM opcode: ${instruction}`);
            }
        }
    }
}

module.exports = {
    VirtualMachine,
    CallFrame
};

    });

    define('src/vm/index.js', function(require, module, exports) {
// Sanskrit Bytecode Virtual Machine Subsystem
const { Opcodes, OpcodeNames } = require('./opcodes');
const { Chunk } = require('./chunk');
const { BytecodeCompiler } = require('./compiler');
const { VirtualMachine } = require('./vm');

module.exports = {
    Opcodes,
    OpcodeNames,
    Chunk,
    BytecodeCompiler,
    VirtualMachine
};

    });

    define('src/compiler/index.js', function(require, module, exports) {
// Sanskrit Language Compiler Facade
const { Lexer } = require('../lexer');
const { Parser } = require('../parser');
const { Interpreter } = require('../runtime');
const { SanskritError } = require('../diagnostics/errors');
const fs = { readFileSync: () => { throw new Error("fs not supported in browser"); } };

const { BytecodeCompiler, VirtualMachine } = require('../vm');

class Compiler {
    constructor(options = {}) {
        this.options = options;
        this.filename = options.filename || '<anonymous>';
        this.outputStream = options.outputStream || console.log;
        this.interpreter = new Interpreter({
            filename: this.filename,
            outputStream: (...args) => (this.options.outputStream || this.outputStream)(...args)
        });
    }

    runVM(sourceCode, filename = this.filename) {
        const lexer = new Lexer(sourceCode, filename);
        const parser = new Parser(lexer, filename);
        const ast = parser.parse();
        const byteCompiler = new BytecodeCompiler();
        const chunk = byteCompiler.compile(ast);
        const vm = new VirtualMachine({
            outputStream: (...args) => (this.options.outputStream || this.outputStream)(...args)
        });
        return vm.interpret(chunk);
    }

    run(sourceCode, filename = this.filename) {
        if (this.options.useVM || this.options.target === 'vm') {
            return this.runVM(sourceCode, filename);
        }
        const lexer = new Lexer(sourceCode, filename);
        const parser = new Parser(lexer, filename);
        const ast = parser.parse();
        return this.interpreter.interpret(ast);
    }

    compile(sourceCode, filename = this.filename) {
        try {
            return this.run(sourceCode, filename);
        } catch (error) {
            if (error instanceof SanskritError) {
                console.error(error.format());
            } else {
                console.error(`[त्रुटि E9999] Unexpected error: ${error.message}`);
            }
            return null;
        }
    }

    static compileFile(filePath, options = {}) {
        try {
            const sourceCode = fs.readFileSync(filePath, 'utf8');
            const compiler = new Compiler({
                filename: filePath,
                ...options
            });
            const result = compiler.compile(sourceCode, filePath);
            return result !== null;
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.error(`[त्रुटि E1000] File not found: '${filePath}'`);
            } else {
                console.error(`[त्रुटि E1000] Failed to read file '${filePath}': ${error.message}`);
            }
            return false;
        }
    }
}

module.exports = { Compiler };

    });

    define('src/index.js', function(require, module, exports) {
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

    });


    // Export Sanskrit public interface to window
    const SanskritLang = requireModule('', 'src/index.js');
    global.Sanskrit = SanskritLang;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = SanskritLang;
    }
})(typeof window !== 'undefined' ? window : globalThis);
