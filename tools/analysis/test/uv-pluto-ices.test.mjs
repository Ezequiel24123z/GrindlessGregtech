// UV's Pluto ices (package UV-B3), no game needed: the pack's scripts run in the stand-in of lib/kubejs_static.mjs.
//   startup: the penetrator_probe and ice_fractionation types, the two machines, the penetrator item, valid patterns; server: the Pluto
//   rows (Pluto orbit only, one circuit each), the penetrator's assembler recipe, crafting; the Sputnik and Charon cores only from the bay,
//   the fractionator's CO into the syngas plant's Pluto shift (circuit 5, Pluto orbit), the six older syngas rows unchanged; the
//   Plutonian seed reachable; text and textures.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const pack = path.join(root, 'pack');
const run = runPackScripts(pack);
const plain = (x) => JSON.parse(JSON.stringify(x, (k, v) => (typeof v === 'function' ? undefined : v)));
const PI = plain(run.global.grindless.uvPlutoIces);
const SYN = plain(run.global.grindless.syngas);
const recipes = run.docs.recipes.recipes;
const byId = (id) => recipes.find((r) => r.i === id);
const MACHINES = { penetrator_probe_bay: 'penetrator_probe', volatile_ice_fractionator: 'ice_fractionation' };
const ORBIT = 'grindless:pluto_orbit';
const circuitOf = (r) => r.j.inputs.item.filter((i) => i.content.type === 'gtceu:circuit').map((i) => i.content.configuration);
const producers = (re) => recipes.filter((r) => re.test(JSON.stringify(r.j.outputs || {}))).map((r) => r.i).sort();
const consumers = (re) => recipes.filter((r) => re.test(JSON.stringify(r.j.inputs || r.j.ingredients || r.j.key || {}))).map((r) => r.i).sort();

