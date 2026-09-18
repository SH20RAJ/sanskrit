import * as vscode from 'vscode';

export class SanskritDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
  public provideDocumentSymbols(
    document: vscode.TextDocument,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.DocumentSymbol[]> {
    const symbols: vscode.DocumentSymbol[] = [];
    const text = document.getText();
    const lines = text.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Match function: कार्य <name>(<params>) or fn <name>(<params>)
      const funcMatch = /(?:कार्य|fn)\s+([a-zA-Z_\u0900-\u097F][a-zA-Z0-9_\u0900-\u097F]*)\s*\(([^)]*)\)/.exec(line);
      if (funcMatch && funcMatch.index !== undefined) {
        const name = funcMatch[1];
        const params = funcMatch[2].trim();
        const startPos = new vscode.Position(i, funcMatch.index);
        const endPos = new vscode.Position(i, line.length);
        const range = new vscode.Range(startPos, endPos);

        const sym = new vscode.DocumentSymbol(
          name,
          params ? `(${params})` : '()',
          vscode.SymbolKind.Function,
          range,
          new vscode.Range(new vscode.Position(i, line.indexOf(name)), new vscode.Position(i, line.indexOf(name) + name.length))
        );
        symbols.push(sym);
      }

      // Match struct / record type: प्रकार <name> or struct <name>
      const structMatch = /(?:प्रकार|struct)\s+([a-zA-Z_\u0900-\u097F][a-zA-Z0-9_\u0900-\u097F]*)/.exec(line);
      if (structMatch && structMatch.index !== undefined) {
        const name = structMatch[1];
        const startPos = new vscode.Position(i, structMatch.index);
        const endPos = new vscode.Position(i, line.length);
        const range = new vscode.Range(startPos, endPos);

        const sym = new vscode.DocumentSymbol(
          name,
          'प्रकार (Type Definition)',
          vscode.SymbolKind.Struct,
          range,
          new vscode.Range(new vscode.Position(i, line.indexOf(name)), new vscode.Position(i, line.indexOf(name) + name.length))
        );
        symbols.push(sym);
      }

      // Match constant: स्थिर <name> or const <name>
      const constMatch = /(?:स्थिर|const)\s+([a-zA-Z_\u0900-\u097F][a-zA-Z0-9_\u0900-\u097F]*)/.exec(line);
      if (constMatch && constMatch.index !== undefined) {
        const name = constMatch[1];
        const startPos = new vscode.Position(i, constMatch.index);
        const endPos = new vscode.Position(i, line.length);
        const range = new vscode.Range(startPos, endPos);

        const sym = new vscode.DocumentSymbol(
          name,
          'स्थिर (Constant)',
          vscode.SymbolKind.Constant,
          range,
          new vscode.Range(new vscode.Position(i, line.indexOf(name)), new vscode.Position(i, line.indexOf(name) + name.length))
        );
        symbols.push(sym);
      }
    }

    return symbols;
  }
}
