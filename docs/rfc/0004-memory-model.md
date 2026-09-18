# RFC 0004: Memory Model and Ownership Semantics

- **Status**: Accepted
- **Author**: Sanskrit Language Architecture Team
- **Created**: 2026-09-18
- **Category**: Memory & Systems

---

## 1. Problem
Garbage collection (GC) introduces nondeterministic pauses and memory bloat unacceptable in high-throughput systems, real-time audio, and GPU/NPU pipeline execution. Conversely, full Rust-style borrow checking with explicit lifetime parameters imposes significant complexity for mathematical array manipulation.

## 2. Goals
- Memory safety without a garbage collector.
- Predictable, deterministic destructor execution (RAII).
- Zero-cost value semantics for composite structs.
- Region / Arena allocation for batch tensor computing and tree evaluations.

## 3. Decision
Sanskrit Next implements **Simplified Ownership & Region Semantics**:
1. **Single Owner Principle**: Every resource (heap buffer, dynamic tensor, file descriptor) has a unique owning binding.
2. **Deterministic Destruction**: When an owner exits scope, its destructor is called immediately at compile time.
3. **Explicit Parameter Passing Modes**:
   - `पठन` / `read` (default): Shared immutable borrow. Zero pointer overhead.
   - `परिवर्तन` / `mut`: Exclusive mutable borrow. Enforces single-writer safety.
   - `स्वामित्व` / `owned`: Ownership move. The caller relinquishes access to the value.
4. **Scoped Memory Regions (`क्षेत्र` / `region`)**:
```sanskrit
क्षेत्र temp_arena:
    मान A = tensor.zeros([512, 512], region=temp_arena)
    मान B = tensor.zeros([512, 512], region=temp_arena)
    मान C = A @ B
// All allocations in temp_arena are released in a single O(1) pointer reset
```

## 4. Value Semantics
Structs are laid out contiguously without heap indirection:
```sanskrit
संरचना बिन्दु३D:
    x: F64
    y: F64
    z: F64
// Stored as 24 contiguous bytes on stack or in cache lines.
```
