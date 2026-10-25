// Static contract of the stronger chest and furnace tiers (kubejs/data/grindless/tables/chest_furnace_tiers.json), no game needed:
//   1. the table: stock values are the mods' own defaults (read from their source), every metal tier gets at least twice the stock
//      value or the engine's bound, tiers stay ordered, nothing leaves the config bounds, nothing is lowered;
//   2. config/ironfurnaces-client.toml carries the table's speeds and settings, and only the mod's own keys;
//   3. startup_scripts/grindless/integration/sophisticatedstorage_tiers.js, run in a node:vm sandbox against a stand-in of Forge's
//      ForgeConfigSpec: stock keys are raised, customized keys kept, missing keys reported, every write happens while the spec is
//      correcting (Forge's watcher skips reloads then), values are boxed Integers, a failed boxing probe writes nothing, a value that
//      does not hold an Integer rolls the run back, and a second start changes nothing;
//   4. server_scripts/grindless/integration/ironfurnaces.js removes the FE augments, the heater and the Million furnace, and hides them;
//   5. the pins: Iron Furnaces 4.1.6, Sophisticated Storage and Core unchanged.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const PACK = path.join(ROOT, 'pack');
const TABLE_PATH = path.join(PACK, 'kubejs', 'data', 'grindless', 'tables', 'chest_furnace_tiers.json');
const TABLE = JSON.parse(fs.readFileSync(TABLE_PATH, 'utf8'));
const MIGRATION = path.join(PACK, 'kubejs', 'startup_scripts', 'grindless', 'integration', 'sophisticatedstorage_tiers.js');
const IF_SCRIPT = path.join(PACK, 'kubejs', 'server_scripts', 'grindless', 'integration', 'ironfurnaces.js');
const IF_CONFIG = path.join(PACK, 'config', 'ironfurnaces-client.toml');

const TIER_ORDER = ['Copper', 'Iron', 'Gold', 'Diamond', 'Netherite'];

// Sophisticated Storage 1.5.9.2197 (P3pp3rF1y/SophisticatedStorage@ca7444b, Config.java): [inventory slots, upgrade slots]
const SS_STOCK = { Copper: [45, 1], Iron: [54, 2], Gold: [81, 3], Diamond: [108, 4], Netherite: [132, 5] };
// limited barrels: baseSlotLimitMultiplier by size, then upgrade slots
const SS_LIMITED_STOCK = {
  Copper: { I: 53, II: 27, III: 17, IV: 13, up: 1 },
  Iron: { I: 64, II: 32, III: 20, IV: 16, up: 2 },
  Gold: { I: 96, II: 48, III: 30, IV: 24, up: 3 },
  Diamond: { I: 128, II: 64, III: 40, IV: 32, up: 4 },
  Netherite: { I: 160, II: 80, III: 50, IV: 40, up: 5 }
};
// Iron Furnaces 4.1.6 (Qelifern/IronFurnaces@50827ec4, Config.java): ticks per 200-tick recipe, the mod's tier order
const IF_STOCK = { copper_furnace: 180, iron_furnace: 160, silver_furnace: 140, gold_furnace: 120, diamond_furnace: 80, emerald_furnace: 40,
  crystal_furnace: 40, obsidian_furnace: 20, netherite_furnace: 5 };

const atLeastDouble = (stock, pack, max) => pack >= Math.min(2 * stock, max);

