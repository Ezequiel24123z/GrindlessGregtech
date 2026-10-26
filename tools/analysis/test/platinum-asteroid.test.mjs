// LuV A2 (docs/eras/luv.md, "Platinum plant, mode 4: asteroid platinum metals, absolute"): the platinum plant's mode 4 composed by the
// pack's own scripts (server_scripts/grindless/lib/compose.js + ev/platinum_plant.js, its startup script for the published sizes and the
// keep key) on GT--'s pinned recipes (tools/analysis/fixtures/platinum-plant-line.json, read from a native dump), in a stand-in for
// ServerEvents.recipes. Mode 4's first stage is the opening of data/grindless/tables/asteroid_pgm.json; the rest is mode 3's live chain.
// It prints mode 4's balance and fails when the GT-- pin, the fusion, modes 1 and 3 as the native run built them, or mode 4 change.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { runServerScripts } from '../lib/kubejs_recipes_sandbox.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const PACK = path.join(ROOT, 'pack');
const FIXTURE = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/analysis/fixtures/platinum-plant-line.json'), 'utf8'));
const TABLE = JSON.parse(fs.readFileSync(path.join(PACK, 'kubejs/data/grindless/tables/asteroid_pgm.json'), 'utf8'));
const SCRIPTS = ['kubejs/server_scripts/grindless/lib/compose.js', 'kubejs/server_scripts/grindless/ev/platinum_plant.js'];
const STARTUP = ['kubejs/startup_scripts/grindless/ev/platinum_plant.js'];
const CONCENTRATE = 'grindless:asteroid_pgm_concentrate';
const FUSION = 'grindless:solar_processing/iridosmine_fusion';
const ours = (id) => /^(gtceu|gtnn|grindless|minecraft):/.test(id);

// what server_scripts/grindless/iv/mercury.js publishes as global.grindless.mercury.fusion when it loads (its recipe handler never runs)
function mercuryFusion() {
  const ctx = { global: { grindless: {} }, ServerEvents: { recipes() {} }, console: { info() {}, warn() {}, error() {}, log() {} } };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(PACK, 'kubejs/server_scripts/grindless/iv/mercury.js'), 'utf8'), ctx);
  return JSON.parse(JSON.stringify(ctx.global.grindless.mercury.fusion));
}
const MERCURY_FUSION = mercuryFusion();

function run({ items = ours, table = null, fusion = MERCURY_FUSION } = {}) {
  return runServerScripts({
    packRoot: PACK, scripts: SCRIPTS, startup: STARTUP, recipes: FIXTURE.recipes, items,
    before(sandbox) {
      const G = sandbox.global.grindless;
      if (fusion) G.mercury = { fusion: JSON.parse(JSON.stringify(fusion)) };
      if (table) {
        const read = G.readJsonTable;
        G.readJsonTable = (p) => (p.endsWith('asteroid_pgm.json') ? JSON.parse(JSON.stringify(table)) : read(p));
      }
    },
  });
}

const byName = (G, name) => (G.platinumPlant.recipes || []).find((r) => r.name === name);
const amounts = (list) => Object.fromEntries(list.map((x) => [x.id, x.amount]));
const errors = (logs) => logs.filter(([level]) => level === 'error').map(([, m]) => m);
const warnings = (logs) => logs.filter(([level]) => level === 'warn').map(([, m]) => m);
const round = (x) => Math.round(x * 1e6) / 1e6;

// a recipe of the native dump -> the contents a published recipe must have (item outputs as the builder's entries: [id, count, chance])
function nativeContents(j) {
  const item = (e) => e.content.ingredient.item || `#${e.content.ingredient.tag}`;
  const items = (j.inputs && j.inputs.item) || [];
  const circuit = items.find((e) => e.content.ingredient && e.content.ingredient.type === 'gtceu:circuit');
  return {
    eut: j.tickInputs.eu[0].content,
    duration: j.duration,
    circuit: circuit ? circuit.content.ingredient.configuration : null,
    itemsIn: items.filter((e) => e !== circuit).map((e) => [item(e), e.content.count, e.chance]),
    fluidsIn: Object.fromEntries(((j.inputs && j.inputs.fluid) || []).map((e) => [e.content.value[0].fluid, e.content.amount])),
    itemsOut: ((j.outputs && j.outputs.item) || []).map((e) => [item(e), e.content.count, e.chance]),
    fluidsOut: Object.fromEntries(((j.outputs && j.outputs.fluid) || []).map((e) => [e.content.value[0].fluid, e.content.amount])),
  };
}

