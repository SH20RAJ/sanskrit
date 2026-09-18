# RFC 0005: Traits, Generics, and Static Multiple Dispatch

- **Status**: Accepted
- **Author**: Sanskrit Language Architecture Team
- **Created**: 2026-09-18
- **Category**: Abstraction & Generics

---

## 1. Problem
Scientific computing requires defining operations across combinations of argument types (e.g. Matrix * Vector, Float * Matrix, Matrix * Matrix). Dynamic multiple dispatch (Julia) provides great syntax but can suffer from runtime type instabilities and compilation latency.

## 2. Decision
Sanskrit Next provides **Compile-Time Trait-Bounded Generics with Static Specialization**:
- Zero-cost abstractions via static dispatch (monomorphization).
- Specialized function signatures resolved at compile time based on parameter tuples.

```sanskrit
लक्षण गणनीय[T]:
    कार्य योग(self, other: T) -> T
    कार्य अन्तर(self, other: T) -> T

// Specialization for mixed types
कार्य गुणन(a: आव्यूह[F32], b: सदिश[F32]) -> सदिश[F32]:
    // Highly optimized BLAS GEMV lowering
    प्रत्यागम gemv(a, b)

कार्य गुणन(a: आव्यूह[F32], b: आव्यूह[F32]) -> आव्यूह[F32]:
    // Highly optimized BLAS GEMM lowering
    प्रत्यागम gemm(a, b)
```
Dynamic dispatch is available only when explicitly requested via `गतिशील` / `dyn` trait objects.
