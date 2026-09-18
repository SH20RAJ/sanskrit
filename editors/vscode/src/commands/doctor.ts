import * as vscode from 'vscode';
import { ProcessRunner } from '../process';

export async function runDoctor(): Promise<void> {
  const res = await ProcessRunner.execute(['doctor'], undefined, true);
  if (res.code === 0) {
    vscode.window.showInformationMessage('Sanskrit Doctor: Core subsystems and toolchain operational.');
  } else {
    vscode.window.showWarningMessage('Sanskrit Doctor detected toolchain warnings. Check output.');
  }
}
