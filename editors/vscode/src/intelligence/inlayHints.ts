import * as vscode from 'vscode';
import { CONFIG_KEYS } from '../constants';

export class SanskritInlayHintsProvider implements vscode.InlayHintsProvider {
  public provideInlayHints(
    document: vscode.TextDocument,
    range: vscode.Range,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.InlayHint[]> {
    const config = vscode.workspace.getConfiguration();
    const showTypeHints = config.get<boolean>(CONFIG_KEYS.INLAY_TYPE_HINTS, true);
    const showParamHints = config.get<boolean>(CONFIG_KEYS.INLAY_PARAM_NAMES, true);

    const hints: vscode.InlayHint[] = [];
    const text = document.getText(range);
    const startLine = range.start.line;
    const lines = text.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      const lineNum = startLine + i;
      const line = lines[i];

      // Parameter hints
      if (showParamHints) {
        // Inlay hint for विफल("error message"): show "सन्देश: "
        const panicMatch = /विफल\s*\(([^)]+)\)/.exec(line);
        if (panicMatch && panicMatch.index !== undefined) {
          const argIdx = line.indexOf(panicMatch[1], panicMatch.index);
          hints.push(
            new vscode.InlayHint(
              new vscode.Position(lineNum, argIdx),
              'सन्देश: ',
              vscode.InlayHintKind.Parameter
            )
          );
        }

        // Inlay hint for panic("error message"): show "msg: "
        const asciiPanicMatch = /panic\s*\(([^)]+)\)/.exec(line);
        if (asciiPanicMatch && asciiPanicMatch.index !== undefined) {
          const argIdx = line.indexOf(asciiPanicMatch[1], asciiPanicMatch.index);
          hints.push(
            new vscode.InlayHint(
              new vscode.Position(lineNum, argIdx),
              'msg: ',
              vscode.InlayHintKind.Parameter
            )
          );
        }

        // Inlay hint for निश्चय(condition, msg): show "शर्त: " and "सन्देश: "
        const assertMatch = /निश्चय\s*\(([^,]+),\s*([^)]+)\)/.exec(line);
        if (assertMatch && assertMatch.index !== undefined) {
          const condIdx = line.indexOf(assertMatch[1], assertMatch.index);
          hints.push(
            new vscode.InlayHint(
              new vscode.Position(lineNum, condIdx),
              'शर्त: ',
              vscode.InlayHintKind.Parameter
            )
          );
          const msgIdx = line.indexOf(assertMatch[2], condIdx + assertMatch[1].length);
          hints.push(
            new vscode.InlayHint(
              new vscode.Position(lineNum, msgIdx),
              'सन्देश: ',
              vscode.InlayHintKind.Parameter
            )
          );
        }
      }

      // Type hints
      if (showTypeHints) {
        // Inferred type hint for variable bindings: मान x = 10 -> show ": पूर्णाङ्क"
        const intAssignMatch = /मान\s+([a-zA-Z_\u0900-\u097F][a-zA-Z0-9_\u0900-\u097F]*)\s*=\s*([०-९\d]+)\b(?!\.)/.exec(line);
        if (intAssignMatch && intAssignMatch.index !== undefined) {
          const varName = intAssignMatch[1];
          const varEndIdx = line.indexOf(varName, intAssignMatch.index) + varName.length;
          hints.push(
            new vscode.InlayHint(
              new vscode.Position(lineNum, varEndIdx),
              ': पूर्णाङ्क',
              vscode.InlayHintKind.Type
            )
          );
        }

        // Inferred type hint for string bindings: मान x = "hello" -> show ": सूत्र"
        const strAssignMatch = /मान\s+([a-zA-Z_\u0900-\u097F][a-zA-Z0-9_\u0900-\u097F]*)\s*=\s*"/.exec(line);
        if (strAssignMatch && strAssignMatch.index !== undefined) {
          const varName = strAssignMatch[1];
          const varEndIdx = line.indexOf(varName, strAssignMatch.index) + varName.length;
          hints.push(
            new vscode.InlayHint(
              new vscode.Position(lineNum, varEndIdx),
              ': सूत्र',
              vscode.InlayHintKind.Type
            )
          );
        }
      }
    }

    return hints;
  }
}
