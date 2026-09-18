import * as vscode from 'vscode';
import { COMMANDS, LANGUAGE_ID, VIEW_IDS } from './constants';
import { SanskritLspManager } from './lsp/client';
import { SanskritDebugAdapterFactory } from './debug/debugAdapter';
import { SanskritDebugConfigurationProvider } from './debug/debugConfiguration';
import { SanskritTestManager } from './testing/testController';
import { runSanskritFile } from './commands/run';
import { buildSanskritProject } from './commands/build';
import { checkSanskritFile } from './commands/check';
import { runBenchmarks } from './commands/bench';
import { runDoctor } from './commands/doctor';
import { inspectEnvironment } from './commands/env';
import { startRepl } from './commands/repl';
import { createNewProject } from './commands/newProject';
import { formatDocument } from './commands/fmt';
import { TensorInspectorPanel } from './commands/tensorInspector';
import { SanskritProjectExplorerProvider } from './views/projectExplorer';
import { SanskritBenchmarkProvider } from './views/benchmarkExplorer';
import { SanskritDoctorProvider } from './views/doctorView';
import { SanskritStatusBar } from './status/statusBar';

let lspManager: SanskritLspManager | null = null;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const outputChannel = vscode.window.createOutputChannel('Sanskrit Next');
  outputChannel.appendLine('[Extension] Activating Sanskrit Next Extension Platform...');

  // 1. Language Server Protocol (LSP)
  lspManager = new SanskritLspManager();
  try {
    await lspManager.start();
  } catch (err) {
    outputChannel.appendLine(`[LSP] Failed to start language server: ${err}`);
  }

  // 2. Debug Adapter Protocol (DAP)
  const debugConfigProvider = new SanskritDebugConfigurationProvider();
  const debugFactory = new SanskritDebugAdapterFactory();
  context.subscriptions.push(
    vscode.debug.registerDebugConfigurationProvider('sanskrit-debug', debugConfigProvider),
    vscode.debug.registerDebugAdapterDescriptorFactory('sanskrit-debug', debugFactory)
  );

  // 3. Test Controller
  const testManager = new SanskritTestManager();
  context.subscriptions.push(testManager.getController());

  // 4. Tree Views & Explorer Panels
  const projectProvider = new SanskritProjectExplorerProvider();
  const benchmarkProvider = new SanskritBenchmarkProvider();
  const doctorProvider = new SanskritDoctorProvider();

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider(VIEW_IDS.PROJECT_EXPLORER, projectProvider),
    vscode.window.registerTreeDataProvider(VIEW_IDS.BENCHMARKS, benchmarkProvider),
    vscode.window.registerTreeDataProvider(VIEW_IDS.DOCTOR, doctorProvider)
  );

  // 5. Status Bar Item
  const statusBar = new SanskritStatusBar();
  context.subscriptions.push(statusBar);

  // 6. Formatting Provider
  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider(LANGUAGE_ID, {
      async provideDocumentFormattingEdits(document: vscode.TextDocument): Promise<vscode.TextEdit[]> {
        await formatDocument(document.uri);
        return [];
      },
    })
  );

  // 7. Command Registrations
  context.subscriptions.push(
    vscode.commands.registerCommand(COMMANDS.RUN, (uri?: vscode.Uri) => runSanskritFile(uri)),
    vscode.commands.registerCommand(COMMANDS.BUILD, (uri?: vscode.Uri) => buildSanskritProject(uri)),
    vscode.commands.registerCommand(COMMANDS.CHECK, (uri?: vscode.Uri) => checkSanskritFile(uri)),
    vscode.commands.registerCommand(COMMANDS.BENCH, () => runBenchmarks()),
    vscode.commands.registerCommand(COMMANDS.DOCTOR, () => runDoctor()),
    vscode.commands.registerCommand(COMMANDS.ENV, () => inspectEnvironment()),
    vscode.commands.registerCommand(COMMANDS.REPL, () => startRepl()),
    vscode.commands.registerCommand(COMMANDS.NEW, () => createNewProject()),
    vscode.commands.registerCommand(COMMANDS.FMT, (uri?: vscode.Uri) => formatDocument(uri)),
    vscode.commands.registerCommand(COMMANDS.OPEN_TENSOR_INSPECTOR, () =>
      TensorInspectorPanel.render(context.extensionUri)
    ),
    vscode.commands.registerCommand(COMMANDS.RESTART_LSP, async () => {
      if (lspManager) {
        await lspManager.restart();
      }
    }),
    vscode.commands.registerCommand('sanskrit.statusMenu', () => SanskritStatusBar.showQuickMenu())
  );

  outputChannel.appendLine('[Extension] Sanskrit Next Extension Platform activated successfully.');
}

export async function deactivate(): Promise<void> {
  if (lspManager) {
    await lspManager.stop();
    lspManager = null;
  }
}
