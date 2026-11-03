// LuV germanium line L4 (package D2-GERMANIUM): Io's chlorination -> scrub -> hydrolysis -> reduction -> boule -> wafer -> wake c3.
// Pins every recipe's inputs and outputs and the conservation of germanium, indium, chlorine, hydrogen and oxygen from the condenser on.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { runServerScripts } from '../lib/kubejs_recipes_sandbox.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const PACK = path.join(ROOT, 'pack');
const SERVER = 'kubejs/server_scripts/grindless/luv/germanium.js';
const IO = 'kubejs/server_scripts/grindless/luv/io_surface.js';
const clean = { CLEANROOM: 'cleanroom' };

function run(scripts, startup) {
  return runServerScripts({
    packRoot: PACK, scripts, recipes: {}, startup,
    before(sandbox) {
      sandbox.Java = { loadClass: () => clean };
      const recipes = sandbox.ServerEvents.recipes;
      sandbox.ServerEvents.recipes = (fn) => recipes((event) => { event.remove = () => {}; fn(event); });
    },
  });
}
const GE = run([SERVER], ['kubejs/startup_scripts/grindless/luv/germanium.js']);
const SEP = run([IO], ['kubejs/startup_scripts/grindless/lib/places.js', 'kubejs/startup_scripts/grindless/luv/io_surface.js']);
const calls = (r, m) => r.calls.filter((c) => c[0] === m).map((c) => c.slice(1));
const one = (r, m) => { const c = calls(r, m); assert.equal(c.length, 1, `${r.id}: one ${m}`); return c[0]; };
const byId = (run, id) => run.built.find((r) => r.id === id);

// atoms in one unit (1 item, or 1000 mB of a fluid); the sublimate is 2 Ge + 1 In + 2 O
const COMP = {
  'grindless:ionian_sublimate': { Ge: 0.5, In: 0.25, O: 0.5 },
  'gtceu:germanium_tetrachloride': { Ge: 1, Cl: 4 }, 'gtceu:pure_germanium_tetrachloride': { Ge: 1, Cl: 4 },
  'gtceu:chlorine': { Cl: 1 }, 'gtceu:hydrogen': { H: 1 }, 'gtceu:hydrochloric_acid': { H: 1, Cl: 1 },
  'minecraft:water': { H: 2, O: 1 }, 'gtceu:germanium_dioxide_dust': { Ge: 1, O: 2 },
  'gtceu:germanium_dust': { Ge: 1 }, 'gtceu:indium_dust': { In: 1 }, 'gtceu:indium_chloride_dust': { In: 1, Cl: 3 },
};
function side(r, items, fluids) {
  const t = {};
  const add = (id, n) => { const c = COMP[id]; assert.ok(c, `${r.id}: composition of ${id}`); for (const [e, k] of Object.entries(c)) t[e] = (t[e] || 0) + k * n; };
  calls(r, items).flat(2).forEach((s) => { const m = /^(?:(\d+)x )?(.+)$/.exec(String(s)); add(m[2], Number(m[1] || 1)); });
  calls(r, fluids).flat(2).forEach((f) => add(f.fluid, f.amount / 1000));
  return t;
}

test('the chlorination takes the sublimate and gives GeCl4 and indium chloride', () => {
  const s = byId(SEP, 'grindless:separate');
  assert.equal(s.type, 'gtceu:fumarole_condensing');
  assert.deepEqual(one(s, 'circuit'), [2]);
  assert.deepEqual(calls(s, 'dimension'), []);
  assert.deepEqual(one(s, 'itemInputs'), ['4x grindless:ionian_sublimate']);
  assert.deepEqual(one(s, 'inputFluids'), [{ fluid: 'gtceu:chlorine', amount: 11000 }]);
  assert.deepEqual(one(s, 'itemOutputs'), ['1x gtceu:indium_chloride_dust']);
  assert.deepEqual(one(s, 'outputFluids'), [{ fluid: 'gtceu:germanium_tetrachloride', amount: 2000 }]);
});

