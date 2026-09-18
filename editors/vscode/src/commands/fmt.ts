import * as vscode from 'vscode';
import { ProcessRunner } from '../process';

export async function formatDocument(uri?: vscode.Uri): Promise<void> {
  const targetUri = uri || vscode.window.activeTextEditor?.document.uri;
  if (!targetUri) {
    vscode.window.showErrorMessage('No Sanskrit file to format.');
    return;
  }

  const res = await ProcessRunner.execute(['fmt', targetUri.fsPath], undefined, false);
  if (res.code === 0) {
    vscode.window.showInformationMessage(`Formatted ${targetUri.fsPath.split('/').pop()}`);
  } else {
    vscode.window.showErrorMessage(`Formatting failed: ${res.stderr || res.stdout}`);
  }
}
