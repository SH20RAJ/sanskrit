---
name: scientific-vscode
description: Guides the design and implementation of scientific computing, tensor inspection, autodiff visualization, and hardware accelerator UI in the Sanskrit Next VS Code extension.
---

# Sanskrit Next Scientific Computing & Tensor UI in VS Code Skill

## Purpose
Governs the design, implementation, and performance characteristics of scientific computing developer tooling within the Sanskrit Next VS Code extension, including tensor visualizers, automatic differentiation graphs, memory layout inspectors, and GPU accelerator awareness.

## When to Use
- Implementing or modifying the Tensor Inspector webview (`src/views/tensorInspector.ts`).
- Visualizing multi-dimensional strided tensor slices, shapes, dtypes, and memory layouts.
- Implementing automatic differentiation (Wengert tape) inspection.
- Surfacing GPU device status, VRAM allocation, and kernel execution metrics from `sanskrit doctor` and `sanskrit env`.

## Architectural Principles

### 1. Data Contract with Compiler Runtime
- The extension UI never simulates or calculates tensor operations in TypeScript.
- All tensor metadata (shape, strides, dtype, contiguous flag, memory buffer offset, sample elements) comes from the runtime/debugger DAP via structured JSON or runtime inspect commands.
- For large tensors (e.g. 1024x1024), only retrieve downsampled slices or windowed regions (e.g. first/last 10 elements, heatmaps) to keep VS Code UI responsive.

### 2. Tensor Inspector UX
- **Shape & Stride Badge**: Clear chips showing `Shape: [32, 128]`, `Strides: [128, 1]`, `Dtype: f32`, `Layout: Contiguous (Row-Major)`.
- **Interactive Heatmap / Grid View**: Responsive 2D slice viewer with value-based gradient coloring (cool-to-warm or monochrome contrast).
- **Dimension Slicer**: Sliders for viewing slices along higher-order dimensions (e.g., batch index $N$ or channel $C$ for 4D tensors `[N, C, H, W]`).

### 3. Autodiff Tape & Computational Graph
- Nodes represent primal values, operations, and adjoint gradient buffers.
- Support step-by-step backward pass inspection showing reverse-mode gradient flow.

### 4. Hardware Accelerator & GPU Awareness
- Read accelerator information from `sanskrit doctor` or runtime DAP inspection:
  - Device backend: CPU (AVX2/AVX-512/NEON), Metal (macOS), CUDA (NVIDIA), ROCm (AMD), Vulkan.
  - Active device memory allocation and memory footprint.
  - Highlight device transfers (host-to-device, device-to-host).

## Mandatory Checks
- Validate that tensor visualization handles edge cases: scalars, 0-dim tensors, 1D vectors, higher-order ($N > 4$) tensors, and non-contiguous strided views.
- Ensure strict memory limits: truncate displayed elements to a max window (e.g. 1,000 cells) to prevent webview crashes.
