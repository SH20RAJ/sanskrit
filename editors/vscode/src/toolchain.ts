import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { execFileSync } from 'child_process';
import { CONFIG_KEYS } from './constants';

export interface ToolchainInfo {
  path: string;
  version: string;
  isCustom: boolean;
}

export class ToolchainManager {
  private static cachedToolchain: ToolchainInfo | null = null;

  public static async getToolchain(promptIfNotFound = true): Promise<ToolchainInfo | null> {
    if (this.cachedToolchain && fs.existsSync(this.cachedToolchain.path)) {
      return this.cachedToolchain;
    }

    const config = vscode.workspace.getConfiguration();
    const customPath = config.get<string>(CONFIG_KEYS.COMPILER_PATH, '').trim();

    if (customPath) {
      if (fs.existsSync(customPath)) {
        const version = this.probeVersion(customPath);
        this.cachedToolchain = { path: customPath, version, isCustom: true };
        return this.cachedToolchain;
      } else {
        vscode.window.showWarningMessage(`Configured Sanskrit compiler path not found: ${customPath}`);
      }
    }

    // Check workspace targets first if in development workspace
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
      for (const folder of workspaceFolders) {
        const releaseBin = path.join(folder.uri.fsPath, 'target', 'release', this.binaryName());
        if (fs.existsSync(releaseBin)) {
          const version = this.probeVersion(releaseBin);
          this.cachedToolchain = { path: releaseBin, version, isCustom: false };
          return this.cachedToolchain;
        }

        const debugBin = path.join(folder.uri.fsPath, 'target', 'debug', this.binaryName());
        if (fs.existsSync(debugBin)) {
          const version = this.probeVersion(debugBin);
          this.cachedToolchain = { path: debugBin, version, isCustom: false };
          return this.cachedToolchain;
        }
      }
    }

    // Check default install locations
    const home = os.homedir();
    const candidatePaths = [
      path.join(home, '.sanskrit', 'bin', this.binaryName()),
      path.join(home, '.cargo', 'bin', this.binaryName()),
      path.join('/usr/local/bin', this.binaryName()),
      path.join('/opt/homebrew/bin', this.binaryName()),
    ];

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        const version = this.probeVersion(p);
        this.cachedToolchain = { path: p, version, isCustom: false };
        return this.cachedToolchain;
      }
    }

    // Check PATH environment variable
    const pathEnv = process.env.PATH || '';
    const dirs = pathEnv.split(path.delimiter);
    for (const dir of dirs) {
      const fullPath = path.join(dir, this.binaryName());
      if (fs.existsSync(fullPath)) {
        const version = this.probeVersion(fullPath);
        this.cachedToolchain = { path: fullPath, version, isCustom: false };
        return this.cachedToolchain;
      }
    }

    if (promptIfNotFound) {
      const choice = await vscode.window.showErrorMessage(
        'Sanskrit Next compiler (`sanskrit`) not found. Would you like to install it or configure a custom path?',
        'Install Sanskrit Next',
        'Configure Path'
      );

      if (choice === 'Install Sanskrit Next') {
        const terminal = vscode.window.createTerminal('Sanskrit Next Installer');
        terminal.show();
        terminal.sendText('curl --proto "=https" --tlsv1.2 -sSf https://raw.githubusercontent.com/SH20RAJ/sanskrit/main/install.sh | bash');
      } else if (choice === 'Configure Path') {
        vscode.commands.executeCommand('workbench.action.openSettings', CONFIG_KEYS.COMPILER_PATH);
      }
    }

    return null;
  }

  public static clearCache(): void {
    this.cachedToolchain = null;
  }

  private static binaryName(): string {
    return process.platform === 'win32' ? 'sanskrit.exe' : 'sanskrit';
  }

  private static probeVersion(binaryPath: string): string {
    try {
      const output = execFileSync(binaryPath, ['--version'], {
        encoding: 'utf8',
        timeout: 3000,
      });
      return output.trim();
    } catch {
      return '2.0.0-alpha.1';
    }
  }
}
