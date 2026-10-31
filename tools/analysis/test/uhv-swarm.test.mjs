// UHV's Dyson swarm (package UHV-B3), no game needed. The pack's scripts run in the stand-in of lib/kubejs_static.mjs:
//   - startup_scripts/grindless/uhv/swarm.js: three recipe types, three machines (9 x 7 x 9 foundry, 11 x 5 x 11 station, 7 x 5 x 7 bay),
//     two items;
//   - server_scripts/grindless/uhv/swarm.js: the foundry's segment and refurbish, the station's three generator rows, the bay's probe and
//     corona, the heat pipe's assembler row, the controllers;
//   - server_scripts/grindless/uv/starshot.js: the light sail fab's reflector film (circuit 4);
//   - server_scripts/grindless/ev/cryogenic_plant.js: crude oganesson -> oganesson propellant;
//   - en_us and es_es text for everything new.
// Doubt for T1 (gg_test_uhv_swarm): a generator whose catalysts wear into an output, at its final figure. Here: the recipe lookup, the
// generator rows (EU out, nothing in), the kept segments and the wear (one worn segment per segment burnt, one tank per pod).
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
const SW = plain(run.global.grindless.uhvSwarm);
const recipes = run.docs.recipes.recipes;
const read = (rel) => fs.readFileSync(path.join(pack, 'kubejs', rel), 'utf8');
const row = (name) => SW.recipes.find((r) => r.name === name);
const dump = (id) => recipes.find((r) => r.i === id);
const circuitOf = (r) => r.j.inputs.item.filter((i) => i.content.type === 'gtceu:circuit').map((i) => i.content.configuration);
const dimsOf = (r) => (r.j.recipeConditions || []).filter((c) => c.type === 'dimension').map((c) => c.dimension);
const itemIns = (r) => r.j.inputs.item.filter((i) => i.content.type !== 'gtceu:circuit');
const idOf = (i) => {
  const v = i.content.value || i.content.ingredient || i.content;
  const s = JSON.stringify(v);
  const m = s.match(/"item":"([^"]+)"/);
  return m ? m[1] : s;
};
const countOf = (i) => i.content.count || (i.content.ingredient && i.content.ingredient.count) || 1;
const kept = (r) => itemIns(r).filter((i) => i.chance === 0).map((i) => [idOf(i), countOf(i)]).sort();
const used = (r) => itemIns(r).filter((i) => i.chance !== 0).map((i) => [idOf(i), countOf(i)]).sort();
const outs = (r) => ((r.j.outputs && r.j.outputs.item) || []).map((i) => [idOf(i), countOf(i)]).sort();
const ORBIT = 'gcyr:mercury_orbit';
const SEG = 'grindless:swarm_segment';
const WORN = 'grindless:worn_swarm_segment';
const POD = 'grindless:oganesson_propellant_pod';
const TANK = 'grindless:propellant_tank';
const MAP = 'grindless:coronal_field_map';
// UEV-B2: Alpha Centauri A's orbit is a second site; its rows are named alpha_*
const ALPHA = 'grindless:alpha_centauri_orbit';
const ALPHA_MAP = 'grindless:alpha_coronal_field_map';
const VA_UHV = 1966080;
const MACHINES = { 'gtceu:swarm_segment_foundry': 'swarm_segment', 'gtceu:swarm_control_station': 'dyson_swarm', 'gtceu:solar_probe_bay': 'solar_probe' };

