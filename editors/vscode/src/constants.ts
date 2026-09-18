export const EXTENSION_ID = 'sanskrit-vscode';
export const EXTENSION_NAME = 'Sanskrit Next';
export const LANGUAGE_ID = 'sanskrit';

export const COMMANDS = {
  RUN: 'sanskrit.run',
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
  COMPILER_PATH: 'sanskrit.compilerPath',
  TRACE_SERVER: 'sanskrit.trace.server',
  FORMAT_ON_SAVE: 'sanskrit.formatOnSave',
  TIER0: 'sanskrit.tier0',
  TENSOR_INSPECTOR_AUTO_OPEN: 'sanskrit.tensorInspectorAutoOpen',
} as const;

export const VIEW_IDS = {
  PROJECT_EXPLORER: 'sanskritProjectExplorer',
  BENCHMARKS: 'sanskritBenchmarks',
  DOCTOR: 'sanskritDoctor',
} as const;
