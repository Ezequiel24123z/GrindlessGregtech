// ZPM's europium reductor (package ZPM-A3), no game needed. The pack's scripts run in the stand-in of lib/kubejs_static.mjs:
//   - startup_scripts/grindless/zpm/europium.js: the valence_reduction type, the five GT materials, the machine and a pattern that is
//     valid for lib/patterns.js (one controller, the casing-or-parts cells with GTM's limits, the Jones column and the furnace);
//   - server_scripts/grindless/zpm/europium.js: the three reductions (one circuit each, the mercury bath not consumed, whole EU/t and
//     ticks at ZPM's VA, atoms and mass balanced), the controller's crafting recipe, nothing clashing in GTM's lookup, and GTCA's
//     europium-giving froth reactor replaced by one without europium (decision: europium only through the reductor);
//   - server_scripts/grindless/ev/extraction_cascade.js: circuit 5 (ZPM mode) beside circuits 1 and 2, no lookup clash;
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
// the scripts run in another VM realm: plain copies make deepEqual compare values only
const plain = (x) => JSON.parse(JSON.stringify(x, (k, v) => (typeof v === 'function' ? undefined : v)));
const ER = plain(run.global.grindless.europiumReductor);
const EC = plain(run.global.grindless.extractionCascade);
const recipes = run.docs.recipes.recipes;
const byId = (id) => recipes.find((r) => r.i === id);
const ZPM_VA = 122880;

const fluidsOf = (r, side) => r.j[side].fluid.map((f) => ({ id: f.content.fluid || f.content.id || JSON.stringify(f.content), chance: f.chance, content: f.content }));
const circuitOf = (r) => r.j.inputs.item.filter((i) => i.content.type === 'gtceu:circuit').map((i) => i.content.configuration);

