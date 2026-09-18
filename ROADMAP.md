# Sanskrit Next Engineering Roadmap

This document outlines the architectural milestones, core feature tracks, and long-term vision for the **Sanskrit Next** programming language.

---

## Milestone Overview

```
v2.0-alpha.1 (Delivered) ──► v2.0-beta (Q4 2026) ──► v2.0-RC (Q1 2027) ──► v2.0-LTS (Mid 2027)
        │                             │                      │
        ▼                             ▼                      ▼
• Greenfield Rust Core         • Metal/CUDA GPU Kernels • Full MLIR/LLVM Native
• Tier-0 Bytecode VM (<1ms)    • Expanded Stdlib        • Package Registry
• Dual-Script Invariance       • Async Concurrency      • Production Hardening
• VS Code Platform (LSP/DAP)   • Memory Safety Analysis • Comprehensive Benchmarks
```

---

## Phase 1: Greenfield Foundation & Developer Tooling [:white_check_mark: Completed]

- [x] **100% Native Rust Architecture**: Replaced legacy Node.js prototype with 14 modular crates in `crates/`.
- [x] **Dual-Script Invariance**: Full lexical, syntactic, and semantic parity between Devanagari (`कार्य`, `मान`, `दिश`) and ASCII (`fn`, `let`, `Tensor`).
- [x] **Pratt Precedence Parser & AST**: Robust parsing with operator precedence, Devanagari numerals (`०-९`), and script desugaring.
- [x] **Bidirectional Type Checker**: Type inference, tensor dimension checking, and multi-span diagnostics.
- [x] **Tier-0 Bytecode Virtual Machine**: Low-latency numeric stack machine with flat chunk encoding and <1ms startup.
- [x] **First-Class Strided Tensors**: $N$-dimensional contiguous and strided tensor views with SIMD matrix multiplication (`@`).
- [x] **Automatic Differentiation (AD)**: Dual-number forward mode and reverse-mode tape differentiation primitives (`diff`, `grad`).
- [x] **Embedded Language Server (LSP 3.17)**: Stdio JSON-RPC daemon with diagnostics, hovers, and completions.
- [x] **VS Code Extension Platform**: Language intelligence, DAP debugger, native Test Explorer, Benchmark runner, and Tensor Inspector webview.
- [x] **Zero-Dependency Installer**: `install.sh` and `sanskritup` toolchain manager.

---

## Phase 2: Scientific Computing & GPU Acceleration [:construction: In Progress]

- [ ] **Hardware GPU Accelerators**:
  - [x] Apple Silicon AMX / Metal detection in `sanskrit doctor`.
  - [ ] Native Metal Performance Shaders (MPS) tensor kernel execution on macOS.
  - [ ] NVIDIA CUDA runtime integration via PTX / CUDA driver API on Linux.
- [ ] **Expanded Tensor Operations**:
  - [ ] Broadcasting semantics ($A + B$ for compatible dimensions).
  - [ ] Strided convolution (`conv2d`) and pooling primitives.
  - [ ] Linear algebra decompositions (SVD, QR, Cholesky).
- [ ] **Higher-Order Automatic Differentiation**:
  - [ ] Second derivatives and Hessian vector products ($H \cdot v$).
  - [ ] Reverse-mode tape checkpointing for large computational graphs.
- [ ] **Standard Library Expansion (`std/`)**:
  - [ ] `std::math`: Special functions (Gamma, Bessel, Error function).
  - [ ] `std::io`: Fast memory-mapped file I/O.
  - [ ] `std::random`: Cryptographically secure and SIMD pseudo-random generators.

---

## Phase 3: MLIR Pipeline & Native AOT Compilation [:calendar: Planned Q1 2027]

- [ ] **Sanskrit MLIR Dialect (`skt`)**:
  - [x] SIR to MLIR text emitter in `sanskrit-mlir`.
  - [ ] Dialect conversion pipeline from `skt` to `linalg` and `affine` dialects.
  - [ ] Polyhedral loop tiling, fusion, and vectorization passes.
- [ ] **LLVM Native Backend**:
  - [ ] Direct AOT compilation to native static binaries (`.o` / native executable).
  - [ ] Tier-1 JIT engine for hot bytecode loop specialization.
- [ ] **C / Rust Foreign Function Interface (FFI)**:
  - [ ] Zero-overhead C calling convention (`extern "C"`).
  - [ ] Direct interoperability with BLAS, LAPACK, and cuBLAS libraries.

---

## Phase 4: Decentralized Package Registry & Tooling [:calendar: Planned Mid 2027]

- [ ] **Decentralized Package Registry**:
  - [ ] Content-addressed immutable package distribution.
  - [ ] Cryptographic signing and Ed25519 signature verification for published packages.
- [ ] **Sanskrit Documentation Generator (`sanskrit doc`)**:
  - [ ] Automatic API reference generation from docstrings in both Devanagari and English.
  - [ ] Ancient manuscript aesthetics and responsive dark/light theme.
- [ ] **Interactive REPL Enhancements**:
  - [ ] Rich syntax highlighting and auto-complete in terminal.
  - [ ] Inline plotting and ASCII tensor visualization in REPL.

---

## Phase 5: v2.0 Production Release & Long-Term Stability

- [ ] Comprehensive competitive benchmark suite against C++, Rust, Mojo, and Julia.
- [ ] Language specification stability freeze (SemVer 2.0 guarantee).
- [ ] Formal security and sandbox audit.
- [ ] Multi-platform tier-1 prebuilt binaries for Linux (x86_64, aarch64), macOS (Apple Silicon, Intel), and Windows.

---

*To propose additions or discuss roadmap items, please participate in [GitHub Discussions](https://github.com/SH20RAJ/sanskrit/discussions) or submit an RFC under `docs/rfc/`.*
