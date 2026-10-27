// UV's Starshot (package UV-A12), no game needed. The pack's scripts run in the stand-in of lib/kubejs_static.mjs:
//   - startup_scripts/grindless/uv/starshot.js: three recipe types, three machines (7 x 7 x 7 light sail fab, 5 x 5 x 5 starchip fab,
//     15 x 15 x 3 laser sail launcher), three carriers and three gases; F1's ids reused;
//   - server_scripts/grindless/uv/starshot.js: the sail's three steps in Earth orbit, the starchip and sail-chip, the launch on the Moon,
//     the GTM rows that feed the line, the crafting;
//   - en_us and es_es text for everything new.
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
const S = plain(run.global.grindless.starshot);
const ORBIT = run.global.grindless.orbits.earth;
const recipes = run.docs.recipes.recipes;
const row = (name) => S.recipes.find((r) => r.name === name);
const recOf = (r) => recipes.find((x) => x.i === r.recipeId);
const circuitOf = (r) => r.j.inputs.item.filter((i) => i.content.type === 'gtceu:circuit').map((i) => i.content.configuration);
const dimsOf = (r) => (r.j.recipeConditions || []).filter((c) => c.type === 'dimension').map((c) => c.dimension);
const read = (rel) => fs.readFileSync(path.join(pack, 'kubejs', rel), 'utf8');
const outputsOf = (r) => JSON.stringify(r.j.outputs || r.j.result || {});
const inputsOf = (r) => JSON.stringify(r.j.inputs || r.j.ingredients || r.j.key || {});
const makersOf = (id) => recipes.filter((r) => outputsOf(r).includes(`"${id}"`)).map((r) => r.i);
const VA_UV = 491520;
const MACHINES = { 'gtceu:light_sail_fab': 'light_sail', 'gtceu:starchip_fab': 'starchip', 'gtceu:laser_sail_launcher': 'laser_sail_launch' };

