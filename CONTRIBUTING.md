# Contributing to Sanskrit Next

Welcome to the **Sanskrit Next** open-source project! We are delighted that you are interested in contributing.

Sanskrit Next is an open-source, research-grade systems programming language combining mathematical rigor, first-class strided tensors, tiered compilation (Tier-0 Bytecode VM + MLIR dialect lowering), and authentic dual-script syntax invariance (Devanagari & ASCII).

Whether you are fixing a compiler diagnostic, writing a new standard library module, optimizing tensor kernel loops, improving documentation, or adding features to the VS Code extension, your contributions are warmly welcomed.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Ways to Contribute](#ways-to-contribute)
3. [Repository Architecture & Crate Map](#repository-architecture--crate-map)
4. [Setting Up Your Local Development Environment](#setting-up-your-local-development-environment)
5. [Development Workflow & Testing](#development-workflow--testing)
6. [Coding Guidelines & Engineering Principles](#coding-guidelines--engineering-principles)
7. [The RFC Process](#the-rfc-process)
8. [Commit Conventions & Pull Requests](#commit-conventions--pull-requests)
9. [Community & Getting Help](#community--getting-help)

---

## Code of Conduct

All contributors and community members are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before participating in discussions or submitting pull requests.

---

## Ways to Contribute

You don't have to be a compiler engineer to contribute! Here are many high-impact ways to get involved:

- **Good First Issues**: Check out our curated list of [Good First Issues](docs/contributing/good-first-issues.md) or look for the [`good first issue`](https://github.com/SH20RAJ/sanskrit/labels/good%20first%20issue) label on GitHub.
- **Documentation & Tutorials**: Improve language guides, add Devanagari grammar explanations, or create step-by-step AI/ML tutorials.
- **Examples**: Contribute real-world Sanskrit programs to the [`examples/`](examples/) directory (e.g. numerical algorithms, neural networks, games).
- **Standard Library Modules**: Expand modules in [`std/`](std/) for linear algebra, statistics, file I/O, networking, and string manipulation.
- **Compiler Passes & Optimizations**: Implement loop transformations, MLIR dialect lowerings, or constant folding optimizations.
- **VS Code Extension**: Enhance the language intelligence, tensor inspector webview, or debug adapter in [`editors/vscode/`](editors/vscode/).
- **Bug Reports & Diagnostics**: Report unexpected compiler crashes or suggest clearer error spans and actionable suggestions.

---

## Repository Architecture & Crate Map

Sanskrit Next is architected as a modular Rust Cargo workspace in [`crates/`](crates/):

| Crate | Responsibility |
| :--- | :--- |
| [`sanskrit-diagnostics`](crates/sanskrit-diagnostics/) | Rich multi-span compiler errors, Devanagari Unicode alignment, JSON output |
| [`sanskrit-lexer`](crates/sanskrit-lexer/) | Unicode scalar stream, dual-script tokenization (Devanagari & ASCII) |
| [`sanskrit-ast`](crates/sanskrit-ast/) | Concrete Syntax Tree definitions and node abstractions |
| [`sanskrit-parser`](crates/sanskrit-parser/) | Pratt precedence expression parser and recursive-descent grammar |
| [`sanskrit-hir`](crates/sanskrit-hir/) | High-level Intermediate Representation desugaring scripts into functions |
| [`sanskrit-typeck`](crates/sanskrit-typeck/) | Bidirectional type inference, tensor rank/dimension validation |
| [`sanskrit-ir`](crates/sanskrit-ir/) | Sanskrit Intermediate Representation (SIR) control-flow graph |
| [`sanskrit-vm`](crates/sanskrit-vm/) | High-performance Tier-0 Bytecode VM (<1ms startup, zero JIT warm-up) |
| [`sanskrit-tensor`](crates/sanskrit-tensor/) | Strided $N$-dimensional tensors, SIMD vectorization, contiguous layouts |
| [`sanskrit-autodiff`](crates/sanskrit-autodiff/) | Dual-number forward mode and reverse-mode tape automatic differentiation |
| [`sanskrit-mlir`](crates/sanskrit-mlir/) | `skt` MLIR dialect definitions and lowering passes |
| [`sanskrit-package`](crates/sanskrit-package/) | Package manager, `sanskrit.toml` manifest, dependency resolution |
| [`sanskrit-lsp`](crates/sanskrit-lsp/) | Embedded Language Server Protocol (LSP 3.17) daemon over JSON-RPC stdio |
| [`sanskrit-cli`](crates/sanskrit-cli/) | Unified native developer CLI (`sanskrit run`, `build`, `check`, `bench`, `doctor`) |
| [`editors/vscode/`](editors/vscode/) | Official VS Code Extension Platform (LSP, DAP, Test Controller, Tensor Inspector) |

---

## Setting Up Your Local Development Environment

### Prerequisites
- **Rust Toolchain**: Rust 1.75 or newer (`rustup default stable`)
- **Git**: Modern git client
- **Node.js & npm** *(Only needed if working on the VS Code extension)*: Node.js 18+ and npm 9+

### 1. Clone the Repository
```bash
git clone https://github.com/SH20RAJ/sanskrit.git
cd sanskrit
```

### 2. Build the Workspace
```bash
cargo build
```

### 3. Run the Test Suite
Verify that all 14 workspace crates build and pass tests cleanly:
```bash
cargo test --workspace
```

### 4. Test Run a Sample File
```bash
cargo run --bin sanskrit -- run examples/matrix_multiply.skt
```

### 5. Inspect the Toolchain with Doctor
```bash
cargo run --bin sanskrit -- doctor
```

---

## Development Workflow & Testing

### Running Tests
Always run the full workspace test suite before opening a PR:
```bash
cargo test --workspace
```

To run tests for a specific crate:
```bash
cargo test -p sanskrit-lexer
cargo test -p sanskrit-parser
cargo test -p sanskrit-tensor
```

### Running Benchmarks
When touching compiler passes, VM dispatch loops, or tensor kernels, measure performance:
```bash
cargo run --release --bin sanskrit -- bench
```

### Formatting & Linting
Ensure your code matches the workspace formatting and lint standards:
```bash
# Check formatting
cargo fmt --all -- --check

# Run Clippy linter
cargo clippy --workspace --all-targets -- -D warnings
```

---

## Coding Guidelines & Engineering Principles

1. **No Runtime Node.js in the Compiler**: The Sanskrit Next compiler, VM, CLI, and package manager are 100% native Rust. Never introduce runtime Node.js or JavaScript dependencies into `crates/`. (The VS Code extension in `editors/` is an orchestration UI and may use TypeScript).
2. **Dual-Script Invariance**: Any new language keyword or standard library function must support both Devanagari and ASCII identifiers with identical semantics.
3. **Safe Rust by Default**: Safe Rust is mandatory. Any `unsafe` block requires an explicit `// SAFETY:` rationale documenting its invariants and test coverage.
4. **Structured CLI Outputs**: Any new CLI diagnostic or introspection command should support `--json` for machine consumption by tooling, LSP, and extensions.
5. **Never Fabricate Telemetry**: Compiler outputs, benchmark numbers, and GPU statuses must reflect real hardware execution, never mock data.

---

## The RFC Process

For any substantial change to:
- Syntax, keywords, or grammar
- Type system semantics or tensor abstractions
- Compiler pipeline architecture or IR representation
- Package manager manifest specifications

Please open an RFC (Request for Comments) under [`docs/rfc/`](docs/rfc/) following the existing template (`docs/rfc/0001-tiered-compilation.md`). RFCs ensure the community has an opportunity to review and refine architectural decisions before code is merged.

---

## Commit Conventions & Pull Requests

### Commit Message Guidelines
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` A new language feature, compiler capability, or CLI command
- `fix:` A bug fix in parser, typechecker, VM, or tooling
- `docs:` Documentation improvements or additions
- `perf:` Performance optimizations in compiler passes or tensor kernels
- `refactor:` Code refactoring without behavioral changes
- `test:` Adding or improving unit/integration tests
- `chore:` Maintenance tasks, dependency updates, or CI workflow changes

**Example:**
```
feat(lexer): support Devanagari fractional numerals
fix(typeck): enforce rank compatibility on tensor matrix multiplication
docs(contributing): add architecture tour and starter issues
```

### Pull Request Process
1. Fork the repository and create a feature branch from `main`:
   ```bash
   git checkout -b feat/my-new-feature
   ```
2. Make your changes in focused, well-documented commits.
3. Verify that `cargo test --workspace` and `cargo clippy --workspace` pass without warnings.
4. Push your branch to your fork and submit a Pull Request to `main`.
5. Fill out the [Pull Request Template](.github/pull_request_template.md).
6. Address review feedback constructively.

---

## Community & Getting Help

- **GitHub Discussions**: Ask questions, share ideas, and showcase projects on [GitHub Discussions](https://github.com/SH20RAJ/sanskrit/discussions).
- **Issue Tracker**: Report bugs or propose features via [GitHub Issues](https://github.com/SH20RAJ/sanskrit/issues).
- **Maintainer**: Connect with project maintainer Shaswat Raj ([@SH20RAJ](https://github.com/SH20RAJ)).

Thank you for helping make Sanskrit Next the premier AI/ML and systems language! 🚀
