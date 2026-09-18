---
name: vscode-testing
description: Guides the integration of VS Code Testing API with the Sanskrit test runner.
---

# Sanskrit VS Code Testing Skill

## Purpose
Governs the discovery, execution, status reporting, and debugging of unit, integration, and golden tests within VS Code's native Test Explorer.

## When to Use
- Implementing or extending the Test Controller in `editors/vscode/src/testing/`.
- Integrating test discovery for `.skt` test suites in `tests/` and workspace projects.
- Reporting test execution times, assertions, and stack traces.

## Architecture
- Uses `vscode.tests.createTestController("sanskritTests", "Sanskrit Tests")`.
- Discovers tests by scanning workspace `tests/` directories or parsing `#[test]` / `परीक्षण` items.
- Executes tests via `sanskrit test --json` and feeds structured test items back to the VS Code Test UI.

## Mandatory Checks
- Verify tests report duration in milliseconds.
- Check that failed test items display exact diagnostic failure messages and clickable source links.

## Forbidden Shortcuts
- Never parse unstructured human text when machine-readable JSON is emitted.
