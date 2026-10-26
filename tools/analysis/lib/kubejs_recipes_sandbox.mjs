// A stand-in for KubeJS's ServerEvents.recipes, to run the pack's composing server scripts (lib/compose.js and the plants that use it)
// on recipes read from a native dump, in Node. It gives the scripts what they read: global.grindless (with readJsonTable over pack/),
// Item.exists, Fluid.exists, Fluid.of, an event whose originalRecipes hold the given recipes (toString() "<id>[<type>]", .json the
// recipe's JSON text, as KubeJS gives them) and whose event.recipes.gtceu.<type>(id) builders record every call (event.custom(json).id(id)
// records { type, id, json }).
//
//   runServerScripts({ packRoot, scripts: [paths relative to pack/], recipes: { id: json }, startup: [paths], items, fluids, before })
//     -> { G, built: [{ type, id, calls: [[method, ...args]] }], logs: [[level, message]] } (G and built as plain JSON copies)
//   items / fluids: predicates for Item.exists / Fluid.exists (default: any id of gtceu, gtnn, grindless or minecraft; GTM's fluids
//   are gtceu:*, but water is minecraft:water). startup: startup scripts to run first with their registries stubbed (only what they
//   publish in global.grindless is kept). before(sandbox): a hook to adjust the sandbox before the scripts run.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const anyId = (id) => /^(gtceu|gtnn|grindless|minecraft):/.test(id);
const anyFluid = (id) => (id.startsWith('gtceu:') && id !== 'gtceu:water') || id === 'minecraft:water';

function recorder(type, id, built) {
  const entry = { type, id, calls: [] };
  built.push(entry);
  const proxy = new Proxy({}, {
    get(_, method) {
      if (method === 'toString') return () => `${id}[${type}]`;
      return (...args) => {
        entry.calls.push([String(method), ...args]);
        return proxy;
      };
    },
  });
  return proxy;
}

// lib/patterns.js-like stubs for the startup scripts: every helper returns plain data
function patternStubs() {
  const stub = (kind) => (...args) => ({ kind, args });
  return {
    controller: stub('controller'), block: stub('block'), part: stub('part'), oneOf: stub('oneOf'), frame: stub('frame'), air: stub('air'),
    register() {}, build() {},
  };
}

export function runServerScripts({ packRoot, scripts, recipes, startup = [], items = anyId, fluids = anyFluid, before } = {}) {
  const logs = [];
  const built = [];
  const handlers = [];
  const log = (level) => (...m) => logs.push([level, m.map(String).join(' ')]);
  const G = {
    readJsonTable: (p) => JSON.parse(fs.readFileSync(path.join(packRoot, p), 'utf8')),
    patterns: patternStubs(),
    parallelHatch: { part: () => ({ kind: 'part', ability: 'parallel_hatch' }), modifier: (next) => next, overclock: () => null },
    noVoiding: { modifier: (o, next) => next, beforeWorking: () => () => true },
  };
  const noop = () => {};
  // startup-only event groups, stubbed: any handler (registry, materialModification...) is accepted and never runs here
  const events = () => new Proxy({}, { get: () => noop });
  const sandbox = {
    console: { info: log('info'), warn: log('warn'), error: log('error'), log: log('info'), debug: noop },
    global: { grindless: G },
    Item: { exists: (id) => items(String(id)) },
    Fluid: { exists: (id) => fluids(String(id)), of: (id, amount) => ({ fluid: String(id), amount: Number(amount) }) },
    ServerEvents: { recipes: (fn) => handlers.push(fn) },
    GTCEuStartupEvents: events(),
    StartupEvents: events(),
    Text: { translate: (k) => ({ getString: () => k }), gray: (x) => x },
  };
  if (before) before(sandbox);
  vm.createContext(sandbox);
  for (const f of [...startup, ...scripts]) {
    const file = path.join(packRoot, f);
    vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
  }
  const originals = Object.entries(recipes).map(([id, json]) => ({
    json: JSON.stringify(json),
    toString: () => `${id}[${json.type}]`,
    getId: () => id,
  }));
  const gtceu = new Proxy({}, { get: (_, type) => (id) => recorder(`gtceu:${String(type)}`, id, built) });
  const event = {
    originalRecipes: { values: () => ({ forEach: (fn) => originals.forEach((r) => fn(r)) }) },
    recipes: { gtceu },
    shaped: () => recorder('minecraft:crafting_shaped', '?', built),
    custom: (json) => {
      const entry = { type: String(json.type), id: '?', json: JSON.parse(JSON.stringify(json)), calls: [] };
      built.push(entry);
      return { id: (id) => { entry.id = String(id); } };
    },
  };
  for (const h of handlers) h(event);
  // the scripts' objects belong to the sandbox's realm (its own Array and Object): hand back plain copies, so deepEqual works
  const plain = (x) => JSON.parse(JSON.stringify(x));
  return { G: plain(G), built: plain(built), logs };
}
