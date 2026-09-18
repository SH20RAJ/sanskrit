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

        const type = Keywords.has(value) ? TokenTypes.KEYWORD : TokenTypes.IDENTIFIER;
        return new Token(type, value, startLine, startColumn, value);
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
