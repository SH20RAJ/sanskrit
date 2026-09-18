# Sanskrit Intermediate Representation (SIR) Specification

This document details the design of **Sanskrit IR (SIR)**, the core semantic intermediate representation in `crates/sanskrit-ir`.

---

## 1. Design Objectives

SIR is designed to decouple front-end language syntax from low-level compiler backends. It represents:
- Static Single Assignment (SSA) form with basic blocks.
- Explicit type signatures and tensor shapes on every value.
- Explicit memory allocations, lifetime scopes, and borrowing states.
- Abstract tensor arithmetic (`MatMul`, `Conv2D`, `Broadcast`, `Reduce`) before bufferization.
- Automatic differentiation annotations (`GradOf`, `AdjointBuffer`).

---

## 2. SIR Instruction Set Architecture (Overview)

```rust
pub enum SirInstruction {
    // Memory & Bindings
    AllocStack { id: ValueId, ty: SirType },
    AllocHeap { id: ValueId, ty: SirType },
    AllocTensor { id: ValueId, shape: Vec<usize>, dtype: NumericType, device: DeviceType },
    Load { id: ValueId, ptr: ValueId },
    Store { ptr: ValueId, val: ValueId },

    // Arithmetic & Bitwise
    BinaryOp { id: ValueId, op: BinaryOpKind, lhs: ValueId, rhs: ValueId },
    UnaryOp { id: ValueId, op: UnaryOpKind, operand: ValueId },

    // Tensor Operations
    TensorMatMul { id: ValueId, lhs: ValueId, rhs: ValueId },
    TensorSlice { id: ValueId, tensor: ValueId, ranges: Vec<SliceRange> },
    TensorBroadcast { id: ValueId, tensor: ValueId, target_shape: Vec<usize> },

    // Control Flow
    Branch { target_block: BlockId },
    CondBranch { cond: ValueId, then_block: BlockId, else_block: BlockId },
    Return { val: Option<ValueId> },

    // Differentiability
    SynthesizeGradient { id: ValueId, target_func: FuncId, wrt_arg: usize },
}
```
