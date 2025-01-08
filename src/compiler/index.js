// Sanskrit Language Compiler Entry Point
const { Lexer } = require('./lexer');
const { Parser } = require('./parser');
const { Interpreter } = require('../interpreter');
const fs = require('fs');
const path = require('path');

class Compiler {
    constructor() {
        this.lexer = null;
        this.parser = null;
        this.interpreter = null;
    }

    compile(sourceCode) {
        try {
            // Initialize components
            this.lexer = new Lexer(sourceCode);
            this.parser = new Parser(this.lexer);
            this.interpreter = new Interpreter();

            // Parse the code
            const ast = this.parser.parse();
            
            // Interpret the AST
            return this.interpreter.interpret(ast);
        } catch (error) {
            console.error('Compilation error:', error.message);
            return null;
        }
    }

    static compileFile(inputPath) {
        try {
            const sourceCode = fs.readFileSync(inputPath, 'utf8');
            const compiler = new Compiler();
            return compiler.compile(sourceCode);
        } catch (error) {
            console.error('Error reading file:', error.message);
            return false;
        }
    }
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length !== 1) {
        console.error('Usage: node compiler.js <input-file>');
        process.exit(1);
    }

    const [inputFile] = args;
    const result = Compiler.compileFile(inputFile);
    if (result === false) {
        process.exit(1);
    } else {
        console.log(result);
    }
}

module.exports = {
    Compiler
};
