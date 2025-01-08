// Sanskrit Language Lexer
const TokenTypes = {
    KEYWORD: 'KEYWORD',
    IDENTIFIER: 'IDENTIFIER',
    NUMBER: 'NUMBER',
    STRING: 'STRING',
    OPERATOR: 'OPERATOR',
    DELIMITER: 'DELIMITER',
    EOF: 'EOF'
};

const Keywords = new Set([
    'fn', 'let', 'const', 'if', 'else', 'while', 'for', 'return',
    'async', 'await', 'match', 'tensor', 'type', 'interface',
    'import', 'export', 'try', 'catch', 'throw'
]);

class Token {
    constructor(type, value, line, column) {
        this.type = type;
        this.value = value;
        this.line = line;
        this.column = column;
    }
}

class Lexer {
    constructor(input) {
        this.input = input;
        this.position = 0;
        this.line = 1;
        this.column = 1;
        this.currentChar = this.input[this.position];
    }

    advance() {
        this.position++;
        if (this.currentChar === '\n') {
            this.line++;
            this.column = 1;
        } else {
            this.column++;
        }
        this.currentChar = this.position < this.input.length ? this.input[this.position] : null;
    }

    skipWhitespace() {
        while (this.currentChar && /\s/.test(this.currentChar)) {
            this.advance();
        }
    }

    readNumber() {
        let result = '';
        while (this.currentChar && /[\d.]/.test(this.currentChar)) {
            result += this.currentChar;
            this.advance();
        }
        return new Token(TokenTypes.NUMBER, Number(result), this.line, this.column);
    }

    readIdentifier() {
        let result = '';
        while (this.currentChar && /[a-zA-Z0-9_]/.test(this.currentChar)) {
            result += this.currentChar;
            this.advance();
        }
        const type = Keywords.has(result) ? TokenTypes.KEYWORD : TokenTypes.IDENTIFIER;
        return new Token(type, result, this.line, this.column);
    }

    readString() {
        let result = '';
        const quote = this.currentChar;
        this.advance(); // Skip opening quote
        
        while (this.currentChar && this.currentChar !== quote) {
            if (this.currentChar === '\\') {
                this.advance();
                switch (this.currentChar) {
                    case 'n': result += '\n'; break;
                    case 't': result += '\t'; break;
                    case 'r': result += '\r'; break;
                    default: result += this.currentChar;
                }
            } else {
                result += this.currentChar;
            }
            this.advance();
        }
        this.advance(); // Skip closing quote
        return new Token(TokenTypes.STRING, result, this.line, this.column);
    }

    getNextToken() {
        while (this.currentChar) {
            if (/\s/.test(this.currentChar)) {
                this.skipWhitespace();
                continue;
            }

            if (/\d/.test(this.currentChar)) {
                return this.readNumber();
            }

            if (/[a-zA-Z_]/.test(this.currentChar)) {
                return this.readIdentifier();
            }

            if (this.currentChar === '"' || this.currentChar === "'") {
                return this.readString();
            }

            if (/[+\-*\/=<>!&|^%]/.test(this.currentChar)) {
                let operator = this.currentChar;
                this.advance();
                if (this.currentChar === '=' || 
                    (operator === '&' && this.currentChar === '&') ||
                    (operator === '|' && this.currentChar === '|')) {
                    operator += this.currentChar;
                    this.advance();
                }
                return new Token(TokenTypes.OPERATOR, operator, this.line, this.column);
            }

            if (/[(){}\[\],;:]/.test(this.currentChar)) {
                const delimiter = this.currentChar;
                this.advance();
                return new Token(TokenTypes.DELIMITER, delimiter, this.line, this.column);
            }

            throw new Error(`Unexpected character: ${this.currentChar} at line ${this.line}, column ${this.column}`);
        }

        return new Token(TokenTypes.EOF, null, this.line, this.column);
    }
}

module.exports = {
    Lexer,
    Token,
    TokenTypes,
    Keywords
};
