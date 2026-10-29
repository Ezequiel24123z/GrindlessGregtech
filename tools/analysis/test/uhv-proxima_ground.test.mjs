// UHV's Proxima ground (package UHV-B5; docs/eras/uhv.md, machines 29 and 31, lines 16, 17 and 18), no game needed. The pack's
// scripts run in the stand-in of lib/kubejs_static.mjs:
//   - startup_scripts/grindless/uhv/proxima_ground.js: two recipe types and machines, three items, two blocks;
//   - server_scripts/grindless/uhv/proxima_ground.js: data/grindless/tables/proxima_ground.json's rows and the two controllers;
//   - en_us and es_es text for everything new.
// Proof reuse (docs/eras/uhv.md, Common): the dimension allowlist (lib/places.js), lib/patterns.js and the table-driven machines are
// proven; this checks the recipe lookup, the Proxima allowlist, the night-side biome condition and the bootstrap. T1: none.
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
const PG = plain(run.global.grindless.proximaGround);
const recipes = run.docs.recipes.recipes;
const read = (rel) => fs.readFileSync(path.join(pack, 'kubejs', rel), 'utf8');
const T = JSON.parse(read('data/grindless/tables/proxima_ground.json'));
const dump = (id) => recipes.find((r) => r.i === id);
const circuitOf = (r) => ((r.j.inputs || {}).item || []).filter((i) => i.content.type === 'gtceu:circuit').map((i) => i.content.configuration);
const condsOf = (r, type) => (r.j.recipeConditions || []).filter((c) => c.type === type);
const dimsOf = (r) => condsOf(r, 'dimension').map((c) => c.dimension);
const ins = (r) => JSON.stringify(r.j.inputs || r.j.ingredients || r.j.key || {});
const outs = (r) => JSON.stringify(r.j.outputs || r.j.result || {});
const has = (json, id) => json.includes(`"${id}"`);
const ids = (xs) => (Array.isArray(xs) ? xs : []).map((x) => x.id);
const inputs = (r) => ids(r.itemsIn).concat(ids(r.kept), ids(r.fluidsIn));
const outputs = (r) => ids(r.itemsOut).concat(ids(r.fluidsOut));
const makers = (id) => recipes.filter((r) => has(outs(r), id)).map((r) => r.i).sort();
const users = (id) => recipes.filter((r) => has(ins(r), id)).map((r) => r.i).sort();

const PROXIMA = 'gcyr:proxima_centauri_b';
const NIGHT_SIDE = 'gcyr:proxima_centauri_b_opp_side';
const VA_UHV = 1966080;
const MACHINES = {
  drill: ['gtceu:cold_trap_drill', 'cold_trap_drilling', { itemsIn: 4, itemsOut: 2, fluidsIn: 0, fluidsOut: 0 }, 'grindless:proxima_base_casing'],
  heap: ['gtceu:biomining_heap', 'biomining', { itemsIn: 5, itemsOut: 2, fluidsIn: 1, fluidsOut: 1 }, 'gtceu:inert_machine_casing']
};
const OURS = Object.values(MACHINES).map((m) => m[1]);
const GTM = ['chemical_reactor', 'mixer', 'centrifuge', 'assembler'];
const HOSTED = ['pgm_refining', 'tholin_reforming'];
const rows = () => Object.entries(T.types).flatMap(([type, t]) => t.recipes.map((r) => ({ ...r, type, dataKey: t.dataKey, idPrefix: t.idPrefix || '' })));
const idOf = (r) => `grindless:${r.type}/${r.idPrefix}${r.name}`;
const SITE_DIMS = { proxima_b: [PROXIMA], saturn_orbit: ['grindless:saturn_orbit'] };

