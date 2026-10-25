// Static checks of our own assets, no game needed (they would have caught the Large Steam family's bare faces, which only the
// gallery client test found):
//   1. every overlay directory a machine of our startup scripts points its model at has the textures GTM reads. GTM's WorkableOverlays
//      draws nothing for a missing file, so a missing overlay silently leaves bare casing. A controller's grindless:block/multiblock/<x>
//      needs overlay_front.png and overlay_front_active.png; a single-block machine's grindless:block/machines/<x>, at least one
//      overlay_<face>.png. Every multiblock sets such a model, our base casing textures exist, and every animated strip has its .mcmeta;
//   2. every en_us key of our lang files (pack/kubejs/client_scripts/grindless/*_lang.js and pack/kubejs/assets/*/lang/en_us.json) has
//      an es_es entry in them.
// The scripts run in a node:vm sandbox in which every KubeJS or GTM binding is a stand-in that records the calls made on it, so overlay
// paths built in loops ('grindless:block/multiblock/' + m.id) and lang keys added through helpers are read as the game reads them.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const KUBEJS = path.join(ROOT, 'pack', 'kubejs');
const STARTUP = path.join(KUBEJS, 'startup_scripts', 'grindless');
const CLIENT = path.join(KUBEJS, 'client_scripts', 'grindless');
const ASSETS = path.join(KUBEJS, 'assets');

const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith('.js')) out.push(p);
  }
  return out;
}

// KubeJS's load order: higher `// priority:` first, then the path.
function kubejsOrder(files) {
  const prio = (f) => {
    const m = /^\s*\/\/\s*priority\s*:\s*(-?\d+)/m.exec(fs.readFileSync(f, 'utf8').split('\n').slice(0, 5).join('\n'));
    return m ? Number(m[1]) : 0;
  };
  return files.map((f) => ({ f, p: prio(f) })).sort((a, b) => b.p - a.p || (a.f < b.f ? -1 : a.f > b.f ? 1 : 0)).map((x) => x.f);
}

// ---------------------------------------------------------------- the sandbox

// A stand-in for anything the scripts get from KubeJS, GTM or Minecraft: every property is another stand-in, every call returns one
// (a builder's calls return the builder itself, so chains keep recording), and it turns into '' or 0 where a primitive is needed.
function makeStandIns(onCall) {
  const hidden = new Set(['then', 'toJSON', 'constructor', 'prototype', '__proto__']);
  function standIn(owner) {
    const fn = function () {};
    return new Proxy(fn, {
      get(t, prop) {
        if (prop === Symbol.toPrimitive) return (hint) => (hint === 'number' ? 0 : '');
        if (typeof prop === 'symbol' || hidden.has(prop)) return undefined;
        if (prop === 'toString' || prop === 'valueOf') return () => '';
        if (prop === 'length' || prop === 'size') return 0;
        return new Proxy(function () {}, {
          apply(_t, _this, args) {
            onCall(owner, prop, args);
            return owner ? owner.proxy : standIn(null);
          },
          get(_t, p2) {
            if (p2 === Symbol.toPrimitive) return (hint) => (hint === 'number' ? 0 : '');
            if (typeof p2 === 'symbol' || hidden.has(p2)) return undefined;
            return standIn(null);
          },
        });
      },
      apply() { return standIn(null); },
      construct() { return standIn(null); },
      set() { return true; },
      has() { return false; },
      ownKeys() { return []; },
      getOwnPropertyDescriptor() { return undefined; },
    });
  }
  function builder(info) {
    const owner = { ...info, calls: [] };
    owner.proxy = standIn(owner);
    return owner;
  }
  return { standIn, builder };
}

