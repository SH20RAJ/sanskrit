---
name: ai-ml
description: Guides machine learning compiler operations, neural network primitives, automatic differentiation, and model format import/export.
---

# Sanskrit Next AI/ML Skill

## Purpose
Directs the architecture and implementation of native deep learning primitives, compiler-level automatic differentiation (Enzyme model), and model serialization (ONNX, StableHLO, safetensors).

## When to Use
- Implementing neural network layers or loss functions in `std/ml` or `std/nn`.
- Working on automatic differentiation (`crates/sanskrit-autodiff`).
- Adding model format parsers (safetensors, ONNX).

## Decision Tree
1. Is the automatic differentiation pass accumulating unnecessary runtime tape nodes?
   - If YES: Utilize forward-mode dual numbers or compiler adjoint synthesis to avoid runtime allocations.
2. Can intermediate tensor buffers be reused (in-place bufferization)?
   - If YES: Annotate buffers for memory reuse to reduce peak VRAM footprint.

## Mandatory Checks
- Validate gradient calculations using finite-difference numerical checks.
- Test compatibility with standard PyTorch weights via safetensors.

## Validation Commands
```bash
cargo test -p sanskrit-autodiff
```