test('the stand-in runs the Proxima ground scripts without errors, nothing clashing or skipped', () => {
  const errs = run.errors.filter((e) => /proxima_ground/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(PG.clashes, []);
  assert.deepEqual(PG.skipped, []);
  assert.equal(PG.recipes.length, rows().length);
});

test('registration: two types and machines, three items, two blocks; F1\'s and B4\'s ids are not registered again', () => {
  for (const [key, [machine, type]] of Object.entries(MACHINES)) {
    assert.deepEqual(run.registry.machines.get(machine).recipeTypes, [`gtceu:${type}`], key);
    assert.ok(run.registry.recipeTypes.has(`gtceu:${type}`), type);
  }
  assert.deepEqual(Object.keys(PG.items).sort(), ['cold_trap_coring_head', 'leached_tailings', 'urea']);
  for (const n of Object.keys(PG.items)) assert.ok(run.registry.items.has(`grindless:${n}`), n);
  assert.deepEqual(Object.keys(PG.blocks).sort(), ['biocemented_regolith', 'proxima_base_casing']);
  for (const n of Object.keys(PG.blocks)) assert.ok(run.registry.blocks.has(`grindless:${n}`) && run.registry.items.has(`grindless:${n}`), n);
  const src = read('startup_scripts/grindless/uhv/proxima_ground.js');
  const older = ['proxima_regolith_survey', 'proxima_ice_core', 'cold_trap_regolith', 'deuterium_enriched_water', 'proxima_pgm_liquor',
    'proxima_ree_liquor', 'sterilised_ice_organics', 'flare_shield_panel', 'chromobacterium_culture', 'sphingomonas_culture',
    'sporosarcina_culture', 'californium_252_source', 'ultrapure_water'];
  for (const n of older) {
    assert.doesNotMatch(src, new RegExp(`^\\s+${n}\\s*:\\s*\\{`, 'm'), n + ' belongs to an older package');
    assert.ok(run.registry.items.has(`grindless:${n}`) || run.registry.materials.has(`gtceu:${n}`), n);
  }
});

test('patterns: each machine is its declared size, one controller, every symbol defined, its casing in the part layer', () => {
  for (const [key, [machine, , , casing]] of Object.entries(MACHINES)) {
    const m = PG.machines[key];
    assert.equal(m.casing, casing, key);
    const s = run.docs.structures.structures[machine];
    assert.ok(s, machine);
    assert.equal(s.slices.length, m.depth, key);
    assert.ok(s.slices.every((sl) => sl.length === m.height && sl.every((r) => r.length === m.width)), key + ' uniform slices');
    assert.equal(s.slices.flat().join('').split('').filter((c) => c === 'S').length, 1, key + ' one controller');
    for (const sl of s.slices) for (const r of sl) for (const c of r) assert.ok(c === ' ' || s.symbols[c], `${key}: symbol ${c}`);
    assert.ok(s.symbols.X.options.some((o) => o.kind === 'blocks' && o.blocks.includes(casing)), key + ' casing');
    const abilities = s.symbols.X.options.filter((o) => o.kind === 'part').map((o) => o.ability);
    assert.ok(abilities.includes('energy_input') && abilities.includes('input_bus') && abilities.includes('output_bus'), key);
    // every slot a recipe needs has a hatch
    if (m.maxIO.fluidsIn > 0) assert.ok(abilities.includes('input_hatch'), key);
    if (m.maxIO.fluidsOut > 0) assert.ok(abilities.includes('output_hatch'), key);
    assert.equal(s.slices[s.slices.length - 1].flat().join('').includes('S'), true, key + ' controller in the front slice');
  }
});

test('the recipes fit the machines\' slots (startup maxIO; the circuit takes an item slot)', () => {
  const startup = read('startup_scripts/grindless/uhv/proxima_ground.js');
  for (const [key, [, type, io]] of Object.entries(MACHINES)) {
    assert.ok(startup.includes(`maxIO: { itemsIn: ${io.itemsIn}, itemsOut: ${io.itemsOut}, fluidsIn: ${io.fluidsIn}, fluidsOut: ${io.fluidsOut} }`), key);
    for (const r of T.types[type].recipes) {
      assert.ok(r.itemsIn.length + r.kept.length + 1 <= io.itemsIn, `${r.name} items in`);
      assert.ok(r.fluidsIn.length <= io.fluidsIn, `${r.name} fluids in`);
      assert.ok(r.itemsOut.length <= io.itemsOut, `${r.name} items out`);
      assert.ok(r.fluidsOut.length <= io.fluidsOut, `${r.name} fluids out`);
    }
  }
});

test('recipe lookup: unique names and circuits, no subsets inside a type, every row in the dump with its circuit and data key', () => {
  for (const [type, t] of Object.entries(T.types)) {
    assert.equal(new Set(t.recipes.map((r) => r.name)).size, t.recipes.length, type);
    const circuits = t.recipes.map((r) => r.circuit).filter((c) => c > 0);
    assert.equal(new Set(circuits).size, circuits.length, type);
    if (OURS.includes(type) || HOSTED.includes(type)) assert.ok(t.recipes.every((r) => r.circuit >= 1 && r.circuit <= 32), type + ' needs circuits');
    else assert.ok(GTM.includes(type) && t.recipes.every((r) => r.circuit === 0), type);
    const keys = t.recipes.map((r) => new Set(inputs(r).concat([`circuit:${r.circuit}`])));
    const sub = (a, b) => [...a].every((k) => b.has(k));
    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) assert.ok(!sub(keys[i], keys[j]) && !sub(keys[j], keys[i]), `${type}: ${t.recipes[i].name} / ${t.recipes[j].name}`);
    }
  }
  for (const r of rows()) {
    const id = idOf(r);
    const d = dump(id);
    assert.ok(d, id);
    assert.equal(PG.recipes.find((x) => x.type === r.type && x.name === r.name).recipeId, id);
    assert.deepEqual(circuitOf(d), r.circuit > 0 ? [r.circuit] : [], id);
    assert.ok(Number.isInteger(r.eut) && r.eut > 0 && r.eut <= VA_UHV && Number.isInteger(r.duration) && r.duration > 0, id);
    if (r.dataKey) assert.equal(PG.recipes.find((x) => x.recipeId === id).dataKey, r.dataKey, id + ' data key');
  }
  assert.ok(read('server_scripts/grindless/uhv/proxima_ground.js').includes('recipe.addDataString(rec.dataKey, rec.name)'));
  // GTM's own rows of these types are never shadowed: ours are keyed by our own items, except urea (ammonia + carbon dioxide) and the
  // fertiliser (ammonium chloride + tricalcium phosphate + water), which no GTM recipe of their type takes together or in part
  const UNKEYED = ['urea', 'proxima_ammonium_fertiliser'];
  for (const r of rows().filter((x) => GTM.includes(x.type) && !UNKEYED.includes(x.name))) assert.ok(inputs(r).some((i) => i.startsWith('grindless:')), r.name);
});

