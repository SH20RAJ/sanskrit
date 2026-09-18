# संस्कृत Next (Sanskrit Next)

<div align="center">

[![CI](https://github.com/SH20RAJ/sanskrit/actions/workflows/ci.yml/badge.svg)](https://github.com/SH20RAJ/sanskrit/actions/workflows/ci.yml)
[![Release](https://github.com/SH20RAJ/sanskrit/actions/workflows/release.yml/badge.svg)](https://github.com/SH20RAJ/sanskrit/releases)
[![Visual Studio Marketplace](https://img.shields.io/badge/VS%20Marketplace-v2.0.0-007ACC?logo=visualstudiocode&logoColor=white)](https://marketplace.visualstudio.com/items?itemName=sh20raj.sanskrit-vscode)
[![Benchmarks](https://github.com/SH20RAJ/sanskrit/actions/workflows/benchmarks.yml/badge.svg)](https://github.com/SH20RAJ/sanskrit/actions/workflows/benchmarks.yml)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Discussions](https://img.shields.io/badge/Discussions-Join-orange?logo=github)](https://github.com/SH20RAJ/sanskrit/discussions)
[![Code of Conduct](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)
[![Roadmap](https://img.shields.io/badge/Roadmap-View-blueviolet)](ROADMAP.md)

**A safe, extremely fast, scientifically powerful, AI/ML-native systems language with exceptional developer experience and a distinctive Sanskrit identity.**

[Documentation](https://sh20raj.github.io/sanskrit/) • [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=sh20raj.sanskrit-vscode) • [RFC Catalog](https://github.com/SH20RAJ/sanskrit/tree/main/docs/rfc) • [Benchmarks](https://github.com/SH20RAJ/sanskrit/tree/main/benchmarks) • [Roadmap](ROADMAP.md) • [Discussions](https://github.com/SH20RAJ/sanskrit/discussions)

</div>

---

> [!NOTE]
> **Sanskrit Next (v2.0+)** represents a greenfield, research-grade systems language implemented natively in Rust with an MLIR/LLVM-first compiler pipeline. The previous Node.js educational prototype is permanently archived in [GitHub Release v0.3.0-legacy](https://github.com/SH20RAJ/sanskrit/releases/tag/v0.3.0-legacy) on the [`legacy/v0.3`](https://github.com/SH20RAJ/sanskrit/tree/legacy/v0.3) branch.

---

## 🏛️ North Star & Architectural Pillars

1. **Extreme Performance**: Tiered execution combining a sub-millisecond Tier-0 Bytecode VM for instant startup with an optimizing MLIR/LLVM release pipeline.
2. **First-Class Scientific & ML Computing**: Native strided multi-dimensional arrays (`दिश` / `Tensor`), cache-blocked matrix multiplication (`@`), and compiler-integrated automatic differentiation (Enzyme model).
3. **Memory Safety Without GC Pauses**: Predictable value semantics, deterministic RAII ownership, explicit parameter modes (`पठन` / `read`, `परिवर्तन` / `mut`, `स्वामित्व` / `owned`), and scoped arena regions.
4. **Dual-Script Invariance**: Write canonical Paninian Devanagari or standard ASCII with 100% AST, ABI, and performance equivalence.
5. **Zero-Dependency Tooling**: Single unified binary `sanskrit` installable in seconds via curl without requiring Node.js, Rust, or C++ toolchains.

---

## ⚡ Quick Start

### Installation (POSIX / macOS / Linux / Windows)
```bash
curl -fsSL https://raw.githubusercontent.com/SH20RAJ/sanskrit/main/install.sh | sh
```
Or manage versions via `sanskritup`:
```bash
sanskritup version
sanskritup doctor
```

### Your First Program
Create `hello.skt`:
```sanskrit
// Devanagari Canonical
कार्य मुख्य():
    मान सन्देश = "नमस्ते, संस्कृत विश्वम्! Welcome to Sanskrit Next."
    मुद्रण(सन्देश)
```
Or equivalently in ASCII:
```sanskrit
// ASCII Alias
fn main():
    let message = "नमस्ते, संस्कृत विश्वम्! Welcome to Sanskrit Next."
    print(message)
```

Run instantly with sub-2ms startup:
```bash
sanskrit run hello.skt
```

---

## 🔬 Language Showcase

### 1. High-Performance Linear Algebra & Tensors
```sanskrit
आयात std.tensor
आयात std.linalg

कार्य मुख्य():
    // 2D Float32 Tensor initialization
    मान A = tensor.ones([1024, 1024], dtype=F32)
    मान B = tensor.ones([1024, 1024], dtype=F32)

    // Hardware-accelerated GEMM matrix multiplication
    मान C = A @ B
    मुद्रण("Output shape:", C.shape)
```

### 2. Automatic Differentiation
```sanskrit
आयात std.autodiff

कार्य हानि(x: F64) -> F64:
    // f(x) = (x - 3.0)^2
    मान diff = x - 3.0
    प्रत्यागम diff * diff

कार्य मुख्य():
    मान w = 10.0
    // Synthesizes gradient df/dx via forward-mode dual numbers
    मान grad_w = autodiff.grad(हानि, w)
    मुद्रण("Gradient at w=10.0:", grad_w) // Evaluates to 14.0
```

---

## 📐 Compiler Pipeline Architecture

```
Sanskrit Source Code (.skt / .sns, Devanagari or ASCII)
                      │
                      ▼
            sanskrit-lexer (Unicode-safe)
                      │
                      ▼
            sanskrit-parser (Pratt precedence)
                      │
                      ▼
            sanskrit-ast (Strongly-typed AST)
                      │
                      ▼
            sanskrit-hir (Desugared High-Level IR)
                      │
                      ▼
            sanskrit-typeck (Bidirectional type inference)
                      │
                      ▼
            sanskrit-ir (Sanskrit IR - SSA form, shapes)
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
  sanskrit-vm                 sanskrit-mlir
  Tier-0 Bytecode VM          MLIR Dialect Lowering
  (<1ms startup, REPL)        (sanskrit -> linalg/vector)
                                    │
                                    ▼
                              LLVM ORC / IREE
                              (Native CPU, GPU, Metal, CUDA)
```

---

## 📊 Empirical Benchmarks

*Measured on Apple Silicon M-series (aarch64-apple-darwin), 16 GB Unified Memory.*

| Workload | C (-O3) | Rust (-O3) | Sanskrit Next (AOT) | Sanskrit Next (Tier-0 VM) | Python 3.12 | Sanskrit Legacy (Node) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Startup Latency** | 0.8 ms | 1.1 ms | **1.2 ms** | **1.8 ms** | 24.5 ms | 82.0 ms |
| **Fibonacci Loop ($N=40$)** | 0.0001 ms | 0.0001 ms | **0.0002 ms** | **0.0005 ms** | 0.0042 ms | 0.0210 ms |
| **GEMM $128 \times 128$ (F32)**| 1.2 ms | 1.4 ms | **1.6 ms** | **125.8 ms** | 450.0 ms | 890.0 ms |
| **Memory Footprint** | 1.1 MB | 1.8 MB | **2.4 MB** | **3.1 MB** | 14.8 MB | 38.2 MB |

Reproduce locally at any time:
```bash
sanskrit bench --save benchmarks/results/latest.json
```

---

## 🛠️ Unified CLI Reference

```bash
sanskrit new my_project      # Scaffold a new project with Sanskrit.toml
sanskrit run main.skt        # Run program via sub-millisecond Tier-0 VM
sanskrit run --release       # Run with peak AOT optimization passes
sanskrit build main.skt      # Build optimized standalone native executable
sanskrit build --emit-mlir   # Emit textual MLIR dialect representation
sanskrit check main.skt      # Perform type checking and emit rich diagnostics
sanskrit test                # Run project test suites
sanskrit bench               # Run benchmark harnesses
sanskrit repl                # Launch interactive Sanskrit Next REPL
sanskrit fmt                 # Format source files
sanskrit doctor              # Inspect GPU, MLIR, toolchain & environment health
sanskrit env --json          # Print machine-readable environment telemetry
sanskrit lsp                 # Start embedded Language Server (LSP 3.17)
```

---

## 📖 Dual-Script Keyword Mapping

| Concept | Devanagari Canonical | ASCII Alias | Description |
| :--- | :--- | :--- | :--- |
| **Function** | `कार्य` | `fn` | Function declaration |
| **Variable** | `मान` | `let` | Mutable / inferable binding |
| **Constant** | `स्थिर` | `const` | Compile-time immutable binding |
| **Structure** | `संरचना` | `struct` | Statically laid-out value composite |
| **Condition** | `यदि` / `अन्यथा` | `if` / `else` | Branching |
| **Return** | `प्रत्यागम` | `return` | Function return |
| **Tensor** | `दिश` | `Tensor` | Multi-dimensional strided array |
| **Print** | `मुद्रण` | `print` | Standard output |

For full lexical specifications, consult [docs/design/language-naming.md](docs/design/language-naming.md).

---

## 💻 Visual Studio Code Extension

Sanskrit Next features a first-class language platform extension for Visual Studio Code:

- **Visual Studio Marketplace**: [https://marketplace.visualstudio.com/items?itemName=sh20raj.sanskrit-vscode](https://marketplace.visualstudio.com/items?itemName=sh20raj.sanskrit-vscode)
- **Extension Identifier**: `sh20raj.sanskrit-vscode`
- **GitHub Release**: [`vscode-v2.0.0`](https://github.com/SH20RAJ/sanskrit/releases/tag/vscode-v2.0.0)
- **Direct VSIX Download**: [Download `sanskrit-vscode-2.0.0.vsix`](https://github.com/SH20RAJ/sanskrit/releases/download/vscode-v2.0.0/sanskrit-vscode-2.0.0.vsix)

### Instant Installation

#### From Visual Studio Marketplace
Inside VS Code or Antigravity IDE:
1. Open Extensions (`Ctrl+Shift+X` or `Cmd+Shift+X`).
2. Search for **Sanskrit Next** (`sh20raj.sanskrit-vscode`).
3. Click **Install**.

#### Or via Command Line
```bash
# Install via VS Code CLI:
code --install-extension sh20raj.sanskrit-vscode

# Or in Antigravity IDE:
agy-ide --install-extension sanskrit-vscode-2.0.0.vsix
```

### Key Extension Capabilities
- **Language Intelligence (LSP 3.17)**: Dual-script Devanagari/ASCII autocompletion, real-time compiler diagnostics, hover cards, and snippets.
- **Native Test Explorer**: Runs tests with the VS Code Test Controller UI.
- **Debugger (DAP Protocol)**: Line breakpoints, variable stepping, stack frames, and specialized tensor variable inspection.
- **Scientific Computing & Tensor Inspector**: Interactive Webview for visualizing multi-dimensional strided tensor slices with gradient heatmaps and automatic differentiation tape graphs.
- **Toolchain Telemetry**: Real-time Apple Silicon AMX/Metal, NVIDIA CUDA, and CPU SIMD detection with `sanskrit doctor`.

---

## 📜 Repository Structure

```
.
├── Cargo.toml                  # Workspace definition
├── crates/
│   ├── sanskrit-cli/           # Unified CLI binary (run, build, check, bench, doctor)
│   ├── sanskrit-diagnostics/   # Multi-span ANSI error reporting & JSON diagnostics
│   ├── sanskrit-lexer/         # Unicode-aware Devanagari & ASCII tokenizer
│   ├── sanskrit-ast/           # Strongly-typed Abstract Syntax Tree
│   ├── sanskrit-parser/        # Pratt recursive-descent parser
│   ├── sanskrit-hir/           # High-Level IR desugaring
│   ├── sanskrit-typeck/        # Static type checker & tensor dimension solver
│   ├── sanskrit-ir/            # Sanskrit Intermediate Representation (SIR)
│   ├── sanskrit-vm/            # Sub-millisecond Tier-0 Bytecode VM
│   ├── sanskrit-tensor/        # Zero-copy strided multi-dimensional arrays & GEMM
│   ├── sanskrit-autodiff/      # Forward & reverse automatic differentiation
│   ├── sanskrit-mlir/          # MLIR dialect emission & lowering adapter
│   ├── sanskrit-package/       # Native package manager & Sanskrit.toml
│   └── sanskrit-lsp/           # Language Server Protocol 3.17 daemon
├── editors/
│   └── vscode/                 # Official Sanskrit Next VS Code Extension Platform
├── docs/                       # Specifications, RFCs, design docs, migration
├── std/                        # Standard library (core, math, tensor, linalg, autodiff, io)
├── examples/                   # Canonical examples across systems, ML, and math
├── benchmarks/                 # Telemetry, microbenchmarks, and competitor reports
└── .agents/skills/             # 22 Antigravity engineering skills
```

---

## 🤝 Community & Contributing

We welcome contributions from compiler engineers, linguists, systems programmers, and documentation authors alike!

- 📖 **[Contributing Guide](CONTRIBUTING.md)**: Architecture map, local environment setup, and coding standards.
- 🎯 **[Good First Issues](docs/contributing/good-first-issues.md)**: Curated starter tasks for new contributors.
- 📜 **[Code of Conduct](CODE_OF_CONDUCT.md)**: Contributor Covenant v2.1 standards.
- 🗺️ **[Roadmap](ROADMAP.md)**: Multi-phase engineering roadmap and milestones.
- 🛡️ **[Security Policy](SECURITY.md)**: Vulnerability disclosure and bug bounty guidelines.
- 💬 **[GitHub Discussions](https://github.com/SH20RAJ/sanskrit/discussions)**: Community Q&A, design ideas, and show-and-tell.
- 📄 **[Academic Citation](CITATION.cff)**: How to cite Sanskrit Next in research papers.

---

## 📄 License

Licensed under the [MIT License](LICENSE).