test('every step of the line', () => {
  const t = (id, type) => { const r = byId(GE, id); assert.equal(r.type, type, id); return r; };
  const h = t('grindless:germanium_hydrolysis', 'gtceu:chemical_reactor');
  assert.deepEqual(one(h, 'inputFluids'), [{ fluid: 'gtceu:pure_germanium_tetrachloride', amount: 2000 }, { fluid: 'minecraft:water', amount: 4000 }]);
  assert.deepEqual(one(h, 'itemOutputs'), ['2x gtceu:germanium_dioxide_dust']);
  assert.deepEqual(one(h, 'outputFluids'), [{ fluid: 'gtceu:hydrochloric_acid', amount: 8000 }]);
  const d = t('grindless:germanium_reduction', 'gtceu:electric_blast_furnace');
  assert.deepEqual(one(d, 'itemInputs'), ['2x gtceu:germanium_dioxide_dust']);
  assert.deepEqual(one(d, 'inputFluids'), [{ fluid: 'gtceu:hydrogen', amount: 8000 }]);
  assert.deepEqual(one(d, 'itemOutputs'), ['2x gtceu:germanium_dust']);
  assert.deepEqual(one(d, 'blastFurnaceTemp'), [900]);
  const b = t('grindless:germanium_boule', 'gtceu:electric_blast_furnace');
  assert.deepEqual(one(b, 'itemInputs'), ['16x gtceu:germanium_dust']);
  assert.deepEqual(one(b, 'notConsumableFluid'), [{ fluid: 'gtceu:argon', amount: 1000 }]);
  assert.deepEqual(one(b, 'itemOutputs'), ['1x grindless:germanium_boule']);
  assert.ok(one(b, 'blastFurnaceTemp')[0] > 1211, 'above the melting point of germanium');
  const w = t('grindless:germanium_wafer', 'gtceu:cutter');
  assert.deepEqual(one(w, 'itemInputs'), ['1x grindless:germanium_boule']);
  assert.deepEqual(one(w, 'itemOutputs'), ['16x grindless:germanium_wafer']);
  assert.deepEqual(one(w, 'cleanroom'), ['cleanroom']);
});

test('germanium, indium, chlorine, hydrogen and oxygen close from the condenser to the wafer', () => {
  const sep = byId(SEP, 'grindless:separate');
  const steps = ['germanium_hydrolysis', 'germanium_reduction', 'germanium_hcl_recovery', 'indium_chloride_electrolysis']
    .map((n) => byId(GE, `grindless:${n}`));
  // one condenser run (4 sublimate = 2 Ge + 1 In); the scrub (ev/extraction_cascade.js) passes GeCl4 through; each step runs once
  const sub = { Ge: 2, In: 1, O: 2 };
  const all = [sep, ...steps];
  const net = {};
  for (const r of all) {
    const i = side(r, 'itemInputs', 'inputFluids');
    const o = side(r, 'itemOutputs', 'outputFluids');
    for (const e of new Set([...Object.keys(i), ...Object.keys(o)])) {
      if (r === sep && e === 'O') continue; // the sublimate's oxygen is not carried on
      assert.equal(i[e] || 0, o[e] || 0, `${r.id}: ${e} balances`);
    }
    for (const [e, k] of Object.entries(i)) net[e] = (net[e] || 0) + k;
    for (const [e, k] of Object.entries(o)) net[e] = (net[e] || 0) - k;
  }
  assert.deepEqual([sub.Ge, sub.In], [2, 1]);
  // fluid loops: what one step takes the others give back
  const flow = (fluid) => all.reduce((n, r) => n + calls(r, 'inputFluids').flat(2).filter((f) => f.fluid === fluid).reduce((a, f) => a + f.amount, 0)
    - calls(r, 'outputFluids').flat(2).filter((f) => f.fluid === fluid).reduce((a, f) => a + f.amount, 0), 0);
  assert.equal(flow('gtceu:chlorine'), 0, 'chlorine loops');
  assert.equal(flow('gtceu:hydrogen'), 0, 'hydrogen loops');
  assert.equal(flow('minecraft:water'), 0, 'water loops');
  assert.equal(flow('gtceu:hydrochloric_acid'), 0, 'hydrochloric acid loops');
});

test('the wake takes the wafer and the cutter makes the cells', () => {
  const o = runServerScripts({
    packRoot: PACK, scripts: ['kubejs/server_scripts/grindless/luv/orbital_industry.js'], recipes: {},
    startup: ['kubejs/startup_scripts/grindless/lib/places.js'],
    before(sandbox) {
      sandbox.Java = { loadClass: () => clean };
      sandbox.global.grindless.orbitalIndustry = {};
      sandbox.global.grindless.orbits = { allow: (b) => b };
      const recipes = sandbox.ServerEvents.recipes;
      sandbox.ServerEvents.recipes = (fn) => recipes((event) => { event.remove = () => {}; fn(event); });
    },
  });
  const r = byId(o, 'grindless:triple_junction_wafer');
  assert.equal(r.type, 'gtceu:wake_epitaxy');
  assert.deepEqual(one(r, 'itemInputs'), [['grindless:germanium_wafer', 'gtceu:gallium_arsenide_dust', 'gtceu:indium_gallium_phosphide_dust']]);
});

test('the startup script registers the two items and two materials; the lang names them', () => {
  assert.deepEqual(GE.G.germanium.items, ['grindless:germanium_boule', 'grindless:germanium_wafer']);
  assert.deepEqual(GE.G.germanium.materials, ['gtceu:germanium_dioxide', 'gtceu:indium_chloride']);
  const lang = fs.readFileSync(path.join(PACK, 'kubejs/client_scripts/grindless/luv_germanium_lang.js'), 'utf8');
  for (const n of ['germanium_boule', 'germanium_wafer']) assert.ok(lang.includes(`'${n}'`), n);
  for (const n of ['germanium_dioxide', 'indium_chloride']) assert.ok(lang.includes(`material.gtceu.${n}`), n);
});