test('allowlists: the drill on Proxima b\'s night side only, the heap and the ice-core melt on Proxima b only, the reformer row in Saturn orbit, the rest anywhere', () => {
  for (const r of rows()) {
    const d = dump(idOf(r));
    const proxima = OURS.includes(r.type) || r.name === 'proxima_ice_core';
    const site = proxima ? 'proxima_b' : r.type === 'tholin_reforming' ? 'saturn_orbit' : undefined;
    assert.equal(r.site, site, r.name);
    assert.deepEqual(dimsOf(d), site ? SITE_DIMS[site] : [], idOf(r));
    const biomes = condsOf(d, 'biome').map((c) => (c.args || [])[0]);
    assert.deepEqual(biomes, r.type === 'cold_trap_drilling' ? [NIGHT_SIDE] : [], `${idOf(r)} biome`);
  }
  assert.ok(PG.recipes.filter((x) => x.type === 'cold_trap_drilling').every((x) => x.biome === NIGHT_SIDE), 'the builder took the biome');
});

test('the drill: the survey and the californium source are kept, the coring head wears out 1 run in 32; the only source of its products', () => {
  const dig = dump('grindless:cold_trap_drilling/dig');
  const items = dig.j.inputs.item;
  const find = (id) => items.find((i) => JSON.stringify(i).includes(`"${id}"`));
  for (const id of ['grindless:proxima_regolith_survey', 'grindless:californium_252_source']) assert.equal(find(id).chance, 0, id + ' kept');
  assert.equal(find('grindless:cold_trap_coring_head').chance, 313);
  for (const id of ['grindless:proxima_ice_core', 'grindless:cold_trap_regolith']) assert.deepEqual(makers(id), [dig.i], id);
  assert.deepEqual(makers('grindless:cold_trap_coring_head'), ['grindless:assembler/cold_trap_coring_head']);
  assert.ok(has(ins(dump('grindless:assembler/cold_trap_coring_head')), 'grindless:hss_s_drill_bit'));
});