// a published recipe -> the same shape
function publishedContents(r) {
  return {
    eut: r.eut,
    duration: r.duration,
    circuit: r.circuit,
    itemsIn: r.itemsIn.map((x) => [x.id, x.count, x.chance]),
    fluidsIn: amounts(r.fluidsIn),
    itemsOut: r.itemsOut.flatMap((o) => [...(o.whole > 0 ? [[o.id, o.whole, 10000]] : []), ...(o.chance > 0 ? [[o.id, 1, o.chance]] : [])]),
    fluidsOut: amounts(r.fluidsOut),
  };
}

function printBalance(r, PP) {
  const lines = [`LuV A2 ${r.recipeId} (circuit ${r.circuit}${r.keep ? ', refuses voiding' : ''}):`];
  for (const x of r.itemsIn) lines.push(`  in   ${x.count} ${x.id}${x.chance < 10000 ? ` @ ${x.chance}/10000` : ''}`);
  for (const x of r.fluidsIn) lines.push(`  in   ${x.amount} mB ${x.id}`);
  for (const x of r.itemsOut) lines.push(`  out  ${x.whole} ${x.id}${x.chance > 0 ? ` + 1 @ ${x.chance}/10000` : ''}`);
  for (const x of r.fluidsOut) lines.push(`  out  ${x.amount} mB ${x.id}`);
  lines.push(`  EU   ${r.eut} EU/t x ${r.duration} t = ${r.energy} (stages ${r.sourceEnergy})`);
  for (const s of r.sources) lines.push(`       ${s.id} x${round(s.scale)} (${round(s.eut)} x ${s.duration})`);
  const o = PP.asteroid.opening;
  lines.push(`  opening ${round(o.energy)} EU = ${o.fusionTimes} x fusion (${round(o.fusionEnergy)}) + ${o.attackSludge} x one sludge's attack (${round(o.attackSludgeEnergy)})`);
  lines.push(`  yields ${Object.entries(PP.asteroid.yields.got).map(([k, v]) => `${v} ${k}`).join(', ')}`);
  console.log(lines.join('\n'));
}

test('mode 4: GT--\'s pin, the fixture and the fusion are the ones the native run used', () => {
  const toml = fs.readFileSync(path.join(PACK, 'mods/gtnn.pw.toml'), 'utf8');
  const pinned = /filename\s*=\s*"gtnn-1\.20\.1-([^"]+)\.jar"/.exec(toml);
  assert.ok(pinned, 'gtnn.pw.toml names its jar');
  assert.equal(pinned[1], FIXTURE.gtnnVersion, 'GT-- moved: dump the pack natively, rebuild the fixture and re-check the modes (see the fixture\'s notes)');
  for (const [id, j] of Object.entries(FIXTURE.recipes)) assert.ok(j.inputs && j.outputs, `${id} is a live recipe`);
  // mercury.js's published fusion is what the native run built grindless:solar_processing/iridosmine_fusion from
  const live = nativeContents(FIXTURE.related[FUSION]);
  const F = MERCURY_FUSION;
  assert.equal(F.recipe, FUSION);
  assert.deepEqual([F.eut, F.duration], [live.eut, live.duration]);
  assert.deepEqual(F.inputs.items.map((x) => [x.id || `#${x.tag}`, x.count, 10000]), live.itemsIn);
  assert.deepEqual(amounts(F.inputs.fluids), live.fluidsIn);
  assert.deepEqual(F.outputs.items.map((x) => [x.id, x.count, 10000]), live.itemsOut);
  assert.deepEqual(amounts(F.outputs.fluids), live.fluidsOut);
});

test('mode 4: modes 1 and 3 compose exactly as the native run built them', () => {
  const { G, built, logs } = run();
  assert.deepEqual(errors(logs), []);
  for (const [recipeId, json] of Object.entries(FIXTURE.liveComposed)) {
    const name = recipeId.split('/').pop();
    const r = byName(G, name);
    assert.ok(r, `${name} composed`);
    assert.equal(r.recipeId, recipeId);
    assert.deepEqual(publishedContents(r), nativeContents(json), name);
    assert.equal(r.keep, undefined, `${name} may void`);
    const b = built.find((x) => x.id === r.id);
    assert.ok(!b.calls.some((c) => c[0] === 'addDataBool'), `${name} carries no keep key`);
  }
});

