// OpV-G1 (docs/eras/opv.md, "Gate to MAX"): the warp gate's c13 row, its nine slots and the MAX casing's research, checked from the tables'
// and scripts' text. The runtime proof is the T1 gg_test_opv_gate.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const kube = path.join(root, 'pack', 'kubejs');
const tables = path.join(kube, 'data', 'grindless', 'tables');
const gateJson = JSON.parse(fs.readFileSync(path.join(tables, 'gate.json'), 'utf8'));
const server = fs.readFileSync(path.join(kube, 'server_scripts', 'grindless', 'opv', 'gate.js'), 'utf8');
const startup = fs.readFileSync(path.join(kube, 'startup_scripts', 'grindless', 'opv', 'gate.js'), 'utf8');
const lang = fs.readFileSync(path.join(kube, 'client_scripts', 'grindless', 'opv_gate_lang.js'), 'utf8');
const code = server.replace(/^\s*\/\/.*$/gm, '');

const gate = gateJson.types.warp_gate.recipes;
const c13 = gate.find((r) => r.name === 'hold_sgr_a');
const V_OPV = 536870912;
const VA_OPV = 503316480;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(js|json)$/.test(e.name)) out.push(p);
  }
  return out;
}

test('c13 is 16 A x V[OpV] = 2^33 EU/t (half what two OpV 16 A hatches carry) for 1,200 t at Cygnus X-1, circuit 13', () => {
  assert.ok(c13, 'c13 row');
  assert.match(c13._why, /^OpV-G1:/);
  assert.equal(c13.circuit, 13);
  assert.equal(c13.eut, 16 * V_OPV);
  assert.ok(c13.eut <= 2 * 16 * V_OPV);
  assert.equal(c13.eut, 2 ** 33);
  assert.equal(c13.duration, 1200);
  assert.equal(c13.site, 'cygnus_x1_orbit');
});

test('c13 burns the core and the seed, keeps the six, writes the Sgr A* chart; 9 slots; circuits unique', () => {
  assert.deepEqual(c13.itemsIn, [{ id: 'grindless:kugelblitz_core', count: 1 }, { id: 'grindless:launched_bulge_seed', count: 1 }]);
  assert.deepEqual(c13.kept, [
    { id: 'grindless:bulge_light_census', count: 1 },
    { id: 'grindless:stable_exotic_matter', count: 1 },
    { id: 'grindless:tetron_array', count: 1 },
    { id: 'grindless:superheavy_census_iv', count: 1 },
    { id: 'grindless:bulge_chart', count: 1 },
    { id: 'gtnn:cosmic_mainframe', count: 4 }
  ]);
  assert.deepEqual(c13.itemsOut, [{ id: 'grindless:sgr_a_chart', count: 1 }]);
  assert.equal(c13.itemsIn.length + c13.kept.length + 1, 9);
  const circuits = gate.map((r) => r.circuit).filter((c) => c > 0);
  assert.equal(new Set(circuits).size, circuits.length);
});

test('only c10, c11 and c13 are at or above 2^31 EU/t; c12 stays at 2^30', () => {
  const big = gate.filter((r) => r.eut >= 2 ** 31).map((r) => r.circuit).sort((a, b) => a - b);
  assert.deepEqual(big, [10, 11, 13]);
  assert.equal(gate.find((r) => r.circuit === 12).eut, 2 ** 30);
});

test('the widening reaches the built warp gate type to 9 item slots, never narrowing', () => {
  for (const start of [6, 7, 12]) {
    const callbacks = [];
    const built = { in: start, out: 2, fin: 0, fout: 3 };
    const G = { warpGate: { machines: { gate: { maxIO: { itemsIn: start, itemsOut: 2, fluidsIn: 0, fluidsOut: 3 } } } } };
    const errors = [];
    const context = vm.createContext({
      global: { grindless: G }, console: { error: (m) => errors.push(m), info() {}, warn() {}, log() {} },
      GTCEuStartupEvents: { registry: (kind, cb) => callbacks.push([kind, cb]) },
      Java: { loadClass: (id) => ({ CAP: /Fluid/.test(id) ? 'fluid' : 'item' }) },
      GTRecipeTypes: { get: (name) => (name !== 'warp_gate' ? null : {
        getMaxInputs: (cap) => (cap === 'item' ? built.in : built.fin),
        getMaxOutputs: (cap) => (cap === 'item' ? built.out : built.fout),
        setMaxIOSize: (a, b, c, d) => Object.assign(built, { in: a, out: b, fin: c, fout: d })
      }) }
    });
    vm.runInContext(startup, context);
    for (const [k, cb] of callbacks) if (k === 'gtceu:machine') cb({});
    assert.deepEqual(errors, []);
    assert.deepEqual(built, { in: Math.max(start, 9), out: 2, fin: 0, fout: 3 });
    assert.equal(G.warpGate.machines.gate.maxIO.itemsIn, Math.max(start, 9));
  }
});

