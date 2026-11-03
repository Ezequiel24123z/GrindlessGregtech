// LuV L5 ZBLAN from fluorides (package D2-ZBLAN): the fluorspar kiln's four fluoride rows, the dopant blend and the ZBLAN batch on the large
// chemical reactor (D3-9), replacing grindless:mixer/zblan. Pins the rows and the conservation of every element and of the cation shares.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { runServerScripts } from '../lib/kubejs_recipes_sandbox.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const PACK = path.join(ROOT, 'pack');
const KILN = 'kubejs/server_scripts/grindless/iv/fluorspar_kiln.js';
const LUV = 'kubejs/server_scripts/grindless/luv/orbital_industry.js';

const kiln = runServerScripts({ packRoot: PACK, scripts: [KILN], recipes: {} });
const luv = runServerScripts({
  packRoot: PACK, scripts: [LUV], recipes: {},
  before(sandbox) {
    sandbox.global.grindless.orbitalIndustry = {};
    sandbox.global.grindless.orbits = { allow: (b) => b };
    sandbox.Java = { loadClass: () => ({ CLEANROOM: 'cleanroom' }) };
    const recipes = sandbox.ServerEvents.recipes;
    sandbox.ServerEvents.recipes = (fn) => recipes((event) => { event.remove = () => {}; fn(event); });
  },
});
const calls = (r, m) => r.calls.filter((c) => c[0] === m).map((c) => c.slice(1));
const one = (r, m) => { const c = calls(r, m); assert.equal(c.length, 1, `${r.id}: one ${m}`); return c[0]; };
const byId = (run, id) => run.built.find((r) => r.id === id);

// atoms in one unit (1 dust, or 1,000 mB of a fluid; a dust counts the atoms of its formula)
const DUST_ATOMS = {
  'gtceu:barium_dust': { Ba: 1 }, 'gtceu:barium_fluoride_dust': { Ba: 1 / 3, F: 2 / 3 },
  'gtceu:lanthanum_oxide_dust': { La: 0.4, O: 0.6 }, 'gtceu:lanthanum_fluoride_dust': { La: 0.25, F: 0.75 },
  'gtceu:sapphire_dust': { Al: 0.4, O: 0.6 }, 'gtceu:aluminium_fluoride_dust': { Al: 0.25, F: 0.75 },
  'gtceu:sodium_hydroxide_dust': { Na: 1 / 3, O: 1 / 3, H: 1 / 3 }, 'gtceu:sodium_fluoride_dust': { Na: 0.5, F: 0.5 },
  'gtceu:zirconium_tetrafluoride_dust': { Zr: 0.2, F: 0.8 },
};
const FLUID_ATOMS = { 'gtceu:hydrofluoric_acid': { H: 1, F: 1 }, 'gtceu:hydrogen': { H: 1 }, 'minecraft:water': { H: 2, O: 1 } };
function atoms(r, items, fluids) {
  const t = {};
  const add = (c, n) => { for (const [e, k] of Object.entries(c)) t[e] = (t[e] || 0) + k * n; };
  for (const s of calls(r, items).flat(2)) {
    const m = /^(?:(\d+)x )?(.+)$/.exec(String(s));
    assert.ok(DUST_ATOMS[m[2]], `${r.id}: composition of ${m[2]}`);
    const c = DUST_ATOMS[m[2]];
    add(c, Number(m[1] || 1));
  }
  for (const f of calls(r, fluids).flat(2)) { assert.ok(FLUID_ATOMS[f.fluid], `${r.id}: composition of ${f.fluid}`); add(FLUID_ATOMS[f.fluid], f.amount / 1000); }
  const out = {};
  for (const [e, v] of Object.entries(t)) out[e] = Math.round(v * 1e6) / 1e6;
  return out;
}
const same = (a, b) => assert.deepEqual(a, b);

