// LuV A2, spike S0-11 (docs/eras/luv.md, "Naquadah plant, mode 2: the exact balance"): the naquadah plant's modes composed by the pack's
// own scripts (server_scripts/grindless/lib/compose.js + iv/naquadah_plant.js, its startup script for the published sizes) on GT--'s
// pinned recipes (tools/analysis/fixtures/gtnn-1.3.10-naquadah-line.json, read from a native dump), in a stand-in for ServerEvents.recipes.
// It prints mode 2's balance and fails when the GT-- pin, a pinned id or the balance changes.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runServerScripts } from '../lib/kubejs_recipes_sandbox.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const PACK = path.join(ROOT, 'pack');
const FIXTURE = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/analysis/fixtures/gtnn-1.3.10-naquadah-line.json'), 'utf8'));
const TABLE = JSON.parse(fs.readFileSync(path.join(PACK, 'kubejs/data/grindless/tables/naquadah_plant.json'), 'utf8'));
const SCRIPTS = ['kubejs/server_scripts/grindless/lib/compose.js', 'kubejs/server_scripts/grindless/iv/naquadah_plant.js'];
const STARTUP = ['kubejs/startup_scripts/grindless/iv/naquadah_plant.js'];

function run(recipes = FIXTURE.recipes, opts = {}) {
  return runServerScripts({ packRoot: PACK, scripts: SCRIPTS, startup: STARTUP, recipes, ...opts });
}

const byName = (G, name) => (G.naquadahPlant.recipes || []).find((r) => r.name === name);
const amounts = (list, key = 'amount') => Object.fromEntries(list.map((x) => [x.id, x[key]]));
const errors = (logs) => logs.filter(([level]) => level === 'error').map(([, m]) => m);

function printBalance(r) {
  const lines = [`S0-11 ${r.recipeId} (circuit ${r.circuit}, ${r.batches} batches, activator x${r.activatorRuns}):`];
  for (const x of r.itemsIn) lines.push(`  in   ${x.count} ${x.id}${x.chance < 10000 ? ` @ ${x.chance}/10000` : ''}`);
  for (const x of r.fluidsIn) lines.push(`  in   ${x.amount} mB ${x.id}`);
  for (const c of r.charges) lines.push(`  held ${c.item ? `${c.count} ${c.item}` : `${c.amount} mB ${c.fluid}`}${c.chance > 0 ? ` (wear ${c.chance}/10000)` : ''}`);
  for (const x of r.itemsOut) lines.push(`  out  ${x.whole} ${x.id}${x.chance > 0 ? ` + 1 @ ${x.chance}/10000` : ''}`);
  for (const x of r.fluidsOut) lines.push(`  out  ${x.amount} mB ${x.id}`);
  for (const [k, v] of Object.entries(r.recovered)) lines.push(`  kept ${k}: GT-- would ${v < 0 ? 'lose' : 'give'} ${Math.abs(Math.round(v * 1e6) / 1e6)}`);
  lines.push(`  EU   ${r.eut} EU/t x ${r.duration} t = ${r.energy} (stages ${r.sourceEnergy})`);
  for (const s of r.sources) lines.push(`       ${s.id} x${Math.round(s.scale * 1e6) / 1e6} (${s.eut} x ${s.duration})`);
  console.log(lines.join('\n'));
}

test('S0-11: GT--\'s pin, the fixture and the table name the same version and ids', () => {
  const toml = fs.readFileSync(path.join(PACK, 'mods/gtnn.pw.toml'), 'utf8');
  const pinned = /filename\s*=\s*"gtnn-1\.20\.1-([^"]+)\.jar"/.exec(toml);
  assert.ok(pinned, 'gtnn.pw.toml names its jar');
  assert.equal(pinned[1], FIXTURE.gtnnVersion, 'GT-- moved: dump the pack natively, rebuild the fixture and re-check mode 2 (see the fixture\'s notes)');
  assert.equal(TABLE.gtnnVersion, FIXTURE.gtnnVersion, 'the table is pinned to the fixture\'s GT--');
  for (const p of TABLE.composed) {
    for (const id of p.stages) {
      const j = FIXTURE.recipes[id];
      assert.ok(j, `${p.name}: pinned stage ${id} is in GT-- ${FIXTURE.gtnnVersion}`);
      assert.ok(j.inputs || j.outputs, `${p.name}: pinned stage ${id} is not empty`);
      assert.ok(!TABLE.rejected.includes(id), `${p.name}: ${id} is a rejected placeholder`);
    }
  }
  for (const id of TABLE.rejected) {
    const j = FIXTURE.recipes[id];
    assert.ok(j && !j.inputs && !j.outputs, `${id} is still GT--'s empty placeholder`);
  }
});

