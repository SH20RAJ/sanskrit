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
- Node.js (version 18 or higher)

## Installation

You can install the Sanskrit programming language through either of two supported methods:

### Option 1: Via npm (Global Install)

```bash
npm install -g sanskrit-lang
```

### Option 2: Standalone Bash Installer (Without npm)

```bash
curl -fsSL https://raw.githubusercontent.com/SH20RAJ/sanskrit/main/install.sh | bash
```

Verify your installation:
```bash
sanskrit --version
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

Output:
```
नमस्ते विश्व!
```

## Basic Concepts

### 1. Variables and Constants

```sanskrit
// Variables
चर संदेश = "शुभ प्रभात";
संदेश = "शुभ संध्या";

// Constants
स्थिर पाई = ३.१४१५९;
```

### 2. Functions

Functions are declared using the `कार्य` keyword and return values with `प्रत्यागम`:

```sanskrit
कार्य योग(क, ख) {
    प्रत्यागम क + ख;
}

मुद्रण(योग(१०, २०));  // Outputs: ३०
```

### 3. Strings & Unicode

Strings support both Devanagari and Latin scripts:

```sanskrit
मुद्रण("संस्कृत भाषा");        // Sanskrit text
मुद्रण("Sanskrit Language");   // Latin text
```

### 4. Numbers

Supports both Devanagari (`०-९`) and Arabic (`0-9`) numerals:

```sanskrit
मुद्रण(१ + २);      // Using Devanagari numerals -> ३
मुद्रण(1 + 2);      // Using Arabic numerals -> ३
```

## Command Line Interface

The Sanskrit CLI provides commands for running, checking, and interactive development:

```bash
# Execute a program
sanskrit run program.sns

# Validate syntax without running
sanskrit check program.sns

# Start the interactive REPL
sanskrit repl
```

## Next Steps

1. Check out the [Language Guide](../language-guide) for full syntax and features
2. Explore [Examples](../examples)
3. Join our [GitHub community](https://github.com/sh20raj/sanskrit)
