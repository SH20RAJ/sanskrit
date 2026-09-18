#!/usr/bin/env node

const { program } = require('commander');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { version } = require('../../package.json');
const { Lexer } = require('../lexer');
const { Parser } = require('../parser');
const { Interpreter } = require('../runtime');
const { SanskritError } = require('../diagnostics/errors');
const { formatValue } = require('../runtime/builtins');

program
    .name('sanskrit')
    .version(version, '-V, --version', 'Output the version number')
    .description('संस्कृत (Sanskrit) Programming Language CLI');

// Command: run <file>
program
    .command('run <file>')
    .description('Execute a Sanskrit (.sns) source file')
    .option('-v, --verbose', 'Enable verbose execution logging')
    .option('-d, --debug', 'Show token stream and AST tree for debugging')
    .action((file, options) => {
        const filePath = path.resolve(process.cwd(), file);

        if (!fs.existsSync(filePath)) {
            console.error(`[त्रुटि E1000] File not found: '${file}'`);
            process.exit(1);
        }

        let sourceCode;
        try {
            sourceCode = fs.readFileSync(filePath, 'utf8');
        } catch (err) {
            console.error(`[त्रुटि E1000] Could not read file '${file}': ${err.message}`);
            process.exit(1);
        }

        try {
            const lexer = new Lexer(sourceCode, file);

            if (options.debug) {
                console.log('--- Tokens ---');
                const tokens = new Lexer(sourceCode, file).getAllTokens();
                tokens.forEach(t => console.log(t.toString()));
            }

            const parser = new Parser(lexer, file);
            const ast = parser.parse();

            if (options.debug) {
                console.log('\n--- AST ---');
                console.log(JSON.stringify(ast, null, 2));
                console.log('\n--- Output ---');
            }

            const interpreter = new Interpreter({ filename: file });
            interpreter.interpret(ast);
            process.exit(0);
        } catch (error) {
            if (error instanceof SanskritError) {
                console.error(error.format());
            } else if (options.debug) {
                console.error(error);
            } else {
                console.error(`[त्रुटि E9999] Execution error: ${error.message}`);
            }
            process.exit(1);
        }
    });

// Command: check <file>
program
    .command('check <file>')
    .description('Validate syntax of a Sanskrit source file without executing')
    .action((file) => {
        const filePath = path.resolve(process.cwd(), file);

        if (!fs.existsSync(filePath)) {
            console.error(`[त्रुटि E1000] File not found: '${file}'`);
            process.exit(1);
        }

        try {
            const sourceCode = fs.readFileSync(filePath, 'utf8');
            const lexer = new Lexer(sourceCode, file);
            const parser = new Parser(lexer, file);
            parser.parse();
            console.log(`✓ Syntax valid: ${file}`);
            process.exit(0);
        } catch (error) {
            if (error instanceof SanskritError) {
                console.error(error.format());
            } else {
                console.error(`[त्रुटि E2000] Syntax validation failed: ${error.message}`);
            }
            process.exit(1);
        }
    });

// Command: repl
program
    .command('repl')
    .description('Start the interactive Sanskrit REPL session')
    .action(() => {
        startRepl();
    });

function startRepl() {
    console.log(`संस्कृत (Sanskrit) REPL v${version}`);
    console.log("Type '.help' for commands, or '.exit' to quit.\n");

    const interpreter = new Interpreter({ filename: '<repl>' });
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: 'sanskrit> '
    });

    let buffer = '';
    rl.prompt();

    rl.on('line', (line) => {
        const trimmed = line.trim();

        if (buffer === '' && trimmed.startsWith('.')) {
            switch (trimmed) {
                case '.exit':
                    console.log('पुनर्मिलामः! (Goodbye!)');
                    process.exit(0);
                case '.clear':
                    console.clear();
                    rl.prompt();
                    return;
                case '.help':
                    console.log('REPL Commands:');
                    console.log('  .help    Show this help message');
                    console.log('  .clear   Clear terminal screen');
                    console.log('  .exit    Exit the REPL session');
                    rl.prompt();
                    return;
                default:
                    console.log(`Unknown command: ${trimmed}. Type .help for assistance.`);
                    rl.prompt();
                    return;
            }
        }

        buffer += (buffer ? '\n' : '') + line;

        // Check if braces / parentheses are balanced
        const openBraces = (buffer.match(/{/g) || []).length;
        const closeBraces = (buffer.match(/}/g) || []).length;
        const openParens = (buffer.match(/\(/g) || []).length;
        const closeParens = (buffer.match(/\)/g) || []).length;

        if (openBraces > closeBraces || openParens > closeParens) {
            rl.setPrompt('... ');
            rl.prompt();
            return;
        }

        rl.setPrompt('sanskrit> ');

        const codeToExecute = buffer.trim();
        buffer = '';

        if (!codeToExecute) {
            rl.prompt();
            return;
        }

        try {
            const lexer = new Lexer(codeToExecute, '<repl>');
            const parser = new Parser(lexer, '<repl>');
            const ast = parser.parse();
            const result = interpreter.interpret(ast);

            if (result !== undefined) {
                console.log(formatValue(result));
            }
        } catch (error) {
            if (error instanceof SanskritError) {
                console.error(error.format());
            } else {
                console.error(`[त्रुटि] ${error.message}`);
            }
        }

        rl.prompt();
    });

    rl.on('close', () => {
        console.log('\nपुनर्मिलामः! (Goodbye!)');
        process.exit(0);
    });
}

// Default action if no arguments provided
if (process.argv.length <= 2) {
    program.help();
} else {
    program.parse(process.argv);
}