test('S0-11: mode 1 composes exactly as the native run built it', () => {
  const { G, logs } = run();
  assert.deepEqual(errors(logs), []);
  const r = byName(G, 'naquadah');
  const live = FIXTURE.liveComposed['grindless:naquadah_refining/naquadah'];
  assert.equal(r.eut, live.tickInputs.eu[0].content);
  assert.equal(r.duration, live.duration);
  assert.deepEqual(r.itemsIn.map((x) => [x.id, x.count, x.chance]), [
    ['gtceu:naquadah_oxide_mixture_dust', 4, 10000], ['gtceu:antimony_trioxide_dust', 15, 10000], ['grindless:pube_neutron_source', 1, 100]]);
  assert.deepEqual(amounts(r.fluidsIn), { 'gtceu:hydrofluoric_acid': 40500 });
  assert.deepEqual(amounts(r.fluidsOut), { 'gtceu:hydrogen': 10500, 'minecraft:water': 9000 });
  assert.equal(r.keep, false);
  assert.deepEqual(r.charges, []);
});

test('S0-11: mode 2, circuit 2 (enriched naquadah): the exact balance of luv.md, with full recovery', () => {
  const { G, built, logs } = run();
  assert.deepEqual(errors(logs), []);
  const r = byName(G, 'enriched_naquadah');
  assert.ok(r, 'composed');
  printBalance(r);
  assert.equal(r.recipeId, 'grindless:naquadah_refining/enriched_naquadah');
  assert.equal(r.circuit, 2);
  assert.equal(r.batches, 4, 'one run is 4 chemical-plant batches');
  assert.equal(r.activatorRuns, 0.75);
  const runs = Object.fromEntries(r.sources.map((s) => [s.id.replace(/^gtceu:/, ''), s.scale]));
  assert.deepEqual(runs, {
    'large_chemical_reactor/enriched_naquadah_oxide_mixture': 2, 'large_chemical_reactor/hexafluoride_enriched_naquadah_solution': 4,
    'large_chemical_reactor/xenon_hexafluoro_enriched_naquadate': 4, 'chemical_plant/enriched_naquadah_residue_solution': 4,
    'mixer/enriched_naquadah_solution_separation': 4, 'neutron_activator/enriched_naquadah': 0.75, 'dehydrator/xenoauric_fluoroantimonic_acid': 2,
    'electrolyzer/xenoauric_fluoroantimonic_acid': 2, 'large_chemical_reactor/fluoroantimonic_acid': 10, 'electrolyzer/gold_chloride': 2,
    'large_chemical_reactor/bromine_trifluoride': 4, 'large_chemical_reactor/gold_chloride': 2,
    'electric_blast_furnace/titanium_trifluoride_separation': 3.5, 'vacuum_freezer/cool_hot_titanium_ingot': 3.5,
  });
  // in: 4 oxide + 36,000 F + 26,500 H2 + 8,000 H2SO4 + the Pu-Be source at 0.75 %
  assert.deepEqual(r.itemsIn.map((x) => [x.id, x.count, x.chance]), [
    ['gtceu:enriched_naquadah_oxide_mixture_dust', 4, 10000], ['grindless:pube_neutron_source', 1, 75]]);
  assert.deepEqual(amounts(r.fluidsIn), { 'gtceu:fluorine': 36000, 'gtceu:hydrogen': 26500, 'gtceu:sulfuric_acid': 8000 });
  // held: 1,000 mB xenon, 2,500 mB HSbF6, 4 AuF3 and 1 Pd/C (4 % wear a run)
  assert.deepEqual(r.charges, [
    { fluid: 'gtceu:xenon', amount: 1000, chance: 0 }, { fluid: 'gtceu:fluoroantimonic_acid', amount: 2500, chance: 0 },
    { item: 'gtceu:gold_trifluoride_dust', count: 4, chance: 0 }, { item: 'gtnn:palladium_on_carbon_catalyst', count: 1, chance: 400 }]);
  // out: 11 sulfate + 1 at 25 %, 2 trinium sulfide, 3 titanium + 1 at 50 %, 750 mB impure naquadria, 8,500 mB HF
  assert.deepEqual(r.itemsOut.map((x) => [x.id, x.whole, x.chance]), [
    ['gtceu:enriched_naquadah_sulfate_dust', 11, 2500], ['gtceu:trinium_sulfide_dust', 2, 0], ['gtceu:titanium_ingot', 3, 5000]]);
  assert.deepEqual(amounts(r.fluidsOut), { 'gtceu:impure_naquadria_solution': 750, 'gtceu:hydrofluoric_acid': 8500 });
  // what GT-- as it runs would lose a run, kept inside: 2,000 mB xenon, 2 gold, the antimony (38 SbF3 against 4 Sb2O3), 4 Pd/C
  assert.deepEqual(Object.fromEntries(Object.entries(r.recovered).map(([k, v]) => [k, Math.round(v * 1e9) / 1e9])), {
    'i:gtceu:antimony_trifluoride_dust': -38, 'i:gtceu:antimony_trioxide_dust': 4, 'f:gtceu:xenon': -2000, 'i:gtceu:gold_dust': -2,
    'i:gtnn:palladium_on_carbon_catalyst': -4 });
  // EU: luv.md's 45.89 M a batch, plus the vacuum freezer's 60,480 that cools the batch's 0.875 hot titanium (as mode 1 does)
  assert.equal(r.sourceEnergy, 4 * (45891000 + 60480));
  assert.equal(r.duration, 5984);
  assert.equal(r.eut, 30717);
  assert.ok(r.eut <= 30720 && r.energy >= r.sourceEnergy && r.energy - r.sourceEnergy < r.duration);
  assert.equal(r.keep, true);
  // the builder got the charges as charges, the keep flag and the mode's data key
  const b = built.find((x) => x.id === 'grindless:enriched_naquadah');
  assert.equal(b.type, 'gtceu:naquadah_refining');
  const calls = b.calls.map((c) => c[0]);
  assert.deepEqual(b.calls.filter((c) => c[0] === 'notConsumableFluid').map((c) => c[1]), [
    { fluid: 'gtceu:xenon', amount: 1000 }, { fluid: 'gtceu:fluoroantimonic_acid', amount: 2500 }]);
  assert.deepEqual(b.calls.filter((c) => c[0] === 'notConsumable').map((c) => c[1]), ['4x gtceu:gold_trifluoride_dust']);
  assert.deepEqual(b.calls.filter((c) => c[0] === 'chancedInput').map((c) => c.slice(1)), [
    ['1x grindless:pube_neutron_source', 75, 0], ['1x gtnn:palladium_on_carbon_catalyst', 400, 0]]);
  assert.deepEqual(b.calls.find((c) => c[0] === 'addDataBool').slice(1), ['grindless_naquadah_keep', true]);
  assert.deepEqual(b.calls.find((c) => c[0] === 'circuit').slice(1), [2]);
  assert.ok(calls.includes('addDataString'));
});

