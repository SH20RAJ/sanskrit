# Sanskrit Next Architecture & Technology Evaluation

This document serves as the foundational architectural decision record for **Sanskrit Next**. It evaluates compiler backends, intermediate representations, type systems, scientific computing abstractions, and developer tooling against the project's core mission:
*A safe, extremely fast, scientifically powerful, AI/ML-native systems language with exceptional developer experience and a distinctive Sanskrit identity.*

---

## 1. Executive Technology Evaluation Matrix

| Technology | Strengths | Weaknesses | Performance | Compile-Time Impact | Developer Experience | Ecosystem Maturity | Maintenance Risk | Sanskrit Next Fit | Decision |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Rust (Host Language)** | Memory safety, zero-cost abstractions, rich crates, excellent cross-compilation. | Steep learning curve, compilation throughput. | Native machine speed. | Moderate. | Industry gold-standard CLI & test tooling. | Vast, high-quality compiler tooling. | Extremely low. | **Ideal** | **Adopt** as primary compiler implementation language. |
| **LLVM (Backend / JIT)** | World-class native codegen, aggressive optimizations, mature targets (x86, ARM, RISC-V), LLJIT/ORC. | Heavy runtime dependency, large memory footprint, slow compilation for unoptimized passes. | Highest tier for single-core CPU throughput. | High compile times if un-tiered. | Complex C++ API; requires safe Rust wrappers. | Ubiquitous industry standard. | Low (active backing by LLVM Foundation). | **Essential** | **Adopt** for Tier 2/3 optimizing JIT and AOT code generation. |
| **MLIR (Multi-Level IR)** | Progressive lowering, custom dialects, first-class tensor/vector/linalg dialects, transform dialect, bufferization. | C-API and Rust bindings (Melior) are actively evolving; steep learning curve. | Enables domain-specific fusion and vectorization outperforming raw LLVM. | Fast progressive dialect conversion. | Modular, declarative rewrite patterns. | Rapidly expanding (LLVM, Google, Modular, Mojo). | Low (in-tree LLVM subproject). | **Core Pillar** | **Adopt** as primary intermediate pipeline via an isolated adapter (`crates/sanskrit-mlir`). |
| **IREE (Execution Engine)** | Native MLIR compiler & runtime for heterogeneous deployment (CPU, Vulkan, Metal, CUDA, ROCm). | Additional toolchain layer; evolving C API. | Outstanding GPU/NPU utilization and low memory footprint. | Fast AOT HAL lowering. | Excellent deployment to edge and embedded devices. | Proven in Google and OpenXLA production workloads. | Low (OpenXLA). | **High** | **Adopt** as target deployment backend for heterogeneous tensor execution. |
| **StableHLO** | Standardized portability dialect between PyTorch, JAX, XLA, and ML compilers; backward compatibility guarantees. | Restricted to coarse-grained tensor operations. | Excellent for graph-level fusion in XLA/IREE. | Very low. | Simple functional operator semantics. | High (supported by Google, Meta, Intel, Apple). | Low. | **High** | **Adopt** as tensor interoperability and external model import/export dialect. |
| **Enzyme** | LLVM IR-level automatic differentiation; differentiates arbitrary native code, loops, and allocations. | Bound to specific LLVM versions; complex compiler integration. | Generates state-of-the-art adjoint kernels with zero interpreter overhead. | Moderate pass latency. | Declarative gradient synthesis (`__enzyme_autodiff`). | High academic & national lab adoption. | Low-to-moderate. | **High** | **Adopt** design pattern for native compiler-level AD. |
| **Julia Dispatch Model** | Unmatched scientific expressiveness, multiple dispatch enables composable math and generic algorithms. | JIT latency ("time-to-first-plot"), dynamic type instability requires runtime checks without static types. | Near C-speed when type-stable; degrades when type-unstable. | JIT overhead during interactive use. | High mathematical readability. | Rich scientific ecosystem. | N/A (language). | **Conceptual** | **Adopt** static multiple dispatch and specialization; reject dynamic type instability. |
| **Mojo Memory Model** | `owned`, `borrowed`, `inout`, explicit value semantics, struct layouts without garbage collection. | Proprietary ecosystem, evolving language spec. | Matches C/C++ memory efficiency. | Fast static analysis. | Clean, predictable systems ergonomics. | Early stage. | High (closed source elements). | **Conceptual** | **Synthesize** explicit value semantics and simplified ownership without Rust's cognitive borrow-checking overhead. |
| **DLPack** | Universal in-memory tensor structure exchange across PyTorch, NumPy, CuPy, TVM, and Mojo. | Only specifies metadata; does not manage lifetime or cross-process sync. | True zero-copy memory pointer sharing. | Negligible. | Seamless Python interop. | Universal standard in AI/ML. | Extremely low. | **Essential** | **Adopt** for zero-copy Python / PyTorch / NumPy interoperability. |
| **Tier-0 Bytecode VM** | Sub-millisecond startup, zero external dependencies, perfect for REPL, testing, scripting, and WASM playground. | 5x-15x slower than fully vectorized native machine code. | 15x-30x faster than tree-walk AST interpreters. | Instantaneous (<1ms). | Instant feedback loop, superior debugger support. | Fully self-contained in Rust. | Zero external risk. | **Essential** | **Adopt** as Tier-0 execution engine in `crates/sanskrit-vm`. |

---

## 2. Deep Dive: Compiler Infrastructure (LLVM vs. MLIR vs. Custom IR)