test('Sophisticated Storage table: stock values are the mod\'s, every metal tier at least doubled or at the engine bound', () => {
  const ss = TABLE.sophisticatedstorage;
  const [, maxSlots] = ss.bounds.inventorySlotCount;
  const [, maxUpg] = ss.bounds.upgradeSlotCount;
  assert.deepEqual(Object.keys(ss.storages.tiers), TIER_ORDER);
  assert.deepEqual(ss.storages.families, ['Chest', 'Barrel', 'ShulkerBox']);
  let prev = null;
  for (const tier of TIER_ORDER) {
    const t = ss.storages.tiers[tier];
    assert.deepEqual([t.inventorySlotCount[0], t.upgradeSlotCount[0]], SS_STOCK[tier], `${tier}: stock values`);
    const [s0, s1] = t.inventorySlotCount;
    const [u0, u1] = t.upgradeSlotCount;
    assert.ok(Number.isInteger(s1) && Number.isInteger(u1));
    assert.ok(s1 > s0 && u1 > u0, `${tier}: raised`);
    assert.ok(s1 <= maxSlots && u1 <= maxUpg, `${tier}: within the engine bounds`);
    assert.ok(atLeastDouble(s0, s1, maxSlots), `${tier}: slots ${s0} -> ${s1} is at least x2 or the bound ${maxSlots}`);
    assert.ok(atLeastDouble(u0, u1, maxUpg), `${tier}: upgrade slots ${u0} -> ${u1} is at least x2 or the bound ${maxUpg}`);
    if (prev) assert.ok(s1 >= prev.inventorySlotCount[1] && u1 > prev.upgradeSlotCount[1], `${tier}: not below the tier before`);
    prev = t;
  }
});

test('Sophisticated Storage table: limited barrels get at least twice the per-slot multiplier and upgrade slots', () => {
  const lb = TABLE.sophisticatedstorage.limitedBarrels;
  const [, maxMult] = TABLE.sophisticatedstorage.bounds.baseSlotLimitMultiplier;
  assert.deepEqual(lb.sizes, ['I', 'II', 'III', 'IV']);
  assert.deepEqual(Object.keys(lb.tiers), TIER_ORDER);
  for (const tier of TIER_ORDER) {
    const t = lb.tiers[tier];
    for (const size of lb.sizes) {
      const [m0, m1] = t.baseSlotLimitMultiplier[size];
      assert.equal(m0, SS_LIMITED_STOCK[tier][size], `${tier} ${size}: stock multiplier`);
      assert.ok(Number.isInteger(m1) && m1 <= maxMult && atLeastDouble(m0, m1, maxMult), `${tier} ${size}: ${m0} -> ${m1}`);
    }
    assert.equal(t.upgradeSlotCount[0], SS_LIMITED_STOCK[tier].up);
    assert.ok(atLeastDouble(t.upgradeSlotCount[0], t.upgradeSlotCount[1], 10));
  }
});

test('Iron Furnaces table: stock speeds are the mod\'s, every tier at least twice as fast or at the config floor', () => {
  const f = TABLE.ironfurnaces;
  const [floor] = f.bounds.speed;
  assert.equal(floor, 2);
  assert.deepEqual(Object.keys(f.speed).sort(), Object.keys(IF_STOCK).sort());
  for (const [id, [stock, pack]] of Object.entries(f.speed)) {
    assert.equal(stock, IF_STOCK[id], `${id}: stock speed`);
    assert.ok(Number.isInteger(pack) && pack >= floor && pack < stock, `${id}: ${stock} -> ${pack}`);
    assert.ok(pack <= Math.max(Math.floor(stock / 2), floor), `${id}: at least twice as fast (or the floor)`);
  }
  // tier order kept: a later tier is never slower than an earlier one
  const order = ['copper_furnace', 'iron_furnace', 'silver_furnace', 'gold_furnace', 'diamond_furnace', 'emerald_furnace', 'obsidian_furnace',
    'netherite_furnace'];
  for (let i = 1; i < order.length; i++) assert.ok(f.speed[order[i]][1] <= f.speed[order[i - 1]][1], `${order[i]} not slower than ${order[i - 1]}`);
  assert.deepEqual(f.settings, { 'misc.misc.rainbow': [true, false], 'misc.misc.web': [false, true], 'updates.check_updates.updates': [true, false] });
});

