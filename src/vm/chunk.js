// Sanskrit Bytecode Chunk
const { Opcodes, OpcodeNames } = require('./opcodes');

class Chunk {
    constructor(name = '<script>') {
        this.name = name;
        this.code = [];
        this.constants = [];
        this.lines = [];
    }

    write(byte, line = 1) {
        this.code.push(byte);
        this.lines.push(line);
        return this.code.length - 1;
    }

    addConstant(value) {
        this.constants.push(value);
        return this.constants.length - 1;
    }

    disassemble(label = null) {
        const header = `== Disassembly: ${label || this.name} ==`;
        const lines = [header];
        let offset = 0;

        while (offset < this.code.length) {
            const [disassembled, nextOffset] = this.disassembleInstruction(offset);
            lines.push(disassembled);
            offset = nextOffset;
        }

        return lines.join('\n');
    }

    disassembleInstruction(offset) {
        const op = this.code[offset];
        const opName = OpcodeNames[op] || `UNKNOWN(${op})`;
        const line = this.lines[offset];
        const offsetStr = String(offset).padStart(4, '0');

        switch (op) {
            case Opcodes.OP_CONSTANT:
            case Opcodes.OP_GET_GLOBAL:
            case Opcodes.OP_SET_GLOBAL:
            case Opcodes.OP_DEFINE_GLOBAL: {
                const constIdx = this.code[offset + 1];
                const val = JSON.stringify(this.constants[constIdx]);
                return [`${offsetStr}  ${opName.padEnd(16)} [idx: ${constIdx}] -> ${val}`, offset + 2];
            }

            case Opcodes.OP_GET_LOCAL:
            case Opcodes.OP_SET_LOCAL:
            case Opcodes.OP_CALL:
            case Opcodes.OP_BUILD_LIST:
            case Opcodes.OP_BUILD_MAP: {
                const operand = this.code[offset + 1];
                return [`${offsetStr}  ${opName.padEnd(16)} ${operand}`, offset + 2];
            }

            case Opcodes.OP_JUMP:
            case Opcodes.OP_JUMP_IF_FALSE: {
                const target = this.code[offset + 1];
                return [`${offsetStr}  ${opName.padEnd(16)} -> ${String(target).padStart(4, '0')}`, offset + 2];
            }

            case Opcodes.OP_LOOP: {
                const target = this.code[offset + 1];
                return [`${offsetStr}  ${opName.padEnd(16)} <- ${String(target).padStart(4, '0')}`, offset + 2];
            }

            case Opcodes.OP_CLOSURE: {
                const constIdx = this.code[offset + 1];
                return [`${offsetStr}  ${opName.padEnd(16)} [proto idx: ${constIdx}]`, offset + 2];
            }

            default:
                return [`${offsetStr}  ${opName}`, offset + 1];
        }
    }
}

module.exports = { Chunk };
