import * as vscode from 'vscode';
import { ProcessRunner } from '../process';

export async function buildSanskritProject(uri?: vscode.Uri): Promise<void> {
  const targetUri = uri || vscode.window.activeTextEditor?.document.uri;
  if (!targetUri) {
    vscode.window.showErrorMessage('No active Sanskrit file to build.');
    return;
  }

  const selection = await vscode.window.showQuickPick(
    [
      { label: 'Native Build', description: 'Compile to native binary executable' },
      { label: 'Emit MLIR Dialect', description: 'Lower SIR to Sanskrit MLIR dialect text (.mlir)' },
    ],
    { placeHolder: 'Select Sanskrit build target' }
  );

  if (!selection) {
    return;
  }

  const args = ['build', targetUri.fsPath];
  if (selection.label === 'Emit MLIR Dialect') {
    args.push('--emit-mlir');
  }

  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Building Sanskrit target...`,
      cancellable: false,
    },
    async () => {
      const res = await ProcessRunner.execute(args, undefined, true);
      if (res.code === 0) {
        vscode.window.showInformationMessage(`Build completed successfully.`);
      } else {
        vscode.window.showErrorMessage(`Build failed. See output channel for diagnostics.`);
      }
    }
  );
}
