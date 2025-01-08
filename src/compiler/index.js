// Sanskrit Language Compiler Entry Point
const { Lexer } = require('./lexer');
const { Parser } = require('./parser');
const { CodeGenerator } = require('./codegen');
const fs = require('fs');
const path = require('path');

class Compiler {
    constructor() {
        this.lexer = null;
        this.parser = null;
        this.generator = null;
    }

    compile(sourceCode, outputPath) {
        try {
            // Initialize components
            this.lexer = new Lexer(sourceCode);
            this.parser = new Parser(this.lexer);
            this.generator = new CodeGenerator();

            // Parse source code into AST
            console.log('Parsing source code...');
            const ast = this.parser.parseProgram();

            // Generate LLVM IR
            console.log('Generating LLVM IR...');
            const module = this.generator.generateCode(ast);

            // Verify the module
            console.log('Verifying module...');
            if (module.verify()) {
                throw new Error('Module verification failed');
            }

            // Optimize the module
            console.log('Optimizing code...');
            this.optimizeModule(module);

            // Write output
            console.log('Writing output...');
            const irCode = module.print();
            fs.writeFileSync(outputPath, irCode);

            console.log(`Compilation successful. Output written to ${outputPath}`);
            return true;
        } catch (error) {
            console.error('Compilation failed:', error);
            return false;
        }
    }

    optimizeModule(module) {
        // Create pass manager and add optimization passes
        const passManager = new llvm.PassManager();
        
        // Add standard optimization passes
        passManager.add(llvm.createInstructionCombiningPass());
        passManager.add(llvm.createReassociatePass());
        passManager.add(llvm.createGVNPass());
        passManager.add(llvm.createCFGSimplificationPass());
        
        // Run optimization passes
        passManager.run(module);
    }

    static compileFile(inputPath, outputPath) {
        const sourceCode = fs.readFileSync(inputPath, 'utf8');
        const compiler = new Compiler();
        return compiler.compile(sourceCode, outputPath);
    }
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length !== 2) {
        console.error('Usage: node compiler.js <input-file> <output-file>');
        process.exit(1);
    }

    const [inputFile, outputFile] = args;
    const success = Compiler.compileFile(inputFile, outputFile);
    process.exit(success ? 0 : 1);
}

module.exports = {
    Compiler
};
