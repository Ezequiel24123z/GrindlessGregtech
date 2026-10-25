// Tests for the dump (gg_dump.js): Rhino/KubeJS 6 compatibility and the format contract with the validator.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { makeDump } from '../lib/dump.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const scriptPath = path.resolve(here, '..', '..', 'test', 'overlay', 'kubejs', 'server_scripts', 'gg_dump.js');
const source = fs.readFileSync(scriptPath, 'utf8');

/** Strips comments and simple string/regex literals to look for forbidden constructs in the code. */
function codeOnly(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/'(?:\\.|[^'\\\n])*'/g, "''")
    .replace(/"(?:\\.|[^"\\\n])*"/g, '""');
}

test('gg_dump.js is ES5 for Rhino: no const/let, arrow functions, templates, or classes', () => {
  const code = codeOnly(source);
  assert.doesNotMatch(code, /\b(const|let|class)\b/, 'const/let cause "redeclaration of var" in functions called more than once');
  assert.doesNotMatch(code, /=>/);
  assert.doesNotMatch(code, /`/);
  assert.doesNotMatch(code, /\.\.\./);
});

test('gg_dump.js has valid syntax', () => {
  assert.doesNotThrow(() => new vm.Script(source, { filename: scriptPath }));
});

test('gg_dump.js is only loaded in the test bench (overlay), never inside the pack', () => {
  assert.match(scriptPath.replace(/\\/g, '/'), /tools\/test\/overlay\//);
  assert.ok(!fs.existsSync(path.resolve(here, '..', '..', '..', 'pack', 'kubejs', 'server_scripts', 'gg_dump.js')));
});

class ArrayList {
  constructor(c) {
    this.a = [...(c || [])];
  }

  size() {
    return this.a.length;
  }

  get(i) {
    return this.a[i];
  }
}

const sandboxGlobal = (structures) => ({
  grindless: { structures, patterns: {} },
});

function runScript(globalObj, extraClasses = {}) {
  const handlers = {};
  const logs = [];
  const written = {};
  const dirs = [];
  class Obj { constructor() { this.props = {}; } add(k, v) { this.props[k] = v; } }
  class Arr { constructor() { this.items = []; } add(v) { this.items.push(v); } }
  class Prim { constructor(v) { this.v = v; } }
  class JNull {}
  const plain = (x) => {
    if (x instanceof Prim) return x.v;
    if (x instanceof JNull) return null;
    if (x instanceof Arr) return x.items.map(plain);
    if (x instanceof Obj) return Object.fromEntries(Object.entries(x.props).map(([k, v]) => [k, plain(v)]));
    return x;
  };
  const classes = {
    'java.util.ArrayList': ArrayList,
    'com.google.gson.JsonObject': Obj,
    'com.google.gson.JsonArray': Arr,
    'com.google.gson.JsonPrimitive': Prim,
    'com.google.gson.JsonNull': { INSTANCE: new JNull() },
    'dev.latvian.mods.kubejs.KubeJSPaths': { dir: (p) => dirs.push(p) },
    'net.minecraft.core.registries.BuiltInRegistries': {
      ITEM: { keySet: () => ['minecraft:stick', 'gtceu:bronze_ingot'] },
      FLUID: { keySet: () => ['minecraft:water'], getTagOrEmpty: () => [], getKey: (f) => f },
    },
    'com.google.common.collect.Lists': { newArrayList: (x) => [...x] },
    'net.minecraft.tags.TagKey': { create: () => ({}) },
    'net.minecraft.core.registries.Registries': { FLUID: {} },
    'net.minecraft.resources.ResourceLocation': class { constructor(s) { this.s = s; } },
    ...extraClasses,
  };
  const sandbox = {
    console: { info: (m) => logs.push(['info', String(m)]), error: (m) => logs.push(['error', String(m)]) },
    ServerEvents: {
      recipes: (f) => { handlers.recipes = f; },
      loaded: (f) => { handlers.loaded = f; },
      customCommand: (n, f) => { handlers[`cmd:${n}`] = f; },
    },
    Java: { loadClass: (n) => { if (!(n in classes)) throw new Error(`class not available: ${n}`); return classes[n]; } },
    JsonIO: { write: (p, tree) => { written[p] = plain(tree); } },
    Ingredient: { of: (t) => ({ getItemIds: () => (t === '#forge:ingots/bronze' ? ['gtceu:bronze_ingot'] : ['minecraft:barrier']) }) },
    ...(globalObj ? { global: globalObj } : {}),
  };
  vm.runInNewContext(source, sandbox, { filename: scriptPath });
  return { handlers, logs, written, dirs };
}

const recipe = (id, type, json, extra = {}) => ({
  removed: false,
  hasChanged: () => !!extra.changed,
  serialize: () => { if (extra.serializeThrows) throw new Error('boom'); },
  getId: () => id,
  toString: () => `${id}[${type}]`,
  json: { toString: () => JSON.stringify(json) },
});

test('gg_dump.js: collects original and added recipes and writes the files in the format the validator reads', () => {
  const { handlers, logs, written, dirs } = runScript();
  assert.equal(typeof handlers.recipes, 'function');
  assert.equal(typeof handlers['cmd:gg_dump'], 'function');

  const original = [
    recipe('minecraft:stick', 'minecraft:crafting_shaped', { type: 'minecraft:crafting_shaped', pattern: ['#', '#'], key: { '#': { tag: 'forge:ingots/bronze' } }, result: { item: 'minecraft:stick' } }),
    recipe('gtceu:macerator/x', 'gtceu:macerator', { type: 'gtceu:macerator', inputs: {}, outputs: {} }, { changed: true }),
    { ...recipe('gone:one', 'minecraft:smelting', {}), removed: true },
  ];
  const added = [recipe('grindless:vein_drilling/copper', 'gtceu:vein_drilling', { type: 'unknown', inputs: {}, outputs: {} })];
  handlers.recipes({ originalRecipes: { values: () => original }, addedRecipes: added });
  assert.ok(logs.some(([, m]) => m.includes('GGTEST|dump|COLLECTED|recipes=3|original=2|added=1|removed=1|changed=1')), JSON.stringify(logs));

  handlers['cmd:gg_dump']();
  assert.deepEqual(dirs, ['kubejs/exported']);
  const done = logs.find(([, m]) => m.includes('GGTEST|dump|DONE|'));
  assert.ok(done, 'missing the DONE marker: ' + JSON.stringify(logs));
  assert.match(done[1], /recipes=3/);

  const rec = written['kubejs/exported/recipes.json'];
  assert.equal(rec.format, 'gg-recipes-1');
  assert.equal(rec.count, 3);
  assert.equal(rec.recipes.length, 3);
  const parsed = rec.recipes.map((s) => JSON.parse(s));
  assert.deepEqual(parsed.map((r) => [r.i, r.t, !!r.a]), [
    ['minecraft:stick', 'minecraft:crafting_shaped', false],
    ['gtceu:macerator/x', 'gtceu:macerator', false],
    ['grindless:vein_drilling/copper', 'gtceu:vein_drilling', true],
  ]);

  // contract: the validator loads what the dump writes
  const tags = written['kubejs/exported/tags.json'];
  assert.equal(tags.format, 'gg-tags-2');
  assert.deepEqual(tags.item['forge:ingots/bronze'], ['gtceu:bronze_ingot']);
  assert.deepEqual(tags.item['minecraft:logs'], [], 'an empty tag (vanilla\'s barrier) is stored empty');
  const items = written['kubejs/exported/items.json'];
  assert.deepEqual(items.items, ['gtceu:bronze_ingot', 'minecraft:stick']);
  const dump = makeDump('(simulado)', { recipes: rec, items, tags, machines: null, veins: null, info: written['kubejs/exported/info.json'] });
  assert.equal(dump.recipes.size, 3);
  assert.equal(dump.recipes.get('grindless:vein_drilling/copper').added, true);
  assert.deepEqual(dump.tags.items('forge:ingots/bronze'), ['gtceu:bronze_ingot']);
});

test('gg_dump.js: with no recipes collected, it warns with FAIL instead of writing an empty dump', () => {
  const { handlers, logs, written } = runScript();
  handlers['cmd:gg_dump']();
  assert.ok(logs.some(([lvl, m]) => lvl === 'error' && m.includes('GGTEST|dump|FAIL|no recipes collected')));
  assert.deepEqual(Object.keys(written), []);
});

test('gg_dump.js: a failure serializing a recipe doesn\'t bring down the dump, and it\'s counted', () => {
  const { handlers, logs } = runScript();
  const bad = recipe('x:y', 'minecraft:smelting', { type: 'minecraft:smelting' }, { changed: true, serializeThrows: true });
  handlers.recipes({ originalRecipes: { values: () => [bad] }, addedRecipes: [] });
  assert.ok(logs.some(([, m]) => m.includes('serializeFail=1')));
  assert.ok(logs.some(([, m]) => m.includes('NOTE|firstSerializeError=')));
});

const STRUCTURES = {
  'gtceu:lv_vein_drill': {
    id: 'gtceu:lv_vein_drill',
    built: true,
    slices: [['XXX', 'XSX']],
    symbols: {
      S: { kind: 'controller' },
      X: { kind: 'oneOf', options: [{ kind: 'blocks', blocks: ['gtceu:solid_machine_casing'], limits: { min: 3 } }, { kind: 'part', ability: 'energy_input', limits: { exact: 1 } }] },
    },
  },
};

const stick = recipe('minecraft:stick', 'minecraft:crafting_shaped', { type: 'minecraft:crafting_shaped', pattern: ['#'], key: { '#': { tag: 'forge:ingots/bronze' } }, result: { item: 'minecraft:stick' } });

test('gg_dump.js: dumps global.grindless.structures to structures.json, and the validator loads it', () => {
  const { handlers, logs, written } = runScript(sandboxGlobal(STRUCTURES));
  handlers.recipes({ originalRecipes: { values: () => [stick] }, addedRecipes: [] });
  handlers['cmd:gg_dump']();
  assert.ok(logs.some(([, m]) => m.includes('GGTEST|dump|STRUCTURES|found=true|count=1')));
  const doc = written['kubejs/exported/structures.json'];
  assert.equal(doc.format, 'gg-structures-1');
  assert.deepEqual(doc.structures['gtceu:lv_vein_drill'].slices, [['XXX', 'XSX']]);
  assert.equal(doc.structures['gtceu:lv_vein_drill'].symbols.X.options[1].ability, 'energy_input');
  assert.equal(doc.structures['gtceu:lv_vein_drill'].symbols.X.options[0].limits.min, 3);
  const done = logs.find(([, m]) => m.includes('GGTEST|dump|DONE|'));
  assert.match(done[1], /structures=1/);

  const dump = makeDump('(simulado)', {
    recipes: written['kubejs/exported/recipes.json'], items: written['kubejs/exported/items.json'],
    tags: written['kubejs/exported/tags.json'], structures: doc,
  });
  assert.deepEqual([...dump.structures.keys()], ['gtceu:lv_vein_drill']);
});

test('gg_dump.js: with no global.grindless, it writes an empty structures.json and doesn\'t fail', () => {
  const { handlers, logs, written } = runScript();
  handlers.recipes({ originalRecipes: { values: () => [stick] }, addedRecipes: [] });
  handlers['cmd:gg_dump']();
  assert.ok(logs.some(([, m]) => m.includes('GGTEST|dump|STRUCTURES|found=false|count=0')));
  assert.deepEqual(written['kubejs/exported/structures.json'].structures, {});
  assert.ok(logs.some(([, m]) => m.includes('GGTEST|dump|DONE|')));
});

test('gg_dump.js: dumps fluid deposits (dimension filter) and GTM\'s config switches, and the validator loads them', () => {
  const deposit = (weight, fluid, dims) => ({
    getWeight: () => weight, getMinimumYield: () => 50, getMaximumYield: () => 300, getDepletedYield: () => 25,
    getStoredFluid: () => ({ get: () => fluid }), getDimensionFilter: () => dims,
  });
  const defs = {
    'gtceu:oil_deposit': deposit(25, 'gtceu:oil', [{ location: () => 'minecraft:overworld' }, { location: () => 'grindless:flat' }]),
    'gtceu:salt_deposit': deposit(10, 'gtceu:salt_water', null),
  };
  const classes = {
    'com.gregtechceu.gtceu.api.registry.GTRegistries': { BEDROCK_FLUID_DEFINITIONS: { keys: () => Object.keys(defs), get: (k) => defs[k] } },
    'com.gregtechceu.gtceu.config.ConfigHolder': {
      INSTANCE: {
        worldgen: { oreVeins: { infiniteBedrockOresFluids: true } },
        machines: { enableMaintenance: true, doBedrockOres: false },
        gameplay: { hazardsEnabled: true },
        compat: { energy: { enableFEConverters: false } },
      },
    },
  };
  const { handlers, logs, written } = runScript(undefined, classes);
  handlers.recipes({ originalRecipes: { values: () => [stick] }, addedRecipes: [] });
  handlers['cmd:gg_dump']();
  const fv = written['kubejs/exported/fluid_veins.json'];
  assert.equal(fv.format, 'gg-fluid-veins-1');
  assert.deepEqual(fv.veins.map((v) => [v.id, v.fluid, v.dims]), [
    ['gtceu:oil_deposit', 'gtceu:oil', ['grindless:flat', 'minecraft:overworld']],
    ['gtceu:salt_deposit', 'gtceu:salt_water', null],
  ]);
  assert.equal(fv.veins[0].weight, 25);
  assert.equal(fv.veins[0].depletedYield, 25);
  const cfg = written['kubejs/exported/config.json'];
  assert.equal(cfg.format, 'gg-config-1');
  assert.equal(cfg.gtceu['worldgen.oreVeins.infiniteBedrockOresFluids'], true);
  assert.equal(cfg.gtceu['machines.doBedrockOres'], false);
  assert.equal(cfg.gtceu['compat.energy.enableFEConverters'], false);
  const done = logs.find(([, m]) => m.includes('GGTEST|dump|DONE|'));
  assert.match(done[1], /fluidVeins=2/);
  assert.match(done[1], /config=5/);

  const dump = makeDump('(simulado)', {
    recipes: written['kubejs/exported/recipes.json'], items: written['kubejs/exported/items.json'],
    tags: written['kubejs/exported/tags.json'], fluidVeins: fv, config: cfg,
  });
  assert.equal(dump.fluidVeins.length, 2);
  assert.equal(dump.fluidVeins[1].dims, null);
  assert.equal(dump.config['worldgen.oreVeins.infiniteBedrockOresFluids'], true);
});

test('gg_dump.js: a Rhino java.lang.Boolean (object, not boolean) is written as a boolean, not as text', () => {
  const javaBool = (v) => ({ toString: () => String(v) });
  const classes = {
    'com.gregtechceu.gtceu.config.ConfigHolder': {
      INSTANCE: {
        worldgen: { oreVeins: { infiniteBedrockOresFluids: javaBool(true) } },
        machines: { enableMaintenance: javaBool(true), doBedrockOres: javaBool(false) },
        gameplay: { hazardsEnabled: javaBool(true) },
        compat: { energy: { enableFEConverters: javaBool(false) } },
      },
    },
  };
  const { handlers, written } = runScript(undefined, classes);
  handlers.recipes({ originalRecipes: { values: () => [stick] }, addedRecipes: [] });
  handlers['cmd:gg_dump']();
  const values = written['kubejs/exported/config.json'].gtceu;
  assert.strictEqual(values['worldgen.oreVeins.infiniteBedrockOresFluids'], true);
  assert.strictEqual(values['machines.doBedrockOres'], false);
  assert.strictEqual(values['compat.energy.enableFEConverters'], false);

  // with JsonParser available (real server) booleans are written as a Gson Boolean primitive, not as a String
  const real = runScript(undefined, { ...classes, 'com.google.gson.JsonParser': { parseString: (s) => ({ parsedBoolean: s === 'true' }) } });
  real.handlers.recipes({ originalRecipes: { values: () => [stick] }, addedRecipes: [] });
  real.handlers['cmd:gg_dump']();
  const parsed = real.written['kubejs/exported/config.json'].gtceu['machines.doBedrockOres'];
  assert.deepEqual(parsed, { parsedBoolean: false });
});

test('gg_dump.js: without GTM\'s classes, fluid deposits and config aren\'t written, and the dump still works', () => {
  const { handlers, logs, written } = runScript();
  handlers.recipes({ originalRecipes: { values: () => [stick] }, addedRecipes: [] });
  handlers['cmd:gg_dump']();
  assert.equal(written['kubejs/exported/fluid_veins.json'], undefined);
  assert.equal(written['kubejs/exported/config.json'], undefined);
  assert.ok(logs.some(([, m]) => m.includes('GGTEST|dump|DONE|')));
  const dump = makeDump('(simulado)', {
    recipes: written['kubejs/exported/recipes.json'], items: written['kubejs/exported/items.json'], tags: written['kubejs/exported/tags.json'],
  });
  assert.equal(dump.fluidVeins, null);
  assert.equal(dump.config, null);
});
