import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { ToolchainManager } from './toolchain';
import { CONFIG_KEYS } from './constants';

export class SanskritTerminalManager {
  private static activeTerminal: vscode.Terminal | null = null;

  public static initialize(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
      vscode.window.onDidCloseTerminal((closedTerminal) => {
        if (this.activeTerminal && closedTerminal === this.activeTerminal) {
          this.activeTerminal = null;
        }
      })
    );
  }

  /**
   * Retrieves or creates a dedicated terminal for Sanskrit Next execution.
   */
  public static getOrCreateTerminal(cwd?: string): vscode.Terminal {
    const config = vscode.workspace.getConfiguration();
    const terminalTitle = config.get<string>(
      CONFIG_KEYS.EXEC_TERMINAL_TITLE,
      'Sanskrit VM'
    );

    // Check if terminal is still open in workspace
    if (this.activeTerminal) {
      const isAlive = vscode.window.terminals.some((t) => t === this.activeTerminal);
      if (isAlive) {
        return this.activeTerminal;
      }
      this.activeTerminal = null;
    }

    // Check existing terminals for one with matching title
    const existing = vscode.window.terminals.find((t) => t.name === terminalTitle);
    if (existing) {
      this.activeTerminal = existing;
      return existing;
    }

    const workingDir = cwd || this.resolveWorkingDirectory();
    this.activeTerminal = vscode.window.createTerminal({
      name: terminalTitle,
      cwd: workingDir,
    });

    return this.activeTerminal;
  }

  /**
   * Resolves the working directory for terminal commands based on user settings.
   */
  public static resolveWorkingDirectory(fileUri?: vscode.Uri): string {
    const config = vscode.workspace.getConfiguration();
    const mode = config.get<string>(CONFIG_KEYS.EXEC_WORKING_DIR, 'workspaceRoot');

    if (mode === 'fileDir' && fileUri && fileUri.scheme === 'file') {
      return path.dirname(fileUri.fsPath);
    }

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
      return workspaceFolders[0].uri.fsPath;
    }

    if (fileUri && fileUri.scheme === 'file') {
      return path.dirname(fileUri.fsPath);
    }

    return os.homedir();
  }

  /**
   * Runs the given Sanskrit source file (.skt / .sns) inside the integrated terminal.
   */
  public static async runFileInTerminal(
    uri?: vscode.Uri,
    options?: { extraArgs?: string[]; release?: boolean }
  ): Promise<void> {
    const targetUri = uri || vscode.window.activeTextEditor?.document.uri;
    if (!targetUri) {
      vscode.window.showErrorMessage('No active Sanskrit file to run.');
      return;
    }

    const config = vscode.workspace.getConfiguration();

    // Auto-save before running if enabled
    const autoSave = config.get<boolean>(CONFIG_KEYS.EXEC_AUTO_SAVE, true);
    if (autoSave && vscode.window.activeTextEditor?.document.isDirty) {
      await vscode.window.activeTextEditor.document.save();
    }

    // Resolve toolchain
    const toolchain = await ToolchainManager.getToolchain(false);
    const compilerCmd = toolchain ? toolchain.path : 'sanskrit';

    // Build argument list
    const args: string[] = ['run'];

    // Tier-0 Bytecode VM flag
    const tier0 = config.get<boolean>(CONFIG_KEYS.EXEC_TIER0, true);
    if (tier0) {
      args.push('--tier0');
    }

    // Release optimizations
    const isRelease = options?.release ?? config.get<boolean>(CONFIG_KEYS.EXEC_RELEASE, false);
    if (isRelease) {
      args.push('--release');
    }

    // User custom args
    const customArgs = config.get<string[]>(CONFIG_KEYS.EXEC_CUSTOM_ARGS, []);
    if (customArgs && customArgs.length > 0) {
      args.push(...customArgs);
    }

    // Specific invocation extra args
    if (options?.extraArgs && options.extraArgs.length > 0) {
      args.push(...options.extraArgs);
    }

    // Target file path (properly quoted)
    const filePath = targetUri.fsPath;
    args.push(this.quotePath(filePath));

    // Terminal lifecycle
    const cwd = this.resolveWorkingDirectory(targetUri);
    const terminal = this.getOrCreateTerminal(cwd);

    const clearBeforeRun = config.get<boolean>(CONFIG_KEYS.EXEC_CLEAR_TERMINAL, true);
    if (clearBeforeRun) {
      const clearCmd = process.platform === 'win32' ? 'cls' : 'clear';
      terminal.sendText(clearCmd);
    }

    const focusTerminal = config.get<boolean>(CONFIG_KEYS.EXEC_FOCUS_TERMINAL, true);
    terminal.show(!focusTerminal);

    const fullCommand = `${this.quotePath(compilerCmd)} ${args.join(' ')}`;
    terminal.sendText(fullCommand);
  }

  /**
   * Executes the currently selected text inside a transient Sanskrit script in the terminal.
   */
  public static async runSelectionInTerminal(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active Sanskrit document open.');
      return;
    }

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection).trim();

    if (!selectedText) {
      vscode.window.showInformationMessage('Please highlight a block of Sanskrit code to execute in the terminal.');
      return;
    }

    // Write snippet to temporary .skt file
    const tmpDir = os.tmpdir();
    const tmpFile = path.join(tmpDir, `sanskrit_eval_${Date.now()}.skt`);

    try {
      fs.writeFileSync(tmpFile, selectedText, { encoding: 'utf8' });
      const tmpUri = vscode.Uri.file(tmpFile);

      await this.runFileInTerminal(tmpUri);
    } catch (err) {
      vscode.window.showErrorMessage(`Failed to execute selection: ${err}`);
    }
  }

  /**
   * Prompts the user for custom flags or CLI arguments, then executes the active file in the terminal.
   */
  public static async runWithCustomArgs(uri?: vscode.Uri): Promise<void> {
    const customInput = await vscode.window.showInputBox({
      prompt: 'Enter extra arguments for `sanskrit run`',
      placeHolder: '--release --tier0',
    });

    if (customInput === undefined) {
      return;
    }

    const extraArgs = customInput
      .split(' ')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    await this.runFileInTerminal(uri, { extraArgs });
  }

  /**
   * Launches the interactive Sanskrit REPL in a dedicated terminal.
   */
  public static async startReplInTerminal(): Promise<void> {
    const toolchain = await ToolchainManager.getToolchain();
    const compilerCmd = toolchain ? toolchain.path : 'sanskrit';

    const terminal = vscode.window.createTerminal({
      name: 'Sanskrit REPL',
      cwd: this.resolveWorkingDirectory(),
    });

    terminal.show();
    terminal.sendText(`${this.quotePath(compilerCmd)} repl`);
  }

  /**
   * Wraps a path in quotes to handle directory names containing spaces.
   */
  private static quotePath(p: string): string {
    if (process.platform === 'win32') {
      return `"${p}"`;
    }
    return `"${p.replace(/"/g, '\\"')}"`;
  }
}
