# RFC 0006: First-Class Tensors and Strided Multi-Dimensional Arrays

- **Status**: Accepted
- **Author**: Sanskrit Language Architecture Team
- **Created**: 2026-09-18
- **Category**: Numerical Computing

---

## 1. Problem
Traditional languages treat multi-dimensional tensors as external C/C++ library buffers. This disconnect prevents the compiler from verifying tensor dimensions at compile-time, fusing elementwise loops, and generating direct SIMD instructions.

## 2. Decision
In Sanskrit Next, `दिश` / `Tensor` is a core language primitive:
- **Zero-Copy Views**: Slicing (`t[0:10, ::2]`) creates a strided view without data replication.
- **Broadcasting Semantics**: Automatic NumPy/PyTorch-compliant broadcasting rules evaluated at compile time when shapes are known.
- **Strides and Layout**: Statically and dynamically supports `RowMajor` (C-order) and `ColMajor` (Fortran-order).
- **Matrix Multiplication Operator**: `@` lowered directly to optimized hardware BLAS or MLIR `linalg.matmul`.

```sanskrit
मान X = tensor.randn([32, 784], dtype=F32)
मान W = tensor.randn([784, 128], dtype=F32)
मान b = tensor.zeros([128], dtype=F32)

// Fused affine transformation: Y = X @ W + b
मान Y = (X @ W) + b
```
