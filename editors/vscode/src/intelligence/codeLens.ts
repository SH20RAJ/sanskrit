import * as vscode from 'vscode';
import { COMMANDS } from '../constants';

export class SanskritCodeLensProvider implements vscode.CodeLensProvider {
  public provideCodeLenses(
    document: vscode.TextDocument,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CodeLens[]> {
    const lenses: vscode.CodeLens[] = [];
    const text = document.getText();
    const lines = text.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Match functions: कार्य मुख्य or fn main
      const funcMatch = /(?:कार्य|fn)\s+([a-zA-Z_\u0900-\u097F][a-zA-Z0-9_\u0900-\u097F]*)/.exec(line);
      if (funcMatch) {
        const funcName = funcMatch[1];
        const range = new vscode.Range(i, 0, i, line.length);

        // Run Function Lens
        lenses.push(
          new vscode.CodeLens(range, {
            title: `▷ Run ${funcName}`,
            tooltip: `Execute file containing ${funcName} with Sanskrit VM`,
            command: COMMANDS.RUN,
            arguments: [document.uri],
          })
        );

        // Benchmark Lens
        lenses.push(
          new vscode.CodeLens(range, {
            title: `⏱ Benchmark`,
            tooltip: `Run performance benchmark suite on ${funcName}`,
            command: COMMANDS.BENCH,
          })
        );
      }
    }

    return lenses;
  }
}
