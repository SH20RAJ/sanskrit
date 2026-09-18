import * as vscode from 'vscode';

export class SanskritCompletionItemProvider implements vscode.CompletionItemProvider {
  public provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
    _context: vscode.CompletionContext
  ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    const linePrefix = document.lineAt(position).text.substring(0, position.character);
    const items: vscode.CompletionItem[] = [];

    // 1. Dual-Script Keywords
    items.push(
      this.createItem('कार्य', vscode.CompletionItemKind.Keyword, '(keyword) कार्य [fn]', 
        'Declares a function definition in canonical Devanagari.\n\n```sanskrit\nकार्य <नाम>(<मापदण्ड>): <प्रत्यागम_प्रकार>:\n    <शरीरम्>\n```',
        'कार्य ${1:नाम}(${2:मापदण्ड}): ${3:सूत्र} :\n\t${0}'),
      this.createItem('fn', vscode.CompletionItemKind.Keyword, '(keyword) fn [कार्य]', 
        'Declares a function definition in Latin script.\n\n```sanskrit\nfn <name>(<params>): <return_type>:\n    <body>\n```',
        'fn ${1:name}(${2:params}): ${3:str} :\n\t${0}'),
      this.createItem('मान', vscode.CompletionItemKind.Keyword, '(keyword) मान [let]',
        'Declares a local variable binding with type inference.\n\n```sanskrit\nमान x = 10\n```',
        'मान ${1:चर} = ${2:मूल्य}'),
      this.createItem('let', vscode.CompletionItemKind.Keyword, '(keyword) let [मान]',
        'Declares a local variable binding with type inference.\n\n```sanskrit\nlet x = 10\n```',
        'let ${1:var} = ${2:value}'),
      this.createItem('स्थिर', vscode.CompletionItemKind.Keyword, '(keyword) स्थिर [const]',
        'Declares an immutable constant value.\n\n```sanskrit\nस्थिर पाई = 3.14159\n```',
        'स्थिर ${1:स्थिराङ्क} = ${2:मूल्य}'),
      this.createItem('const', vscode.CompletionItemKind.Keyword, '(keyword) const [स्थिर]',
        'Declares an immutable constant value.\n\n```sanskrit\nconst PI = 3.14159\n```',
        'const ${1:NAME} = ${2:value}'),
      this.createItem('यदि', vscode.CompletionItemKind.Keyword, '(keyword) यदि [if]',
        'Conditional branch statement.\n\n```sanskrit\nयदि प्रतिबन्ध:\n    ...\nअन्यथा:\n    ...\n```',
        'यदि ${1:प्रतिबन्ध}:\n\t${0}'),
      this.createItem('if', vscode.CompletionItemKind.Keyword, '(keyword) if [यदि]',
        'Conditional branch statement.\n\n```sanskrit\nif condition:\n    ...\nelse:\n    ...\n```',
        'if ${1:condition}:\n\t${0}'),
      this.createItem('अन्यथा', vscode.CompletionItemKind.Keyword, '(keyword) अन्यथा [else]',
        'Alternative branch for `यदि` conditional.',
        'अन्यथा:\n\t${0}'),
      this.createItem('else', vscode.CompletionItemKind.Keyword, '(keyword) else [अन्यथा]',
        'Alternative branch for `if` conditional.',
        'else:\n\t${0}'),
      this.createItem('यावत्', vscode.CompletionItemKind.Keyword, '(keyword) यावत् [while]',
        'Loop running while condition evaluates to true.',
        'यावत् ${1:प्रतिबन्ध}:\n\t${0}'),
      this.createItem('while', vscode.CompletionItemKind.Keyword, '(keyword) while [यावत्]',
        'Loop running while condition evaluates to true.',
        'while ${1:condition}:\n\t${0}'),
      this.createItem('प्रत्यागम', vscode.CompletionItemKind.Keyword, '(keyword) प्रत्यागम [return]',
        'Returns value from the enclosing function.',
        'प्रत्यागम ${0}'),
      this.createItem('return', vscode.CompletionItemKind.Keyword, '(keyword) return [प्रत्यागम]',
        'Returns value from the enclosing function.',
        'return ${0}'),
      this.createItem('आयात', vscode.CompletionItemKind.Keyword, '(keyword) आयात [import]',
        'Imports standard library modules or external packages.',
        'आयात ${1:std.core}'),
      this.createItem('import', vscode.CompletionItemKind.Keyword, '(keyword) import [आयात]',
        'Imports standard library modules or external packages.',
        'import ${1:std.core}')
    );

