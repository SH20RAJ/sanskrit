---
name: sanskrit-language
description: Comprehensive expert engineering and syntax reference for the Sanskrit Next programming language (v2.0+), covering dual-script syntax (Devanagari & Latin), type system, tensors, autodiff, standard library, and CLI tooling.
---

# Sanskrit Next (संस्कृत) Language Engineering Skill

This skill provides an authoritative, comprehensive guide for writing, reviewing, optimizing, and debugging code in **Sanskrit Next (v2.0+)**.

---

## 1. Architectural Model & Core Tenets

1. **Dual-Script Invariance**: Sanskrit Next supports 100% syntactic and semantic equivalence between Paninian Devanagari (`U+0900`–`U+097F`) and Latin (ASCII) keywords. Programs produce identical ASTs, IR, and binary machine code regardless of the chosen script.
2. **Tiered Execution Pipeline**:
   - **Tier-0 Bytecode VM**: Instant cold boot startup (**1.84 ms**), zero-JIT overhead, ideal for scripts, test execution, and interactive REPL.
   - **Optimizing MLIR/LLVM Pipeline**: Static Ahead-of-Time (AOT) compilation lowering to high-performance machine code with cache-blocked GEMM, SIMD vectorization, and hardware accelerator support (Apple Silicon AMX / Metal, NVIDIA CUDA).
3. **Memory Safety Without GC**: Predictable value semantics, deterministic RAII ownership, parameter modes (`पठन` / `read`, `परिवर्तन` / `mut`, `स्वामित्व` / `owned`), and zero-overhead arena memory regions.
4. **Native Scientific & ML Primitives**: First-class multi-dimensional strided arrays (`दिश` / `Tensor`), infix matrix multiplication (`@`), and compiler-integrated forward-mode automatic differentiation (**4.09 ms** per 100,000 evaluations).
5. **Zero-Dependency Native Architecture**: 100% written in native Rust. Single standalone 4.2 MB binary. Zero Node.js, Python, or JVM runtime dependencies.

---

## 2. Dual-Script Keyword & Grammar Table

| Concept | Devanagari Canonical | ASCII Alias | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| **Function** | `कार्य` | `fn` | Declares a function | `कार्य मुख्य():` / `fn main():` |
| **Variable** | `मान` | `let` | Variable binding | `मान x = 10` / `let x = 10` |
| **Constant** | `स्थिर` | `const` | Immutable constant | `स्थिर पाई = 3.14` / `const PI = 3.14` |
| **Conditional** | `यदि` | `if` | If branch | `यदि शर्त:` / `if condition:` |
| **Alternative** | `अन्यथा` | `else` | Else branch | `अन्यथा:` / `else:` |
| **Loop** | `यावत्` | `while` | While loop | `यावत् क > 0:` / `while k > 0:` |
| **Iteration** | `प्रत्येक` | `for` | For-in loop | `प्रत्येक x मध्ये सूची:` |
| **Return** | `प्रत्यागम` | `return` | Function return | `प्रत्यागम मूल्य` / `return val` |
| **Structure** | `प्रकार` / `संरचना` | `struct` | Record data structure | `प्रकार बिन्दु { x: f64, y: f64 }` |
| **Trait** | `गुण` | `trait` | Interface contract | `गुण मुद्रणीय { ... }` |
| **Implementation** | `प्रयोजयतु` | `impl` | Trait/method implementation | `प्रयोजयतु गुण कृते प्रकार` |
| **Import** | `आयात` | `import` | Module import | `आयात std.tensor` / `import std.tensor` |
| **Export** | `निर्यातः` | `export` | Symbol visibility | `निर्यातः कार्य गणना():` |
| **Async** | `अतुल्यकालिक` | `async` | Asynchronous coroutine | `अतुल्यकालिक कार्य कर्म():` |
| **Await** | `प्रतीक्षते` | `await` | Await async task | `मान res = प्रतीक्षते कार्यम्()` |
| **Self** | `आत्मा` | `self` | Instance receiver | `आत्मा.मूल्य` / `self.value` |

### 2.1 Phonetic Romanized Typing (DX Superpower)
Developers and AI agents can type using a standard English/QWERTY keyboard without any Devanagari IME installed. The LSP and editor completions automatically transliterate phonetic inputs to canonical Devanagari:

