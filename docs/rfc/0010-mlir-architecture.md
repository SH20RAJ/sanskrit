# RFC 0010: Multi-Level Intermediate Representation (MLIR) Pipeline

- **Status**: Accepted
- **Author**: Sanskrit Language Architecture Team
- **Created**: 2026-09-18
- **Category**: Compiler Architecture & Code Generation

---

## 1. Problem
Traditional compilers compile AST directly to LLVM IR. While optimal for scalar control flow, LLVM cannot express high-level array transformations, loop tiling, vectorization schemes, or device-specific memory hierarchies for GPUs and NPUs.

## 2. Decision
Sanskrit Next implements an **MLIR-First Progressive Lowering Architecture**:

```
Sanskrit Source (.skt / .sns)
       │
       ▼
   Lexer & Parser (Dual-Script Invariant)
       │
       ▼
 Strongly-Typed AST
       │
       ▼
  HIR (Desugared)
       │
       ▼
  Type Checker & Borrow Analysis
       │
       ▼
  Sanskrit IR (SIR) [SSA, Shapes, Lifetimes]
       │
       ├───► Tier-0 Bytecode Compiler ──► Tier-0 Bytecode VM (Instant Execution)
       │
       ▼
  sanskrit.* MLIR Dialect
       │
       ├───► tensor / linalg / vector / affine
       │          │
       │          ▼
       │     Bufferization (MemRef Allocation)
       │          │
       │          ▼
       │     llvm Dialect ──► LLVM ORC JIT / Native Object File
       │
       └───► StableHLO ──► IREE / XLA (Heterogeneous GPU / NPU Deployment)
```

## 3. Sanskrit Dialect Definitions
- `sanskrit.tensor_alloc`: Allocates a multi-dimensional strided tensor with memory region tracking.
- `sanskrit.matmul`: Emits structured matrix multiplication lowered to `linalg.matmul`.
- `sanskrit.grad`: Declares an automatic differentiation operation lowered before bufferization.

## 4. Stability Boundary Isolation
All interactions with MLIR C APIs or Melior Rust bindings are isolated inside `crates/sanskrit-mlir/`. The compiler frontend, typechecker, and Tier-0 VM depend only on the pure-Rust `crates/sanskrit-ir` crate.
