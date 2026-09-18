---
name: scientific-computing
description: Guides development of linear algebra, tensor abstractions, strided views, and numerical algorithms.
---

# Sanskrit Next Scientific Computing Skill

## Purpose
Governs the development of mathematically rigorous, cache-efficient, and SIMD-friendly scientific computing abstractions in `crates/sanskrit-tensor` and `std/linalg`.

## When to Use
- Implementing multi-dimensional tensor indexing, slicing, and broadcasting.
- Writing BLAS-like routines (GEMM, GEMV, dot product, reductions).
- Adding complex number, rational, or sparse tensor support.

## Decision Tree
1. Does the tensor slicing operation allocate new heap memory?
   - If YES: Re-implement as a zero-copy strided view (`दृष्टि` / `view`).
2. Are broadcasting rules strictly compliant with standard multi-dimensional semantics?
   - If NO: Align with standard trailing-dimension broadcasting rules.

## Mandatory Checks
- Validate mathematical correctness against known analytical solutions.
- Ensure contiguous fast-paths exist for row-major and column-major layouts.

## Validation Commands
```bash
cargo test -p sanskrit-tensor
```
