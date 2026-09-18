import * as vscode from 'vscode';
import { COMMANDS, LANGUAGE_ID, VIEW_IDS } from './constants';
import { SanskritLspManager } from './lsp/client';
import { SanskritDebugAdapterFactory } from './debug/debugAdapter';
import { SanskritDebugConfigurationProvider } from './debug/debugConfiguration';
import { SanskritTestManager } from './testing/testController';
import {
  runSanskritFile,
  runSanskritInTerminal,
  runSanskritSelectionInTerminal,
  runSanskritWithArgs,
} from './commands/run';
import { buildSanskritProject } from './commands/build';
import { checkSanskritFile } from './commands/check';
import { runBenchmarks } from './commands/bench';
import { runDoctor } from './commands/doctor';
import { inspectEnvironment } from './commands/env';
import { createNewProject } from './commands/newProject';
import { formatDocument } from './commands/fmt';
import { TensorInspectorPanel } from './commands/tensorInspector';
import { SanskritTerminalManager } from './terminal';
import { SanskritProjectExplorerProvider } from './views/projectExplorer';
import { SanskritBenchmarkProvider } from './views/benchmarkExplorer';
import { SanskritDoctorProvider } from './views/doctorView';
import { SanskritStatusBar } from './status/statusBar';
import { SanskritSemanticTokensProvider, semanticTokensLegend } from './intelligence/semanticTokens';
import { SanskritCompletionItemProvider } from './intelligence/completions';
import { SanskritHoverProvider } from './intelligence/hover';
import { SanskritSignatureHelpProvider } from './intelligence/signatureHelp';
import { SanskritInlayHintsProvider } from './intelligence/inlayHints';
import { SanskritDocumentSymbolProvider } from './intelligence/symbols';
import { SanskritCodeLensProvider } from './intelligence/codeLens';
import { SanskritCodeActionProvider } from './intelligence/codeActions';

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

  // 7. TSX & Tailwind-Class Language Intelligence & Autocomplete
  context.subscriptions.push(
    // Compiler Semantic Token Coloring
    vscode.languages.registerDocumentSemanticTokensProvider(
      { language: LANGUAGE_ID },
      new SanskritSemanticTokensProvider(),
      semanticTokensLegend
    ),
    // Rich Autocomplete with snippets & live documentation
    vscode.languages.registerCompletionItemProvider(
      { language: LANGUAGE_ID },
      new SanskritCompletionItemProvider(),
      '(', ':', '[', '.', ' ', '@', '!', '\n'
    ),
    // Etymological & Type Signature Hover
    vscode.languages.registerHoverProvider(
      { language: LANGUAGE_ID },
      new SanskritHoverProvider()
    ),
    // Active Parameter Signature Help
    vscode.languages.registerSignatureHelpProvider(
      { language: LANGUAGE_ID },
      new SanskritSignatureHelpProvider(),
      '(', ','
    ),
    // Inline Parameter Names & Type Inlay Hints
    vscode.languages.registerInlayHintsProvider(
      { language: LANGUAGE_ID },
      new SanskritInlayHintsProvider()
    ),
    // Outline & Document Symbols Explorer
    vscode.languages.registerDocumentSymbolProvider(
      { language: LANGUAGE_ID },
      new SanskritDocumentSymbolProvider()
    ),
    // Interactive CodeLens (Run, Benchmark)
    vscode.languages.registerCodeLensProvider(
      { language: LANGUAGE_ID },
      new SanskritCodeLensProvider()
    ),
    // Code Actions & Script Converter (Devanagari <-> Latin)
    vscode.languages.registerCodeActionsProvider(
      { language: LANGUAGE_ID },
      new SanskritCodeActionProvider()
    )
  );

  // 8. Terminal Manager
  SanskritTerminalManager.initialize(context);

  // 9. Command Registrations
  context.subscriptions.push(
    vscode.commands.registerCommand(COMMANDS.RUN, (uri?: vscode.Uri) => runSanskritFile(uri)),
    vscode.commands.registerCommand(COMMANDS.RUN_IN_TERMINAL, (uri?: vscode.Uri) => runSanskritInTerminal(uri)),
    vscode.commands.registerCommand(COMMANDS.RUN_SELECTION, () => runSanskritSelectionInTerminal()),
    vscode.commands.registerCommand(COMMANDS.RUN_WITH_ARGS, (uri?: vscode.Uri) => runSanskritWithArgs(uri)),
    vscode.commands.registerCommand(COMMANDS.BUILD, (uri?: vscode.Uri) => buildSanskritProject(uri)),
    vscode.commands.registerCommand(COMMANDS.CHECK, (uri?: vscode.Uri) => checkSanskritFile(uri)),
    vscode.commands.registerCommand(COMMANDS.BENCH, () => runBenchmarks()),
    vscode.commands.registerCommand(COMMANDS.DOCTOR, () => runDoctor()),
    vscode.commands.registerCommand(COMMANDS.ENV, () => inspectEnvironment()),
    vscode.commands.registerCommand(COMMANDS.REPL, () => SanskritTerminalManager.startReplInTerminal()),
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