test('the stand-in runs the starshot scripts without errors, nothing clashing or skipped', () => {
  const errs = run.errors.filter((e) => /starshot/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(S.clashes, []);
  assert.deepEqual(S.skipped, []);
});

test('registration: three recipe types, three machines, three carriers, three gases; F1 ids are reused, not registered again', () => {
  for (const [m, t] of Object.entries(MACHINES)) {
    assert.deepEqual(run.registry.machines.get(m).recipeTypes, ['gtceu:' + t], m);
    assert.ok(run.registry.recipeTypes.has('gtceu:' + t), t);
  }
  for (const id of ['epitaxial_silicon_wafer', 'nitride_coated_carrier', 'patterned_sail_carrier']) assert.ok(run.registry.items.has('grindless:' + id), id);
  for (const id of ['silane', 'xenon_difluoride', 'silicon_tetrafluoride']) assert.ok(run.registry.fluids.has('gtceu:' + id), id);
  const src = read('startup_scripts/grindless/uv/starshot.js');
  for (const f1 of ['light_sail', 'starchip', 'sailcraft', 'starshot_probe', 'heliopause_data', 'hbn_dust', 'fibre_laser_module', 'laser_module_block']) {
    assert.ok(run.registry.items.has('grindless:' + f1), f1 + ' (F1)');
    assert.doesNotMatch(src, new RegExp(`create\\('grindless:${f1}'`), f1 + ' not registered here');
  }
});

test('patterns: sail fab 7 x 7 x 7, starchip fab 5 x 5 x 5, launcher 15 x 15 x 3 with 64 laser module blocks', () => {
  const dims = { 'gtceu:light_sail_fab': [7, 7, 7], 'gtceu:starchip_fab': [5, 5, 5], 'gtceu:laser_sail_launcher': [15, 3, 15] };
  const count = (s, block) => {
    const syms = Object.entries(s.symbols).filter(([, v]) => v.kind === 'blocks' && v.blocks.length === 1 && v.blocks[0] === block).map(([k]) => k);
    return s.slices.flat().join('').split('').filter((c) => syms.includes(c)).length;
  };
  for (const [id, [width, height, depth]] of Object.entries(dims)) {
    const s = run.docs.structures.structures[id];
    assert.ok(s, id + ' described');
    assert.equal(s.slices.length, depth, id);
    assert.ok(s.slices.every((sl) => sl.length === height && sl.every((r) => r.length === width)), id + ' uniform slices');
    assert.equal(s.slices.flat().join('').split('').filter((c) => c === 'S').length, 1, id + ' one controller');
    for (const sl of s.slices) for (const r of sl) for (const c of r) assert.ok(c === ' ' || s.symbols[c], `${id} symbol ${c}`);
    const lim = Object.fromEntries(s.symbols.X.options.filter((o) => o.kind === 'part').map((o) => [o.ability, o.limits]));
    for (const a of ['energy_input', 'input_bus', 'output_bus']) assert.ok(lim[a] && lim[a].min === 1, `${id} ${a}`);
    assert.equal(lim.energy_input.max, 2, id + ' energy');
  }
  const fab = run.docs.structures.structures['gtceu:light_sail_fab'];
  assert.equal(count(fab, 'gtceu:tungsten_block'), 9, '3 x 3 heater');
  assert.ok(count(fab, 'grindless:whipple_shield_casing') > 0, 'wake shield wall');
  const chip = run.docs.structures.structures['gtceu:starchip_fab'];
  assert.equal(count(chip, 'gtceu:filter_casing'), 9, 'filter ceiling');
  assert.equal(count(chip, 'gtceu:stainless_steel_gearbox'), 1, 'the bonder');
  const launcher = run.docs.structures.structures['gtceu:laser_sail_launcher'];
  assert.equal(count(launcher, 'grindless:laser_module_block'), 64, '64 laser module blocks');
  assert.equal(count(launcher, 'gtceu:computer_casing'), 1, 'the beam director');
});

test('each machine: unique circuits, whole numbers, UV VA at most, every row in the dump with its circuit', () => {
  for (const type of Object.values(MACHINES)) {
    const rows = S.recipes.filter((r) => r.type === type);
    assert.ok(rows.length > 0, type);
    const circuits = rows.map((r) => r.circuit);
    assert.equal(new Set(circuits).size, circuits.length, type);
    for (const r of rows) {
      assert.ok(Number.isInteger(r.duration) && r.duration > 0 && Number.isInteger(r.eut) && r.eut > 0 && r.eut <= VA_UV, r.name);
      const rec = recOf(r);
      assert.ok(rec, r.recipeId);
      assert.equal(rec.t, 'gtceu:' + type);
      assert.deepEqual(circuitOf(rec), [r.circuit], r.name);
    }
  }
  assert.deepEqual(S.recipes.filter((r) => r.type === 'light_sail').map((r) => [r.name, r.circuit]),
    [['nitride_film', 1], ['metasurface', 2], ['sail_release', 3]]);
  assert.deepEqual(S.recipes.filter((r) => r.type === 'starchip').map((r) => [r.name, r.circuit]), [['starchip', 1], ['sailcraft', 2]]);
  for (const id of [S.crafting.sailFab, S.crafting.chipFab, S.crafting.launcher]) assert.ok(recipes.find((x) => x.i === id), id);
});

test('the light sail is made only in Earth orbit; the wafer comes from the wake shield (circuit 4, any orbit, cleanroom)', () => {
  for (const r of S.recipes.filter((x) => x.type === 'light_sail')) assert.deepEqual(dimsOf(recOf(r)), [ORBIT], r.name);
  for (const r of S.recipes.filter((x) => x.type === 'starchip')) assert.deepEqual(dimsOf(recOf(r)), [], r.name);
  assert.deepEqual(makersOf('grindless:light_sail'), [row('sail_release').recipeId]);
  assert.deepEqual(makersOf('grindless:epitaxial_silicon_wafer'), [row('epitaxial_silicon_wafer').recipeId]);
  const epi = recOf(row('epitaxial_silicon_wafer'));
  assert.equal(epi.t, 'gtceu:wake_epitaxy');
  assert.deepEqual(circuitOf(epi), [4]);
  const wake = recipes.filter((x) => x.t === 'gtceu:wake_epitaxy').flatMap(circuitOf);
  assert.equal(new Set(wake).size, wake.length, 'wake epitaxy circuits unique');
  assert.equal(row('metasurface').kept, 'grindless:x_ray_mask');
  assert.ok(inputsOf(recOf(row('metasurface'))).includes('grindless:hbn_dust'), 'hBN backing');
});

test('the launcher runs only on the Moon: one sail-chip and the heliopause data (kept) give exactly one probe in flight', () => {
  const r = row('starshot_probe');
  assert.equal(r.type, 'laser_sail_launch');
  const rec = recOf(r);
  assert.deepEqual(dimsOf(rec), ['gcyr:luna']);
  assert.deepEqual(r.itemsIn, [{ id: 'grindless:sailcraft', count: 1 }]);
  assert.deepEqual(r.itemsOut, [{ id: 'grindless:starshot_probe', count: 1 }]);
  assert.equal(r.kept, 'grindless:heliopause_data');
  const probe = rec.j.outputs.item.filter((o) => JSON.stringify(o).includes('grindless:starshot_probe'));
  assert.equal(probe.length, 1);
  assert.equal(probe[0].chance, 10000);
  assert.equal(probe[0].content.count, 1);
  const kept = rec.j.inputs.item.filter((i) => JSON.stringify(i).includes('grindless:heliopause_data'));
  assert.equal(kept.length, 1);
  assert.equal(kept[0].chance, 0, 'the heliopause data is not consumed');
  assert.deepEqual(r.chancedIn, [{ id: 'grindless:fibre_laser_module', count: 1, chance: 6400 }]);
  assert.deepEqual(r.chancedOut, [{ id: 'grindless:spent_laser_module', count: 1, chance: 6400 }]);
  assert.equal(r.eut, VA_UV);
  assert.equal(r.amps, 16);
  assert.deepEqual(makersOf('grindless:starshot_probe'), [r.recipeId], 'the launcher is the probe\'s only maker');
  assert.ok(recipes.some((x) => x.t === 'gtceu:optical_downlink' && inputsOf(x).includes('grindless:starshot_probe')), 'A7 reads the probe');
});

test('gases: silane, xenon difluoride and silicon tetrafluoride each have one maker and a destination', () => {
  assert.deepEqual(makersOf('gtceu:silane'), [row('silane').recipeId]);
  assert.deepEqual(makersOf('gtceu:xenon_difluoride'), [row('xenon_difluoride').recipeId]);
  assert.deepEqual(makersOf('gtceu:silicon_tetrafluoride'), [row('sail_release').recipeId]);
  assert.ok(recipes.some((x) => inputsOf(x).includes('gtceu:silicon_tetrafluoride')), 'SiF4 is consumed');
  assert.deepEqual(row('silane').fluidsOut, [{ id: 'gtceu:silane', amount: 1000 }]);
  assert.deepEqual(row('silicon_tetrafluoride_hydrolysis').fluidsOut, [{ id: 'gtceu:hydrofluoric_acid', amount: 4000 }]);
  const release = row('sail_release');
  const xe = (list) => list.find((f) => f.id === 'gtceu:xenon').amount;
  assert.equal(xe(release.fluidsOut), release.fluidsIn[0].amount, 'the xenon comes back');
  const src = read('server_scripts/grindless/uv/starshot.js');
  for (const word of ['hydrogen', 'xenon', 'silicon tetrafluoride', 'magnesium chloride dust', 'silicon dust', 'spent laser module']) {
    assert.match(src, new RegExp(`${word} .*->`, 'i'), word);
  }
});

test('names: en_us and es_es for every new machine, type, item and material', () => {
  const lang = read('client_scripts/grindless/uv_starshot_lang.js');
  const keys = [];
  for (const [m, t] of Object.entries(MACHINES)) {
    const n = m.split(':')[1];
    keys.push('block.gtceu.' + n, 'gtceu.' + t);
    for (let i = 0; i < 4; i++) keys.push(`grindless.machine.${n}.tooltip.${i}`);
  }
  for (const id of ['epitaxial_silicon_wafer', 'nitride_coated_carrier', 'patterned_sail_carrier']) {
    keys.push('item.grindless.' + id, `tooltip.grindless.${id}.0`, `tooltip.grindless.${id}.1`);
  }
  for (const id of ['silane', 'xenon_difluoride', 'silicon_tetrafluoride']) keys.push('material.gtceu.' + id);
  for (const k of keys) assert.equal(lang.split(`['${k}',`).length, 2, k);
  assert.equal((lang.match(/^\s+\['/gm) || []).length, keys.length, 'one entry per key');
  assert.match(lang, /\['en_us', 'es_es'\]/);
});
