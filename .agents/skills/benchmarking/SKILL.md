---
name: benchmarking
description: Guides performance benchmarking, competitor comparisons, telemetry capture, and regression detection.
---

# Sanskrit Next Benchmarking Skill

## Purpose
Ensures performance claims are grounded in reproducible, scientific benchmarks against industry competitors (C, C++, Rust, Python, Julia, NumPy) with machine-readable telemetry.

## When to Use
- Adding microbenchmarks (function calls, loops, recursion, struct layout).
- Adding scientific macrobenchmarks (GEMM, vector addition, reductions).
- Recording benchmark results to `benchmarks/results/`.

## Decision Tree
1. Does the benchmark isolate algorithmic throughput from JIT/startup cold-starts?
   - If NO: Include dedicated warmup iterations and report startup separately.
2. Is the competitor baseline compiled with fair optimization flags (e.g. gcc -O3, clang -O3)?
   - If NO: Adjust competitor flags to represent industry production standards.

## Mandatory Checks
- Validate that benchmark harnesses output structured JSON records.
- Check that compiler versions and host hardware specs are captured in output metadata.

## Validation Commands
```bash
cargo run --bin sanskrit -- bench
```
