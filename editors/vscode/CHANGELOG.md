# Changelog

All notable changes to the "sanskrit-vscode" extension will be documented in this file.

## [2.0.3] - 2026-09-19

### Added
- **Interactive Sanskrit VM Terminal Runner**: Run Sanskrit files directly in a dedicated integrated VS Code terminal (`Sanskrit VM`) with sub-2ms startup!
- **Run Selection in Terminal**: Highlight any block of Sanskrit code and execute it immediately via a transient script in the terminal.
- **Run with Custom Arguments**: Prompt and pass custom flags (`--release`, `--tier0`, `--device`) directly to `sanskrit run`.
- **Editor Title Bar Play Button**: One-click execution button (`$(play)`) in the editor tab bar for all `.skt` and `.sns` files.
- **Keyboard Shortcuts**: `Ctrl+Alt+N` / `Cmd+Alt+N` to run active file in terminal, `Ctrl+Alt+S` / `Cmd+Alt+S` to run selection.
- **35+ Comprehensive Configuration Settings**:
  - `sanskrit.execution.*`: Terminal title, run in terminal, clear terminal before run, focus terminal, auto-save before run, tier0, release, backend, device acceleration, custom args, working directory.
  - `sanskrit.compiler.*`: Custom path, check on save, emit MLIR by default, optimization levels (`-O0` to `-Ofast`).
  - `sanskrit.transliteration.*`: Enable/disable phonetic typing, script preference (both/devanagari/latin), show in completion list.
  - `sanskrit.inlayHints.*`: Type hints, parameter name hints, tensor shape hints.
  - `sanskrit.formatting.*`: Format on save, indent size, align colons.
  - `sanskrit.diagnostics.*`: Enable diagnostics, strict tensor checking, mixed script warnings.
  - `sanskrit.tensorInspector.*`: Auto-open on debug, color theme (saffron, viridis, plasma, etc.), max cell display.
  - `sanskrit.benchmark.*`: Iterations count, warmup runs, save results JSON.
  - `sanskrit.lsp.*`: Custom server path, LSP trace level.

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
