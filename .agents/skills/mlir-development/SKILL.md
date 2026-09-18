---
name: mlir-development
description: Guides the design, lowering, and stability isolation of Sanskrit MLIR dialects and conversions.
---

# Sanskrit Next MLIR Development Skill

## Purpose
Maintains the integrity and stability of the MLIR lowering pipeline, isolating unstable MLIR C-APIs behind `crates/sanskrit-mlir` while leveraging Linalg, Tensor, and Vector dialects.

## When to Use
- Adding or modifying Sanskrit MLIR dialect definitions (`sanskrit.*`).
- Lowering SIR tensor and linalg operations to MLIR standard dialects.
- Integrating with StableHLO or IREE backends.

## Decision Tree
1. Can the operation be expressed using standard MLIR dialects (`linalg`, `tensor`, `vector`)?
   - If YES: Lower directly to standard dialects; do NOT invent redundant custom operations.
   - If NO: Define in `sanskrit.*` dialect and provide lowering passes.
2. Are unstable C-API calls leaking into frontend crates?
   - If YES: Confine all FFI interactions strictly inside `crates/sanskrit-mlir`.

## Mandatory Checks
- Validate progressive lowering order: `sanskrit` -> `linalg` -> `bufferization` -> `llvm`.
- Verify round-tripping of MLIR text representation.

## Forbidden Shortcuts
- Never expose raw MLIR pointers outside `crates/sanskrit-mlir`.

## Validation Commands
```bash
cargo test -p sanskrit-mlir
```
