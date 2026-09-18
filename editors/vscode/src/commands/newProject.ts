import * as vscode from 'vscode';
import { ProcessRunner } from '../process';

export async function createNewProject(): Promise<void> {
  const name = await vscode.window.showInputBox({
    prompt: 'Enter Sanskrit Next project name',
    placeHolder: 'my_sanskrit_app',
    validateInput: (value) => {
      if (!value || !/^[a-zA-Z0-9_-]+$/.test(value)) {
        return 'Project name must contain only alphanumeric characters, underscores, or dashes.';
      }
      return null;
    },
  });

  if (!name) {
    return;
  }

  const workspaceFolders = vscode.workspace.workspaceFolders;
  const cwd = workspaceFolders?.[0]?.uri.fsPath;

  const res = await ProcessRunner.execute(['new', name], cwd, true);
  if (res.code === 0) {
    vscode.window.showInformationMessage(`Created new Sanskrit project: ${name}`);
  } else {
    vscode.window.showErrorMessage(`Failed to create project: ${res.stderr || res.stdout}`);
  }
}