    // 2. Built-in Functions & Panics
    items.push(
      this.createItem('मुद्रण', vscode.CompletionItemKind.Function, '(builtin) मुद्रण(...args) [print]',
        'Prints formatted values to standard output with automatic newline.\n\n```sanskrit\nमुद्रण("मूल्य:", x)\n```',
        'मुद्रण(${1:सन्देश})'),
      this.createItem('print', vscode.CompletionItemKind.Function, '(builtin) print(...args) [मुद्रण]',
        'Prints formatted values to standard output with automatic newline.\n\n```sanskrit\nprint("value:", x)\n```',
        'print(${1:message})'),
      this.createItem('विफल', vscode.CompletionItemKind.Function, '(builtin) विफल(सन्देश: सूत्र) [panic]',
        'Aborts execution with an explicit panic and formatted diagnostic trace.\n\n```sanskrit\nविफल("अवैध मूल्यम्! Invalid value")\n```',
        'विफल("${1:सन्देश}")'),
      this.createItem('panic', vscode.CompletionItemKind.Function, '(builtin) panic(msg: str) [विफल]',
        'Aborts execution with an explicit panic and formatted diagnostic trace.\n\n```sanskrit\npanic("Fatal runtime exception")\n```',
        'panic("${1:message}")'),
      this.createItem('निश्चय', vscode.CompletionItemKind.Function, '(builtin) निश्चय(शर्त: तर्क, सन्देश: सूत्र) [assert]',
        'Validates an invariant condition; triggers `विफल` if condition is false.\n\n```sanskrit\nनिश्चय(x > 0, "x must be positive")\n```',
        'निश्चय(${1:शर्त}, "${2:सन्देश}")'),
      this.createItem('assert', vscode.CompletionItemKind.Function, '(builtin) assert(condition: bool, msg: str) [निश्चय]',
        'Validates an invariant condition; panics if condition is false.\n\n```sanskrit\nassert(x > 0, "x must be positive")\n```',
        'assert(${1:condition}, "${2:message}")'),
      this.createItem('अवकलन', vscode.CompletionItemKind.Function, '(builtin) अवकलन(f, x) [diff]',
        'Calculates exact derivative df/dx at point x via automatic differentiation.',
        'अवकलन(${1:फलन}, ${2:बिन्दु})'),
      this.createItem('diff', vscode.CompletionItemKind.Function, '(builtin) diff(f, x) [अवकलन]',
        'Calculates exact derivative df/dx at point x via forward-mode dual numbers.',
        'diff(${1:func}, ${2:point})'),
      this.createItem('प्रवणता', vscode.CompletionItemKind.Function, '(builtin) प्रवणता(f, x) [grad]',
        'Calculates full gradient vector ∇f at multi-dimensional point x.',
        'प्रवणता(${1:फलन}, ${2:दिश})'),
      this.createItem('grad', vscode.CompletionItemKind.Function, '(builtin) grad(f, x) [प्रवणता]',
        'Calculates full gradient vector ∇f at multi-dimensional point x.',
        'grad(${1:func}, ${2:tensor})')
    );

    // 3. Types (Devanagari + Latin)
    items.push(
      this.createItem('सूत्र', vscode.CompletionItemKind.TypeParameter, '(type) सूत्र [String]',
        'UTF-8 immutable zero-copy string slice primitive.'),
      this.createItem('str', vscode.CompletionItemKind.TypeParameter, '(type) str [सूत्र]',
        'UTF-8 immutable zero-copy string slice primitive.'),
      this.createItem('तर्क', vscode.CompletionItemKind.TypeParameter, '(type) तर्क [bool]',
        'Boolean logical type (`सत्यम्` / `true`, `असत्यम्` / `false`).'),
      this.createItem('bool', vscode.CompletionItemKind.TypeParameter, '(type) bool [तर्क]',
        'Boolean logical type (`true`, `false`).'),
      this.createItem('पूर्णाङ्क', vscode.CompletionItemKind.TypeParameter, '(type) पूर्णाङ्क [i32]',
        '32-bit signed two\'s complement integer.'),
      this.createItem('i32', vscode.CompletionItemKind.TypeParameter, '(type) i32 [पूर्णाङ्क]',
        '32-bit signed two\'s complement integer.'),
      this.createItem('दशमलव', vscode.CompletionItemKind.TypeParameter, '(type) दशमलव [f64]',
        '64-bit IEEE-754 double precision floating point.'),
      this.createItem('f64', vscode.CompletionItemKind.TypeParameter, '(type) f64 [दशमलव]',
        '64-bit IEEE-754 double precision floating point.'),
      this.createItem('f32', vscode.CompletionItemKind.TypeParameter, '(type) f32 [दशमलव-32]',
        '32-bit IEEE-754 single precision floating point.'),
      this.createItem('दिश', vscode.CompletionItemKind.Class, '(type) दिश[dtype, shape] [Tensor]',
        'First-class multi-dimensional strided tensor primitive with hardware acceleration.\n\n```sanskrit\nमान A: दिश[f32, 1024, 1024] = दिश.ones([1024, 1024])\n```',
        'दिश[${1:f32}, ${2:1024}, ${3:1024}]'),
      this.createItem('Tensor', vscode.CompletionItemKind.Class, '(type) Tensor[dtype, shape]',
        'First-class multi-dimensional strided tensor primitive.\n\n```sanskrit\nlet A: Tensor[f32, 1024, 1024] = Tensor.ones([1024, 1024])\n```',
        'Tensor[${1:f32}, ${2:1024}, ${3:1024}]')
    );

