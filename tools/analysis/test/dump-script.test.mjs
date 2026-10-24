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

function runScript() {
  const handlers = {};
  const logs = [];
  const written = {};
  const dirs = [];
  class Obj { constructor() { this.props = {}; } add(k, v) { this.props[k] = v; } }
  class Arr { constructor() { this.items = []; } add(v) { this.items.push(v); } }
  class Prim { constructor(v) { this.v = v; } }
  const plain = (x) => {
    if (x instanceof Prim) return x.v;
    if (x instanceof Arr) return x.items.map(plain);
    if (x instanceof Obj) return Object.fromEntries(Object.entries(x.props).map(([k, v]) => [k, plain(v)]));
    return x;
  };
  const classes = {
    'java.util.ArrayList': ArrayList,
    'com.google.gson.JsonObject': Obj,
    'com.google.gson.JsonArray': Arr,
    'com.google.gson.JsonPrimitive': Prim,
    'dev.latvian.mods.kubejs.KubeJSPaths': { dir: (p) => dirs.push(p) },
    'net.minecraft.core.registries.BuiltInRegistries': {
      ITEM: { keySet: () => ['minecraft:stick', 'gtceu:bronze_ingot'] },
      FLUID: { keySet: () => ['minecraft:water'], getTagOrEmpty: () => [], getKey: (f) => f },
    },
    'com.google.common.collect.Lists': { newArrayList: (x) => [...x] },
    'net.minecraft.tags.TagKey': { create: () => ({}) },
    'net.minecraft.core.registries.Registries': { FLUID: {} },
    'net.minecraft.resources.ResourceLocation': class { constructor(s) { this.s = s; } },
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