// tiny TOML reader for the Forge-style file: [a.b] tables and `key = value` lines (numbers, booleans)
function readToml(file) {
  const out = {};
  const tables = [];
  let table = '';
  for (const raw of fs.readFileSync(file, 'utf8').split('\n')) {
    const line = raw.trim();
    if (line === '' || line.startsWith('#')) continue;
    const t = /^\[([A-Za-z0-9_.]+)\]$/.exec(line);
    if (t) {
      table = t[1];
      tables.push(table);
      continue;
    }
    const kv = /^([A-Za-z0-9_]+) = (true|false|-?\d+)$/.exec(line);
    assert.ok(kv, `unexpected line in ${path.basename(file)}: ${line}`);
    out[`${table}.${kv[1]}`] = kv[2] === 'true' ? true : kv[2] === 'false' ? false : Number(kv[2]);
  }
  return { values: out, tables };
}

test('config/ironfurnaces-client.toml carries the table\'s speeds and settings', () => {
  const { values, tables } = readToml(IF_CONFIG);
  assert.ok(!tables.includes('general'), 'no empty [general] table (not in the mod\'s spec: Forge would rewrite the file)');
  for (const [id, [, pack]] of Object.entries(TABLE.ironfurnaces.speed)) assert.equal(values[`furnaces.${id}.speed`], pack, id);
  for (const [key, [, pack]] of Object.entries(TABLE.ironfurnaces.settings)) assert.equal(values[key], pack, key);
  // the Million furnace keeps the mod's values: it is off (no recipe), not tuned
  assert.equal(values['furnaces.rainbow_furnace.speed'], 20);
  for (const [k, v] of Object.entries(values)) {
    if (k.endsWith('.speed')) assert.ok(v >= (k.startsWith('modded_furnaces.') ? 1 : 2) && v <= 72000, k);
    if (k.endsWith('.tier')) assert.ok(v >= 0 && v <= 2, k);
  }
  assert.equal(Object.keys(values).length, 56, 'every key of the mod\'s client spec (Config.java: 36 furnace, 12 modded, 3 JEI, 4 misc, 1 update), nothing else');
});

// ---------------------------------------------------------------- the migration script against a ForgeConfigSpec stand-in

class FakeInteger {
  constructor(n) {
    this.v = n;
  }
}
const isInt = (x) => x instanceof FakeInteger;
const same = (a, b) => isInt(a) && isInt(b) && a.v === b.v;

function fakeList(items) {
  return { items, add(x) { items.push(x); return true; }, equals(o) { return o.items.length === items.length && items.every((x, i) => same(x, o.items[i])); } };
}

function sandbox({ values, intBoxing = true, storesDouble = false }) {
  const spec = { loaded: true, correcting: false, saves: 0, writesOutside: 0, writes: [], stringPathReads: 0 };
  const cvs = {};
  for (const [p, v] of Object.entries(values)) {
    cvs[p] = {
      raw: new FakeInteger(v),
      get() { return isInt(this.raw) ? this.raw.v : this.raw; },
      set(x) {
        if (!spec.correcting) spec.writesOutside++;
        this.raw = storesDouble && isInt(x) ? x.v + 0.0 : x;
        spec.writes.push([p, x]);
      }
    };
  }
  const SERVER_SPEC = {
    isLoaded: () => spec.loaded,
    getValues: () => ({
      get() { throw new Error('UnmodifiableConfig.get is ambiguous for Rhino ConsString paths'); },
      'get(java.lang.String)'(p) {
        spec.stringPathReads++;
        assert.equal(typeof p, 'string');
        return cvs[p] ?? null;
      }
    }),
    save() { if (!spec.correcting) spec.writesOutside++; spec.saves++; },
    correct(config, listener) {
      spec.correcting = true;
      try { listener('ADD', ['server'], null, {}); listener('ADD', ['server', 'x'], null, 1); } finally { spec.correcting = false; }
      return 2;
    }
  };
  const classes = {
    'net.p3pp3rf1y.sophisticatedstorage.Config': { SERVER_SPEC },
    'com.electronwill.nightconfig.core.CommentedConfig': { inMemory: () => ({}) },
    'java.lang.Integer': intBoxing ? FakeInteger : function (n) { return n; },
    'java.util.ArrayList': function () { return fakeList([]); },
    'java.util.stream.IntStream': { of: (n) => ({ boxed: () => ({ collect: () => fakeList([new FakeInteger(n)]) }) }) },
    'java.util.stream.Stream': { generate: (cv) => ({ limit: () => ({ collect: () => fakeList([cv.raw]) }) }) },
    'java.util.stream.Collectors': { toList: () => null }
  };
  const handlers = [];
  const logs = [];
  const ctx = {
    global: { grindless: { readJsonTable: () => JSON.parse(JSON.stringify(TABLE)) } },
    Java: { loadClass: (n) => { if (!(n in classes)) throw new Error('unexpected class ' + n); return classes[n]; } },
    ForgeEvents: { onEvent: (name, fn) => handlers.push([name, fn]) },
    console: { info: (s) => logs.push(['info', s]), error: (s) => logs.push(['error', s]) },
    Math, Number, String, Object, JSON, Error
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(MIGRATION, 'utf8'), ctx, { filename: MIGRATION });
  return { ctx, spec, cvs, handlers, logs, S: ctx.global.grindless.storageTiers };
}

