---
layout: default
title: Getting Started
nav_order: 2
---

# Getting Started with Sanskrit

## Installation

Install Sanskrit using our installation script:

```bash
curl -fsSL https://sh20raj.github.io/sanskrit/install.sh | sh
```

## Basic Usage

### Starting the REPL
```bash
sanskrit repl
```

### Running a Sanskrit File
```bash
sanskrit run your_file.sns
```

## Hello World Example

Create a file named `hello.sns`:

```sanskrit
प्रिन्ट("नमस्ते विश्व");
```

Run it:
```bash
sanskrit run hello.sns
```

## Next Steps

- Read the [Language Guide](/docs/language-guide)
- Try the [Examples](/examples)
- Learn about [Advanced Features](/docs/advanced)
