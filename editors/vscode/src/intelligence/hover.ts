import * as vscode from 'vscode';

const HOVER_DICTIONARY: Record<string, { title: string; signature: string; description: string; example: string }> = {
  'कार्य': {
    title: 'कार्य (Function Definition)',
    signature: 'कार्य <नाम>(<मापदण्ड>): <प्रत्यागम_प्रकार>',
    description: 'Declares a pure, high-performance function in Sanskrit Next. Zero-overhead call conventions with optional inlining.',
    example: 'कार्य विफल(सन्देश: सूत्र) :\n    मुद्रण("विपत्ति:", सन्देश)',
  },
  'fn': {
    title: 'fn (Function Definition - ASCII)',
    signature: 'fn <name>(<params>): <return_type>',
    description: 'ASCII alias for `कार्य`. Guaranteed 100% AST and ABI equivalence.',
    example: 'fn panic(message: str) :\n    print("Panic:", message)',
  },
  'विफल': {
    title: 'विफल (Panic Handler)',
    signature: 'कार्य विफल(सन्देश: सूत्र) -> !',
    description: 'Terminates execution safely with an unrecoverable runtime diagnostic and stack snapshot.',
    example: 'विफल("अवैध मानम् / Invalid value encountered")',
  },
  'panic': {
    title: 'panic (Panic Handler - ASCII)',
    signature: 'fn panic(message: str) -> !',
    description: 'ASCII alias for `विफल`. Terminates execution with formatted diagnostic message.',
    example: 'panic("Critical assertion failed")',
  },
  'निश्चय': {
    title: 'निश्चय (Assertion Guard)',
    signature: 'कार्य निश्चय(शर्त: तर्क, सन्देश: सूत्र)',
    description: 'Evaluates logical assertion `शर्त`. If false, invokes `विफल(सन्देश)`. In release mode, optimized via branch predictor hints.',
    example: 'निश्चय(क > ०, "क must be strictly positive")',
  },
  'assert': {
    title: 'assert (Assertion Guard - ASCII)',
    signature: 'fn assert(condition: bool, message: str)',
    description: 'ASCII alias for `निश्चय`. Validates program invariant.',
    example: 'assert(x > 0, "x must be positive")',
  },
  'मुद्रण': {
    title: 'मुद्रण (Standard Output Print)',
    signature: 'कार्य मुद्रण(...args: [मूल्य])',
    description: 'Formats and streams arguments to stdout using zero-allocation buffered output.',
    example: 'मुद्रण("परिणाम:", परिणाम)',
  },
  'print': {
    title: 'print (Standard Output Print - ASCII)',
    signature: 'fn print(...args: [Value])',
    description: 'ASCII alias for `मुद्रण`. Streams values directly to stdout.',
    example: 'print("Result:", result)',
  },
  'मान': {
    title: 'मान (Variable Binding)',
    signature: 'मान <चर> = <मूल्य>',
    description: 'Declares a local variable binding with type inference and deterministic RAII scope management.',
    example: 'मान क = १०',
  },
  'let': {
    title: 'let (Variable Binding - ASCII)',
    signature: 'let <var> = <value>',
    description: 'ASCII alias for `मान`. Declares local variable binding.',
    example: 'let x = 10',
  },
  'स्थिर': {
    title: 'स्थिर (Constant Declaration)',
    signature: 'स्थिर <स्थिराङ्क> = <मूल्य>',
    description: 'Declares a compile-time immutable constant evaluated during constant propagation passes.',
    example: 'स्थिर पाई = ३.१४१५९',
  },
  'const': {
    title: 'const (Constant Declaration - ASCII)',
    signature: 'const <NAME> = <value>',
    description: 'ASCII alias for `स्थिर`. Declares compile-time constant.',
    example: 'const PI = 3.14159',
  },
  'यदि': {
    title: 'यदि (Conditional Branch)',
    signature: 'यदि <प्रतिबन्ध>:',
    description: 'Executes block when boolean condition evaluates to true.',
    example: 'यदि !शर्त:\n    विफल(सन्देश)',
  },
  'if': {
    title: 'if (Conditional Branch - ASCII)',
    signature: 'if <condition>:',
    description: 'ASCII alias for `यदि`. Branch statement.',
    example: 'if !condition:\n    panic(message)',
  },
  'अन्यथा': {
    title: 'अन्यथा (Else Branch)',
    signature: 'अन्यथा:',
    description: 'Alternative branch for conditional statement when condition is false.',
    example: 'यदि क > ०:\n    मुद्रण("सकारात्मक")\nअन्यथा:\n    मुद्रण("नकारात्मक")',
  },
  'सूत्र': {
    title: 'सूत्र (String Slice Type)',
    signature: 'प्रकार सूत्र = &str',
    description: 'Immutable, UTF-8 validated zero-copy string slice.',
    example: 'मान नाम: सूत्र = "संस्कृतम्"',
  },
  'तर्क': {
    title: 'तर्क (Boolean Logical Type)',
    signature: 'प्रकार तर्क = bool',
    description: 'Single-byte logical truth value (`सत्यम्` / `true` or `असत्यम्` / `false`).',
    example: 'मान सक्रिय: तर्क = सत्यम्',
  },
  'पूर्णाङ्क': {
    title: 'पूर्णाङ्क (Signed 32-bit Integer)',
    signature: 'प्रकार पूर्णाङ्क = i32',
    description: '32-bit two\'s complement signed integer.',
    example: 'मान गणना: पूर्णाङ्क = ४२',
  },
  'दशमलव': {
    title: 'दशमलव (64-bit Floating Point)',
    signature: 'प्रकार दशमलव = f64',
    description: 'IEEE-754 double precision floating point number.',
    example: 'मान दर: दशमलव = ०.०१',
  },
  'दिश': {
    title: 'दिश (First-Class Tensor)',
    signature: 'प्रकार दिश[प्रकार, आयाम...]',
    description: 'Multi-dimensional strided tensor primitive. Supports hardware SIMD and Apple Silicon AMX / Metal GEMM acceleration.',
    example: 'मान A = दिश.ones([1024, 1024])\nमान C = A @ B',
  },
  'Tensor': {
    title: 'Tensor (First-Class Tensor - ASCII)',
    signature: 'type Tensor[dtype, dims...]',
    description: 'ASCII alias for `दिश`. High-performance strided multi-dimensional array.',
    example: 'let A = Tensor.ones([1024, 1024])\nlet C = A @ B',
  },
  'अवकलन': {
    title: 'अवकलन (Forward-Mode Automatic Differentiation)',
    signature: 'कार्य अवकलन(फलन, बिन्दु) -> दशमलव',
    description: 'Computes exact derivative df/dx at point x via forward-mode dual numbers without numerical instability.',
    example: 'मान slope = अवकलन(f, 3.0)',
  },
};

