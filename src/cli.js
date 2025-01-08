#!/usr/bin/env node

const { program } = require('commander');
const { Compiler } = require('./compiler');
const { Lexer } = require('./compiler/lexer');
const { Parser } = require('./compiler/parser');
const { Interpreter } = require('./interpreter');
const path = require('path');
const fs = require('fs');
const { version } = require('../package.json');
const repl = require('repl');

program
    .version(version)
    .description('Sanskrit Programming Language CLI');

program
    .command('run <file>')
    .description('Run a Sanskrit source file')
    .option('-v, --verbose', 'Enable verbose output')
    .option('-d, --debug', 'Enable token and AST debugging')
    .action((file, options) => {
        try {
            if (options.debug) {
                const code = fs.readFileSync(file, 'utf8');
                const lexer = new Lexer(code);
                
                // Debug: Print tokens
                let token;
                console.log('Tokens:');
                while ((token = lexer.getNextToken()).type !== 'EOF') {
                    console.log(token);
                }
                
                // Reset lexer for parsing
                const parser = new Parser(new Lexer(code));
                const ast = parser.parse();
                
                // Debug: Print AST
                console.log('\nAST:');
                console.log(JSON.stringify(ast, null, 2));
                
                const interpreter = new Interpreter();
                interpreter.interpret(ast);
            } else {
                const result = Compiler.compileFile(file);
                if (result === false) {
                    console.error('Execution failed.');
                    process.exit(1);
                }
            }
        } catch (error) {
            console.error('Error during execution:', error);
            process.exit(1);
        }
    });

program
    .command('repl')
    .description('Start Sanskrit REPL')
    .action(() => {
        console.log('Sanskrit REPL v' + version);
        console.log('Type .help for commands');
        
        const compiler = new Compiler();
        
        const replServer = repl.start({
            prompt: 'sanskrit> ',
            eval: (cmd, context, filename, callback) => {
                try {
                    const result = compiler.compile(cmd);
                    callback(null, result);
                } catch (error) {
                    callback(error);
                }
            }
        });
        
        replServer.on('exit', () => {
            console.log('\nGoodbye!');
            process.exit(0);
        });
    });

program.parse(process.argv);