test('the kiln rows: Ba + 2 HF, La2O3 + 6 HF, Al2O3 + 6 HF, NaOH + HF, every element conserved', () => {
  for (const name of ['barium_fluoride', 'lanthanum_fluoride', 'aluminium_fluoride', 'sodium_fluoride']) {
    const r = byId(kiln, 'grindless:' + name);
    assert.equal(r.type, 'gtceu:fluorspar_digestion', name);
    assert.deepEqual(one(r, 'EUt'), [30]);
    assert.deepEqual(one(r, 'duration'), [64]);
    const inn = atoms(r, 'itemInputs', 'inputFluids');
    const out = atoms(r, 'itemOutputs', 'outputFluids');
    same(inn, out);
  }
  assert.deepEqual(one(byId(kiln, 'grindless:barium_fluoride'), 'itemOutputs'), [['3x gtceu:barium_fluoride_dust']]);
  assert.deepEqual(one(byId(kiln, 'grindless:lanthanum_fluoride'), 'itemOutputs'), [['8x gtceu:lanthanum_fluoride_dust']]);
  assert.deepEqual(one(byId(kiln, 'grindless:aluminium_fluoride'), 'itemOutputs'), [['8x gtceu:aluminium_fluoride_dust']]);
  assert.deepEqual(one(byId(kiln, 'grindless:sodium_fluoride'), 'itemOutputs'), [['2x gtceu:sodium_fluoride_dust']]);
  assert.deepEqual(one(byId(kiln, 'grindless:barium_fluoride'), 'outputFluids'), [{ fluid: 'gtceu:hydrogen', amount: 2000 }]);
  // the sandbox lacks gcyr ids, so only the rows of this package are held to the no-error rule
  assert.equal(kiln.logs.filter((l) => l[0] === 'error' && /barium_fluoride|lanthanum_fluoride|aluminium_fluoride|sodium_fluoride/.test(l[1])).length, 0);
});

test('the kiln rows take distinct item inputs (recipe lookup)', () => {
  const ins = kiln.built.filter((r) => r.type === 'gtceu:fluorspar_digestion').map((r) => JSON.stringify([calls(r, 'itemInputs')[0][0], calls(r, 'inputFluids')[0][0]]));
  assert.equal(new Set(ins).size, ins.length);
});

test('the ZBLAN batch is two large chemical reactor rows, no mixer, no fluorine', () => {
  assert.equal(byId(luv, 'grindless:zblan').type, 'gtceu:large_chemical_reactor');
  assert.equal(byId(luv, 'grindless:zblan_dopant_blend').type, 'gtceu:large_chemical_reactor');
  assert.equal(luv.built.filter((r) => r.type === 'gtceu:mixer').length, 0);
  for (const id of ['grindless:zblan', 'grindless:zblan_dopant_blend']) {
    const r = byId(luv, id);
    assert.deepEqual(calls(r, 'inputFluids'), [], id);
    assert.ok(calls(r, 'circuit').length === 0, id);
    assert.ok(one(r, 'itemInputs')[0].length <= 3, 'the large reactor has 3 item slots');
    assert.ok(one(r, 'itemInputs')[0].every((s) => Number(s.match(/^\d+/)[0]) <= 64));
  }
});

test('the batch holds 10 : 4 : 1 : 1 : 4 ZrF4 : BaF2 : LaF3 : AlF3 : NaF and 20 cation shares', () => {
  const blend = byId(luv, 'grindless:zblan_dopant_blend');
  const glass = byId(luv, 'grindless:zblan');
  assert.deepEqual(one(blend, 'itemInputs')[0], ['4x gtceu:lanthanum_fluoride_dust', '4x gtceu:aluminium_fluoride_dust', '8x gtceu:sodium_fluoride_dust']);
  assert.deepEqual(one(blend, 'itemOutputs'), ['16x gtceu:zblan_dopant_blend_dust']);
  assert.deepEqual(one(glass, 'itemInputs')[0], ['50x gtceu:zirconium_tetrafluoride_dust', '12x gtceu:barium_fluoride_dust', '16x gtceu:zblan_dopant_blend_dust']);
  assert.deepEqual(one(glass, 'itemOutputs'), ['20x gtceu:zblan_dust']);
  // formulas: ZrF4 50/5, BaF2 12/3, LaF3 4/4, AlF3 4/4, NaF 8/2 = 10 + 4 + 1 + 1 + 4 = 20 cations; the blend's 16 dust are 4 + 4 + 8 atoms
  assert.equal(50 / 5 + 12 / 3 + 4 / 4 + 4 / 4 + 8 / 2, 20);
  assert.equal(4 + 4 + 8, 16);
});

test('the old mixer row and its fluorine charge are gone from the script', () => {
  const src = fs.readFileSync(path.join(PACK, LUV), 'utf8');
  assert.doesNotMatch(src, /gtceu\.mixer\(/);
  assert.doesNotMatch(src, /73250|small_zirconium_dust/);
});
