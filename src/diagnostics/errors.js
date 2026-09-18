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