test('the MAX casing: Sgr A* chart research, OpV parts, at VA[OpV], eight distinct items and two fluids, no MAX hull or hatch', () => {
  assert.match(code, /assembly_line\('grindless:max_machine_casing'\)/);
  assert.match(code, /var CHART = 'grindless:sgr_a_chart'/);
  assert.match(code, /var CASING = 'gtceu:max_machine_casing'/);
  assert.match(code, /stationResearch\(function \(r\) \{ return r\.researchStack\(Item\.of\(CHART\)\)/);
  assert.match(code, new RegExp(`var VA_OPV = ${VA_OPV}\\b`));
  assert.match(code, /EUt\(VA_OPV\)/);
  const m = /var inputs = \[([^\]]*)\]/.exec(code);
  assert.ok(m, 'inputs list');
  const ids = [...m[1].matchAll(/'(?:\d+x )?([a-z_]+:[a-z0-9_]+)'/g)].map((x) => x[1]);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.length >= 6 && ids.length === 8, `${ids.length} distinct items`);
  assert.equal((code.match(/\['gtceu:[a-z_]+', \d+\]/g) || []).length, 2, 'two fluids');
  for (const t of ['gtceu:opv_machine_casing', 'gtceu:opv_field_generator', 'gtceu:opv_emitter']) assert.ok(ids.includes(t), t);
  assert.ok(!ids.some((i) => /^gtceu:max_/.test(i) || /mainframe|circuit/.test(i)), 'no MAX id, no circuit in the casing');
  assert.ok(!/gtceu:max_(machine_hull|input|output|energy)/.test(code), 'no MAX hull or hatch');
  assert.ok(!/console\.error/.test(code));
});

test('"only from": nothing else in pack/kubejs produces the Sgr A* chart', () => {
  for (const f of walk(path.join(kube, 'server_scripts'))) {
    const txt = fs.readFileSync(f, 'utf8').replace(/^\s*\/\/.*$/gm, '');
    assert.ok(!/(itemOutputs|\.output)\([^)]*grindless:sgr_a_chart/.test(txt), `${path.relative(kube, f)} outputs the chart`);
  }
  const outsOf = (node, acc = []) => {
    if (Array.isArray(node)) node.forEach((x) => outsOf(x, acc));
    else if (node && typeof node === 'object') for (const [k, v] of Object.entries(node)) { if (/out/i.test(k)) acc.push(JSON.stringify(v)); else outsOf(v, acc); }
    return acc;
  };
  for (const f of walk(tables)) {
    if (f.endsWith('gate.json') || f.endsWith('hidden_until.json')) continue;
    assert.ok(!outsOf(JSON.parse(fs.readFileSync(f, 'utf8'))).some((s) => s.includes('"grindless:sgr_a_chart"')), `${path.basename(f)} outputs the chart`);
  }
  const outs = gate.filter((r) => (r.itemsOut || []).some((o) => o.id === 'grindless:sgr_a_chart'));
  assert.equal(outs.length, 1);
});

test('lang parity: every key in en_us and es_es, and the EMI info page exists', () => {
  const keys = ['gtceu.recipe.grindless_warp_gate.hold_sgr_a', 'emi.grindless.info.opv_gate_stock.0'];
  assert.match(lang, /\['en_us', 'es_es'\]\.forEach/);
  for (const k of keys) {
    const at = lang.indexOf(`['${k}'`);
    assert.ok(at > 0, k);
    const entry = lang.slice(at, lang.indexOf("']", at) + 2);
    assert.equal((entry.match(/'[^']*'|"[^"]*"/g) || []).length, 3, `${k} needs key, en and es`);
  }
  const page = JSON.parse(fs.readFileSync(path.join(kube, 'assets', 'emi', 'recipe', 'additions', 'grindless', 'opv_gate_stock.json'), 'utf8'));
  assert.deepEqual(page.stacks, ['item:grindless:sgr_a_chart']);
});
