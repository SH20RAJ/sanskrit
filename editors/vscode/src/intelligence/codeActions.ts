import * as vscode from 'vscode';

const LATIN_TO_DEVA: Record<string, string> = {
  'fn': 'कार्य',
  'let': 'मान',
  'const': 'स्थिर',
  'if': 'यदि',
  'else': 'अन्यथा',
  'while': 'यावत्',
  'for': 'प्रत्येक',
  'return': 'प्रत्यागम',
  'print': 'मुद्रण',
  'panic': 'विफल',
  'assert': 'निश्चय',
  'Tensor': 'दिश',
  'str': 'सूत्र',
  'bool': 'तर्क',
  'i32': 'पूर्णाङ्क',
  'f64': 'दशमलव',
  'true': 'सत्यम्',
  'false': 'असत्यम्',
};

const DEVA_TO_LATIN: Record<string, string> = {
  'कार्य': 'fn',
  'मान': 'let',
  'स्थिर': 'const',
  'यदि': 'if',
  'अन्यथा': 'else',
  'यावत्': 'while',
  'प्रत्येक': 'for',
  'प्रत्यागम': 'return',
  'मुद्रण': 'print',
  'विफल': 'panic',
  'निश्चय': 'assert',
  'दिश': 'Tensor',
  'सूत्र': 'str',
  'तर्क': 'bool',
  'पूर्णाङ्क': 'i32',
  'दशमलव': 'f64',
  'सत्यम्': 'true',
  'असत्यम्': 'false',
};

export class SanskritCodeActionProvider implements vscode.CodeActionProvider {
  public provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    _context: vscode.CodeActionContext,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {
    const actions: vscode.CodeAction[] = [];
    const selectedText = document.getText(range.isEmpty ? document.lineAt(range.start.line).range : range);

    // 1. Convert to Devanagari script Action
    const toDevaAction = new vscode.CodeAction(
      '𑖭 Convert Sanskrit keywords to Devanagari (देवनागरी)',
      vscode.CodeActionKind.RefactorRewrite
    );
    let convertedToDeva = selectedText;
    for (const [latin, deva] of Object.entries(LATIN_TO_DEVA)) {
      const regex = new RegExp(`\\b${latin}\\b`, 'g');
      convertedToDeva = convertedToDeva.replace(regex, deva);
    }
    if (convertedToDeva !== selectedText) {
      toDevaAction.edit = new vscode.WorkspaceEdit();
      toDevaAction.edit.replace(document.uri, range.isEmpty ? document.lineAt(range.start.line).range : range, convertedToDeva);
      actions.push(toDevaAction);
    }

    // 2. Convert to Latin script Action
    const toLatinAction = new vscode.CodeAction(
      '🔤 Convert Sanskrit keywords to Latin (ASCII)',
      vscode.CodeActionKind.RefactorRewrite
    );
    let convertedToLatin = selectedText;
    for (const [deva, latin] of Object.entries(DEVA_TO_LATIN)) {
      const regex = new RegExp(`(?<![\\w\\u0900-\\u097F])${deva}(?![\\w\\u0900-\\u097F])`, 'g');
      convertedToLatin = convertedToLatin.replace(regex, latin);
    }
    if (convertedToLatin !== selectedText) {
      toLatinAction.edit = new vscode.WorkspaceEdit();
      toLatinAction.edit.replace(document.uri, range.isEmpty ? document.lineAt(range.start.line).range : range, convertedToLatin);
      actions.push(toLatinAction);
    }

    return actions;
  }
}