test('the stand-in runs the pluto ices and syngas scripts without errors', () => {
  const errs = run.errors.filter((e) => /pluto_ices|syngas/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(PI.skipped, [], 'no recipe skipped for an unknown id');
  assert.deepEqual(PI.clashes, [], 'no recipe clashes in the lookup');
});

test('registration: the two types, the two machines on them, the penetrator item', () => {
  for (const [m, t] of Object.entries(MACHINES)) {
    assert.ok(run.registry.recipeTypes.has('gtceu:' + t), t + ' registered');
    const def = run.registry.machines.get('gtceu:' + m);
    assert.ok(def, m + ' registered');
    assert.deepEqual(def.recipeTypes, ['gtceu:' + t]);
  }
  assert.ok(run.registry.items.has('grindless:penetrator_probe'));
  assert.equal(PI.orbit, ORBIT);
});

test('the patterns: one controller in the front slice, uniform size, a symbol for every cell, UV parts', () => {
  for (const name of Object.keys(MACHINES)) {
    const s = run.docs.structures.structures['gtceu:' + name];
    assert.ok(s, name + ' described');
    const front = s.slices[s.slices.length - 1];
    assert.equal(front.join('').split('').filter((c) => c === 'S').length, 1, name + ' one controller');
    const height = s.slices[0].length;
    assert.ok(height <= 16 && s.slices.every((sl) => sl.length === height));
    const width = s.slices[0][0].length;
    assert.ok(s.slices.every((sl) => sl.every((row) => row.length === width)));
    for (const sl of s.slices) for (const row of sl) for (const c of row) assert.ok(c === ' ' || s.symbols[c], name + ' symbol ' + c);
    const lim = Object.fromEntries(s.symbols.X.options.filter((o) => o.kind === 'part').map((o) => [o.ability, o.limits]));
    assert.deepEqual(lim.energy_input, { min: 1, max: 2 });
    assert.ok(lim.input_bus && lim.output_bus, name + ' has buses');
  }
  const fr = run.docs.structures.structures['gtceu:volatile_ice_fractionator'];
  assert.ok(fr.symbols.X.options.some((o) => o.ability === 'output_hatch'), 'the fractionator has output hatches');
});

test('the Pluto rows: Pluto orbit only, one circuit per type slot, the Triton ice core kept in the bay', () => {
  assert.deepEqual(PI.recipes.map((p) => `${p.type}:${p.circuit}`).sort(),
    ['ice_fractionation:1', 'ice_fractionation:2', 'penetrator_probe:1', 'penetrator_probe:2']);
  for (const p of PI.recipes) {
    const r = byId(p.recipeId);
    assert.ok(r, p.recipeId + ' added');
    assert.equal(r.t, 'gtceu:' + p.type);
    assert.deepEqual(circuitOf(r), [p.circuit]);
    assert.equal(p.dim, ORBIT);
    assert.match(JSON.stringify(r.j), /grindless:pluto_orbit/, p.name + ' is dimension-locked');
    if (p.type === 'penetrator_probe') {
      assert.deepEqual(p.notConsumed, ['grindless:triton_ice_core']);
      assert.deepEqual(p.itemsIn, [{ id: 'grindless:penetrator_probe', count: 1 }]);
    }
  }
  for (const t of Object.values(MACHINES)) {
    const all = recipes.filter((r) => r.t === 'gtceu:' + t);
    assert.ok(all.every((r) => /grindless:pluto_orbit/.test(JSON.stringify(r.j))), t + ': every row of the type is Pluto orbit');
  }
});

test('the penetrator: printed frame, GPHS module, HPGe crystal and melt head in the assembler', () => {
  const r = byId('grindless:assembler/penetrator_probe');
  assert.ok(r, 'penetrator assembler recipe');
  const s = JSON.stringify(r.j.inputs);
  for (const id of ['grindless:printed_probe_frame', 'grindless:gphs_module', 'grindless:hpge_crystal', 'grindless:melt_head']) assert.ok(s.includes(id), id);
  assert.match(JSON.stringify(r.j.outputs), /grindless:penetrator_probe/);
  for (const m of Object.keys(MACHINES)) assert.ok(byId('grindless:assembly_line/' + m), m + ' assembly line recipe');
});

test('acceptance: the Sputnik and Charon cores only from the penetrator bay; the Plutonian seed reads the Sputnik core', () => {
  assert.deepEqual(producers(/grindless:sputnik_ice_core/), ['grindless:penetrator_probe/sputnik_penetrator']);
  assert.deepEqual(producers(/grindless:charon_core/), ['grindless:penetrator_probe/charon_penetrator']);
  assert.ok(consumers(/grindless:sputnik_ice_core/).includes('grindless:chemical_reactor/plutonian_quantum_seed'), 'the seed takes the core');
  assert.ok(consumers(/grindless:triton_ice_core/).includes('grindless:penetrator_probe/sputnik_penetrator'), 'the Triton core has a consumer');
});

test('acceptance: the fractionator\'s CO reaches the syngas plant\'s Pluto shift (circuit 5, Pluto orbit only)', () => {
  const frac = PI.recipes.find((p) => p.name === 'sputnik_ice_fractionation');
  const co = frac.fluidsOut.find((f) => f.id === 'gtceu:carbon_monoxide');
  assert.ok(co && co.amount > 0);
  assert.equal(SYN.orbitRecipes.length, 1);
  const shift = SYN.orbitRecipes[0];
  assert.equal(shift.circuit, 5);
  assert.equal(shift.dim, ORBIT);
  assert.deepEqual(shift.atoms, { c: 0, h: 0, o: 0 }, 'C/H/O balance');
  const coIn = shift.fluidsIn.find((f) => f.id === 'gtceu:carbon_monoxide');
  assert.equal(coIn.amount, co.amount, 'one Sputnik core gives one shift run');
  const water = shift.fluidsIn.find((f) => f.id === 'minecraft:water');
  const charon = PI.recipes.find((p) => p.name === 'charon_ice_fractionation');
  assert.ok(water && charon.fluidsOut.some((f) => f.id === 'minecraft:water' && f.amount >= water.amount), 'Charon water covers it');
  const r = byId(shift.id);
  assert.ok(r, shift.id + ' added');
  assert.equal(r.t, 'gtceu:syngas');
  assert.deepEqual(circuitOf(r), [5]);
  assert.match(JSON.stringify(r.j), /grindless:pluto_orbit/);
  assert.equal(shift.eut * shift.duration, 2 * SYN.stageEnergy.shift);
});

test('the six older syngas rows are unchanged: circuits 1-4, no dimension, steam-fed', () => {
  assert.deepEqual(SYN.recipes.map((p) => p.name), ['gasify_carbon', 'methanol_syngas', 'hydrogen_carbon', 'shift', 'gasify_heavy_fuel', 'hydrogen_heavy_fuel']);
  for (const p of SYN.recipes) {
    assert.ok(p.circuit >= 1 && p.circuit <= 4);
    assert.equal(p.dim, undefined);
    assert.ok(p.fluidsIn.some((f) => f.id === 'gtceu:steam'));
    const r = byId(p.id);
    assert.ok(r, p.id);
    assert.ok(!/dimension/.test(JSON.stringify(r.j.recipeConditions || [])), p.name + ' has no dimension condition');
  }
  const shift = SYN.recipes.find((p) => p.name === 'shift');
  assert.deepEqual(shift.fluidsIn, [{ id: 'gtceu:carbon_monoxide', amount: 1000 }, { id: 'gtceu:steam', amount: 1000 }]);
  assert.deepEqual(shift.fluidsOut, [{ id: 'gtceu:hydrogen', amount: 2000 }, { id: 'gtceu:carbon_dioxide', amount: 1000 }]);
  // 6 older + Pluto shift + UEV-B3's CO-rich row (circuit 6, .uevRecipes)
  assert.equal(recipes.filter((r) => r.t === 'gtceu:syngas').length, 10); // UIV-A10 adds c12_methanation (circuit 7), UXV-B2 volatile_reform (circuit 8)
});

test('every new name and tooltip has en_us and es_es text, and the textures exist', () => {
  const en = run.lang.en_us || {};
  const es = run.lang.es_es || {};
  const keys = ['gtceu.penetrator_probe', 'gtceu.ice_fractionation', 'item.grindless.penetrator_probe',
    'tooltip.grindless.penetrator_probe.0', 'tooltip.grindless.penetrator_probe.1'];
  for (const m of Object.keys(MACHINES)) {
    keys.push('block.gtceu.' + m, `grindless.machine.${m}.no_voiding`);
    for (const i of [0, 1, 2]) keys.push(`grindless.machine.${m}.tooltip.${i}`);
  }
  for (const k of keys) {
    assert.ok(en[k] && en[k].length > 3, 'en_us ' + k);
    assert.ok(es[k] && es[k].length > 3, 'es_es ' + k);
    assert.notEqual(en[k], es[k], 'es_es ' + k + ' is translated');
  }
  const tex = path.join(pack, 'kubejs', 'assets', 'grindless', 'textures');
  assert.ok(fs.existsSync(path.join(tex, 'item', 'penetrator_probe.png')));
  for (const o of ['entry_probe_bay', 'cryogenic_plant']) {
    for (const f of ['overlay_front.png', 'overlay_front_active.png', 'overlay_front_active_emissive.png']) {
      assert.ok(fs.existsSync(path.join(tex, 'block', 'multiblock', o, f)), o + '/' + f);
    }
  }
});
