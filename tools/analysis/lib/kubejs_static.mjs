// Static KubeJS stand-in: runs the pack's own startup, server and client scripts in Node's `vm` with recording stand-ins for the
// KubeJS/GTM APIs they call, and returns what they register and add, as a dump in gg_dump.js's format (lib/dump.mjs makeDump), with
// no Minecraft. The scripts stay the single source of truth: table-driven registrations and recipes (vein samples, wireless tiers...)
// come out exactly as the scripts generate them.
//
// What is modelled (everything else is an inert stand-in that absorbs calls, so a script runs to its end):
//   startup   StartupEvents.registry('item' | 'block' | 'fluid'), GTCEuStartupEvents.registry('gtceu:material' | 'gtceu:recipe_type' |
//             'gtceu:machine') with tiers, item/block tags, GTFluidBuilder#name (a fluid queued on a GTM material)
//   server    ServerEvents.tags('item' | 'fluid' | 'block'), ServerEvents.recipes: GT builders (event.recipes.gtceu.<type>(id) with item
//             and fluid inputs/outputs, chances, not-consumed inputs, circuits, EU/t, conditions), crafting (shaped, shapeless, GTM's
//             shaped), cooking, stonecutting, smithing and event.custom JSON. Handlers of right-click/placement events are recorded
//             with their item filter (world mechanics).
//   client    ClientEvents.lang(<language>): the translation keys the pack adds.
// Not modelled by default: the mods' own recipes. event.originalRecipes and forEachRecipe see only the `originals` handed in (none in
// the Node suite), so recipes the pack derives from them (the refinery, the ore plant...) are absent; GTM's recipes generated from a
// material's flags are absent too. A native dump (gg_dump.js) is the authority for those; emi-coverage.mjs --dump cross-checks it.
//
// Script order follows KubeJS 6: files sorted by `// priority:` (higher first), then by path; one shared scope per script type.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { makeDump } from './dump.mjs';

const TIERS = ['ULV', 'LV', 'MV', 'HV', 'EV', 'IV', 'LuV', 'ZPM', 'UV', 'UHV', 'UEV', 'UIV', 'UXV', 'OpV', 'MAX'];
const VOLTAGE = TIERS.map((_, i) => 8 * Math.pow(4, i));
const CALLBACK_TIMEOUT_MS = 20000;

// ------------------------------------------------------------------------------------------------ inert stand-in

/** A callable object that absorbs any use: properties, calls, `new`, conversion to text ('') or number (0), empty iteration. */
export function makeAny() {
  let self;
  const target = function () {};
  const handler = {
    get(t, prop) {
      if (prop === Symbol.toPrimitive) return (hint) => (hint === 'number' ? 0 : '');
      if (prop === Symbol.iterator) return function* () {};
      if (typeof prop === 'symbol') return undefined;
      if (prop === 'then') return undefined;
      if (prop === 'prototype') return t.prototype;
      if (prop === 'toString' || prop === 'valueOf' || prop === 'toJSON' || prop === 'getString' || prop === 'getPath') return () => '';
      // Java iterators and collections: never loop forever, never pretend to hold something
      if (prop === 'hasNext' || prop === 'isPresent' || prop === 'contains' || prop === 'equals' ||
          prop === 'isClientSide' || prop === 'hasTag') return () => false;
      // registries (ForgeRegistries.X.containsKey(id)): what the scripts ask for exists
      if (prop === 'containsKey') return () => true;
      if (prop === 'isEmpty') return () => true;
      if (prop === 'size' || prop === 'length') return prop === 'size' ? () => 0 : 0;
      return self;
    },
    apply() { return self; },
    construct() { return self; },
    set() { return true; },
    has() { return false; },
  };
  self = new Proxy(target, handler);
  return self;
}

/** A recorder: chained calls return the recorder; `on[name](...args)` sees the calls it cares about. */
function recorder(on, base = {}) {
  let self;
  const target = function () {};
  Object.assign(target, base);
  self = new Proxy(target, {
    get(t, prop) {
      if (prop === Symbol.toPrimitive) return () => '';
      if (typeof prop === 'symbol') return undefined;
      if (prop === 'then') return undefined;
      if (Object.prototype.hasOwnProperty.call(base, prop)) return base[prop];
      return (...args) => {
        const h = on[prop] || on['*'];
        const r = h ? h(prop, args) : undefined;
        return r === undefined ? self : r;
      };
    },
    apply() { return self; },
    set(t, prop, v) { base[prop] = v; return true; },
  });
  return self;
}

// ------------------------------------------------------------------------------------------------ stacks and ingredients

class MockStack {
  constructor(id, count = 1) {
    this.__stack = 'item';
    this.id = String(id);
    this.count = Number(count) || 1;
  }
  withCount(n) { return new MockStack(this.id, n); }
  withNBT() { return this; }
  withName() { return this; }
  copyWithCount(n) { return new MockStack(this.id, n); }
  getId() { return this.id; }
  getCount() { return this.count; }
  hasTag() { return false; }
  isEmpty() { return this.id === 'minecraft:air'; }
  toString() { return (this.count !== 1 ? this.count + 'x ' : '') + this.id; }
  strongNBT() { return this; }
  weakNBT() { return this; }
}

class MockIngredient {
  constructor(parts, count = 1) {
    this.__stack = 'ingredient';
    this.parts = parts;
    this.count = Number(count) || 1;
  }
  withCount(n) { return new MockIngredient(this.parts, n); }
  test() { return false; }
  // a tag's members as the scripts see them (MockIngredient.tagMembers is set by the run: the tags it has recorded so far, or one
  // placeholder for a tag of the mods, which the stand-in cannot list)
  getItemIds() {
    const ids = [];
    for (const p of this.parts) {
      const s = String(p);
      if (s.startsWith('#')) ids.push(...(MockIngredient.tagMembers(s.slice(1)) || ['(member of ' + s + ')']));
      else ids.push(s);
    }
    return javaList(ids);
  }
  toString() { return String(this.parts.join('|')); }
}

