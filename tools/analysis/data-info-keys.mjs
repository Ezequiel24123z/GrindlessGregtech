// AF-L: every recipe info line of ours must render English. The startup scripts register data-info callbacks (type.addDataInfo(fn)); each
// reads a recipe's data and returns Text.translate('gtceu.recipe.<key>.<value>'). This runs those registered callbacks on the recipes'
// native data (the dump's recipes.json, field j.data) and reports every pack-owned translation key they ask for that the effective en_us
// does not define.
//   node tools/analysis/data-info-keys.mjs --dump <dir> [--pack <dir>]
// Exit 0 = every requested pack-owned key resolves, 1 = unresolved keys, 2 = tool failure.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { makeAny, runPackScripts, scriptFiles } from './lib/kubejs_static.mjs';

const OWNED = /^(gtceu\.recipe\.grindless_|emi\.grindless\.|grindless\.)/;
const CALLBACK_TIMEOUT_MS = 2000;

const JS_BUILTINS = new Set(Object.getOwnPropertyNames(globalThis));

function capitalizedGlobals(sources) {
  const used = new Set();
  const declared = new Set();
  for (const src of sources) {
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
      .replace(/'(?:\\.|[^'\\\n])*'/g, "''").replace(/"(?:\\.|[^"\\\n])*"/g, '""');
    for (const m of code.matchAll(/(^|[^.\w$])([A-Z][A-Za-z0-9_$]*)\b/g)) used.add(m[2]);
    for (const m of code.matchAll(/\b(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/g)) declared.add(m[1]);
  }
  return [...used].filter((n) => !declared.has(n) && !JS_BUILTINS.has(n));
}

/** Data-info callbacks the startup scripts register: Map(recipe type id -> [{fn, file}]). The air and wrap callbacks are not ours to evaluate. */
export function registeredDataInfos(packDir) {
  const startupDir = path.join(packDir, 'kubejs', 'startup_scripts');
  const files = scriptFiles(startupDir).filter((f) => !f.endsWith('recipe_info_wrap.js'));
  const sources = files.map((f) => fs.readFileSync(f, 'utf8'));
  const any = makeAny();
  const infos = new Map();
  const listeners = [];
  const group = new Proxy({}, {
    get: (t, name) => (...args) => {
      const cb = args.find((a) => typeof a === 'function');
      listeners.push({ name: String(name), key: args.filter((a) => typeof a !== 'function').map(String), cb, file: currentFile });
    },
  });
  let currentFile = '';
  const ctx = {
    global: {}, console: { info() {}, log() {}, warn() {}, error() {}, debug() {} },
    Platform: { isLoaded: () => true, getMods: () => any, isClientEnvironment: () => false },
    Text: { translate: (k) => ({ getString: () => String(k) }) },
    GTRecipeTypes: {
      get: (id) => {
        const key = String(id).includes(':') ? String(id) : 'gtceu:' + id;
        return new Proxy(any, {
          get: (t, p) => (p === 'addDataInfo'
            ? (fn) => { if (!infos.has(key)) infos.set(key, []); infos.get(key).push({ fn, file: currentFile }); }
            : t[p]),
        });
      },
    },
  };
  for (const g of ['StartupEvents', 'GTCEuStartupEvents', 'ServerEvents', 'ClientEvents', 'ForgeEvents', 'ForgeModEvents', 'GTCEuServerEvents', 'GTCEuClientEvents']) ctx[g] = group;
  for (const n of capitalizedGlobals(sources)) if (!(n in ctx)) ctx[n] = any;
  vm.createContext(ctx);
  files.forEach((f, i) => {
    currentFile = path.relative(packDir, f).split(path.sep).join('/');
    try { vm.runInContext(sources[i], ctx, { filename: currentFile, timeout: CALLBACK_TIMEOUT_MS }); } catch { /* a script the stand-in cannot load registers nothing */ }
  });
  for (const l of listeners.filter((x) => x.name === 'registry' && x.key[0] === 'gtceu:machine')) {
    currentFile = l.file;
    ctx.__cb = l.cb;
    try { vm.runInContext('__cb(__event)', Object.assign(ctx, { __event: any }), { timeout: CALLBACK_TIMEOUT_MS }); } catch { /* the registration order may still have added its infos */ }
  }
  return { infos, ctx };
}

