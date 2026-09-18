# RFC 0007: Compiler-Integrated Automatic Differentiation

- **Status**: Accepted
- **Author**: Sanskrit Language Architecture Team
- **Created**: 2026-09-18
- **Category**: AI/ML & Scientific Computing

---

## 1. Problem
Runtime tape-based autograd engines (e.g. PyTorch) allocate dynamic graph nodes on the heap during the forward pass, causing significant memory fragmentation and interpreter overhead.

## 2. Decision
Sanskrit Next integrates **Compiler-Level Automatic Differentiation** inspired by Enzyme:
- **Forward-Mode AD**: Synthesizes dual-number derivative evaluation for single-input / multi-output functions.
- **Reverse-Mode AD (`वकलनीय` / `grad`)**: Synthesizes an optimized adjoint backward function directly from the SIR control flow graph before low-level optimization.

```sanskrit
कार्य हानि(w: F32, x: F32, y: F32) -> F32:
    मान y_pred = w * x
    मान diff = y_pred - y
    प्रत्यागम diff * diff

// Compiler synthesizes gradient function d(loss)/dw at compile time
मान d_loss = grad(हानि, wrt=0)
मान gradient = d_loss(2.0, 3.0, 7.0)
```
The compiler eliminates intermediate adjoint storage whenever expressions can be mathematically simplified or fused into registers.
