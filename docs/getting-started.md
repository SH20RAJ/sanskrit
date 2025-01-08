---
layout: default
title: Getting Started
nav_order: 2
---

# Getting Started with Sanskrit
{: .no_toc }

## Table of Contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (version 14 or higher)
- npm (usually comes with Node.js)

## Installation

Install the Sanskrit programming language using npm:

```bash
npm install -g sanskrit-lang
```

## Your First Sanskrit Program

1. Create a new file called `नमस्ते.sns` with the following content:

```sanskrit
कार्य नमस्ते() {
    मुद्रण("नमस्ते विश्व!");
}

नमस्ते();
```

2. Run the program:

```bash
sanskrit run नमस्ते.sns
```

You should see the output: `नमस्ते विश्व!`

## Basic Concepts

### 1. Functions

Functions are declared using the `कार्य` keyword:

```sanskrit
कार्य योग(क, ख) {
    मुद्रण(क + ख);
}

योग(१०, २०);  // Outputs: ३०
```

### 2. Strings

Strings can be written in both Devanagari and Latin scripts:

```sanskrit
मुद्रण("संस्कृत भाषा");        // Sanskrit text
मुद्रण("Sanskrit Language");   // Latin text
```

### 3. Numbers

Use either Devanagari or Arabic numerals:

```sanskrit
मुद्रण(१ + २);      // Using Devanagari numerals
मुद्रण(1 + 2);      // Using Arabic numerals
```

## Command Line Interface

The Sanskrit CLI provides several commands:

```bash
# Run a Sanskrit program
sanskrit run program.sns

# Start the REPL (Coming Soon)
sanskrit repl
```

## Next Steps

1. Check out the [Language Guide](../language-guide) for detailed syntax
2. Try the [Examples](../examples)
3. Join our [GitHub community](https://github.com/sh20raj/sanskrit)

## Common Issues

### Installation Problems

If you encounter installation issues:

1. Make sure Node.js is properly installed:
   ```bash
   node --version
   ```

2. Try updating npm:
   ```bash
   npm update -g npm
   ```

3. If permission errors occur, try:
   ```bash
   sudo npm install -g sanskrit-lang
   ```

### Running Programs

- Make sure your file has the `.sns` extension
- Check that the file is saved with UTF-8 encoding
- Verify that all Sanskrit keywords are correctly typed in Devanagari

## Getting Help

- Check the [documentation](https://sh20raj.github.io/sanskrit/docs)
- Open an issue on [GitHub](https://github.com/sh20raj/sanskrit/issues)
- Join our community discussions
