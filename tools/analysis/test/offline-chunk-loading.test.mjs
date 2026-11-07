import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parse } from '../../quests/lib/snbt.mjs';

const root = new URL('../../../', import.meta.url);

test('FTB Chunks defaults allow offline loading without overriding other server policies', () => {
  const config = parse(fs.readFileSync(new URL('pack/defaultconfigs/ftbchunks/ftbchunks-world.snbt', root), 'utf8'));
  assert.deepEqual(config, { force_load_mode: 'always' });
  assert.equal(fs.existsSync(new URL('pack/defaultconfigs/ftbchunks-world.snbt', root)), false,
    'FTB Library loads defaults from the ftbchunks subdirectory, not the Forge defaults root');
});