test('the heap: each culture is kept, the liquors come only from it, biocement from cold-trap and (half) lunar regolith', () => {
  const CULTURES = { pgm_leach: 'chromobacterium_culture', ree_leach: 'sphingomonas_culture', biocement: 'sporosarcina_culture',
    lunar_biocement: 'sporosarcina_culture' };
  for (const [name, culture] of Object.entries(CULTURES)) {
    const d = dump(`grindless:biomining/${name}`);
    const c = d.j.inputs.item.find((i) => JSON.stringify(i).includes(`"grindless:${culture}"`));
    assert.ok(c && c.chance === 0, `${name} keeps ${culture}`);
  }
  assert.deepEqual(makers('gtceu:proxima_pgm_liquor'), ['grindless:biomining/pgm_leach']);
  assert.deepEqual(makers('gtceu:proxima_ree_liquor'), ['grindless:biomining/ree_leach']);
  assert.deepEqual(makers('grindless:biocemented_regolith'), ['grindless:biomining/biocement', 'grindless:biomining/lunar_biocement']);
  const yieldOf = (n) => T.types.biomining.recipes.find((r) => r.name === n).itemsOut.find((x) => x.id === 'grindless:biocemented_regolith').count;
  assert.equal(yieldOf('lunar_biocement') * 2, yieldOf('biocement'));
  assert.ok(makers('gtceu:lunar_regolith_dust').length > 0, 'lunar regolith has a maker in the pack');
  assert.deepEqual(makers('grindless:urea'), ['grindless:chemical_reactor/urea']);
  assert.deepEqual(users('grindless:urea'), ['grindless:biomining/biocement', 'grindless:biomining/lunar_biocement']);
});

test('the bootstrap: the heap stands on GTM\'s inert casing; the Proxima base casing (flare panels + biocement) is the drill\'s pad', () => {
  assert.notEqual(PG.machines.heap.casing, PG.ids.baseCasing);
  assert.equal(PG.machines.drill.casing, PG.ids.baseCasing);
  const casing = dump('grindless:assembler/proxima_base_casing');
  assert.deepEqual(makers('grindless:proxima_base_casing'), [casing.i]);
  for (const id of ['grindless:flare_shield_panel', 'grindless:biocemented_regolith']) assert.ok(has(ins(casing), id), id);
  assert.ok(users('grindless:flare_shield_panel').includes(casing.i));
});

test('every new intermediate and B4 leftover has a destination; the byproducts go to standing machines', () => {
  const consumed = (id) => users(id).length > 0;
  for (const id of ['grindless:proxima_regolith_survey', 'grindless:chromobacterium_culture', 'grindless:sphingomonas_culture',
    'grindless:sporosarcina_culture', 'grindless:californium_252_source', 'grindless:flare_shield_panel', 'grindless:proxima_ice_core',
    'grindless:cold_trap_regolith', 'grindless:leached_tailings', 'grindless:urea', 'grindless:cold_trap_coring_head',
    'grindless:biocemented_regolith', 'gtceu:ammonium_chloride_dust']) assert.ok(consumed(id), id);
  assert.ok(users('grindless:leached_tailings').includes('grindless:chemical_reactor/proxima_tailings_calcium'));
  assert.ok(users('gtceu:calcium_chloride_dust').includes('grindless:biomining/biocement'));
  assert.ok(users('gtceu:ammonium_chloride_dust').includes('grindless:mixer/proxima_ammonium_fertiliser'));
  assert.ok(makers('grindless:sterilised_ice_organics').includes('grindless:centrifuge/proxima_ice_core'));
  assert.deepEqual(makers('gtceu:deuterium_enriched_water'), ['grindless:centrifuge/proxima_ice_core']);
});

