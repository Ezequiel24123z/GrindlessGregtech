// OpV-B3 (antimatter): the antihydrogen foundry and annihilation engine rows, their controllers' assembly lines, the shield casing's assembler and
// the structures of startup_scripts/grindless/opv/antimatter.js.
import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';
import { measure, violations } from '../lib/structure_quality.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const pack = path.resolve(here, '..', '..', '..', 'pack');
const run = runPackScripts(pack);
const AM = run.global.grindless.opvAntimatter;
const recipes = run.docs.recipes.recipes;
const find = (id) => recipes.find((r) => r.i === id);
const plain = (x) => JSON.parse(JSON.stringify(x));
const rec = (type, name) => AM.recipes.find((r) => r.type === type && r.name === name);
const MACHINES = ['antihydrogen_foundry', 'annihilation_engine'];
const out = (r, id) => r.chanceOut.find((x) => x.id === id) || r.itemsOut.find((x) => x.id === id);
const wear = (r, id) => r.wear.find((x) => x.id === id);

test('the stand-in runs the OpV-B3 scripts without errors, nothing skipped, no lookup clash', () => {
  const mine = run.errors.filter((e) => /antimatter|sounds/.test(String(e.file)) && !/no original recipe/.test(String(e.message)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(AM.skipped), []);
  assert.deepEqual(plain(AM.clashes), []);
});

test('foundry: c1 trap, c2 laser cool, c3 ice; each step loses 5%, the traps return at 90%, the magnet and laser wear', () => {
  const c1 = rec('antihydrogen_synthesis', 'trap_antihydrogen');
  assert.deepEqual([c1.circuit, c1.eut, c1.duration, c1.generator], [1, 268435456, 1200, false]);
  assert.equal(wear(c1, 'grindless:octupole_trap_magnet').chance, 156);
  assert.equal(out(c1, 'grindless:trapped_antihydrogen').chance, 9500);
  assert.equal(out(c1, 'grindless:empty_penning_trap').chance, 9000);
  const c2 = rec('antihydrogen_synthesis', 'laser_cool');
  assert.deepEqual([c2.circuit, c2.eut, c2.duration], [2, 268435456, 800]);
  assert.equal(wear(c2, 'grindless:lyman_alpha_laser').chance, 78);
  assert.equal(out(c2, 'grindless:cooled_antihydrogen').chance, 9500);
  const c3 = rec('antihydrogen_synthesis', 'freeze_ice');
  assert.deepEqual([c3.circuit, c3.eut, c3.duration], [3, 503316480, 1600]);
  assert.ok(c3.itemsIn.some((x) => x.id === 'grindless:levitation_trap_cell'));
  assert.equal(out(c3, 'grindless:antihydrogen_ice_cell').chance, 9500);
  for (const r of AM.recipes) assert.ok(r.eut < 2 ** 31, `${r.name} stays below 2^31 EU/t`);
});

test('engine: a generator, c1 2^29 EU/t and c2 2^30 EU/t for 1,200 t, one run, wearing the tile at 1/16; the chains return more than they cost', () => {
  const c1 = rec('annihilation_power', 'burn_ice');
  assert.deepEqual([c1.circuit, c1.eut, c1.duration, c1.generator, c1.site], [1, 2 ** 29, 1200, true, false]);
  assert.equal(wear(c1, 'grindless:gamma_absorber_tile').chance, 625);
  assert.equal(out(c1, 'grindless:activated_absorber_tile').chance, 625);
  assert.equal(out(c1, 'grindless:levitation_trap_cell').chance, 9500);
  assert.equal(c1.fluidsIn.find((f) => f.id === 'gtceu:hydrogen').amount, 1000);
  const c2 = rec('annihilation_power', 'burn_pellet');
  assert.deepEqual([c2.circuit, c2.eut, c2.duration, c2.generator], [2, 2 ** 30, 1200, true]);
  assert.deepEqual(plain(c2.itemsIn.map((x) => x.id)), ['grindless:acmf_pellet', 'grindless:antiproton_stack_opv']);
  assert.ok(out(c2, 'grindless:spent_acmf_hohlraum'), 'the spent hohlraum goes to the partitioning plant');
  const d = find('grindless:annihilation_power/burn_ice');
  assert.ok(d && JSON.stringify(d.j.tickInputs || d.j.tickOutputs || {}).includes('eu'));
  // one ice cell: its share of the foundry's three steps (four cells a run, 95% each)
  const f = (r) => r.eut * r.duration;
  const cost = (f(rec('antihydrogen_synthesis', 'trap_antihydrogen')) + f(rec('antihydrogen_synthesis', 'laser_cool')) + f(rec('antihydrogen_synthesis', 'freeze_ice'))) / (4 * 0.95 ** 3);
  const ratio = f(c1) / cost;
  assert.ok(ratio >= 1.3 && ratio <= 2.5, `engine c1 returns ${ratio.toFixed(2)}x of the foundry chain`);
});

test('the controllers: OpV hull, OpV components and circuits, superfluid He-3, three domain items, station research', () => {
  assert.deepEqual(plain(AM.controllerRecipes), MACHINES.map((m) => `grindless:assembly_line/${m}`));
  const want = {
    antihydrogen_foundry: ['grindless:octupole_trap_magnet', ['neg_xhv_casing', 'levitation_trap_cell', 'lyman_alpha_laser'], 4],
    annihilation_engine: ['grindless:gamma_absorber_tile', ['tpv_panel', 'li6_hydride_shield', 'octupole_trap_magnet'], 8]
  };
  for (const m of MACHINES) {
    const r = find(`grindless:assembly_line/${m}`);
    assert.ok(r && r.t === 'gtceu:assembly_line', m);
    const text = JSON.stringify(r.j);
    assert.ok(text.includes(`gtceu:${m}`), `${m} is its output`);
    for (const need of ['gtceu:opv_machine_hull', 'gtceu:circuits/opv', 'gtceu:opv_field_generator', 'grindless:superfluid_helium_3', want[m][0]]) assert.ok(text.includes(need), `${m} takes ${need}`);
    for (const d of want[m][1]) assert.ok(text.includes(d), `${m} takes ${d}`);
    assert.ok(!/(uxv|uiv|uev)_|circuits\/(uxv|uiv|uev|uhv)|gtceu:max_/.test(text), `${m} takes no component or circuit below OpV`);
    const ids = new Set((text.match(/"(?:id|tag|item)":"[^"]+"/g) || []));
    assert.ok(ids.size >= 8, `${m}: ${ids.size} distinct ingredients`);
  }
});

test('the annihilation shield casing: an assembler at OpV with two OpV circuits', () => {
  assert.equal(AM.casingRecipe, 'grindless:assembler/annihilation_shield_casing');
  const r = find(AM.casingRecipe);
  assert.ok(r && r.t === 'gtceu:assembler');
  const text = JSON.stringify(r.j);
  assert.ok(text.includes('gtceu:circuits/opv') && text.includes('grindless:annihilation_shield_casing'));
});

test('"only from": nothing else in the pack makes these ids', () => {
  const only = {
    'grindless:trapped_antihydrogen': 'antihydrogen_synthesis/trap_antihydrogen', 'grindless:cooled_antihydrogen': 'antihydrogen_synthesis/laser_cool',
    'grindless:antihydrogen_ice_cell': 'antihydrogen_synthesis/freeze_ice', 'gtceu:antihydrogen_foundry': 'assembly_line/antihydrogen_foundry',
    'gtceu:annihilation_engine': 'assembly_line/annihilation_engine', 'grindless:annihilation_shield_casing': 'assembler/annihilation_shield_casing'
  };
  for (const [id, tail] of Object.entries(only)) {
    const ps = recipes.filter((r) => JSON.stringify(r.j.outputs || {}).includes(`"${id}"`)).map((r) => r.i);
    assert.ok(ps.length >= 1, `${id} has a producer`);
    assert.deepEqual(ps.filter((i) => !i.endsWith(tail)), [], `${id} only from ${tail}`);
  }
});

test('structures: not boring, at least two functional kinds, controller in the front slice', () => {
  for (const m of MACHINES) {
    const s = run.global.grindless.structures[`gtceu:${m}`];
    assert.ok(s, `${m} has a description`);
    const mm = measure(s);
    assert.deepEqual(violations(mm), [], `${m}: ${JSON.stringify(mm)}`);
    assert.ok(mm.dominantShare <= 0.62, `${m}: dominant share ${mm.dominantShare}`);
    assert.ok(mm.functional.length >= 3, `${m}: ${mm.functional}`);
    assert.ok(s.slices[s.slices.length - 1].some((row) => row.includes('S')), `${m}: the controller is in the front slice`);
    const xs = s.slices.reduce((n, sl) => n + sl.join('').split('X').length - 1, 0);
    assert.ok(xs >= 4, `${m}: ${xs} hatch cells for at least four parts`);
  }
});

test('lang parity: every key of both languages, names, tooltips, EMI pages, recipe lines and the items', () => {
  const keys = ['gtceu.antihydrogen_synthesis', 'gtceu.annihilation_power'];
  for (const m of MACHINES) keys.push(`block.gtceu.${m}`, `grindless.machine.${m}.tooltip.0`, `grindless.machine.${m}.tooltip.1`, `emi.grindless.info.${m}.0`, `emi.grindless.info.${m}.1`);
  keys.push('grindless.machine.annihilation_engine.tooltip.2');
  for (const i of Object.keys(AM.items)) keys.push(`item.grindless.${i}`, `tooltip.grindless.${i}.0`, `tooltip.grindless.${i}.1`);
  for (const r of AM.recipes) keys.push(`gtceu.recipe.${r.dataKey}.${r.name}`);
  for (const k of keys) for (const lang of ['en_us', 'es_es']) assert.ok(run.lang[lang][k], `${lang} has ${k}`);
  const re = /antihydrogen|annihilation|absorber_tile|hohlraum/;
  assert.deepEqual(Object.keys(run.lang.en_us).filter((k) => re.test(k)).sort(), Object.keys(run.lang.es_es).filter((k) => re.test(k)).sort());
  assert.match(run.lang.en_us['grindless.machine.annihilation_engine.tooltip.2'], /neutrino/);
  assert.match(run.lang.en_us['grindless.machine.antihydrogen_foundry.tooltip.1'], /5%/);
});