test('mode 4, circuit 4 (asteroid platinum metals): the composed balance keeps luv.md\'s promises', () => {
  const { G, built, logs } = run();
  assert.deepEqual(errors(logs), []);
  const PP = G.platinumPlant;
  const r = byName(G, 'asteroid');
  assert.ok(r, `composed (skipped: ${JSON.stringify(PP.skipped.filter((s) => s.name === 'asteroid'))})`);
  printBalance(r, PP);
  assert.equal(r.recipeId, 'grindless:pgm_refining/luv/asteroid');
  assert.equal(r.id, 'grindless:luv/asteroid');
  assert.equal(r.mode, 'asteroid');
  assert.equal(r.circuit, 4);
  // the opening, then mode 3's chain after its fusion: the same stages
  const iridosmine = byName(G, 'iridosmine');
  assert.deepEqual(r.sources.map((s) => s.id), ['grindless:asteroid_pgm_opening', ...iridosmine.sources.slice(1).map((s) => s.id)]);
  // in: 22 concentrate + 15 saltpeter + 3 calcium + the electrode at 0.1 %; 1,500 mB salt water, HCl and H2 from GT--'s chain
  assert.deepEqual(r.itemsIn.map((x) => [x.id, x.count, x.chance]), [
    [CONCENTRATE, 22, 10000], ['gtceu:saltpeter_dust', 15, 10000], ['gtceu:calcium_dust', 3, 10000], ['grindless:platinum_electrode', 1, 10]]);
  assert.deepEqual(amounts(r.fluidsIn), { 'gtceu:salt_water': 1500, 'gtceu:hydrochloric_acid': 10500, 'gtceu:hydrogen': 21000 });
  // out: 3 Ir + 3 Os + 1 sludge (for circuit 2), and what the chain lets go
  assert.deepEqual(r.itemsOut.map((x) => [x.id, x.whole, x.chance]), [
    ['gtceu:iridium_dust', 3, 0], ['gtceu:osmium_dust', 3, 0], ['gtceu:platinum_group_sludge_dust', 1, 0],
    ['gtceu:platinum_sludge_residue_dust', 3, 0], ['gtceu:metal_sludge_dust', 3, 0], ['gtceu:calcium_chloride_dust', 12, 0]]);
  assert.deepEqual(amounts(r.fluidsOut), { 'minecraft:water': 8700, 'gtceu:steam': 1500 });
  // the table's promise, checked by the script itself
  assert.deepEqual(PP.asteroid.yields, { want: TABLE.yields, got: TABLE.yields, differ: [] });
  assert.equal(PP.asteroid.error, null);
  assert.equal(PP.asteroid.concentrate, CONCENTRATE);
  // the opening's energy: 1.5 x the fusion's + what one sludge costs through attack_pentlandite (its stages' energy over its 1 sludge)
  const o = PP.asteroid.opening;
  const attack = byName(G, 'attack_pentlandite');
  assert.equal(o.fusionEnergy, TABLE.energy.fusionTimes * MERCURY_FUSION.eut * MERCURY_FUSION.duration);
  assert.equal(round(o.attackSludgeEnergy), round(TABLE.energy.attackSludge * attack.sourceEnergy));
  assert.equal(round(o.energy), round(o.fusionEnergy + o.attackSludgeEnergy));
  assert.equal(o.duration, Math.ceil(o.energy / 1920));
  assert.equal(round(o.eut * o.duration), round(o.energy));
  assert.deepEqual(o.v, {
    [`i:${CONCENTRATE}`]: -22, 'i:gtceu:saltpeter_dust': -15, 'f:gtceu:salt_water': -1500, 'i:gtceu:platinum_group_sludge_dust': 1,
    'i:gtceu:rarest_metal_mixture_dust': 6, 'f:gtceu:osmium_tetroxide': 2700, 'f:gtceu:steam': 1500 });
  // EU: the sum of the stages, the opening included, spent at EV's rate; never less than the stages, a tick of power more at most
  const stages = r.sources.reduce((n, s) => n + s.scale * s.eut * s.duration, 0);
  assert.equal(round(r.sourceEnergy), round(stages));
  assert.ok(r.sources[0].scale === 1 && round(r.sources[0].eut * r.sources[0].duration) === round(o.energy));
  assert.ok(r.eut <= 1920, `${r.eut} EU/t`);
  assert.ok(r.energy >= r.sourceEnergy && r.energy - r.sourceEnergy < r.duration);
  assert.equal(r.energy, r.eut * r.duration);
  assert.deepEqual([r.eut, r.duration], [1920, 1106]);
  // it refuses voiding: published, and the builder got the keep key the startup script publishes
  assert.equal(r.keep, true);
  assert.equal(PP.keepKey, 'grindless_pgm_keep');
  assert.equal(PP.noVoiding, 'grindless.machine.platinum_plant.no_voiding');
  const b = built.find((x) => x.id === 'grindless:luv/asteroid');
  assert.equal(b.type, 'gtceu:pgm_refining');
  assert.deepEqual(b.calls.filter((c) => c[0] === 'addDataBool').map((c) => c.slice(1)), [['grindless_pgm_keep', true]]);
  assert.deepEqual(b.calls.find((c) => c[0] === 'circuit').slice(1), [4]);
  assert.deepEqual(b.calls.filter((c) => c[0] === 'chancedInput').map((c) => c.slice(1)), [['1x grindless:platinum_electrode', 10, 0]]);
  assert.deepEqual(b.calls.filter((c) => c[0] === 'EUt' || c[0] === 'duration'), [['EUt', 1920], ['duration', 1106]]);
});

