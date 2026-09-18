// Sanskrit Bytecode Virtual Machine Subsystem
const { Opcodes, OpcodeNames } = require('./opcodes');
const { Chunk } = require('./chunk');
const { BytecodeCompiler } = require('./compiler');
const { VirtualMachine } = require('./vm');

module.exports = {
    Opcodes,
    OpcodeNames,
    Chunk,
    BytecodeCompiler,
    VirtualMachine
};
