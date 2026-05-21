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
    // Core language constructs
    'कार्य',     // function (karya)
    'चर',       // variable (chara)
    'स्थिर',    // constant (sthira)
    'वर्ग',     // class (varga)
    'विस्तार',  // extends (vistaar)
    'निर्माण',  // constructor (nirmaan)
    'स्व',      // this (sva)
    'सुपर',     // super (super)
    'स्थैतिक',  // static (sthaithik)
    'निजी',     // private (niji)
    'सार्वजनिक', // public (sarvajanik)
    'संरक्षित',  // protected (sanrakshit)
    
    // Control flow
    'यदि',      // if (yadi)
    'अन्यथा',   // else (anyatha)
    'अन्यथायदि', // else if (anyatha yadi)
    'यावत्',    // while (yavat)
    'पुनः',     // for (punah)
    'प्रत्येक',  // foreach (pratyeka)
    'में',      // in (mein)
    'का',       // of (ka)
    'स्विच',    // switch (switch)
    'केस',      // case (case)
    'डिफ़ॉल्ट', // default (default)
    'तोड़',     // break (tod)
    'जारी',     // continue (jaari)
    
    // Functions and returns
    'प्रत्यागम', // return (pratyagam)
    'उत्पन्न',   // yield (utpanna)
    'असिन्क्',   // async (async)
    'प्रतीक्षा', // await (prateeksha)
    
    // Data types and structures
    'सूची',     // array (suchi)
    'वस्तु',     // object (vastu)
    'मानचित्र', // map (maanchitra)
    'सेट',      // set (set)
    'स्ट्रिंग',  // string (string)
    'संख्या',   // number (sankhya)
    'बूलियन',   // boolean (boolean)
    'अपरिभाषित', // undefined (aparibhashit)
    'शून्य',    // null (shunya)
    'प्रकार',   // type (prakar)
    'इंटरफेस', // interface (interface)
    'एनम',     // enum (enum)
    
    // Logical operators
    'और',      // and (aur)
    'या',       // or (ya)
    'नहीं',     // not (nahin)
    'सत्य',     // true (satya)
    'असत्य',    // false (asatya)
    
    // Module system
    'आयात',    // import (aayaat)
    'निर्यात',  // export (niryaat)
    'से',       // from (se)
    'के रूप में', // as (ke roop mein)
    'मॉड्यूल',  // module (module)
    'नेमस्पेस', // namespace (namespace)
    
    // Error handling
    'प्रयत्न',  // try (prayatna)
    'पकड़',     // catch (pakad)
    'अंततः',   // finally (antatah)
    'फेंक',     // throw (phenk)
    'त्रुटि',   // error (truti)
    
    // Advanced features
    'मिलान',    // match (milan)
    'टेन्सर',   // tensor (tensor)
    'जेनेरिक', // generic (generic)
    'डेकोरेटर', // decorator (decorator)
    'मेटाडेटा', // metadata (metadata)
    'रिफ्लेक्शन', // reflection (reflection)
    
    // Memory and performance
    'मेमोरी',   // memory (memory)
    'गार्बेज',  // garbage (garbage)
    'कलेक्टर', // collector (collector)
    'ऑप्टिमाइज़', // optimize (optimize)
    
    // Concurrency
    'थ्रेड',   // thread (thread)
    'प्रोसेस',  // process (process)
    'लॉक',     // lock (lock)
    'म्यूटेक्स', // mutex (mutex)
    'सेमाफोर', // semaphore (semaphore)
    
    // Built-in constants
    'अनंत',     // infinity (anant)
    'NaN',      // NaN (NaN)
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

    skipComment() {
        // Skip the rest of the line for single-line comments
        if (this.currentChar === '/' && this.peek() === '/') {
            while (this.currentChar && this.currentChar !== '\n') {
                this.advance();
            }
            if (this.currentChar === '\n') {
                this.advance();
            }
        }
        // Skip multi-line comments
        else if (this.currentChar === '/' && this.peek() === '*') {
            this.advance(); // Skip /
            this.advance(); // Skip *
            while (this.currentChar && !(this.currentChar === '*' && this.peek() === '/')) {
                this.advance();
            }
            if (this.currentChar) {
                this.advance(); // Skip *
                this.advance(); // Skip /
            }
        }
    }

    peek() {
        return this.position + 1 < this.input.length ? this.input[this.position + 1] : null;
    }

    readNumber() {
        let result = '';
        // Support Devanagari numerals (०-९) as well as Arabic numerals
        while (this.currentChar && /[\d०-९.]/.test(this.currentChar)) {
            result += this.currentChar;
            this.advance();
        }
        // Convert Devanagari numerals to Arabic numerals
        result = result.replace(/[०-९]/g, d => String.fromCharCode(d.charCodeAt(0) - 0x0966 + 0x30));
        return new Token(TokenTypes.NUMBER, Number(result), this.line, this.column);
    }

    readIdentifier() {
        let result = '';
        // Support Devanagari characters, including combining marks
        while (this.currentChar && /[\u0900-\u097F\u200C\u200D]|[a-zA-Z0-9_]/.test(this.currentChar)) {
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

            if (this.currentChar === '/' && (this.peek() === '/' || this.peek() === '*')) {
                this.skipComment();
                continue;
            }

            // Check for Devanagari numerals
            if (/[\d०-९]/.test(this.currentChar)) {
                return this.readNumber();
            }

            // Check for Devanagari characters or Latin letters
            if (/[\u0900-\u097F\u200C\u200D]|[a-zA-Z_]/.test(this.currentChar)) {
                return this.readIdentifier();
            }

            if (this.currentChar === '"' || this.currentChar === "'") {
                return this.readString();
            }

            if (/[+\-*\/=<>!&|^%~]/.test(this.currentChar)) {
                let operator = this.currentChar;
                this.advance();
                
                // Handle compound operators
                if (this.currentChar === '=' && /[+\-*\/=<>!^%]/.test(operator)) {
                    operator += this.currentChar;
                    this.advance();
                } else if ((operator === '&' && this.currentChar === '&') ||
                          (operator === '|' && this.currentChar === '|') ||
                          (operator === '=' && this.currentChar === '=') ||
                          (operator === '!' && this.currentChar === '=') ||
                          (operator === '<' && this.currentChar === '=') ||
                          (operator === '>' && this.currentChar === '=') ||
                          (operator === '<' && this.currentChar === '<') ||
                          (operator === '>' && this.currentChar === '>') ||
                          (operator === '*' && this.currentChar === '*') ||
                          (operator === '+' && this.currentChar === '+') ||
                          (operator === '-' && this.currentChar === '-')) {
                    operator += this.currentChar;
                    this.advance();
                    
                    // Handle triple operators like === and !==
                    if ((operator === '==' || operator === '!=') && this.currentChar === '=') {
                        operator += this.currentChar;
                        this.advance();
                    }
                    // Handle >>> operator
                    else if (operator === '>>' && this.currentChar === '>') {
                        operator += this.currentChar;
                        this.advance();
                    }
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