test('mode 4: fits the published sizes, and circuit 4 is its own lookup path', () => {
  const { G } = run();
  const PP = G.platinumPlant;
  assert.deepEqual(PP.modes, { 1: 'attack', 2: 'separation', 3: 'iridosmine', 4: 'asteroid' });
  for (const r of PP.recipes) {
    assert.ok(r.itemsIn.length + 1 <= PP.maxIO.itemsIn, r.name);
    assert.ok(r.itemsOut.reduce((n, o) => n + (o.whole > 0) + (o.chance > 0), 0) <= PP.maxIO.itemsOut, r.name);
    assert.ok(r.fluidsIn.length <= PP.maxIO.fluidsIn, r.name);
    assert.ok(r.fluidsOut.length <= PP.maxIO.fluidsOut, r.name);
  }
  // every mode's circuit (the separation recipes share 2 and differ by their inputs); only mode 4 uses 4 and only it takes the concentrate
  const circuits = Object.fromEntries(Object.entries(PP.modes).map(([c, m]) => [m, Number(c)]));
  for (const r of PP.recipes) assert.equal(r.circuit, circuits[r.mode], r.name);
  assert.deepEqual(PP.recipes.filter((r) => r.circuit === 4).map((r) => r.name), ['asteroid']);
  assert.deepEqual(PP.recipes.filter((r) => r.itemsIn.some((x) => x.id === CONCENTRATE)).map((r) => r.name), ['asteroid']);
  // the opening is not a live stage: the plant reads the same stages as before
  assert.ok(!PP.stageIds.includes('grindless:asteroid_pgm_opening'));
});

test('mode 4: without the concentrate (LuV A1 not merged) it is skipped with a warning and the other modes are untouched', () => {
  const full = run();
  const { G, built, logs } = run({ items: (id) => id !== CONCENTRATE && ours(id) });
  assert.deepEqual(errors(logs), []);
  const PP = G.platinumPlant;
  assert.ok(!byName(G, 'asteroid'));
  assert.ok(!built.some((b) => b.id === 'grindless:luv/asteroid'));
  const skip = PP.skipped.find((s) => s.name === 'asteroid');
  assert.match(skip.reason, /grindless:asteroid_pgm_concentrate is not registered/);
  assert.equal(PP.asteroid.error, skip.reason);
  assert.ok(warnings(logs).some((m) => /platinum plant skipped asteroid: grindless:asteroid_pgm_concentrate is not registered/.test(m)));
  // the opening is still read (its energy is published); the other recipes are the same, to the builder's last call
  assert.ok(PP.asteroid.opening && PP.asteroid.opening.energy > 0);
  assert.deepEqual(PP.recipes, full.G.platinumPlant.recipes.filter((r) => r.name !== 'asteroid'));
  assert.deepEqual(built, full.built.filter((b) => b.id !== 'grindless:luv/asteroid'));
});

test('mode 4: a live chain that breaks the table\'s promise is still built, with a warning', () => {
  const table = JSON.parse(JSON.stringify(TABLE));
  table.yields['gtceu:osmium_dust'] = 4;
  const { G, logs } = run({ table });
  const PP = G.platinumPlant;
  assert.ok(byName(G, 'asteroid'));
  assert.deepEqual(PP.asteroid.yields.differ, ['gtceu:osmium_dust']);
  assert.equal(PP.asteroid.yields.got['gtceu:osmium_dust'], 3);
  assert.ok(warnings(logs).some((m) => /asteroid: the live chain gives 3 gtceu:osmium_dust a run; .*asteroid_pgm\.json promises 4 gtceu:osmium_dust/.test(m)));
});

test('mode 4: without the Mercury fusion its opening has no price, so it is skipped (as mode 3 is)', () => {
  const { G, logs } = run({ fusion: null });
  const PP = G.platinumPlant;
  assert.ok(!byName(G, 'asteroid') && !byName(G, 'iridosmine'));
  assert.equal(PP.asteroid.opening, null);
  assert.match(PP.asteroid.error, /fusion/);
  assert.ok(byName(G, 'attack_pentlandite'));
  assert.ok(warnings(logs).some((m) => /platinum plant skipped asteroid: .*fusion/.test(m)));
});
