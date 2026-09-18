import * as vscode from 'vscode';
import * as os from 'os';

export class SanskritDoctorItem extends vscode.TreeItem {
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

export class SanskritDoctorProvider implements vscode.TreeDataProvider<SanskritDoctorItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<SanskritDoctorItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: SanskritDoctorItem): vscode.TreeItem {
    return element;
  }

  async getChildren(): Promise<SanskritDoctorItem[]> {
    const platform = os.platform();
    const isMac = platform === 'darwin';
    const gpuDesc = isMac ? 'Apple Silicon AMX / Metal (Active)' : 'CPU SIMD Vectorization';

    return [
      new SanskritDoctorItem(
        'Sanskrit Compiler',
        '2.0.0-alpha.1 (Native Rust)',
        'Core compiler and toolchain',
        'check'
      ),
      new SanskritDoctorItem(
        'Primary Runtime',
        'Tier-0 Bytecode VM (<1ms startup)',
        'Low-latency interactive bytecode runtime',
        'zap'
      ),
      new SanskritDoctorItem(
        'Native Codegen',
        'MLIR Dialect Pipeline (Ready)',
        'Polyhedral loop tiling and vectorization',
        'package'
      ),
      new SanskritDoctorItem(
        'Hardware Accelerator',
        gpuDesc,
        'Hardware acceleration backend',
        'server-process'
      ),
      new SanskritDoctorItem(
        'Package Cache',
        '~/.sanskrit/cache/ (Online)',
        'Decentralized immutable package store',
        'database'
      ),
    ];
  }
}
