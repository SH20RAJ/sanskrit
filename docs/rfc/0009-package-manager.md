# RFC 0009: Sanskrit Native Package Manager Specification

- **Status**: Accepted
- **Author**: Sanskrit Language Architecture Team
- **Created**: 2026-09-18
- **Category**: Tooling & Package Management

---

## 1. Problem
Traditional package managers (npm, pip) suffer from nondeterministic resolution, unbounded script execution during installs, supply-chain vulnerabilities, and deep recursive dependency bloat.

## 2. Decision
Sanskrit Next integrates a native, zero-dependency package manager directly into the `sanskrit` CLI:
- **Manifest**: `Sanskrit.toml` (declaring metadata, dependencies, targets, compilation flags).
- **Lockfile**: `Sanskrit.lock` (pinning exact Git commits, registry releases, and cryptographic SHA-256 hashes).
- **Build Isolation**: Zero network access during compilation; dependencies are pre-fetched into a global content-addressed cache (`~/.sanskrit/cache/`).
- **Reproducible Artifacts**: Every compilation pass outputs deterministic binary hashes given the same input source and lockfile.

### Manifest Example (`Sanskrit.toml`)
```toml
[package]
name = "matrix_ai"
version = "0.1.0"
authors = ["Sanskrit Architecture Team"]
edition = "2026"
license = "Apache-2.0"

[dependencies]
sanskrit-linalg = { version = "1.2.0" }
sanskrit-nn = { git = "https://github.com/SH20RAJ/sanskrit-nn", tag = "v0.5.0" }

[targets]
default = "native"
```