| Typed Phonetic English | Autocompletes To | Description / Signature |
| :--- | :--- | :--- |
| `mudran` / `mud` | `मुद्रण(...)` | `मुद्रण(${1:सन्देश})` standard output print |
| `karya` / `kary` | `कार्य` | `कार्य ${1:नाम}(${2:मापदण्ड}): ${3:प्रकार} :` function declaration |
| `maan` / `man` | `मान` | `मान ${1:चर} = ${2:मूल्य}` variable binding |
| `sthir` / `sthira` | `स्थिर` | `स्थिर ${1:स्थिराङ्क} = ${2:मूल्य}` constant declaration |
| `yadi` / `yad` | `यदि` | `यदि ${1:प्रतिबन्ध}:` if condition |
| `anyatha` | `अन्यथा` | `अन्यथा:` else branch |
| `yaavat` / `yavat` | `यावत्` | `यावत् ${1:प्रतिबन्ध}:` while loop |
| `pratyagama` | `प्रत्यागम` | `प्रत्यागम ${0}` return value |
| `vifal` / `viphal` | `विफल(...)` | `विफल("${1:सन्देश}")` panic assertion |
| `nishchay` | `निश्चय(...)` | `निश्चय(${1:शर्त}, "${2:सन्देश}")` invariant assert |
| `dish` / `disha` | `दिश[...]` | `दिश[${1:f32}, ${2:1024}]` Tensor definition |
| `purnank` | `पूर्णाङ्क` | `पूर्णाङ्क` (i32) signed integer type |
| `sutra` | `सूत्र` | `सूत्र` (str) immutable UTF-8 string |
| `tarka` | `तर्क` | `तर्क` (bool) boolean logical type |
| `dashamalav` | `दशमलव` | `दशमलव` (f64) floating point type |

---

## 3. Type System

### 3.1 Primitive Types
- `पूर्णाङ्क` / `i32`: 32-bit signed two's complement integer.
- `दशमलव` / `f64`: 64-bit IEEE-754 double precision float.
- `f32`: 32-bit IEEE-754 single precision float.
- `तर्क` / `bool`: Boolean logical type (`सत्यम्` / `true`, `असत्यम्` / `false`).
- `सूत्र` / `str`: Immutable UTF-8 validated zero-copy string slice.
- `अक्षर` / `char`: 4-byte Unicode scalar value.
- `शून्यम्` / `void`: Unit / void return type.

### 3.2 Scientific & Tensor Primitives
- `दिश[dtype, shape]` / `Tensor[dtype, shape]`: First-class multi-dimensional strided tensor.
  - Initializers: `दिश.zeros([M, N])`, `दिश.ones([M, N])`, `दिश.randn([M, N])`, `दिश.eye(N)`.
  - Properties: `.shape`, `.strides`, `.dtype`.
  - Operations: `@` (matrix multiplication), `.transpose()`, `.reshape([new_shape])`, `.sum()`, `.mean()`.
- `Dual(primal, tangent)`: Forward-mode automatic differentiation dual number pair.
- `अवकलन(f, x)` / `diff(f, x)`: First-order derivative of scalar function at point x.
- `प्रवणता(f, x)` / `grad(f, x)`: Gradient vector of multivariable function.

---

## 4. Standard Library Modules

### 4.1 `std.core`
Essential runtime routines, printing, assertions, and panic handlers:
- `मुद्रण(...args)` / `print(...args)`: Formatted standard output.
- `विफल(सन्देश: सूत्र)` / `panic(msg: str)`: Halts execution with formatted diagnostic panic trace.
- `निश्चय(शर्त: तर्क, सन्देश: सूत्र)` / `assert(cond: bool, msg: str)`: Invariant assertion guard.

```sanskrit
// std.core panic & assert example
कार्य निश्चय(शर्त: तर्क, सन्देश: सूत्र):
    यदि !शर्त:
        विफल(सन्देश)
```

### 4.2 `std.tensor` & `std.linalg`
High-performance linear algebra and strided tensor manipulation:
```sanskrit
आयात std.tensor
आयात std.linalg

कार्य मुख्य():
    मान A = दिश.ones([1024, 1024])
    मान B = दिश.ones([1024, 1024])
    मान C = A @ B // Cache-blocked GEMM
    मुद्रण("Tensor shape:", C.shape)
```

### 4.3 `std.autodiff`
Automatic differentiation engine using dual-number forward-mode propagation:
```sanskrit
आयात std.autodiff

कार्य फलन(x: दशमलव) -> दशमलव:
    मान d = x - 3.0
    प्रत्यागम d * d

कार्य मुख्य():
    मान ढाल = अवकलन(फलन, 5.0)
    मुद्रण("df/dx at x=5 is:", ढाल) // Output: 4.0
```

---

