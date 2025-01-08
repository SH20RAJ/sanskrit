#!/usr/bin/env node

const { program } = require('commander');
const { Compiler } = require('./compiler');
const path = require('path');
const fs = require('fs');
const { version } = require('../package.json');

program
    .version(version)
    .description('Sanskrit Programming Language CLI');

program
    .command('compile <input>')
    .description('Compile a Sanskrit source file')
    .option('-o, --output <output>', 'Output file path')
    .option('-O, --optimize', 'Enable optimizations')
    .action((input, options) => {
        const outputPath = options.output || input.replace(/\.[^.]+$/, '') + '.ll';
        
        try {
            console.log(`Compiling ${input} to ${outputPath}...`);
            const success = Compiler.compileFile(input, outputPath);
            
            if (success) {
                console.log('Compilation successful!');
            } else {
                console.error('Compilation failed.');
                process.exit(1);
            }
        } catch (error) {
            console.error('Error during compilation:', error);
            process.exit(1);
        }
    });

program
    .command('run <file>')
    .description('Run a Sanskrit source file')
    .option('-v, --verbose', 'Enable verbose output')
    .action((file, options) => {
        try {
            const tempOutput = path.join(process.cwd(), '.temp.ll');
            console.log('Compiling...');
            
            const success = Compiler.compileFile(file, tempOutput);
            if (!success) {
                console.error('Compilation failed.');
                process.exit(1);
            }

            console.log('Running...');
            // Execute the compiled code using LLVM JIT execution engine
            // Implementation pending
            
            // Cleanup
            fs.unlinkSync(tempOutput);
        } catch (error) {
            console.error('Error:', error);
            process.exit(1);
        }
    });

program
    .command('repl')
    .description('Start Sanskrit REPL')
    .action(() => {
        console.log('Sanskrit REPL v' + version);
        console.log('Type .help for commands, .exit to exit\n');
        
        const repl = require('repl');
        const compiler = new Compiler();
        
        const replServer = repl.start({
            prompt: 'sanskrit> ',
            eval: (cmd, context, filename, callback) => {
                try {
                    // Remove newline
                    cmd = cmd.trim();
                    
                    if (cmd === '') {
                        callback(null);
                        return;
                    }
                    
                    // Special commands
                    if (cmd.startsWith('.')) {
                        switch (cmd) {
                            case '.help':
                                console.log('\nCommands:');
                                console.log('  .help     Show this help');
                                console.log('  .exit     Exit the REPL');
                                callback(null);
                                return;
                            case '.exit':
                                process.exit(0);
                        }
                    }
                    
                    // Compile and execute the code
                    const result = compiler.compileAndExecute(cmd);
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
