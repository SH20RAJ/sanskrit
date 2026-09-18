import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class SanskritProjectItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly iconName?: string,
    public readonly uri?: vscode.Uri
  ) {
    super(label, collapsibleState);
    if (iconName) {
      this.iconPath = new vscode.ThemeIcon(iconName);
    }
    if (uri) {
      this.resourceUri = uri;
      this.command = {
        command: 'vscode.open',
        title: 'Open File',
        arguments: [uri],
      };
    }
  }
}

export class SanskritProjectExplorerProvider implements vscode.TreeDataProvider<SanskritProjectItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<SanskritProjectItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: SanskritProjectItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: SanskritProjectItem): Promise<SanskritProjectItem[]> {
    if (!vscode.workspace.workspaceFolders) {
      return [];
    }

    if (!element) {
      const items: SanskritProjectItem[] = [];
      for (const folder of vscode.workspace.workspaceFolders) {
        const manifestPath = path.join(folder.uri.fsPath, 'sanskrit.toml');
        const hasManifest = fs.existsSync(manifestPath);
        items.push(
          new SanskritProjectItem(
            `${folder.name} ${hasManifest ? '(Sanskrit Project)' : ''}`,
            vscode.TreeItemCollapsibleState.Expanded,
            'root-folder'
          )
        );
      }
      return items;
    }

    // List Sanskrit source files in folder
    const files = await vscode.workspace.findFiles('**/*.{skt,sns}', '**/target/**');
    return files.map((file) => {
      const isTest = file.fsPath.includes('test');
      return new SanskritProjectItem(
        path.basename(file.fsPath),
        vscode.TreeItemCollapsibleState.None,
        isTest ? 'beaker' : 'file-code',
        file
      );
    });
  }
}