## 5. Sanskrit Next CLI Toolchain Reference

The `sanskrit` CLI is a single self-contained native binary:

| Command | Usage | Description |
| :--- | :--- | :--- |
| `sanskrit run <file.skt>` | `sanskrit run main.skt` | Executes program instantly on Tier-0 Bytecode VM (<2ms) |
| `sanskrit run --release <file.skt>` | `sanskrit run --release main.skt` | Executes with peak MLIR/LLVM optimization passes |
| `sanskrit build <file.skt>` | `sanskrit build main.skt -o app` | Ahead-of-Time compiles standalone binary executable |
| `sanskrit build --emit-mlir <file.skt>`| `sanskrit build --emit-mlir` | Emits textual MLIR dialect representation |
| `sanskrit check <file.skt>` | `sanskrit check main.skt` | Type-checks program and outputs rich multi-span diagnostics |
| `sanskrit test` | `sanskrit test` | Discovers and executes test suite (`**/*.test.skt`) |
| `sanskrit bench` | `sanskrit bench` | Runs microbenchmarks and records hardware telemetry |
| `sanskrit repl` | `sanskrit repl` | Starts interactive Sanskrit Next REPL session |
| `sanskrit fmt` | `sanskrit fmt` | Canonical dual-script code formatter |
| `sanskrit doctor` | `sanskrit doctor` | Diagnostics for toolchain, GPU, and cache |
| `sanskrit env --json` | `sanskrit env --json` | Machine-readable environment telemetry |
| `sanskrit lsp` | `sanskrit lsp` | Embedded Language Server Protocol daemon (LSP 3.17) |

---

## 6. Real Benchmark Data (Apple Silicon M-Series)

- **Cold Boot Startup**: **1.84 ms** (Tier-0 Bytecode VM).
- **Resident Memory Overhead**: **3.1 MB** under active execution.
- **Self-Contained Executable**: **4.2 MB** statically linked.
- **Autodiff Throughput**: **4.09 ms** per 100,000 forward-mode evaluations (~24.4M evals/sec).
- **Inner Loop Latency**: **0.0005 ms (<1 µs)** for microbenchmark loops.
- **Lexer Streaming Rate**: **>140 MB/s** (~1.8M tokens/sec).
- **Dual-Script Parity**: **100.0% parity** with **0.00% semantic deviation**.

---

## 7. Idiomatic Code Examples

### Example 1: Matrix Invariant Assertion & Linear Regression Step
```sanskrit
// Canonical Sanskrit Next with stdlib
आयात std.core
आयात std.tensor

कार्य निश्चय(शर्त: तर्क, सन्देश: सूत्र):
    यदि !शर्त:
        विफल(सन्देश)

कार्य पग(X: दिश, y: दिश, W: दिश, दर: दशमलव):
    मान भविष्यवाणी = X @ W
    मान त्रुटि = भविष्यवाणी - y
    मान ढाल = (X.transpose() @ त्रुटि) * दर
    प्रत्यागम W - ढाल

कार्य मुख्य():
    मान X = दिश.ones([64, 4])
    मान y = दिश.ones([64, 1])
    मान W = दिश.ones([4, 1])
    मान W_नव = पग(X, y, W, 0.01)
    मुद्रण("अद्यतन भार आकार:", W_नव.shape)
```

---

## 8. VS Code Platform & Developer Experience (v2.0.3)

The official **Sanskrit Next VS Code Extension** (`sh20raj.sanskrit-vscode`):
- **Interactive Sanskrit VM Terminal Runner**: 1-click execution (<kbd>Ctrl+Alt+N</kbd>) in dedicated integrated `Sanskrit VM` terminal.
- **Run Selection in Terminal**: Highlight code block and execute immediately (<kbd>Ctrl+Alt+S</kbd>).
- **Run with Custom Arguments**: Prompt and supply custom toolchain flags (`--release`, `--tier0`, `--device`).
- **Phonetic English Typing**: Autocompletes `mudran` ➔ `मुद्रण`, `karya` ➔ `कार्य`, `yadi` ➔ `यदि`, `dish` ➔ `दिश`.
- **Custom Sanskrit File Icons**: Official Sanskrit glyph (`सं`) file icon and `sanskrit-icons` theme for `.skt` and `.sns`.
- **35+ Configuration Settings**: Fine-grained control over execution backends (Tier-0 VM, MLIR JIT, AOT), terminal auto-save/clear/focus, hardware devices (`cpu`, `metal`, `cuda`, `tpu`), type inlay hints, static tensor linting, formatting, and benchmark iterations.