class MockFluid {
  constructor(id, amount = 1000) {
    this.__stack = 'fluid';
    this.id = String(id);
    this.amount = Number(amount) || 1000;
  }
  withAmount(n) { return new MockFluid(this.id, n); }
  getId() { return this.id; }
  getAmount() { return this.amount; }
  toString() { return this.id + ' ' + this.amount; }
}
MockIngredient.tagMembers = () => null;

/**
 * A recipe as KubeJS 6's RecipesEventJS hands it to the scripts (String(r) = "id[type]", r.json = its JSON text, r.removed), for
 * the mods' recipes a script derives its own from (originalRecipes, forEachRecipe) and for the recipes scripts added (addedRecipes).
 * `onRead(id)` sees every JSON read.
 */
function recipeWrapper(rec, onRead) {
  return {
    removed: false,
    getId: () => rec.i,
    getType: () => rec.t,
    getMod: () => rec.i.split(':')[0],
    getPath: () => rec.i.split(':')[1],
    getOrCreateId: () => rec.i,
    get id() { return rec.i; },
    get type() { return rec.t; },
    get json() {
      onRead(rec.i);
      return JSON.stringify(rec.j);
    },
    toString: () => `${rec.i}[${rec.t}]`,
  };
}

/** KubeJS recipe filter ({id, type, mod, output, input}, an array = any of them) against a recipe in dump format. */
function filterMatches(filter, rec) {
  if (filter === null || filter === undefined) return true;
  if (Array.isArray(filter)) return filter.some((f) => filterMatches(f, rec));
  const test = (want, value) => {
    if (want instanceof RegExp) return want.test(value);
    if (Array.isArray(want)) return want.some((w) => test(w, value));
    return String(want) === value;
  };
  if (filter.id !== undefined && !test(filter.id, rec.i)) return false;
  if (filter.type !== undefined && !test(filter.type, rec.t)) return false;
  if (filter.mod !== undefined && !test(filter.mod, rec.i.split(':')[0])) return false;
  if (filter.output !== undefined) {
    const out = JSON.stringify((rec.j && (rec.j.outputs || rec.j.result || rec.j.results || rec.j.output)) || '');
    if (!out.includes('"' + String(filter.output).replace(/^#/, '') + '"')) return false;
  }
  if (filter.input !== undefined) {
    const inp = JSON.stringify((rec.j && (rec.j.inputs || rec.j.ingredients || rec.j.ingredient || rec.j.key)) || '');
    if (!inp.includes('"' + String(filter.input).replace(/^#/, '') + '"')) return false;
  }
  return !(filter.not !== undefined && filterMatches(filter.not, rec));
}

function javaList(arr) {
  const l = arr.slice();
  l.add = (x) => { l.push(x); return true; };
  l.get = (i) => l[i];
  l.size = () => l.length;
  l.isEmpty = () => l.length === 0;
  l.iterator = () => { let i = 0; return { hasNext: () => i < l.length, next: () => l[i++] }; };
  l.stream = () => l;
  l.toList = () => l;
  return l;
}

const isAny = (x) => typeof x === 'function' && !(x instanceof MockStack);

/** Item ingredient argument -> [{count, ingredient: {item}|{tag}|[alternatives]}] (several for an array of ingredients). */
function itemArgs(x, problems) {
  if (x === null || x === undefined) return [];
  if (Array.isArray(x)) return x.flatMap((v) => itemArgs(v, problems));
  if (x instanceof MockStack) return [{ count: x.count, ingredient: { item: x.id } }];
  if (x instanceof MockIngredient) return [{ count: x.count, ingredient: alternatives(x.parts, problems) }];
  if (x && typeof x === 'object' && !isAny(x)) {
    if (typeof x.item === 'string' || typeof x.tag === 'string') return [{ count: Number(x.count) || 1, ingredient: x.tag ? { tag: x.tag } : { item: x.item } }];
    if (x.type === 'gtceu:sized' && x.ingredient) return [{ count: Number(x.count) || 1, ingredient: x.ingredient }];
  }
  if (typeof x === 'string' || x instanceof String) {
    let s = String(x).trim().replace(/\{.*\}$/, '');
    let count = 1;
    const m = /^(\d+)\s*x\s+(.+)$/i.exec(s);
    if (m) {
      count = Number(m[1]);
      s = m[2].trim();
    }
    if (s === '' || s === 'minecraft:air') return [];
    return [{ count, ingredient: s.startsWith('#') ? { tag: s.slice(1) } : { item: s } }];
  }
  problems.push('unreadable item ingredient: ' + typeof x);
  return [];
}

function alternatives(parts, problems) {
  const alts = parts.flatMap((p) => itemArgs(p, problems)).map((a) => a.ingredient);
  return alts.length === 1 ? alts[0] : alts;
}

/** Fluid argument -> [{amount, value: [{fluid}|{tag}]}]. */
function fluidArgs(x, problems) {
  if (x === null || x === undefined) return [];
  if (Array.isArray(x)) return x.flatMap((v) => fluidArgs(v, problems));
  if (x instanceof MockFluid) return [{ amount: x.amount, value: [{ fluid: x.id }] }];
  if (typeof x === 'string' || x instanceof String) {
    const parts = String(x).trim().split(/\s+/);
    const id = parts[0];
    const amount = Number(parts[1]) || 1000;
    return [{ amount, value: [id.startsWith('#') ? { tag: id.slice(1) } : { fluid: id }] }];
  }
  if (x && typeof x === 'object' && !isAny(x) && (x.fluid || x.tag)) return [{ amount: Number(x.amount) || 1000, value: [x.tag ? { tag: x.tag } : { fluid: x.fluid }] }];
  problems.push('unreadable fluid ingredient: ' + typeof x);
  return [];
}

/** Crafting ingredient (vanilla JSON): {item}|{tag}|[alternatives]. */
function craftIngredient(x, problems) {
  const list = itemArgs(x, problems);
  if (list.length === 0) return null;
  if (Array.isArray(x) || list.length > 1) return list.map((l) => l.ingredient).flat();
  return list[0].ingredient;
}

function resultOf(x, problems) {
  const list = itemArgs(x, problems);
  if (list.length === 0) return null;
  const first = list[0];
  return first.ingredient.item ? { item: first.ingredient.item, count: first.count } : null;
}

// ------------------------------------------------------------------------------------------------ script files

/** Files of one script type, in KubeJS 6's order: `// priority:` (higher first), then path. */
export function scriptFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.js')) out.push(p);
    }
  };
  walk(dir);
  const prio = (f) => {
    const m = /^\s*\/\/\s*priority\s*:\s*(-?\d+)/m.exec(fs.readFileSync(f, 'utf8').split('\n').slice(0, 5).join('\n'));
    return m ? Number(m[1]) : 0;
  };
  return out
    .map((f) => ({ f, p: prio(f), rel: path.relative(dir, f).split(path.sep).join('/') }))
    .sort((a, b) => b.p - a.p || (a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0))
    .map((x) => x.f);
}

const JS_BUILTINS = new Set(Object.getOwnPropertyNames(globalThis));

/** Capitalized identifiers a set of scripts reads as globals (and never declares), so they can be given inert stand-ins. */
function globalsUsed(sources) {
  const used = new Set();
  const declared = new Set();
  for (const src of sources) {
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
      .replace(/'(?:\\.|[^'\\\n])*'/g, "''").replace(/"(?:\\.|[^"\\\n])*"/g, '""').replace(/`(?:\\.|[^`\\])*`/g, '``');
    for (const m of code.matchAll(/(^|[^.\w$])([A-Z][A-Za-z0-9_$]*)\b/g)) used.add(m[2]);
    for (const m of code.matchAll(/\b(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/g)) declared.add(m[1]);
  }
  return [...used].filter((n) => !declared.has(n) && !JS_BUILTINS.has(n));
}

// ------------------------------------------------------------------------------------------------ the run

/**
 * Runs the pack's scripts (packDir = the folder with pack.toml and kubejs/). `originals` (recipes in dump format, {i, t, j}) are the
 * mods' recipes the server scripts see in event.originalRecipes and forEachRecipe: the scripts that derive recipes from GTM's (the
 * refinery, the ore plant...) only produce them with these. Returns {docs, errors, logs, handlers, lang, registry, recipeFiles,
 * removals, originalsRead}; `docs` is what makeDump takes; `originalsRead` the ids of the originals whose JSON a script read.
 */
export function runPackScripts(packDir, { originals = [] } = {}) {
  const kubejs = path.join(packDir, 'kubejs');
  const errors = [];
  const logs = [];
  const handlers = [];
  const lang = {};
  const recipeFiles = new Map();
  const originalsRead = new Set();
  const originalList = originals.map((o) => ({ i: String(o.i || o.id), t: String(o.t || o.type), j: o.j || o.json || {} }));
  const originalWrappers = originalList.map((o) => recipeWrapper(o, (id) => originalsRead.add(id)));
  const originalById = new Map(originalList.map((o) => [o.i, o]));
  let currentFile = '';

  const registry = {
    items: new Map(), // id -> {id, kind, file, block?}
    fluids: new Map(), // id -> {id, file, material?}
    blocks: new Map(),
    materials: new Map(), // name -> {name, forms:Set, file}
    modifiedMaterials: new Set(), // gtceu:<name> of GTM's own materials a script gives a form (materialModification ensureSet)
    recipeTypes: new Map(), // id -> {id, file}
    machines: new Map(), // id -> {id, kind, recipeTypes:[], file, name}
  };
  const itemTags = new Map();
  const fluidTags = new Map();
  const blockTags = new Map();
  const addTag = (map, tag, ids) => {
    const t = String(tag).replace(/^#/, '');
    if (!map.has(t)) map.set(t, new Set());
    for (const id of [].concat(ids).flat()) if (typeof id === 'string' || id instanceof String) map.get(t).add(String(id));
  };
  const removeTag = (map, tag, ids) => {
    const t = String(tag).replace(/^#/, '');
    if (!map.has(t)) return;
    for (const id of [].concat(ids).flat()) map.get(t).delete(String(id));
  };

  const readPackJson = (p) => {
    const f = path.join(packDir, String(p));
    if (!fs.existsSync(f)) return null;
    try {
      return JSON.parse(fs.readFileSync(f, 'utf8'));
    } catch {
      return null;
    }
  };

  // ---- shared stand-ins
  const any = makeAny();
  const jsonIO = {
    readJson: (p) => readPackJson(p),
    read: (p) => {
      const j = readPackJson(p);
      if (j === null || typeof j !== 'object') return null;
      return Object.assign(Object.create({ get(k) { return this[k] === undefined ? null : this[k]; } }), j);
    },
    toPrettyString: (j) => JSON.stringify(j, null, 2),
    toString: (j) => JSON.stringify(j),
    write: () => {},
    parse: (s) => JSON.parse(String(s)),
  };
  const javaClasses = {
    'java.util.ArrayList': function (init) { return javaList(init && typeof init.length === 'number' ? Array.from(init) : []); },
    'java.util.HashMap': Map,
    'java.util.concurrent.ConcurrentHashMap': Map,
    'java.lang.Math': Math,
    'java.lang.Integer': Number,
  };
  const Java = { loadClass: (name) => javaClasses[String(name)] || any, tryLoadClass: (name) => javaClasses[String(name)] || any };
  const GTValues = new Proxy({}, {
    get(t, prop) {
      if (typeof prop !== 'string') return undefined;
      const i = TIERS.indexOf(prop);
      if (i >= 0) return i;
      const iu = TIERS.map((x) => x.toUpperCase()).indexOf(prop);
      if (iu >= 0) return iu;
      if (prop === 'V' || prop === 'VA') return VOLTAGE;
      if (prop === 'VN') return TIERS.map((x) => x.toUpperCase());
      if (prop === 'VNF') return TIERS;
      if (prop === 'VLVH' || prop === 'VLVT' || prop === 'VHA') return VOLTAGE;
      return any;
    },
  });
  const console_ = {
    info: (...a) => logs.push({ level: 'info', file: currentFile, text: a.join(' ') }),
    log: (...a) => logs.push({ level: 'info', file: currentFile, text: a.join(' ') }),
    warn: (...a) => logs.push({ level: 'warn', file: currentFile, text: a.join(' ') }),
    error: (...a) => {
      logs.push({ level: 'error', file: currentFile, text: a.join(' ') });
      errors.push({ file: currentFile, stage: 'console.error', message: a.join(' ') });
    },
    debug: () => {},
  };
  const global_ = {};

  const Item = {
    exists: () => true,
    of: (id, count) => (id instanceof MockStack ? id : new MockStack(String(id).replace(/^(\d+)x\s+/, ''), count || (/^(\d+)x\s+/.exec(String(id)) || [])[1] || 1)),
    empty: new MockStack('minecraft:air', 0),
    getItem: () => any,
    getId: (x) => (x instanceof MockStack ? x.id : ''),
    isItem: (x) => x instanceof MockStack,
    getList: () => [],
    getTypeList: () => [],
  };
  const Ingredient = {
    of: (x, count) => new MockIngredient([].concat(x), count),
    all: new MockIngredient([]),
    none: new MockIngredient([]),
    isIngredient: (x) => x instanceof MockIngredient,
  };
  const Fluid = {
    exists: () => true,
    of: (id, amount) => new MockFluid(id, amount),
    empty: new MockFluid('minecraft:empty', 0),
    getType: () => any,
    water: (a) => new MockFluid('minecraft:water', a),
    lava: (a) => new MockFluid('minecraft:lava', a),
  };

  // ---- events: one listener list per (group, name, first-argument)
  const listeners = [];
  const eventGroup = (group) => new Proxy({}, {
    get(t, name) {
      if (typeof name !== 'string') return undefined;
      return (...args) => {
        const cb = args.find((a) => typeof a === 'function' && !(a instanceof MockStack));
        const key = args.filter((a) => typeof a !== 'function');
        listeners.push({ group, name, key: key.map((k) => (Array.isArray(k) ? k.map(String) : String(k))), cb, file: currentFile });
        return undefined;
      };
    },
  });
  const EVENT_GROUPS = ['StartupEvents', 'GTCEuStartupEvents', 'ServerEvents', 'ItemEvents', 'BlockEvents', 'PlayerEvents', 'EntityEvents',
    'ForgeEvents', 'ForgeModEvents', 'GTCEuServerEvents', 'ClientEvents', 'NetworkEvents', 'LevelEvents', 'CommonAddedEvents',
    'JEIEvents', 'REIEvents', 'LootJS', 'MoreJSEvents', 'GTCEuClientEvents'];

  function baseContext() {
    const ctx = {
      global: global_, console: console_, JsonIO: jsonIO, Java, GTValues, Item, Ingredient, Fluid,
      Text: any, Component: any, Utils: any, NBT: any, Platform: { isLoaded: () => true, getMods: () => any, isClientEnvironment: () => false },
    };
    for (const g of EVENT_GROUPS) ctx[g] = eventGroup(g);
    return ctx;
  }

  function runFiles(files, side) {
    const sources = files.map((f) => fs.readFileSync(f, 'utf8'));
    const ctx = baseContext();
    for (const name of globalsUsed(sources)) if (!(name in ctx)) ctx[name] = any;
    vm.createContext(ctx);
    files.forEach((f, i) => {
      currentFile = path.relative(packDir, f).split(path.sep).join('/');
      try {
        vm.runInContext(sources[i], ctx, { filename: currentFile, timeout: CALLBACK_TIMEOUT_MS });
      } catch (e) {
        errors.push({ file: currentFile, stage: side + ' load', message: String(e && e.stack ? e.stack.split('\n').slice(0, 3).join(' / ') : e) });
      }
    });
    return ctx;
  }

  function fire(ctx, l, event, stage) {
    currentFile = l.file;
    ctx.__cb = l.cb;
    ctx.__event = event;
    try {
      vm.runInContext('__cb(__event)', ctx, { timeout: CALLBACK_TIMEOUT_MS });
    } catch (e) {
      errors.push({ file: l.file, stage, message: String(e && e.stack ? e.stack.split('\n').slice(0, 3).join(' / ') : e) });
    }
  }
  const take = (group, name, key) => listeners.filter((l) => l.group === group && l.name === name && (key === undefined || l.key[0] === key));

  // ================================================================ startup
  const startupFiles = scriptFiles(path.join(kubejs, 'startup_scripts'));
  const sctx = runFiles(startupFiles, 'startup');

  // materials (GTM registers them first) and the fluids queued on them
  for (const l of take('GTCEuStartupEvents', 'registry', 'gtceu:material')) {
    fire(sctx, l, {
      create: (name) => {
        const id = String(name).includes(':') ? String(name) : 'gtceu:' + name;
        const m = { name: id, forms: new Set(), file: l.file };
        registry.materials.set(id, m);
        const form = (f) => () => { m.forms.add(f); };
        return recorder({
          dust: form('dust'), ingot: form('ingot'), gem: form('gem'), liquid: form('liquid'), gas: form('gas'), fluid: form('liquid'),
          plasma: form('plasma'), ore: form('ore'),
        });
      },
    }, 'gtceu:material registry');
  }
  const queuedFluids = [];
  sctx.GTFluidBuilder = function () {
    return recorder({ name: (p, a) => { queuedFluids.push({ name: String(a[0]), file: currentFile }); } });
  };
  // GTM's own materials: a fluid property with nothing queued yet, so a script can queue one more fluid (liquid nitrogen); a form
  // added with getProperties().ensureSet(...) (a bare GTM element such as ytterbium or rhenium) records the material as one of ours
  const fluidProperty = () => recorder({ getQueuedBuilder: () => null, get: () => null });
  const material = (name) => recorder({
    getProperty: () => fluidProperty(), hasProperty: () => true, isNull: () => false,
    getProperties: () => recorder({ ensureSet: () => { registry.modifiedMaterials.add('gtceu:' + name); } }),
  });
  const snake = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
  sctx.GTMaterials = new Proxy({}, { get: (t, prop) => (prop === 'get' ? (n) => material(String(n)) : typeof prop === 'string' ? material(snake(prop)) : undefined) });
  for (const l of take('GTCEuStartupEvents', 'materialModification')) fire(sctx, l, any, 'materialModification');
  for (const q of queuedFluids) registry.fluids.set('gtceu:' + q.name, { id: 'gtceu:' + q.name, file: q.file, queued: true });

  for (const l of take('GTCEuStartupEvents', 'registry', 'gtceu:recipe_type')) {
    fire(sctx, l, {
      create: (name) => {
        const id = String(name).includes(':') ? String(name) : 'gtceu:' + name;
        registry.recipeTypes.set(id, { id, file: l.file });
        return recorder({});
      },
    }, 'gtceu:recipe_type registry');
  }

  for (const l of take('StartupEvents', 'registry', 'block')) {
    fire(sctx, l, {
      create: (id, kind) => {
        const b = { id: String(id), kind: kind ? String(kind) : 'basic', file: l.file, item: true };
        registry.blocks.set(b.id, b);
        const itemRec = recorder({ tag: (p, a) => { addTag(itemTags, a[0], b.id); } });
        return recorder({
          noItem: () => { b.item = false; },
          item: (p, a) => { if (typeof a[0] === 'function') a[0](itemRec); },
          tagItem: (p, a) => { addTag(itemTags, a[0], b.id); },
          tagBoth: (p, a) => { addTag(itemTags, a[0], b.id); addTag(blockTags, a[0], b.id); },
          tagBlock: (p, a) => { addTag(blockTags, a[0], b.id); },
          tag: (p, a) => { addTag(blockTags, a[0], b.id); },
        });
      },
      // KubeJS's createCustom registers what the supplier builds (GCYR rocket motors): the id only, never the supplier, and no item
      createCustom: (id) => {
        registry.blocks.set(String(id), { id: String(id), kind: 'custom', file: l.file, item: false });
        return recorder({});
      },
    }, 'block registry');
  }
  for (const b of registry.blocks.values()) if (b.item) registry.items.set(b.id, { id: b.id, kind: 'block', file: b.file, block: true });

  for (const l of take('StartupEvents', 'registry', 'item')) {
    fire(sctx, l, {
      create: (id, kind) => {
        const it = { id: String(id), kind: kind ? String(kind) : 'basic', file: l.file };
        registry.items.set(it.id, it);
        return recorder({ tag: (p, a) => { addTag(itemTags, a[0], it.id); } });
      },
      createCustom: (id) => {
        registry.items.set(String(id), { id: String(id), kind: 'custom', file: l.file });
        return recorder({});
      },
    }, 'item registry');
  }
  for (const l of take('StartupEvents', 'registry', 'fluid')) {
    fire(sctx, l, {
      create: (id) => {
        const f = { id: String(id), file: l.file };
        registry.fluids.set(f.id, f);
        return recorder({});
      },
    }, 'fluid registry');
  }

  for (const l of take('GTCEuStartupEvents', 'registry', 'gtceu:machine')) {
    const pending = [];
    fire(sctx, l, {
      create: (name, kind) => {
        const m = { name: String(name), kind: kind ? String(kind) : 'simple', tiers: [], recipeTypes: [], file: l.file };
        pending.push(m);
        return recorder({
          // GTM's tiers(int...): the tiers one by one, or one array of them (Rhino passes a JS array as the varargs' int[])
          tiers: (p, a) => { m.tiers.push(...a.flat().map(Number)); },
          recipeType: (p, a) => { m.recipeTypes.push(String(a[0])); },
          recipeTypes: (p, a) => { m.recipeTypes.push(...a.flat().map(String)); },
        });
      },
    }, 'gtceu:machine registry');
    for (const m of pending) {
      const types = m.recipeTypes.map((t) => (t.includes(':') ? t : 'gtceu:' + t));
      const ids = m.tiers.length > 0 ? m.tiers.map((t) => 'gtceu:' + TIERS[t].toLowerCase() + '_' + m.name) : ['gtceu:' + m.name];
      for (const id of ids) registry.machines.set(id, { id, kind: m.kind, recipeTypes: types, file: m.file, name: m.name });
    }
  }

  // material forms GTM makes from the flags (the primary forms the pack's recipes use)
  for (const m of registry.materials.values()) {
    const [ns, name] = m.name.split(':');
    if (m.forms.has('dust') || m.forms.has('ingot') || m.forms.has('gem')) registry.items.set(`${ns}:${name}_dust`, { id: `${ns}:${name}_dust`, kind: 'material', file: m.file, material: m.name });
    if (m.forms.has('ingot')) registry.items.set(`${ns}:${name}_ingot`, { id: `${ns}:${name}_ingot`, kind: 'material', file: m.file, material: m.name });
    if (m.forms.has('gem')) registry.items.set(`${ns}:${name}_gem`, { id: `${ns}:${name}_gem`, kind: 'material', file: m.file, material: m.name });
    if (m.forms.has('ore')) registry.items.set(`${ns}:raw_${name}`, { id: `${ns}:raw_${name}`, kind: 'material', file: m.file, material: m.name, ore: true });
    if (m.forms.has('liquid') || m.forms.has('gas')) registry.fluids.set(`${ns}:${name}`, { id: `${ns}:${name}`, file: m.file, material: m.name });
  }

  // ================================================================ server
  const serverFiles = scriptFiles(path.join(kubejs, 'server_scripts'));
  const serverListenersFrom = listeners.length;
  const vctx = runFiles(serverFiles, 'server');

  for (const kind of ['item', 'fluid', 'block']) {
    const map = kind === 'item' ? itemTags : kind === 'fluid' ? fluidTags : blockTags;
    for (const l of take('ServerEvents', 'tags', kind)) {
      const wrapper = (tag) => recorder({
        add: (p, a) => { addTag(map, tag, a); },
        remove: (p, a) => { removeTag(map, tag, a); },
        removeAll: () => { if (map.has(String(tag))) map.get(String(tag)).clear(); },
        getObjectIds: () => [...(map.get(String(tag)) || [])],
      });
      fire(vctx, l, {
        add: (tag, ...ids) => { addTag(map, tag, ids); return wrapper(tag); },
        remove: (tag, ...ids) => { removeTag(map, tag, ids); return wrapper(tag); },
        removeAll: (tag) => { if (map.has(String(tag))) map.get(String(tag)).clear(); },
        removeAllTagsFrom: (...ids) => { for (const s of map.values()) for (const id of ids.flat()) s.delete(String(id)); },
        get: (tag) => wrapper(tag),
      }, 'tags ' + kind);
    }
  }

  // ---- recipes
  MockIngredient.tagMembers = (t) => (itemTags.has(t) && itemTags.get(t).size > 0 ? [...itemTags.get(t)] : null);
  const recipes = [];
  const removals = [];
  const removedOriginals = new Set();
  let auto = 0;
  const add = (rec, file) => {
    recipes.push(rec);
    recipeFiles.set(rec.i, file);
    return rec;
  };
  const liveOriginals = () => originalWrappers.filter((w) => !removedOriginals.has(w.getId()));
  const originalsMap = () => {
    const live = liveOriginals();
    const byId = new Map(live.map((w) => [w.getId(), w]));
    return {
      values: () => javaList(live),
      keySet: () => javaList([...byId.keys()]),
      get: (id) => byId.get(String(id)) || null,
      containsKey: (id) => byId.has(String(id)),
      size: () => live.length,
      forEach: (fn) => live.forEach((w) => fn(w.getId(), w)),
    };
  };
  // the recipes scripts added so far, as KubeJS lists them (an iterator's remove() drops one, as integration/hidden.js does)
  const addedList = () => {
    const live = recipes.filter((r) => !r.dropped);
    const wrappers = live.map((r) => recipeWrapper(r, () => {}));
    const l = javaList(wrappers);
    l.iterator = () => {
      let i = 0;
      return { hasNext: () => i < live.length, next: () => wrappers[i++], remove: () => { live[i - 1].dropped = true; } };
    };
    return l;
  };

  function gtBuilder(type, rawId, file) {
    const problems = [];
    let id = String(rawId || `kubejs:${type.split(':')[1]}/auto_${++auto}`);
    if (id.includes(':')) {
      const [ns, p] = id.split(':');
      id = `${ns}:${type.split(':')[1]}/${p}`;
    }
    const j = { type, inputs: { item: [], fluid: [] }, outputs: { item: [], fluid: [] }, tickInputs: { eu: [] }, tickOutputs: { eu: [] }, recipeConditions: [] };
    const rec = { i: id, t: type, a: 1, j, problems };
    const itemIn = (x, chance = 10000) => itemArgs(x, problems).forEach((c) => j.inputs.item.push({ content: { type: 'gtceu:sized', count: c.count, ingredient: c.ingredient }, chance, maxChance: 10000, tierChanceBoost: 0 }));
    const itemOut = (x, chance = 10000) => itemArgs(x, problems).forEach((c) => j.outputs.item.push({ content: { type: 'gtceu:sized', count: c.count, ingredient: c.ingredient }, chance, maxChance: 10000, tierChanceBoost: 0 }));
    const fluidIn = (x, chance = 10000) => fluidArgs(x, problems).forEach((c) => j.inputs.fluid.push({ content: c, chance, maxChance: 10000, tierChanceBoost: 0 }));
    const fluidOut = (x, chance = 10000) => fluidArgs(x, problems).forEach((c) => j.outputs.fluid.push({ content: c, chance, maxChance: 10000, tierChanceBoost: 0 }));
    const cond = (type2) => (p, a) => { j.recipeConditions.push({ type: type2, args: a.map((x) => (typeof x === 'object' || typeof x === 'function' ? String(x) : x)) }); };
    const self = recorder({
      itemInputs: (p, a) => { a.forEach((x) => itemIn(x)); },
      inputItems: (p, a) => { a.forEach((x) => itemIn(x)); },
      notConsumable: (p, a) => { a.forEach((x) => itemIn(x, 0)); },
      chancedInput: (p, a) => { itemIn(a[0], Number(a[1])); },
      itemOutputs: (p, a) => { a.forEach((x) => itemOut(x)); },
      outputItems: (p, a) => { a.forEach((x) => itemOut(x)); },
      chancedOutput: (p, a) => { itemOut(a[0], Number(a[1])); },
      inputFluids: (p, a) => { a.forEach((x) => fluidIn(x)); },
      fluidInputs: (p, a) => { a.forEach((x) => fluidIn(x)); },
      notConsumableFluid: (p, a) => { a.forEach((x) => fluidIn(x, 0)); },
      chancedFluidInput: (p, a) => { fluidIn(a[0], Number(a[1])); },
      outputFluids: (p, a) => { a.forEach((x) => fluidOut(x)); },
      fluidOutputs: (p, a) => { a.forEach((x) => fluidOut(x)); },
      chancedFluidOutput: (p, a) => { fluidOut(a[0], Number(a[1])); },
      circuit: (p, a) => { j.inputs.item.push({ content: { type: 'gtceu:circuit', configuration: Number(a[0]) }, chance: 0, maxChance: 10000, tierChanceBoost: 0 }); },
      EUt: (p, a) => {
        const v = Number(a[0]);
        if (v < 0) j.tickOutputs.eu.push({ content: -v, chance: 10000, maxChance: 10000, tierChanceBoost: 0 });
        else j.tickInputs.eu.push({ content: v, chance: 10000, maxChance: 10000, tierChanceBoost: 0 });
      },
      dimension: (p, a) => { j.recipeConditions.push({ type: 'dimension', dimension: String(a[0]), reverse: !!a[1] }); },
      daytime: cond('daytime'), rain: cond('rain'), thunder: cond('thunder'), posY: cond('pos_y'), cleanroom: cond('cleanroom'),
      biome: cond('biome'), environmentalHazard: cond('environmental_hazard'),
      researchWithoutRecipe: (p, a) => { j.recipeConditions.push({ type: 'research', research: String(a[0]) }); },
      id: (p, a) => { rec.i = String(a[0]); },
    }, { __recipe: rec });
    add(rec, file);
    return self;
  }

  function vanilla(type, json, file) {
    const rec = { i: `kubejs:auto/${type.split(':')[1]}_${++auto}`, t: type, a: 1, j: Object.assign({ type }, json), problems: [] };
    add(rec, file);
    return recorder({ id: (p, a) => { recipeFiles.delete(rec.i); rec.i = String(a[0]); recipeFiles.set(rec.i, file); } }, { __recipe: rec });
  }

  function shapedJson(output, pattern, key, problems) {
    const k = {};
    for (const [s, v] of Object.entries(key || {})) {
      const ing = craftIngredient(v, problems);
      if (ing !== null) k[s] = ing;
    }
    return { pattern: [].concat(pattern).map(String), key: k, result: resultOf(output, problems) };
  }

  for (const l of take('ServerEvents', 'recipes')) {
    const file = l.file;
    const problems = [];
    const typed = (ns) => new Proxy({}, {
      get(t, type) {
        if (typeof type !== 'string') return undefined;
        const full = ns + ':' + type;
        if (ns === 'gtceu' && type === 'shaped') {
          return (out, pattern, key) => vanilla('minecraft:crafting_shaped', shapedJson(out, pattern, key, problems), file);
        }
        if (ns === 'gtceu' && type === 'shapeless') {
          return (out, ings) => vanilla('minecraft:crafting_shapeless', { ingredients: [].concat(ings).map((x) => craftIngredient(x, problems)).filter(Boolean), result: resultOf(out, problems) }, file);
        }
        if (ns === 'gtceu') return (rid) => gtBuilder(full, rid, file);
        if (ns === 'minecraft' || ns === 'kubejs') return (...a) => event[type](...a);
        return (...a) => vanilla(full, { args: a.map((x) => (typeof x === 'function' ? null : x)) }, file);
      },
    });
    const event = {
      recipes: new Proxy({}, { get: (t, ns) => (typeof ns === 'string' ? typed(ns) : undefined) }),
      shaped: (out, pattern, key) => vanilla('minecraft:crafting_shaped', shapedJson(out, pattern, key, problems), file),
      shapeless: (out, ings) => vanilla('minecraft:crafting_shapeless', { ingredients: [].concat(ings).map((x) => craftIngredient(x, problems)).filter(Boolean), result: resultOf(out, problems) }, file),
      smelting: (out, input) => vanilla('minecraft:smelting', { ingredient: craftIngredient(input, problems), result: (resultOf(out, problems) || {}).item }, file),
      blasting: (out, input) => vanilla('minecraft:blasting', { ingredient: craftIngredient(input, problems), result: (resultOf(out, problems) || {}).item }, file),
      smoking: (out, input) => vanilla('minecraft:smoking', { ingredient: craftIngredient(input, problems), result: (resultOf(out, problems) || {}).item }, file),
      campfireCooking: (out, input) => vanilla('minecraft:campfire_cooking', { ingredient: craftIngredient(input, problems), result: (resultOf(out, problems) || {}).item }, file),
      stonecutting: (out, input) => vanilla('minecraft:stonecutting', { ingredient: craftIngredient(input, problems), result: (resultOf(out, problems) || {}).item, count: (resultOf(out, problems) || {}).count || 1 }, file),
      smithing: (out, template, base, addition) => vanilla('minecraft:smithing_transform', { template: craftIngredient(template, problems), base: craftIngredient(base, problems), addition: craftIngredient(addition, problems), result: resultOf(out, problems) }, file),
      custom: (json) => {
        const j = JSON.parse(JSON.stringify(json, (k, v) => (v instanceof MockStack ? { item: v.id, count: v.count } : typeof v === 'function' ? undefined : v)));
        const type = String(j.type || 'kubejs:custom');
        return vanilla(type, j, file);
      },
      remove: (filter) => {
        removals.push({ file, filter: JSON.stringify(filter, (k, v) => (v instanceof RegExp ? String(v) : v)) });
        for (const o of originalList) if (filterMatches(filter, o)) removedOriginals.add(o.i);
      },
      replaceInput: () => {},
      replaceOutput: () => {},
      forEachRecipe: (filter, fn) => { for (const w of liveOriginals()) if (filterMatches(filter, originalById.get(w.getId()))) fn(w); },
      findRecipes: (filter) => javaList(liveOriginals().filter((w) => filterMatches(filter, originalById.get(w.getId())))),
      findRecipeIds: (filter) => javaList(originalList.filter((o) => !removedOriginals.has(o.i) && filterMatches(filter, o)).map((o) => o.i)),
      containsRecipe: (filter) => originalList.some((o) => !removedOriginals.has(o.i) && filterMatches(filter, o)),
      countRecipes: (filter) => originalList.filter((o) => !removedOriginals.has(o.i) && filterMatches(filter, o)).length,
      stage: () => {},
      get originalRecipes() { return originalsMap(); },
      get addedRecipes() { return addedList(); },
    };
    fire(vctx, l, event, 'recipes');
    for (const p of problems) errors.push({ file, stage: 'recipes (stand-in)', message: p });
  }
  for (const r of recipes) for (const p of r.problems) errors.push({ file: recipeFiles.get(r.i), stage: 'recipe ' + r.i, message: p });

  // world mechanics: handlers of player/world events, with the items or blocks they filter on
  for (const l of listeners.slice(serverListenersFrom)) {
    if (['ItemEvents', 'BlockEvents', 'PlayerEvents', 'EntityEvents'].includes(l.group)) {
      handlers.push({ group: l.group, name: l.name, filter: l.key, file: l.file });
    }
  }

  // ================================================================ client (translations only)
  const clientFiles = scriptFiles(path.join(kubejs, 'client_scripts'));
  const cctx = runFiles(clientFiles, 'client');
  for (const l of take('ClientEvents', 'lang')) {
    const language = l.key[0] || 'en_us';
    lang[language] = lang[language] || {};
    fire(cctx, l, {
      add: (...a) => {
        if (a.length >= 3) lang[language][String(a[1])] = String(a[2]);
        else if (a.length === 2 && typeof a[0] === 'object') Object.assign(lang[language], a[0]);
        else lang[language][String(a[0])] = String(a[1]);
      },
      addAll: (...a) => { const o = a[a.length - 1]; if (o && typeof o === 'object') Object.assign(lang[language], o); },
      renameItem: () => {}, renameBlock: () => {},
    }, 'lang ' + language);
  }
  for (const language of ['en_us', 'es_es']) {
    const dir = path.join(kubejs, 'assets');
    if (!fs.existsSync(dir)) continue;
    for (const ns of fs.readdirSync(dir)) {
      const f = path.join(dir, ns, 'lang', language + '.json');
      if (fs.existsSync(f)) {
        lang[language] = lang[language] || {};
        Object.assign(lang[language], JSON.parse(fs.readFileSync(f, 'utf8')));
      }
    }
  }

  // ================================================================ as a dump
  const tagsDoc = { item: {}, fluid: {} };
  for (const [t, s] of itemTags) tagsDoc.item[t] = [...s];
  for (const [t, s] of fluidTags) tagsDoc.fluid[t] = [...s];
  const items = new Set([...registry.items.keys(), ...registry.machines.keys()]);
  const docs = {
    recipes: { recipes: recipes.filter((r) => !r.dropped).map((r) => ({ i: r.i, t: r.t, a: 1, j: r.j })) },
    items: { items: [...items], fluids: [...registry.fluids.keys()] },
    tags: tagsDoc,
    machines: {
      machines: [...registry.machines.values()].map((m) => ({ id: m.id, recipeTypes: m.recipeTypes })),
      recipeTypes: [...registry.recipeTypes.values()].map((t) => ({ id: t.id })),
    },
    structures: { structures: JSON.parse(JSON.stringify((global_.grindless && global_.grindless.structures) || {}, (k, v) => (typeof v === 'function' ? undefined : v))) },
    info: { format: 'gg-static-1', source: 'tools/analysis/lib/kubejs_static.mjs' },
  };
  return { docs, errors, logs, handlers, lang, registry, recipeFiles, removals, blockTags, originalsRead, global: global_ };
}

/** The pack's static dump (lib/dump.mjs format) plus what the stand-in learned on the way. */
export function staticDump(packDir, opts = {}) {
  const run = runPackScripts(packDir, opts);
  const dump = makeDump('(static: ' + packDir + ')', run.docs);
  return { dump, run };
}
