// Test Suite for Sanskrit Bytecode Virtual Machine (VM)
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { Lexer, Parser, Sanskrit, VM } = require('../src/index');
const { BytecodeCompiler, VirtualMachine, Chunk } = VM;

function executeVM(code) {
    const output = [];
    const lexer = new Lexer(code);
    const parser = new Parser(lexer);
    const ast = parser.parse();
    const compiler = new BytecodeCompiler();
    const chunk = compiler.compile(ast);
    const vm = new VirtualMachine({
        outputStream: (msg) => output.push(msg)
    });
    vm.interpret(chunk);
    return { output, chunk };
}

describe('Bytecode Virtual Machine', () => {
    test('VM: arithmetic operations and constants', () => {
        const code = `
            चर क = १०;
            चर ख = २०;
            चर ग = (क * २) + (ख / ५);
            मुद्रण(ग);
        `;
        const { output } = executeVM(code);
        assert.equal(output[0], '२४');
    });

    test('VM: comparisons and conditional branches', () => {
        const code = `
            चर x = १५;
            यदि (x > १०) {
                मुद्रण("अधिक");
            } अन्यथा {
                मुद्रण("न्यून");
            }

            चर y = ५;
            मुद्रण(y > १० यदि सत्य अन्यथा असत्य);
        `;
        const { output } = executeVM(code);
        assert.equal(output[0], 'अधिक');
        assert.equal(output[1], 'असत्य');
    });

    test('VM: while loop and counters', () => {
        const code = `
            चर योग = ०;
            चर गणक = १;
            यावत् (गणक <= ५) {
                योग += गणक;
                गणक++;
            }
            मुद्रण(योग);
        `;
        const { output } = executeVM(code);
        assert.equal(output[0], '१५');
    });

    test('VM: functions and recursion', () => {
        const code = `
            कार्य द्विगुणी(n) {
                प्रत्यागम n * २;
            }

            कार्य फिबोनाची(n) {
                यदि (n <= १) {
                    प्रत्यागम n;
                }
                प्रत्यागम फिबोनाची(n - १) + फिबोनाची(n - २);
            }

            मुद्रण(द्विगुणी(२१));
            मुद्रण(फिबोनाची(१०));
        `;
        const { output } = executeVM(code);
        assert.equal(output[0], '४२');
        assert.equal(output[1], '५५');
    });

    test('VM: Pythonic slicing in bytecode engine', () => {
        const code = `
            चर सूची = [१०, २०, ३०, ४०, ५०];
            मुद्रण(सूची[१:४]);
            मुद्रण(सूची[::-१]);
        `;
        const { output } = executeVM(code);
        assert.equal(output[0], '[२०, ३०, ४०]');
        assert.equal(output[1], '[५०, ४०, ३०, २०, १०]');
    });

    test('VM: bytecode disassembly generation', () => {
        const code = `
            चर a = ५;
            चर b = a + १०;
        `;
        const { chunk } = executeVM(code);
        const disasm = chunk.disassemble('test_chunk');
        assert.ok(disasm.includes('== Disassembly: test_chunk =='));
        assert.ok(disasm.includes('OP_CONSTANT'));
        assert.ok(disasm.includes('OP_DEFINE_GLOBAL'));
    });

    test('VM: Sanskrit facade runVM and useVM option', () => {
        const sanskrit = new Sanskrit({ useVM: true });
        const output = [];
        sanskrit.options.outputStream = (msg) => output.push(msg);

        const code = `
            चर मान = १००;
            मुद्रण(मान + ५०);
        `;
        sanskrit.run(code);
        assert.equal(output[0], '१५०');
    });

    test('VM vs Tree-walk: performance benchmark verifies VM speedup', () => {
        const sanskritTree = new Sanskrit({ useVM: false });
        const sanskritVM = new Sanskrit({ useVM: true });

        const code = `
            कार्य फिबोनाची(n) {
                यदि (n <= १) {
                    प्रत्यागम n;
                }
                प्रत्यागम फिबोनाची(n - १) + फिबोनाची(n - २);
            }
            फिबोनाची(१८);
        `;

        const t0 = performance.now();
        sanskritTree.run(code);
        const treeDuration = performance.now() - t0;

        const t1 = performance.now();
        sanskritVM.run(code);
        const vmDuration = performance.now() - t1;

        assert.ok(vmDuration <= treeDuration, `Expected VM (${vmDuration.toFixed(2)}ms) to be faster or equal to Tree-walk (${treeDuration.toFixed(2)}ms)`);
    });
});
