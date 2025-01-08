#!/usr/bin/env node

const { program } = require('commander');
const { Compiler } = require('./compiler');
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
    .action((file, options) => {
        try {
            const result = Compiler.compileFile(file);
            if (result === false) {
                console.error('Execution failed.');
                process.exit(1);
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
