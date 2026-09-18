## Description

Provide a clear and concise description of what this pull request accomplishes, why it is needed, and how it was implemented.

Fixes #(issue) / Related to #(issue)

---

## Type of Change

Please select the relevant option(s):

- [ ] :bug: Bug fix (non-breaking change fixing an issue)
- [ ] :sparkles: New feature (non-breaking change adding functionality)
- [ ] :zap: Performance optimization (compiler pass, VM, or tensor kernel speedup)
- [ ] :books: Documentation update (guides, RFCs, examples, or docstrings)
- [ ] :hammer: Tooling / DevEx (CLI, LSP, DAP, VS Code extension, or CI/CD)
- [ ] :warning: Breaking change (fix or feature requiring an approved RFC in `docs/rfc/`)

---

## Checklist

Before requesting a review, please ensure all the following checks are complete:

- [ ] My code follows the [Contribution Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md).
- [ ] I have run `cargo test --workspace` and all tests pass with zero failures.
- [ ] I have run `cargo fmt --all -- --check` and `cargo clippy --workspace --all-targets -- -D warnings`.
- [ ] If modifying the VS Code extension, `npm run lint` and `npm run build` in `editors/vscode` pass with 0 errors.
- [ ] I have added automated tests verifying my changes.
- [ ] I have updated documentation and docstrings where appropriate.
- [ ] If this introduces new keywords or syntax, it strictly preserves **dual-script invariance** (Devanagari and ASCII).
- [ ] Zero runtime Node.js or npm dependencies introduced into `crates/`.
- [ ] Safe Rust is maintained (any `unsafe` block includes an explicit `// SAFETY:` invariant comment).

---

## Verification & Screenshots (if applicable)

```bash
# Paste output of cargo test --workspace or sanskrit run here
```