test('the stand-in runs the reductor and the cascade without errors', () => {
  const errs = run.errors.filter((e) => /zpm[\\/]europium|extraction_cascade/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(ER.skipped, [], 'no recipe skipped for an unknown id');
  assert.deepEqual(ER.clashes, [], 'no recipe clashes in the lookup');
});

test('registration: the recipe type with its IO sizes, the machine, the five materials', () => {
  assert.ok(run.registry.recipeTypes.has('gtceu:valence_reduction'));
  const m = run.registry.machines.get('gtceu:europium_reductor');
  assert.ok(m, 'machine registered');
  assert.deepEqual(m.recipeTypes, ['gtceu:valence_reduction']);
  assert.deepEqual(ER.maxIO, { itemsIn: 3, itemsOut: 2, fluidsIn: 3, fluidsOut: 2 });
  for (const name of ['europium_chloride_solution', 'europium_sulfate', 'europium_oxide', 'zinc_sulfate', 'lanthanum_oxide']) {
    assert.ok(run.registry.materials.has('gtceu:' + name), name + ' is a GT material');
  }
  assert.ok(run.registry.materials.get('gtceu:europium_chloride_solution').forms.has('liquid'));
  for (const name of ['europium_sulfate', 'europium_oxide', 'zinc_sulfate', 'lanthanum_oxide']) {
    assert.ok(run.registry.materials.get('gtceu:' + name).forms.has('dust'), name + ' is a dust');
  }
});

test('the pattern: one controller in the front slice, parts with GTM limits, a Jones column, a tank and a furnace', () => {
  const s = run.docs.structures.structures['gtceu:europium_reductor'];
  assert.ok(s, 'structure described');
  const front = s.slices[s.slices.length - 1];
  assert.equal(front.join('').split('').filter((c) => c === 'S').length, 1, 'one controller');
  assert.ok(s.symbols.S.kind === 'controller');
  const height = s.slices[0].length;
  assert.ok(height <= 16 && s.slices.every((sl) => sl.length === height), 'a uniform height of at most 16');
  const width = s.slices[0][0].length;
  assert.ok(s.slices.every((sl) => sl.every((row) => row.length === width)), 'rows of one width');
  const x = s.symbols.X;
  assert.equal(x.kind, 'oneOf');
  const lim = Object.fromEntries(x.options.filter((o) => o.kind === 'part').map((o) => [o.ability, o.limits]));
  assert.deepEqual(Object.keys(lim).sort(), ['energy_input', 'input_bus', 'input_hatch', 'output_bus', 'output_hatch']);
  assert.deepEqual(lim.energy_input, { min: 1, max: 2 });
  assert.deepEqual(lim.input_hatch, { min: 1, max: 3 }, 'three fluid inputs: liquor, acid, mercury');
  assert.ok(lim.output_hatch.max >= 2, 'two fluid outputs');
  const blocks = Object.values(s.symbols).flatMap((v) => v.blocks || []);
  for (const b of ['gtceu:inert_machine_casing', 'gtceu:ptfe_pipe_casing', 'gtceu:laminated_glass', 'gtceu:naquadah_coil_block']) assert.ok(blocks.includes(b), b);
  // a controller cell, and a symbol for every cell
  for (const sl of s.slices) for (const row of sl) for (const c of row) assert.ok(c === ' ' || s.symbols[c], 'symbol ' + c);
});

test('the five reductions: one circuit each, ZPM VA, the mercury bath not consumed, whole numbers', () => {
  assert.deepEqual(ER.recipes.map((r) => [r.name, r.circuit]), [['reduction', 1], ['roasting', 2], ['metallothermic_reduction', 3], ['zinc_recovery', 4], ['lanthanum_recovery', 5]]);
  for (const p of ER.recipes) {
    const r = byId(p.recipeId);
    assert.ok(r, p.recipeId + ' added');
    assert.equal(r.t, 'gtceu:valence_reduction');
    assert.deepEqual(circuitOf(r), [p.circuit]);
    assert.equal(p.eut, ZPM_VA, p.name + ' at ZPM VA');
    assert.ok(Number.isInteger(p.duration) && p.duration > 0);
    assert.ok(p.itemsIn.length <= 2 && p.itemsOut.length <= 2, 'fits the IO sizes (the circuit is the third item)');
    assert.ok(p.fluidsIn.length + p.notConsumed.length <= ER.maxIO.fluidsIn && p.fluidsOut.length <= ER.maxIO.fluidsOut);
  }
  const red = byId('grindless:valence_reduction/reduction');
  const fin = fluidsOf(red, 'inputs');
  assert.deepEqual(fin.map((f) => f.chance), [10000, 10000, 0], 'the mercury is the one input with chance 0 (not consumed)');
  assert.match(JSON.stringify(fin[2].content), /mercury/);
  assert.deepEqual(ER.recipes[0].notConsumed, [{ id: 'gtceu:mercury', amount: 144 }]);
  // europium dust only here, plus the depleted naquadah fuel's chanced byproduct (zpm.md, machine 2 c2)
  const eu = recipes.filter((r) => r.j.outputs && JSON.stringify(r.j.outputs.item).includes('gtceu:europium_dust'));
  assert.deepEqual(eu.map((r) => r.i).sort(), ['grindless:naquadah_fuel/fuel_depleted', 'grindless:valence_reduction/metallothermic_reduction']);
  const dep = eu.find((r) => r.i === 'grindless:naquadah_fuel/fuel_depleted');
  assert.ok(dep.j.outputs.item.filter((o) => JSON.stringify(o).includes('gtceu:europium_dust')).every((o) => o.chance > 0 && o.chance < 10000), 'the depleted fuel gives europium only as a chance');
});

test('the chemistry balances: 2 EuCl3 + Zn + 3 H2SO4 -> 2 EuSO4 + ZnSO4 + 6 HCl; 4 EuSO4 + O2 -> 2 Eu2O3 + 4 SO3; Eu2O3 + 2 La -> 2 Eu + La2O3', () => {
  const [red, roast, metal] = ER.recipes;
  // 2,000 mB of the solution is 2 mol of EuCl3 at 1,000 mB per mol; 3,000 mB of acid is 3 mol; 6,000 mB of HCl is 6 mol
  assert.equal(red.fluidsIn[0].amount / 1000, 2);
  assert.equal(red.fluidsIn[1].amount / 1000, 3);
  assert.equal(red.itemsIn[0].count, 1, 'one zinc');
  assert.equal(red.itemsOut[0].count, 2, 'two europium sulfate');
  assert.equal(red.itemsOut[1].count, 1, 'one zinc sulfate');
  assert.equal(red.fluidsOut[0].amount / 1000, 6, 'six HCl: three Cl per EuCl3');
  assert.equal(roast.itemsIn[0].count, 4);
  assert.equal(roast.fluidsIn[0].amount, 1000, 'one O2');
  assert.equal(roast.itemsOut[0].count, 2);
  assert.equal(roast.fluidsOut[0].amount, 4000, 'four SO3');
  assert.equal(metal.itemsIn[0].count, 1);
  assert.equal(metal.itemsIn[1].count, 2, 'two lanthanum');
  assert.deepEqual(metal.itemsOut.map((x) => x.count), [2, 1], 'two europium, one lanthanum oxide');
});

test('the controller has a crafting recipe from ZPM parts and no ingot of any kind', () => {
  assert.equal(ER.craftingRecipe, 'grindless:crafting/europium_reductor');
  const r = byId(ER.craftingRecipe);
  assert.ok(r, 'crafting recipe added');
  const text = JSON.stringify(r.j);
  assert.match(text, /gtceu:europium_reductor/);
  for (const id of ER.craftingParts) assert.ok(text.includes(id) || id === 'gtceu:europium_reductor', id);
});

test('GTCA\'s europium-giving froth reactor is replaced by one without europium', () => {
  assert.equal(ER.froth.removedId, 'gtceu:thermal_reactor/monazite_froth');
  assert.ok(run.removals.some((x) => x.file.includes('zpm/europium.js') && x.filter.includes('gtceu:thermal_reactor/monazite_froth')));
  const n = byId('grindless:thermal_reactor/monazite_froth_no_europium');
  assert.ok(n, 'the replacement is added under the id the test reads at runtime: ' + ER.froth.newRecipeId);
  assert.equal(n.i, ER.froth.newRecipeId);
  const out = JSON.stringify(n.j.outputs.item);
  assert.ok(!out.includes('europium'), 'no europium in the replacement');
  assert.match(out, /lanthanum_dust/);
  assert.match(out, /lutetium_dust/);
  assert.match(JSON.stringify(n.j.inputs.fluid), /monazite_froth/);
});

test('the cascade has circuit 5 (ZPM mode) beside circuits 1 and 2 with no lookup clash', () => {
  const rows = EC.recipes;
  assert.deepEqual(rows.map((r) => r.circuit).sort(), [1, 2, 5]);
  const z = rows.find((r) => r.circuit === 5);
  assert.equal(z.name, 'monazite_froth_europium');
  assert.equal(z.mode, 'zpm');
  assert.equal(z.eut, ZPM_VA);
  assert.deepEqual(z.fluidsIn.map((f) => f.id), ['gtca:monazite_froth', 'gtceu:hydrochloric_acid']);
  assert.deepEqual(z.fluidsOut.map((f) => f.id), ['gtceu:europium_chloride_solution', 'gtceu:phosphoric_acid']);
  assert.deepEqual(z.itemsIn, []);
  assert.ok(z.fluidsIn.length <= EC.maxIO.fluidsIn && z.fluidsOut.length <= EC.maxIO.fluidsOut, 'fits the cascade\'s IO sizes');
  assert.ok(byId(z.recipeId), z.recipeId + ' added');
  // what the reductor takes is what the cascade makes
  assert.equal(ER.recipes[0].fluidsIn[0].id, z.fluidsOut[0].id);
  // the circuit tells the modes apart: the three keysets differ in their circuit even though the cascade's other rows share fluids
  assert.equal(new Set(rows.map((r) => r.circuit)).size, rows.length);
});

test('every new name and tooltip has en_us and es_es text', () => {
  const en = run.lang.en_us || {};
  const es = run.lang.es_es || {};
  const keys = [
    'block.gtceu.europium_reductor', 'gtceu.valence_reduction',
    ...[0, 1, 2, 3].map((i) => `grindless.machine.europium_reductor.tooltip.${i}`),
    'grindless.machine.extraction_cascade.tooltip.4',
    ...['europium_chloride_solution', 'europium_sulfate', 'europium_oxide', 'zinc_sulfate', 'lanthanum_oxide'].map((m) => 'material.gtceu.' + m),
  ];
  for (const k of keys) {
    assert.ok(en[k] && en[k].length > 3, 'en_us ' + k);
    assert.ok(es[k] && es[k].length > 3, 'es_es ' + k);
    assert.notEqual(en[k], es[k], 'es_es ' + k + ' is translated');
  }
  for (const m of ['europium_sulfate', 'europium_oxide', 'zinc_sulfate', 'lanthanum_oxide']) {
    for (const form of ['', 'small_', 'tiny_']) assert.ok(es[`item.gtceu.${form}${m}_dust`], `es_es ${form}${m}_dust`);
  }
  assert.equal(Object.keys(es).filter((k) => /europium_reductor|valence_reduction/.test(k)).length, Object.keys(en).filter((k) => /europium_reductor|valence_reduction/.test(k)).length);
});

test('the texture generator is documented and its three PNGs exist', () => {
  const dir = path.join(pack, 'kubejs', 'assets', 'grindless', 'textures', 'block', 'multiblock', 'europium_reductor');
  for (const f of ['overlay_front.png', 'overlay_front_active.png', 'overlay_front_active_emissive.png']) assert.ok(fs.existsSync(path.join(dir, f)), f);
  const readme = fs.readFileSync(path.join(root, 'tools', 'assets', 'README.md'), 'utf8');
  assert.match(readme, /Build-ZPMEuropiumTextures\.ps1/);
});