test('S0-11: mode 2, circuit 3 (spent naquadah, decision 21)', () => {
  const { G, logs } = run();
  assert.deepEqual(errors(logs), []);
  const r = byName(G, 'spent_naquadah');
  assert.ok(r, 'composed');
  printBalance(r);
  assert.equal(r.circuit, 3);
  assert.equal(r.batches, 2);
  assert.equal(r.activatorRuns, 0.375);
  assert.deepEqual(r.itemsIn.map((x) => [x.id, x.count, x.chance]), [['gtceu:naquadah_dust', 6, 10000], ['grindless:pube_neutron_source', 1, 38]]);
  assert.deepEqual(amounts(r.fluidsIn), { 'gtceu:fluorine': 18000, 'gtceu:hydrogen': 15000, 'gtceu:sulfuric_acid': 4000 });
  assert.deepEqual(r.itemsOut.map((x) => [x.id, x.whole, x.chance]), [
    ['gtceu:enriched_naquadah_sulfate_dust', 5, 6250], ['gtceu:trinium_sulfide_dust', 1, 0], ['gtceu:titanium_ingot', 1, 0]]);
  assert.deepEqual(amounts(r.fluidsOut), { 'gtceu:impure_naquadria_solution': 2375, 'gtceu:hydrofluoric_acid': 10000 });
  assert.equal(r.charges.find((c) => c.item === 'gtnn:palladium_on_carbon_catalyst').chance, 200);
  assert.equal(r.sourceEnergy, 109287120);
  assert.ok(r.eut <= 30720);
  assert.equal(r.keep, true);
  // its input: reactor III's spent long naquadah rod, one naquadah dust each in GTM's recycling macerator
  const mac = FIXTURE.related['gtceu:macerator/macerate_long_naquadah_rod'];
  assert.equal(mac.inputs.item[0].content.ingredient.item, 'gtceu:long_naquadah_rod');
  assert.deepEqual([mac.outputs.item[0].content.ingredient.item, mac.outputs.item[0].content.count], ['gtceu:naquadah_dust', 1]);
});

