// LuV living-circuit line L2 (package D2-PEDOT): butane -> thiophene -> ... -> EDOT -> PEDOT:PSS, with its feeders and bromine recovery.
// Pins every row and the conservation of C, H, O, S, Br, Zn and Na over one run (1 butane in, 1,000 mB PEDOT:PSS out).
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runServerScripts } from '../lib/kubejs_recipes_sandbox.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const PACK = path.join(ROOT, 'pack');

const RUN = runServerScripts({
  packRoot: PACK, scripts: ['kubejs/server_scripts/grindless/luv/pedot.js'], recipes: {},
  startup: ['kubejs/startup_scripts/grindless/luv/pedot.js'],
  before(sandbox) {
    const recipes = sandbox.ServerEvents.recipes;
    sandbox.ServerEvents.recipes = (fn) => recipes((event) => { event.remove = () => {}; fn(event); });
  },
});
const calls = (r, m) => r.calls.filter((c) => c[0] === m).map((c) => c.slice(1));
const byId = (id) => { const r = RUN.built.find((x) => x.id === id); assert.ok(r, id); return r; };

// atoms in one unit (1 item, or 1000 mB of a fluid; elemental gases and bromine count one atom)
const COMP = {
  'gtceu:butane': { C: 4, H: 10 }, 'gtceu:sulfur_dust': { S: 1 }, 'gtceu:thiophene': { C: 4, H: 4, S: 1 },
  'gtceu:hydrogen_sulfide': { H: 2, S: 1 }, 'gtceu:bromine': { Br: 1 }, 'gtceu:tetrabromothiophene_dust': { C: 4, Br: 4, S: 1 },
  'gtceu:hydrogen_bromide': { H: 1, Br: 1 }, 'gtceu:zinc_dust': { Zn: 1 }, 'gtceu:zinc_bromide_dust': { Zn: 1, Br: 2 },
  'gtceu:dibromothiophene': { C: 4, H: 2, Br: 2, S: 1 }, 'gtceu:sodium_methoxide': { Na: 1, C: 1, H: 3, O: 1 },
  'gtceu:sodium_bromide_dust': { Na: 1, Br: 1 }, 'gtceu:dimethoxythiophene': { C: 6, H: 8, O: 2, S: 1 },
  'gtceu:ethylene_glycol': { C: 2, H: 6, O: 2 }, 'gtceu:edot': { C: 6, H: 6, O: 2, S: 1 }, 'gtceu:methanol': { C: 1, H: 4, O: 1 },
  'gtceu:polystyrene_sulfonate': { C: 8, H: 8, O: 3, S: 1 }, 'gtceu:sodium_persulfate': { Na: 2, S: 2, O: 8 },
  'gtceu:pedot_pss': { C: 14, H: 12, O: 5, S: 2 }, 'gtceu:sodium_sulfate_dust': { Na: 2, S: 1, O: 4 },
  'gtceu:sulfuric_acid': { H: 2, S: 1, O: 4 }, 'gtceu:sodium_dust': { Na: 1 }, 'gtceu:hydrogen': { H: 1 },
  'gtceu:ethylene': { C: 2, H: 4 }, 'gtceu:oxygen': { O: 1 }, 'gtceu:ethylene_oxide': { C: 2, H: 4, O: 1 },
  'minecraft:water': { H: 2, O: 1 }, 'gtceu:styrene': { C: 8, H: 8 }, 'gtceu:polystyrene_dust': { C: 8, H: 8 },
  'gtceu:sulfur_trioxide': { S: 1, O: 3 },
};
function side(r, items, fluids) {
  const t = {};
  const add = (id, n) => { const c = COMP[id]; assert.ok(c, `${r.id}: composition of ${id}`); for (const [e, k] of Object.entries(c)) t[e] = (t[e] || 0) + k * n; };
  calls(r, items).flat(2).forEach((s) => { const m = /^(?:(\d+)x )?(.+)$/.exec(String(s)); add(m[2], Number(m[1] || 1)); });
  calls(r, fluids).flat(2).forEach((f) => add(f.fluid, f.amount / 1000));
  return t;
}

const LINE = [
  ['thiophene_sulfurisation', 'gtceu:chemical_reactor'], ['thiophene_bromination', 'gtceu:chemical_reactor'],
  ['dibromothiophene_reduction', 'gtceu:chemical_reactor'], ['dimethoxythiophene_methoxylation', 'gtceu:large_chemical_reactor'],
  ['edot_transetherification', 'gtceu:large_chemical_reactor'], ['pedot_pss_polymerisation', 'gtceu:large_chemical_reactor'],
  ['sodium_methoxide_synthesis', 'gtceu:chemical_reactor'], ['ethylene_oxide_oxidation', 'gtceu:chemical_reactor'],
  ['ethylene_glycol_hydration', 'gtceu:chemical_reactor'], ['polystyrene_polymerisation', 'gtceu:chemical_reactor'],
  ['polystyrene_sulfonation', 'gtceu:chemical_reactor'], ['hydrogen_bromide_electrolysis', 'gtceu:electrolyzer'],
  ['zinc_bromide_electrolysis', 'gtceu:electrolyzer'], ['sodium_bromide_electrolysis', 'gtceu:electrolyzer'],
];

