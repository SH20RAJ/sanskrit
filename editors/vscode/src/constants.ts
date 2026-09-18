export const EXTENSION_ID = 'sanskrit-vscode';
export const EXTENSION_NAME = 'Sanskrit Next';
export const LANGUAGE_ID = 'sanskrit';

export const COMMANDS = {
  RUN: 'sanskrit.run',
  RUN_IN_TERMINAL: 'sanskrit.runInTerminal',
  RUN_SELECTION: 'sanskrit.runSelection',
  RUN_WITH_ARGS: 'sanskrit.runWithArgs',
  BUILD: 'sanskrit.build',
  CHECK: 'sanskrit.check',
  BENCH: 'sanskrit.bench',
  DOCTOR: 'sanskrit.doctor',
  ENV: 'sanskrit.env',
  REPL: 'sanskrit.repl',
  NEW: 'sanskrit.new',
  FMT: 'sanskrit.fmt',
  OPEN_TENSOR_INSPECTOR: 'sanskrit.openTensorInspector',
  RESTART_LSP: 'sanskrit.restartLsp',
} as const;

export const CONFIG_KEYS = {
  // Legacy & Compatibility Keys
  COMPILER_PATH: 'sanskrit.compilerPath',
  TRACE_SERVER: 'sanskrit.trace.server',
  FORMAT_ON_SAVE: 'sanskrit.formatOnSave',
  TIER0: 'sanskrit.tier0',
  TENSOR_INSPECTOR_AUTO_OPEN: 'sanskrit.tensorInspectorAutoOpen',

  // Execution & Terminal Configuration
  EXEC_RUN_IN_TERMINAL: 'sanskrit.execution.runInTerminal',
  EXEC_TERMINAL_TITLE: 'sanskrit.execution.terminalTitle',
  EXEC_CLEAR_TERMINAL: 'sanskrit.execution.clearTerminalBeforeRun',
  EXEC_FOCUS_TERMINAL: 'sanskrit.execution.focusTerminal',
  EXEC_AUTO_SAVE: 'sanskrit.execution.autoSaveBeforeRun',
  EXEC_TIER0: 'sanskrit.execution.tier0',
  EXEC_RELEASE: 'sanskrit.execution.release',
  EXEC_BACKEND: 'sanskrit.execution.backend',
  EXEC_DEVICE: 'sanskrit.execution.device',
  EXEC_CUSTOM_ARGS: 'sanskrit.execution.customArgs',
  EXEC_WORKING_DIR: 'sanskrit.execution.workingDirectory',

  // Compiler & Toolchain
  COMPILER_CUSTOM_PATH: 'sanskrit.compiler.path',
  COMPILER_CHECK_ON_SAVE: 'sanskrit.compiler.checkOnSave',
  COMPILER_EMIT_MLIR: 'sanskrit.compiler.emitMlirByDefault',
  COMPILER_OPT_LEVEL: 'sanskrit.compiler.optimizationLevel',

  // Transliteration & Phonetic Typing
  TRANSLIT_ENABLED: 'sanskrit.transliteration.enabled',
  TRANSLIT_PREFER_SCRIPT: 'sanskrit.transliteration.preferScript',
  TRANSLIT_SHOW_IN_COMPLETIONS: 'sanskrit.transliteration.showPhoneticInCompletionList',

  // Inlay Hints & IntelliSense
  INLAY_TYPE_HINTS: 'sanskrit.inlayHints.typeHints',
  INLAY_PARAM_NAMES: 'sanskrit.inlayHints.parameterNames',
  INLAY_TENSOR_SHAPES: 'sanskrit.inlayHints.tensorShapes',

  // Formatting & Code Style
  FORMAT_INDENT_SIZE: 'sanskrit.formatting.indentSize',
  FORMAT_ALIGN_COLONS: 'sanskrit.formatting.alignColons',

  // Diagnostics
  DIAG_ENABLE: 'sanskrit.diagnostics.enable',
  DIAG_STRICT_TENSORS: 'sanskrit.diagnostics.strictTensorChecking',
  DIAG_MIXED_SCRIPT: 'sanskrit.diagnostics.mixedScriptWarning',

  // Tensor Inspector
  TENSOR_COLOR_THEME: 'sanskrit.tensorInspector.colorTheme',
  TENSOR_MAX_CELL_DISPLAY: 'sanskrit.tensorInspector.maxCellDisplay',

  // Benchmark
  BENCH_ITERATIONS: 'sanskrit.benchmark.iterations',
  BENCH_WARMUP: 'sanskrit.benchmark.warmupRuns',
  BENCH_SAVE_JSON: 'sanskrit.benchmark.saveResultsJson',
} as const;

export const VIEW_IDS = {
  PROJECT_EXPLORER: 'sanskritProjectExplorer',
  BENCHMARKS: 'sanskritBenchmarks',
  DOCTOR: 'sanskritDoctor',
} as const;
