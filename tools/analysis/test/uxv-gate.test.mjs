// UXV-B6 (docs/eras/uxv.md, "B6. Gate to OpV"): the warp gate's c10 row, the Matrioshka arm-chart row and the OpV casing's research,
// checked from the tables' and scripts' text. The runtime proof is the T1 gg_test_uxv_gate.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const kube = path.join(root, 'pack', 'kubejs');
const tables = path.join(kube, 'data', 'grindless', 'tables');
const gateJson = JSON.parse(fs.readFileSync(path.join(tables, 'gate.json'), 'utf8'));
const matJson = JSON.parse(fs.readFileSync(path.join(tables, 'matrioshka.json'), 'utf8'));
const server = fs.readFileSync(path.join(kube, 'server_scripts', 'grindless', 'uxv', 'gate.js'), 'utf8');
const startup = fs.readFileSync(path.join(kube, 'startup_scripts', 'grindless', 'uxv', 'gate.js'), 'utf8');
const lang = fs.readFileSync(path.join(kube, 'client_scripts', 'grindless', 'uxv_gate_lang.js'), 'utf8');
const code = server.replace(/^\s*\/\/.*$/gm, '');

const gate = gateJson.types.warp_gate.recipes;
const c10 = gate.find((r) => r.name === 'hold_galactic_bulge');
const arm = matJson.types.matrioshka_computing.recipes.find((r) => r.name === 'arm_chart');
const V_UXV = 134217728;
const VA_UXV = 125829120;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(js|json)$/.test(e.name)) out.push(p);
  }
  return out;
}

test('c10 is 16 A x V[UXV] for 60 s at Cygnus X-1, one cartridge in, the bulge chart out', () => {
  assert.ok(c10, 'c10 row');
  assert.match(c10._why, /^UXV-B6:/);
  assert.equal(c10.circuit, 10);
  assert.equal(c10.eut, V_UXV * 16);
  assert.equal(c10.duration, 1200);
  assert.equal(c10.site, 'cygnus_x1_orbit');
  assert.deepEqual(c10.itemsIn, [{ id: 'grindless:frc_cartridge', count: 1 }]);
  assert.deepEqual(c10.itemsOut, [{ id: 'grindless:bulge_chart', count: 1 }]);
});

test('c10 keeps four charts/samples and four mainframes; fits 7 slots; circuits are unique', () => {
  assert.deepEqual(c10.kept, [
    { id: 'grindless:superheavy_census_iii', count: 1 },
    { id: 'grindless:island_chart', count: 1 },
    { id: 'grindless:arm_chart', count: 1 },
    { id: 'grindless:pasta_core_sample', count: 1 },
    { id: 'gtnn:spintronic_mainframe', count: 4 }
  ]);
  assert.equal(c10.itemsIn.length + c10.kept.length + 1, 7);
  const circuits = gate.map((r) => r.circuit).filter((c) => c > 0);
  assert.equal(new Set(circuits).size, circuits.length);
  assert.match(startup, /warp_gate/);
  assert.match(startup, /\['warp_gate', 7\]/);
});

test('arm chart: four records plus the circuit (c4) fit the widened Matrioshka type', () => {
  assert.ok(arm, 'arm row');
  assert.match(arm._why, /^UXV-B6:/);
  assert.equal(arm.circuit, 4);
  assert.equal(arm.eut, 31457280);
  assert.equal(arm.site, true);
  assert.deepEqual(arm.itemsIn.map((i) => i.id).sort(), [
    'grindless:cygnus_vlbi_record', 'grindless:elevator_log', 'grindless:ti44_map', 'grindless:vela_glitch_record']);
  assert.deepEqual(arm.itemsOut, [{ id: 'grindless:arm_chart', count: 1 }]);
  assert.equal(arm.itemsIn.length + 1, 5);
  assert.match(startup, /matrioshka_computing/);
  const circuits = matJson.types.matrioshka_computing.recipes.map((r) => r.circuit).filter((c) => c > 0);
  assert.equal(new Set(circuits).size, circuits.length);
});

test('the OpV casing: bulge chart research, UXV parts only, EU/t >= VA[UXV]', () => {
  assert.match(code, /assembly_line\('grindless:opv_machine_casing'\)/);
  assert.match(code, /var CHART = 'grindless:bulge_chart'/);
  assert.match(code, /var CASING = 'gtceu:opv_machine_casing'/);
  assert.match(code, /stationResearch\(function \(r\) \{ return r\.researchStack\(Item\.of\(CHART\)\)/);
  assert.match(code, /var VA_UXV = 125829120/);
  assert.ok(VA_UXV >= 125829120);
  for (const t of ['uxv_machine_casing', 'uxv_field_generator', 'uxv_emitter', 'gtnn:spintronic_mainframe']) assert.ok(code.includes(t), t);
  assert.ok(!/\b(opv|max)_(machine_hull|input|output|energy)/.test(code), 'no OpV hull or hatch');
  assert.ok(!/console\.error/.test(code));
  assert.ok(!/^\s*\/\/ priority:/m.test(server + startup));
});

test('"only from": nothing else in pack/kubejs produces the bulge chart or the arm chart', () => {
  const own = new Set([path.join(tables, 'gate.json'), path.join(tables, 'matrioshka.json')]);
  for (const f of walk(path.join(kube, 'server_scripts'))) {
    const txt = fs.readFileSync(f, 'utf8').replace(/^\s*\/\/.*$/gm, '');
    for (const id of ['grindless:bulge_chart', 'grindless:arm_chart']) {
      assert.ok(!new RegExp(`(itemOutputs|\\.output)\\([^)]*${id}`).test(txt), `${path.relative(kube, f)} outputs ${id}`);
    }
  }
  for (const f of walk(tables)) {
    if (own.has(f) || f.endsWith('hidden_until.json')) continue;
    const t = fs.readFileSync(f, 'utf8');
    for (const id of ['grindless:bulge_chart', 'grindless:arm_chart']) assert.ok(!t.includes(id), `${path.basename(f)} has ${id}`);
  }
  const outs = (tbl) => Object.values(tbl.types).flatMap((t) => t.recipes).filter((r) => (r.itemsOut || []).some((o) => o.id === 'grindless:bulge_chart'));
  assert.equal(outs(gateJson).length, 1);
  assert.equal(outs(matJson).length, 0);
});

test('lang parity: every key in en_us and es_es', () => {
  const keys = ['gtceu.recipe.grindless_warp_gate.hold_galactic_bulge', 'gtceu.recipe.grindless_matrioshka_computing.arm_chart',
    'emi.grindless.info.uxv_gate_stock.0'];
  assert.match(lang, /\['en_us', 'es_es'\]\.forEach/);
  for (const k of keys) {
    const at = lang.indexOf(`['${k}'`);
    assert.ok(at > 0, k);
    const entry = lang.slice(at, lang.indexOf("']", at) + 2);
    assert.equal((entry.match(/'[^']*'|"[^"]*"/g) || []).length, 3, `${k} needs key, en and es`);
  }
  assert.ok(fs.existsSync(path.join(kube, 'assets', 'emi', 'recipe', 'additions', 'grindless', 'uxv_gate_stock.json')));
});
