---
name: documentation
description: Guides technical writing, API reference generation, tutorial authoring, and documentation validation.
---

# Sanskrit Next Documentation Skill

## Purpose
Maintains clear, accurate, and comprehensive documentation across language guides, scientific computing tutorials, compiler internals, and standard library references.

## When to Use
- Writing or updating technical guides in `docs/`.
- Documenting standard library modules or compiler flags.
- Authoring tutorials and cookbook examples.

## Decision Tree
1. Does every Markdown document have valid frontmatter (`title`, `description`, `type`, `status`)?
   - If NO: Add structured frontmatter conforming to documentation standards.
2. Are code snippets validated and tested against the active compiler?
   - If NO: Ensure snippets compile cleanly with `sanskrit check`.

## Mandatory Checks
- Verify internal relative links are valid.
- Maintain single source of truth under `docs/`.

## Validation Commands
```bash
cargo run --bin sanskrit -- check examples/hello/main.skt
```
