import * as vscode from 'vscode';
import { PHONETIC_ENTRIES, transliterateToDevanagari } from './transliteration';

export class SanskritCompletionItemProvider implements vscode.CompletionItemProvider {
  public provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
    _context: vscode.CompletionContext
  ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    const linePrefix = document.lineAt(position).text.substring(0, position.character);
    const items: vscode.CompletionItem[] = [];

    // Extract currently typed word under cursor for phonetic transliteration
    const currentWordMatch = linePrefix.match(/([a-zA-Z_\u0900-\u097F]+)$/);
    const currentWord = currentWordMatch ? currentWordMatch[1] : '';

    // 1. Phonetic & Dual-Script Entries (Supports both Latin & Devanagari typing)
    for (const entry of PHONETIC_ENTRIES) {
      // Primary Devanagari Item with multi-alias filterText
      const item = new vscode.CompletionItem(entry.devanagari, this.getCompletionKind(entry.category));
      item.detail = entry.detail;
      item.documentation = new vscode.MarkdownString(entry.documentation);
      item.filterText = `${entry.devanagari} ${entry.latin} ${entry.aliases.join(' ')}`;
      if (entry.snippet) {
        item.insertText = new vscode.SnippetString(entry.snippet);
      }
      items.push(item);

      // Dedicated English/Romanized Typing Item (e.g. 'mudran ➔ मुद्रण')
      const romanItem = new vscode.CompletionItem(
        { label: entry.latin, description: `➔ ${entry.devanagari}` },
        this.getCompletionKind(entry.category)
      );
      romanItem.detail = `𑖭 Transliterate: ${entry.latin} ➔ ${entry.devanagari}`;
      romanItem.documentation = new vscode.MarkdownString(
        `### Phonetic Sanskrit Transliteration\n\nTyping **\`${entry.latin}\`** inserts canonical Devanagari **\`${entry.devanagari}\`**.\n\n${entry.documentation}`
      );
      romanItem.filterText = `${entry.latin} ${entry.aliases.join(' ')}`;
      romanItem.insertText = entry.snippet ? new vscode.SnippetString(entry.snippet) : entry.devanagari;
      romanItem.sortText = `00_${entry.latin}`;
      items.push(romanItem);
    }

    // 2. Dynamic Phonetic Word Transliteration (Any arbitrary Latin word -> Devanagari)
    if (currentWord && /^[a-zA-Z]+$/.test(currentWord) && currentWord.length >= 2) {
      const dynamicDeva = transliterateToDevanagari(currentWord);
      if (dynamicDeva && !PHONETIC_ENTRIES.some(e => e.devanagari === dynamicDeva)) {
        const dynamicItem = new vscode.CompletionItem(
          { label: currentWord, description: `➔ ${dynamicDeva}` },
          vscode.CompletionItemKind.Text
        );
        dynamicItem.detail = `𑖭 Phonetic Transliteration: ${currentWord} ➔ ${dynamicDeva}`;
        dynamicItem.documentation = new vscode.MarkdownString(
          `Convert phonetic English **\`${currentWord}\`** into Sanskrit Devanagari **\`${dynamicDeva}\`**.`
        );
        dynamicItem.insertText = dynamicDeva;
        dynamicItem.filterText = currentWord;
        dynamicItem.sortText = `01_${currentWord}`;
        items.push(dynamicItem);
      }
    }

    // 3. Tensor Methods (when line ends with 'दिश.' or 'Tensor.' or '.')
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

    // 4. Dynamic Document Symbols (Extract user functions and bindings in current buffer)
    const docText = document.getText();
    const funcRegex = /(?:कार्य|fn)\s+([a-zA-Z_\u0900-\u097F][a-zA-Z0-9_\u0900-\u097F]*)\s*\(([^)]*)\)/g;
    let m: RegExpExecArray | null;
    while ((m = funcRegex.exec(docText)) !== null) {
      const funcName = m[1];
      const params = m[2].trim();
      const docItem = new vscode.CompletionItem(funcName, vscode.CompletionItemKind.Function);
      docItem.detail = `कार्य ${funcName}(${params})`;
      docItem.documentation = new vscode.MarkdownString(
        `User-defined function in this document.\n\n\`\`\`sanskrit\nकार्य ${funcName}(${params})\n\`\`\``
      );
      docItem.insertText = new vscode.SnippetString(`${funcName}(\${0})`);
      items.push(docItem);
    }

    return items;
  }

  private getCompletionKind(category: string): vscode.CompletionItemKind {
    switch (category) {
      case 'keyword': return vscode.CompletionItemKind.Keyword;
      case 'builtin': return vscode.CompletionItemKind.Function;
      case 'type': return vscode.CompletionItemKind.TypeParameter;
      case 'module': return vscode.CompletionItemKind.Module;
      default: return vscode.CompletionItemKind.Text;
    }
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
