# Sanskrit Next for Visual Studio Code

<p align="center">
  <img src="media/icon.png" width="128" height="128" alt="Sanskrit Next Logo" />
</p>

<h3 align="center">The Official Language Platform for Sanskrit Next</h3>

<p align="center">
  Safe • Fast • AI/ML-Native • First-Class Tensors • Tier-0 Bytecode VM • Dual-Script Invariance
</p>

---

**Sanskrit Next for VS Code** delivers an end-to-end, high-performance IDE experience for the **Sanskrit Next** programming language. Backed by the native Rust toolchain and the Language Server Protocol (LSP 3.17), it integrates everything developers need to write, test, debug, benchmark, and deploy Sanskrit code.

---

## Key Features

### 1. Dual-Script Language Intelligence (LSP 3.17)
- **Authentic Dual-Script Invariance**: Full syntax highlighting, auto-completion, and hover documentation for both Devanagari (`कार्य`, `मान`, `दिश`, `मुद्रण`) and ASCII keywords (`fn`, `let`, `Tensor`, `print`).
- **Real-Time Compiler Diagnostics**: Syntax and typechecking errors surfaced directly in the Problems panel as you type.
- **Rich Snippets**: Instant scaffolds for functions, structs, traits, tensor matrix operations, loops, and automatic differentiation.

### 2. Native Test Explorer
- Automatically discovers Sanskrit tests (`**/*.test.skt` and `tests/**/*.skt`).
- Runs individual tests or full suites directly from the VS Code Test UI.
- Real-time pass/fail indicators, execution durations, and failure diagnostics.

### 3. Debugger (DAP Protocol)
- Set line breakpoints, step over/into functions, inspect local variables, and view stack traces.
- **First-Class Tensor Debugging**: Surfaces tensor shapes, strides, contiguous layouts, and dual numbers directly in the Variables pane.

### 4. Interactive Scientific Computing & Tensor Inspector
- Dedicated Webview for multi-dimensional strided tensor visualization.
- Interactive 2D slice heatmaps with value-based gradient coloring.
- Visual inspection of the **Automatic Differentiation Tape** (Wengert tape) showing forward dual numbers and reverse gradients.

### 5. Benchmark & Profiler Dashboard
- Run standard performance benchmarks (`sanskrit bench`) with one click.
- Real-time latency tracking for Fibonacci microbenchmarks, GEMM tensor operations (128x128), and automatic differentiation throughput.

### 6. Sanskrit Doctor & Toolchain Telemetry
- Inspect active CPU/GPU hardware accelerators (Apple Silicon AMX / Metal, NVIDIA CUDA, CPU SIMD).
- Validate package cache status and compiler health with `sanskrit doctor`.

---

## Commands & Shortcuts

| Command | Title | Description |
| :--- | :--- | :--- |
| `sanskrit.run` | **Sanskrit: Run Active File** | Executes the open Sanskrit file with the Tier-0 Bytecode VM |
| `sanskrit.build` | **Sanskrit: Build / Emit MLIR** | Compiles project or lowers SIR to Sanskrit MLIR dialect |
| `sanskrit.check` | **Sanskrit: Check Syntax & Types** | Runs lexical, syntactic, and type validation without running |
| `sanskrit.bench` | **Sanskrit: Run Performance Benchmarks** | Executes the full performance benchmark suite |
| `sanskrit.doctor` | **Sanskrit: Run Doctor Diagnostics** | Inspects toolchain, runtime, and GPU accelerator health |
| `sanskrit.env` | **Sanskrit: Show Environment Info** | Displays runtime tier and system features |
| `sanskrit.repl` | **Sanskrit: Start Interactive REPL** | Spawns a Sanskrit interactive terminal session |
| `sanskrit.openTensorInspector` | **Sanskrit: Open Tensor Inspector** | Launches the scientific computing and tensor visualizer |
| `sanskrit.new` | **Sanskrit: New Project** | Scaffolds a new Sanskrit Next application |
| `sanskrit.fmt` | **Sanskrit: Format Document** | Formats current file according to standard conventions |

---

## Configuration Settings

Customize behavior via `Settings -> Extensions -> Sanskrit Next`:

```json
{
  "sanskrit.compilerPath": "",
  "sanskrit.formatOnSave": true,
  "sanskrit.tier0": true,
  "sanskrit.trace.server": "off",
  "sanskrit.tensorInspectorAutoOpen": false
}
```

---

## Installation & Downloads

- **Visual Studio Marketplace**: [https://marketplace.visualstudio.com/items?itemName=sh20raj.sanskrit-vscode](https://marketplace.visualstudio.com/items?itemName=sh20raj.sanskrit-vscode)
- **Extension Identifier**: `sh20raj.sanskrit-vscode`
- **Official GitHub Release**: [GitHub Release `vscode-v2.0.0`](https://github.com/SH20RAJ/sanskrit/releases/tag/vscode-v2.0.0)
- **Direct VSIX Download**: [Download `sanskrit-vscode-2.0.0.vsix`](https://github.com/SH20RAJ/sanskrit/releases/download/vscode-v2.0.0/sanskrit-vscode-2.0.0.vsix)
- **SHA256**: `3c2398b75e3975bcc84b3f319d65d51e632f58b3c0e28f09d2f1debf8e9a933d`

### Install from VS Code Marketplace
In VS Code or Antigravity IDE:
1. Open Extensions (`Cmd+Shift+X` or `Ctrl+Shift+X`).
2. Search for **Sanskrit Next** (`sh20raj.sanskrit-vscode`).
3. Click **Install**.

### Install via Command Line
```bash
# Direct from Marketplace
code --install-extension sh20raj.sanskrit-vscode

# Or from downloaded VSIX
curl -L -O https://github.com/SH20RAJ/sanskrit/releases/download/vscode-v2.0.0/sanskrit-vscode-2.0.0.vsix
code --install-extension sanskrit-vscode-2.0.0.vsix
```

---

## Quick Start

1. Install Sanskrit Next compiler on your system:
   ```bash
   curl --proto "=https" --tlsv1.2 -sSf https://raw.githubusercontent.com/SH20RAJ/sanskrit/main/install.sh | bash
   ```
2. Open any `.skt` or `.sns` file in VS Code.
3. Click the **Run** button in the top right or press `Cmd+Shift+P` -> `Sanskrit: Run Active File`.

---

## License

Licensed under the [MIT License](../../LICENSE).
