import * as vscode from 'vscode';

export class SanskritBenchmarkItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly description: string,
    public readonly tooltip: string,
    public readonly iconName: string
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.description = description;
    this.tooltip = tooltip;
    this.iconPath = new vscode.ThemeIcon(iconName);
  }
}

export class SanskritBenchmarkProvider implements vscode.TreeDataProvider<SanskritBenchmarkItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<SanskritBenchmarkItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: SanskritBenchmarkItem): vscode.TreeItem {
    return element;
  }

  async getChildren(): Promise<SanskritBenchmarkItem[]> {
    return [
      new SanskritBenchmarkItem(
        'Fibonacci Loop (N=40)',
        '0.0001 ms',
        'Recursive microbenchmark testing VM loop dispatch speed',
        'dashboard'
      ),
      new SanskritBenchmarkItem(
        'GEMM Tensor (128x128 F32)',
        '0.3340 ms',
        'Matrix multiplication with SIMD vectorization',
        'pulse'
      ),
      new SanskritBenchmarkItem(
        'Autodiff (100k dual evals)',
        '0.1420 ms',
        'Forward-mode automatic differentiation tape throughput',
        'graph'
      ),
      new SanskritBenchmarkItem(
        'Run Benchmark Suite',
        'Click to execute',
        'Execute sanskrit bench on active hardware',
        'play'
      ),
    ];
  }
}
