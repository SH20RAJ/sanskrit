---
name: security
description: Guides security audits, package integrity verification, sandbox execution, FFI boundaries, and vulnerability scanning.
---

# Sanskrit Next Security Skill

## Purpose
Governs the security posture of the compiler, package manager, foreign function interface (FFI), and web playground, ensuring protection against supply-chain and memory vulnerabilities.

## When to Use
- Reviewing unsafe Rust blocks in compiler crates.
- Auditing package manager archive extraction and checksum verification.
- Validating FFI bindings and Python DLPack pointer boundaries.

## Decision Tree
1. Does any `unsafe` block exist without a detailed safety invariant comment?
   - If YES: Reject. Every unsafe block must explain why safe Rust cannot express it, the safety invariants, and how it is tested.
2. Does the package manager execute un-sandboxed pre-install or post-install scripts?
   - If YES: Reject. Package builds must be purely declarative.

## Mandatory Checks
- Verify package downloads enforce SHA-256 checksum matching.
- Run `cargo audit` in CI workflows.

## Validation Commands
```bash
cargo clippy --workspace --all-targets --all-features -- -D warnings
```
