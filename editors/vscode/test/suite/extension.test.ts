import * as assert from 'assert';
import { COMMANDS, LANGUAGE_ID, CONFIG_KEYS } from '../../src/constants';

describe('Sanskrit Next Extension Suite', () => {
  it('should define valid language identifier', () => {
    assert.strictEqual(LANGUAGE_ID, 'sanskrit');
  });

  it('should register core compiler commands', () => {
    assert.strictEqual(COMMANDS.RUN, 'sanskrit.run');
    assert.strictEqual(COMMANDS.BUILD, 'sanskrit.build');
    assert.strictEqual(COMMANDS.CHECK, 'sanskrit.check');
    assert.strictEqual(COMMANDS.BENCH, 'sanskrit.bench');
    assert.strictEqual(COMMANDS.DOCTOR, 'sanskrit.doctor');
    assert.strictEqual(COMMANDS.OPEN_TENSOR_INSPECTOR, 'sanskrit.openTensorInspector');
  });

  it('should define valid configuration keys', () => {
    assert.strictEqual(CONFIG_KEYS.COMPILER_PATH, 'sanskrit.compilerPath');
    assert.strictEqual(CONFIG_KEYS.TIER0, 'sanskrit.tier0');
  });
});
