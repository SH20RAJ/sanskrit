import * as vscode from 'vscode';
import { ProcessRunner } from '../process';

export async function inspectEnvironment(): Promise<void> {
  const res = await ProcessRunner.execute(['env', '--json'], undefined, false);
  if (res.code === 0 && res.stdout) {
    try {
      const parsed = JSON.parse(res.stdout);
      const items = [
        `Version: ${parsed.sanskrit_version}`,
        `OS / Arch: ${parsed.os} / ${parsed.arch}`,
        `Runtime Tier: ${parsed.runtime_tier}`,
        `Edition: Rust ${parsed.rust_edition}`,
        `Features: ${(parsed.features || []).join(', ')}`,
      ];
      vscode.window.showQuickPick(items, {
        placeHolder: 'Sanskrit Next Runtime & Environment Telemetry',
      });
      return;
    } catch {
      // Fallback to output channel
    }
  }

  // Fallback
  await ProcessRunner.execute(['env'], undefined, true);
}
