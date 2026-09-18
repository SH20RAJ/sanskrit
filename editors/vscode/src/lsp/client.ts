import * as vscode from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
} from 'vscode-languageclient/node';
import { ToolchainManager } from '../toolchain';
import { LANGUAGE_ID } from '../constants';

export class SanskritLspManager {
  private client: LanguageClient | null = null;
  private outputChannel: vscode.OutputChannel;

  constructor() {
    this.outputChannel = vscode.window.createOutputChannel('Sanskrit Language Server');
  }

  public async start(): Promise<void> {
    if (this.client) {
      return;
    }

    const toolchain = await ToolchainManager.getToolchain(false);
    if (!toolchain) {
      this.outputChannel.appendLine('[LSP] Toolchain not found. Language server will start once compiler is available.');
      return;
    }

    const serverOptions: ServerOptions = {
      command: toolchain.path,
      args: ['lsp'],
      options: {
        env: {
          ...process.env,
          RUST_BACKTRACE: '1',
        },
      },
    };

    const clientOptions: LanguageClientOptions = {
      documentSelector: [{ scheme: 'file', language: LANGUAGE_ID }],
      outputChannel: this.outputChannel,
      synchronize: {
        fileEvents: vscode.workspace.createFileSystemWatcher('**/*.{skt,sns}'),
        configurationSection: 'sanskrit',
      },
    };

    this.client = new LanguageClient(
      'sanskritLsp',
      'Sanskrit Language Server',
      serverOptions,
      clientOptions
    );

    this.outputChannel.appendLine(`[LSP] Launching Sanskrit LSP from: ${toolchain.path}`);
    await this.client.start();
    this.outputChannel.appendLine('[LSP] Sanskrit Language Server initialized successfully.');
  }

  public async stop(): Promise<void> {
    if (!this.client) {
      return;
    }
    this.outputChannel.appendLine('[LSP] Stopping Sanskrit Language Server...');
    await this.client.stop();
    this.client = null;
  }

  public async restart(): Promise<void> {
    ToolchainManager.clearCache();
    await this.stop();
    await this.start();
    vscode.window.showInformationMessage('Sanskrit Language Server restarted.');
  }
}
