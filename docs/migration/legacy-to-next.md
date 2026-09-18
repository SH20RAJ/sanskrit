# Migrating from Sanskrit Legacy to Sanskrit Next

This guide provides a comprehensive migration path from the original Node.js educational prototype (**Sanskrit Legacy**, v0.1–v0.3) to **Sanskrit Next** (v2.0+).

---

## 1. Architectural Differences

| Feature / Dimension | Sanskrit Legacy (v0.1–v0.3) | Sanskrit Next (v2.0+) |
| :--- | :--- | :--- |
| **Implementation Language** | Node.js (JavaScript) | Pure Native Rust Workspace |
| **Execution Architecture** | AST tree-walk interpreter + prototype JS VM | Multi-tier: Tier-0 Bytecode VM (<1ms startup) + MLIR + LLVM/IREE JIT & AOT |
| **Type System** | Dynamic runtime typing | Static typing by default with bidirectional Hindley-Milner local inference |
| **Memory Management** | Node.js V8 garbage collection | Value semantics + deterministic RAII ownership + scoped regions (no GC pauses) |
| **Scientific / ML Computing** | Ad-hoc arrays; no tensors | Native $N$-dimensional strided `Tensor`, `@` matmul, and compiler-level autodiff |
| **Hardware Targets** | CPU only (V8 single thread) | Heterogeneous: CPU (AVX-512, Neon), GPU (Metal, CUDA, ROCm), and NPU |
| **Script Invariance** | Mixed Devanagari and Latin keywords | Pure dual-script invariance: 1-to-1 canonical ASCII aliases for all keywords |
| **External Dependencies** | Node.js (v18+), npm packages | Zero external dependencies for users; single curl command installer |

---

## 2. Keyword and Construct Mapping

| Legacy Prototype Construct | Sanskrit Next Canonical | Sanskrit Next ASCII Alias | Notes |
| :--- | :--- | :--- | :--- |
| `वद` / `vad` | `मुद्रण` / `मुद्रय` | `print` | Standardized to classical Sanskrit printing/output |
| `मान` / `let` | `मान` | `let` | Retained with static type inference |
| `कार्य` / `function` | `कार्य` | `fn` | Simplified function declaration |
| `यदि_तर्हि` | `यदि` / `:` | `if` / `:` | Modern colon-delimited blocks |
| `अन्यथा` | `अन्यथा` / `:` | `else` / `:` | Cleaner block structure |
| `यदा_तदा` (while) | `चक्र` | `loop` / `for` | General iteration cycle |
| `सत्यम्` / `मिथ्या` | `सत्य` / `असत्य` | `true` / `false` | Standardized boolean literals |
| `शून्यम्` | `शून्य` | `nil` | Unit / nil value |
| `प्रत्यागच्छ` | `प्रत्यागम` | `return` | Canonical Paninian root for return |

---

## 3. Code Comparison Example

### Legacy Prototype (v0.3)
```sanskrit
मान a = 10
मान b = 20
कार्य योग(x, y) {
    प्रत्यागच्छ x + y
}
वद(योग(a, b))
```

### Sanskrit Next (v2.0)
```sanskrit
// Canonical Devanagari
कार्य योग(x: पूर्णाङ्क६४, y: पूर्णाङ्क६४) -> पूर्णाङ्क६४:
    प्रत्यागम x + y

कार्य मुख्य():
    मान a = 10
    मान b = 20
    मुद्रण(योग(a, b))
```
Or equivalently in ASCII:
```sanskrit
// Canonical ASCII
fn add(x: I64, y: I64) -> I64:
    return x + y

fn main():
    let a = 10
    let b = 20
    print(add(a, b))
```

---

## 4. Accessing Legacy Releases

The original Node.js prototype source code and artifacts remain permanently archived on GitHub:
- Branch: [`legacy/v0.3`](https://github.com/SH20RAJ/sanskrit/tree/legacy/v0.3)
- GitHub Release: [Sanskrit Legacy v0.3.0](https://github.com/SH20RAJ/sanskrit/releases/tag/v0.3.0-legacy)
- npm package: `npm install -g sanskrit-lang@0.3.0`
