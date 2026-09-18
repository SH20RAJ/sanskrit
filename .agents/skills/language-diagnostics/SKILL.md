---
name: language-diagnostics
description: Guides compiler diagnostic reporting, multi-span errors, suggestions, hints, error codes, and JSON output.
---

# Sanskrit Next Language Diagnostics Skill

## Purpose
Ensures compiler diagnostics maintain gold-standard developer experience: human-readable, actionable, multi-span errors with ASCII/Unicode carets, distinct error codes, and structured JSON output.

## When to Use
- Emitting syntax, type, borrow, or shape errors in compiler passes.
- Adding error recovery or contextual fix suggestions.
- Modifying `crates/sanskrit-diagnostics`.

## Decision Tree
1. Does the error message clearly explain *what* failed, *where* it failed, and *why*?
   - If NO: Enrich diagnostic with primary span, label, and secondary explanation.
2. Is there an actionable suggestion?
   - If YES: Attach a `help:` or `suggestion:` block to guide the developer.

## Mandatory Checks
- Verify error code conforms to `S[1-9][0-9]{3}` format (e.g. `error[S1007]`).
- Validate machine-readable JSON diagnostic format for IDE integration.

## Validation Commands
```bash
cargo test -p sanskrit-diagnostics
```
