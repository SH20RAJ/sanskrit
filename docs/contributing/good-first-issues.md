# Good First Issues & Starter Tasks for Sanskrit Next

Welcome! If you are new to the Sanskrit Next project or compiler engineering in Rust, here is a curated list of approachable, high-impact starter tasks.

---

## Category 1: Standard Library (`std/`)
*Great for developers wanting to write clean Sanskrit Next or Rust code without deep compiler internals.*

1. **`std::math` Special Functions**:
   - Location: [`std/math/`](std/) and [`crates/sanskrit-tensor/`](crates/sanskrit-tensor/)
   - Task: Implement `sigmoid`, `relu`, `tanh`, and `gelu` elementwise activations for 1D/2D tensors.
   - Dual-script: Support both `relu()` and `रेलू()`.
2. **String Utilities**:
   - Location: [`std/core/`](std/core/)
   - Task: Add string functions for trimming, splitting by delimiter, and case transformation.
3. **Matrix Initializers**:
   - Location: [`crates/sanskrit-tensor/src/lib.rs`](crates/sanskrit-tensor/src/lib.rs)
   - Task: Add `Tensor::eye(n)` (identity matrix) and `Tensor::linspace(start, stop, steps)`.

---

## Category 2: Compiler Diagnostics & Error Spans
*Great for improving developer experience.*

1. **Suggest Closest Keyword on Typo**:
   - Location: [`crates/sanskrit-parser/src/lib.rs`](crates/sanskrit-parser/src/lib.rs)
   - Task: When an unrecognized identifier is encountered in statement position (e.g. `fnx` or `कार्या`), use Levenshtein distance to suggest `Did you mean 'fn' / 'कार्य'?`.
2. **Detailed Tensor Dimension Error**:
   - Location: [`crates/sanskrit-typeck/src/lib.rs`](crates/sanskrit-typeck/src/lib.rs)
   - Task: Enhance the error message for matrix multiplication shape mismatch to show the inner dimensions:
     `Cannot multiply tensor of shape [M, K] by [P, N]; inner dimensions K != P (got 128 and 64)`.

---

## Category 3: Documentation & Examples
*No compiler code needed!*

1. **Algorithm Examples**:
   - Location: [`examples/`](examples/)
   - Task: Add canonical implementations of classic algorithms:
     - Dijkstra's shortest path
     - Fast Fourier Transform (FFT)
     - Mandelbrot fractal renderer
2. **Bilingual Documentation**:
   - Location: [`docs/`](docs/)
   - Task: Add Sanskrit / Hindi grammatical notes explaining the Paninian linguistics behind keywords like `कार्य` (Kārya = function / action) and `मान` (Māna = value / measure).

---

## Category 4: VS Code Extension
*TypeScript and UI enhancements.*

1. **New Snippets**:
   - Location: [`editors/vscode/snippets/sanskrit.json`](editors/vscode/snippets/sanskrit.json)
   - Task: Add code snippets for loops with step, multidimensional tensor indexing, and custom error types.
2. **Inlay Hints**:
   - Location: [`editors/vscode/src/lsp/client.ts`](editors/vscode/src/lsp/client.ts)
   - Task: Display parameter names and inferred tensor shapes as subtle inline hints.

---

## Need Help Getting Started?
- Tag your issue or PR with [`good first issue`](https://github.com/SH20RAJ/sanskrit/labels/good%20first%20issue).
- Ask any question on [GitHub Discussions](https://github.com/SH20RAJ/sanskrit/discussions)!