export class SanskritHoverProvider implements vscode.HoverProvider {
  public provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    const range = document.getWordRangeAtPosition(position, /[a-zA-Z_\u0900-\u097F][a-zA-Z0-9_\u0900-\u097F]*/);
    if (!range) {
      return null;
    }

    const word = document.getText(range);
    const entry = HOVER_DICTIONARY[word];
    if (entry) {
      const md = new vscode.MarkdownString();
      md.appendMarkdown(`### ${entry.title}\n\n`);
      md.appendCodeblock(entry.signature, 'sanskrit');
      md.appendMarkdown(`\n${entry.description}\n\n`);
      md.appendMarkdown(`**Example:**\n`);
      md.appendCodeblock(entry.example, 'sanskrit');
      return new vscode.Hover(md, range);
    }

    // Check if it's a function defined in current document
    const docText = document.getText();
    const regex = new RegExp(`(?:कार्य|fn)\\s+${word}\\s*\\(([^)]*)\\)\\s*(?::\\s*([a-zA-Z_\\u0900-\\u097F][^:\\n{]*))?`, 'g');
    const match = regex.exec(docText);
    if (match) {
      const params = match[1].trim();
      const ret = match[2] ? match[2].trim() : 'void';
      const md = new vscode.MarkdownString();
      md.appendMarkdown(`### कार्य ${word}\n\n`);
      md.appendCodeblock(`कार्य ${word}(${params}): ${ret}`, 'sanskrit');
      md.appendMarkdown('\n*User-defined function in this document.*');
      return new vscode.Hover(md, range);
    }

    return null;
  }
}