function stockValues() {
  const out = {};
  for (const t of sandbox({ values: {} }).S.targets) out[t.path] = t.stock;
  return out;
}

test('migration: 70 keys from the table, applied on Forge\'s ServerAboutToStartEvent', () => {
  const { S, handlers } = sandbox({ values: {} });
  assert.equal(S.targets.length, 5 * 3 * 2 + 5 * 4 * 2);
  assert.deepEqual(handlers.map((h) => h[0]), ['net.minecraftforge.event.server.ServerAboutToStartEvent']);
  const iron = S.targets.find((t) => t.path === 'server.IronChest.inventorySlotCount');
  assert.deepEqual([iron.stock, iron.pack], [54, 108]);
  assert.ok(S.targets.some((t) => t.path === 'server.LimitedNetheriteBarrelIV.baseSlotLimitMultiplier' && t.pack === 80));
  assert.ok(S.targets.every((t) => !/Wood|LimitedBarrel(I|II|III|IV)\./.test(t.path)), 'wood storages untouched');
});

test('migration: concatenated NightConfig paths select the String overload for every key', () => {
  const sb = sandbox({ values: stockValues() });
  sb.S.apply('overload regression');
  assert.ok(sb.S.last.ok, sb.S.last.error);
  assert.equal(sb.spec.stringPathReads, 70);
  assert.equal(sb.S.last.raised.length, 70);
  assert.equal(sb.logs.filter(([level]) => level === 'error').length, 0);
});

test('migration: an existing world at stock values is raised in one guarded pass with boxed Integers', () => {
  const values = stockValues();
  delete values['server.LimitedGoldBarrelIII.upgradeSlotCount'];        // a key the mod no longer has
  values['server.DiamondChest.inventorySlotCount'] = 150;                // customized by the server owner
  const sb = sandbox({ values });
  sb.handlers[0][1]({});
  const r = sb.S.last;
  assert.ok(r.ok, r.error);
  assert.equal(r.raised.length, 68);
  assert.deepEqual(Array.from(r.kept), ['server.DiamondChest.inventorySlotCount=150']);
  assert.deepEqual(Array.from(r.missing), ['server.LimitedGoldBarrelIII.upgradeSlotCount']);
  assert.equal(sb.spec.writesOutside, 0, 'every write while the spec is correcting');
  assert.equal(sb.spec.saves, 1);
  assert.ok(sb.spec.writes.every(([, x]) => isInt(x)), 'boxed Integers only');
  assert.equal(sb.cvs['server.IronChest.inventorySlotCount'].get(), 108);
  assert.equal(sb.cvs['server.NetheriteShulkerBox.upgradeSlotCount'].get(), 10);
  assert.equal(sb.cvs['server.DiamondChest.inventorySlotCount'].get(), 150, 'customized value kept');
  for (const t of sb.S.targets) {
    const cv = sb.cvs[t.path];
    if (cv) assert.ok(cv.get() >= t.stock, `${t.path} never lowered`);
  }
  // the next start finds everything in place
  sb.S.apply('second start');
  assert.equal(sb.S.last.raised.length, 0);
  assert.equal(sb.S.last.already, 68);
  assert.equal(sb.spec.writes.length, 68);
});

