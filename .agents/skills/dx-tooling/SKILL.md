---
name: dx-tooling
description: Guides development of the Sanskrit CLI, package manager, LSP server, formatter, doctor, and env inspection tools.
---

# Sanskrit Next DX & Tooling Skill

## Purpose
Governs the development and ergonomics of developer-facing tools: `sanskrit` CLI, package manager, Language Server Protocol (`sanskrit-lsp`), and code formatter (`sanskrit-fmt`).

## When to Use
- Adding or modifying CLI subcommands (`new`, `run`, `build`, `check`, `doctor`, `env`, `lsp`).
- Updating manifest (`Sanskrit.toml`) or lockfile (`Sanskrit.lock`) schema.
- Implementing LSP capabilities (completion, hover, go-to-definition, formatting).

## Decision Tree
1. Does the command run with sub-millisecond startup for quick checks?
   - If NO: Audit dependencies and defer heavy subsystem initialization.
2. Does `sanskrit doctor` detect missing optional toolchains (LLVM, CUDA) without crashing?
   - If NO: Provide graceful degradation warnings with installation remedies.

## Mandatory Checks
- Verify `sanskrit env --json` emits valid JSON.
- Ensure `sanskrit new` generates a clean, compilable project skeleton.

## Validation Commands
```bash
cargo run --bin sanskrit -- doctor
cargo run --bin sanskrit -- env --json
```
