// UIV-B5 (docs/eras/uiv.md, "B5. Gate"): the warp gate's c7 hold row and the UXV casing's research, checked without Minecraft from the
// tables' and scripts' text. The runtime proof is the T1 gg_test_uiv_gate.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const kube = path.join(root, 'pack', 'kubejs');
const gateJson = JSON.parse(fs.readFileSync(path.join(kube, 'data', 'grindless', 'tables', 'gate.json'), 'utf8'));
const gateJs = fs.readFileSync(path.join(kube, 'server_scripts', 'grindless', 'uiv', 'gate.js'), 'utf8');
const lang = fs.readFileSync(path.join(kube, 'client_scripts', 'grindless', 'uiv_gate_lang.js'), 'utf8');
const uhvGate = fs.readFileSync(path.join(kube, 'server_scripts', 'grindless', 'uhv', 'gate.js'), 'utf8');
const code = gateJs.replace(/^\s*\/\/.*$/gm, '');

const rows = gateJson.types.warp_gate.recipes;
const hold = rows.find((r) => r.name === 'hold_cygnus_ring');
const V_UIV = 33554432;

test('c7 is 16 A x V[UIV] for 60 s at Cygnus X-1, one pellet in, nothing out', () => {
  assert.ok(hold, 'c7 row');
  assert.match(hold._why, /^UIV-B5:/);
  assert.equal(hold.circuit, 7);
  assert.equal(hold.eut, V_UIV * 16);
  assert.equal(hold.eut, 536870912);
  assert.equal(hold.duration, 1200);
  assert.equal(hold.site, 'cygnus_x1_orbit');
  assert.deepEqual(hold.itemsIn, [{ id: 'grindless:neutronium_pellet', count: 1 }]);
  assert.deepEqual(hold.itemsOut, []);
  assert.match(uhvGate, /SITES\.cygnus_x1_orbit = \['grindless:cygnus_x1_orbit'\]/);
});

test('c7 keeps the four stacks and fits the gate (6 item slots with the circuit)', () => {
  assert.deepEqual(hold.kept, [
    { id: 'grindless:superheavy_census_ii', count: 1 },
    { id: 'grindless:ns_eos_chart', count: 1 },
    { id: 'grindless:recovered_half_sled', count: 1 },
    { id: 'gtnn:optical_mainframe', count: 4 }
  ]);
  assert.equal(hold.itemsIn.length + hold.kept.length + 1, 6);
});

test('c7 owns its circuit and name, and only one row of the table is new', () => {
  assert.equal(rows.filter((r) => r.circuit === 7).length, 1);
  assert.equal(new Set(rows.map((r) => r.circuit)).size, rows.length);
  assert.equal(new Set(rows.map((r) => r.name)).size, rows.length);
  assert.equal(rows.filter((r) => /^UIV-B5:/.test(r._why || '')).length, 1);
});

test('the UXV casing is researched only with the Kerr chart and keeps the GTM id', () => {
  assert.match(code, /var CHART = 'grindless:kerr_chart'/);
  assert.match(code, /var CASING = 'gtceu:uxv_machine_casing'/);
  assert.equal((code.match(/researchStack\(/g) || []).length, 1);
  assert.match(code, /researchStack\(Item\.of\(CHART\)\)/);
  assert.match(code, /stationResearch\(/);
  assert.ok(!/researchWithoutRecipe/.test(code));
  assert.match(code, /assembly_line\('grindless:uxv_machine_casing'\)/);
  assert.match(code, /UG\.casing = /);
  assert.match(code, /G\.uivGate \|\| \(G\.uivGate = \{\}\)/);
  assert.ok(!/registry|event\.create|console\.error/.test(code));
});

test('the casing recipe takes the UIV parts one tier up from UEV-B5', () => {
  for (const id of ['gtceu:uiv_machine_casing', 'grindless:uiv_field_generator', 'grindless:uiv_emitter', 'gtnn:optical_mainframe']) {
    assert.ok(code.includes(id), id);
  }
  assert.match(code, /itemOutputs\('2x ' \+ CASING\)/);
});

test('no UXV hull, no MAX or MAX+ id anywhere in the gate', () => {
  const text = code.replace(/uxv_machine_casing/g, '') + JSON.stringify(hold) + lang.replace(/^\s*\/\/.*$/gm, '');
  assert.ok(!/uxv_machine_hull|uxv_.*hatch|stargate|creative|black_hole|sagittarius_a|\bmax_|\bopv\b|\bmax\b/i.test(text));
});

test('the c7 EMI line has en and es text', () => {
  assert.match(lang, /grindless_warp_gate\.hold_cygnus_ring/);
  assert.match(lang, /'en_us', 'es_es'/);
});
