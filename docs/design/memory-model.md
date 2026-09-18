# Sanskrit Next Memory Model & Value Semantics

This document defines the formal memory model, layout guarantees, and pointer semantics of **Sanskrit Next**.

---

## 1. Storage Classes and Object Layout

Sanskrit Next distinguishes between three primary storage classes:

1. **Stack & Registers (Value Semantics)**:
   - Scalar numbers (`I8`..`I128`, `F16`..`F64`).
   - Fixed-size vectors and arrays (`[T; N]`).
   - Composite structs (`संरचना` / `struct`).
   - Layout is strictly sequential C-compatible (`#[repr(C)]` equivalent) without heap indirection.

2. **Deterministic Heap (RAII & Moves)**:
   - Dynamic strings (`सूत्र` / `String`).
   - Dynamically resized arrays (`Array[T]`).
   - Dynamically shaped tensors (`Tensor[T]`).
   - Handled via unique ownership. Deallocation occurs at the end of the lexical scope unless explicitly moved via `त्याग` / `move`.

3. **Scoped Arena Regions (`क्षेत्र` / `region`)**:
   - Monotonically increasing pointer bump-allocator.
   - Ideal for multi-step tensor workloads, AST construction, and graph traversal.
   - Deallocated in a single $O(1)$ pointer reset when exiting the region block.

---

## 2. Borrowing and Aliasing Rules

- **Shared Borrow (`पठन` / `read`)**: Multiple readers may access a memory location concurrently. No writer is permitted while an active shared borrow exists.
- **Exclusive Borrow (`परिवर्तन` / `mut`)**: Exactly one writer is permitted to modify a memory location. No other reader or writer may observe the location during modification.
- **No Dangling Pointers**: References cannot outlive their owner or parent region.
