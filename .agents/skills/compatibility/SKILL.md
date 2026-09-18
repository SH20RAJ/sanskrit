---
name: compatibility
description: Guides legacy migration from Node.js prototype, cross-platform OS/architecture compatibility, and semantic versioning.
---

# Sanskrit Next Compatibility Skill

## Purpose
Manages backward compatibility policies, cross-platform validation (Linux, macOS, Windows, ARM64, x86_64), and migration assistance from the legacy Node.js prototype.

## When to Use
- Managing migration guides in `docs/migration/`.
- Verifying cross-platform compiler behavior across operating systems.
- Planning breaking changes or major semver bumps.

## Decision Tree
1. Does the change break existing Sanskrit Next stable APIs?
   - If YES: Require an RFC in `docs/rfc/` and bump the minor/major version accordingly.
2. Is the legacy Node.js code being accidentally imported or mixed into Sanskrit Next crates?
   - If YES: Reject. Legacy code is isolated to `legacy/v0.3` branch and GitHub release `v0.3.0-legacy`.

## Mandatory Checks
- Verify `docs/migration/legacy-to-next.md` is updated for any new syntax mappings.
- Ensure cross-platform CI matrix builds cleanly without OS-specific path assumptions.

## Validation Commands
```bash
cargo check --workspace
```
