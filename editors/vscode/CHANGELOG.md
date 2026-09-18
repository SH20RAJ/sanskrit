# Changelog

All notable changes to the "sanskrit-vscode" extension will be documented in this file.

## [2.0.2] - 2026-09-19

### Added
- **Phonetic Romanized / English Typing Intelligence**: Type in phonetic English (e.g. `mudran` / `mud`, `karya`, `yadi`, `dish`, `purnank`, `sutra`) and receive instant autocomplete to canonical Devanagari (`मुद्रण`, `कार्य`, `यदि`, `दिश`, etc.).
- **Dynamic Word Transliteration**: Real-time phonetic transliteration for arbitrary Sanskrit words and identifier names.
- **Custom Sanskrit File Icons & Theme**: Official Sanskrit glyph (`सं`) file icon and integrated `sanskrit-icons` theme for `.skt` and `.sns` files.

## [2.0.1] - 2026-09-18

### Added
- **Unicode TextMate Highlighting**: Fixed Devanagari word boundaries (`U+0900`–`U+097F`) with lookaround assertions.
- **TSX/Tailwind-class Intelligence**: Semantic tokens, inlay hints, signature help, and document outlines.
- **CodeLens & Code Actions**: One-click Run/Benchmark lenses and dual-script refactoring.

## [2.0.0-alpha.1] - 2026-09-18

### Added
- **Language Intelligence (LSP 3.17)**:
  - Full Language Server Protocol integration connecting directly to `sanskrit lsp`.
  - Dual-script tokenization and highlighting for both Devanagari (`कार्य`, `मान`, `दिश`, `मुद्रण`) and ASCII keywords (`fn`, `let`, `Tensor`, `print`).
  - Real-time compiler syntax and type checking diagnostics in the Problems view.
  - Hover documentation and completion items with parameter snippets.
- **Native Test Explorer**:
  - Integration with VS Code Test Controller API.
  - Automatic discovery of Sanskrit test files (`**/*.test.skt`, `tests/**/*.skt`).
  - Execution of individual test cases and test suites with pass/fail telemetry.
- **Debugger (DAP Protocol)**:
  - Native Sanskrit debugger supporting breakpoints, stepping, thread inspection, and stack frames.
  - Specialized variable inspector for high-dimensional tensors, shape/stride metadata, and automatic differentiation dual numbers.
- **Scientific Computing & Tensor Inspector**:
  - Interactive Webview visualizing 2D tensor slices with value-based heatmaps.
  - Automatic Differentiation Wengert Tape viewer with forward/reverse propagation.
- **Benchmarking & Profiling View**:
  - Dedicated benchmarks view displaying Fibonacci loop, GEMM tensor matmul, and autodiff timings.
  - One-click benchmark runner with real-time hardware telemetry.
- **Toolchain & Accelerator Diagnostics**:
  - `sanskrit doctor` viewer surfacing Apple Silicon AMX/Metal, NVIDIA CUDA, and CPU SIMD backends.
  - Auto-detection of compiler toolchain across workspace builds, PATH, and `~/.sanskrit/bin`.
- **Command Palette Integration**:
  - Run, Build (with MLIR dialect emission), Check, Bench, Doctor, REPL, New Project, and Format commands.