test('S0-11: every recipe of the type has its own circuit and fits the published sizes', () => {
  const { G } = run();
  const NP = G.naquadahPlant;
  assert.deepEqual(NP.recipes.map((r) => r.circuit).sort(), [1, 2, 3]);
  // mode 4 (ZPM-A2) is a direct table recipe, not a composed one, so it is not in NP.recipes
  assert.deepEqual(NP.modes, { 1: 'naquadah', 2: 'enriched_naquadah', 3: 'spent_naquadah', 4: 'enriched_solution' });
  for (const r of NP.recipes) {
    const itemCharges = r.charges.filter((c) => c.item).length;
    assert.ok(r.itemsIn.length + itemCharges + 1 <= NP.maxIO.itemsIn, r.name);
    assert.ok(r.fluidsIn.length + r.charges.length - itemCharges <= NP.maxIO.fluidsIn, r.name);
    assert.ok(r.itemsOut.reduce((n, o) => n + (o.whole > 0) + (o.chance > 0), 0) <= NP.maxIO.itemsOut, r.name);
    assert.ok(r.fluidsOut.length <= NP.maxIO.fluidsOut, r.name);
  }
  assert.equal(NP.stagesRead, 18);
  assert.ok(Object.values(NP.pins).every((s) => s === 'ok'));
});

test('S0-11: a broken pin fails loudly (an ERROR, the mode not built) and leaves the other modes alone', () => {
  const recipes = { ...FIXTURE.recipes };
  delete recipes['gtceu:dehydrator/xenoauric_fluoroantimonic_acid'];
  recipes['gtceu:chemical_plant/enriched_naquadah_residue_solution'] = { type: 'gtceu:chemical_plant', duration: 100, tickInputs: { eu: [{ content: 5 }] } };
  const { G, logs } = run(recipes);
  const NP = G.naquadahPlant;
  assert.equal(NP.pins['gtceu:dehydrator/xenoauric_fluoroantimonic_acid'], 'missing');
  assert.equal(NP.pins['gtceu:chemical_plant/enriched_naquadah_residue_solution'], 'empty');
  assert.deepEqual(NP.recipes.map((r) => r.name), ['naquadah']);
  const errs = errors(logs);
  assert.equal(errs.length, 2);
  assert.ok(errs.every((m) => /pin\(s\) broken: .*xenoauric.*\(missing\).*\(empty\)|pin\(s\) broken: .*\(empty\).*\(missing\)/.test(m)), errs.join('\n'));
});

test('S0-11: a rejected placeholder in a plan is refused', () => {
  const table = JSON.parse(JSON.stringify(TABLE));
  table.composed[1].stages[4] = 'gtceu:centrifuge/acidic_naquadria_solution_separation';
  const { G, logs } = run(FIXTURE.recipes, {
    before(sandbox) {
      const read = sandbox.global.grindless.readJsonTable;
      sandbox.global.grindless.readJsonTable = (p) => (p.endsWith('naquadah_plant.json') ? JSON.parse(JSON.stringify(table)) : read(p));
    },
  });
  assert.equal(G.naquadahPlant.pins['gtceu:centrifuge/acidic_naquadria_solution_separation'], 'rejected');
  assert.ok(!byName(G, 'enriched_naquadah'));
  assert.ok(errors(logs).some((m) => /enriched_naquadah: GT-- 1\.3\.10 pin\(s\) broken: .*acidic_naquadria_solution_separation \(rejected\)/.test(m)));
});

test('S0-11: without GT--\'s Pd/C catalyst item the mode is skipped with an error, not built with a hole', () => {
  const { G, logs } = run(FIXTURE.recipes, { items: (id) => id !== 'gtnn:palladium_on_carbon_catalyst' && /^(gtceu|gtnn|grindless|minecraft):/.test(id) });
  assert.ok(!byName(G, 'enriched_naquadah'));
  assert.ok(errors(logs).some((m) => /enriched_naquadah/.test(m)));
});
