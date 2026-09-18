---
name: vscode-release
description: Guides packaging, versioning, Marketplace publishing, OpenVSX distribution, and automated CI release workflows for the Sanskrit Next VS Code extension.
---

# Sanskrit Next VS Code Extension Release Engineering Skill

## Purpose
Governs the build, bundle, verification, packaging, and distribution pipelines for the Sanskrit Next VS Code extension (`editors/vscode/`), targeting both the Visual Studio Marketplace and the Open VSX Registry.

## When to Use
- Preparing a release or tag of the VS Code extension.
- Updating `package.json` manifest metadata, engine compatibility, or icon assets.
- Modifying the GitHub Actions release workflow (`.github/workflows/vscode-release.yml`).
- Generating and validating `.vsix` packages with `@vscode/vsce`.

## Extension Packaging Standards

### 1. Build & Bundle
- The extension must be bundled with `esbuild` for minimal package size and near-instant load time.
- Node.js dependencies in `node_modules` must either be bundled into `dist/extension.js` or externalized if provided by VS Code runtime.
- Target VS Code engine: `^1.85.0` or higher.
- Source maps should be generated for release error tracing (`dist/extension.js.map`).

### 2. Manifest Verification
- `publisher`: Must match the verified publisher ID (e.g. `sanskrit-lang` or maintainer account).
- `name`: `sanskrit-vscode`
- `displayName`: `Sanskrit Next`
- `icon`: 128x128 or 256x256 PNG or SVG icon adhering to visual guidelines.
- `categories`: `["Programming Languages", "Linters", "Formatters", "Debuggers", "Testing"]`
- `badges`: CI status, Marketplace version, Discord/Community links.
- `repository`: `https://github.com/SH20RAJ/sanskrit`

### 3. Verification Commands
```bash
cd editors/vscode
npm run lint
npm run build
npm test
npx @vscode/vsce package --no-git-tag-version
```

### 4. Continuous Deployment Workflow
- The `.github/workflows/vscode-release.yml` triggers on tags matching `vscode-v*` or `v*` with extension changes.
- Automatically creates release artifacts (`.vsix`) with SHA256 checksums.
- Publishes to VS Code Marketplace using `VSCE_PAT` and Open VSX using `OVSX_PAT`.
- Attaches the `.vsix` package to the GitHub Release.

## Forbidden Practices
- Never commit `.vsix` binary files into the git repository.
- Never publish extensions containing unminified development code or extraneous test fixtures.
- Never publish without checking `npm run lint` and `npm test`.
