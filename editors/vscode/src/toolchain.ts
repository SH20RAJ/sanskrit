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
        await this.installToolchain(true);
      } else if (choice === 'Configure Path') {
        vscode.commands.executeCommand('workbench.action.openSettings', CONFIG_KEYS.COMPILER_PATH);
      }
    }

    return null;
  }

  /**
   * Automatically verifies and installs the Sanskrit Next language toolchain in the system
   * on extension activation/install.
   */
  public static async ensureToolchainInstalled(
    _context: vscode.ExtensionContext,
    outputChannel?: vscode.OutputChannel
  ): Promise<ToolchainInfo | null> {
    // 1. Check if toolchain is already present
    let toolchain = await this.getToolchain(false);
    if (toolchain) {
      outputChannel?.appendLine(`[Toolchain] Found Sanskrit compiler: ${toolchain.path} (${toolchain.version})`);
      this.ensureInPath(path.dirname(toolchain.path));
      return toolchain;
    }

    // 2. Check if auto-install is enabled
    const config = vscode.workspace.getConfiguration();
    const autoInstall = config.get<boolean>(CONFIG_KEYS.AUTO_INSTALL_LANGUAGE, true);

    if (!autoInstall) {
      outputChannel?.appendLine('[Toolchain] Auto-install disabled by user setting.');
      return null;
    }

    outputChannel?.appendLine('[Toolchain] Sanskrit compiler not found in system. Auto-installing...');

    const success = await this.installToolchain(false, outputChannel);
    if (success) {
      this.clearCache();
      toolchain = await this.getToolchain(false);
      if (toolchain) {
        outputChannel?.appendLine(`[Toolchain] Successfully auto-installed: ${toolchain.path}`);
        vscode.window.showInformationMessage(
          `⚡ Sanskrit Next language toolchain successfully installed into ${toolchain.path}!`,
          'Doctor Check'
        ).then(selection => {
          if (selection === 'Doctor Check') {
            vscode.commands.executeCommand('sanskrit.doctor');
          }
        });
        return toolchain;
      }
    }

    return null;
  }

  /**
   * Installs Sanskrit Next compiler into ~/.sanskrit/bin
   */
  public static async installToolchain(interactive = true, outputChannel?: vscode.OutputChannel): Promise<boolean> {
    const home = os.homedir();
    const binDir = path.join(home, '.sanskrit', 'bin');
    const binPath = path.join(binDir, this.binaryName());

    return await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Installing Sanskrit Next Compiler & Toolchain...',
        cancellable: false,
      },
      async (progress) => {
        try {
          if (!fs.existsSync(binDir)) {
            fs.mkdirSync(binDir, { recursive: true });
          }

          progress.report({ message: 'Locating or building native binary...' });

          // 1. Check if a local binary exists in any open workspace folder
          const workspaceFolders = vscode.workspace.workspaceFolders;
          let copied = false;
          if (workspaceFolders) {
            for (const folder of workspaceFolders) {
              const releaseCandidate = path.join(folder.uri.fsPath, 'target', 'release', this.binaryName());
              if (fs.existsSync(releaseCandidate)) {
                fs.copyFileSync(releaseCandidate, binPath);
                fs.chmodSync(binPath, 0o755);
                copied = true;
                break;
              }
            }
          }

          // 2. If not copied from workspace, run official installer via shell
          if (!copied) {
            progress.report({ message: 'Fetching release from GitHub...' });
            const { execSync } = require('child_process');
            if (process.platform === 'win32') {
              execSync('powershell -Command "irm https://raw.githubusercontent.com/SH20RAJ/sanskrit/main/install.ps1 | iex"', {
                timeout: 60000,
                encoding: 'utf8',
              });
            } else {
              execSync('curl --proto "=https" --tlsv1.2 -fsSL https://raw.githubusercontent.com/SH20RAJ/sanskrit/main/install.sh | bash', {
                timeout: 60000,
                encoding: 'utf8',
              });
            }
          }

          // 3. Ensure ~/.sanskrit/bin is in runtime process.env.PATH
          this.ensureInPath(binDir);

          // 4. Update shell profiles if on Unix
          if (process.platform !== 'win32') {
            const exportLine = '\nexport PATH="$HOME/.sanskrit/bin:$PATH"\n';
            const profiles = ['.zshrc', '.bashrc', '.profile'];
            for (const p of profiles) {
              const fullP = path.join(home, p);
              try {
                if (fs.existsSync(fullP)) {
                  const content = fs.readFileSync(fullP, 'utf8');
                  if (!content.includes('.sanskrit/bin')) {
                    fs.appendFileSync(fullP, exportLine);
                  }
                }
              } catch {
                // Ignore profile append failures
              }
            }
          }

          this.clearCache();
          const verified = fs.existsSync(binPath);
          if (verified) {
            fs.chmodSync(binPath, 0o755);
            if (interactive) {
              vscode.window.showInformationMessage(
                `⚡ Sanskrit Next language compiler installed successfully in ${binPath}!`,
                'Run Doctor'
              ).then(sel => {
                if (sel === 'Run Doctor') vscode.commands.executeCommand('sanskrit.doctor');
              });
            }
            return true;
          }
          return false;
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          outputChannel?.appendLine(`[Toolchain] Install failed: ${errMsg}`);
          if (interactive) {
            vscode.window.showErrorMessage(`Sanskrit Next installation error: ${errMsg}`);
          }
          return false;
        }
      }
    );
  }

  private static ensureInPath(dir: string): void {
    const currentPath = process.env.PATH || '';
    if (!currentPath.split(path.delimiter).includes(dir)) {
      process.env.PATH = `${dir}${path.delimiter}${currentPath}`;
    }
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
