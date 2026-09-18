// Sanskrit Bytecode Virtual Machine Execution Engine
const { Opcodes } = require('./opcodes');
const { createBuiltins, formatValue } = require('../runtime/builtins');
const { RuntimeError, TypeError } = require('../diagnostics/errors');

class CallFrame {
    constructor(closure, slots = 0) {
        this.closure = closure; // { name, arity, chunk }
        this.ip = 0;
        this.slots = slots; // Base index in VM stack
    }

    get chunk() {
        return this.closure.chunk;
    }
}

class VirtualMachine {
    constructor(options = {}) {
        this.outputStream = options.outputStream || console.log;
        this.stack = [];
        this.frames = [];
        this.globals = new Map();
        this.setupGlobals();
    }

    setupGlobals() {
        this.globals.set('सत्य', true);
        this.globals.set('असत्य', false);
        this.globals.set('शून्य', null);
        this.globals.set('अपरिभाषित', undefined);
        this.globals.set('अनंत', Infinity);
        this.globals.set('NaN', NaN);

        // Standard built-ins
        const builtins = createBuiltins(this.outputStream);
        for (const [name, fn] of builtins.entries()) {
            this.globals.set(name, fn);
        }
    }

    push(val) {
        this.stack.push(val);
    }

    pop() {
        return this.stack.pop();
    }

    peek(distance = 0) {
        return this.stack[this.stack.length - 1 - distance];
    }

    interpret(chunk) {
        this.stack = [];
        this.frames = [];

        const mainClosure = {
            name: '<main>',
            arity: 0,
            chunk
        };

        this.push(mainClosure);
        this.frames.push(new CallFrame(mainClosure, 0));

        return this.run();
    }

    run() {
        let frame = this.frames[this.frames.length - 1];

        while (true) {
            const instruction = frame.chunk.code[frame.ip++];

            switch (instruction) {
                case Opcodes.OP_CONSTANT: {
                    const constIdx = frame.chunk.code[frame.ip++];
                    this.push(frame.chunk.constants[constIdx]);
                    break;
                }

                case Opcodes.OP_NULL:
                    this.push(null);
                    break;

                case Opcodes.OP_UNDEFINED:
                    this.push(undefined);
                    break;

                case Opcodes.OP_TRUE:
                    this.push(true);
                    break;

                case Opcodes.OP_FALSE:
                    this.push(false);
                    break;

                case Opcodes.OP_POP:
                    this.pop();
                    break;

                case Opcodes.OP_DUP:
                    this.push(this.peek(0));
                    break;

                case Opcodes.OP_GET_GLOBAL: {
                    const constIdx = frame.chunk.code[frame.ip++];
                    const name = frame.chunk.constants[constIdx];
                    if (!this.globals.has(name)) {
                        throw new RuntimeError(`Undefined variable '${name}' in VM`);
                    }
                    this.push(this.globals.get(name));
                    break;
                }

                case Opcodes.OP_SET_GLOBAL: {
                    const constIdx = frame.chunk.code[frame.ip++];
                    const name = frame.chunk.constants[constIdx];
                    const val = this.peek(0);
                    this.globals.set(name, val);
                    break;
                }

                case Opcodes.OP_DEFINE_GLOBAL: {
                    const constIdx = frame.chunk.code[frame.ip++];
                    const name = frame.chunk.constants[constIdx];
                    const val = this.pop();
                    this.globals.set(name, val);
                    break;
                }

                case Opcodes.OP_GET_LOCAL: {
                    const slot = frame.chunk.code[frame.ip++];
                    this.push(this.stack[frame.slots + slot]);
                    break;
                }

                case Opcodes.OP_SET_LOCAL: {
                    const slot = frame.chunk.code[frame.ip++];
                    this.stack[frame.slots + slot] = this.peek(0);
                    break;
                }

                case Opcodes.OP_ADD: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(a + b);
                    break;
                }

                case Opcodes.OP_SUBTRACT: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(a - b);
                    break;
                }

                case Opcodes.OP_MULTIPLY: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(a * b);
                    break;
                }

