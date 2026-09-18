import * as vscode from 'vscode';
import { ProcessRunner } from '../process';
import { CONFIG_KEYS } from '../constants';
import { SanskritTerminalManager } from '../terminal';

/**
 * Primary command to run the active Sanskrit file.
 * By default executes in the integrated Sanskrit VM terminal for interactive output,
 * with fallback to output channel if configured.
 */
export async function runSanskritFile(uri?: vscode.Uri): Promise<void> {
  const targetUri = uri || vscode.window.activeTextEditor?.document.uri;
  if (!targetUri) {
    vscode.window.showErrorMessage('No active Sanskrit file to run.');
    return;
  }

  const config = vscode.workspace.getConfiguration();
  const runInTerminal = config.get<boolean>(CONFIG_KEYS.EXEC_RUN_IN_TERMINAL, true);

  if (runInTerminal) {
    await SanskritTerminalManager.runFileInTerminal(targetUri);
    return;
  }

  // Fallback to background process execution in Output Channel
  const tier0 = config.get<boolean>(CONFIG_KEYS.TIER0, true);
  const args = ['run', targetUri.fsPath];
  if (tier0) {
    args.push('--tier0');
  }

  const fileName = targetUri.fsPath.split('/').pop() || 'file.skt';

  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Running ${fileName}...`,
      cancellable: false,
    },
    async () => {
      const res = await ProcessRunner.execute(args, undefined, true);
      if (res.code === 0) {
        vscode.window.showInformationMessage(`Sanskrit execution completed successfully.`);
      } else {
        vscode.window.showErrorMessage(`Sanskrit execution failed. See output channel for details.`);
      }
    }
  );
}

/**
 * Explicitly runs the active Sanskrit file inside the integrated terminal.
 */
export async function runSanskritInTerminal(uri?: vscode.Uri): Promise<void> {
  await SanskritTerminalManager.runFileInTerminal(uri);
}

/**
 * Runs the highlighted/selected block of Sanskrit code inside the integrated terminal.
 */
export async function runSanskritSelectionInTerminal(): Promise<void> {
  await SanskritTerminalManager.runSelectionInTerminal();
}

/**
 * Prompts for custom flags/arguments and runs the active file in the terminal.
 */
export async function runSanskritWithArgs(uri?: vscode.Uri): Promise<void> {
  await SanskritTerminalManager.runWithCustomArgs(uri);
}
