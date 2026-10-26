// The native fixture of package LuV-B7 (tools/test/overlay/kubejs/server_scripts/gg_test_luv_io_orbit.js), checked without the game:
//   - it compiles (vm.Script) and keeps to Rhino's rules: var only (no const/let), no arrow functions, no Math.PI, no charCodeAt;
//   - it names no dimension id but the Overworld: Io orbit comes from G.stations.second, Io from G.places.surface('io');
//   - its band matches the AGENTS.md row (X 18432-18495) when that row exists, and the README documents it;
//   - in a simulated server with the pack's own startup scripts (lib/orbits.js, lib/places.js, lib/stations.js, luv/io_orbit.js against
//     recording registries), server luv/io_orbit.js (through a recipe recorder) and integration/hidden.js (its item tags), it runs the
//     pending mode of tables/stations.json to the end: mode INFO, registry/hiding/recipes PASS, every machine stage SKIPPED with the
//     reason, cleanup PASS and DONE, touching no world class and running no command. A stray registration fails `registry` and still ends
//     with DONE. In the tether and sulfur-iodine modes the same static checks pass before the (unmodelled) world stages begin.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const PACK = path.join(ROOT, 'pack');
const FIXTURE = path.join(ROOT, 'tools', 'test', 'overlay', 'kubejs', 'server_scripts', 'gg_test_luv_io_orbit.js');
const SOURCE = fs.readFileSync(FIXTURE, 'utf8');
const read = (p) => fs.readFileSync(path.join(PACK, p), 'utf8').replace(/^\uFEFF/, '');
const STATIONS_PATH = 'kubejs/data/grindless/tables/stations.json';
const STATIONS = JSON.parse(read(STATIONS_PATH));
const STARTUP = ['kubejs/startup_scripts/grindless/lib/orbits.js', 'kubejs/startup_scripts/grindless/lib/places.js',
  'kubejs/startup_scripts/grindless/lib/stations.js', 'kubejs/startup_scripts/grindless/luv/io_orbit.js'];
const SERVER_IO_ORBIT = 'kubejs/server_scripts/grindless/luv/io_orbit.js';
const SERVER_HIDDEN = 'kubejs/server_scripts/grindless/integration/hidden.js';
const TABLES = {
  pending: { ...STATIONS, enabled: false, second: 'grindless:io_orbit' },
  tether: { ...STATIONS, enabled: true, second: 'grindless:io_orbit' },
  sulfur_iodine: { ...STATIONS, enabled: true, second: null },
};
const PENDING = 'S0-3 pending: tables/stations.json';
const MACHINE_STAGES = ['recipe_site', 'tether_formed', 'tether_run', 'tether_formed_2a', 'tether_one_reel_dynamo', 'tether_no_regress',
  'tether_off_site', 'plant_formed', 'plant_run', 'plant_modules', 'plant_no_voiding', 'plant_off_site'];

function codeOnly(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"/g, "''")
    .replace(/\/\/[^\n]*/g, '');
}