// Runs our startup scripts (registries included) and client lang scripts; returns the machine builders with their calls, the lang
// entries per language and every error met on the way.
function evaluateScripts() {
  const errors = [];
  const builders = [];
  const registries = [];
  const langs = [];
  const entries = { en_us: new Map(), es_es: new Map() };
  let currentFile = '';
  // a tiered builder ('simple', 'generator') sets its model inside .definition((tier, builder) => ...): run it on the same builder
  const onCall = (owner, method, args) => {
    if (!owner) return;
    owner.calls.push({ method, args });
    if (method !== 'definition') return;
    for (const fn of args) {
      if (typeof fn !== 'function') continue;
      try { fn(1, owner.proxy); } catch (e) { errors.push(`${owner.file} (gtceu:${owner.id} definition): ${e && e.message}`); }
    }
  };
  const { standIn, builder } = makeStandIns(onCall);

  const shared = {};
  const context = vm.createContext({ console: { log() {}, info() {}, warn() {}, error() {}, debug() {} } });
  const realGlobals = vm.runInContext('globalThis', context);
  // KubeJS paths are relative to the game directory, which is pack/ in this repository
  const gameFile = (p) => path.join(ROOT, 'pack', ...String(p).split(/[\\/]/));
  const bindings = {
    global: shared,
    JsonIO: {
      readJson(p) { const f = gameFile(p); return fs.existsSync(f) ? { text: fs.readFileSync(f, 'utf8') } : null; },
      toPrettyString(json) { return json && typeof json.text === 'string' ? json.text : JSON.stringify(json); },
      read(p) {
        const f = gameFile(p);
        if (!fs.existsSync(f)) return null;
        const obj = JSON.parse(fs.readFileSync(f, 'utf8'));
        return Object.assign(obj, { get: (k) => obj[k] });
      },
      write() {},
    },
    GTCEuStartupEvents: {
      registry(type, cb) { registries.push({ type: String(type), cb, file: currentFile }); },
      materialModification() {}, materialModifications() {}, craftingComponents() {}, oreVeins() {}, fluidVeins() {}, bedrockOreVeins() {},
    },
    StartupEvents: { registry(type, cb) { registries.push({ type: String(type), cb, file: currentFile }); }, init() {}, postInit() {} },
    ClientEvents: { lang(lang, cb) { langs.push({ lang: String(lang), cb, file: currentFile }); } },
  };
  const scope = new Proxy({}, {
    has: (_t, name) => typeof name === 'string',
    get(_t, name) {
      if (name === Symbol.unscopables || typeof name === 'symbol') return undefined;
      if (Object.prototype.hasOwnProperty.call(bindings, name)) return bindings[name];
      if (name in realGlobals) return realGlobals[name];
      bindings[name] = standIn(null);
      return bindings[name];
    },
    set(_t, name, value) { bindings[name] = value; return true; },
  });
  context.__scope = scope;

  const run = (file) => {
    currentFile = rel(file);
    const src = fs.readFileSync(file, 'utf8');
    try {
      vm.runInContext(`with (__scope) {\n${src}\n}`, context, { filename: file });
    } catch (e) {
      errors.push(`${currentFile}: ${e && e.message}`);
    }
  };

  kubejsOrder(walk(STARTUP)).forEach(run);
  const order = ['gtceu:element', 'gtceu:material', 'gtceu:recipe_category', 'gtceu:recipe_type', 'block', 'item', 'fluid', 'gtceu:machine'];
  const rank = (t) => (order.includes(t) ? order.indexOf(t) : order.length);
  for (const r of registries.slice().sort((a, b) => rank(a.type) - rank(b.type))) {
    const event = r.type === 'gtceu:machine'
      ? {
        create(id, type) {
          const b = builder({ id: String(id), type: type === undefined ? 'default' : String(type), file: r.file });
          builders.push(b);
          return b.proxy;
        },
      }
      : standIn(null);
    try { r.cb(event); } catch (e) { errors.push(`${r.file} (${r.type} registry): ${e && e.message}`); }
  }

  fs.readdirSync(CLIENT).filter((n) => n.endsWith('_lang.js')).sort().forEach((n) => run(path.join(CLIENT, n)));
  for (const l of langs) {
    const map = entries[l.lang] || (entries[l.lang] = new Map());
    const put = (key, value) => { if (!map.has(String(key))) map.set(String(key), { value: String(value), file: l.file }); };
    const event = {
      add(a, b, c) { if (c === undefined) put(a, b); else put(b, c); },
      addAll(a, b) {
        const obj = b === undefined ? a : b;
        if (obj && typeof obj === 'object') for (const [k, v] of Object.entries(obj)) put(k, v);
      },
      renameItem() {}, renameBlock() {}, renameEntity() {}, renameBiome() {},
    };
    try { l.cb(event); } catch (e) { errors.push(`${l.file} (${l.lang} lang): ${e && e.message}`); }
  }
  return { builders, entries, errors };
}

// ---------------------------------------------------------------- textures

const MODEL_CALL = /(Model|Renderer)$/;
const textureFile = (rl, suffix = '.png') => {
  const [ns, p] = rl.split(':');
  return path.join(ASSETS, ns, 'textures', ...p.split('/')) + suffix;
};

