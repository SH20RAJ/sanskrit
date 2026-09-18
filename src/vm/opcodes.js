// Sanskrit Bytecode Virtual Machine Opcodes
const Opcodes = {
    // Literals & Constants
    OP_CONSTANT: 1,
    OP_NULL: 2,
    OP_UNDEFINED: 3,
    OP_TRUE: 4,
    OP_FALSE: 5,

    // Stack Operations
    OP_POP: 6,
    OP_DUP: 7,

    // Variables & Scopes
    OP_GET_GLOBAL: 8,
    OP_SET_GLOBAL: 9,
    OP_DEFINE_GLOBAL: 10,
    OP_GET_LOCAL: 11,
    OP_SET_LOCAL: 12,

    // Binary Arithmetic Operators
    OP_ADD: 13,
    OP_SUBTRACT: 14,
    OP_MULTIPLY: 15,
    OP_DIVIDE: 16,
    OP_MODULO: 17,
    OP_POWER: 18,

    // Unary Operators
    OP_NEGATE: 19,
    OP_NOT: 20,

    // Comparisons
    OP_EQUAL: 21,
    OP_NOT_EQUAL: 22,
    OP_STRICT_EQUAL: 23,
    OP_STRICT_NOT_EQUAL: 24,
    OP_GREATER: 25,
    OP_GREATER_EQUAL: 26,
    OP_LESS: 27,
    OP_LESS_EQUAL: 28,

    // Control Flow & Branching
    OP_JUMP: 29,
    OP_JUMP_IF_FALSE: 30,
    OP_LOOP: 31,

    // Functions & Execution
    OP_CLOSURE: 32,
    OP_CALL: 33,
    OP_RETURN: 34,

    // Data Structures
    OP_BUILD_LIST: 35,
    OP_BUILD_MAP: 36,
    OP_GET_INDEX: 37,
    OP_SET_INDEX: 38,
    OP_SLICE: 39,

    // Native / Halting
    OP_PRINT: 40,
    OP_HALT: 41
};

// Inverted lookup map for disassembly
const OpcodeNames = Object.fromEntries(
    Object.entries(Opcodes).map(([name, code]) => [code, name])
);

module.exports = {
    Opcodes,
    OpcodeNames
};
