// D3-GATERING (docs/eras/lines-uv-uhv.md "W11"): the gate ring's MgB2 coil chain, checked statically.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const kube = path.resolve(here, '..', '..', '..', 'pack', 'kubejs');
const read = (...p) => fs.readFileSync(path.join(kube, ...p), 'utf8');
const ring = read('server_scripts', 'grindless', 'uhv', 'gate_ring.js');
const startup = read('startup_scripts', 'grindless', 'uhv', 'gate_ring.js');
const lang = read('client_scripts', 'grindless', 'uhv_gate_ring_lang.js');
const gate = read('server_scripts', 'grindless', 'uhv', 'gate.js');
const ITEMS = ['mgb2_cable', 'gate_coil_winding', 'reacted_gate_coil', 'impregnated_gate_coil', 'qualified_gate_coil'];

test('five items: registered, named, with a texture', () => {
  for (const n of ITEMS) {
    assert.ok(startup.includes(`'${n}'`), `registered ${n}`);
    assert.ok(lang.includes(`${n}:`), `named ${n}`);
    assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'item', `${n}.png`)), `texture ${n}`);
  }
});

test('the chain: each stage consumes the previous one', () => {
  assert.match(ring, /naquadria_magnets\('grindless:mgb2_cable'\)[\s\S]*?\.circuit\(13\)[\s\S]*?8x gtceu:magnesium_diboride_single_wire', '2x #forge:foils\/copper'/);
  assert.match(ring, /\.circuit\(14\)[\s\S]*?'4x grindless:mgb2_cable', '4x #forge:foils\/kapton_k'/);
  assert.match(ring, /electric_blast_furnace\('grindless:reacted_gate_coil'\)[\s\S]*?grindless:gate_coil_winding[\s\S]*?blastFurnaceTemp\(973\)/);
  assert.match(ring, /composite_curing\('grindless:impregnated_gate_coil'\)[\s\S]*?grindless:reacted_gate_coil[\s\S]*?gtceu:epoxy', 288/);
  assert.match(ring, /\.circuit\(15\)[\s\S]*?grindless:impregnated_gate_coil[\s\S]*?notConsumableFluid\(Fluid\.of\('gtceu:liquid_helium', 1000\)\)/);
});

test('conservation: argon is returned, the helium charge is not consumed', () => {
  assert.equal((ring.match(/gtceu:argon', 1000/g) || []).length, 2);
  assert.doesNotMatch(ring, /inputFluids\(Fluid\.of\('gtceu:liquid_helium'/);
});

test('magnet works circuits 13-15 are free of other rows', () => {
  const mw = JSON.parse(read('data', 'grindless', 'tables', 'magnet_works.json'));
  const used = new Set((mw.recipes || []).map((r) => r.circuit));
  for (const c of [13, 14, 15]) assert.ok(!used.has(c), `circuit ${c}`);
});

test('the casing: 1 qualified coil + 4 neutronium plates + frame -> 2 casings; the bare MgB2 wire is gone', () => {
  assert.match(gate, /'1x grindless:qualified_gate_coil', '4x gtceu:neutronium_plate', '1x gtceu:neutronium_frame'/);
  assert.match(gate, /itemOutputs\('2x grindless:warp_gate_casing'\)/);
  assert.doesNotMatch(gate, /magnesium_diboride_single_wire/);
});
