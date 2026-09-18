# RFC 0001: Sanskrit Next Language Goals and North Star

- **Status**: Accepted
- **Author**: Sanskrit Language Architecture Team
- **Created**: 2026-09-18
- **Category**: Vision & Philosophy

---

## 1. Problem
Traditional scientific and systems programming requires an awkward fragmentation between rapid research languages (Python, Julia) and low-level high-performance languages (C++, CUDA, Rust). The "two-language problem" forces teams to prototype algorithms in dynamic high-level languages and rewrite them in C++/CUDA for production deployment. Furthermore, existing language tooling treats AI/ML, automatic differentiation, and multi-dimensional tensors as afterthoughts implemented as heavy external runtime libraries.

The original Sanskrit prototype (v0.1-v0.3) was an educational Node.js AST interpreter. It lacked static typing, borrow-checking, SIMD vectorization, and multi-device compiler pipelines.

## 2. Goals
1. **Uncompromising Performance**: Achieve machine-code speeds competitive with C, C++, and Rust via tiered execution (Tier-0 Bytecode VM, Tier-1/2 JIT, and Tier-3 AOT release compilation via MLIR and LLVM).
2. **First-Class Scientific & ML Computing**: Multi-dimensional strided tensors, automatic differentiation, and linear algebra are built directly into the language syntax, type system, and compiler IR.
3. **Memory Safety Without Cognitive Overhead**: Predictable value semantics, deterministic RAII cleanup, explicit borrowing/move parameters, and scoped memory regions (arenas) without garbage collection pauses.
4. **Distinctive Sanskrit Identity with Dual-Script Invariance**: Canonical Devanagari keywords paired 1-to-1 with ASCII aliases for seamless global adoption.
5. **Modern Zero-Dependency DX**: Single unified binary `sanskrit` (compiler, package manager, test runner, benchmark harness, formatter, LSP) installable with a single curl command without requiring Node.js or compiler toolchains.

## 3. Non-Goals
- Maintaining backward bug-for-bug syntax compatibility with the legacy Node.js prototype.
- Creating an unprincipled hybrid of Python with Sanskrit keywords.
- Implementing a mandatory tracing garbage collector.
- Forcing users who cannot type Devanagari to use virtual keyboards (ASCII aliases are first-class).

## 4. Alternatives Considered
- **Refactoring the existing Node.js engine**: Rejected. Node.js imposes garbage collection pauses, pointer overhead, and lack of direct hardware accelerator (GPU/NPU) control.
- **Transpilation to C++ or Rust**: Rejected. Transpilation degrades compiler error reporting, obfuscates stack traces, and prevents deep domain-specific optimizations like MLIR tensor fusion.

## 5. Decision
Build **Sanskrit Next** from scratch as a native Rust compiler workspace targeting a custom intermediate representation (SIR), progressive MLIR lowering, and an instant Tier-0 bytecode virtual machine.

## 6. Syntax & Semantics Overview
Clean, indentation-aware or brace-delimited syntax supporting explicit value types, pattern matching, first-class tensor operations, and trait-bounded generics.

## 7. Compiler Consequences
- Requires a modular, multi-crate Rust compiler architecture (`crates/sanskrit-*`).
- Requires clean separation between front-end parsing, semantic type checking, Sanskrit IR (SIR), and backend adapters.

## 8. Developer Experience (DX) Consequences
- Sub-millisecond startup for REPL, testing, and script execution via Tier-0 VM.
- Rich compiler error messages with ANSI color, multi-span labels, suggestions, and machine-readable JSON output.

## 9. Performance Consequences
- Zero-cost abstractions for structs, iterators, and views.
- Vectorized SIMD loop synthesis and GPU kernel emission via MLIR.

## 10. Migration Consequences
Legacy v0.1-v0.3 code is permanently archived on GitHub release `v0.3.0-legacy`. A detailed syntax mapping guide is provided in `docs/migration/legacy-to-next.md`.

## 11. Open Questions
- Optimal heuristics for Tier-0 VM to Tier-2 JIT hotness promotion thresholds.
