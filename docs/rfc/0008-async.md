# RFC 0008: Concurrency, Parallel Loops, and Async Architecture

- **Status**: Accepted
- **Author**: Sanskrit Language Architecture Team
- **Created**: 2026-09-18
- **Category**: Concurrency & Parallelism

---

## 1. Problem
Scientific workloads demand data-parallel execution across multicore CPU threads and SIMD units, while server and IO workloads require lightweight, non-blocking asynchronous event loops. Mixing these paradigms without compiler support often leads to thread contention, race conditions, and poor cache utilization.

## 2. Decision
Sanskrit Next provides a unified concurrency model:
1. **Data-Parallel Loops (`समान्तर चक्र` / `parallel for`)**:
   Automatically partitioned across thread pools with compile-time verification that loop iterations write to disjoint memory regions.
```sanskrit
समान्तर चक्र i में 0..1000000:
    results[i] = compute_kernel(inputs[i])
```
2. **Asynchronous Tasks (`असमकाल` / `async` and `प्रतीक्षा` / `await`)**:
   Stackless state machine transformations for non-blocking I/O and pipeline overlapping (e.g. overlapping CPU data preprocessing with GPU tensor kernel execution).
3. **Structured Channels (`प्रवाह` / `channel`)**:
   Type-safe message passing between concurrent tasks with ownership transfer.
