import * as vscode from 'vscode';

export class SanskritDebugConfigurationProvider implements vscode.DebugConfigurationProvider {
  resolveDebugConfiguration(
    _folder: vscode.WorkspaceFolder | undefined,
    config: vscode.DebugConfiguration,
    _token?: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.DebugConfiguration> {
    if (!config.type && !config.request && !config.name) {
      const editor = vscode.window.activeTextEditor;
      if (editor && (editor.document.languageId === 'sanskrit' || editor.document.fileName.endsWith('.skt') || editor.document.fileName.endsWith('.sns'))) {
        config.type = 'sanskrit-debug';
        config.name = 'Sanskrit: Debug Current File';
        config.request = 'launch';
        config.program = '${file}';
        config.stopOnEntry = false;
        config.tier0 = true;
      }
    }

    if (!config.program) {
      return vscode.window.showInformationMessage('Cannot find a Sanskrit file to debug').then(() => {
        return undefined;
      });
    }

    return config;
  }
}