test('gg_test_luv_io_orbit.js compiles and keeps to Rhino\'s rules', () => {
  assert.doesNotThrow(() => new vm.Script(SOURCE, { filename: 'gg_test_luv_io_orbit.js' }));
  const code = codeOnly(SOURCE);
  assert.doesNotMatch(code, /\b(const|let)\s+[A-Za-z_$[{]/, 'const/let throws "redeclaration of var" in callbacks that run more than once');
  assert.doesNotMatch(code, /=>/, 'arrow functions');
  assert.doesNotMatch(code, /Math\.PI|charCodeAt/);
  assert.doesNotMatch(SOURCE, /['"]grindless:(io|io_orbit)['"]/, 'Io and its orbit come from the tables');
  assert.match(SOURCE, /G\.stations\.second/);
  assert.match(SOURCE, /G\.places\.surface\('io'\)/);
  assert.match(SOURCE, /var BAND = \{ x0: 18432, x1: 18495, z0: 0, z1: 63 \}/);
  assert.match(SOURCE, /var OVERWORLD_Y = \{ y0: 98, y1: 112 \}/);
  assert.match(SOURCE, /var OFFWORLD_Y = \{ y0: 198, y1: 214 \}/);
  // every literal X the fixture builds at lies inside the band
  for (const m of SOURCE.matchAll(/\b(18[0-9]{3})\b/g)) {
    const x = Number(m[1]);
    assert.ok(x >= 18432 && x <= 18495, 'X ' + x + ' outside the band');
  }
});

test('AGENTS.md (when its row exists) and the README document the fixture', () => {
  const agents = fs.readFileSync(path.join(ROOT, 'AGENTS.md'), 'utf8').split('\n').map((l) => l.trim());
  const row = agents.find((l) => l.startsWith('|') && /18432–18495/.test(l));
  if (row) assert.match(row, /Z 0–63/);
  const readme = fs.readFileSync(path.join(ROOT, 'tools', 'test', 'README.md'), 'utf8');
  assert.match(readme, /gg_test_luv_io_orbit/);
  assert.match(readme, /GGTEST\\\|luv_io_orbit\\\|DONE@@180/);
});

// ---------------------------------------------------------------- simulated server

class RL { constructor(id) { this.id = String(id); } toString() { return this.id; } }
class AL {
  constructor(c) { this.a = Array.isArray(c) ? c.slice() : c && Array.isArray(c.a) ? c.a.slice() : []; }
  size() { return this.a.length; }
  get(i) { return this.a[i]; }
}
const Optional = (v) => ({ isPresent: () => v !== null && v !== undefined, get: () => v });

function run(mode, opts = {}) {
  const table = TABLES[mode];
  const readJsonTable = (p) => (p === STATIONS_PATH ? JSON.parse(JSON.stringify(table)) : JSON.parse(read(p)));
  const lines = [];
  const commands = [];
  const handlers = { tick: [], command: {}, tags: {}, recipes: null };
  const clock = { ms: 1000000, tick: 0 };
  const proxyBuilder = () => {
    const self = new Proxy({}, { get: () => () => self });
    return self;
  };
  const G = {
    readJsonTable,
    structures: {},
    patterns: new Proxy({ register() {}, build() {} }, { get: (t, k) => (k in t ? t[k] : (...args) => ({ kind: String(k), args })) }),
    noVoiding: { modifier: () => ({}), beforeWorking: () => ({}) },
    generators: { modifier: () => ({}), display: () => () => {}, recipeEUt: () => 0 },
    freshRun: { afterWorking: () => ({}) },
  };
  const registry = {};
  const sandbox = {
    console: { info: (s) => lines.push(String(s)), log: () => {}, warn: () => {}, error: (s) => lines.push('ERROR ' + s) },
    Date: { now: () => clock.ms },
    global: { grindless: G },
    GTCEuStartupEvents: { registry(kind, fn) { registry[kind] = fn; } },
    GuiTextures: {}, FillDirection: {}, RotationState: {}, GTSoundEntries: {},
    Text: { translate: (x) => x },
    Block: { getBlock: (id) => id },
    Fluid: { of: (id, amount) => ({ id, amount }), exists: () => true },
    ServerEvents: {
      tick: (fn) => handlers.tick.push(fn),
      customCommand: (name, fn) => { handlers.command[name] = fn; },
      tags: (kind, fn) => { handlers.tags[kind] = fn; },
      recipes: (fn) => { handlers.recipes = fn; },
    },
  };
  vm.createContext(sandbox);
  for (const f of STARTUP) vm.runInContext(read(f), sandbox, { filename: path.basename(f) });

  // the startup registries: the machines and recipe types the active mode registers
  const machines = new Set();
  const types = new Set();
  registry['gtceu:recipe_type']({ create: (id) => { types.add('gtceu:' + id); return proxyBuilder(); } });
  registry['gtceu:machine']({ create: (id) => { machines.add('gtceu:' + id); return proxyBuilder(); } });
  for (const id of opts.strayMachines || []) machines.add(id);

  // server io_orbit.js through a recorder (GTM saves a builder id ns:path as ns:<type>/path; shaped takes .id())
  const recipes = {};
  vm.runInContext(read(SERVER_IO_ORBIT), sandbox, { filename: 'io_orbit.js' });
  const chain = (rec) => {
    const self = new Proxy({}, { get: (_, k) => (...args) => { if (k === 'dimension') rec.dims.push(String(args[0])); return self; } });
    return self;
  };
  const gtceu = new Proxy({}, {
    get: (_, type) => (...args) => {
      if (type === 'shaped') return { id: (id) => { recipes[String(id)] = { dims: [] }; } };
      const rec = { dims: [] };
      recipes[String(args[0]).replace(':', ':' + String(type) + '/')] = rec;
      return chain(rec);
    },
  });
  handlers.recipes({ recipes: { gtceu } });

  // integration/hidden.js: its item tags, as the fixture reads them through Item.of(id).hasTag(tag)
  handlers.recipes = null;
  sandbox.Item = { exists: () => true };
  vm.runInContext(read(SERVER_HIDDEN), sandbox, { filename: 'hidden.js' });
  const tags = {};
  handlers.tags.item({ add: (tag, ids) => { (tags[tag] = tags[tag] || new Set()); [].concat(ids).forEach((id) => tags[tag].add(String(id))); } });
  sandbox.Item = {
    exists: () => true,
    of: (id) => ({ hasTag: (tag) => Boolean(tags[tag] && tags[tag].has(String(id))) }),
  };

  const CLASSES = {
    'net.minecraft.resources.ResourceLocation': RL,
    'java.util.ArrayList': AL,
    'com.gregtechceu.gtceu.api.registry.GTRegistries': {
      MACHINES: { get: (rl) => (machines.has(rl.id) ? { id: rl.id } : null) },
      RECIPE_TYPES: { get: (rl) => (types.has(rl.id) ? { id: rl.id } : null) },
    },
  };
  const loaded = [];
  sandbox.Java = { loadClass: (n) => { loaded.push(n); if (!(n in CLASSES)) throw new Error('unmodelled class ' + n); return CLASSES[n]; } };
  const server = {
    getTickCount: () => clock.tick,
    getRecipeManager: () => ({ byKey: (rl) => Optional(recipes[rl.id]) }),
    runCommandSilent: (text) => { commands.push(text); throw new Error('unmodelled command: ' + text); },
    getLevel: (dim) => { throw new Error('unmodelled level ' + dim); },
  };
  vm.runInContext(SOURCE, sandbox, { filename: 'gg_test_luv_io_orbit.js' });
  handlers.command.gg_test_luv_io_orbit({});
  for (let t = 0; t < 600 && !lines.includes('GGTEST|luv_io_orbit|DONE'); t++) {
    clock.tick++;
    clock.ms += 50;
    for (const fn of handlers.tick) fn({ server });
  }
  const markers = lines.filter((l) => l.startsWith('GGTEST|luv_io_orbit|') && l !== 'GGTEST|luv_io_orbit|DONE').map((l) => {
    const p = l.split('|');
    return { name: p[2], status: p[3], detail: p.slice(4).join('|') };
  });
  return { lines, markers, commands, loaded, recipes, tags, G };
}
const byName = (r, name) => r.markers.find((m) => m.name === name);

test('pending: registry, hiding and recipes pass, every machine stage is SKIPPED with the reason, DONE without touching the world', () => {
  const r = run('pending');
  assert.equal(r.G.stations.b7, 'pending');
  assert.equal(r.lines.filter((l) => l === 'GGTEST|luv_io_orbit|DONE').length, 1);
  assert.equal(r.lines[r.lines.length - 1], 'GGTEST|luv_io_orbit|DONE');
  assert.deepEqual(r.markers.filter((m) => m.status === 'FAIL'), []);
  assert.equal(byName(r, 'mode').status, 'INFO');
  assert.match(byName(r, 'mode').detail, /b7=pending/);
  for (const name of ['shared_registrations', 'registry', 'hiding', 'recipes', 'cleanup']) assert.equal(byName(r, name).status, 'PASS', name);
  for (const name of MACHINE_STAGES) {
    const m = byName(r, name);
    assert.ok(m, name);
    assert.equal(m.status, 'SKIPPED', name);
    assert.equal(m.detail, PENDING, name);
  }
  assert.ok(r.markers.every((m) => m.status !== 'PASS' || !MACHINE_STAGES.includes(m.name)));
  assert.deepEqual(Object.keys(r.recipes), [], 'pending writes no recipe');
  assert.ok(r.tags['c:hidden_from_recipe_viewers'].has('grindless:tether_spool'), 'the spool is hidden while pending');
  assert.deepEqual(r.commands, [], 'no command, nothing built');
  assert.deepEqual([...new Set(r.loaded)].sort(), ['com.gregtechceu.gtceu.api.registry.GTRegistries', 'java.util.ArrayList',
    'net.minecraft.resources.ResourceLocation']);
});

test('pending with a stray registration: registry FAILs and the fixture still ends with DONE', () => {
  const r = run('pending', { strayMachines: ['gtceu:flux_tube_tether'] });
  assert.equal(byName(r, 'registry').status, 'FAIL');
  assert.equal(byName(r, 'exception').status, 'FAIL');
  assert.equal(r.lines[r.lines.length - 1], 'GGTEST|luv_io_orbit|DONE');
  assert.deepEqual(r.commands, []);
});

test('tether and sulfur-iodine modes: the same static checks pass before the world stages', () => {
  for (const mode of ['tether', 'sulfur_iodine']) {
    const r = run(mode);
    assert.equal(r.G.stations.b7, mode);
    for (const name of ['shared_registrations', 'registry', 'hiding', 'recipes', 'site']) assert.equal(byName(r, name).status, 'PASS', mode + ' ' + name);
    assert.equal(byName(r, 'other_design').status, 'INFO');
    assert.ok(!r.markers.some((m) => m.status === 'SKIPPED'), mode + ': nothing SKIPPED outside the pending mode');
    // the recipes' contents and the world are not modelled here: the run stops at recipe_site or the first world class and still
    // prints DONE (the native run proves the rest)
    assert.equal(byName(r, 'exception').status, 'FAIL');
    assert.deepEqual(r.commands, []);
    assert.equal(r.lines[r.lines.length - 1], 'GGTEST|luv_io_orbit|DONE');
    const spoolHidden = r.tags['c:hidden_from_recipe_viewers'] && r.tags['c:hidden_from_recipe_viewers'].has('grindless:tether_spool');
    assert.equal(Boolean(spoolHidden), mode !== 'tether');
  }
});