### 2.1 Why MLIR is Mandatory for Sanskrit Next
A naive compiler compiles AST directly into LLVM IR. While functional for general-purpose scalars, direct LLVM emission fails miserably for scientific and AI/ML workloads because:
1. **Loss of High-Level Semantics**: LLVM IR understands only flat byte pointers, scalar integers, and IEEE floats. When an $N$-dimensional tensor multiplication ($A \times B$) or convolution is lowered directly to LLVM loops, high-level structural semantics (shapes, strides, tensor contiguity, broadcasting, data-parallelism) are completely lost.
2. **Missing Loop Nest Optimization**: Optimizing multi-dimensional loops for cache locality (tiling, packing, register-level vectorization) in raw LLVM IR is notoriously fragile.
3. **MLIR Dialect Hierarchy**: MLIR solves this via progressive lowering:
   $$\text{Sanskrit AST} \longrightarrow \text{Sanskrit HIR} \longrightarrow \text{SIR (Sanskrit IR)} \longrightarrow \text{sanskrit.* Dialect} \longrightarrow \text{linalg / tensor / vector} \longrightarrow \text{LLVM / IREE / GPU}$$

### 2.2 Isolating Unstable MLIR Rust Bindings
MLIR's C-API and the Rust `melior` bindings are evolving. Exposing low-level MLIR types across the entire compiler frontend would couple Sanskrit Next's semantic analysis to C++ ABI churn.
**Decision**: We construct an explicit intermediary: **Sanskrit Intermediate Representation (SIR)** in `crates/sanskrit-ir`. SIR is an independent, pure-Rust, strongly-typed SSA-form intermediate representation. The adapter crate `crates/sanskrit-mlir` translates SIR into MLIR dialects or text-format MLIR bytecode, shielding the frontend, type checker, and Tier-0 VM from MLIR churn.

---

## 3. Scientific Computing & Differentiable Compiler Design

### 3.1 First-Class Tensors vs. Library Wrappers
In languages like Python or C++, tensors are library objects (`torch.Tensor`, `Eigen::Matrix`) managed at runtime.
In **Sanskrit Next**, tensors are first-class language primitives:
```sanskrit
// Shape and dtype encoded in type signature or inferred
मान A: Tensor[F32, [1024, 1024], Layout=RowMajor] = tensor.ones([1024, 1024])
```
This enables the compiler to:
- Perform compile-time shape verification and statically detect dimension mismatches ($[M \times K] \times [K \times N]$).
- Optimize memory allocation by reusing buffers for intermediate operations (in-place bufferization).
- Automatically synthesize vectorized SIMD micro-kernels targeted to the exact hardware registers (AVX-512, ARM Neon, Apple Silicon AMX).

### 3.2 Compiler-Level Automatic Differentiation (Enzyme Model)
Rather than constructing dynamic tape graphs in memory at runtime (which incurs significant pointer-chasing and allocation overhead like PyTorch autograd), Sanskrit Next treats differentiation as a compiler transformation.
- **Forward Mode**: Implemented via dual-number evaluation for directional derivatives and gradient-vector products.
- **Reverse Mode (Adjoint Synthesis)**: The compiler analyzes the SIR function, generates a reverse-pass adjoint CFG, and fuses gradient computations directly into the execution kernel.

---

## 4. Systems Architecture & Memory Model Synthesis

### 4.1 Lessons from Rust, Mojo, and Swift
- **Rust**: Uncompromising safety via borrow checker, but lifetimes and complex borrow semantics create steep cognitive friction for numerical computing and exploratory data science.
- **Mojo**: Replaces complex lifetime annotations with explicit argument conventions (`borrowed`, `inout`, `owned`) and predictable value semantics on structs.
- **Swift**: Value semantics via Copy-on-Write (CoW) and deterministic reference counting for dynamically sized types.

### 4.2 The Sanskrit Next Memory Model: Predictable Value Semantics + Regions
1. **Value Semantics by Default**: Primitives, fixed-size vectors, and user-defined `संरचना` (structs) have static, contiguous stack/register layouts without pointer indirection.
2. **Deterministic RAII & Ownership**: Dynamic structures (tensors, strings, heap buffers) have a single unambiguous owner. When the owning binding goes out of scope, resources are freed deterministically without a garbage collector.
3. **Explicit Parameter Modes**:
   - `पठन` / `read`: Immutable borrowed view (zero-copy read).
   - `परिवर्तन` / `mut`: Exclusive mutable reference (in-place modification).
   - `स्वामित्व` / `owned`: Value transfer (move semantics).
4. **Arena & Region Allocation for Scientific Workloads**: For batch numerical computations and graph traversals, Sanskrit Next provides scoped memory regions (`क्षेत्र` / `region`), allowing thousands of allocations to be made rapidly and reclaimed in a single $O(1)$ pointer reset.

---

## 5. Developer Experience & Tooling Evaluation

### 5.1 Package Management & Reproducible Builds
Learning from Go (`go.mod`), Cargo (`Cargo.toml`), and Zig:
- Single unified binary `sanskrit` providing `new`, `run`, `build`, `test`, `bench`, `check`, `fmt`, `doctor`, and `env`.
- Explicit lockfile `Sanskrit.lock` with SHA-256 cryptographic hashes for every dependency.
- Pure zero-network offline builds when dependencies are cached.

### 5.2 Standalone Zero-Dependency Distribution
End-users must never be forced to install Node.js, npm, Python, or a C++ build toolchain to run Sanskrit.
- Official pre-compiled native binaries distributed via GitHub Releases for:
  - `x86_64-unknown-linux-gnu`
  - `aarch64-unknown-linux-gnu`
  - `x86_64-apple-darwin`
  - `aarch64-apple-darwin`
  - `x86_64-pc-windows-msvc`
- Single curl command installer `install.sh` and toolchain manager `sanskritup`.
