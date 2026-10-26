// The native fixture of package LuV-B1 (tools/test/overlay/kubejs/server_scripts/gg_test_luv_b1.js), checked without the game:
//   - it compiles (vm.Script) and keeps to Rhino's rules: var only (no const/let anywhere), no Math.PI;
//   - it names none of B1's new dimension ids: they come from G.places (tables/places.json), G.orbits (tables/orbits.json) and
//     planets.json, and its ground lists cover every block the four surfaces' noise settings can place;
//   - its band (AGENTS.md "LuV travel and places (B1)": X 18176-18239, Z 0-63; the Overworld at Y 98-112, the new surfaces at Y 198-214)
//     matches the AGENTS.md row, and in a simulated server it writes only to the Overworld inside that band, reads the new surfaces only
//     inside the band's X/Z and writes nothing off-world;
//   - the whole fixture runs in a simulated server with the pack's own startup tables, travel registrations, places, orbits, planets and
//     airless weather scripts, B1's server recipes (luv/travel.js, through a recorder) and GCYR's planet files; stand-ins copy GCYR 0.2.9's
//     rocket rule (floor((weakest motor + weakest tank)/2), the capacity is the tanks' sum) and vanilla's weather. Every check passes
//     (stations SKIPPED while stations.json is disabled), the Overworld's weather is put back exactly, the band is left empty and the
//     ticket released; with stations enabled, an occupied footprint, a wrong planet tier or a pair the script skips, only the matching
//     checks fail and it still ends with DONE.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const PACK = path.join(ROOT, 'pack');
const KJS = path.join(PACK, 'kubejs');
const FIXTURE = path.join(ROOT, 'tools', 'test', 'overlay', 'kubejs', 'server_scripts', 'gg_test_luv_b1.js');
const SOURCE = fs.readFileSync(FIXTURE, 'utf8');
const STARTUP = ['lib/places.js', 'lib/orbits.js', 'luv/travel.js'].map((f) => path.join(KJS, 'startup_scripts', 'grindless', f));
const SERVER = ['moon/planets.js', 'space/airless_weather.js'].map((f) => path.join(KJS, 'server_scripts', 'grindless', f));
const SERVER_TRAVEL = path.join(KJS, 'server_scripts', 'grindless', 'luv', 'travel.js');

const EARTH = 'minecraft:overworld';
const BAND = { x0: 18176, x1: 18239, z0: 0, z1: 63 };
const OW_Y = { y0: 98, y1: 112 };
const OFF_Y = { y0: 198, y1: 214 };
const NEW_DIMS = /['"]grindless:(asteroid_belt|jupiter|io|europa|ganymede)(_orbit)?['"]/;
const STATUSES = new Set(['PASS', 'FAIL', 'NOTE', 'SKIPPED']);

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, ''));
const tablePath = (p) => path.join(PACK, ...String(p).split('/'));

// ---------------------------------------------------------------- source-level checks

// the code without comments and string literals (a string can hold "let" in prose)
function codeOnly(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"/g, "''")
    .replace(/\/\/[^\n]*/g, '');
}

