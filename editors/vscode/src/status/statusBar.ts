import * as vscode from 'vscode';
import { COMMANDS } from '../constants';

export class SanskritStatusBar {
  private item: vscode.StatusBarItem;

  constructor() {
    this.item = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    this.item.text = '$(play) Sanskrit Next';
    this.item.tooltip = 'Sanskrit Next Toolchain & Runtime (Click for quick menu)';
    this.item.command = 'sanskrit.statusMenu';

    this.updateVisibility();
    vscode.window.onDidChangeActiveTextEditor(() => this.updateVisibility());
  }

  public show(): void {
    this.item.show();
  }

  public hide(): void {
    this.item.hide();
  }

  public dispose(): void {
    this.item.dispose();
  }

  private updateVisibility(): void {
    const editor = vscode.window.activeTextEditor;
    if (editor && (editor.document.languageId === 'sanskrit' || editor.document.fileName.endsWith('.skt') || editor.document.fileName.endsWith('.sns'))) {
      this.item.show();
    } else {
      this.item.hide();
    }
  }

  public static async showQuickMenu(): Promise<void> {
    const choice = await vscode.window.showQuickPick([
      { label: '$(play) Run Active File', command: COMMANDS.RUN },
      { label: '$(check) Check Syntax & Types', command: COMMANDS.CHECK },
      { label: '$(package) Build / Emit MLIR', command: COMMANDS.BUILD },
      { label: '$(database) Open Tensor & Autodiff Inspector', command: COMMANDS.OPEN_TENSOR_INSPECTOR },
      { label: '$(terminal) Open Interactive REPL', command: COMMANDS.REPL },
      { label: '$(dashboard) Run Performance Benchmarks', command: COMMANDS.BENCH },
      { label: '$(pulse) Run Sanskrit Doctor', command: COMMANDS.DOCTOR },
      { label: '$(refresh) Restart Language Server', command: COMMANDS.RESTART_LSP },
    ]);

    if (choice) {
      vscode.commands.executeCommand(choice.command);
    }
  }
}
