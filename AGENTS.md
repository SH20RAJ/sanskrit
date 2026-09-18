# Sanskrit Next Engineering Guidelines for AI Agents

These rules govern all automated development, refactoring, and code generation across the **Sanskrit Next** repository:

1. **No Runtime Node.js Dependencies**: Never reintroduce Node.js, npm, or JavaScript runtime dependencies into Sanskrit Next. The compiler, VM, package manager, and CLI are 100% native Rust.
2. **Never Edit Generated Files Manually**: Generated parsers, lockfiles (`Sanskrit.lock`, `Cargo.lock`), benchmark results (`benchmarks/results/*.json`), or generated docs must be produced by toolchains, not edited by hand.
3. **Always Run Relevant Tests**: Verify all changes with `cargo test --workspace` and relevant crate-specific suites before declaring completion.
4. **Always Benchmark Performance-Impacting Changes**: When modifying compiler passes, the VM, or tensor layouts, run `sanskrit bench` and document results.
5. **Never Advertise Unsupported Features**: Documentation and compiler diagnostics must strictly reflect implemented and verified capabilities.
6. **Preserve Legacy Isolation**: Legacy prototype code is permanently archived on the `legacy/v0.3` branch and GitHub release `v0.3.0-legacy`. Never mix legacy Node code into the Rust workspace.
7. **Document Architecture-Changing Decisions**: All grammar, semantic, or IR modifications require an approved RFC under `docs/rfc/`.
8. **Preserve Reproducible Builds**: Ensure compiler outputs and distribution archives are deterministic given the same inputs.
9. **Zero Unjustified Unsafe Code**: Safe Rust is mandatory by default. Any `unsafe` block must document its exact safety invariants, rationale, and test coverage.
10. **Consult Focused Antigravity Skills**: Use specific skills in `.agents/skills/` for detailed workflows (e.g. `mlir-development`, `scientific-computing`, `language-diagnostics`).
