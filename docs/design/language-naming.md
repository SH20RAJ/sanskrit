# Sanskrit Next: Canonical Linguistic Architecture & Naming Design

This document establishes the official terminology, etymological grounding, and dual-script lexical design for **Sanskrit Next**.

---

## 1. Design Philosophy: Dual-Script Invariance

Sanskrit Next is designed for international research and production deployment while maintaining an authentic, mathematically sound Sanskrit identity. To achieve this:
1. **Canonical Semantics**: The language's fundamental keywords and concepts are rooted in classical Sanskrit grammatical, mathematical, and philosophical terminology (Paninian grammar, Sulba Sutras, and classical Indian mathematics).
2. **Dual-Script Lexicon**: Every Devanagari keyword has an exact, 1-to-1 canonical ASCII / Latin alias.
3. **AST Equivalence**: The lexer normalizes both representations into identical lexical tokens (`TokenKind`). The parser and compiler pipeline operate on these invariant tokens. A developer can write code using Devanagari, pure ASCII, or a hybrid without impacting runtime behavior, ABI, or performance.

---

## 2. Core Keywords and Semantic Roots

| Concept | Devanagari Canonical | Latin / ASCII Alias | Sanskrit Root / Etymology | Semantic Description |
| :--- | :--- | :--- | :--- | :--- |
| **Function Definition** | `कार्य` | `fn` | *kārya* (that which is to be executed / action) | Declares a pure or side-effecting function. |
| **Mutable Variable** | `मान` | `let` / `var` | *māna* (value, measure) | Declares a locally mutable or inferable binding. |
| **Immutable Constant** | `स्थिर` | `const` | *sthira* (firm, unmoving, immutable) | Declares a compile-time evaluated or runtime immutable value. |
| **Composite Record** | `संरचना` | `struct` | *saṃracanā* (composition, structure) | Defines a statically laid-out value-semantic struct. |
| **Behavioral Trait** | `लक्षण` | `trait` | *lakṣaṇa* (characteristic, distinguishing mark) | Defines compile-time interfaces and contract bounds. |
| **Enumeration / Sum Type** | `गणना` | `enum` | *gaṇanā* (enumeration, categorization) | Defines tagged algebraic data types and variants. |
| **Module Import** | `आयात` | `import` | *āyāta* (brought in, imported) | Brings external module symbols into the current scope. |
| **Symbol Export** | `निर्यात` | `export` | *niryāta* (sent out, exported) | Exposes internal definitions to external packages. |
| **Conditional Branch** | `यदि` | `if` | *yadi* (if, in case) | Tests a boolean expression. |
| **Alternative Branch** | `अन्यथा` | `else` | *anyathā* (otherwise, differently) | Executes fallback branch when condition is false. |
| **Loop / Iteration** | `चक्र` | `loop` / `for` | *cakra* (wheel, cycle) | Iterates over ranges, iterables, or conditional loops. |
| **Function Return** | `प्रत्यागम` | `return` | *pratyāgama* (return, coming back with result) | Exits the current function with a return value. |
| **Asynchronous Task** | `असमकाल` | `async` | *asamakāla* (not occurring simultaneously) | Defines a non-blocking asynchronous function or task. |
| **Asynchronous Await** | `प्रतीक्षा` | `await` | *pratīkṣā* (expectation, waiting) | Awaits the completion of an asynchronous promise or task. |
| **Ownership Move** | `त्याग` | `move` | *tyāga* (relinquishment, transfer) | Explicitly transfers ownership of a heap/resource binding. |
| **Mutable Borrow** | `परिवर्तन` | `mut` | *parivartana* (transformation, modification) | Borrows an exclusive mutable reference. |
| **Immutable Borrow** | `पठन` | `read` | *paṭhana* (reading, inspection) | Borrows a shared read-only reference. |

---

## 3. Scientific, Mathematical, and Tensor Nomenclature

Scientific computing terminology draws from historical Sanskrit mathematical treatises:

| Scientific Concept | Devanagari Term | Latin Alias | Etymology & Mathematical Precision |
| :--- | :--- | :--- | :--- |
| **Tensor ($N$-Dimensional)** | `दिश` | `Tensor` | *diś* (dimension, coordinate direction). Represents multi-dimensional strided arrays. |
| **Matrix (2D Array)** | `आव्यूह` | `Matrix` | *āvyūha* (systematic arrangement / array). Represents 2D linear transformations. |
| **Vector (1D Array)** | `सदिश` | `Vector` | *sadiśa* (having direction and magnitude). 1D contiguous elements. |
| **Shape** | `आकार` | `Shape` | *ākāra* (dimension tuple, form, e.g., `[B, C, H, W]`). |
| **Dimension / Axis** | `अक्ष` | `Axis` | *akṣa* (axis of rotation / coordinate dimension). |
| **Gradient** | `प्रवणता` | `grad` | *pravaṇatā* (inclination, slope, derivative vector). |
| **Differentiable** | `वकलनीय` | `Differentiable` | *avakalana* (differentiation / calculus). |
| **Matrix Multiply** | `@` / `गुणन` | `matmul` | Matrix dot product operator. |
| **Contiguous View** | `दृष्टि` | `view` | Non-copying strided tensor slice. |

---

## 4. Fundamental Type System Lexicon

```sanskrit
// Signed Integers
पूर्णाङ्क८   / I8
पूर्णाङ्क१६  / I16
पूर्णाङ्क३२  / I32
पूर्णाङ्क६४  / I64
पूर्णाङ्क१२८ / I128

// Unsigned Integers
अपूर्णाङ्क८   / U8
अपूर्णाङ्क१६  / U16
अपूर्णाङ्क३२  / U32
अपूर्णाङ्क६४  / U64
अपूर्णाङ्क१२८ / U128

// Floating Point
दशमलव१६   / F16
दशमलव३२   / F32
दशमलव६४   / F64
बृहद्दशमलव / BF16

// Complex Numbers
मिश्र३२    / Complex32
मिश्र६४    / Complex64

// Core Types
तर्क      / Bool
सूत्र     / String
शून्य     / Void / Nil
विकल्प    / Option
परिणाम    / Result
```

---

## 5. Dual-Script Invariance Examples

The following two programs produce the **exact same AST, exact same SIR, and identical native machine instructions**:

### Canonical Devanagari
```sanskrit
आयात std.math
आयात std.tensor

कार्य योग_आव्यूह(a: दिश[दशमलव३२], b: दिश[दशमलव३२]) -> दिश[दशमलव३२]:
    प्रत्यागम a + b

कार्य मुख्य():
    मान क = tensor.ones([1024, 1024], dtype=दशमलव३२)
    मान ख = tensor.ones([1024, 1024], dtype=दशमलव३२)
    मान ग = योग_आव्यूह(क, ख)
    मुद्रण(ग.आकार)
```

### Canonical ASCII Equivalent
```sanskrit
import std.math
import std.tensor

fn add_matrices(a: Tensor[F32], b: Tensor[F32]) -> Tensor[F32]:
    return a + b

fn main():
    let a = tensor.ones([1024, 1024], dtype=F32)
    let b = tensor.ones([1024, 1024], dtype=F32)
    let c = add_matrices(a, b)
    print(c.shape)
```
