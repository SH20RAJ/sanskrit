import * as vscode from 'vscode';
import { ToolchainManager } from '../toolchain';

export async function startRepl(): Promise<void> {
  const toolchain = await ToolchainManager.getToolchain();
  if (!toolchain) {
    return;
  }

  const terminal = vscode.window.createTerminal({
    name: 'Sanskrit Next REPL',
    shellPath: toolchain.path,
    shellArgs: ['repl'],
  });

  terminal.show();
}
