// STEAM-X1 (docs/eras/steam.md, "The Horizon Collector (the start)"): the Horizon Collector, its recipe type, the Horizon Shard and the
// nine recipes of data/grindless/tables/horizon_collector.json as the stand-in sees them, without Minecraft. The machine and the shard
// come only from the Welcome quest: no recipe may make them.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const pack = path.join(root, 'pack');
const kubejs = path.join(pack, 'kubejs');
const table = JSON.parse(fs.readFileSync(path.join(kubejs, 'data', 'grindless', 'tables', 'horizon_collector.json'), 'utf8'));

const MACHINE = 'gtceu:lv_horizon_collector';
const TYPE = 'gtceu:horizon_collection';
const SHARD = 'grindless:horizon_shard';
// the design table (steam.md): circuit -> output, count
const EXPECTED = [
  [1, 'minecraft:oak_log', 16],
  [2, 'minecraft:cobblestone', 48],
  [3, 'minecraft:sand', 32],
  [4, 'minecraft:gravel', 32],
  [5, 'minecraft:clay_ball', 32],
  [6, 'minecraft:coal', 12],
  [7, 'minecraft:raw_copper', 8],
  [8, 'gtceu:raw_tin', 8],
  [9, 'minecraft:raw_iron', 8],
];

const run = runPackScripts(pack);
const recipes = run.docs.recipes.recipes;
const ours = recipes.filter((r) => r.t === TYPE);

test('the machine (LV only), its recipe type and the shard are registered, without script errors', () => {
  const errs = run.errors.filter((e) => /horizon/.test(String(e.file)) || /horizon/.test(String(e.message)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.ok(run.registry.recipeTypes.has(TYPE));
  assert.ok(run.registry.items.has(SHARD));
  const machines = [...run.registry.machines.keys()].filter((id) => /horizon_collector/.test(id));
  assert.deepEqual(machines, [MACHINE], 'one machine, LV only');
  // the stand-in does not run .definition() callbacks, so the machine's recipe type is pinned from the source
  const src = fs.readFileSync(path.join(kubejs, 'startup_scripts', 'grindless', 'steam', 'horizon_collector.js'), 'utf8');
  assert.match(src, /\.tiers\(GTValues\.LV\)\s*\n/);
  assert.match(src, /\.recipeType\('horizon_collection'\)/);
});

test('the nine rows: circuit, output and count, 16 EU/t, 1200 ticks, the shard never consumed, no fluids', () => {
  assert.equal(table.eut, 16);
  assert.equal(table.duration, 1200);
  assert.equal(table.catalyst, SHARD);
  assert.deepEqual(table.rows.map((r) => [r.circuit, r.output, r.count]), EXPECTED);
  assert.equal(ours.length, EXPECTED.length);
  for (const [circuit, output, count] of EXPECTED) {
    const name = output.split(':')[1];
    const r = ours.find((x) => x.i === `grindless:horizon_collection/${name}`);
    assert.ok(r, name);
    const ins = r.j.inputs.item;
    assert.equal(ins.length, 2, name);
    const shard = ins.find((x) => x.content.ingredient && x.content.ingredient.item === SHARD);
    assert.ok(shard, `${name}: shard input`);
    assert.equal(shard.chance, 0, `${name}: the shard is not consumed`);
    assert.equal(shard.content.count, 1);
    const circ = ins.find((x) => x.content.type === 'gtceu:circuit');
    assert.equal(circ && circ.content.configuration, circuit, `${name}: circuit`);
    assert.equal(r.j.outputs.item.length, 1);
    assert.equal(r.j.outputs.item[0].content.ingredient.item, output);
    assert.equal(r.j.outputs.item[0].content.count, count);
    assert.equal(r.j.outputs.item[0].chance, 10000);
    assert.deepEqual(r.j.inputs.fluid, []);
    assert.deepEqual(r.j.outputs.fluid, []);
    assert.deepEqual(r.j.tickInputs.eu.map((e) => e.content), [16]);
    assert.ok(r.j.tickInputs.eu[0].content <= 32, 'LV');
  }
  assert.equal(new Set(ours.map((r) => r.j.inputs.item.find((x) => x.content.type === 'gtceu:circuit').content.configuration)).size, 9);
});

test('the duration of every row is 1200 ticks', () => {
  const src = fs.readFileSync(path.join(kubejs, 'server_scripts', 'grindless', 'steam', 'horizon_collector.js'), 'utf8');
  assert.match(src, /\.duration\(t\.duration\)/);
  assert.match(src, /\.EUt\(t\.eut\)/);
});

test('no recipe outputs the machine or the shard', () => {
  for (const id of [MACHINE, SHARD]) {
    const makers = recipes.filter((r) => {
      const out = JSON.stringify([r.j.outputs, r.j.result, r.j.results, r.j.output]);
      return out.includes(`"${id}"`);
    });
    assert.deepEqual(makers.map((r) => r.i), [], id);
  }
});

test('names in en_us and es_es', () => {
  for (const lang of ['en_us', 'es_es']) {
    const l = run.lang[lang] || {};
    for (const key of [`block.${MACHINE.replace(':', '.')}`, 'gtceu.horizon_collection', 'item.grindless.horizon_shard',
      'grindless.machine.horizon_collector.tooltip.0', 'grindless.machine.horizon_collector.tooltip.1',
      'grindless.machine.horizon_collector.tooltip.2', 'tooltip.grindless.horizon_shard', 'tooltip.grindless.horizon_shard.use']) {
      assert.ok(l[key], `${lang} ${key}`);
    }
  }
});
