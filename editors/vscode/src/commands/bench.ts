import * as vscode from 'vscode';
import { ProcessRunner } from '../process';

export async function runBenchmarks(): Promise<void> {
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Running Sanskrit Next performance benchmark suite...',
      cancellable: false,
    },
    async () => {
      const res = await ProcessRunner.execute(['bench'], undefined, true);
      if (res.code === 0) {
        vscode.window.showInformationMessage('Sanskrit benchmark suite completed.');
      } else {
        vscode.window.showErrorMessage('Failed to execute benchmark suite.');
      }
    }
  );
}
