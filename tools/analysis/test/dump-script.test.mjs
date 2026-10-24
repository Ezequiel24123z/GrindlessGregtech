// Pruebas del volcado (gg_dump.js): compatibilidad con Rhino/KubeJS 6 y contrato de formato con el analizador.
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

/** Quita comentarios y literales de cadena/regex sencillos para buscar construcciones prohibidas en el código. */
function codeOnly(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/'(?:\\.|[^'\\\n])*'/g, "''")
    .replace(/"(?:\\.|[^"\\\n])*"/g, '""');
}

test('gg_dump.js es ES5 para Rhino: sin const/let, flechas, plantillas ni clases', () => {
  const code = codeOnly(source);
  assert.doesNotMatch(code, /\b(const|let|class)\b/, 'const/let dan "redeclaration of var" en funciones que se llaman varias veces');
  assert.doesNotMatch(code, /=>/);
  assert.doesNotMatch(code, /`/);
  assert.doesNotMatch(code, /\.\.\./);
});

test('gg_dump.js tiene sintaxis válida', () => {
  assert.doesNotThrow(() => new vm.Script(source, { filename: scriptPath }));
});

test('gg_dump.js solo se carga en el banco de pruebas (overlay), nunca dentro del pack', () => {
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
    Java: { loadClass: (n) => { if (!(n in classes)) throw new Error(`clase no disponible: ${n}`); return classes[n]; } },
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

test('gg_dump.js: recoge recetas originales y añadidas y escribe los archivos con el formato que lee el analizador', () => {
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
  assert.ok(done, 'falta el marcador DONE: ' + JSON.stringify(logs));
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

  // contrato: el analizador carga lo que escribe el volcado
  const tags = written['kubejs/exported/tags.json'];
  assert.equal(tags.format, 'gg-tags-2');
  assert.deepEqual(tags.item['forge:ingots/bronze'], ['gtceu:bronze_ingot']);
  assert.deepEqual(tags.item['minecraft:logs'], [], 'una etiqueta vacía (barrera de vanilla) se guarda vacía');
  const items = written['kubejs/exported/items.json'];
  assert.deepEqual(items.items, ['gtceu:bronze_ingot', 'minecraft:stick']);
  const dump = makeDump('(simulado)', { recipes: rec, items, tags, machines: null, veins: null, info: written['kubejs/exported/info.json'] });
  assert.equal(dump.recipes.size, 3);
  assert.equal(dump.recipes.get('grindless:vein_drilling/copper').added, true);
  assert.deepEqual(dump.tags.items('forge:ingots/bronze'), ['gtceu:bronze_ingot']);
});

test('gg_dump.js: sin recetas recogidas avisa con FAIL en vez de escribir un volcado vacío', () => {
  const { handlers, logs, written } = runScript();
  handlers['cmd:gg_dump']();
  assert.ok(logs.some(([lvl, m]) => lvl === 'error' && m.includes('GGTEST|dump|FAIL|no recipes collected')));
  assert.deepEqual(Object.keys(written), []);
});

test('gg_dump.js: un fallo al serializar una receta no tumba el volcado y se cuenta', () => {
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

test('gg_dump.js: vuelca global.grindless.structures a structures.json y el analizador lo carga', () => {
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

test('gg_dump.js: sin global.grindless escribe structures.json vacío y no falla', () => {
  const { handlers, logs, written } = runScript();
  handlers.recipes({ originalRecipes: { values: () => [stick] }, addedRecipes: [] });
  handlers['cmd:gg_dump']();
  assert.ok(logs.some(([, m]) => m.includes('GGTEST|dump|STRUCTURES|found=false|count=0')));
  assert.deepEqual(written['kubejs/exported/structures.json'].structures, {});
  assert.ok(logs.some(([, m]) => m.includes('GGTEST|dump|DONE|')));
});

test('gg_dump.js: vuelca los yacimientos de fluidos (filtro de dimensión) y los interruptores de config de GTM y el analizador los carga', () => {
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

test('gg_dump.js: un java.lang.Boolean de Rhino (objeto, no boolean) se escribe como booleano y no como texto', () => {
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

  // con JsonParser disponible (servidor real) los booleanos se escriben como primitivo Boolean de Gson y no como String
  const real = runScript(undefined, { ...classes, 'com.google.gson.JsonParser': { parseString: (s) => ({ parsedBoolean: s === 'true' }) } });
  real.handlers.recipes({ originalRecipes: { values: () => [stick] }, addedRecipes: [] });
  real.handlers['cmd:gg_dump']();
  const parsed = real.written['kubejs/exported/config.json'].gtceu['machines.doBedrockOres'];
  assert.deepEqual(parsed, { parsedBoolean: false });
});

test('gg_dump.js: sin las clases de GTM los yacimientos de fluidos y la config no se escriben y el volcado sigue valiendo', () => {
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
