# Sanskrit Next Compiler Architecture Specification

This document details the end-to-end multi-pass compiler architecture of **Sanskrit Next**.

---

## 1. Compiler Pipeline Overview

The Sanskrit Next compiler is architected around strongly-typed, immutable intermediate stages:

```
┌─────────────────────────────────────────────────────────────────┐
│                     Sanskrit Source Code                        │
│             (.skt or .sns, Devanagari or ASCII)                 │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      sanskrit-lexer                             │
│       Unicode-aware lexical analysis, token normalization       │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      sanskrit-parser                            │
│     Recursive-descent Pratt parser, precedence, error recovery  │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                       sanskrit-ast                              │
│             Strongly-typed Abstract Syntax Tree                 │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                       sanskrit-hir                              │
│       High-Level IR: desugared syntax, pattern normalization    │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      sanskrit-typeck                            │
│     Bidirectional type inference, trait resolution, borrowing   │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                       sanskrit-ir                               │
│       Sanskrit Intermediate Representation (SIR, SSA form)      │
│      Shape inference, lifetime verification, autodiff annotations│
└────────────────┬───────────────────────────────┬────────────────┘
                 │                               │
                 ▼                               ▼
┌─────────────────────────────────┐ ┌─────────────────────────────┐
│          sanskrit-vm            │ │       sanskrit-mlir         │
│   Tier-0 Bytecode Compiler &    │ │ MLIR lowering: sanskrit.*   │
│   Stack Virtual Machine         │ │ linalg, vector, tensor      │
│   (<1ms startup, REPL, tests)   │ └──────────────┬──────────────┘
└─────────────────────────────────┘                │
                                                   ▼
                                    ┌─────────────────────────────┐
                                    │    Backends: LLVM / IREE    │
                                    │  Native CPU (AVX/Neon), GPU │
                                    └─────────────────────────────┘
```

---

## 2. Multi-Tiered Execution Strategy

| Execution Tier | Technology | Latency to Execution | Throughput | Primary Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 0** | Bytecode VM (`sanskrit-vm`) | < 1 millisecond | 15x–30x faster than tree-walk interpreters | REPL, local unit tests, rapid scripting, WASM playground. |
| **Tier 1** | Baseline Native JIT | ~10 milliseconds | 0.8x of unoptimized C | Interactive notebooks, fast iteration debugging. |
| **Tier 2** | Optimizing JIT (LLVM ORC) | ~100 milliseconds | Matches -O2 C/Rust | Hot-loop scientific algorithms, long-running batch jobs. |
| **Tier 3** | Ahead-of-Time Release (AOT) | Full compilation pass | Maximum peak throughput (-O3, LTO, PGO) | Standalone binary distribution, microservices, edge models. |
