// UEV-B5 (docs/eras/uev.md, "B5. Gate"): the warp gate's c3 row and the UIV casing's research, checked without Minecraft from the
// scripts' text. The runtime proof is the T1 gg_test_uev_gate.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const kube = path.resolve(here, '..', '..', '..', 'pack', 'kubejs');
const gateJson = JSON.parse(fs.readFileSync(path.join(kube, 'data', 'grindless', 'tables', 'gate.json'), 'utf8'));
const uhvGate = fs.readFileSync(path.join(kube, 'server_scripts', 'grindless', 'uhv', 'gate.js'), 'utf8');
const uevGate = fs.readFileSync(path.join(kube, 'server_scripts', 'grindless', 'uev', 'gate.js'), 'utf8');
const lang = fs.readFileSync(path.join(kube, 'client_scripts', 'grindless', 'uev_gate_lang.js'), 'utf8');

const hold = (/var UEV_HOLD = \{[\s\S]*?itemsOut: \[\] \}/.exec(uhvGate) || [''])[0];
const V_UEV = 8388608;

test('c3 is 16 A x V[UEV] for 60 s at Sirius B orbit, circuit 3, and nothing comes out', () => {
  assert.ok(hold, 'UEV_HOLD row');
  assert.match(hold, /name: 'hold'/);
  assert.match(hold, /circuit: 3,/);
  assert.match(hold, new RegExp(`eut: ${V_UEV * 16},`));
  assert.equal(V_UEV * 16, 134217728);
  assert.match(hold, /duration: 1200,/);
  assert.match(uhvGate, /sirius_b_orbit: \['grindless:sirius_b_orbit'\]/);
  assert.match(hold, /site: 'sirius_b_orbit'/);
  assert.match(hold, /itemsOut: \[\] \}/);
  assert.match(hold, /itemsIn: \[\],/, 'every stored item is held, none consumed');
});

test('c3 holds the stored items and fits the gate (6 item inputs)', () => {
  for (const id of ['grindless:tennessine_sample', 'grindless:degenerate_pellet', 'grindless:degenerate_eos_model']) {
    assert.match(hold, new RegExp(`kept:[\\s\\S]*${id}`), id);
  }
  assert.match(hold, /id: 'gtnn:optical_computer', count: 4/);
  const stacks = (hold.match(/\{ id: /g) || []).length;
  assert.equal(stacks, 4);
  assert.ok(stacks + 1 <= 6, `${stacks} stacks and the circuit exceed the gate's 6 item slots`);
});

test('c3 does not clash with the table rows (circuits 1 and 2 stay)', () => {
  // UIV-B1 and UIV-B5 append hold_* rows on c4-c7 (rows whose _why starts with "UIV-"), UXV-B1 on c8-c9, UXV-B6 c10, OpV-A0 c11
  const older = gateJson.types.warp_gate.recipes.filter((r) => !/^(UIV|UXV|OpV)-/.test(r._why || ''));
  const circuits = older.map((r) => r.circuit).sort();
  assert.deepEqual(circuits, [1, 2]);
  assert.ok(!gateJson.types.warp_gate.recipes.some((r) => r.name === 'hold'), 'gate.json is untouched');
});

test('the UIV casing is researched only with the pulsar navigation chart and keeps GTM id', () => {
  assert.match(uevGate, /var CHART = 'grindless:pulsar_navigation_chart'/);
  assert.match(uevGate, /var CASING = 'gtceu:uiv_machine_casing'/);
  assert.equal((uevGate.match(/researchStack\(/g) || []).length, 1);
  assert.match(uevGate, /researchStack\(Item\.of\(CHART\)\)/);
  assert.match(uevGate, /assembly_line\('grindless:uiv_machine_casing'\)/);
  assert.ok(!/registry|event\.create/.test(uevGate), 'no registration');
});

test('no MAX+ id, no UIV hull or UIV-only input', () => {
  for (const text of [uevGate.replace(/^\/\/.*$/gm, ''), hold]) {
    assert.ok(!/stargate|creative|max_|uiv_machine_hull|optical_mainframe|uxv|opv|\bmax\b/i.test(text.replace(/uiv_machine_casing/g, '')));
  }
});

test('the c3 EMI line has en and es text', () => {
  assert.match(lang, /grindless_warp_gate\.hold/);
  assert.match(lang, /'en_us', 'es_es'/);
});
