# Sanskrit Next Machine Learning & Accelerator Architecture

This document defines the hardware compilation strategy, MLIR lowering, and accelerator execution model for **Sanskrit Next**.

---

## 1. Heterogeneous Accelerator Strategy

Sanskrit Next treats CPUs, GPUs (NVIDIA CUDA, AMD ROCm, Apple Metal), and NPUs as first-class targets through structured MLIR lowering:

```
                      Sanskrit IR (SIR)
                             │
                             ▼
                   sanskrit.tensor / linalg
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
      MLIR Linalg / Vector            StableHLO Dialect
            │                                 │
            ▼                                 ▼
    Affine Bufferization              IREE Compiler
            │                         (Vulkan / Metal / ROCm / CUDA)
            ▼                                 │
     LLVM / NVVM / ROCDL                      ▼
            │                         Deployable VM FlatBuffer / ELF
            ▼
   Native Object File / JIT
```

---

## 2. Python & DLPack Interoperability

Zero-copy memory exchange with NumPy, PyTorch, and JAX is enabled via standard **DLPack** (`DLManagedTensor`):
- Pointers to contiguous tensor buffers are passed across the C ABI without copying.
- Device synchronization primitives ensure host and device stream synchronization.
