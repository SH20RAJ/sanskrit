# Sanskrit Next Toolchain & CLI Specification

This document details the unified developer tooling architecture for **Sanskrit Next**.

---

## 1. Unified `sanskrit` CLI

All developer workflows are unified into a single native binary:
- `sanskrit new <project>`: Scaffolds a new project with `Sanskrit.toml`, source files, tests, and benchmarks.
- `sanskrit run <file>`: Runs a program (defaults to Tier-0 VM for sub-millisecond execution, `--release` for AOT native).
- `sanskrit build <file>`: Compiles to an optimized standalone native executable.
- `sanskrit check <file>`: Fast semantic analysis and typechecking without code generation.
- `sanskrit test`: Executes workspace unit, integration, and diagnostic tests.
- `sanskrit bench`: Executes micro and macro benchmark suites and records metrics to `benchmarks/results/`.
- `sanskrit fmt`: High-speed AST-preserving code formatter (supports `--script devanagari|ascii`).
- `sanskrit doctor`: Diagnoses system state, compiler toolchains, GPU device availability, and environment health.
- `sanskrit env [--json]`: Prints machine-readable environment metadata for bug reports and CI.
- `sanskrit lsp`: Starts the embedded Language Server Protocol (LSP 3.17) daemon.
