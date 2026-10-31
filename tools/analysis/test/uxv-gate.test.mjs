// UXV-B6 (docs/eras/uxv.md, "B6. Gate to OpV"): the warp gate's c10 row, the Matrioshka arm-chart row and the OpV casing's research,
// checked from the tables' and scripts' text. The runtime proof is the T1 gg_test_uxv_gate.
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

// GTM builds the recipe types only after the gtceu:recipe_type event: the widening must land on the built type in the gtceu:machine event
// (the 0f08570a client EMI audit showed the arm chart's fourth record missing while the resize sat in the recipe_type event).
test('the widening reaches the built warp gate and Matrioshka types, in either script order, never narrowing', () => {
  for (const gateFirst of [false, true]) {
    const callbacks = [];
    const built = new Map();
    const G = {};
    const publish = () => {
      G.warpGate = { machines: { gate: { maxIO: { itemsIn: 6, itemsOut: 2, fluidsIn: 0, fluidsOut: 0 } } } };
      G.matrioshka = { machines: [
        { type: 'matrioshka_computing', maxIO: { itemsIn: 3, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 } },
        { type: 'droplet_radiator_assembly', maxIO: { itemsIn: 4, itemsOut: 2, fluidsIn: 0, fluidsOut: 0 } }
      ] };
      callbacks.push(['gtceu:recipe_type', () => {
        built.set('warp_gate', { in: G.warpGate.machines.gate.maxIO.itemsIn, out: 2, fin: 0, fout: 3 });
        built.set('matrioshka_computing', { in: G.matrioshka.machines[0].maxIO.itemsIn, out: 1, fin: 0, fout: 0 });
      }]);
    };
    const errors = [];
    const context = vm.createContext({
      global: { grindless: G }, console: { error: (m) => errors.push(m), info() {}, warn() {}, log() {} },
      GTCEuStartupEvents: { registry: (kind, cb) => callbacks.push([kind, cb]) },
      Java: { loadClass: (id) => ({ CAP: /Fluid/.test(id) ? 'fluid' : 'item' }) },
      GTRecipeTypes: { get: (name) => {
        const t = built.get(name);
        if (!t) return null;
        return {
          getMaxInputs: (cap) => (cap === 'item' ? t.in : t.fin),
          getMaxOutputs: (cap) => (cap === 'item' ? t.out : t.fout),
          setMaxIOSize: (a, b, c, d) => Object.assign(t, { in: a, out: b, fin: c, fout: d })
        };
      } }
    });
    if (!gateFirst) publish();
    vm.runInContext(startup, context);
    if (gateFirst) publish();
    for (const kind of ['gtceu:recipe_type', 'gtceu:machine']) for (const [k, cb] of callbacks) if (k === kind) cb({});
    assert.deepEqual(errors, [], `no error (gate script ${gateFirst ? 'first' : 'last'})`);
    assert.deepEqual(built.get('warp_gate'), { in: 7, out: 2, fin: 0, fout: 3 }, 'warp gate: 7 items in, the built fluid output kept');
    assert.deepEqual(built.get('matrioshka_computing'), { in: 5, out: 1, fin: 0, fout: 0 }, 'Matrioshka: 5 items in');
    assert.equal(G.matrioshka.machines[0].maxIO.itemsIn, 5, 'the published figure the server slot check reads');
    assert.equal(G.matrioshka.machines[1].maxIO.itemsIn, 4, 'the droplet radiator is untouched');
  }
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
  for (const f of [server, startup]) assert.match(f, /^\/\/ priority: -?\d+\r?\n/, 'the integrator stamped the load order');
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
