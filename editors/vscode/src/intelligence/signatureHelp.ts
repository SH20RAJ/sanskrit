import * as vscode from 'vscode';

interface SignatureDef {
  label: string;
  doc: string;
  parameters: { label: string; doc: string }[];
}

const SIGNATURES: Record<string, SignatureDef> = {
  'विफल': {
    label: 'कार्य विफल(सन्देश: सूत्र)',
    doc: 'Aborts execution immediately with diagnostic panic message.',
    parameters: [{ label: 'सन्देश: सूत्र', doc: 'Diagnostic error message string' }],
  },
  'panic': {
    label: 'fn panic(message: str)',
    doc: 'Aborts execution immediately with diagnostic panic message.',
    parameters: [{ label: 'message: str', doc: 'Diagnostic error message string' }],
  },
  'निश्चय': {
    label: 'कार्य निश्चय(शर्त: तर्क, सन्देश: सूत्र)',
    doc: 'Validates boolean invariant condition. Triggers panic if false.',
    parameters: [
      { label: 'शर्त: तर्क', doc: 'Boolean condition that must be true' },
      { label: 'सन्देश: सूत्र', doc: 'Error message to emit if assertion fails' },
    ],
  },
  'assert': {
    label: 'fn assert(condition: bool, message: str)',
    doc: 'Validates boolean invariant condition. Triggers panic if false.',
    parameters: [
      { label: 'condition: bool', doc: 'Boolean condition that must be true' },
      { label: 'message: str', doc: 'Error message to emit if assertion fails' },
    ],
  },
  'मुद्रण': {
    label: 'कार्य मुद्रण(...सन्देश: [मूल्य])',
    doc: 'Streams formatted values to standard output.',
    parameters: [{ label: '...सन्देश: [मूल्य]', doc: 'Values or strings to print' }],
  },
  'print': {
    label: 'fn print(...message: [Value])',
    doc: 'Streams formatted values to standard output.',
    parameters: [{ label: '...message: [Value]', doc: 'Values or strings to print' }],
  },
  'अवकलन': {
    label: 'कार्य अवकलन(फलन: कार्य, बिन्दु: दशमलव) -> दशमलव',
    doc: 'Calculates exact derivative at point x.',
    parameters: [
      { label: 'फलन: कार्य', doc: 'Scalar mathematical function' },
      { label: 'बिन्दु: दशमलव', doc: 'Evaluation point x' },
    ],
  },
  'zeros': {
    label: 'दिश.zeros(shape: [usize], dtype: प्रकार = f32)',
    doc: 'Allocates contiguous tensor initialized with zeros.',
    parameters: [
      { label: 'shape: [usize]', doc: 'Dimensions array (e.g. [512, 512])' },
      { label: 'dtype: प्रकार', doc: 'Element datatype (default f32)' },
    ],
  },
  'ones': {
    label: 'दिश.ones(shape: [usize], dtype: प्रकार = f32)',
    doc: 'Allocates contiguous tensor initialized with ones.',
    parameters: [
      { label: 'shape: [usize]', doc: 'Dimensions array (e.g. [1024, 1024])' },
      { label: 'dtype: प्रकार', doc: 'Element datatype (default f32)' },
    ],
  },
};

export class SanskritSignatureHelpProvider implements vscode.SignatureHelpProvider {
  public provideSignatureHelp(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
    _context: vscode.SignatureHelpContext
  ): vscode.ProviderResult<vscode.SignatureHelp> {
    const line = document.lineAt(position).text.substring(0, position.character);

    // Find the last unmatched '(' before cursor
    const openParenIdx = line.lastIndexOf('(');
    if (openParenIdx === -1) {
      return null;
    }

    // Extract function name immediately preceding '('
    const beforeParen = line.substring(0, openParenIdx).trimEnd();
    const funcMatch = beforeParen.match(/([a-zA-Z_\u0900-\u097F][a-zA-Z0-9_\u0900-\u097F]*)$/);
    if (!funcMatch) {
      return null;
    }

    const funcName = funcMatch[1];
    const sigDef = SIGNATURES[funcName];

    const help = new vscode.SignatureHelp();
    help.activeSignature = 0;

    // Calculate parameter index by counting commas between '(' and position
    const paramsText = line.substring(openParenIdx + 1);
    const commas = (paramsText.match(/,/g) || []).length;
    help.activeParameter = commas;

    if (sigDef) {
      const sigInfo = new vscode.SignatureInformation(sigDef.label, new vscode.MarkdownString(sigDef.doc));
      for (const param of sigDef.parameters) {
        sigInfo.parameters.push(new vscode.ParameterInformation(param.label, new vscode.MarkdownString(param.doc)));
      }
      help.signatures = [sigInfo];
      return help;
    }

    // Dynamic fallback: scan current document for function definition
    const docText = document.getText();
    const defRegex = new RegExp(`(?:कार्य|fn)\\s+${funcName}\\s*\\(([^)]*)\\)`, 'g');
    const match = defRegex.exec(docText);
    if (match) {
      const rawParams = match[1].trim();
      const paramsList = rawParams.length > 0 ? rawParams.split(',').map((p) => p.trim()) : [];
      const sigInfo = new vscode.SignatureInformation(`कार्य ${funcName}(${rawParams})`, `User function defined in this file.`);
      for (const p of paramsList) {
        sigInfo.parameters.push(new vscode.ParameterInformation(p));
      }
      help.signatures = [sigInfo];
      return help;
    }

    return null;
  }
}