test('the stand-in runs the swarm scripts without errors, nothing clashing or skipped', () => {
  const errs = run.errors.filter((e) => /uhv[\\/]swarm|uhv_swarm_lang|uv[\\/]starshot|ev[\\/]cryogenic/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(SW.clashes, []);
  assert.deepEqual(SW.skipped, []);
  // UEV-B2 adds the Alpha Centauri rows alpha_full_swarm and alpha_corona
  // UIV-A10 adds the Mercury row matrioshka_feed
  // MAX-G1 adds the Sgr A* row mirror_shell_segment (circuit 5, VA[MAX])
  assert.equal(SW.recipes.length, 12);
});

test('registration: three types, three machines, two items with textures; F1\'s ids are not registered again', () => {
  for (const [m, t] of Object.entries(MACHINES)) assert.deepEqual(run.registry.machines.get(m).recipeTypes, ['gtceu:' + t], m);
  for (const n of ['sodium_potassium_heat_pipe', 'solar_probe']) {
    assert.ok(run.registry.items.has('grindless:' + n), n);
    assert.ok(fs.existsSync(path.join(pack, 'kubejs', 'assets', 'grindless', 'textures', 'item', n + '.png')), n + ' texture');
  }
  const f1ids = JSON.stringify(plain(run.global.grindless.uhvFoundation));
  for (const id of SW.items) assert.ok(!f1ids.includes(`"${id}"`), id + ' is F1\'s');
  for (const id of [SEG, WORN, MAP, 'grindless:aluminium_reflector_film', POD, TANK]) assert.ok(run.registry.items.has(id), id);
  for (const m of ['swarm_segment_foundry', 'swarm_control_station', 'solar_probe_bay']) {
    for (const f of ['overlay_front.png', 'overlay_front_active.png', 'overlay_front_active_emissive.png']) {
      assert.ok(fs.existsSync(path.join(pack, 'kubejs', 'assets', 'grindless', 'textures', 'block', 'multiblock', m, f)), `${m}/${f}`);
    }
  }
});

function shape(id, w, d, h) {
  const s = run.docs.structures.structures[id];
  assert.ok(s, id + ' described');
  assert.equal(s.slices.length, d, id + ' depth');
  assert.ok(s.slices.every((sl) => sl.length === h && sl.every((r) => r.length === w)), id + ' uniform slices');
  assert.equal(s.slices.flat().join('').split('').filter((c) => c === 'S').length, 1, id + ' one controller');
  for (const sl of s.slices) for (const r of sl) for (const c of r) if (c !== ' ') assert.ok(s.symbols[c], `${id} symbol ${c}`);
  return s;
}
const partsOf = (s) => Object.keys(Object.fromEntries(s.symbols.X.options.filter((o) => o.kind === 'part').map((o) => [o.ability, 1]))).sort();
const count = (s, ch) => s.slices.flat().join('').split('').filter((c) => c === ch).length;

test('patterns: 9 x 7 x 9 foundry, 11 x 5 x 11 station (energy out), 7 x 5 x 7 bay, all on a truss deck', () => {
  const fo = shape('gtceu:swarm_segment_foundry', 9, 9, 7);
  assert.deepEqual(partsOf(fo), ['energy_input', 'input_bus', 'output_bus']);
  assert.equal(count(fo, 'A'), 1, 'one assembly head');
  const st = shape('gtceu:swarm_control_station', 11, 11, 5);
  assert.deepEqual(partsOf(st), ['energy_output', 'input_bus', 'input_hatch', 'output_bus']);
  assert.equal(count(st, 'C'), 3, 'the formation computer');
  assert.ok(count(st, 'R') > 20, 'the receiver array');
  const ba = shape('gtceu:solar_probe_bay', 7, 7, 5);
  assert.deepEqual(partsOf(ba), ['energy_input', 'input_bus', 'output_bus']);
  for (const s of [fo, st, ba]) {
    assert.ok(s.symbols.X.options.some((o) => o.kind === 'blocks' && o.blocks.includes('grindless:station_truss_casing')), 'truss deck');
  }
});

test('recipe lookup: every row is in the manager with its circuit, Mercury (or Alpha Centauri) orbit on all but the assembler', () => {
  for (const r of SW.recipes) {
    const rec = dump(r.recipeId);
    assert.ok(rec, r.recipeId);
    assert.equal(rec.t, 'gtceu:' + r.type, r.name);
    assert.deepEqual(circuitOf(rec), r.circuit == null ? [] : [r.circuit], r.name);
    assert.deepEqual(dimsOf(rec), r.type === 'assembler' ? [] : [r.name.startsWith('alpha_') ? ALPHA : r.name === 'mirror_shell_segment' ? 'gcyr:black_hole_orbit' : ORBIT], r.name);
    assert.ok(Number.isInteger(r.duration) && r.duration > 0, r.name);
  }
  for (const [m, t] of Object.entries(MACHINES)) {
    assert.ok(SW.recipes.some((r) => r.type === t), m + ' has recipes');
  }
  for (const r of SW.recipes.filter((x) => !x.generator && x.name !== 'mirror_shell_segment')) {
    const rec = dump(r.recipeId);
    assert.ok(rec.j.tickInputs.eu[0].content <= VA_UHV, r.name + ' within UHV');
  }
});

test('the generator rows: EU out at the final figure, nothing in; kept segments and the wear into worn segments and tanks', () => {
  const want = {
    formation: { eu: 2097152, dur: 6000, kept: [[SEG, 15]], used: [[POD, 1], [SEG, 1]], out: [[TANK, 1], [WORN, 1]], circuit: 1 },
    formation_krypton: { eu: 2097152, dur: 3000, kept: [[SEG, 15]], used: [[SEG, 1]], out: [[WORN, 1]], circuit: 1 },
    full_swarm: { eu: 8388608, dur: 6000, kept: [[MAP, 1], [SEG, 60]], used: [[POD, 4], [SEG, 4]], out: [[TANK, 4], [WORN, 4]], circuit: 2 },
    alpha_full_swarm: { eu: 12582912, dur: 6000, kept: [[ALPHA_MAP, 1], [SEG, 60]], used: [[POD, 6], [SEG, 6]], out: [[TANK, 6], [WORN, 6]], circuit: 3 },
    matrioshka_feed: { eu: 33554432, dur: 6000, kept: [[MAP, 1], [SEG, 60]], used: [[POD, 16], [SEG, 16]], out: [[TANK, 16], [WORN, 16]], circuit: 4 } // UIV-A10
  };
  const gens = SW.recipes.filter((r) => r.generator).map((r) => r.name).sort();
  assert.deepEqual(gens, Object.keys(want).sort());
  for (const [name, w] of Object.entries(want)) {
    const rec = dump(row(name).recipeId);
    assert.deepEqual(rec.j.tickOutputs.eu.map((e) => e.content), [w.eu], name + ' EU/t out');
    assert.ok(!rec.j.tickInputs || !rec.j.tickInputs.eu || rec.j.tickInputs.eu.length === 0, name + ' takes no EU');
    assert.equal(row(name).duration, w.dur, name);
    assert.deepEqual(kept(rec), w.kept, name + ' kept');
    assert.deepEqual(used(rec), w.used, name + ' burnt');
    assert.deepEqual(outs(rec), w.out, name + ' worn');
  }
  // the swarm is linear in segments: c2 is four c1 rows with the map, EU per worn segment equal
  const perWorn = (n) => { const r = row(n); return (r.eut * r.duration) / r.itemsOut.find((x) => x.id === WORN).count; };
  assert.equal(perWorn('formation'), perWorn('full_swarm'));
  assert.equal(perWorn('formation'), perWorn('alpha_full_swarm'), 'Alpha: more segments a run, same EU per worn segment');
  assert.equal(perWorn('formation') / 2, perWorn('formation_krypton'), 'krypton is the poorer fuel');
  const krypton = dump(row('formation_krypton').recipeId);
  assert.ok(JSON.stringify(krypton.j.inputs.fluid).includes('gtceu:krypton'));
});

test('the wear closes: worn segments go back through the foundry, the corona map is made from a probe', () => {
  const ref = dump(row('refurbish').recipeId);
  assert.deepEqual(used(ref), [['grindless:aluminium_reflector_film', 1], ['grindless:imm_solar_array', 1], [WORN, 1]].sort());
  assert.deepEqual(outs(ref), [[SEG, 1], ['gtceu:small_aluminium_dust', 1]]);
  const seg = dump(row('segment').recipeId);
  const segIds = used(seg).map(([id]) => id);
  for (const id of ['grindless:imm_solar_array', 'grindless:c12_diamond_spreader', 'grindless:sodium_potassium_heat_pipe',
    'grindless:aluminium_reflector_film', 'grindless:fibre_laser_module']) assert.ok(segIds.includes(id), id);
  assert.deepEqual(outs(seg), [[SEG, 1]]);
  const corona = dump(row('corona').recipeId);
  assert.deepEqual(kept(corona), [['grindless:heliopause_data', 1]]);
  assert.deepEqual(outs(corona), [[MAP, 1]]);
  assert.deepEqual(outs(dump(row('probe').recipeId)), [['grindless:solar_probe', 1]]);
  // B1's catalyst, A8's pod and the film each have their maker
  assert.ok(dump('grindless:chemical_reactor/hermean_quantum_seed_orbit'), 'B1 row');
  assert.ok(dump('grindless:thruster_assembly/oganesson_propellant_pod'), 'A8 pod row');
  const makers = (id) => recipes.filter((r) => JSON.stringify((r.j.outputs && r.j.outputs.item) || []).includes(`"${id}"`)).map((r) => r.i);
  assert.ok(makers(POD).length > 0, 'the pod is made');
  assert.ok(makers('grindless:aluminium_reflector_film').includes('grindless:light_sail/aluminium_reflector_film'));
  assert.ok(makers('grindless:sodium_potassium_heat_pipe').includes('grindless:assembler/sodium_potassium_heat_pipe'));
});

test('cryogenic plant: crude oganesson -> oganesson propellant, the A8 pod\'s fluid; krypton and xenon as off-gas', () => {
  const rec = dump('grindless:cryogenic_processing/oganesson_propellant');
  assert.ok(rec);
  assert.deepEqual(rec.j.inputs.fluid.map((f) => [f.content.value[0].fluid, f.content.amount]), [['gtceu:oganesson', 1000]]);
  assert.deepEqual(rec.j.outputs.fluid.map((f) => [f.content.value[0].fluid, f.content.amount]),
    [['gtceu:oganesson_propellant', 900], ['gtceu:krypton', 60], ['gtceu:xenon', 40]]);
  const pod = dump('grindless:thruster_assembly/oganesson_propellant_pod');
  assert.ok(JSON.stringify(pod.j.inputs.fluid || []).includes('gtceu:oganesson_propellant'), 'the pod is filled with it');
  const fusion = recipes.find((r) => r.i === 'gtceu:fusion_reactor/oganesson');
  if (fusion) assert.ok(JSON.stringify(fusion.j.outputs).includes('gtceu:oganesson'));
});

test('controllers: one assembly line each; lang keys in en_us and es_es', () => {
  assert.deepEqual(SW.crafting,
    ['grindless:assembly_line/swarm_segment_foundry', 'grindless:assembly_line/swarm_control_station', 'grindless:assembly_line/solar_probe_bay']);
  for (const id of SW.crafting) assert.ok(dump(id) || recipes.find((r) => r.i === id), id);
  const srv = read('server_scripts/grindless/uhv/swarm.js');
  const researchIds = [...srv.matchAll(/research: '([^']+)'/g)].map((m) => m[1]);
  assert.equal(new Set(researchIds).size, 3, 'a different research item each');
  const lang = read('client_scripts/grindless/uhv_swarm_lang.js');
  for (const k of ['swarm_segment_foundry', 'swarm_control_station', 'solar_probe_bay', 'sodium_potassium_heat_pipe', 'solar_probe']) {
    assert.ok(lang.includes(k), k);
  }
  assert.ok(lang.includes('en_us') && lang.includes('es_es'));
});
