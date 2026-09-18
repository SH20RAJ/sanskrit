import * as vscode from 'vscode';
import * as path from 'path';

export class TensorInspectorPanel {
  public static currentPanel: TensorInspectorPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private readonly extensionUri: vscode.Uri;
  private disposables: vscode.Disposable[] = [];

  public static render(extensionUri: vscode.Uri): void {
    if (TensorInspectorPanel.currentPanel) {
      TensorInspectorPanel.currentPanel.panel.reveal(vscode.ViewColumn.Beside);
    } else {
      const panel = vscode.window.createWebviewPanel(
        'sanskritTensorInspector',
        'Sanskrit Tensor & Autodiff Inspector',
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
          localResourceRoots: [vscode.Uri.file(path.join(extensionUri.fsPath, 'media'))],
        }
      );

      TensorInspectorPanel.currentPanel = new TensorInspectorPanel(panel, extensionUri);
    }
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this.panel = panel;
    this.extensionUri = extensionUri;

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
    this.panel.webview.html = this.getWebviewContent();
  }

  public dispose(): void {
    TensorInspectorPanel.currentPanel = undefined;
    this.panel.dispose();
    while (this.disposables.length) {
      const d = this.disposables.pop();
      if (d) {
        d.dispose();
      }
    }
  }

  private getWebviewContent(): string {
    const webview = this.panel.webview;
    const styleUri = webview.asWebviewUri(
      vscode.Uri.file(path.join(this.extensionUri.fsPath, 'media', 'tensor-inspector.css'))
    );
    const nonce = getNonce();

    // Sample matrix slice (8x8) for demonstration of scientific computing views
    let matrixHtml = '';
    for (let r = 0; r < 8; r++) {
      matrixHtml += '<tr>';
      matrixHtml += `<th>R${r}</th>`;
      for (let c = 0; c < 8; c++) {
        const val = (Math.sin(r * 0.8 + c * 0.5) * 2.5).toFixed(3);
        const intensity = Math.min(Math.abs(parseFloat(val)) / 2.5, 1.0);
        const bg = parseFloat(val) >= 0 
          ? `rgba(255, 87, 34, ${0.15 + intensity * 0.45})` 
          : `rgba(0, 229, 255, ${0.15 + intensity * 0.45})`;
        matrixHtml += `<td class="cell-val" style="background-color: ${bg};">${val}</td>`;
      }
      matrixHtml += '</tr>';
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="${styleUri}">
  <title>Sanskrit Tensor & Autodiff Inspector</title>
</head>
<body>
  <div class="header-container">
    <div class="title-badge">
      <span class="sanskrit-symbol">दिश</span>
      <div>
        <h2 style="margin:0;">Tensor & Autodiff Inspector</h2>
        <span style="font-size:0.8rem; opacity:0.8;">Sanskrit Next High-Performance Computing (AMX/SIMD)</span>
      </div>
    </div>
    <div>
      <span style="background:#00E676; color:#000; padding:4px 8px; border-radius:4px; font-size:0.75rem; font-weight:bold;">TIER-0 ACTIVE</span>
    </div>
  </div>

  <div class="metadata-grid">
    <div class="meta-card">
      <div class="label">Identifier</div>
      <div class="value">A_weights</div>
    </div>
    <div class="meta-card">
      <div class="label">Shape (आकार)</div>
      <div class="value">[128, 128]</div>
    </div>
    <div class="meta-card">
      <div class="label">Strides (पदनिक्षेप)</div>
      <div class="value">[128, 1]</div>
    </div>
    <div class="meta-card">
      <div class="label">Data Type (प्रकार)</div>
      <div class="value">f32 (IEEE 754)</div>
    </div>
    <div class="meta-card">
      <div class="label">Layout (विन्यास)</div>
      <div class="value" style="color:#00E676;">Contiguous C</div>
    </div>
    <div class="meta-card">
      <div class="label">Memory Footprint</div>
      <div class="value">64.0 KB</div>
    </div>
  </div>

  <div class="slice-controls">
    <span style="font-size:0.85rem; font-weight:600;">Active 2D Slice:</span>
    <span style="font-family:monospace; color:#FF5722;">A[0..8, 0..8]</span>
    <span style="margin-left:auto; font-size:0.8rem; color:#aaa;">Values colored by magnitude gradient</span>
  </div>

  <div class="tensor-matrix-view">
    <table class="tensor-table">
      <thead>
        <tr>
          <th>Index</th>
          <th>C0</th><th>C1</th><th>C2</th><th>C3</th><th>C4</th><th>C5</th><th>C6</th><th>C7</th>
        </tr>
      </thead>
      <tbody>
        ${matrixHtml}
      </tbody>
    </table>
  </div>

  <div class="autodiff-card">
    <h3 style="margin-top:0; margin-bottom:0.5rem;">Automatic Differentiation Tape (Wengert Tape)</h3>
    <p style="font-size:0.85rem; color:#aaa; margin-top:0;">Dual-number forward mode and reverse accumulation graph</p>
    <div class="gradient-tape">
      <div class="tape-node">Dual(x: 2.5, dx: 1.0)</div>
      <div class="tape-node">► Pow(4) [val=39.06, dval=62.50]</div>
      <div class="tape-node">► Mul(Const(3)) [val=18.75, dval=15.00]</div>
      <div class="tape-node">► Add [val=57.81, ∇=77.50]</div>
    </div>
  </div>
</body>
</html>`;
  }
}

function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