test('migration: no boxing, nothing written; a value that is not an Integer rolls the run back', () => {
  const noBox = sandbox({ values: stockValues(), intBoxing: false });
  noBox.S.apply('probe');
  assert.equal(noBox.S.last.ok, false);
  assert.match(noBox.S.last.error, /nothing written/);
  assert.equal(noBox.spec.writes.length, 0);
  assert.ok(noBox.logs.some(([k]) => k === 'error'));

  const dbl = sandbox({ values: stockValues(), storesDouble: true });
  dbl.S.apply('double');
  assert.equal(dbl.S.last.ok, false);
  assert.match(dbl.S.last.error, /rolled back/);
  assert.equal(dbl.spec.writesOutside, 0);
  // the rollback writes the stock values back (as the same boxing would store them)
  assert.equal(dbl.cvs['server.IronChest.inventorySlotCount'].get(), 54);
});

test('migration: a server config that is not loaded is reported, not written', () => {
  const sb = sandbox({ values: stockValues() });
  sb.spec.loaded = false;
  sb.S.apply('unloaded');
  assert.equal(sb.S.last.ok, false);
  assert.equal(sb.spec.writes.length, 0);
});

test('ironfurnaces.js removes the FE augments, the heater and the Million furnace, and hides what cannot be made', () => {
  const removed = [];
  const tagged = [];
  let recipes = null;
  let tags = null;
  const ctx = {
    ServerEvents: { recipes: (fn) => { recipes = fn; }, tags: (kind, fn) => { assert.equal(kind, 'item'); tags = fn; } },
    Item: { exists: () => true },
    console: { info: () => {} }
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(IF_SCRIPT, 'utf8'), ctx, { filename: IF_SCRIPT });
  recipes({ forEachRecipe: () => {}, remove: (f) => removed.push(f) });
  tags({ add: (tag, id) => tagged.push([tag, id]) });
  const outputs = removed.filter((f) => f.output).map((f) => f.output);
  for (const n of ['augment_generator', 'augment_factory', 'heater', 'item_heater', 'million_furnace', 'rainbow_core', 'rainbow_plating']) {
    assert.ok(outputs.includes('ironfurnaces:' + n), n);
  }
  assert.ok(removed.some((f) => f.type === 'ironfurnaces:generator_blasting'));
  for (const n of ['augment_speed', 'augment_fuel', 'augment_blasting', 'augment_smoking', 'iron_furnace', 'upgrade_iron', 'netherite_furnace']) {
    assert.ok(!outputs.includes('ironfurnaces:' + n), `${n} stays`);
  }
  const hidden = tagged.filter(([t]) => t === 'c:hidden_from_recipe_viewers').map(([, id]) => id);
  assert.ok(hidden.includes('ironfurnaces:augment_generator') && hidden.includes('ironfurnaces:rainbow_coal') && hidden.includes('ironfurnaces:unobtainium_furnace'));
  assert.ok(!hidden.includes('ironfurnaces:iron_furnace'));
});

test('pins: Iron Furnaces 4.1.6 on both sides; Sophisticated Storage and Core unchanged', () => {
  const read = (n) => fs.readFileSync(path.join(PACK, 'mods', n), 'utf8');
  const iff = read('iron-furnaces.pw.toml');
  assert.match(iff, /filename = "ironfurnaces-1\.20\.1-4\.1\.6\.jar"/);
  assert.match(iff, /side = "both"/);
  assert.match(iff, /pin = true/);
  assert.match(iff, /version = "fGEswUMR"/);
  assert.match(read('sophisticated-storage.pw.toml'), /sophisticatedstorage-1\.20\.1-1\.5\.9\.2197\.jar/);
  assert.match(read('sophisticated-core.pw.toml'), /sophisticatedcore-1\.20\.1-1\.5\.15\.2427\.jar/);
});