test('every row exists on its machine at LuV voltage or below, with real times', () => {
  for (const [name, type] of LINE) {
    const r = byId(`grindless:${name}`);
    assert.equal(r.type, type, name);
    const eut = calls(r, 'EUt')[0][0];
    assert.ok(eut <= 30720, `${name}: within LuV`);
    assert.ok(calls(r, 'duration')[0][0] <= 600, `${name}: time not inflated`);
  }
});

test('the key rows follow the spec', () => {
  const s = byId('grindless:thiophene_sulfurisation');
  assert.deepEqual(calls(s, 'itemInputs')[0], ['4x gtceu:sulfur_dust']);
  assert.deepEqual(calls(s, 'outputFluids')[0], [{ fluid: 'gtceu:thiophene', amount: 1000 }, { fluid: 'gtceu:hydrogen_sulfide', amount: 3000 }]);
  const b = byId('grindless:thiophene_bromination');
  assert.deepEqual(calls(b, 'itemOutputs')[0], ['1x gtceu:tetrabromothiophene_dust']);
  const d = byId('grindless:dibromothiophene_reduction');
  assert.deepEqual(calls(d, 'itemInputs')[0], ['1x gtceu:tetrabromothiophene_dust', '2x gtceu:zinc_dust']);
  assert.deepEqual(calls(d, 'notConsumableFluid')[0], [{ fluid: 'gtceu:acetic_acid', amount: 1000 }]);
  const m = byId('grindless:dimethoxythiophene_methoxylation');
  assert.deepEqual(calls(m, 'inputFluids')[0][1], { fluid: 'gtceu:sodium_methoxide', amount: 2000 });
  const p = byId('grindless:pedot_pss_polymerisation');
  assert.deepEqual(calls(p, 'outputFluids')[0][0], { fluid: 'gtceu:pedot_pss', amount: 1000 });
  assert.ok(calls(p, 'inputFluids')[0].some((f) => f.fluid === 'gtceu:sodium_persulfate'));
});

test('C, H, O, S, Br, Zn and Na balance in every row', () => {
  for (const [name] of LINE) {
    const r = byId(`grindless:${name}`);
    const i = side(r, 'itemInputs', 'inputFluids');
    const o = side(r, 'itemOutputs', 'outputFluids');
    for (const e of new Set([...Object.keys(i), ...Object.keys(o)])) assert.equal(i[e] || 0, o[e] || 0, `${name}: ${e}`);
  }
});

test('one run closes: bromine, zinc, sodium, methanol, hydrogen bromide and ethylene glycol loop; only butane, sulfur, ethylene and the oxidant are consumed', () => {
  // runs per run of the line: the line's rows once, the feeders once, the three recoveries once
  const net = {};
  const flows = {};
  for (const [name] of LINE) {
    const r = byId(`grindless:${name}`);
    const k = { zinc_bromide_electrolysis: 2, sodium_bromide_electrolysis: 2 }[name] || 1;
    for (const [kind, sign] of [['inputFluids', 1], ['outputFluids', -1]]) calls(r, kind).flat(2).forEach((f) => { flows[f.fluid] = (flows[f.fluid] || 0) + k * sign * f.amount; });
    for (const [kind, sign] of [['itemInputs', 1], ['itemOutputs', -1]]) calls(r, kind).flat(2).forEach((s) => {
      const m = /^(?:(\d+)x )?(.+)$/.exec(String(s)); net[m[2]] = (net[m[2]] || 0) + k * sign * Number(m[1] || 1);
    });
  }
  for (const f of ['gtceu:bromine', 'gtceu:hydrogen_bromide', 'gtceu:methanol', 'gtceu:ethylene_glycol', 'gtceu:ethylene_oxide', 'gtceu:sodium_methoxide',
    'gtceu:thiophene', 'gtceu:dibromothiophene', 'gtceu:dimethoxythiophene', 'gtceu:edot', 'gtceu:polystyrene_sulfonate']) assert.equal(flows[f] || 0, 0, `${f} loops`);
  for (const i of ['gtceu:zinc_dust', 'gtceu:sodium_dust', 'gtceu:zinc_bromide_dust', 'gtceu:sodium_bromide_dust', 'gtceu:tetrabromothiophene_dust', 'gtceu:polystyrene_dust']) {
    assert.equal(net[i] || 0, 0, `${i} loops`);
  }
});

test('every row has a circuit or an input no other row of its type shares', () => {
  const seen = {};
  for (const [name, type] of LINE) {
    const r = byId(`grindless:${name}`);
    const key = [type, calls(r, 'circuit').join(), calls(r, 'itemInputs').join(), calls(r, 'inputFluids').map((a) => a.map((f) => f.fluid)).join()].join('|');
    assert.ok(!seen[key], `${name} collides with ${seen[key]}`);
    seen[key] = name;
  }
});
