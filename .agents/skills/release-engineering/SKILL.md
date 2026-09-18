---
name: release-engineering
description: Guides release builds, cross-compilation, SHA256 checksum generation, GitHub Releases, and zero-dependency installer distribution.
---

# Sanskrit Next Release Engineering Skill

## Purpose
Governs the creation of deterministic, cross-compiled release binaries, standalone shell installer scripts (`install.sh`), toolchain updater (`sanskritup`), and automated GitHub Actions workflows.

## When to Use
- Preparing semver version tags and GitHub Releases.
- Modifying GitHub Actions workflows in `.github/workflows/`.
- Updating `install.sh` or `sanskritup`.

## Decision Tree
1. Does the published release require users to install Node.js, Python, or Rust?
   - If YES: Reject. Release binaries must be self-contained native executables.
2. Are cryptographic SHA-256 checksums generated for all distribution archives?
   - If NO: Generate and verify `SHA256SUMS` prior to release publication.

## Mandatory Checks
- Verify `install.sh` syntax with `sh -n install.sh`.
- Test cross-compilation matrix across Linux, macOS, and Windows.

## Validation Commands
```bash
sh -n install.sh
cargo check --workspace --release
```
