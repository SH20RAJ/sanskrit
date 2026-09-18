# Sanskrit Next Runtime Engine Specification

This document defines the execution environment, stack frame conventions, and bytecode virtual machine of **Sanskrit Next**.

---

## 1. Tier-0 Virtual Machine Engine (`sanskrit-vm`)

For sub-millisecond startup, interactive REPL, zero-dependency testing, and browser WASM execution, Sanskrit Next implements a compact stack-based Bytecode Virtual Machine:
- **Numeric Opcodes**: 40+ specialized bytecodes (`OP_LOAD_LOCAL`, `OP_STORE_LOCAL`, `OP_ADD_I64`, `OP_MUL_F64`, `OP_TENSOR_MATMUL`, `OP_CALL`, `OP_RETURN`).
- **Register-Like Locals**: Stack frames index locals using direct array offsets without hash map lookups.
- **Garbage-Collection-Free Execution**: The VM enforces compile-time lifetime boundaries; values popped from frames call deterministic cleanups.
