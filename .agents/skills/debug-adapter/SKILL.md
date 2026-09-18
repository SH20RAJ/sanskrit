---
name: debug-adapter
description: Guides the Debug Adapter Protocol (DAP) implementation, breakpoint management, stack inspection, and tensor debugging in Sanskrit Next.
---

# Sanskrit Debug Adapter Skill

## Purpose
Governs the integration of debugging workflows via the Debug Adapter Protocol (DAP), providing launch, attach, breakpoints, stepping, call stack inspection, and specialized tensor/scientific variable presentation.

## When to Use
- Implementing or modifying debug configurations (`launch.json`) for `type: "sanskrit"`.
- Extending the Debug Adapter in `editors/vscode/src/debug/`.
- Adding inspection capabilities for tensors, structs, or scoped memory regions.

## Architecture
- **Protocol**: Standard DAP implementation connecting VS Code's debug UI to the native execution process or VM.
- **Variable Scopes**: `Locals`, `Globals`, `Tensors`, and `Memory Regions`.
- **Tensor Presentation**: Tensors display shape, element type, device placement, and summary statistics (`min`, `max`, `mean`) without dumping entire multi-gigabyte buffers.

## Mandatory Checks
- Verify source-to-instruction mapping preserves accurate line and column breakpoints.
- Ensure breakpoint hits do not freeze the editor host.

## Forbidden Shortcuts
- Never dump raw binary tensor buffers directly into debug variable trees.
- Never block DAP responses indefinitely during long-running JIT compilation.

## Validation Commands
```bash
cargo run --bin sanskrit -- run examples/basics/control_flow.skt
```
