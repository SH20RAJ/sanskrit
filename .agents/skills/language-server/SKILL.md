---
name: language-server
description: Guides the design, protocol compliance, crash recovery, and communication of the Sanskrit Language Server (sanskrit-lsp).
---

# Sanskrit Language Server Skill

## Purpose
Governs the implementation and client-side lifecycle of `sanskrit-lsp`, maintaining strict Language Server Protocol (LSP 3.17) adherence, fast incremental document synchronization, and resilient crash recovery.

## When to Use
- Implementing or updating LSP features in `crates/sanskrit-lsp/`.
- Managing the language client connection in `editors/vscode/src/lsp/`.
- Handling diagnostics, code actions, hover, completion, or semantic tokens.

## Architecture
- **Transport**: JSON-RPC over stdio (`sanskrit lsp`).
- **Synchronization**: Incremental document updates (`TextDocumentSyncKind.Incremental`).
- **Crash Recovery**: Auto-restarts up to 5 times before prompting user with `[Restart] [Show Logs] [Report Issue]`.

## Mandatory Checks
- Validate that diagnostics map exact byte/column spans from `sanskrit-diagnostics`.
- Verify completions support both Devanagari and ASCII aliases.
- Ensure document symbols cover modules, structs, traits, functions, and tests.

## Forbidden Shortcuts
- Never implement duplicate semantic indexing inside the VS Code TypeScript layer.
- Never crash the language server on malformed source; always recover gracefully.

## Validation Commands
```bash
cargo test -p sanskrit-lsp
```
