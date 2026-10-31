// ZPM-A8 (methane pyrolyser, vent bioreactor, aerogel works), no game needed: startup_scripts/grindless/zpm/outer_chemistry.js and
// server_scripts/grindless/zpm/outer_chemistry.js (five recipes, three crafting recipes) and the en_us / es_es text.
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
const OC = plain(run.global.grindless.outerChemistry);
const recipes = run.docs.recipes.recipes;
const byId = (id) => recipes.find((r) => r.i === id);
const MACHINES = ['methane_pyrolyser', 'vent_bioreactor', 'aerogel_works'];
const TYPES = ['methane_pyrolysis', 'chemosynthesis', 'supercritical_drying'];
const DIMS = [[3, 12, 3], [5, 7, 5], [5, 5, 5]];

test('the scripts run without errors and nothing is skipped or clashing', () => {
  const errs = run.errors.filter((e) => /zpm[\\/]outer_chemistry/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(OC.clashes, []);
  assert.deepEqual(OC.skipped.filter((s) => !/unknown id/.test(s.reason)), []);
});

test('registration: three recipe types and machines, one controller each', () => {
  TYPES.forEach((t) => assert.ok(run.registry.recipeTypes.has('gtceu:' + t), t));
  MACHINES.forEach((m, i) => {
    const reg = run.registry.machines.get('gtceu:' + m);
    assert.ok(reg, m);
    assert.deepEqual(reg.recipeTypes, ['gtceu:' + TYPES[i]]);
    const s = run.docs.structures.structures['gtceu:' + m];
    assert.ok(s, m + ' structure');
    const cells = s.slices.flatMap((sl) => sl.join('').split(''));
    assert.equal(cells.filter((c) => c === 'S').length, 1, m + ' one controller');
    for (const sl of s.slices) for (const row of sl) for (const c of row) assert.ok(c === ' ' || s.symbols[c], m + ' symbol ' + c);
    assert.deepEqual([s.slices[0][0].length, s.slices[0].length, s.slices.length], DIMS[i]);
  });
});

test('the six recipes exist with their circuits; the aerogel run has none', () => {
  // cnt_sock: UEV-A8's floating-catalyst CNT row (docs/eras/uev.md, A8); pyrolytic_graphite: UIV-A2's pulser feed (docs/eras/uiv.md, line 3)
  // ps_converter_aerogel: UIV-B3's Ps-converter aerogel (docs/eras/uiv.md, line 34)
  // MAX-B4: recipient_mycoplasma_culture (c3), encapsulated_genome_library (c5) and vitrified_cell_capsule (c6)
  const want = { graphene: 1, nanotube_yarn: 2, cnt_sock: 3, archaeal_culture: 1, growth_medium_broth: 2, silica_aerogel: 0, pyrolytic_graphite: 4,   ps_converter_aerogel: 0, hopg_blank: 5, hopg_reanneal: 0, spent_anode_graphene: 6, aerogel_superleak_plug: 0,
    recipient_mycoplasma_culture: 3, encapsulated_genome_library: 5, vitrified_cell_capsule: 6 };
    assert.equal(OC.recipes.length, 15); // OpV-B3a appended hopg_blank (c5) and hopg_reanneal (keyed by the offcut); MAX-B4 three more
  for (const p of OC.recipes) {
    const r = byId(p.recipeId);
    assert.ok(r, p.recipeId + ' added');
    assert.equal(p.circuit, want[p.name], p.name);
    const circuits = (r.j.inputs.item || []).filter((i) => i.content.type === 'gtceu:circuit').map((i) => i.content.configuration);
    assert.deepEqual(circuits, p.circuit > 0 ? [p.circuit] : []);
  }
});

test('MAX-A2 aerogel_superleak_plug is keyed by silylated_alcogel alone: no other drying row takes it', () => {
  const dry = OC.recipes.filter((r) => r.type === 'supercritical_drying');
  const keyOf = (r) => r.itemsIn.map((i) => i.id).sort().join('|');
  assert.deepEqual(dry.map((r) => r.name), ['silica_aerogel', 'ps_converter_aerogel', 'aerogel_superleak_plug', 'encapsulated_genome_library', 'vitrified_cell_capsule']);
  assert.equal(new Set(dry.map(keyOf)).size, dry.length, 'item-key sets are distinct');
  assert.deepEqual(dry.filter((r) => keyOf(r) === 'grindless:silylated_alcogel').map((r) => r.name), ['aerogel_superleak_plug']);
  // MAX-B4 (decision 81): the two genome rows take a circuit, so no circuit-less row can shadow them and the plug stays unique
  assert.ok(dry.filter((r) => r.circuit === 0).length === 3 && dry.filter((r) => r.circuit > 0).map((r) => r.circuit).join() === '5,6');
  assert.ok(dry.every((r) => r.itemsIn.length + (r.circuit > 0 ? 1 : 0) <= 3), 'at most 3 item slots (aerogel maxIO.itemsIn)');
  const startup = fs.readFileSync(path.join(root, 'pack/kubejs/startup_scripts/grindless/zpm/outer_chemistry.js'), 'utf8');
  assert.match(startup, /maxIO: \{ itemsIn: 3, itemsOut: 1, fluidsIn: 2, fluidsOut: 1 \}/);
});

test('bacteria are consumed once, the bath and the culture are not consumed, GTM mixer recipe stays', () => {
  const cult = OC.recipes.find((r) => r.name === 'archaeal_culture');
  assert.ok(cult.fluidsIn.some((f) => f.id === 'gtceu:bacteria'));
  assert.equal(OC.recipes.filter((r) => r.fluidsIn.concat(r.notConsumedFluids).some((f) => f.id === 'gtceu:bacteria')).length, 2); // + MAX-B4's recipient_mycoplasma_culture
  assert.ok(OC.recipes.find((r) => r.name === 'graphene').notConsumedFluids.length >= 2, 'bath not consumed');
  assert.ok(JSON.stringify(OC.recipes.find((r) => r.name === 'growth_medium_broth').notConsumedItems) .includes('archaeal_culture'), 'culture not consumed');
  assert.ok(!JSON.stringify(run.removals).includes('raw_growth_medium'));
});

test('en_us and es_es names exist and differ', () => {
  for (const m of MACHINES) {
    const k = 'block.gtceu.' + m;
    assert.ok(run.lang.en_us[k] && run.lang.es_es[k], k);
    assert.notEqual(run.lang.en_us[k], run.lang.es_es[k]);
  }
  TYPES.forEach((t) => assert.ok(run.lang.en_us['gtceu.' + t] && run.lang.es_es['gtceu.' + t], t));
});

test('textures exist and the generator is documented', () => {
  for (const m of MACHINES) for (const f of ['overlay_front', 'overlay_front_active', 'overlay_front_active_emissive']) {
    assert.ok(fs.existsSync(path.join(pack, 'kubejs/assets/grindless/textures/block/multiblock', m, f + '.png')), m + ' ' + f);
  }
  assert.ok(fs.readFileSync(path.join(root, 'tools/assets/README.md'), 'utf8').includes('Build-ZPMOuterChemistryTextures.ps1'));
});
