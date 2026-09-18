---
name: vscode-extension
description: Guides the architecture, lifecycle, command design, and UX of the Sanskrit Next VS Code extension platform.
---

# Sanskrit Next VS Code Extension Skill

## Purpose
Governs the architecture, UX, and integration of the Sanskrit Next VS Code extension, ensuring it operates as an orchestration and UI layer over native compiler services (LSP, DAP, CLI) without duplicating compiler logic.

## When to Use
- Developing or modifying extension components in `editors/vscode/`.
- Registering commands, views, status bar items, or configuration settings.
- Reviewing extension activation events and lifecycle management.

## Architecture & Principles
```
VS Code Extension Host (TypeScript)
       │
       ├──► LSP Client  ──(JSON-RPC / stdio)──► sanskrit lsp
       ├──► DAP Client  ──(DAP Protocol)─────► sanskrit-debug
       ├──► CLI Runner  ──(Structured JSON)──► sanskrit [build|check|bench|doctor]
       └──► Webview/UI  ──(Strict CSP)───────► Tensor Inspector / Benchmarks
```
- **Zero Embedded Compiler**: Never compile or analyze code inside TypeScript. Delegate all semantic analysis to `sanskrit lsp`.
- **Fast Activation**: Lazy-load all heavy components. Extension activation must complete in <50ms.

## Mandatory Checks
- Validate that all commands use structured CLI JSON (`--json` or `--message-format=json`) rather than parsing unstructured text.
- Ensure strict TypeScript (`noImplicitAny: true`, `strict: true`).
- Verify sensitive environment variables and tokens are masked from logs and output channels.

## Forbidden Shortcuts
- Never bundle the Sanskrit compiler binary directly inside the extension VSIX.
- Never block the extension host UI thread with synchronous process execution.
- Never write ad-hoc regex parsers to mimic compiler typechecking or syntax errors.

## Validation Commands
```bash
cd editors/vscode
npm run lint
npm run build
npm test
```
