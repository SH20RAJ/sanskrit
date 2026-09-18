# RFC 0003: Type System and Inference Specification

- **Status**: Accepted
- **Author**: Sanskrit Language Architecture Team
- **Created**: 2026-09-18
- **Category**: Type System

---

## 1. Problem
Dynamic languages like Python lead to runtime type errors in scientific computing (e.g. silent dimension broadcast errors or float precision truncation). Overly verbose static languages force repetitive type annotations that hinder exploratory computing.

## 2. Goals
- Hybrid static design: Strong static typing by default with local bidirectional type inference.
- First-class numerical types (`I8`..`I128`, `U8`..`U128`, `F16`, `BF16`, `F32`, `F64`, `Complex32`..`128`).
- First-class N-dimensional `Tensor[T, Shape, Layout, Device]` types.
- Algebraic data types (`Option[T]`, `Result[T, E]`, custom `enum`).

## 3. Decision
A bidirectional Hindley-Milner inspired type checker with local constraint resolution:
```sanskrit
// Inferred: x is I64
मान x = 42

// Inferred: v is Vector[F32, 3]
मान v = [1.0_f32, 2.0_f32, 3.0_f32]

// Inferred: M is Tensor[F32, [1024, 1024]]
मान M = tensor.ones([1024, 1024], dtype=F32)
```

## 4. Tensor Type System
Tensors carry shape, element type, layout, and device placement information:
```sanskrit
// Statically known shape and device
मान K: Tensor[F32, [64, 128], Layout=RowMajor, Device=GPU]
```

## 5. Algebraic Sum Types
```sanskrit
गणना परिणाम[T, E]:
    सफल(T)    // Ok(T)
    विफल(E)   // Err(E)
```

## 6. Safety & Precision Guarantees
- No implicit narrowing float conversions (e.g., `F64` will not implicitly coerce to `F32`).
- Explicit integer promotion via `.to[I64]()` or `cast[I64](val)`.
