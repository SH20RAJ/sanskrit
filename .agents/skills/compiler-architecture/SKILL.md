---
name: compiler-architecture
description: Guides modifications to the multi-pass compiler pipeline, AST, HIR, SIR, and backend code generators.
---

# Sanskrit Next Compiler Architecture Skill

## Purpose
Governs the internal pipeline from source text down to machine code and bytecode, preserving the decoupling between frontend AST, intermediate SIR, and backend codegen.

## When to Use
- Adding new passes between AST, HIR, and SIR.
- Changing instruction definitions or SSA invariants in `crates/sanskrit-ir`.
- Extending the Tier-0 Bytecode VM or JIT tiers.

## Decision Tree
1. Does the change belong in high-level AST or semantic SIR?
   - AST: Only syntax representation and source span mapping.
   - SIR: Explicit types, memory allocations, control flow graphs, and tensor shapes.
2. Does the pass introduce unsafe code?
   - If YES: Document safety invariant and verify why safe Rust cannot express it.

## Mandatory Checks
- Validate that all SIR instructions maintain SSA properties.
- Ensure Tier-0 VM retains sub-millisecond execution.

## Forbidden Shortcuts
- Never compile AST directly to LLVM IR, bypassing SIR.
- Never introduce mutable global state in the compiler driver.

## Validation Commands
```bash
cargo test -p sanskrit-ir
cargo test -p sanskrit-vm
```
