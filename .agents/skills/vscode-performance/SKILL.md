---
name: vscode-performance
description: Enforces low latency, instant activation, bundle optimization, and smooth UI performance for the Sanskrit VS Code extension.
---

# Sanskrit VS Code Performance Skill

## Purpose
Ensures the VS Code extension maintains lightweight resource utilization, sub-50ms activation latency, zero UI thread blocking, and responsive language intelligence (<100ms hover/completion).

## When to Use
- Auditing bundle sizes and ESBuild configurations.
- Optimizing extension activation and event listeners.
- Preventing memory leaks during continuous LSP synchronization.

## Targets & Constraints
- **Activation Time**: $\le 50\text{ ms}$ on modern hardware.
- **Bundle Size**: $\le 5\text{ MB}$ (no compiler binaries or large media embedded).
- **Completion & Hover**: Target $\le 100\text{ ms}$ response latency.
- **Memory**: Less than 40 MB RSS for the extension host process.

## Mandatory Checks
- Bundle all TypeScript source into a single minified `dist/extension.js` via esbuild.
- Defer non-critical view providers until explicit user interaction.

## Forbidden Shortcuts
- Never perform synchronous filesystem I/O (`fs.readFileSync`) on the UI thread during editing.