                case Opcodes.OP_DIVIDE: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(a / b);
                    break;
                }

                case Opcodes.OP_MODULO: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(a % b);
                    break;
                }

                case Opcodes.OP_POWER: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(Math.pow(a, b));
                    break;
                }

                case Opcodes.OP_NEGATE: {
                    const val = this.pop();
                    this.push(-val);
                    break;
                }

                case Opcodes.OP_NOT: {
                    const val = this.pop();
                    this.push(!val);
                    break;
                }

                case Opcodes.OP_EQUAL: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(a == b);
                    break;
                }

                case Opcodes.OP_NOT_EQUAL: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(a != b);
                    break;
                }

                case Opcodes.OP_STRICT_EQUAL: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(a === b);
                    break;
                }

                case Opcodes.OP_STRICT_NOT_EQUAL: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(a !== b);
                    break;
                }

                case Opcodes.OP_GREATER: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(a > b);
                    break;
                }

                case Opcodes.OP_GREATER_EQUAL: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(a >= b);
                    break;
                }

                case Opcodes.OP_LESS: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(a < b);
                    break;
                }

                case Opcodes.OP_LESS_EQUAL: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(a <= b);
                    break;
                }

                case Opcodes.OP_JUMP: {
                    const offset = frame.chunk.code[frame.ip++];
                    frame.ip = offset;
                    break;
                }

                case Opcodes.OP_JUMP_IF_FALSE: {
                    const offset = frame.chunk.code[frame.ip++];
                    const cond = this.peek(0);
                    if (!cond) {
                        frame.ip = offset;
                    }
                    break;
                }

                case Opcodes.OP_LOOP: {
                    const offset = frame.chunk.code[frame.ip++];
                    frame.ip = offset;
                    break;
                }

                case Opcodes.OP_CLOSURE: {
                    const protoIdx = frame.chunk.code[frame.ip++];
                    const proto = frame.chunk.constants[protoIdx];
                    this.push(proto);
                    break;
                }

                case Opcodes.OP_CALL: {
                    const argCount = frame.chunk.code[frame.ip++];
                    const callee = this.peek(argCount);

                    if (callee && callee.chunk) {
                        // VM Bytecode function call
                        const nextSlots = this.stack.length - argCount - 1;
                        this.frames.push(new CallFrame(callee, nextSlots));
                        frame = this.frames[this.frames.length - 1];
                    } else if (typeof callee === 'function') {
                        // Native JavaScript function / built-in call
                        const args = [];
                        for (let i = 0; i < argCount; i++) {
                            args.unshift(this.pop());
                        }
                        this.pop(); // Pop callee
                        const result = callee(...args);
                        this.push(result);
                    } else {
                        throw new TypeError(`'${callee}' is not a function in VM`);
                    }
                    break;
                }

                case Opcodes.OP_RETURN: {
                    const result = this.pop();
                    this.frames.pop();

                    if (this.frames.length === 0) {
                        return result;
                    }

                    // Reset stack back to frame slot
                    this.stack.length = frame.slots;
                    this.push(result);
                    frame = this.frames[this.frames.length - 1];
                    break;
                }

                case Opcodes.OP_BUILD_LIST: {
                    const count = frame.chunk.code[frame.ip++];
                    const items = [];
                    for (let i = 0; i < count; i++) {
                        items.unshift(this.pop());
                    }
                    this.push(items);
                    break;
                }

                case Opcodes.OP_BUILD_MAP: {
                    const count = frame.chunk.code[frame.ip++];
                    const map = {};
                    for (let i = 0; i < count; i++) {
                        const val = this.pop();
                        const key = this.pop();
                        map[key] = val;
                    }
                    this.push(map);
                    break;
                }

                case Opcodes.OP_GET_INDEX: {
                    const index = this.pop();
                    const target = this.pop();
                    this.push(target[index]);
                    break;
                }

                case Opcodes.OP_SET_INDEX: {
                    const val = this.pop();
                    const index = this.pop();
                    const target = this.pop();
                    target[index] = val;
                    this.push(val);
                    break;
                }

                case Opcodes.OP_SLICE: {
                    let step = this.pop();
                    let stop = this.pop();
                    let start = this.pop();
                    const seq = this.pop();

                    if (step === null || step === undefined) step = 1;
                    const len = seq.length;
                    const isStr = typeof seq === 'string';

                    let startIndex, stopIndex;
                    if (step > 0) {
                        startIndex = start === null ? 0 : (start < 0 ? Math.max(0, len + start) : Math.min(len, start));
                        stopIndex = stop === null ? len : (stop < 0 ? Math.max(0, len + stop) : Math.min(len, stop));
                    } else {
                        startIndex = start === null ? len - 1 : (start < 0 ? Math.max(-1, len + start) : Math.min(len - 1, start));
                        stopIndex = stop === null ? -1 : (stop < 0 ? Math.max(-1, len + stop) : Math.min(len, stop));
                    }

                    const res = [];
                    if (step > 0) {
                        for (let i = startIndex; i < stopIndex; i += step) res.push(seq[i]);
                    } else {
                        for (let i = startIndex; i > stopIndex; i += step) res.push(seq[i]);
                    }

                    this.push(isStr ? res.join('') : res);
                    break;
                }

                case Opcodes.OP_PRINT: {
                    const val = this.pop();
                    this.outputStream(formatValue(val));
                    this.push(undefined);
                    break;
                }

                case Opcodes.OP_HALT:
                    return this.pop();

                default:
                    throw new RuntimeError(`Unknown VM opcode: ${instruction}`);
            }
        }
    }
}

module.exports = {
    VirtualMachine,
    CallFrame
};
