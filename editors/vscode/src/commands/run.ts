import * as vscode from 'vscode';
import { ProcessRunner } from '../process';
import { CONFIG_KEYS } from '../constants';

export async function runSanskritFile(uri?: vscode.Uri): Promise<void> {
  const targetUri = uri || vscode.window.activeTextEditor?.document.uri;
  if (!targetUri) {
    vscode.window.showErrorMessage('No active Sanskrit file to run.');
    return;
  }

  const config = vscode.workspace.getConfiguration();
  const tier0 = config.get<boolean>(CONFIG_KEYS.TIER0, true);

  const args = ['run', targetUri.fsPath];
  if (tier0) {
    args.push('--tier0');
  }

  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Running ${targetUri.fsPath.split('/').pop()}...`,
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