const dataOf = (obj) => {
  const o = obj || {};
  const has = (k) => Object.prototype.hasOwnProperty.call(o, k);
  return {
    getString: (k) => (has(k) ? String(o[k]) : ''),
    getInt: (k) => (has(k) ? Number(o[k]) || 0 : 0),
    getLong: (k) => (has(k) ? Number(o[k]) || 0 : 0),
    getDouble: (k) => (has(k) ? Number(o[k]) || 0 : 0),
    getFloat: (k) => (has(k) ? Number(o[k]) || 0 : 0),
    getByte: (k) => (has(k) ? Number(o[k]) || 0 : 0),
    getBoolean: (k) => (has(k) ? Boolean(o[k]) : false),
    contains: (k) => has(k),
    getAllKeys: () => Object.keys(o),
  };
};

/**
 * Runs every registered callback on the native data of the recipes of its type. Returns {missing: Map(key -> {types, sample}), evaluations,
 * errors}. `recipes` are dump entries {i, t, j}; `lang` is the effective en_us map.
 */
export function unresolvedDataInfoKeys({ packDir, recipes, lang }) {
  const { infos, ctx } = registeredDataInfos(packDir);
  const asked = [];
  ctx.Text = { translate: (k) => { asked.push(String(k)); return { getString: () => String(k) }; } };
  ctx.Component = ctx.Text;
  const missing = new Map();
  let evaluations = 0;
  let errors = 0;
  for (const r of recipes) {
    const list = infos.get(String(r.t));
    if (!list) continue;
    const data = dataOf(r.j && r.j.data);
    for (const { fn } of list) {
      asked.length = 0;
      evaluations++;
      try {
        ctx.__fn = fn;
        ctx.__data = data;
        vm.runInContext('__fn(__data)', ctx, { timeout: CALLBACK_TIMEOUT_MS });
      } catch { errors++; }
      for (const k of asked) {
        if (!OWNED.test(k) || lang[k] !== undefined) continue;
        if (!missing.has(k)) missing.set(k, { types: new Set(), sample: r.i });
        missing.get(k).types.add(String(r.t));
      }
    }
  }
  return { missing, evaluations, errors, types: infos.size };
}

export function loadDumpRecipes(dumpDir) {
  return JSON.parse(fs.readFileSync(path.join(dumpDir, 'recipes.json'), 'utf8')).recipes;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
  const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
  const packDir = arg('--pack') ? path.resolve(arg('--pack')) : path.join(repo, 'pack');
  const dump = arg('--dump') || process.env.GG_DUMP;
  if (!dump) { console.log('data-info-keys: tool failure: pass --dump <dir> or set GG_DUMP'); process.exit(2); }
  try {
    const lang = runPackScripts(packDir).lang.en_us || {};
    const res = unresolvedDataInfoKeys({ packDir, recipes: loadDumpRecipes(dump), lang });
    console.log(`${res.missing.size ? 'FAIL' : 'ok  '} data-info-keys: ${res.types} types, ${res.evaluations} callback evaluations, ${res.errors} callback errors, ${res.missing.size} unresolved pack-owned keys`);
    for (const [k, v] of [...res.missing].sort()) console.log(`     ${k}  (${[...v.types].join(', ')}; e.g. ${v.sample})`);
    process.exit(res.missing.size ? 1 : 0);
  } catch (e) {
    console.log('data-info-keys: tool failure: ' + String(e && e.stack ? e.stack : e).slice(0, 400));
    process.exit(2);
  }
}
