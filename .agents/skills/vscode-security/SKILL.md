---
name: vscode-security
description: Guides security hardening, workspace trust, sandbox execution, Content Security Policy (CSP), and command injection prevention in the Sanskrit Next VS Code extension.
---

# Sanskrit Next VS Code Extension Security Skill

## Purpose
Governs the security architecture and defensive programming standards for the Sanskrit Next VS Code extension platform, ensuring safe workspace execution, secure webview sandboxing, command injection defenses, and strict secret masking.

## When to Use
- Implementing or modifying CLI command execution in `editors/vscode/src/process.ts` or `src/commands/`.
- Creating or updating webview panels (Tensor Inspector, Benchmark Dashboard, Doctor Viewer).
- Handling Workspace Trust requirements for untrusted repositories.
- Managing telemetry, logging, and environment variables.

## Security Architecture & Policies

### 1. Workspace Trust Compliance
- Untrusted workspaces must **never** execute arbitrary code or trigger automatic builds/tests.
- In untrusted mode:
  - Language intelligence (LSP) runs in read-only / syntax-only mode if allowed, or is disabled.
  - Automatic task execution, formatting on save via external binary, and test discovery via execution are blocked.
  - Commands that spawn binaries prompt the user or fail gracefully with `vscode.workspace.isTrusted` checks.

### 2. Command Injection & Argument Escaping
- Never execute shell strings using `child_process.exec()` with user-controlled input.
- Always use `child_process.spawn()` with explicit argument arrays (`string[]`).
- Paths to files, compilers, or workspaces must be passed as distinct array arguments without shell interpolation.
- Sanitize and validate any custom toolchain path entered in `sanskrit.compilerPath`.

### 3. Webview Content Security Policy (CSP)
- Every webview must specify a strict `<meta http-equiv="Content-Security-Policy">` header.
- Allow scripts only with a unique per-session cryptographic nonce: `nonce-${nonce}`.
- Block `unsafe-inline` styles unless scoped, and block `unsafe-eval` completely.
- Resource loading must be constrained to `webview.asWebviewUri()` pointing within the extension directory.

### 4. Secret & Credential Sanitization
- Never leak environment tokens, auth tokens, or private paths into the output channel.
- Mask known sensitive variables (`AUTH_TOKEN`, `API_KEY`, `PASSWORD`, `SECRET`) before printing debug logs.

## Mandatory Checks
- Verify `isTrusted` check wraps any code execution or file generation command.
- Verify webview HTML includes nonce-based CSP:
  ```html
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}'; style-src ${webview.cspSource} 'unsafe-inline';">
  ```
- Ensure zero calls to `child_process.exec(cmdString)` without shell escaping.

## Forbidden Practices
- Never allow remote code execution from workspace configuration files without explicit user consent.
- Never download arbitrary remote binaries without SHA256 checksum verification against published release manifests.
- Never disable CSP in webview panels for convenience.