test('gg_test_luv_b1.js compiles and keeps to Rhino\'s rules (var only, no Math.PI)', () => {
  assert.doesNotThrow(() => new vm.Script(SOURCE, { filename: 'gg_test_luv_b1.js' }));
  const code = codeOnly(SOURCE);
  assert.doesNotMatch(code, /\b(const|let)\s+[A-Za-z_$[{]/, 'const/let throws "redeclaration of var" in callbacks that run more than once');
  assert.doesNotMatch(code, /Math\.PI/, 'Math.PI is undefined in this Rhino');
  assert.doesNotMatch(code, /=>/, 'arrow functions: keep to function () {} as the other fixtures');
});

test('it names none of B1\'s new dimension ids: they come from G.places, G.orbits and planets.json', () => {
  assert.doesNotMatch(SOURCE, NEW_DIMS);
  assert.match(SOURCE, /G\.places\.surface\(/);
  assert.match(SOURCE, /G\.orbits\.dimensions/);
  assert.match(SOURCE, /G\.orbits\.earth/);
  assert.match(SOURCE, /planets\.table\.planets/);
});

test('its ground lists cover every block the four surfaces\' noise settings can place', () => {
  const m = /var GROUND = (\{[\s\S]*?\n {2}\})/.exec(SOURCE);
  assert.ok(m, 'GROUND table not found');
  const ground = vm.runInNewContext('(' + m[1] + ')');
  const places = readJson(path.join(KJS, 'data', 'grindless', 'tables', 'places.json')).surfaces;
  const keys = { belt: 'asteroid_belt', io: 'io', europa: 'europa', ganymede: 'ganymede' };
  for (const [key, place] of Object.entries(keys)) {
    const [ns, name] = places[place].split(':');
    const file = path.join(KJS, 'data', ns, 'worldgen', 'noise_settings', name + '.json');
    const named = [...new Set([...fs.readFileSync(file, 'utf8').matchAll(/"Name"\s*:\s*"([^"]+)"/g)].map((x) => x[1]))]
      .filter((id) => id !== 'minecraft:air' && id !== 'minecraft:bedrock');
    assert.ok(named.length > 0, file);
    for (const id of named) assert.ok(ground[key].includes(id), `${key}: ${id} (from ${name}.json) is not in GROUND.${key}`);
  }
});

test('AGENTS.md reserves the fixture\'s band and the README documents it', () => {
  const agents = fs.readFileSync(path.join(ROOT, 'AGENTS.md'), 'utf8');
  const rows = agents.split('\n').map((l) => l.trim());
  const row = rows.find((l) => l.startsWith('| LuV travel and places (B1)'));
  assert.ok(row, 'AGENTS.md test-zone row "LuV travel and places (B1)"');
  assert.match(row, /18176–18239/);
  assert.match(row, /Z 0–63/);
  assert.match(row, /Y 98–112/);
  assert.match(row, /Y 198–214/);
  assert.match(SOURCE, /var BAND = \{ x0: 18176, x1: 18239, z0: 0, z1: 63 \}/);
  assert.match(SOURCE, /var OVERWORLD_Y = \{ y0: 98, y1: 112 \}/);
  assert.match(SOURCE, /var OFFWORLD_Y = \{ y0: 198, y1: 214 \}/);
  // no other band of the table overlaps it (rows that give an X range)
  for (const l of rows.filter((x) => x.startsWith('| ') && x !== row)) {
    const r = /\|\s*(\d+)–(\d+)/.exec(l);
    if (!r) continue;
    const [a, b] = [Number(r[1]), Number(r[2])];
    assert.ok(b < BAND.x0 || a > BAND.x1, 'overlaps: ' + l);
  }
  const readme = fs.readFileSync(path.join(ROOT, 'tools', 'test', 'README.md'), 'utf8');
  assert.match(readme, /gg_test_luv_b1/);
  assert.match(readme, /stations\.json/);
});

// ---------------------------------------------------------------- simulated server

class RL { constructor(id) { this.id = String(id); } toString() { return this.id; } }
class Pos {
  constructor(x, y, z) { this.x = x; this.y = y; this.z = z; }
  getX() { return this.x; } getY() { return this.y; } getZ() { return this.z; }
}
class AL {
  constructor(c) { this.a = Array.isArray(c) ? c.slice() : c && Array.isArray(c.a) ? c.a.slice() : []; }
  size() { return this.a.length; }
  get(i) { return this.a[i]; }
}
class AABB {
  constructor(x0, y0, z0, x1, y1, z1) { Object.assign(this, { x0, y0, z0, x1, y1, z1 }); }
  has(x, y, z) { return x >= this.x0 && x <= this.x1 && y >= this.y0 && y <= this.y1 && z >= this.z0 && z <= this.z1; }
}
class ItemEntity {}
class Block { constructor(id) { this.id = id; } }
class FuelTankBlock extends Block {
  constructor(id, tier, storage, type) { super(id); this.tier = tier; this.props = { getFuelStorage: () => storage, getSerializedName: () => type }; }
  getTier() { return this.tier; }
  getTankProperties() { return this.props; }
}
class RocketMotorBlock extends Block { constructor(id, tier) { super(id); this.tier = tier; } getTier() { return this.tier; } }
const Optional = (v) => ({ isPresent: () => v !== null && v !== undefined, get: () => v });
const key3 = (x, y, z) => x + ',' + y + ',' + z;

// GCYR 0.2.9's RocketEntity, as far as the fixture reads it
class RocketEntity {
  constructor(level, origin, blocks) { this.level = level; this.origin = origin; this.blocks = blocks; this.removed = false; }
  getBlocks() { return new AL(this.blocks.map((b) => ({ pos: () => new Pos(b.x - this.origin.x, b.y - this.origin.y, b.z - this.origin.z), state: () => ({ getBlock: () => b.block }) }))); }
  blockPosition() { return new Pos(this.origin.x, this.origin.y, this.origin.z); }
  getFuelCapacity() { return this.blocks.reduce((n, b) => n + (b.block instanceof FuelTankBlock ? b.block.props.getFuelStorage() : 0), 0); }
  computeRequiredFuelAmountForDestination(planet) { return planet ? 10000 : 0; }
  isRemoved() { return this.removed; }
  discard() { this.removed = true; }
  has(box) { return box.has(this.origin.x, this.origin.y, this.origin.z); }
}

// the four surfaces: a column-based stand-in for their generated ground (real ids, heights in their noise settings' ranges)
function terrain(place, opts = {}) {
  if (place === 'asteroid_belt') return (x, y, z) => {
    const top = 60 + ((x + z) % 8);
    // a GTM vein surface indicator lying on the ground of one sampled column (the native S2 run met one at 18186,10)
    if (opts.beltIndicator && x === 18186 && z === 10 && y === top + 1) return opts.beltIndicator;
    if (y === -64) return 'minecraft:bedrock';
    if (y < top) return 'minecraft:tuff';
    if (y === top) return (x + z) % 3 === 0 ? 'minecraft:gravel' : 'minecraft:cobbled_deepslate';
    if (x % 10 === 1 && y >= 120 && y <= 124) return 'minecraft:tuff';
    return 'minecraft:air';
  };
  if (place === 'io') return (x, y, z) => (y < 95 + (x % 5) ? 'minecraft:basalt' : y === 95 + (x % 5) ? 'biomesoplenty:brimstone' : 'minecraft:air');
  if (place === 'europa') return (x, y) => (y <= 96 ? 'minecraft:packed_ice' : 'minecraft:air');
  if (place === 'ganymede') return (x, y, z) => (y < 100 ? 'minecraft:tuff' : y === 100 ? 'minecraft:packed_ice' : 'minecraft:air');
  return (x, y) => (y <= 64 ? 'minecraft:stone' : 'minecraft:air');
}

function simulate(opts = {}) {
  const lines = [];
  const reads = [];
  const writes = [];
  const exports = {};
  const clock = { ms: 1e12, tick: 0 };
  const levels = {};
  const tickets = new Set();
  const machines = new Map();

  const travel = { tank: null };
  const blockRegistry = {};
  const blockOf = (id) => blockRegistry[id] || (blockRegistry[id] = new Block(id));
  const levelData = {
    raining: false, thundering: false, clear: 12345, rain: 6789, thunder: 4321,
    isRaining() { return this.raining; }, isThundering() { return this.thundering; },
    getClearWeatherTime() { return this.clear; }, getRainTime() { return this.rain; }, getThunderTime() { return this.thunder; },
    setClearWeatherTime(v) { this.clear = v; }, setRainTime(v) { this.rain = v; }, setThunderTime(v) { this.thunder = v; },
    setRaining(v) { this.raining = !!v; }, setThundering(v) { this.thundering = !!v; },
  };
  const before = { raining: false, thundering: false, clear: 12345, rain: 6789, thunder: 4321 };

  class Level {
    constructor(dim, ground) { this.dim = dim; this.ground = ground; this.blocks = new Map(); this.rainLevel = 0; this.thunderLevel = 0; this.entities = []; }
    id(x, y, z) { const k = key3(x, y, z); return this.blocks.has(k) ? this.blocks.get(k) : this.ground(x, y, z); }
    getBlock(x, y, z) { reads.push({ dim: this.dim, x, y, z }); return { id: this.id(x, y, z) }; }
    set(x, y, z, id) { writes.push({ dim: this.dim, x, y, z, id }); this.blocks.set(key3(x, y, z), id); }
    getChunk(cx, cz) { reads.push({ dim: this.dim, x: cx * 16, z: cz * 16, chunk: true }); return {}; }
    getRainLevel() { return this.rainLevel; }
    getThunderLevel() { return this.thunderLevel; }
    setRainLevel(v) { this.rainLevel = v; }
    setThunderLevel(v) { this.thunderLevel = v; }
    getLevelData() { if (this.dim !== EARTH) throw new Error('derived level data'); return levelData; }
    getEntitiesOfClass(cls, box) { return new AL(this.entities.filter((e) => e instanceof cls && !e.isRemoved() && e.has(box))); }
  }

  // the pack's tables and scripts, in one sandbox
  const G = {
    readJsonTable(p) {
      if (String(p).endsWith('tables/stations.json')) {
        if (opts.stations !== undefined) return JSON.parse(JSON.stringify(opts.stations));
        const f = tablePath(p);
        return fs.existsSync(f) ? readJson(f) : { enabled: false };
      }
      return readJson(tablePath(p));
    },
  };
  const handlers = { tick: [], command: {} };
  const PlanetData = {
    planets: {},
    getPlanet(rl) { return this.planets[String(rl)] || null; },
  };
  const loadPlanets = (dir, ns) => {
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json'))) {
      const j = readJson(path.join(dir, f));
      const tier = opts.tiers && opts.tiers[ns + ':' + f.replace('.json', '')];
      const key = (id) => ({ location: () => new RL(id) });
      PlanetData.planets[ns + ':' + f.replace('.json', '')] = {
        level: () => key(j.world), orbitWorld: () => key(j.orbit_world), parentWorld: () => (j.parent_world ? key(j.parent_world) : null),
        rocketTier: () => (tier !== undefined ? tier : j.rocket_tier),
      };
    }
  };
  loadPlanets(path.join(KJS, 'data', 'grindless', 'gcyr', 'planets'), 'grindless');
  loadPlanets(path.join(KJS, 'data', 'gcyr', 'gcyr', 'planets'), 'gcyr');

  const Forge = {
    BLOCKS: { getValue: (rl) => blockOf(String(rl)), getKey: (b) => new RL(b.id) },
    ITEMS: { getKey: (i) => new RL(i.id) },
  };
  const scannerAt = (level, p) => {
    if (level.dim !== EARTH || level.id(p.x, p.y, p.z) !== 'gcyr:rocket_scanner') return null;
    const k = key3(p.x, p.y, p.z);
    if (!machines.has(k)) machines.set(k, { placedAt: clock.tick });
    const m = machines.get(k);
    const c = { x: p.x, y: p.y, z: p.z };
    return {
      getFrontFacing: () => 'north',
      setFrontFacing() {},
      // the flight pad: 3 x 3 launch pads one block lower behind the controller, a 2-frame tower behind them
      isFormed() {
        if (clock.tick - m.placedAt < 2) return false;
        for (let b = 1; b <= 3; b++) for (let s = -1; s <= 1; s++) if (level.id(c.x + s, c.y - 1, c.z + b) !== 'gcyr:launch_pad') return false;
        return level.id(c.x, c.y, c.z + 4) === 'gtceu:stainless_steel_frame' && level.id(c.x, c.y + 1, c.z + 4) === 'gtceu:stainless_steel_frame';
      },
      setRocketBuilt(v) {
        if (!v) return;
        const blocks = [];
        for (let b = 1; b <= 3; b++) for (let s = -1; s <= 1; s++) for (let y = 0; y <= 2; y++) {
          const id = level.id(c.x + s, c.y + y, c.z + b);
          if (id === 'minecraft:air') continue;
          blocks.push({ x: c.x + s, y: c.y + y, z: c.z + b, block: blockOf(id) });
          level.blocks.set(key3(c.x + s, c.y + y, c.z + b), 'minecraft:air');
        }
        level.entities.push(new RocketEntity(level, { x: c.x, y: c.y, z: c.z + 1 }, blocks));
      },
    };
  };

  const recipes = {};
  const server = {
    getTickCount: () => clock.tick,
    getLevel: (id) => levels[String(id)] || null,
    overworld: () => levels[EARTH],
    registryAccess: () => ({}),
    getRecipeManager: () => ({ byKey: (rl) => Optional(recipes[String(rl)] || null) }),
    runCommandSilent(text) {
      let dim = EARTH;
      let c = String(text);
      const ex = /^execute in (\S+) run (.*)$/.exec(c);
      if (ex) { dim = ex[1]; c = ex[2]; }
      const level = levels[dim];
      let m;
      if ((m = /^weather (clear|rain|thunder)(?: (\d+))?$/.exec(c))) {
        const d = Number(m[2] || 6000);
        if (m[1] === 'clear') Object.assign(levelData, { clear: d, rain: 0, thunder: 0, raining: false, thundering: false });
        else Object.assign(levelData, { clear: 0, rain: d, thunder: d, raining: true, thundering: m[1] === 'thunder' });
        return 1;
      }
      if ((m = /^setblock (-?\d+) (-?\d+) (-?\d+) ([a-z0-9_:./]+)(\[[^\]]*\])? replace$/.exec(c))) {
        const [x, y, z] = [Number(m[1]), Number(m[2]), Number(m[3])];
        level.set(x, y, z, m[4]);
        if (m[4] === 'gcyr:rocket_scanner') machines.set(key3(x, y, z), { placedAt: clock.tick });
        return 1;
      }
      if ((m = /^forceload (add|remove|query) (-?\d+) (-?\d+)$/.exec(c))) {
        const k = dim + '|' + (Number(m[2]) >> 4) + ',' + (Number(m[3]) >> 4);
        writes.push({ dim, ticket: m[1], x: Number(m[2]), z: Number(m[3]) });
        if (m[1] === 'add') { const had = tickets.has(k); tickets.add(k); return had ? 0 : 1; }
        if (m[1] === 'remove') return tickets.delete(k) ? 1 : 0;
        return tickets.has(k) ? 1 : 0;
      }
      if ((m = /^kill @e\[type=minecraft:item,x=(-?\d+),y=(-?\d+),z=(-?\d+),dx=(\d+),dy=(\d+),dz=(\d+)\]$/.exec(c))) {
        writes.push({ dim, kill: true, x: Number(m[1]), y: Number(m[2]), z: Number(m[3]), x1: Number(m[1]) + Number(m[4]), y1: Number(m[2]) + Number(m[5]), z1: Number(m[3]) + Number(m[6]) });
        return 0;
      }
      throw new Error('unmodelled command: ' + text);
    },
  };

  const CLASSES = {
    'net.minecraft.core.BlockPos': Pos,
    'net.minecraft.resources.ResourceLocation': RL,
    'java.util.ArrayList': AL,
    'net.minecraft.world.phys.AABB': AABB,
    'net.minecraft.core.Direction': { NORTH: 'north' },
    'net.minecraft.world.entity.item.ItemEntity': ItemEntity,
    'net.minecraftforge.registries.ForgeRegistries': Forge,
    'com.gregtechceu.gtceu.api.machine.MetaMachine': { getMachine: scannerAt },
    'com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability': { CAP: { item: true } },
    'argent_matter.gcyr.common.entity.RocketEntity': RocketEntity,
    'argent_matter.gcyr.common.block.FuelTankBlock': FuelTankBlock,
    'argent_matter.gcyr.common.block.RocketMotorBlock': RocketMotorBlock,
    'argent_matter.gcyr.data.loader.PlanetData': PlanetData,
  };
  const sandbox = {
    console: { info: (s) => lines.push(String(s)), log: () => {}, warn: () => {}, error: () => {} },
    Date: { now: () => clock.ms },
    global: { grindless: G },
    Java: { loadClass: (n) => { if (!(n in CLASSES)) throw new Error('unmodelled class ' + n); return CLASSES[n]; } },
    JsonIO: { write: (p, o) => { exports[p] = JSON.parse(JSON.stringify(o)); } },
    StartupEvents: { registry() {} },
    Text: new Proxy({}, { get: () => () => ({}) }),
    ServerEvents: {
      tick: (fn) => handlers.tick.push(fn),
      customCommand: (name, fn) => { handlers.command[name] = fn; },
    },
  };
  vm.createContext(sandbox);
  for (const f of STARTUP) vm.runInContext(fs.readFileSync(f, 'utf8'), sandbox, { filename: path.basename(f) });
  for (const f of SERVER) vm.runInContext(fs.readFileSync(f, 'utf8'), sandbox, { filename: path.basename(f) });
  travel.tank = G.luvTravel.tank;

  // GCYR's tank from the startup registration (tier 5, 16000 mB), its elite motor (tier 3)
  blockRegistry[travel.tank.id] = new FuelTankBlock(travel.tank.id, travel.tank.tier, travel.tank.fuel, travel.tank.typeId);
  blockRegistry['gcyr:elite_rocket_motor'] = new RocketMotorBlock('gcyr:elite_rocket_motor', 3);

  // every dimension the planets table and the places table know
  levels[EARTH] = new Level(EARTH, terrain(null));
  const table = G.planets.table.planets;
  const surfaces = G.places.surfaces;
  for (const k of Object.keys(table)) {
    for (const d of table[k].dimensions) {
      if (levels[d]) continue;
      const place = Object.keys(surfaces).find((p) => surfaces[p] === d);
      levels[d] = new Level(d, place ? terrain(place, opts) : () => 'minecraft:air');
    }
  }
  if (opts.occupied) levels[EARTH].blocks.set(key3(18181, 101, 5), 'minecraft:dirt');

  // B1's server half (luv/travel.js) runs here with a recorder for its GT builders and event.custom; the live recipes the fixture reads
  // are built from what it adds (GTM saves a builder id ns:path as ns:<type>/path), and luvTravel.done is the script's own
  const recorded = [];
  const builder = (type) => (id) => {
    const rid = String(id);
    const r = { kind: 'gt', id: rid.replace(':', ':' + type + '/'), outs: [], dims: [] };
    recorded.push(r);
    const self = new Proxy({}, {
      get: (_, k) => (...args) => {
        if (k === 'itemOutputs') for (const a of args) r.outs.push(String(a).replace(/^\d+x /, ''));
        if (k === 'dimension') r.dims.push(String(args[0]));
        return self;
      },
    });
    return self;
  };
  const recipeEvent = {
    recipes: { gtceu: new Proxy({}, { get: (_, type) => builder(String(type)) }) },
    custom(json) { const r = { kind: 'custom', json: JSON.parse(JSON.stringify(json)) }; recorded.push(r); return { id: (id) => { r.id = String(id); return r; } }; },
  };
  sandbox.Item = { exists: (id) => !opts.missingItems || !opts.missingItems.includes(id) };
  sandbox.Fluid = { exists: () => true, of: (id, amount) => ({ id, amount }) };
  sandbox.ServerEvents.recipes = (fn) => fn(recipeEvent);
  vm.runInContext(fs.readFileSync(SERVER_TRAVEL, 'utf8'), sandbox, { filename: 'travel.js' });
  const gt = (dims, outs) => ({
    conditions: new AL(dims.map((d) => ({ getDimension: () => ({ location: () => new RL(d) }), isReverse: () => false }))),
    getOutputContents: () => new AL(outs.map((o) => ({ content: { toJson: () => JSON.stringify({ type: 'gtceu:sized', count: 1, ingredient: { item: o } }) } }))),
  });
  for (const r of recorded) {
    if (r.kind === 'gt') recipes[r.id] = gt(r.dims, r.outs);
    else if (r.json.type === 'ae2:transform') {
      const res = r.json.result;
      recipes[r.id] = {
        getResultItem: () => ({ getItem: () => ({ id: res.item }), getCount: () => res.count || 1,
          getNbt: () => (res.nbt ? { contains: (n) => n in res.nbt, getString: (n) => String(res.nbt[n]) } : null) }),
        getIngredients: () => new AL(r.json.ingredients.map((i) => ({ toJson: () => JSON.stringify(i) }))),
      };
    }
  }

  vm.runInContext(SOURCE, sandbox, { filename: 'gg_test_luv_b1.js' });
  handlers.command.gg_test_luv_b1({});
  for (let t = 0; t < 3000 && !lines.some((l) => l === 'GGTEST|luv_b1|DONE'); t++) {
    clock.tick++;
    clock.ms += 50;
    // vanilla's weather cycle: every level follows the Overworld's flags by 0.01 a tick
    for (const l of Object.values(levels)) {
      l.rainLevel = Math.max(0, Math.min(1, l.rainLevel + (levelData.raining ? 0.01 : -0.01)));
      l.thunderLevel = Math.max(0, Math.min(1, l.thunderLevel + (levelData.thundering ? 0.01 : -0.01)));
    }
    for (const fn of handlers.tick) fn({ server });
  }
  const markers = lines.filter((l) => l.startsWith('GGTEST|luv_b1|')).map((l) => {
    const p = l.split('|');
    return { name: p[2], status: p[3], detail: p.slice(4).join('|') };
  });
  return { lines, markers, reads, writes, exports, levels, tickets, levelData, before, G };
}

const byName = (r, name) => r.markers.find((m) => m.name === name);
const failed = (r) => r.markers.filter((m) => m.status === 'FAIL').map((m) => m.name + ': ' + m.detail);

function assertCleanAndRestored(r) {
  assert.equal(r.lines[r.lines.length - 1], 'GGTEST|luv_b1|DONE');
  for (const m of r.markers.filter((x) => x.name !== 'DONE')) assert.ok(STATUSES.has(m.status), m.name + ' status ' + m.status);
  const ow = r.levels[EARTH];
  const left = [...ow.blocks.entries()].filter(([, id]) => id !== 'minecraft:air');
  assert.deepEqual(left, [], 'the Overworld band is left as it was');
  assert.equal(r.tickets.size, 0, 'every ticket the fixture took is released');
  assert.ok(ow.entities.every((e) => e.isRemoved()), 'no rocket is left');
  for (const k of Object.keys(r.before)) assert.equal(r.levelData[k], r.before[k], 'weather ' + k + ' put back');
  assert.equal(ow.rainLevel, 0);
  assert.equal(ow.thunderLevel, 0);
}

function assertInBand(r) {
  for (const w of r.writes) {
    assert.equal(w.dim, EARTH, 'nothing is written off-world: ' + JSON.stringify(w));
    if (w.kill) {
      assert.ok(w.x >= BAND.x0 && w.x1 <= BAND.x1 && w.z >= BAND.z0 && w.z1 <= BAND.z1 && w.y >= OW_Y.y0 && w.y1 <= OW_Y.y1, JSON.stringify(w));
      continue;
    }
    assert.ok(w.x >= BAND.x0 && w.x <= BAND.x1 && w.z >= BAND.z0 && w.z <= BAND.z1, 'write outside the band: ' + JSON.stringify(w));
    if (w.y !== undefined) assert.ok(w.y >= OW_Y.y0 && w.y <= OW_Y.y1, 'write outside Y 98-112: ' + JSON.stringify(w));
  }
  const off = r.reads.filter((x) => x.dim !== EARTH);
  assert.ok(off.length > 0);
  for (const x of off) {
    assert.ok(x.x >= BAND.x0 && x.x <= BAND.x1 && x.z >= BAND.z0 && x.z <= BAND.z1, 'off-world read outside the band: ' + JSON.stringify(x));
    if (!x.chunk) assert.ok(x.y <= OFF_Y.y1, 'off-world read above Y 214: ' + JSON.stringify(x));
  }
  for (const x of r.reads.filter((y) => y.dim === EARTH && !y.chunk)) {
    assert.ok(x.x >= BAND.x0 && x.x <= BAND.x1 && x.z >= BAND.z0 && x.z <= BAND.z1 && x.y >= OW_Y.y0 && x.y <= OW_Y.y1, 'Overworld read: ' + JSON.stringify(x));
  }
}

test('the whole fixture passes in a simulated server: every check, stations SKIPPED, weather restored, band left empty', () => {
  const r = simulate();
  assert.deepEqual(failed(r), []);
  const want = ['shared_registrations', 'dimension_tables', 'planet_belt', 'planet_jupiter', 'planet_io', 'planet_europa', 'planet_ganymede',
    'proxima_tier', 'levels', 'pair_tags', 'tank_block', 'tank_recipe', 'recipes_done', 'seed_io', 'pair_io', 'seed_europa', 'pair_europa',
    'seed_ganymede', 'pair_ganymede', 'truss_recipe', 'rocket_placed', 'weather_registry', 'terrain_belt', 'offworld_air_belt', 'terrain_io',
    'offworld_air_io', 'terrain_europa', 'offworld_air_europa', 'terrain_ganymede', 'offworld_air_ganymede', 'weather_earth_rain', 'weather_dry',
    'weather_restored', 'rocket_formed', 'rocket_build', 'rocket_level4', 'rocket_capacity', 'rocket_europa_fuel', 'cleanup'];
  for (const n of want) assert.equal(byName(r, n) && byName(r, n).status, 'PASS', n + ' ' + JSON.stringify(byName(r, n)));
  assert.equal(byName(r, 'stations').status, 'SKIPPED');
  assert.equal(byName(r, 'level4_flight').status, 'NOTE');
  assert.match(byName(r, 'weather_dry').detail, /gcyr:overworld_orbit/);
  assert.match(byName(r, 'rocket_capacity').detail, /32000 mB/);
  const exp = r.exports['kubejs/exported/luv_b1_terrain.json'];
  assert.ok(exp, 'terrain export written');
  assert.deepEqual(Object.keys(exp.places).sort(), ['belt', 'europa', 'ganymede', 'io']);
  for (const p of Object.values(exp.places)) assert.equal(p.columns.length, 16);
  assertCleanAndRestored(r);
  assertInBand(r);
});

test('a belt vein\'s GTM surface indicator on belt ground is read through; any other vein\'s indicator fails terrain_belt only', () => {
  const own = simulate({ beltIndicator: 'gtceu:meteoric_iron_indicator' });
  assert.deepEqual(failed(own), []);
  assert.match(byName(own, 'terrain_belt').detail, /vein indicators read through \{"gtceu:meteoric_iron_indicator":1/);
  const foreign = simulate({ beltIndicator: 'gtceu:cassiterite_indicator' });
  assert.deepEqual(failed(foreign).map((x) => x.split(':')[0]), ['terrain_belt']);
  assert.match(byName(foreign, 'terrain_belt').detail, /18186,10=gtceu:cassiterite_indicator@/);
  assertCleanAndRestored(foreign);
});

test('stations.json enabled without a station stage fails "stations" only, and the run still ends cleanly', () => {
  const r = simulate({ stations: { enabled: true } });
  assert.deepEqual(failed(r).map((x) => x.split(':')[0]), ['stations']);
  assertCleanAndRestored(r);
});

test('an occupied rocket footprint fails rocket_placed only: no unowned block is replaced, the other stages run', () => {
  const r = simulate({ occupied: true });
  assert.deepEqual(failed(r).map((x) => x.split(':')[0]), ['rocket_placed']);
  assert.equal(r.levels[EARTH].blocks.get(key3(18181, 101, 5)), 'minecraft:dirt');
  r.levels[EARTH].blocks.delete(key3(18181, 101, 5));
  assert.equal(byName(r, 'weather_restored').status, 'PASS');
  assertCleanAndRestored(r);
});

test('a wrong rocket tier on a planet fails that planet\'s check (and the level 4 reach) only', () => {
  const r = simulate({ tiers: { 'grindless:europa': 5 } });
  assert.deepEqual(failed(r).map((x) => x.split(':')[0]).sort(), ['planet_europa', 'rocket_level4']);
  assertCleanAndRestored(r);
});

test('the recipes come from the pack\'s luv/travel.js: when it skips Europa\'s pair, seed_europa, pair_europa and recipes_done fail', () => {
  const r = simulate({ missingItems: ['grindless:europan_quantum_seed'] });
  assert.deepEqual(failed(r).map((x) => x.split(':')[0]).sort(), ['pair_europa', 'recipes_done', 'seed_europa']);
  assertCleanAndRestored(r);
});