// (width, height) from a PNG's IHDR chunk
function pngSize(file) {
  const b = fs.readFileSync(file);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

// The overlay directories (last string argument) and base textures (other grindless:block/ strings) of every model call.
function modelRefs(builders) {
  const refs = [];
  for (const b of builders) {
    for (const c of b.calls) {
      if (!MODEL_CALL.test(c.method)) continue;
      const strings = c.args.filter((a) => typeof a === 'string');
      if (strings.length === 0) continue;
      const dir = strings[strings.length - 1];
      refs.push({ machine: b.id, file: b.file, method: c.method, dir, bases: strings.slice(0, -1) });
    }
  }
  return refs;
}

let cached = null;
const evaluated = () => (cached || (cached = evaluateScripts()));

test('our startup and lang scripts run in the sandbox', () => {
  const { builders, errors } = evaluated();
  assert.deepEqual(errors, [], `scripts that failed in the sandbox (their references would go unchecked):\n  ${errors.join('\n  ')}`);
  const multis = builders.filter((b) => b.type === 'multiblock');
  assert.ok(multis.length >= 60, `only ${multis.length} multiblocks found in pack/kubejs/startup_scripts/grindless: the sandbox missed some`);
});

test('every multiblock of ours sets a model with its own overlay directory', () => {
  const { builders } = evaluated();
  const bare = builders.filter((b) => b.type === 'multiblock' && !b.calls.some((c) => MODEL_CALL.test(c.method)
    && c.args.some((a) => typeof a === 'string')))
    .map((b) => `gtceu:${b.id} (${b.file})`);
  assert.deepEqual(bare, [], `multiblocks without an overlay model:\n  ${bare.join('\n  ')}`);
});

test('every overlay directory our machines use has its textures', () => {
  const refs = modelRefs(evaluated().builders);
  assert.ok(refs.length > 0, 'no overlay model call found');
  const problems = [];
  const seen = new Set();
  for (const r of refs) {
    for (const base of r.bases) {
      if (base.startsWith('grindless:') && !fs.existsSync(textureFile(base))) {
        problems.push(`gtceu:${r.machine} (${r.file}): base texture ${base} has no ${rel(textureFile(base))}`);
      }
    }
    if (!r.dir.startsWith('grindless:') || seen.has(r.dir)) continue;
    seen.add(r.dir);
    const dir = textureFile(r.dir, '');
    const has = (name) => fs.existsSync(path.join(dir, name));
    if (/^grindless:block\/multiblock\//.test(r.dir)) {
      for (const name of ['overlay_front.png', 'overlay_front_active.png']) {
        if (!has(name)) problems.push(`gtceu:${r.machine} (${r.file}, ${r.method}): ${rel(path.join(dir, name))} is missing`);
      }
    } else {
      const overlays = fs.existsSync(dir) ? fs.readdirSync(dir).filter((n) => /^overlay_[a-z_]+\.png$/.test(n)) : [];
      if (overlays.length === 0) problems.push(`gtceu:${r.machine} (${r.file}, ${r.method}): no overlay_<face>.png in ${rel(dir)}`);
    }
  }
  assert.deepEqual(problems, [], `overlay textures missing (GTM would show bare casing):\n  ${problems.join('\n  ')}`);
});

test('every animated overlay strip of ours has its .mcmeta', () => {
  const dirs = new Set(modelRefs(evaluated().builders).filter((r) => r.dir.startsWith('grindless:')).map((r) => textureFile(r.dir, '')));
  const problems = [];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir).filter((n) => n.endsWith('.png'))) {
      const file = path.join(dir, name);
      const { w, h } = pngSize(file);
      if (h > w && !fs.existsSync(file + '.mcmeta')) problems.push(`${rel(file)} is a ${w}x${h} strip without ${name}.mcmeta`);
      if (h % w !== 0) problems.push(`${rel(file)} is ${w}x${h}: not a whole number of square frames`);
    }
  }
  assert.deepEqual(problems, [], problems.join('\n'));
});

test('every en_us key of our lang files has an es_es entry', () => {
  const { entries } = evaluated();
  const en = new Map(entries.en_us);
  const es = new Map(entries.es_es);
  for (const ns of fs.readdirSync(ASSETS)) {
    const dir = path.join(ASSETS, ns, 'lang');
    for (const [lang, map] of [['en_us', en], ['es_es', es]]) {
      const file = path.join(dir, `${lang}.json`);
      if (!fs.existsSync(file)) continue;
      for (const [k, v] of Object.entries(JSON.parse(fs.readFileSync(file, 'utf8')))) if (!map.has(k)) map.set(k, { value: v, file: rel(file) });
    }
  }
  assert.ok(en.size >= 500, `only ${en.size} en_us keys found: the sandbox missed lang entries`);
  const missing = [...en.entries()].filter(([k]) => !es.has(k)).map(([k, v]) => `${k} (${v.file})`).sort();
  assert.deepEqual(missing, [], `en_us keys without an es_es entry:\n  ${missing.join('\n  ')}`);
});
