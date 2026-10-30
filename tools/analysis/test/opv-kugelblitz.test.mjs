// OpV-D3 (kugelblitz): the forge's five rows, the collector's two generator rows, the two controllers' assembly lines and the structures of
// startup_scripts/grindless/opv/kugelblitz.js.
import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';
import { measure, violations } from '../lib/structure_quality.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const pack = path.resolve(here, '..', '..', '..', 'pack');
const run = runPackScripts(pack);
const KB = run.global.grindless.kugelblitz;
const recipes = run.docs.recipes.recipes;
const find = (id) => recipes.find((r) => r.i === id);
const producers = (id) => recipes.filter((r) => JSON.stringify(r.j.outputs || {}).includes(`"${id}"`));
const plain = (x) => JSON.parse(JSON.stringify(x));
const rec = (type, name) => KB.recipes.find((r) => r.type === type && r.name === name);
const SITE = 'grindless:cygnus_x1_orbit';
const MACHINES = ['kugelblitz_forge', 'hawking_collector'];
const wear = (r, id) => r.wear.find((w) => w.id === id);

test('the stand-in runs the OpV-D3 scripts without errors, nothing skipped, no lookup clash', () => {
  const mine = run.errors.filter((e) => /kugelblitz|sounds/.test(String(e.file)) && !/no original recipe/.test(String(e.message)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(KB.skipped), []);
  assert.deepEqual(plain(KB.clashes), []);
  assert.equal(KB.recipes.length, 7);
});

test('forge circuits 1-5 with their EU/t and ticks, all locked to Cygnus X-1', () => {
  const want = { charge_gamma_pump: [1, 503316480, 800], focus_kugelblitz_seed: [2, 503316480, 2400], condense_kugelblitz_core: [3, 503316480, 2400], forge_hawking_drive: [4, 268435456, 1200], recondense_core_from_shell: [5, 503316480, 2400] };
  for (const [n, v] of Object.entries(want)) {
    const r = rec('kugelblitz_forming', n);
    assert.deepEqual([r.circuit, r.eut, r.duration, r.site, r.generator], [...v, true, false], n);
    assert.ok(JSON.stringify(find(`grindless:kugelblitz_forming/${n}`).j.recipeConditions || []).includes(SITE), n);
  }
});

test('charge and seed: exact wear 1/8 and 1/64, the 5% failed seed', () => {
  const c1 = rec('kugelblitz_forming', 'charge_gamma_pump');
  assert.deepEqual(plain(c1.itemsIn), [{ id: 'grindless:dense_positron_cell', count: 2 }]);
  assert.deepEqual(plain(wear(c1, 'grindless:gamma_laser_module').chance), [1, 8]);
  const c2 = rec('kugelblitz_forming', 'focus_kugelblitz_seed');
  assert.deepEqual(plain(wear(c2, 'grindless:laue_lens').chance), [1, 64]);
  assert.deepEqual(plain(wear(c2, 'grindless:gamma_multilayer_mirror').chance), [1, 64]);
  assert.deepEqual(plain(c2.itemsIn), [{ id: 'grindless:gamma_pump_charge', count: 4 }, { id: 'grindless:frc_cartridge', count: 1 }]);
  assert.deepEqual(plain(c2.itemsOut[0].chance), [95, 100]);
  assert.ok(KB.custom.includes('grindless:kugelblitz_forming/focus_kugelblitz_seed'), '1/64 is written exactly (custom JSON)');
  const j = find('grindless:kugelblitz_forming/focus_kugelblitz_seed').j;
  const lens = j.inputs.item.find((c) => JSON.stringify(c.content).includes('laue_lens'));
  assert.deepEqual([lens.chance, lens.maxChance], [1, 64]);
});

test('core, drive and the shell route', () => {
  const c3 = rec('kugelblitz_forming', 'condense_kugelblitz_core');
  assert.deepEqual(plain(c3.itemsIn.map((x) => [x.id, x.count])), [['grindless:kugelblitz_seed', 1], ['grindless:positron_cartridge', 4], ['grindless:gamma_absorber_tile', 8]]);
  assert.deepEqual(plain(c3.itemsOut), [{ id: 'grindless:kugelblitz_core', count: 1, chance: null }]);
  const c4 = rec('kugelblitz_forming', 'forge_hawking_drive');
  assert.deepEqual(plain(c4.itemsIn.map((x) => x.id)), ['grindless:kugelblitz_core', 'grindless:gamma_multilayer_mirror', 'grindless:field_frozen_plate']);
  assert.equal(c4.itemsOut[0].id, 'grindless:hawking_drive');
  const c5 = rec('kugelblitz_forming', 'recondense_core_from_shell');
  assert.equal(c5.itemsIn.find((x) => x.id === 'grindless:gamma_absorber_tile').count, 4, 'half the tiles come back through the shell');
  assert.ok(c5.itemsIn.some((x) => x.id === 'grindless:evaporated_core_shell'));
});

test('collector: generator rows at 2^30 and 2^29 EU/t, core wear 1/64 and 1/32, tile 1/8, one run', () => {
  const c1 = rec('hawking_power', 'feed_exotic_matter');
  assert.deepEqual([c1.circuit, c1.eut, c1.duration, c1.site, c1.generator], [1, 2 ** 30, 2400, true, true]);
  assert.deepEqual(plain(c1.itemsIn), [{ id: 'grindless:stable_exotic_matter', count: 1 }]);
  assert.deepEqual(plain(wear(c1, 'grindless:kugelblitz_core').chance), [1, 64]);
  assert.deepEqual(plain(wear(c1, 'grindless:gamma_absorber_tile').chance), [1, 8]);
  const c2 = rec('hawking_power', 'feed_stellar_plasma');
  assert.deepEqual([c2.circuit, c2.eut, c2.duration, c2.generator], [2, 2 ** 29, 1200, true]);
  assert.deepEqual(plain(c2.fluidsIn), [{ id: 'grindless:stellar_plasma', amount: 4000 }]);
  assert.deepEqual(plain(wear(c2, 'grindless:kugelblitz_core').chance), [1, 32]);
  for (const n of ['feed_exotic_matter', 'feed_stellar_plasma']) {
    const d = find(`grindless:hawking_power/${n}`);
    assert.ok(d && JSON.stringify(d.j.tickOutputs || {}).includes('eu'), n);
    assert.ok(JSON.stringify(d.j.recipeConditions || []).includes(SITE), n);
    assert.ok(KB.custom.includes(`grindless:hawking_power/${n}`), n);
  }
  const core = find('grindless:hawking_power/feed_exotic_matter').j.inputs.item.find((c) => JSON.stringify(c.content).includes('kugelblitz_core'));
  assert.deepEqual([core.chance, core.maxChance], [1, 64]);
  // the core is not consumed per run: 64 runs of 2^30 EU/t for 2,400 t on average
  assert.ok(2 ** 30 * 2400 * 64 > 1.6e14);
});

test('no spin, no rotation, no Sgr A* anywhere in the package', () => {
  const text = JSON.stringify(KB.recipes) + JSON.stringify(run.lang.en_us['emi.grindless.info.hawking_collector.0']) + JSON.stringify(run.lang.en_us['emi.grindless.info.kugelblitz_forge.0']);
  assert.ok(!/superradian|sgr_a|sgra|rotation_energy|penrose/i.test(text));
  assert.match(run.lang.en_us['emi.grindless.info.hawking_collector.0'], /non-?spinning|does not spin|no spin/i);
});

test('the controllers: OpV hull, OpV circuits, domain items, station research, 2,400 t at 503,316,480 EU/t', () => {
  assert.deepEqual(plain(KB.controllerRecipes), MACHINES.map((m) => `grindless:assembly_line/${m}`));
  const want = { kugelblitz_forge: ['laue_lens', 'gamma_multilayer_mirror', 'tetron_array', 'frc_cartridge', 'opv_emitter'], hawking_collector: ['kugelblitz_core', 'gamma_absorber_tile', 'tpv_panel', 'stable_exotic_matter', 'opv_electric_pump'] };
  for (const m of MACHINES) {
    const r = find(`grindless:assembly_line/${m}`);
    assert.ok(r && r.t === 'gtceu:assembly_line', m);
    const text = JSON.stringify(r.j);
    assert.ok(text.includes(`gtceu:${m}`));
    for (const need of ['gtceu:opv_machine_hull', 'gtceu:circuits/opv', 'opv_field_generator', 'opv_sensor', 'superfluid_helium_3', ...want[m]]) assert.ok(text.includes(need), `${m} takes ${need}`);
    assert.ok(!/uxv_|uiv_/.test(text), `${m} takes no older-tier component`);
    assert.ok(text.includes('503316480'), m);
    const ids = new Set(text.match(/"(?:id|tag|item)":"[^"]+"/g) || []);
    assert.ok(ids.size >= 9, `${m}: ${ids.size} distinct ingredients`);
  }
});

test('"only from": the ids of this package come from these rows alone', () => {
  const only = {
    'grindless:gamma_pump_charge': 'kugelblitz_forming/charge_gamma_pump', 'grindless:kugelblitz_seed': 'kugelblitz_forming/focus_kugelblitz_seed',
    'grindless:hawking_drive': 'kugelblitz_forming/forge_hawking_drive', 'gtceu:kugelblitz_forge': 'assembly_line/kugelblitz_forge', 'gtceu:hawking_collector': 'assembly_line/hawking_collector'
  };
  for (const [id, tail] of Object.entries(only)) {
    const ps = producers(id).map((r) => r.i);
    assert.ok(ps.length >= 1, `${id} has a producer`);
    assert.deepEqual(ps.filter((i) => !i.endsWith(tail)), [], `${id} only from ${tail}`);
  }
  const core = producers('grindless:kugelblitz_core').map((r) => r.i).sort();
  assert.deepEqual(core, ['grindless:kugelblitz_forming/condense_kugelblitz_core', 'grindless:kugelblitz_forming/recondense_core_from_shell']);
});

test('structures: spheres, not boring, three functional kinds, controller in the front slice', () => {
  const size = { kugelblitz_forge: 15, hawking_collector: 11 };
  for (const m of MACHINES) {
    const s = run.global.grindless.structures[`gtceu:${m}`];
    assert.ok(s, `${m} has a description`);
    const mm = measure(s);
    assert.deepEqual(violations(mm), [], `${m}: ${JSON.stringify(mm)}`);
    assert.ok(mm.dominantShare <= 0.62, `${m}: dominant share ${mm.dominantShare}`);
    assert.ok(mm.functional.length >= 3, `${m}: ${mm.functional}`);
    assert.equal(s.slices.length, size[m], `${m} is ${size[m]} slices deep`);
    assert.ok(s.slices[s.slices.length - 1].some((row) => row.includes('S')), `${m}: the controller is in the front slice`);
    const xs = s.slices.reduce((n, sl) => n + sl.join('').split('X').length - 1, 0);
    assert.ok(xs >= 4, `${m}: ${xs} hatch cells`);
  }
});

test('lang parity: names, tooltips, EMI pages, items and recipe lines in both languages', () => {
  const keys = ['gtceu.kugelblitz_forming', 'gtceu.hawking_power', 'emi.grindless.info.hawking_drive.0', 'emi.grindless.info.hawking_drive.1'];
  for (const m of MACHINES) keys.push(`block.gtceu.${m}`, `grindless.machine.${m}.tooltip.0`, `emi.grindless.info.${m}.0`, `emi.grindless.info.${m}.1`);
  for (const i of ['gamma_pump_charge', 'kugelblitz_seed', 'evaporated_core_shell']) keys.push(`item.grindless.${i}`, `tooltip.grindless.${i}.0`, `tooltip.grindless.${i}.1`);
  for (const r of KB.recipes) keys.push(`gtceu.recipe.${r.dataKey}.${r.name}`);
  for (const k of keys) for (const lang of ['en_us', 'es_es']) assert.ok(run.lang[lang][k], `${lang} has ${k}`);
  const re = /kugelblitz|hawking|gamma_pump|evaporated_core/;
  assert.deepEqual(Object.keys(run.lang.en_us).filter((k) => re.test(k)).sort(), Object.keys(run.lang.es_es).filter((k) => re.test(k)).sort());
});
