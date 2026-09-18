import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import { ToolchainManager } from '../../src/toolchain';

describe('Sanskrit Next Toolchain Suite', () => {
  it('should locate workspace compiler binary if built', async () => {
    const workspaceRoot = path.resolve(__dirname, '../../../..');
    const releaseBin = path.join(workspaceRoot, 'target', 'release', process.platform === 'win32' ? 'sanskrit.exe' : 'sanskrit');
    
    if (fs.existsSync(releaseBin)) {
      const toolchain = await ToolchainManager.getToolchain(false);
      assert.ok(toolchain !== null, 'Toolchain should be discovered');
      assert.ok(toolchain.version.includes('2.0.0'), 'Version should match 2.0.0');
    }
  });
});
