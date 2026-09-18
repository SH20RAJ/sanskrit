# Sanskrit Next Performance & Benchmarking Model

This document establishes the performance targets, methodology, and verification criteria for **Sanskrit Next**.

---

## 1. Principles of Scientific Benchmarking

Sanskrit Next rejects marketing folklore and ungrounded "fastest language" claims. Every performance statement must provide:
- **Workload**: Deterministic algorithmic description (e.g. GEMM $1024 \times 1024$, Fibonacci(40), Tree Allocation).
- **Environment**: Architecture (Apple Silicon M-series, x86-64 Intel/AMD), core count, OS, compiler version.
- **Warmup & Measurement**: Explicit exclusion of cold-start dynamic link time unless measuring startup latency.
- **Reproducible Artifact**: Single-command execution via `sanskrit bench` emitting structured JSON to `benchmarks/results/`.

---

## 2. Performance Targets

| Category | Workload | Benchmark Target vs Competitors |
| :--- | :--- | :--- |
| **Startup Latency** | Script initialization (`sanskrit run hello.skt`) | $\le 2.0\text{ ms}$ (competitive with LuaJIT / Zig, 10x faster than Python). |
| **Scalar Compute** | Recursive compute (Fibonacci, Mandelbrot) | Within $1.1\times$ of optimized C (-O3) under Tier-3 AOT. |
| **SIMD Vectorization** | Vector Addition ($N=10^7$) | $1.0\times$ theoretical memory bandwidth saturation via MLIR vector lowering. |
| **Matrix Multiply** | GEMM ($1024 \times 1024$ F32) | Within $5\%$ of OpenBLAS / Apple Accelerate. |
| **Memory Footprint** | Static struct allocations ($N=10^6$) | Zero heap overhead; matching C `sizeof(struct) * N`. |
