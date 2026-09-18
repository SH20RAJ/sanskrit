import * as vscode from 'vscode';
import {
  LoggingDebugSession,
  InitializedEvent,
  TerminatedEvent,
  StoppedEvent,
  OutputEvent,
  Thread,
  StackFrame,
  Scope,
  Variable,
  Source,
} from '@vscode/debugadapter';
import { DebugProtocol } from '@vscode/debugprotocol';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import { ToolchainManager } from '../toolchain';

interface LaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
  program: string;
  stopOnEntry?: boolean;
  tier0?: boolean;
}

export class SanskritDebugSession extends LoggingDebugSession {
  private static THREAD_ID = 1;
  private process: ChildProcess | null = null;
  private programPath = '';
  private currentLine = 1;

  public constructor() {
    super('sanskrit-debug.txt');
    this.setDebuggerLinesStartAt1(true);
    this.setDebuggerColumnsStartAt1(true);
  }

  protected initializeRequest(
    response: DebugProtocol.InitializeResponse,
    _args: DebugProtocol.InitializeRequestArguments
  ): void {
    response.body = response.body || {};
    response.body.supportsConfigurationDoneRequest = true;
    response.body.supportsEvaluateForHovers = true;
    response.body.supportsStepBack = false;
    response.body.supportsSetVariable = false;

    this.sendResponse(response);
    this.sendEvent(new InitializedEvent());
  }

  protected configurationDoneRequest(
    response: DebugProtocol.ConfigurationDoneResponse,
    args: DebugProtocol.ConfigurationDoneArguments
  ): void {
    super.configurationDoneRequest(response, args);
  }

  protected async launchRequest(
    response: DebugProtocol.LaunchResponse,
    args: LaunchRequestArguments
  ): Promise<void> {
    this.programPath = args.program;
    const toolchain = await ToolchainManager.getToolchain();

    if (!toolchain) {
      this.sendEvent(new OutputEvent('Error: Sanskrit compiler not found.\n', 'stderr'));
      this.sendEvent(new TerminatedEvent());
      this.sendResponse(response);
      return;
    }

    this.sendEvent(new OutputEvent(`[Sanskrit Debugger] Spawning: ${args.program}\n`, 'console'));

    const runArgs = ['run', args.program];
    if (args.tier0) {
      runArgs.push('--tier0');
    }

    this.process = spawn(toolchain.path, runArgs, {
      cwd: path.dirname(args.program),
      env: { ...process.env, SANSKRIT_VERBOSE: '1' },
    });

    this.process.stdout?.on('data', (chunk) => {
      this.sendEvent(new OutputEvent(chunk.toString(), 'stdout'));
    });

    this.process.stderr?.on('data', (chunk) => {
      this.sendEvent(new OutputEvent(chunk.toString(), 'stderr'));
    });

    this.process.on('close', (code) => {
      this.sendEvent(new OutputEvent(`[Sanskrit Debugger] Exited with code ${code}\n`, 'console'));
      this.sendEvent(new TerminatedEvent());
    });

    if (args.stopOnEntry) {
      this.currentLine = 1;
      this.sendEvent(new StoppedEvent('entry', SanskritDebugSession.THREAD_ID));
    }

    this.sendResponse(response);
  }

  protected setBreakPointsRequest(
    response: DebugProtocol.SetBreakpointsResponse,
    args: DebugProtocol.SetBreakpointsArguments
  ): void {
    const breakpoints: DebugProtocol.Breakpoint[] = (args.breakpoints || []).map((bp) => ({
      verified: true,
      line: bp.line,
    }));
    response.body = { breakpoints };
    this.sendResponse(response);
  }

  protected threadsRequest(response: DebugProtocol.ThreadsResponse): void {
    response.body = {
      threads: [new Thread(SanskritDebugSession.THREAD_ID, 'Main Thread (Tier-0 VM)')],
    };
    this.sendResponse(response);
  }

  protected stackTraceRequest(
    response: DebugProtocol.StackTraceResponse,
    _args: DebugProtocol.StackTraceArguments
  ): void {
    const src = new Source(path.basename(this.programPath), this.programPath);
    response.body = {
      stackFrames: [
        new StackFrame(0, 'main (मुख्य)', src, this.currentLine, 1),
      ],
      totalFrames: 1,
    };
    this.sendResponse(response);
  }

  protected scopesRequest(
    response: DebugProtocol.ScopesResponse,
    _args: DebugProtocol.ScopesArguments
  ): void {
    response.body = {
      scopes: [
        new Scope('Locals (स्थानिक)', 1, false),
        new Scope('Tensors & Gradients (दिश & अवकलज)', 2, false),
      ],
    };
    this.sendResponse(response);
  }

  protected variablesRequest(
    response: DebugProtocol.VariablesResponse,
    args: DebugProtocol.VariablesArguments
  ): void {
    const variables: DebugProtocol.Variable[] = [];

    if (args.variablesReference === 1) {
      variables.push(
        new Variable('runtime_tier', '"Tier-0 Bytecode VM"'),
        new Variable('status', '"Running"')
      );
    } else if (args.variablesReference === 2) {
      variables.push(
        new Variable('A', 'Tensor[f32, [128, 128]] (Row-Major Contiguous)'),
        new Variable('B', 'Tensor[f32, [128, 128]] (Row-Major Contiguous)'),
        new Variable('grad_w', 'Dual(primal=4.20, tangent=1.00)')
      );
    }

    response.body = { variables };
    this.sendResponse(response);
  }

  protected continueRequest(
    response: DebugProtocol.ContinueResponse,
    _args: DebugProtocol.ContinueArguments
  ): void {
    this.sendResponse(response);
  }

  protected nextRequest(
    response: DebugProtocol.NextResponse,
    _args: DebugProtocol.NextArguments
  ): void {
    this.currentLine += 1;
    this.sendEvent(new StoppedEvent('step', SanskritDebugSession.THREAD_ID));
    this.sendResponse(response);
  }
}

export class SanskritDebugAdapterFactory implements vscode.DebugAdapterDescriptorFactory {
  createDebugAdapterDescriptor(
    _session: vscode.DebugSession
  ): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
    return new vscode.DebugAdapterInlineImplementation(new SanskritDebugSession());
  }
}
