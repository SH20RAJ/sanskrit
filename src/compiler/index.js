// Sanskrit Language Compiler Facade
const { Lexer } = require('../lexer');
const { Parser } = require('../parser');
const { Interpreter } = require('../runtime');
const { SanskritError } = require('../diagnostics/errors');
const fs = require('fs');

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

    run(sourceCode, filename = this.filename) {
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
