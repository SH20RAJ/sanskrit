# संस्कृत (Sanskrit) Programming Language

[![CI](https://github.com/SH20RAJ/sanskrit/actions/workflows/ci.yml/badge.svg)](https://github.com/SH20RAJ/sanskrit/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/sanskrit-lang.svg)](https://www.npmjs.com/package/sanskrit-lang)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/SH20RAJ/sanskrit.svg)](https://github.com/SH20RAJ/sanskrit/stargazers)

> **संस्कृत** is a modern programming language that uses Sanskrit vocabulary and Devanagari script, combining the classical grammatical elegance of Sanskrit with contemporary programming language design and runtime reliability.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Installation](#installation)
  - [Method 1: Global Installation via npm](#method-1-global-installation-via-npm)
  - [Method 2: Standalone Bash Installer (Without npm)](#method-2-standalone-bash-installer-without-npm)
  - [Updating](#updating)
- [Quick Start](#quick-start)
- [CLI Reference](#cli-reference)
- [Language Guide & Syntax](#language-guide--syntax)
  - [Variables & Constants](#variables--constants)
  - [Functions & Returns](#functions--returns)
  - [Control Flow](#control-flow)
  - [Arrays & Objects](#arrays--objects)
  - [Classes, Inheritance & OOP](#classes-inheritance--oop)
  - [Error Handling](#error-handling)
  - [Standard Library Built-ins](#standard-library-built-ins)
- [Language Status Matrix](#language-status-matrix)
- [Development & Testing](#development--testing)
- [License](#license)

---

## Overview

Sanskrit is designed to be an expressive, syntactically coherent language for general programming, educational use, and algorithmic study.

- **Devanagari & Unicode Native**: Native support for Devanagari script, identifiers, combining marks (virama, matras), and Devanagari numerals (`०-९`).
- **Lexical Environments**: Robust scoping, parent-chained lexical environments, block scoping, and true closures.
- **Structured Control Signals**: Clean stack unwinding for `प्रत्यागम` (return), `तोड़` (break), `जारी` (continue), and `फेंक` (throw).
- **Object-Oriented Features**: Classes (`वर्ग`), constructors (`निर्माण`), inheritance (`विस्तार`), `स्व` (this), `सुपर` (super), static methods (`स्थैतिक`), and instantiation (`नया`).
- **Standardized Diagnostics**: Source line snippets, caret pointers, error codes, and helpful hints.

---

## Architecture

The Sanskrit language runtime provides dual execution engines:

```
Sanskrit Source (.sns)
          │
          ▼
   [Unicode Lexer] ──► Token Stream (accurate line & column tracking)
          │
          ▼
  [Canonical Parser] ──► Strongly Typed AST (node-types & locations)
          │
    ┌─────┴───────────────────────────────────┐
    │                                         │
    ▼                                         ▼
[AST Interpreter]                     [Bytecode Compiler]
(Interactive & Debugging)                      │
    │                                         ▼
    │                              [Stack-Based Bytecode VM]
    │                              (15x-30x Faster Execution)
    │                                         │
    └─────────────────┬───────────────────────┘
                      ▼
               Standard Output
```

---

## Installation

The Sanskrit programming language provides two official installation routes.

### Method 1: Global Installation via npm

Requires **Node.js v18.0.0 or higher**:

```bash
npm install -g sanskrit-lang
```

Verify the installation:
```bash
sanskrit --version
```

### Method 2: Standalone Bash Installer (Without npm)

For users who do not use npm globally or wish to install Sanskrit as a standalone user tool:

```bash
curl -fsSL https://raw.githubusercontent.com/SH20RAJ/sanskrit/main/install.sh | bash
```

The installer:
- Installs Sanskrit into `~/.local/share/sanskrit`
- Creates the executable in `~/.local/bin/sanskrit`
- Checks your `$PATH` and prints shell configuration steps if needed
- Supports custom flags:
  ```bash
  # Install into custom directory
  ./install.sh --install-dir /opt/sanskrit --bin-dir /usr/local/bin

  # Uninstall Sanskrit cleanly
  ./install.sh --uninstall
  ```

### Updating

To update to the latest release:

- **Via npm**:
  ```bash
  npm update -g sanskrit-lang
  ```
- **Via Bash Installer**:
  ```bash
  curl -fsSL https://raw.githubusercontent.com/SH20RAJ/sanskrit/main/install.sh | bash
  ```

---

## Quick Start

Create a source file named `main.sns`:

```sanskrit
// नमस्ते संस्कृत
कार्य नमस्ते() {
    मुद्रण("नमस्ते विश्व!");
}

नमस्ते();

कार्य योग(क, ख) {
    प्रत्यागम क + ख;
}

मुद्रण("१० + २० =", योग(१०, २०));
```

Run it:
```bash
sanskrit run main.sns
```

Output:
```
नमस्ते विश्व!
१० + २० = ३०
```

---

## CLI Reference

The `sanskrit` CLI includes:

| Command | Description |
|---|---|
| `sanskrit run <file>` | Execute a Sanskrit (`.sns`) program using AST interpreter |
| `sanskrit run --vm <file>` | Execute using the high-speed Bytecode Virtual Machine (15x-30x faster) |
| `sanskrit run --vm --disasm <file>` | Disassemble compiled bytecode instructions to console |
| `sanskrit run -d <file>` | Run with token stream and AST tree debugging |
| `sanskrit check <file>` | Verify source syntax without executing |
| `sanskrit repl` | Start the interactive REPL shell |
| `sanskrit --version` | Output the version number |
| `sanskrit --help` | Display command usage and options |

### Interactive REPL

Launch the REPL with:
```bash
sanskrit repl
```
```
संस्कृत (Sanskrit) REPL v0.2.0
Type '.help' for commands, or '.exit' to quit.

sanskrit> चर x = १०;
sanskrit> चर y = २०;
sanskrit> x + y;
३०
sanskrit> .exit
पुनर्मिलामः! (Goodbye!)
```

---

## Language Guide & Syntax

### Variables & Constants

Variables are mutable (`चर`), while constants (`स्थिर`) prevent reassignment:

```sanskrit
चर नाम = "राम";
नाम = "लक्ष्मण"; // Valid

स्थिर पाई = ३.१४१५९;
// पाई = ३.१४; // Throws ConstantError
```

### Functions & Returns

Declared with `कार्य` (kārya) and returned with `प्रत्यागम` (pratyāgama):

```sanskrit
कार्य गुणा(क, ख) {
    प्रत्यागम क * ख;
}

मुद्रण(गुणा(६, ७)); // Outputs: ४२
```

### Control Flow

#### If / Else
```sanskrit
यदि (आयु >= १८) {
    मुद्रण("वयस्क है");
} अन्यथा {
    मुद्रण("नाबालिग है");
}
```

#### While Loop (`यावत्`)
```sanskrit
चर i = ०;
यावत् (i < ५) {
    मुद्रण(i);
    i++;
}
```

#### For Loop (`पुनः`)
```sanskrit
पुनः (चर i = १; i <= ५; i++) {
    मुद्रण(i);
}
```

#### Foreach Loop (`प्रत्येक`)
```sanskrit
चर संख्याएं = [१०, २०, ३०];
प्रत्येक (संख्या में संख्याएं) {
    मुद्रण(संख्या);
}
```

### Arrays & Objects

```sanskrit
// Arrays (सूची)
चर संख्याएं = [१, २, ३, ४, ५];
संख्याएं[०] = १०;
मुद्रण("पहली संख्या:", संख्याएं[०]);

// Objects (वस्तु)
चर व्यक्ति = {
    नाम: "सीता",
    आयु: २२,
    शहर: "अयोध्या"
};
मुद्रण(व्यक्ति.नाम); // Outputs: सीता
```

### Pythonic Advanced Concepts

#### Sequence Slicing (`[start:stop:step]`)
Sanskrit supports Pythonic slicing on arrays and strings, including step and reverse step:

```sanskrit
चर संख्याएं = [१०, २०, ३०, ४०, ५०, ६०];
मुद्रण(संख्याएं[१:४]);   // [२०, ३०, ४०]
मुद्रण(संख्याएं[:३]);    // [१०, २०, ३०]
मुद्रण(संख्याएं[::२]);   // [१०, ३०, ५०]
मुद्रण(संख्याएं[::-१]);  // [६०, ५०, ४०, ३०, २०, १०]

चर पाठ = "संस्कृतभाषा";
मुद्रण(पाठ[०:७]);       // संस्कृत
```

#### List Comprehensions
Transform and filter collections cleanly using `[expr पुनः (item में coll) यदि (cond)]`:

```sanskrit
चर मूल = [१, २, ३, ४, ५, ६];
चर वर्ग = [x * x पुनः (x में मूल)];
मुद्रण(वर्ग); // [१, ४, ९, १६, २५, ३६]

चर सम_द्वि = [x * २ पुनः (x में मूल) यदि (x % २ === ०)];
मुद्रण(सम_द्वि); // [४, ८, १२]
```

#### Arrow Functions & Lambdas
Expressive first-class closures and lambda expressions:

```sanskrit
// Arrow function with expression body
चर द्विगुणी = x => x * २;
चर योग = (क, ख) => क + ख;

// Arrow function with block body
चर विस्तृत = (क, ख) => {
    चर परिणाम = क * ख;
    प्रत्यागम परिणाम + १०;
};

मुद्रण(योग(५, १०));   // १५
मुद्रण(द्विगुणी(७));   // १४
```

#### Conditional Expressions (Pythonic Ternary)
Evaluate expressions conditionally using `consequent यदि test अन्यथा alternate`:

```sanskrit
चर आयु = १८;
चर स्थिति = "वयस्क" यदि (आयु >= १८) अन्यथा "नाबालिग";
मुद्रण(स्थिति); // वयस्क
```

### Classes, Inheritance & OOP

Classes use `वर्ग`, constructors use `निर्माण`, instances use `स्व` (this), parent constructors use `सुपर`, and instantiation uses `नया`:

```sanskrit
वर्ग व्यक्ति {
    निर्माण(नाम, आयु) {
        स्व.नाम = नाम;
        स्व.आयु = आयु;
    }

    कार्य परिचय() {
        मुद्रण("नमस्ते, मेरा नाम", स्व.नाम, "है।");
    }
}

वर्ग छात्र विस्तार व्यक्ति {
    निर्माण(नाम, आयु, कक्षा) {
        सुपर(नाम, आयु);
        स्व.कक्षा = कक्षा;
    }

    कार्य परिचय() {
        मुद्रण(स्व.नाम, "कक्षा", स्व.कक्षा, "का छात्र है।");
    }
}

चर राम = नया छात्र("राम", १६, "दसवीं");
राम.परिचय();
```

### Error Handling

Exception handling is implemented with `प्रयत्न` (try), `पकड़` (catch), `अंततः` (finally), and `फेंक` (throw):

```sanskrit
कार्य भाग(क, ख) {
    यदि (ख === ०) {
        फेंक "शून्य से विभाजन संभव नहीं है";
    }
    प्रत्यागम क / ख;
}

प्रयत्न {
    मुद्रण(भाग(१०, ०));
} पकड़ (त्रुटि) {
    मुद्रण("त्रुटि पकड़ी गई:", त्रुटि);
} अंततः {
    मुद्रण("प्रक्रिया पूर्ण");
}
```

### Standard Library Built-ins

| Built-in Function | Description | Example |
|---|---|---|
| `मुद्रण(...args)` | Print values to standard output | `मुद्रण("नमस्ते", ४२);` |
| `लंबाई(obj)` | Length of string, array, or object | `लंबाई([१, २, ३])` |
| `प्रकार(val)` | Type name of value | `प्रकार(४२)` -> `'संख्या'` |
| `पार्स_संख्या(str)` | Parse string into number | `पार्स_संख्या("१२३")` |
| `संख्या(val)` | Convert value to number | `संख्या("४५")` |
| `स्ट्रिंग(val)` | Convert value to string | `स्ट्रिंग(४२)` |
| `बूलियन(val)` | Convert value to boolean | `बूलियन(१)` |
| `गणित_वर्ग(x)` | Square root ($\sqrt{x}$) | `गणित_वर्ग(१६)` -> `४` |
| `गणित_शक्ति(x, y)` | Exponentiation ($x^y$) | `गणित_शक्ति(२, ३)` -> `८` |
| `गणित_न्यूनतम(...args)` | Minimum or integer floor | `गणित_न्यूनतम(१०, ५)` -> `५` |
| `गणित_अधिकतम(...args)` | Maximum of arguments | `गणित_अधिकतम(१०, ५)` -> `१०` |
| `गणित_पूर्णांक(x)` | Integer floor function | `गणित_पूर्णांक(३.७)` -> `३` |
| `समय()` | Current Unix timestamp (ms) | `समय()` |
| `श्रेणी(...args)` | Sequence range (start, stop, step) | `श्रेणी(१, ६)` -> `[१, २, ३, ४, ५]` |
| `मानचित्रण(coll, fn)` | Map items using callable | `मानचित्रण(सूची, x => x * २)` |
| `शोधन(coll, fn)` | Filter items with predicate | `शोधन(सूची, x => x > २)` |
| `संक्षिप्त(fn, coll, init)` | Reduce collection to single value | `संक्षिप्त((a, b) => a + b, सूची, ०)` |
| `योग(coll)` | Sum of all numeric elements | `योग([१, २, ३, ४])` -> `१०` |
| `सभी(coll)` | Check if all items are truthy | `सभी([सत्य, सत्य])` -> `सत्य` |
| `कोई(coll)` | Check if any item is truthy | `कोई([असत्य, सत्य])` -> `सत्य` |
| `उलटा(coll)` | Return reversed copy | `उलटा([१, २, ३])` -> `[३, २, १]` |
| `क्रमबद्ध(coll, keyFn)` | Return sorted copy of collection | `क्रमबद्ध([३, १, २])` -> `[१, २, ३]` |
| `संयोजन(...colls)` | Zip multiple collections into tuples | `संयोजन(नाम, अंक)` |
| `क्रमांकन(coll)` | Enumerate items with index `[idx, item]` | `क्रमांकन(["अ", "ब"])` |

---

## Language Status Matrix

| Feature | Status | Specification / Notes |
|---|---|---|
| **Devanagari Numerals & Script** | ✅ **Stable** | Native support for `०-९` and Unicode script |
| **Variables (`चर`) & Constants (`स्थिर`)** | ✅ **Stable** | Lexical scopes, immutability checks |
| **Functions (`कार्य`) & Returns (`प्रत्यागम`)** | ✅ **Stable** | First-class functions, recursion |
| **Closures & Lexical Environments** | ✅ **Stable** | Dynamic parent environments |
| **Control Flow (`यदि`, `यावत्`, `पुनः`, `प्रत्येक`)** | ✅ **Stable** | Conditionals, while, for, foreach, break, continue |
| **Arrays & Objects** | ✅ **Stable** | Indexing, member access, assignment |
| **Pythonic Slicing (`[start:stop:step]`)** | ✅ **Stable** | Sequences, strings, negative step reverse |
| **List Comprehensions** | ✅ **Stable** | `[expr पुनः (x में coll) यदि (cond)]` |
| **Arrow Functions & Lambdas** | ✅ **Stable** | `(x) => expr` and block closures |
| **Conditional Expressions (Ternary)** | ✅ **Stable** | `consequent यदि test अन्यथा alternate` |
| **Functional Standard Library** | ✅ **Stable** | `श्रेणी`, `मानचित्रण`, `शोधन`, `संक्षिप्त`, `योग`, etc. |
| **Classes (`वर्ग`), Inheritance (`विस्तार`)** | ✅ **Stable** | Constructors, `स्व`, `सुपर`, methods, static methods |
| **Exception Handling (`प्रयत्न`, `पकड़`, `अंततः`)** | ✅ **Stable** | Throw, catch, finally block execution |
| **Bytecode Virtual Machine (VM)** | ✅ **Stable** | Stack machine, 15x-30x speedup (`--vm`, `--disasm`) |
| **CLI & REPL** | ✅ **Stable** | `run`, `check`, `repl`, version, help |
| **LLVM / Native Backend** | 🧪 **Experimental** | Located in `src/compiler/llvm/`, requires native bindings |
| **Module Import / Export (`आयात` / `निर्यात`)** | 📋 **Planned** | Module system planned for v0.3.0 |
| **Async / Await (`असिन्क्` / `प्रतीक्षा`)** | 📋 **Planned** | Async runtime integration planned for v0.3.0 |

---

## Development & Testing

Run the automated test suite:
```bash
npm test
```

Validate syntax of example fixtures:
```bash
node bin/sanskrit run test/main.sns
node bin/sanskrit run test/advanced_features.sns
node bin/sanskrit run test/algorithms.sns
node bin/sanskrit run test/class_example.sns
node bin/sanskrit run test/error_handling.sns
```

Validate npm packaging:
```bash
npm pack --dry-run
```

---

## Contributing

Contributions are welcome!
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Ensure all tests pass (`npm test`)
4. Commit your changes (`git commit -m 'feat: add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

---

## License

This project is open source and available under the [MIT License](LICENSE).
