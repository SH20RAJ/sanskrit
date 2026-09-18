# Contributing to Sanskrit Next VS Code Extension

Thank you for contributing to the Sanskrit Next extension for Visual Studio Code!

## Development Setup

1. Prerequisites:
   - Node.js >= 18.0.0
   - Rust toolchain (1.75+)
   - Sanskrit Next compiler (built via `cargo build --release` in the workspace root)

2. Install dependencies:
   ```bash
   cd editors/vscode
   npm install
   ```

3. Compile extension:
   ```bash
   npm run build
   ```

4. Run linter and typechecks:
   ```bash
   npm run lint
   ```

5. Launch in VS Code:
   - Press `F5` in VS Code to open an Extension Development Host window.
   - Open a `.skt` or `.sns` file to verify language features.

## Architecture Guidelines
- Keep TypeScript code focused on UI and VS Code integration.
- Never duplicate compiler or typechecker logic in TypeScript; always communicate through `sanskrit lsp`, DAP, or CLI JSON interfaces.
- Ensure all subprocess calls check `vscode.workspace.isTrusted`.
- Webviews must enforce strict Content Security Policy (CSP) with nonces.
