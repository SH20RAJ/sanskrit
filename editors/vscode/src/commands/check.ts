import * as vscode from 'vscode';
import { ProcessRunner } from '../process';

export async function checkSanskritFile(uri?: vscode.Uri): Promise<void> {
  const targetUri = uri || vscode.window.activeTextEditor?.document.uri;
  if (!targetUri) {
    vscode.window.showErrorMessage('No active Sanskrit file to check.');
    return;
  }

  const res = await ProcessRunner.execute(['check', targetUri.fsPath], undefined, true);
  if (res.code === 0) {
    vscode.window.showInformationMessage(`✓ Sanskrit check: No syntax or type errors found.`);
  } else {
    vscode.window.showErrorMessage(`✕ Sanskrit check: Errors found. Inspect output for details.`);
  }
}