test('the older machines\' Proxima rows: each in the dump on a circuit its type leaves free, inside the host\'s slots, the only users of the new fluids', () => {
  const older = /(regolith_cell|extraction_cascade|heavy_water_plant|titan_probes|platinum_plant)\.js/;
  assert.deepEqual(run.errors.filter((e) => older.test(String(e.file))), []);
  const ROWS = {
    pgm: ['grindless:pgm_refining/uhv/proxima_liquor', 6],
    tholin: ['grindless:tholin_reforming/uhv/proxima_organics_hydrolysis', 4],
    heavy: ['grindless:isotope_exchange/proxima_water_exchange', 3],
    cascade: ['grindless:solvent_extraction/ev/proxima_ree_liquor', 7],
    regolith: ['grindless:regolith_processing/ev/proxima_tailings', 2]
  };
  const d = {};
  for (const [k, [id, c]] of Object.entries(ROWS)) {
    d[k] = dump(id);
    assert.ok(d[k], id);
    assert.deepEqual(circuitOf(d[k]), [c], id);
    // the regolith cell's circuit 2 is its electrolysis mode: three feeds, one per row, so the lookup still sees one recipe each
    const same = recipes.filter((r) => r.t === d[k].t && r.i !== id && circuitOf(r).includes(c));
    if (k === 'regolith') assert.ok(same.length > 0 && same.every((r) => !has(ins(r), 'grindless:leached_tailings')), id);
    else assert.deepEqual(same.map((r) => r.i), [], id);
  }
  const slots = (r) => {
    const items = r.j.inputs.item.filter((i) => i.content.type !== 'gtceu:circuit');
    return [items.length, r.j.inputs.fluid.length, r.j.outputs.item.length, r.j.outputs.fluid.length];
  };
  // the platinum plant: its own maxIO (the circuit takes an item slot), the worn electrode as in its other modes, voiding refused
  const pp = read('startup_scripts/grindless/ev/platinum_plant.js').match(/PP\.maxIO = \{ itemsIn: (\d+), itemsOut: (\d+), fluidsIn: (\d+), fluidsOut: (\d+) \}/);
  const [pi, pf, po, pfo] = slots(d.pgm);
  assert.ok(pp && pi + 1 <= +pp[1] && po <= +pp[2] && pf <= +pp[3] && pfo <= +pp[4], 'platinum plant slots');
  assert.equal(d.pgm.j.inputs.item.find((i) => JSON.stringify(i).includes('"grindless:platinum_electrode"')).chance, 10);
  for (const m of ['platinum', 'palladium', 'ruthenium', 'iridium']) assert.ok(has(outs(d.pgm), `gtceu:${m}_dust`), m);
  assert.equal(T.types.pgm_refining.keep, true);
  assert.ok(read('server_scripts/grindless/uhv/proxima_ground.js').includes('recipe.addDataBool('));
  assert.ok(!read('server_scripts/grindless/ev/platinum_plant.js').includes('proxima'), 'the plant\'s own script is untouched');
  // the tholin reformer: io [1, 1, 2, 1] like its own circuit 1 hydrolysis (the circuit does not take its one item slot), in Saturn orbit
  const reformer = plain(run.global.grindless.zpmTitanProbes).machines.find((m) => m.type === 'tholin_reforming').io;
  const [ti, tf, to, tfo] = slots(d.tholin);
  assert.ok(ti <= reformer[0] && tf <= reformer[1] && to <= reformer[2] && tfo <= reformer[3], 'reformer slots ' + reformer);
  assert.ok(has(outs(d.tholin), 'gtceu:titan_nitriles') && has(ins(d.tholin), 'grindless:sterilised_ice_organics'));
  assert.ok(!/name: 'proxima/.test(read('server_scripts/grindless/zpm/titan_probes.js')), 'the probes\' own table keeps its six rows');
  // the heavy water plant: four times the Martian melt's D2O per 1 000 mB of water, the same charge, no melt and no steam
  const HW = JSON.parse(read('data/grindless/tables/heavy_water_plant.json')).recipes;
  const mars = HW.find((r) => r.name === 'martian_ice_exchange');
  const prox = HW.find((r) => r.name === 'proxima_water_exchange');
  const conc = (r) => r.fluidsOut.find((x) => x.id === 'gtceu:heavy_water_concentrate').amount;
  const melt = mars.energy.find((s) => s.stage === 'melt').amount;
  assert.equal(conc(prox) / prox.fluidsIn[0].amount, 4 * conc(mars) / melt);
  assert.equal(prox.charge, true);
  assert.deepEqual(prox.energy.map((s) => s.stage), ['exchange']);
  assert.ok(!has(ins(d.heavy), 'gtceu:steam'));
  // the cascade takes the REE liquor; the regolith cell takes the tailings on the Moon with its anode, giving silica, iron and oxygen
  assert.ok(has(ins(d.cascade), 'gtceu:proxima_ree_liquor'));
  assert.equal(dimsOf(d.regolith).length, 1);
  assert.deepEqual(dimsOf(d.regolith), dimsOf(dump('grindless:regolith_processing/ev/regolith_electrolysis')));
  const tail = d.regolith.j.inputs.item.find((i) => JSON.stringify(i).includes('"grindless:leached_tailings"'));
  assert.equal(tail.content.count, 16);
  assert.equal(d.regolith.j.inputs.item.find((i) => JSON.stringify(i).includes('"grindless:platinum_electrode"')).chance, 10);
  for (const id of ['gtceu:silicon_dioxide_dust', 'gtceu:iron_dust', 'gtceu:oxygen']) assert.ok(has(outs(d.regolith), id), id);
  // the only users
  assert.deepEqual(users('gtceu:proxima_pgm_liquor'), [d.pgm.i]);
  assert.deepEqual(users('gtceu:proxima_ree_liquor'), [d.cascade.i]);
  assert.deepEqual(users('gtceu:deuterium_enriched_water'), [d.heavy.i]);
  assert.ok(users('grindless:sterilised_ice_organics').includes(d.tholin.i));
  assert.ok(users('grindless:leached_tailings').includes(d.regolith.i));
});

