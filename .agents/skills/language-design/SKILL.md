---
name: language-design
description: Guides decisions on Sanskrit Next syntax, dual-script keywords, type system semantics, and language ergonomics.
---

# Sanskrit Next Language Design Skill

## Purpose
Ensures all syntactic, grammatical, and semantic language extensions maintain Sanskrit Next's core design philosophy: mathematical precision, dual-script invariance (Devanagari + ASCII), zero-cost abstractions, and linguistic consistency.

## When to Use
- Proposing or modifying language keywords, operators, or syntax grammar.
- Adding or modifying standard type system rules.
- Reviewing RFCs related to syntax or semantics.

## Decision Tree
1. Does the proposal have an authentic Sanskrit grammatical root (*dhātu*)?
   - If NO: Reject or refine etymology with classical Paninian terminology.
2. Does the proposal have an exact 1-to-1 canonical ASCII / Latin alias?
   - If NO: Require an ASCII alias to preserve dual-script invariance.
3. Does the feature impose hidden runtime costs (e.g. dynamic type checks in hot paths)?
   - If YES: Redesign to be statically verifiable or require explicit opt-in.

## Mandatory Checks
- Verify `docs/design/language-naming.md` for naming consistency.
- Ensure RFC is filed under `docs/rfc/` before altering grammar.
- Verify AST and Lexer tokens support both representations identically.

## Forbidden Shortcuts
- Never add Devanagari-only or ASCII-only keywords without dual support.
- Never add implicit narrowing type coercions.

## Validation Commands
```bash
cargo test -p sanskrit-lexer
cargo test -p sanskrit-parser
```
