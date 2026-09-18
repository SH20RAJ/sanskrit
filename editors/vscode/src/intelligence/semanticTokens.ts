import * as vscode from 'vscode';

export const tokenTypes = [
  'keyword',
  'function',
  'parameter',
  'type',
  'class',
  'variable',
  'operator',
  'number',
  'string',
  'comment',
];

export const tokenModifiers = ['declaration', 'definition', 'defaultLibrary', 'readonly'];

export const semanticTokensLegend = new vscode.SemanticTokensLegend(tokenTypes, tokenModifiers);

const KEYWORDS = new Set([
  'यदि', 'अन्यथा', 'यावत्', 'प्रत्येक', 'प्रत्यागम',
  'कार्य', 'मान', 'स्थिर', 'प्रकार', 'गुण', 'प्रयोजयतु',
  'आयात', 'निर्यातः', 'संकुल', 'अतुल्यकालिक', 'प्रतीक्षते', 'आत्मा',
  'if', 'else', 'while', 'for', 'in', 'return', 'break', 'continue',
  'match', 'case', 'fn', 'let', 'const', 'mut', 'struct', 'trait',
  'impl', 'type', 'enum', 'import', 'export', 'mod', 'use', 'as',
  'from', 'pub', 'extern', 'async', 'await', 'spawn', 'channel', 'self', 'Self',
]);

const TYPES = new Set([
  'पूर्णाङ्क', 'दशमलव', 'तर्क', 'अक्षर', 'सूत्र', 'शून्यम्', 'संख्या',
  'दिश', 'Tensor', 'Dual', 'Grad', 'Tape', 'Matrix', 'Vector',
  'i8', 'i16', 'i32', 'i64', 'u8', 'u16', 'u32', 'u64',
  'f32', 'f64', 'bool', 'char', 'str', 'void',
]);

const BUILTINS = new Set([
  'मुद्रण', 'विफल', 'निश्चय', 'अवकलन', 'प्रवणता',
  'print', 'println', 'diff', 'grad', 'zeros', 'ones', 'randn', 'eye',
  'matmul', 'transpose', 'reshape', 'sum', 'mean', 'assert', 'panic',
]);

export class SanskritSemanticTokensProvider implements vscode.DocumentSemanticTokensProvider {
  public provideDocumentSemanticTokens(
    document: vscode.TextDocument,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.SemanticTokens> {
    const builder = new vscode.SemanticTokensBuilder(semanticTokensLegend);
    const text = document.getText();
    const lines = text.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip comment lines
      const commentIdx = line.indexOf('//');
      const effectiveLine = commentIdx >= 0 ? line.slice(0, commentIdx) : line;

      // Match function declarations: कार्य <name>(<params>) or fn <name>(<params>)
      const funcDeclMatch = effectiveLine.match(/(?:कार्य|fn)\s+([a-zA-Z_\u0900-\u097F][a-zA-Z0-9_\u0900-\u097F]*)/);
      if (funcDeclMatch && funcDeclMatch.index !== undefined) {
        const name = funcDeclMatch[1];
        const nameIdx = effectiveLine.indexOf(name, funcDeclMatch.index);
        if (nameIdx >= 0) {
          builder.push(i, nameIdx, name.length, tokenTypes.indexOf('function'), 1); // 1 = declaration
        }
      }

      // Match parameters with type annotations: (<name>: <type>) or <name>: <type>
      const paramRegex = /([a-zA-Z_\u0900-\u097F][a-zA-Z0-9_\u0900-\u097F]*)\s*:\s*([a-zA-Z_\u0900-\u097F][a-zA-Z0-9_\u0900-\u097F]*)/g;
      let paramMatch: RegExpExecArray | null;
      while ((paramMatch = paramRegex.exec(effectiveLine)) !== null) {
        const paramName = paramMatch[1];
        const typeName = paramMatch[2];

        // Ensure this isn't a keyword before marking as parameter
        if (!KEYWORDS.has(paramName)) {
          builder.push(
            i,
            paramMatch.index,
            paramName.length,
            tokenTypes.indexOf('parameter'),
            1 // declaration
          );
        }

        const typeIdx = effectiveLine.indexOf(typeName, paramMatch.index + paramName.length);
        if (typeIdx >= 0) {
          builder.push(i, typeIdx, typeName.length, tokenTypes.indexOf('type'), 0);
        }
      }

      // Match all words (keywords, types, builtins, function calls)
      const wordRegex = /[a-zA-Z_\u0900-\u097F][a-zA-Z0-9_\u0900-\u097F]*/g;
      let match: RegExpExecArray | null;
      while ((match = wordRegex.exec(effectiveLine)) !== null) {
        const word = match[0];
        const col = match.index;

        if (KEYWORDS.has(word)) {
          builder.push(i, col, word.length, tokenTypes.indexOf('keyword'), 0);
        } else if (BUILTINS.has(word)) {
          builder.push(
            i,
            col,
            word.length,
            tokenTypes.indexOf('function'),
            4 // 4 = defaultLibrary (1 << 2)
          );
        } else if (TYPES.has(word)) {
          builder.push(i, col, word.length, tokenTypes.indexOf('type'), 0);
        } else {
          // Check if followed by '(' -> function call
          const afterWord = effectiveLine.slice(col + word.length).trimStart();
          if (afterWord.startsWith('(')) {
            builder.push(i, col, word.length, tokenTypes.indexOf('function'), 0);
          }
        }
      }

      // Highlight operators like '@' and '!'
      const opRegex = /[@!]/g;
      let opMatch: RegExpExecArray | null;
      while ((opMatch = opRegex.exec(effectiveLine)) !== null) {
        builder.push(i, opMatch.index, 1, tokenTypes.indexOf('operator'), 0);
      }
    }

    return builder.build();
  }
}
