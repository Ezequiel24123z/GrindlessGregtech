// Active-block ceiling per structure (lib/active_blocks.mjs). Fixtures plus one static run of the pack's scripts; T0: local, deterministic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { activeBlocksOf, activeBlockCounts, activeBlockViolations, MAX_ACTIVE_BLOCKS } from '../lib/active_blocks.mjs';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const grid = (id, n, block) => ({
  id,
  slices: [['S', ...Array.from({ length: n }, () => 'C')].map((r) => r)],
  symbols: { S: { kind: 'controller' }, C: { kind: 'blocks', blocks: [block] } },
});

test('it counts GTM ActiveBlocks (coils, fusion and superconducting coils, heat vents), through oneOf cells, and nothing else', () => {
  assert.equal(activeBlocksOf(grid('a', 5, 'gtceu:fusion_coil')), 5);
  assert.equal(activeBlocksOf(grid('a', 4, 'gtceu:cupronickel_coil_block')), 4);
  assert.equal(activeBlocksOf(grid('a', 3, 'gtceu:heat_vent')), 3);
  assert.equal(activeBlocksOf(grid('a', 6, 'grindless:feeder_coil_casing')), 0, 'our plain casings are not');
  assert.equal(activeBlocksOf(grid('a', 7, 'grindless:hftacn_coil_block')), 7, 'our gtceu:coil blocks are');
  assert.equal(activeBlocksOf(grid('a', 8, 'grindless:metallic_hydrogen_coil_block')), 8);
  assert.equal(activeBlocksOf(grid('a', 6, 'gtceu:robust_machine_casing')), 0);
  const either = { id: 'b', slices: [['SCC']], symbols: { S: { kind: 'controller' }, C: { kind: 'oneOf', options: [{ kind: 'part', ability: 'input_bus' }, { kind: 'blocks', blocks: ['gtceu:superconducting_coil'] }] } } };
  assert.equal(activeBlocksOf(either), 2);
});

test('a structure above the ceiling fails and one at it passes', () => {
  const at = grid('at', MAX_ACTIVE_BLOCKS, 'gtceu:fusion_coil');
  const over = grid('over', MAX_ACTIVE_BLOCKS + 1, 'gtceu:fusion_coil');
  assert.deepEqual(activeBlockViolations([at]), []);
  assert.deepEqual(activeBlockViolations({ at, over }).map((r) => `${r.id}:${r.count}`), [`over:${MAX_ACTIVE_BLOCKS + 1}`]);
});

test('the pack passes today: every structure is under the ceiling', () => {
  const counts = activeBlockCounts(runPackScripts(path.join(here, '..', '..', '..', 'pack')).docs.structures.structures);
  assert.deepEqual(counts.filter((r) => r.count > MAX_ACTIVE_BLOCKS), []);
  assert.ok(counts.find((r) => r.id === 'gtceu:annihilation_engine').count <= 264, 'the engine stays under the ceiling');
  assert.equal(counts.find((r) => r.id === 'gtceu:pulsar_wind_trap').count, 28, 'counted with our grindless coil blocks');
});
