import * as vscode from 'vscode';
import { spawn, SpawnOptionsWithoutStdio } from 'child_process';
import { ToolchainManager } from './toolchain';

export interface ProcessResult {
  code: number | null;
  stdout: string;
  stderr: string;
}

export class ProcessRunner {
  private static outputChannel: vscode.OutputChannel | null = null;

  public static getOutputChannel(): vscode.OutputChannel {
    if (!this.outputChannel) {
      this.outputChannel = vscode.window.createOutputChannel('Sanskrit Next');
    }
    return this.outputChannel;
  }

  public static async execute(
    args: string[],
    cwd?: string,
    showOutput = false,
    promptUntrusted = true
  ): Promise<ProcessResult> {
    if (!vscode.workspace.isTrusted) {
      if (promptUntrusted) {
        vscode.window.showErrorMessage('Cannot execute Sanskrit compiler in an untrusted workspace.');
      }
      return { code: 1, stdout: '', stderr: 'Workspace is untrusted' };
    }

    const toolchain = await ToolchainManager.getToolchain();
    if (!toolchain) {
      return { code: 1, stdout: '', stderr: 'Sanskrit compiler binary not found' };
    }

    const channel = this.getOutputChannel();
    if (showOutput) {
      channel.show(true);
      channel.appendLine(`>>> Running: ${toolchain.path} ${args.join(' ')} (cwd: ${cwd || 'default'})`);
    }

    const options: SpawnOptionsWithoutStdio = {
      cwd: cwd || (vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd()),
      env: {
        ...process.env,
        SANSKRIT_VERBOSE: '1',
      },
    };

    return new Promise<ProcessResult>((resolve) => {
      const child = spawn(toolchain.path, args, options);
      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (chunk) => {
        const text = chunk.toString();
        stdout += text;
        if (showOutput) {
          channel.append(this.maskSecrets(text));
        }
      });

      child.stderr.on('data', (chunk) => {
        const text = chunk.toString();
        stderr += text;
        if (showOutput) {
          channel.append(this.maskSecrets(text));
        }
      });

      child.on('close', (code) => {
        if (showOutput) {
          channel.appendLine(`>>> Process exited with code ${code}\n`);
        }
        resolve({ code, stdout, stderr });
      });

      child.on('error', (err) => {
        channel.appendLine(`>>> Failed to spawn process: ${err.message}\n`);
        resolve({ code: 1, stdout, stderr: err.message });
      });
    });
  }

  private static maskSecrets(text: string): string {
    return text.replace(/(AUTH_TOKEN|API_KEY|SECRET|PASSWORD)=([^\s]+)/gi, '$1=***');
  }
}