test('controllers: assembly lines with station research, UHV hull and circuits, an era fluid', () => {
  assert.equal(PG.controllerRecipes.length, 2);
  for (const [key, [machine]] of Object.entries(MACHINES)) {
    const id = `grindless:assembly_line/${PG.machines[key].name}`;
    const d = dump(id);
    assert.ok(d && PG.controllerRecipes.includes(id), id);
    assert.equal(d.t, 'gtceu:assembly_line', id);
    assert.ok(outs(d).includes(machine), id);
    assert.ok(ins(d).includes('gtceu:uhv_machine_hull') && ins(d).includes('gtceu:circuits/uhv'), id);
    assert.ok(JSON.stringify(d.j).includes('"research"') && JSON.stringify(d.j).includes('gtceu:tritanium'), id);
  }
});

test('no UEV input, and every lang key the package needs is written in en_us and es_es', () => {
  for (const r of rows()) for (const id of inputs(r).concat(outputs(r))) assert.ok(!/(^|[:_])uev(_|$)/.test(id.split(':')[1] || ''), `${r.name}: ${id}`);
  const keys = [];
  for (const [key, [, type]] of Object.entries(MACHINES)) {
    const n = PG.machines[key].name;
    keys.push(`block.gtceu.${n}`, `gtceu.${type}`, ...[0, 1, 2].map((i) => `grindless.machine.${n}.tooltip.${i}`));
  }
  for (const r of rows()) if (r.dataKey) keys.push(`gtceu.recipe.${r.dataKey}.${r.name}`);
  for (const n of Object.keys(PG.items)) keys.push(`item.grindless.${n}`, `tooltip.grindless.${n}.0`, `tooltip.grindless.${n}.1`);
  for (const n of Object.keys(PG.blocks)) keys.push(`block.grindless.${n}`, `tooltip.grindless.${n}.0`, `tooltip.grindless.${n}.1`);
  for (const lang of ['en_us', 'es_es']) for (const k of keys) assert.ok(run.lang[lang] && run.lang[lang][k], `${lang}: ${k}`);
});
