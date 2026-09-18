---
name: optimization
description: Guides compiler optimization passes, inlining heuristics, loop tiling, vectorization, and JIT specialization.
---

# Sanskrit Next Optimization Skill

## Purpose
Ensures compiler transformations generate provably faster machine code and bytecode without altering program semantics or introducing undefined behavior.

## When to Use
- Writing or tuning compiler optimization passes (DCE, constant folding, inlining).
- Configuring MLIR loop tiling, fusion, and vectorization heuristics.
- Adding autotuning strategies (`sanskrit tune`).

## Decision Tree
1. Does the optimization pass preserve exact program semantics and floating-point guarantees?
   - If NO: Reject or place behind explicit flags (e.g. `--fast-math`).
2. Does the pass improve measurable benchmark throughput?
   - If NO: Measure compile-time overhead vs runtime gain before enabling by default.

## Mandatory Checks
- Benchmark before and after using `sanskrit bench`.
- Ensure optimization tiers remain clearly defined (Tier-0, Tier-1, Tier-2, Tier-3).

## Validation Commands
```bash
cargo test --workspace
cargo run --bin sanskrit -- bench
```
