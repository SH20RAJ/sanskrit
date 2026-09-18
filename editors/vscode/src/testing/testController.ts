import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ProcessRunner } from '../process';

export class SanskritTestManager {
  private controller: vscode.TestController;

  constructor() {
    this.controller = vscode.tests.createTestController(
      'sanskritTestController',
      'Sanskrit Next Tests'
    );

    this.controller.createRunProfile(
      'Run Tests',
      vscode.TestRunProfileKind.Run,
      (request, token) => this.runHandler(request, token),
      true
    );

    this.discoverTests();

    // Watch for file changes to discover newly added test files
    const watcher = vscode.workspace.createFileSystemWatcher('**/*.{skt,sns}');
    watcher.onDidCreate(() => this.discoverTests());
    watcher.onDidChange(() => this.discoverTests());
    watcher.onDidDelete(() => this.discoverTests());
  }

  public getController(): vscode.TestController {
    return this.controller;
  }

  public async discoverTests(): Promise<void> {
    const files = await vscode.workspace.findFiles('**/*.{skt,sns}', '**/target/**');

    for (const file of files) {
      const filename = path.basename(file.fsPath);
      const isTestFile = filename.includes('test') || file.fsPath.includes('/tests/');
      if (!isTestFile) {
        continue;
      }

      const fileItem = this.controller.createTestItem(
        file.toString(),
        path.basename(file.fsPath),
        file
      );

      // Parse test functions from file
      try {
        const content = fs.readFileSync(file.fsPath, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          const match = line.match(/\b(?:fn|कार्य)\s+(test_\w+|परीक्षण_\w+)/);
          if (match) {
            const testName = match[1];
            const testItem = this.controller.createTestItem(
              `${file.toString()}#${testName}`,
              testName,
              file
            );
            testItem.range = new vscode.Range(idx, 0, idx, line.length);
            fileItem.children.add(testItem);
          }
        });
      } catch {
        // Continue if unreadable
      }

      this.controller.items.add(fileItem);
    }
  }

  private async runHandler(
    request: vscode.TestRunRequest,
    _token: vscode.CancellationToken
  ): Promise<void> {
    const run = this.controller.createTestRun(request);
    const queue: vscode.TestItem[] = [];

    if (request.include) {
      request.include.forEach((item) => queue.push(item));
    } else {
      this.controller.items.forEach((item) => queue.push(item));
    }

    for (const test of queue) {
      run.started(test);
      const startTime = Date.now();

      if (test.uri) {
        const res = await ProcessRunner.execute(['run', test.uri.fsPath]);
        const duration = Date.now() - startTime;

        if (res.code === 0) {
          run.passed(test, duration);
        } else {
          const msg = new vscode.TestMessage(res.stderr || res.stdout || 'Test failed');
          run.failed(test, msg, duration);
        }
      } else {
        run.passed(test, 5);
      }
    }

    run.end();
  }

  public dispose(): void {
    this.controller.dispose();
  }
}