    // 4. Tensor Methods (when line ends with 'दिश.' or 'Tensor.' or '.')
    if (linePrefix.endsWith('दिश.') || linePrefix.endsWith('Tensor.') || linePrefix.endsWith('.')) {
      items.push(
        this.createItem('zeros', vscode.CompletionItemKind.Method, 'zeros(shape, dtype=f32)',
          'Allocates contiguous tensor populated with zeros.\n\n```sanskrit\nदिश.zeros([512, 512])\n```',
          'zeros([${1:512}, ${2:512}])'),
        this.createItem('ones', vscode.CompletionItemKind.Method, 'ones(shape, dtype=f32)',
          'Allocates contiguous tensor populated with ones.\n\n```sanskrit\nदिश.ones([1024, 1024])\n```',
          'ones([${1:1024}, ${2:1024}])'),
        this.createItem('randn', vscode.CompletionItemKind.Method, 'randn(shape, dtype=f32)',
          'Allocates tensor populated with standard normal Gaussian distribution N(0, 1).',
          'randn([${1:128}, ${2:128}])'),
        this.createItem('eye', vscode.CompletionItemKind.Method, 'eye(n, dtype=f32)',
          'Creates identity matrix of size n x n.',
          'eye(${1:128})'),
        this.createItem('shape', vscode.CompletionItemKind.Property, 'shape: [usize]',
          'Returns dimensions array of tensor.'),
        this.createItem('strides', vscode.CompletionItemKind.Property, 'strides: [usize]',
          'Returns memory stride layout of tensor dimensions.'),
        this.createItem('matmul', vscode.CompletionItemKind.Method, 'matmul(other) / @',
          'Hardware-accelerated cache-blocked matrix multiplication.',
          'matmul(${1:other})'),
        this.createItem('transpose', vscode.CompletionItemKind.Method, 'transpose()',
          'Returns transposed strided view with zero memory copy.',
          'transpose()'),
        this.createItem('reshape', vscode.CompletionItemKind.Method, 'reshape(new_shape)',
          'Reshapes tensor without altering backing memory buffer.',
          'reshape([${1:shape}])')
      );
    }

    // 5. Dynamic Document Symbols (Function names & parameters extracted from current document)
    const docText = document.getText();
    const funcRegex = /(?:कार्य|fn)\s+([a-zA-Z_\u0900-\u097F][a-zA-Z0-9_\u0900-\u097F]*)\s*\(([^)]*)\)/g;
    let m: RegExpExecArray | null;
    while ((m = funcRegex.exec(docText)) !== null) {
      const funcName = m[1];
      const params = m[2].trim();
      const item = new vscode.CompletionItem(funcName, vscode.CompletionItemKind.Function);
      item.detail = `कार्य ${funcName}(${params})`;
      item.documentation = new vscode.MarkdownString(`User-defined function in this document.\n\n\`\`\`sanskrit\nकार्य ${funcName}(${params})\n\`\`\``);
      item.insertText = new vscode.SnippetString(`${funcName}(\${0})`);
      items.push(item);
    }

    return items;
  }

  private createItem(
    label: string,
    kind: vscode.CompletionItemKind,
    detail: string,
    docMarkdown: string,
    snippet?: string
  ): vscode.CompletionItem {
    const item = new vscode.CompletionItem(label, kind);
    item.detail = detail;
    item.documentation = new vscode.MarkdownString(docMarkdown);
    if (snippet) {
      item.insertText = new vscode.SnippetString(snippet);
    }
    return item;
  }
}
