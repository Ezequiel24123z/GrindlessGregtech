// Static contracts of the wireless energy network's two libraries, no game needed:
//   - server_scripts/grindless/lib/wireless_registry.js: the list of blocks as an NBT list of compounds. Run against stand-ins of
//     Minecraft's CompoundTag / ListTag and a writer of NbtIo's binary format with DataOutput#writeUTF's 65,535-byte limit: the old single
//     JSON string fails past ~700 covers, the list of compounds writes and reads back thousands; legacy strings are converted and kept;
//     nothing unreadable is dropped.
//   - server_scripts/grindless/lib/wireless_adapters.js: how EU moves into and out of a machine, picked by the energy container's exact
//     class. Run against stand-ins that copy GTM 7.5.3's code: NotifiableEnergyContainer#changeEnergy, ElectricItem#charge/discharge,
//     FeCompat#insertEu, and ChargerMachine / BatteryBufferMachine's EnergyBatteryTrait (item-backed getEnergyStored, the inherited
//     changeEnergy writing a separate internal buffer). The charger case of the review is reproduced (the old path returns -55,904) and
//     the adapter charges the real item, exactly.
//   - lv/wireless_energy.js's settlement with both, in a stand-in world (the startup object, the libraries and the server script in one
//     sandbox): the numbers gg_test_wireless_adapters.js asserts in the game, the store's books when a machine's move fails a check, and
//     the list, the store and the endpoints across a cold restart (a second sandbox reading persistent data written in NbtIo's format),
//     as gg_test_wireless_restart.js does in the game.
//   - the LuV tier (package LuV-A4, at the end): the table's sixth row and its SMES cell, made in the HTS magnet works and not in the
//     assembler; what the startup script registers for it in the static stand-in of the whole pack (lib/kubejs_static.mjs), its
//     recipes, names and textures, its ids in a GTM 7.5.3 registry dump when one is on this machine; and the settlement at tier 6: the
//     jump (LuV only when every formed tower holds LuV cells), a 64 A LuV dynamo hatch's 19/20, and a 32-cell SMES tower's capacity
//     (past an int) through the registry and a cold restart.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const LIB = path.join(ROOT, 'pack', 'kubejs', 'server_scripts', 'grindless', 'lib');

// ---------------------------------------------------------------- NBT stand-ins (net.minecraft.nbt, 1.20.1 semantics)

class ByteTag { constructor(v) { this.v = v; } get id() { return 1; } copy() { return new ByteTag(this.v); } }
class IntTag { constructor(v) { this.v = v; } get id() { return 3; } copy() { return new IntTag(this.v); } }
class LongTag { constructor(v) { this.v = BigInt(v); } get id() { return 4; } copy() { return new LongTag(this.v); } }
class StringTag { constructor(v) { this.v = String(v); } get id() { return 8; } copy() { return new StringTag(this.v); } }

class ListTag {
  constructor() { this.items = []; this.type = 0; }
  get id() { return 9; }
  add(tag) {
    if (this.type !== 0 && tag.id !== this.type) throw new Error('ListTag: mixed element types');
    this.type = tag.id;
    this.items.push(tag);
    return true;
  }
  size() { return this.items.length; }
  getElementType() { return this.type; }
  getCompound(i) { const t = this.items[i]; return t && t.id === 10 ? t : new CompoundTag(); }
  copy() { const l = new ListTag(); this.items.forEach((t) => l.add(t.copy())); return l; }
}

class CompoundTag {
  constructor() { this.map = new Map(); }
  get id() { return 10; }
  put(k, tag) { this.map.set(k, tag); return null; }
  putString(k, v) { this.map.set(k, new StringTag(v)); }
  putInt(k, v) {
    if (!Number.isInteger(v) || v < -2147483648 || v > 2147483647) throw new Error('putInt: ' + v);
    this.map.set(k, new IntTag(v));
  }
  putLong(k, v) {
    if (!Number.isSafeInteger(v)) throw new Error('putLong: ' + v);
    this.map.set(k, new LongTag(v));
  }
  putBoolean(k, v) { this.map.set(k, new ByteTag(v ? 1 : 0)); }
  get(k) { return this.map.has(k) ? this.map.get(k) : null; }
  getTagType(k) { return this.map.has(k) ? this.map.get(k).id : 0; }
  contains(k, type) {
    if (type === undefined) return this.map.has(k);
    const id = this.getTagType(k);
    return id === type || (type === 99 && id >= 1 && id <= 6);
  }
  getString(k) { const t = this.map.get(k); return t && t.id === 8 ? t.v : ''; }
  getInt(k) { const t = this.map.get(k); return t && (t.id === 1 || t.id === 3) ? t.v : t && t.id === 4 ? Number(BigInt.asIntN(32, t.v)) : 0; }
  getLong(k) { const t = this.map.get(k); return t && (t.id === 1 || t.id === 3) ? t.v : t && t.id === 4 ? Number(t.v) : 0; }
  getBoolean(k) { const t = this.map.get(k); return !!(t && t.id === 1 && t.v !== 0); }
  getList(k, type) { const t = this.map.get(k); return t && t.id === 9 && (t.type === type || t.size() === 0) ? t : new ListTag(); }
  getCompound(k) { const t = this.map.get(k); return t && t.id === 10 ? t : new CompoundTag(); }
  remove(k) { this.map.delete(k); }
  copy() { const c = new CompoundTag(); this.map.forEach((t, k) => c.map.set(k, t.copy())); return c; }
}

// NbtIo's binary format (DataOutputStream: big-endian; writeUTF = 2-byte length + modified UTF-8, at most 65,535 bytes)
function utf(s) {
  const bytes = [];
  for (const ch of s) {
    const c = ch.codePointAt(0);
    if (c >= 0x0001 && c <= 0x007f) bytes.push(c);
    else if (c <= 0x07ff) bytes.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    else bytes.push(0xe0 | ((c >> 12) & 0x0f), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
  }
  if (bytes.length > 65535) throw new RangeError('UTFDataFormatException: encoded string too long: ' + bytes.length + ' bytes');
  return [bytes.length >> 8, bytes.length & 0xff, ...bytes];
}
function payload(tag, out) {
  if (tag.id === 1) out.push(tag.v & 0xff);
  else if (tag.id === 3) { const b = Buffer.alloc(4); b.writeInt32BE(tag.v); out.push(...b); }
  else if (tag.id === 4) { const b = Buffer.alloc(8); b.writeBigInt64BE(tag.v); out.push(...b); }
  else if (tag.id === 8) out.push(...utf(tag.v));
  else if (tag.id === 9) {
    out.push(tag.type);
    const b = Buffer.alloc(4); b.writeInt32BE(tag.size()); out.push(...b);
    tag.items.forEach((t) => payload(t, out));
  } else if (tag.id === 10) {
    tag.map.forEach((t, k) => { out.push(t.id, ...utf(k)); payload(t, out); });
    out.push(0);
  } else throw new Error('tag ' + tag.id);
}
function writeNbt(root) {
  const out = [10, ...utf('')];
  payload(root, out);
  return Buffer.from(out);
}
function readNbt(buf) {
  let o = 0;
  const str = () => { const n = buf.readUInt16BE(o); o += 2; const s = buf.toString('utf8', o, o + n); o += n; return s; };
  const read = (id) => {
    if (id === 1) return new ByteTag(buf.readInt8(o++));
    if (id === 3) { const v = buf.readInt32BE(o); o += 4; return new IntTag(v); }
    if (id === 4) { const v = buf.readBigInt64BE(o); o += 8; return new LongTag(v); }
    if (id === 8) return new StringTag(str());
    if (id === 9) {
      const type = buf.readUInt8(o++); const n = buf.readInt32BE(o); o += 4;
      const l = new ListTag(); for (let i = 0; i < n; i++) l.add(read(type)); return l;
    }
    if (id === 10) {
      const c = new CompoundTag();
      for (;;) { const t = buf.readUInt8(o++); if (t === 0) return c; const k = str(); c.map.set(k, read(t)); }
    }
    throw new Error('tag ' + id);
  };
  assert.equal(buf.readUInt8(o++), 10);
  str();
  return read(10);
}

// ---------------------------------------------------------------- loading the libraries

function load(file, extra = {}) {
  const sandbox = {
    console, JSON, Math, Number, String, Error, Array, Object, BigInt,
    Java: { loadClass: (name) => ({ 'net.minecraft.nbt.CompoundTag': CompoundTag, 'net.minecraft.nbt.ListTag': ListTag, 'net.minecraft.nbt.StringTag': StringTag })[name] },
    ...extra,
  };
  sandbox.global = sandbox;
  vm.runInNewContext(fs.readFileSync(path.join(LIB, file), 'utf8'), sandbox, { filename: file });
  return sandbox.grindless;
}

const R = load('wireless_registry.js').wirelessRegistry;
// what the sandbox returns, as this realm's plain objects (deepStrictEqual compares prototypes across realms)
const plain = (x) => JSON.parse(JSON.stringify(x));
const A = load('wireless_adapters.js').wirelessAdapters;

const cover = (i) => ({ k: 'cover', d: 'minecraft:overworld', x: 13312 + (i % 64), y: 100, z: 10000 + i, s: 'up', ck: 'energy', t: 1 });
const tower = { k: 'tower', d: 'minecraft:overworld', x: 13316, y: 100, z: 20, f: true, c: 7864320000, t: 5, n: 32 };
const hatch = { k: 'hatch', d: 'gcyr:luna', x: 13316, y: 200, z: 8, t: 1, a: 64 };
const dynamo = { k: 'dynamo', d: 'minecraft:overworld', x: 13348, y: 99, z: 4, t: 1, a: 64 };

// ---------------------------------------------------------------- the registry

test('wireless registry: canon gives every kind its fields in one order and refuses anything else', () => {
  const shuffled = { t: 1, ck: 'energy', s: 'up', z: 5, y: 100, x: 13312, d: 'minecraft:overworld', k: 'cover', extra: 'dropped' };
  assert.deepEqual(plain(Object.keys(R.canon(shuffled))), ['k', 'd', 'x', 'y', 'z', 's', 'ck', 't']);
  assert.deepEqual(plain(Object.keys(R.canon(tower))), ['k', 'd', 'x', 'y', 'z', 'f', 'c', 't', 'n']);
  assert.throws(() => R.canon({ ...cover(0), t: '1' }), /t is not a whole number/);
  assert.throws(() => R.canon({ ...cover(0), x: 1.5 }), /x is not a whole number/);
  assert.throws(() => R.canon({ ...tower, f: 1 }), /f is not true or false/);
  assert.throws(() => R.canon({ ...hatch, a: undefined }), /a is not a whole number/);
  assert.throws(() => R.canon({ k: 'pipe' }), /unknown kind/);
  assert.throws(() => R.canon({ ...cover(0), x: 2 ** 31 }), /does not fit an int/);
});

test('wireless registry: every kind round-trips through a compound, a tower capacity past an int included', () => {
  for (const e of [tower, hatch, dynamo, cover(7)]) {
    const t = R.toTag(e);
    assert.deepEqual(plain(R.fromTag(t)), plain(R.canon(e)));
  }
  assert.equal(R.toTag(tower).getTagType('c'), 4, 'the capacity is a long');
  assert.equal(R.toTag(tower).getTagType('f'), 1, 'formed is a byte');
});

test('wireless registry: the old JSON string cannot be saved past ~700 covers; the list of compounds saves and reads back 5,000', () => {
  const big = Array.from({ length: 1000 }, (_, i) => R.canon(cover(i)));
  // the old format: the whole list in one string tag
  let firstTooBig = 0;
  for (let n = 600; n <= 1000 && !firstTooBig; n++) if (Buffer.byteLength(JSON.stringify(big.slice(0, n))) > 65535) firstTooBig = n;
  assert.ok(firstTooBig > 600 && firstTooBig < 800, 'the old single string passes 65,535 bytes at ' + firstTooBig + ' covers');
  const old = new CompoundTag();
  old.putString('grindless_wireless_blocks', JSON.stringify(big));
  assert.throws(() => writeNbt(old), /UTFDataFormatException/);
  // the new format
  const list = Array.from({ length: 5000 }, (_, i) => R.canon(cover(i)));
  const pd = new CompoundTag();
  pd.put('grindless_wireless_blocks', R.write(list.concat([tower, hatch, dynamo].map(R.canon))));
  const bytes = writeNbt(pd);
  assert.ok(bytes.length > 4 * 65535, 'a ' + bytes.length + '-byte save, far past the old limit');
  const back = R.read(readNbt(bytes), 'grindless_wireless_blocks', 'grindless_wireless_blocks_legacy');
  assert.equal(back.migrated, false);
  assert.deepEqual(plain(back.notes), []);
  assert.equal(JSON.stringify(back.list), JSON.stringify(list.concat([tower, hatch, dynamo].map(R.canon))));
});

test('wireless registry: a list in the old string format is converted once, and the string kept aside', () => {
  const entries = [tower, hatch, cover(1)];
  const pd = new CompoundTag();
  pd.putString('grindless_wireless_blocks', JSON.stringify(entries));
  const r = R.read(pd, 'grindless_wireless_blocks', 'grindless_wireless_blocks_legacy');
  assert.equal(r.migrated, true);
  assert.equal(r.backup, 'grindless_wireless_blocks_legacy');
  assert.equal(pd.getString('grindless_wireless_blocks_legacy'), JSON.stringify(entries));
  assert.equal(pd.getTagType('grindless_wireless_blocks'), 9);
  assert.deepEqual(plain(r.list), plain(entries.map(R.canon)));
  assert.match(r.notes.join(' '), /converted 3 entries/);
  const again = R.read(pd, 'grindless_wireless_blocks', 'grindless_wireless_blocks_legacy');
  assert.equal(again.migrated, false, 'converted only once');
  assert.deepEqual(plain(again.list), plain(entries.map(R.canon)));
});

test('wireless registry: nothing unreadable is dropped (a bad JSON string, a bad entry, a stray tag)', () => {
  // an unparseable old string: kept under the backup key (a second backup does not overwrite the first), the list starts empty
  const pd = new CompoundTag();
  pd.putString('grindless_wireless_blocks_legacy', 'an older backup');
  pd.putString('grindless_wireless_blocks', '[{"k":"cover",');
  const r = R.read(pd, 'grindless_wireless_blocks', 'grindless_wireless_blocks_legacy');
  assert.equal(r.backup, 'grindless_wireless_blocks_legacy_2');
  assert.equal(pd.getString('grindless_wireless_blocks_legacy'), 'an older backup');
  assert.equal(pd.getString('grindless_wireless_blocks_legacy_2'), '[{"k":"cover",');
  assert.deepEqual(plain(r.list), []);
  assert.match(r.notes.join(' '), /could not be parsed/);
  // an old entry that is not valid stays, as a bad entry, and is written back
  const pd2 = new CompoundTag();
  pd2.putString('grindless_wireless_blocks', JSON.stringify([cover(1), { k: 'cover', d: 'x' }]));
  const r2 = R.read(pd2, 'grindless_wireless_blocks', 'grindless_wireless_blocks_legacy');
  assert.equal(r2.list.length, 2);
  assert.ok(r2.list[1].bad);
  const saved = R.write(r2.list);
  assert.equal(saved.size(), 2);
  assert.equal(saved.getCompound(1).getString('json'), JSON.stringify({ k: 'cover', d: 'x' }));
  // a compound that is not an entry stays as it was
  const odd = new CompoundTag();
  odd.putString('k', 'cover');
  odd.putString('d', 'minecraft:overworld');
  const list = R.write([cover(2)]);
  list.add(odd);
  const pd3 = new CompoundTag();
  pd3.put('grindless_wireless_blocks', list);
  const r3 = R.read(pd3, 'grindless_wireless_blocks', 'grindless_wireless_blocks_legacy');
  assert.equal(r3.migrated, false);
  assert.ok(r3.list[1].bad && /without x/.test(r3.list[1].bad));
  assert.equal(R.write(r3.list).getCompound(1).getString('d'), 'minecraft:overworld');
  // any other tag type under the key: kept aside
  const pd4 = new CompoundTag();
  pd4.putInt('grindless_wireless_blocks', 7);
  const r4 = R.read(pd4, 'grindless_wireless_blocks', 'grindless_wireless_blocks_legacy');
  assert.equal(pd4.getTagType('grindless_wireless_blocks_legacy'), 3);
  assert.match(r4.notes.join(' '), /NBT type 3/);
});

// ---------------------------------------------------------------- GTM 7.5.3 stand-ins for the adapters

const V = [8, 32, 128, 512, 2048, 8192, 32768, 131072];
const cls = (name) => ({ getName: () => name });
const PLAIN = 'com.gregtechceu.gtceu.api.machine.trait.NotifiableEnergyContainer';
const RECIPE_AMPS = 'com.gregtechceu.gtceu.api.machine.trait.RecipeAmperageEnergyContainer';
const CHARGER = 'com.gregtechceu.gtceu.common.machine.electric.ChargerMachine$EnergyBatteryTrait';
const BUFFER = 'com.gregtechceu.gtceu.common.machine.electric.BatteryBufferMachine$EnergyBatteryTrait';
const LONG_MAX = Number.MAX_SAFE_INTEGER; // stands for Long.MAX_VALUE: the adapter must never send it

// NotifiableEnergyContainer: one stored number; changeEnergy exactly as GTM 7.5.3 (it reads getEnergyStored(), which subclasses override)
class Container {
  constructor(name, capacity, stored = 0) { this.name = name; this.energyCapacity = capacity; this.energyStored = stored; }
  getClass() { return cls(this.name); }
  getEnergyStored() { return this.energyStored; }
  getEnergyCapacity() { return this.energyCapacity; }
  setEnergyStored(v) { this.energyStored = v; }
  changeEnergy(add) {
    const old = this.getEnergyStored();
    let now = this.energyCapacity - old < add ? this.energyCapacity : old + add;
    if (now < 0) now = 0;
    this.setEnergyStored(now);
    return now - old;
  }
  checkOutputSubscription() { this.checked = (this.checked || 0) + 1; }
}

// ElectricItem#charge / #discharge as GTM 7.5.3
function electric({ max, charge = 0, tier = 1, transfer = V[tier], chargeable = true, external = true }) {
  return {
    max, value: charge, tier, transfer, chargeable, external,
    getCharge() { return this.value; },
    getMaxCharge() { return this.max; },
    getTier() { return this.tier; },
    getTransferLimit() { return this.transfer; },
    canProvideChargeExternally() { return this.external; },
    charge(amount, chargerTier, ignoreTransferLimit, simulate) {
      assert.notEqual(amount, LONG_MAX);
      if ((this.chargeable || amount === LONG_MAX) && chargerTier >= this.tier && amount > 0) {
        const room = this.max - this.value;
        if (!ignoreTransferLimit) amount = Math.min(amount, this.transfer);
        const got = Math.min(amount, room);
        if (!simulate) this.value += got;
        return got;
      }
      return 0;
    },
    discharge(amount, chargerTier, ignoreTransferLimit, externally, simulate) {
      assert.notEqual(amount, LONG_MAX);
      if ((this.external || !externally || amount === LONG_MAX) && chargerTier >= this.tier && amount > 0) {
        if (!ignoreTransferLimit) amount = Math.min(amount, this.transfer);
        const got = Math.min(amount, this.value);
        if (!simulate) this.value -= got;
        return got;
      }
      return 0;
    },
  };
}

// a Forge Energy item, and FeCompat#insertEu as GTM 7.5.3 (euToFeRatio 4)
function feItem(maxFe, fe = 0) {
  return {
    maxFe, fe,
    getEnergyStored() { return this.fe; },
    getMaxEnergyStored() { return this.maxFe; },
    receiveEnergy(n, simulate) { const got = Math.min(n, this.maxFe - this.fe); if (!simulate) this.fe += got; return got; },
  };
}
function insertEu(storage, eu, simulate) {
  const sent = storage.receiveEnergy(Math.min(2147483647, eu * 4), true);
  return Math.floor(storage.receiveEnergy(sent - (sent % 4), simulate) / 4);
}

const stack = (item) => (item ? { isEmpty: () => false, ...item } : { isEmpty: () => true });
const inventory = (stacks) => ({ getSlots: () => stacks.length, getStackInSlot: (i) => stacks[i] });

// the item machines' EnergyBatteryTrait: getEnergyStored / getEnergyCapacity are the items' (GT charge, FE / 4); changeEnergy is inherited
class ItemTrait extends Container {
  constructor(name, machineRef, capacity) { super(name, capacity); this.machineRef = machineRef; }
  items() { return this.machineRef.stacks.filter((s) => !s.isEmpty()); }
  getEnergyStored() { return this.items().reduce((a, s) => a + (s.e ? s.e.getCharge() : Math.floor(s.fe.getEnergyStored() / 4)), 0); }
  getEnergyCapacity() { return this.items().reduce((a, s) => a + (s.e ? s.e.getMaxCharge() : Math.floor(s.fe.getMaxEnergyStored() / 4)), 0); }
}

function machine(kind, { tier = 1, slots = [], enabled = true } = {}) {
  const m = { tier, enabled, stacks: slots.map(stack), dirty: 0 };
  m.getTier = () => m.tier;
  m.isWorkingEnabled = () => m.enabled;
  m.markDirty = () => { m.dirty++; };
  if (kind === CHARGER) { m.energyContainer = new ItemTrait(CHARGER, m, V[tier] * slots.length * 32); m.getChargerInventory = () => inventory(m.stacks); }
  else if (kind === BUFFER) { m.energyContainer = new ItemTrait(BUFFER, m, V[tier] * slots.length * 32); m.getBatteryInventory = () => inventory(m.stacks); }
  return m;
}

const deps = {
  V: (t) => V[t],
  nativeEUToFE: () => true,
  electricItem: (s) => s.e || null,
  feItem: (s) => s.fe || null,
  insertEu,
  ampsPerItem: (spec) => (spec.amps === 'AMPS_PER_ITEM' ? 4 : 2),
};
const ad = A.create(deps);
const TICKS = 10;
const LV_COVER = 2 * 32 * TICKS; // 640: an LV cover's limit per settlement

// ---------------------------------------------------------------- the adapters

test('wireless adapters: the exact container class picks the path; anything unknown is unsupported', () => {
  const kind = (name) => ad.classify({ energyContainer: new Container(name, 1) }).kind;
  assert.equal(kind(PLAIN), 'plain');
  assert.equal(kind(RECIPE_AMPS), 'plain');
  assert.equal(kind(CHARGER), 'items');
  assert.equal(kind(BUFFER), 'items');
  for (const other of ['com.gregtechceu.gtceu.common.machine.trait.ConverterTrait', 'com.gregtechceu.gtceu.api.machine.trait.NotifiableLaserContainer',
    'com.gregtechceu.gtceu.utils.InfiniteEnergyContainer', 'com.example.SomeMachine$1', PLAIN + 'X']) {
    assert.equal(kind(other), 'unsupported', other);
  }
  assert.equal(ad.classify({}).kind, 'none');
  const odd = ad.classify({ energyContainer: new Container('com.example.Odd', 100) });
  assert.throws(() => ad.fill(odd, 10, TICKS), (e) => /no energy adapter/.test(e.message) && e.measured === 0);
  assert.throws(() => ad.drain(odd, 10, TICKS), (e) => /no energy adapter/.test(e.message) && e.measured === 0);
  assert.throws(() => ad.room(odd, 10, TICKS), /no energy adapter/);
});

test('wireless adapters: the review\'s charger (LV, 4 slots, a battery at 60,000 EU, 4,096 in the internal buffer) - old path vs adapter', () => {
  const battery = electric({ max: 120000, charge: 60000 });
  const old = machine(CHARGER, { slots: [{ e: battery }, null, null, null] });
  old.energyContainer.energyStored = 4096;
  // the old network called changeEnergy on it: GTM's inherited method reads the items (60,000) against the internal capacity (4,096)
  assert.equal(old.energyContainer.energyCapacity, 4096);
  assert.equal(old.energyContainer.changeEnergy(640), -55904, 'the old path: "-55,904 went in", the battery untouched');
  assert.equal(battery.getCharge(), 60000);
  // the adapter charges the real item, exactly, and leaves the internal buffer alone
  const fresh = electric({ max: 120000, charge: 60000 });
  const m = machine(CHARGER, { slots: [{ e: fresh }, null, null, null] });
  m.energyContainer.energyStored = 4096;
  const a = ad.classify(m);
  assert.equal(ad.room(a, LV_COVER, TICKS), 640);
  let bank = 1000;
  for (let s = 1; s <= 3; s++) {
    const got = ad.fill(a, Math.min(ad.room(a, LV_COVER, TICKS), bank), TICKS);
    bank -= got;
    assert.equal(got, Math.max(0, Math.min(640, 1000 - 640 * (s - 1))), 'settlement ' + s + ': 640, then the 360 left, then nothing');
  }
  assert.equal(bank, 0, 'the bank pays exactly what the item took, never more');
  assert.equal(fresh.getCharge(), 61000);
  assert.equal(m.energyContainer.energyStored, 4096, 'the internal buffer is never touched');
  assert.ok(m.dirty > 0);
});

test('wireless adapters: charger with an empty, a nearly full and a disabled battery; GTM\'s per-item limit', () => {
  const empty = electric({ max: 120000 });
  const m = machine(CHARGER, { slots: [{ e: empty }, null, null, null] });
  const a = ad.classify(m);
  for (let s = 1; s <= 3; s++) assert.equal(ad.fill(a, ad.room(a, LV_COVER, TICKS), TICKS), 640);
  assert.equal(empty.getCharge(), 1920, 'three settlements of an LV cover: 3 x 640');
  // nearly full: exactly what is left, then nothing
  const near = electric({ max: 120000, charge: 119900 });
  const n = ad.classify(machine(CHARGER, { slots: [{ e: near }] }));
  assert.equal(ad.room(n, LV_COVER, TICKS), 100);
  assert.equal(ad.fill(n, 640, TICKS), 100, 'finite: it takes what it has room for');
  assert.equal(ad.room(n, LV_COVER, TICKS), 0);
  assert.equal(ad.fill(n, 640, TICKS), 0);
  assert.equal(near.getCharge(), 120000);
  // disabled (soft mallet): GTM's side condition, nothing moves
  const off = electric({ max: 120000 });
  const d = ad.classify(machine(CHARGER, { slots: [{ e: off }], enabled: false }));
  assert.equal(ad.room(d, LV_COVER, TICKS), 0);
  assert.equal(ad.fill(d, 640, TICKS), 0);
  assert.equal(off.getCharge(), 0);
  // GTM's per-item limit: V[item tier] x 4 A per tick, x 10 ticks; an item above the charger's tier takes nothing
  const big = ad.classify(machine(CHARGER, { tier: 3, slots: [{ e: electric({ max: 10 ** 7, tier: 1 }) }] }));
  assert.equal(ad.room(big, 10 ** 6, TICKS), 32 * 4 * 10);
  const above = ad.classify(machine(CHARGER, { tier: 1, slots: [{ e: electric({ max: 10 ** 7, tier: 2 }) }] }));
  assert.equal(ad.room(above, 640, TICKS), 0);
  // an item that is not chargeable (GTM: chargeable false) takes nothing
  const fixed = ad.classify(machine(CHARGER, { slots: [{ e: electric({ max: 1000, chargeable: false }) }] }));
  assert.equal(ad.fill(fixed, 640, TICKS), 0);
});

test('wireless adapters: Forge Energy items in a charger take whole EU only (GTM\'s FeCompat, 4 FE = 1 EU)', () => {
  const fe = feItem(10000, 0);
  const a = ad.classify(machine(CHARGER, { slots: [{ fe }] }));
  assert.equal(ad.fill(a, 640, TICKS), 640);
  assert.equal(fe.getEnergyStored(), 2560);
  const almost = feItem(10000, 9998);
  const b = ad.classify(machine(CHARGER, { slots: [{ fe: almost }] }));
  assert.equal(ad.room(b, 640, TICKS), 0, '2 FE of room is less than one EU');
  assert.equal(ad.fill(b, 640, TICKS), 0);
  assert.equal(almost.getEnergyStored(), 9998);
});

test('wireless adapters: battery buffer - charging, and giving at GTM\'s rate (min(V, transfer limit) per battery per tick)', () => {
  const batteries = [electric({ max: 120000, charge: 50000 }), electric({ max: 120000, charge: 50000 }), electric({ max: 120000, charge: 50000 }),
    electric({ max: 120000, charge: 50000 })];
  const m = machine(BUFFER, { slots: batteries.map((e) => ({ e })) });
  const a = ad.classify(m);
  assert.equal(ad.available(a, LV_COVER, TICKS), 640);
  assert.equal(ad.drain(a, 640, TICKS), 640);
  assert.equal(batteries.reduce((s, b) => s + b.getCharge(), 0), 200000 - 640);
  assert.ok(m.energyContainer.checked > 0, 'the buffer re-checks its output, as GTM does');
  // one battery gives at most 32 EU per tick (LV, its transfer limit): 320 in a settlement
  const one = ad.classify(machine(BUFFER, { slots: [{ e: electric({ max: 120000, charge: 50000 }) }] }));
  assert.equal(ad.available(one, LV_COVER, TICKS), 320);
  assert.equal(ad.drain(one, 640, TICKS), 320);
  // a battery that cannot give charge to a machine (GTM: canProvideChargeExternally false) is left alone
  const tool = electric({ max: 120000, charge: 50000, external: false });
  const t = ad.classify(machine(BUFFER, { slots: [{ e: tool }] }));
  assert.equal(ad.available(t, LV_COVER, TICKS), 0);
  assert.equal(ad.drain(t, 640, TICKS), 0);
  assert.equal(tool.getCharge(), 50000);
  // charging the buffer's batteries
  const flat = electric({ max: 120000 });
  const f = ad.classify(machine(BUFFER, { slots: [{ e: flat }] }));
  assert.equal(ad.fill(f, 640, TICKS), 640);
  assert.equal(flat.getCharge(), 640);
  // a charger gives nothing (GTM: its output voltage is 0, and the adapter refuses)
  const ch = ad.classify(machine(CHARGER, { slots: [{ e: electric({ max: 1000, charge: 1000 }) }] }));
  assert.throws(() => ad.available(ch, 640, TICKS), /no energy adapter gives EU/);
  assert.throws(() => ad.drain(ch, 640, TICKS), (e) => e.measured === 0);
});

test('wireless adapters: plain containers move exactly through changeEnergy, and a container that lies is caught with what it really did', () => {
  const c = new Container(PLAIN, 1000, 900);
  const a = ad.classify({ energyContainer: c });
  assert.equal(ad.room(a, 640, TICKS), 100);
  assert.equal(ad.fill(a, 640, TICKS), 100, 'GTM clamps at the capacity and says so');
  assert.equal(ad.available(a, 640, TICKS), 640);
  assert.equal(ad.drain(a, 640, TICKS), 640);
  assert.equal(c.getEnergyStored(), 360);
  // a plain-named container whose changeEnergy reports more than it stores: the check throws and carries the measured change
  const liar = new Container(PLAIN, 1000, 0);
  liar.changeEnergy = function (add) { this.energyStored += add / 2; return add; };
  const l = ad.classify({ energyContainer: liar });
  assert.throws(() => ad.fill(l, 600, TICKS), (e) => /asked 600, moved 600, stored 0 -> 300/.test(e.message) && e.measured === 300);
  // an item that throws midway: the error carries what the items really took before it
  const good = electric({ max: 1000 });
  const bad = electric({ max: 1000 });
  bad.charge = () => { throw new Error('broken item'); };
  const mixed = ad.classify(machine(CHARGER, { slots: [{ e: good }, { e: bad }] }));
  assert.throws(() => ad.fill(mixed, 1500, TICKS), (e) => /broken item/.test(e.message) && e.measured === 1000);
  assert.equal(good.getCharge(), 1000);
});

// ---------------------------------------------------------------- the settlement itself (lv/wireless_energy.js), in a stand-in world
// One "JVM": the startup script's object (its registrations are stubs; only its data runs), the two libraries and the server script,
// in one sandbox with the game's classes replaced by the stand-ins above. A second jvm() on the same world and a persistent-data
// compound written and read in NbtIo's format is a cold restart: a new global, new totals, flows and faults, the list read from disk.

const PACK = path.join(ROOT, 'pack');
const STARTUP_SCRIPT = path.join(PACK, 'kubejs', 'startup_scripts', 'grindless', 'lv', 'wireless_energy.js');
const SERVER_SCRIPT = path.join(PACK, 'kubejs', 'server_scripts', 'grindless', 'lv', 'wireless_energy.js');
const VA = [7, 30, 120, 480, 1920, 7680, 30720, 122880];
const SIDE = Object.fromEntries(['down', 'up', 'north', 'south', 'west', 'east'].map((n) => [n, { name: n, getName: () => n }]));
const text = (key, ...args) => {
  const t = { key, args, getString: () => key, getContents: () => ({ getKey: () => key, getArgs: () => args }) };
  t.gold = t.aqua = t.red = () => t;
  return t;
};
class Pos {
  constructor(x, y, z) { this.x = x; this.y = y; this.z = z; }
  getX() { return this.x; }
  getY() { return this.y; }
  getZ() { return this.z; }
}
const at = (p) => p.getX() + ',' + p.getY() + ',' + p.getZ();
const iterator = (list) => { let i = 0; return { hasNext: () => i < list.length, next: () => list[i++] }; };

const PATTERNS_SCRIPT = path.join(PACK, 'kubejs', 'startup_scripts', 'grindless', 'lib', 'patterns.js');

// opts: overlays (test scripts loaded last), clock ({ now }: Date.now in the sandbox), disk (path -> NbtIo bytes, for NBTIO.read)
function jvm(opts = {}) {
  const ticks = [];
  const errors = [];
  const lines = [];
  const commands = {};
  const classes = {
    'net.minecraft.nbt.CompoundTag': CompoundTag, 'net.minecraft.nbt.ListTag': ListTag, 'net.minecraft.nbt.StringTag': StringTag,
    'net.minecraft.core.BlockPos': Pos,
    'net.minecraft.core.Direction': { byName: (n) => SIDE[n] || null, values: () => Object.values(SIDE), UP: SIDE.up },
    'net.minecraft.resources.ResourceLocation': class { constructor(id) { this.id = id; } },
    'net.minecraft.world.phys.AABB': class { constructor(...a) { this.a = a; } },
    'net.minecraft.world.entity.item.ItemEntity': {},
    'net.minecraft.world.level.storage.LevelResource': class { constructor(name) { this.name = name; } },
    'net.minecraftforge.common.util.FakePlayerFactory': { getMinecraft: () => ({ fake: true }) },
    'com.gregtechceu.gtceu.api.machine.MetaMachine': { getMachine: (level, pos) => level.machines.get(at(pos)) || null },
    'com.gregtechceu.gtceu.api.registry.GTRegistries': { COVERS: { get: () => null } },
    'com.gregtechceu.gtceu.api.capability.ICoverable': {},
    'com.gregtechceu.gtceu.utils.GTUtil': { getTierByVoltage: (v) => { let t = 0; while (t < V.length - 1 && V[t] < v) t++; return t; } },
    'com.gregtechceu.gtceu.utils.FormattingUtil': { formatNumbers: (n) => String(n) },
    'java.util.UUID': {},
    'com.gregtechceu.gtceu.api.capability.GTCapabilityHelper': { getElectricItem: (s) => s.e || null, getForgeEnergyItem: (s) => s.fe || null },
    'com.gregtechceu.gtceu.api.capability.compat.FeCompat': { insertEu },
    'com.gregtechceu.gtceu.config.ConfigHolder': { INSTANCE: { compat: { energy: { nativeEUToFE: true } } } },
    'com.gregtechceu.gtceu.common.machine.electric.ChargerMachine': { AMPS_PER_ITEM: 4 },
    'com.gregtechceu.gtceu.common.machine.electric.BatteryBufferMachine': { AMPS_PER_BATTERY: 2 },
  };
  const sandbox = {
    console: { info: (m) => lines.push(String(m)), log() {}, warn() {}, error: (m) => errors.push(String(m)) },
    JSON, Math, Number, String, Error, Array, Object, BigInt,
    Date: opts.clock ? { now: () => opts.clock.now } : Date,
    Java: { loadClass: (name) => { if (!(name in classes)) throw new Error('no stand-in for ' + name); return classes[name]; } },
    GTValues: { V, VA, VN: ['ULV', 'LV', 'MV', 'HV', 'EV', 'IV', 'LuV', 'ZPM'] },
    Text: { translate: text, of: (s) => text(s) },
    Item: { of: simItem },
    NBTIO: { read: (p) => (opts.disk && opts.disk.has(p) ? readNbt(opts.disk.get(p)) : null) },
    StartupEvents: { registry() {} },
    ForgeModEvents: { onGenericEvent() {} },
    GTCEuStartupEvents: { registry() {} },
    ServerEvents: { tick: (fn) => ticks.push(fn), recipes() {}, customCommand: (name, fn) => { commands[name] = fn; } },
    BlockEvents: { rightClicked() {}, placed() {}, broken() {} },
  };
  sandbox.global = kubejsGlobal();
  sandbox.global.grindless = { readJsonTable: (p) => JSON.parse(fs.readFileSync(path.join(PACK, p), 'utf8')) };
  vm.createContext(sandbox);
  // KubeJS's Rhino (2001) answers String#charCodeAt with a java.lang.Character (NativeString, Id_charCodeAt: `return c`): arithmetic
  // makes it NaN (ScriptRuntime#toNumber of a non-JS object), String() gives the character back. Patched on this realm's own
  // String.prototype, the one the sandbox's string primitives use (the test's realm keeps the real one).
  vm.runInContext(`(function () {
    var proto = ('').constructor.prototype;
    var charAt = proto.charAt;
    proto.charCodeAt = function (i) {
      var s = '' + this;
      var p = Math.trunc(Number(i)) || 0;
      if (p < 0 || p >= s.length) return NaN;
      var ch = charAt.call(s, p);
      return { javaClass: 'java.lang.Character', valueOf: function () { return NaN; }, toString: function () { return ch; } };
    };
  })()`, sandbox);
  const runFile = (f) => vm.runInContext(fs.readFileSync(f, 'utf8'), sandbox, { filename: path.basename(f) });
  runFile(PATTERNS_SCRIPT);
  runFile(STARTUP_SCRIPT);
  const G = sandbox.global.grindless;
  const W = G.wireless;
  // what GTM's machine registration does through Pat.build: the tower's structure described for the tests
  G.patterns.register(W.towerId, W.towerSpec);
  Object.values(W.covers).forEach((c) => { W.coverDefinitions[c.def] = { id: c.def }; });
  for (const f of [path.join(LIB, 'wireless_registry.js'), path.join(LIB, 'wireless_adapters.js'), SERVER_SCRIPT].concat(opts.overlays || [])) runFile(f);
  // the game's tick: the server script's handler settles every settleTicks ticks unless paused
  const run = (server, n) => { for (let i = 0; i < n; i++) { server.tick++; ticks.forEach((fn) => fn({ server })); } };
  return { W, G, run, errors, lines, commands, ticks, sandbox, global: sandbox.global };
}

// KubeJS 2001.6.5's `global` is a Java HashMap<String, Object> (BuiltinKubeJSPlugin.GLOBAL) behind Rhino's NativeJavaMap: a value goes in
// through Context.jsToJava (a JS number becomes a java.lang.Double) and comes out through ValueUnwrapper.DEFAULT and the default
// WrapFactory, whose javaPrimitiveWrap KubeJS never turns off, so a stored number or string comes back as a wrapped Java object. Rhino's
// interpreter then takes `wrapped === 1` (a number literal) as false (Interpreter#doShallowEquals does not unwrap), while `=== true`
// unwraps (ScriptRuntime#shallowEq) and String() gives the text. The stand-in keeps that: numbers and strings come back as objects (a
// number's text is Java's, "1.0"), booleans and script objects as they were stored. `kubejsGlobal.stored(g)` reads what was stored.
const STORED = Symbol('stored');
function kubejsGlobal() {
  const map = new Map();
  const wrap = (v) => {
    if (typeof v === 'number') return { javaClass: 'java.lang.Double', valueOf: () => v, toString: () => (Number.isInteger(v) ? v.toFixed(1) : String(v)) };
    if (typeof v === 'string') return { javaClass: 'java.lang.String', valueOf: () => v, toString: () => v };
    return v;
  };
  return new Proxy({}, {
    get: (_, k) => (k === STORED ? map : typeof k === 'string' && map.has(k) ? wrap(map.get(k)) : undefined),
    set: (_, k, v) => { map.set(k, v); return true; },
    has: (_, k) => map.has(k),
    deleteProperty: (_, k) => map.delete(k),
  });
}
kubejsGlobal.stored = (g, key) => g[STORED].get(key);

// an item stack: GTM's LV batteries carry an electric item (empty), anything else none
const BATTERY_MAX = { 'gtceu:lv_lithium_battery': 120000, 'gtceu:lv_sodium_battery': 80000 };
function simItem(id, count = 1) {
  return { id, count, isEmpty: () => false, e: BATTERY_MAX[id] ? electric({ max: BATTERY_MAX[id], tier: 1 }) : undefined };
}

class Level {
  constructor(dim, loaded = true) { this.dimension = dim; this.loaded = loaded; this.blocks = new Map(); this.machines = new Map(); }
  isLoaded() { return this.loaded; }
  getBlock(pos) { return { id: this.blocks.get(at(pos)) || 'minecraft:air' }; }
  put(x, y, z, id, m) { this.blocks.set(x + ',' + y + ',' + z, id); if (m) this.machines.set(x + ',' + y + ',' + z, m); return m; }
}

// a machine that takes covers (GTM's ICoverable: one cover per side) and, for the item machines, its voltages
function coverable(m, input, output) {
  const covers = new Map();
  m.covers = covers;
  m.getCoverContainer = () => ({
    getCoverAtSide: (s) => covers.get(s) || null,
    placeCoverOnSide: (s, stack, def) => { covers.set(s, { coverDefinition: { getId: () => def.id } }); return true; },
  });
  if (m.energyContainer) {
    m.energyContainer.getInputVoltage = () => input;
    m.energyContainer.getOutputVoltage = () => output;
  }
  return m;
}
const item = (id) => ({ id });

// the world of the native tests: a tower with 4 LV cells in the Overworld and the levels; the server around them
function world() {
  const levels = { 'minecraft:overworld': new Level('minecraft:overworld'), 'gcyr:luna': new Level('gcyr:luna'), 'minecraft:the_end': new Level('minecraft:the_end', false) };
  const earth = levels['minecraft:overworld'];
  const cells = [];
  for (let i = 0; i < 4; i++) { earth.put(13316, 101 + i, 21, 'grindless:lv_capacitor_cell'); cells.push(new Pos(13316, 101 + i, 21)); }
  const tower = { isFormed: () => true, getMultiblockState: () => ({ cache: cells, getCache: () => ({ iterator: () => iterator(cells) }) }), getLevel: () => earth };
  earth.put(13316, 100, 20, 'gtceu:wireless_energy_tower', tower);
  return { levels, earth, moon: levels['gcyr:luna'], end: levels['minecraft:the_end'] };
}
function serverOf(w, pd = new CompoundTag()) {
  const server = { persistentData: pd, tick: 0, getTickCount() { return this.tick; }, getLevel: (d) => w.levels[d] || null };
  Object.values(w.levels).forEach((l) => { l.server = server; });
  return server;
}
const charger = (charge, opts = {}) => coverable(machine(CHARGER, { slots: [{ e: electric({ max: 120000, charge }) }, null, null, null], ...opts }), 32, 0);
const buffer = (charge) => coverable(machine(BUFFER, { slots: [0, 1, 2, 3].map(() => ({ e: electric({ max: 80000, charge }) })) }), 32, 32);
const sum = (m) => m.stacks.filter((s) => !s.isEmpty()).reduce((a, s) => a + s.e.getCharge(), 0);

test('wireless settlement: chargers and battery buffers through their items - the real charge, the store and the rate, settlement by settlement', () => {
  const { W, errors } = jvm();
  const w = world();
  const server = serverOf(w);
  assert.ok(W.track(w.earth, new Pos(13316, 100, 20)), 'the tower is tracked');
  const row = {
    empty: charger(0), partial: charger(60000), near: charger(119900), off: charger(0, { enabled: false }), fill: buffer(0), drain: buffer(80000),
  };
  const x = { empty: 13346, partial: 13349, near: 13352, off: 13355, drain: 13358, fill: 13361 };
  Object.keys(row).forEach((k) => w.earth.put(x[k], 100, 4, k === 'fill' || k === 'drain' ? 'gtceu:lv_battery_buffer_4x' : 'gtceu:lv_charger_4x', row[k]));
  const converter = w.earth.put(13364, 100, 4, 'gtceu:lv_1a_energy_converter', coverable({ energyContainer: new Container('com.gregtechceu.gtceu.common.machine.trait.ConverterTrait', 4096) }, 32, 32));
  for (const k of ['empty', 'partial', 'near', 'off', 'fill']) assert.equal(W.placeCover(w.earth, new Pos(x[k], 100, 4), SIDE.up, item('grindless:lv_wireless_energy_cover'), null).ok, true, k);
  assert.equal(W.placeCover(w.earth, new Pos(x.drain, 100, 4), SIDE.up, item('grindless:lv_wireless_dynamo_cover'), null).ok, true);
  const refused = W.placeCover(w.earth, new Pos(13364, 100, 4), SIDE.up, item('grindless:lv_wireless_energy_cover'), null);
  assert.equal(refused.ok, false);
  assert.equal(refused.message.key, 'message.grindless.wireless.cover_unsupported');
  assert.equal(refused.message.args[0], 'ConverterTrait');
  assert.equal(converter.covers.size, 0, 'nothing goes on the converter');
  W.paused = true;
  W.setStored(server, 100000);
  const L = W.rate(1, W.coverAmps) * W.settleTicks;
  assert.equal(L, 640);
  const rows = [];
  let before = { bank: W.stored(server), items: Object.fromEntries(Object.keys(row).map((k) => [k, sum(row[k])])) };
  for (let s = 0; s < 3; s++) {
    const st = W.settle(server);
    const after = { bank: W.stored(server), items: Object.fromEntries(Object.keys(row).map((k) => [k, sum(row[k])])) };
    rows.push({ st, bank: after.bank - before.bank, d: Object.fromEntries(Object.keys(row).map((k) => [k, after.items[k] - before.items[k]])) });
    before = after;
  }
  const near = [100, 0, 0];
  rows.forEach((r, i) => {
    assert.deepEqual(plain(r.d), { empty: L, partial: L, near: near[i], off: 0, fill: L, drain: -L }, 'settlement ' + (i + 1));
    assert.equal(r.st.up, true);
    assert.equal(r.st.tier, 1);
    assert.equal(r.st.capacity, 4 * 720000);
    assert.equal(r.st.drained, L);
    assert.equal(r.st.in, L * 19 / 20);
    assert.equal(r.st.lost, L / 20);
    const took = r.d.empty + r.d.partial + r.d.near + r.d.off + r.d.fill;
    assert.equal(r.st.out, took, 'the settlement books exactly what the items took');
    assert.equal(r.bank, r.st.in - took, 'the store moves by what went in minus what the items took');
    assert.equal(r.st.faulted, 0);
  });
  assert.equal(sum(row.partial), 61920, 'the review\'s charger: 60,000 + 3 x 640 in the real item');
  assert.equal(row.partial.energyContainer.energyStored, 0, 'its internal buffer never touched');
  assert.equal(sum(row.near), 120000);
  assert.equal(W.stored(server), 100000 + 3 * 608 - (3 * 4 * 640 - 2 * 640 + 100 - 640), 'the native test\'s BANK numbers');
  assert.deepEqual(plain(Object.keys(W.faults)), []);
  assert.deepEqual(errors, []);
});

test('wireless settlement: a machine whose move fails a check costs the store what it really took and gives it 19/20 of what really came out - never more', () => {
  const { W, errors } = jvm();
  const w = world();
  const server = serverOf(w);
  W.track(w.earth, new Pos(13316, 100, 20));
  // plain-named containers that lie: one stores half of what it reports taking, one gives half of what it reports giving, one reports
  // giving while its stored EU goes up
  const takeLiar = new Container(PLAIN, 100000, 0);
  takeLiar.changeEnergy = function (add) { this.energyStored += add / 2; return add; };
  const giveLiar = new Container(PLAIN, 100000, 50000);
  giveLiar.changeEnergy = function (add) { this.energyStored += add / 2; return add; };
  const backwards = new Container(PLAIN, 100000, 50000);
  backwards.changeEnergy = function (add) { this.energyStored -= add; return add; };
  w.earth.put(13340, 100, 4, 'gtceu:lv_macerator', coverable({ energyContainer: takeLiar }, 32, 0));
  w.earth.put(13343, 100, 4, 'gtceu:lv_steam_turbine', coverable({ energyContainer: giveLiar }, 0, 32));
  w.earth.put(13346, 100, 4, 'gtceu:lv_steam_turbine', coverable({ energyContainer: backwards }, 0, 32));
  assert.equal(W.placeCover(w.earth, new Pos(13340, 100, 4), SIDE.up, item('grindless:lv_wireless_energy_cover'), null).ok, true);
  assert.equal(W.placeCover(w.earth, new Pos(13343, 100, 4), SIDE.up, item('grindless:lv_wireless_dynamo_cover'), null).ok, true);
  assert.equal(W.placeCover(w.earth, new Pos(13346, 100, 4), SIDE.up, item('grindless:lv_wireless_dynamo_cover'), null).ok, true);
  W.paused = true;
  W.setStored(server, 10000);
  const st = W.settle(server);
  // the taker: asked 640, really stored 320: the store pays 320
  assert.equal(takeLiar.getEnergyStored(), 320);
  assert.equal(st.out, 320);
  // the giver: asked 640, really gave 320: 304 reach the store (19/20); the backwards one gave nothing: nothing
  assert.equal(giveLiar.getEnergyStored(), 50000 - 320);
  assert.equal(backwards.getEnergyStored(), 50640);
  assert.equal(st.drained, 320);
  assert.equal(st.in, 304);
  assert.equal(W.stored(server), 10000 + 304 - 320);
  assert.equal(st.faulted, 3);
  assert.equal(Object.keys(W.faults).length, 3);
  assert.equal(errors.filter((e) => /set aside/.test(e)).length, 3, 'each one logged once, as an error');
  // set aside: the next settlements leave them alone and say so
  const again = W.settle(server);
  assert.equal(again.faulted, 3);
  assert.equal(again.out + again.in, 0);
  assert.equal(takeLiar.getEnergyStored(), 320);
  assert.equal(errors.filter((e) => /set aside/.test(e)).length, 3, 'not logged again');
  // taken off and placed again: forgiven and checked again; the container still lies, so it is set aside again, and logged again
  const taker = w.earth.machines.get('13340,100,4');
  taker.covers.delete(SIDE.up);
  assert.equal(W.placeCover(w.earth, new Pos(13340, 100, 4), SIDE.up, item('grindless:lv_wireless_energy_cover'), null).ok, true);
  assert.equal(W.faults['minecraft:overworld|13340|100|4|up'], undefined, 'forgiven');
  const third = W.settle(server);
  assert.equal(third.faulted, 3);
  assert.equal(third.out, 320, 'the store pays what it really took again');
  assert.equal(takeLiar.getEnergyStored(), 640);
  assert.equal(errors.filter((e) => /set aside/.test(e)).length, 4);
});

test('wireless settlement: a list past the old 64 KiB limit and a non-zero store survive a cold restart; the endpoints work again by themselves', () => {
  const w = world();
  const pd1 = new CompoundTag();
  const server1 = serverOf(w, pd1);
  const jvm1 = jvm();
  const W1 = jvm1.W;
  // the native restart test's endpoints: an Overworld dynamo cover on a full battery buffer; on the Moon an energy cover on a battery
  // buffer with empty batteries and one on a charger, and a lone wireless energy hatch
  const dyn = w.earth.put(13364, 100, 2, 'gtceu:lv_battery_buffer_4x', buffer(80000));
  const mb = w.moon.put(13326, 200, 4, 'gtceu:lv_battery_buffer_4x', buffer(0));
  const mc = w.moon.put(13332, 200, 4, 'gtceu:lv_charger_4x', charger(10000));
  const sh = w.moon.put(13338, 200, 4, 'gtceu:lv_wireless_energy_hatch', coverable({ energyContainer: new Container(PLAIN, 1024, 0) }, 32, 0));
  W1.track(w.earth, new Pos(13316, 100, 20));
  W1.track(w.moon, new Pos(13338, 200, 4));
  assert.ok(W1.placeCover(w.earth, new Pos(13364, 100, 2), SIDE.up, item('grindless:lv_wireless_dynamo_cover'), null).ok);
  assert.ok(W1.placeCover(w.moon, new Pos(13326, 200, 4), SIDE.up, item('grindless:lv_wireless_energy_cover'), null).ok);
  assert.ok(W1.placeCover(w.moon, new Pos(13332, 200, 4), SIDE.up, item('grindless:lv_wireless_energy_cover'), null).ok);
  W1.setStored(server1, 2000000);
  jvm1.run(server1, 100);
  assert.ok(W1.flows['gcyr:luna|13338|200|4|'].filled === 1024, 'the lone hatch filled before the restart');
  // 1,200 synthetic entries in unloaded End chunks, in one write (no blocks, no machines)
  const synth = Array.from({ length: 1200 }, (_, i) => R.canon({ k: 'cover', d: 'minecraft:the_end', x: 13312 + (i % 64), y: 100, z: Math.floor(i / 64), s: 'up', ck: i % 2 ? 'dynamo' : 'energy', t: 1 }));
  pd1.put(W1.blocksKey, R.write(W1.tracked(server1).concat(synth)));
  W1.dropCache();
  jvm1.run(server1, 40);
  assert.equal(W1.tracked(server1).length, 5 + 1200, 'the tower, the hatch, the 3 covers and the synthetic entries: the unloaded ones are kept');
  // the snapshot: paused, the lone hatch emptied, the save
  W1.paused = true;
  sh.energyContainer.setEnergyStored(0);
  const json = JSON.stringify(W1.tracked(server1));
  assert.ok(json.length > 65535, 'the old format would have been one ' + json.length + '-byte string');
  const old = new CompoundTag();
  old.putString(W1.blocksKey, json);
  assert.throws(() => writeNbt(old), /UTFDataFormatException/, 'which NbtIo cannot write');
  const saved = { bank: W1.stored(server1), dyn: sum(dyn), mb: sum(mb), mc: sum(mc) };
  const bytes = writeNbt(pd1);
  // the cold restart: a new JVM, the persistent data read from what was written, the same world
  const jvm2 = jvm();
  const W2 = jvm2.W;
  assert.notEqual(W2, W1);
  const server2 = serverOf(w, readNbt(bytes));
  assert.equal(server2.persistentData.getTagType(W2.blocksKey), 9);
  assert.equal(JSON.stringify(W2.tracked(server2)), json, 'the same list, read from disk');
  assert.equal(W2.stored(server2), saved.bank);
  jvm2.run(server2, 200);
  const f = (k) => W2.flows[k] || { drained: 0, in: 0, filled: 0 };
  const fd = f('minecraft:overworld|13364|100|2|up');
  const fmb = f('gcyr:luna|13326|200|4|up');
  const fmc = f('gcyr:luna|13332|200|4|up');
  const fsh = f('gcyr:luna|13338|200|4|');
  assert.ok(fd.drained > 0 && saved.dyn - sum(dyn) === fd.drained && fd.in * 20 === fd.drained * 19, 'the dynamo cover gave, exactly');
  assert.ok(fmb.filled > 0 && sum(mb) - saved.mb === fmb.filled, 'the buffer\'s items took, exactly');
  assert.ok(fmc.filled > 0 && sum(mc) - saved.mc === fmc.filled, 'the charger\'s item took, exactly');
  assert.equal(fsh.filled, 1024, 'the lone hatch filled again, once');
  assert.equal(sh.energyContainer.getEnergyStored(), 1024);
  assert.equal(W2.stored(server2), saved.bank + W2.totals.in - W2.totals.out, 'the store balances: the saved store + in - out since the start');
  assert.equal(W2.totals.settlements, 20);
  assert.equal(JSON.stringify(W2.tracked(server2)), json, 'nothing forgotten, nothing added');
  assert.deepEqual(plain(Object.keys(W2.faults)), []);
  assert.deepEqual(jvm2.errors, []);
});
// ---------------------------------------------------------------- the two native tests, run in a simulated server
// tools/test/overlay/kubejs/server_scripts/gg_test_wireless_adapters.js and gg_test_wireless_restart.js in the sandbox above, against a
// simulated world: the commands they use (fill, setblock, forceload, save-all), GTM's machines as the stand-ins above (the tower and the
// EBF check their structure 20 ticks after they are placed or loaded; the EBF draws 120 EU/t from its two hatches while it has dust),
// kubejs_persistent_data.nbt written in NbtIo's format, and the harness's @restart as a second sandbox on the same world. This checks
// the scripts (every path they take and the numbers they expect) before the PC runs them; GTM's own classes are only checked there.

const OVERLAY = path.join(ROOT, 'tools', 'test', 'overlay', 'kubejs', 'server_scripts');
const CONVERTER = 'com.gregtechceu.gtceu.common.machine.trait.ConverterTrait';

class SimLevel extends Level {
  constructor(dim, sim, loaded) { super(dim, loaded); this.sim = sim; }
  getBlock(a, b, c) { return { id: this.blocks.get(typeof a === 'object' ? at(a) : a + ',' + b + ',' + c) || 'minecraft:air' }; }
  getChunk() { return null; }
  getEntitiesOfClass() { return { size: () => 0, get: () => null }; }
  getTime() { return this.sim.gameTime; }
}

// where a structure described by lib/patterns.js stands, its controller at (x, y, z) facing north (the overlays' own placing)
function structureAt(sim, id, x, y, z) {
  const desc = sim.patterns.describe(id);
  let ctrl = null;
  desc.slices.forEach((rows, si) => rows.forEach((row, ri) => [...row].forEach((ch, ci) => { if (desc.symbols[ch] && desc.symbols[ch].kind === 'controller') ctrl = { si, ri, ci }; })));
  const out = [];
  desc.slices.forEach((rows, si) => rows.forEach((row, ri) => [...row].forEach((ch, ci) => {
    const s = desc.symbols[ch];
    if (ch !== ' ' && s.kind !== 'controller' && s.kind !== 'air' && s.kind !== 'any') out.push(new Pos(x - (ci - ctrl.ci), y + (ri - ctrl.ri), z - (si - ctrl.si)));
  })));
  return out;
}

function simMachine(sim, level, id, x, y, z) {
  if (id === 'gtceu:lv_charger_4x' || id === 'gtceu:lv_battery_buffer_4x') {
    const kind = id === 'gtceu:lv_charger_4x' ? CHARGER : BUFFER;
    const m = machine(kind, { slots: [null, null, null, null] });
    const inv = { getSlots: () => 4, getStackInSlot: (i) => m.stacks[i], setStackInSlot: (i, s) => { m.stacks[i] = s; } };
    if (kind === CHARGER) m.getChargerInventory = () => inv;
    else m.getBatteryInventory = () => inv;
    m.setWorkingEnabled = (b) => { m.enabled = b; };
    return coverable(m, 32, kind === BUFFER ? 32 : 0);
  }
  if (id === 'gtceu:lv_1a_energy_converter') return coverable({ energyContainer: new Container(CONVERTER, 4096) }, 32, 32);
  if (id === 'gtceu:lv_macerator') return coverable({ energyContainer: new Container(RECIPE_AMPS, 1024) }, 32, 0);
  if (id === 'gtceu:lv_wireless_energy_hatch') return coverable({ energyContainer: new Container(PLAIN, 1024) }, 32, 0);
  if (id === 'gtceu:lv_input_bus') {
    const bus = { stacks: [{ isEmpty: () => true }] };
    bus.getInventory = () => ({ setStackInSlot: (i, s) => { bus.stacks[i] = s; } });
    return bus;
  }
  if (id === 'gtceu:wireless_energy_tower' || id === 'gtceu:electric_blast_furnace') {
    // GTM: isFormed is saved with the machine; the structure (and its cache) is checked again some ticks after a placing or a load
    const c = { formed: false, cache: null, checkAt: sim.tick + 20, status: 'IDLE', progress: 0 };
    const tower = id === 'gtceu:wireless_energy_tower';
    const parts = () => (tower ? structureAt(sim, id, x, y, z) : []);
    const valid = () => !tower || parts().every((p) => level.getBlock(p).id !== 'minecraft:air');
    c.isFormed = () => c.formed;
    c.checkPatternWithLock = () => valid();
    c.setFlipped = () => {};
    c.onStructureFormed = () => { c.formed = true; c.cache = parts(); };
    c.getMultiblockState = () => ({ cache: c.cache, getCache: () => ({ iterator: () => iterator(c.cache) }), isNeededFlip: () => false, error: 'invalid' });
    c.getLevel = () => level;
    c.getRecipeLogic = () => ({ getStatus: () => c.status, updateTickSubscription() {}, getProgress: () => c.progress });
    c.reload = () => { c.cache = null; c.checkAt = sim.tick + 20; c.status = 'IDLE'; };
    c.tick = () => {
      if (sim.tick === c.checkAt) { c.formed = valid(); c.cache = c.formed ? parts() : null; }
      if (tower || !c.formed || sim.tick < c.checkAt) return;
      const bus = level.machines.get((x - 1) + ',' + y + ',' + z);
      const hatches = [level.machines.get(x + ',' + y + ',' + (z + 2)), level.machines.get((x - 1) + ',' + y + ',' + (z + 2))].filter(Boolean);
      const dust = bus && !bus.stacks[0].isEmpty() && bus.stacks[0].id === 'gtceu:steel_dust';
      if (!dust || hatches.reduce((a, h) => a + h.energyContainer.getEnergyStored(), 0) < 120) { c.status = dust ? 'WAITING' : 'IDLE'; return; }
      let need = 120;
      for (const h of hatches) {
        const take = Math.min(need, h.energyContainer.getEnergyStored());
        h.energyContainer.setEnergyStored(h.energyContainer.getEnergyStored() - take);
        need -= take;
      }
      c.status = 'WORKING';
      c.progress++;
    };
    return c;
  }
  return null;
}

function simPlace(sim, level, x, y, z, id) {
  const k = x + ',' + y + ',' + z;
  level.machines.delete(k);
  const full = id && id.indexOf(':') < 0 ? 'minecraft:' + id : id;
  if (!full || full === 'minecraft:air') { level.blocks.delete(k); return; }
  level.blocks.set(k, full);
  const m = simMachine(sim, level, full, x, y, z);
  if (m) level.machines.set(k, m);
}

function simCommand(sim, line) {
  let level = sim.levels['minecraft:overworld'];
  let text = String(line);
  const ex = /^execute in (\S+) run (.*)$/.exec(text);
  if (ex) { level = sim.levels[ex[1]]; text = ex[2]; }
  const a = text.split(' ');
  sim.commands.push(text);
  if (a[0] === 'forceload') return 16;
  if (a[0] === 'save-all') { sim.disk.set('kubejs_persistent_data.nbt', writeNbt(sim.server.persistentData)); return 1; }
  if (a[0] === 'setblock') { simPlace(sim, level, +a[1], +a[2], +a[3], a[4].split('[')[0]); return 1; }
  if (a[0] === 'fill') {
    const [x0, y0, z0, x1, y1, z1] = a.slice(1, 7).map(Number);
    let n = 0;
    for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) { simPlace(sim, level, x, y, z, a[7]); n++; }
    return n;
  }
  throw new Error('the simulated server has no command ' + text);
}

function simWorld() {
  const sim = { tick: 0, gameTime: 1000, clock: { now: 0 }, disk: new Map(), levels: {}, server: null, commands: [] };
  for (const d of ['minecraft:overworld', 'gcyr:luna', 'minecraft:the_end']) sim.levels[d] = new SimLevel(d, sim, d !== 'minecraft:the_end');
  return sim;
}

// a server (a JVM's) on the simulated world, with its persistent data
function simServer(sim, j, pd) {
  sim.patterns = j.G.patterns;
  sim.server = {
    persistentData: pd, tick: 0,
    getTickCount() { return this.tick; },
    getLevel: (d) => sim.levels[String(d)] || null,
    overworld: () => sim.levels['minecraft:overworld'],
    runCommandSilent: (t) => simCommand(sim, t),
    getWorldPath: (r) => r.name,
  };
  Object.values(sim.levels).forEach((l) => { l.server = sim.server; });
  return sim.server;
}

// ticks: GTM's machines, then KubeJS's tick handlers; 50 ms of clock each
function simRun(sim, j, n, until) {
  for (let i = 0; i < n; i++) {
    sim.tick++;
    sim.gameTime++;
    sim.clock.now += 50;
    sim.server.tick++;
    Object.values(sim.levels).forEach((l) => [...l.machines.values()].forEach((m) => { if (m.tick) m.tick(); }));
    j.ticks.forEach((fn) => fn({ server: sim.server }));
    if (until && until()) return true;
  }
  return false;
}

test('the native wireless tests (adapters, then the restart\'s two phases) pass in a simulated server, phase 2 in a second JVM on the same world', () => {
  const sim = simWorld();
  const files = ['gg_test_wireless_energy.js', 'gg_test_wireless_adapters.js', 'gg_test_wireless_restart.js'].map((f) => path.join(OVERLAY, f));
  const j1 = jvm({ overlays: files, clock: sim.clock, disk: sim.disk });
  simServer(sim, j1, new CompoundTag());
  simRun(sim, j1, 40);
  assert.equal(typeof j1.commands.gg_test_wireless_energy, 'function', 'the whole-network test loads beside them');
  // the harness's commands: the adapters test, then phase 1 (the wireless tests take turns on their band, in the order asked for)
  assert.equal(j1.commands.gg_test_wireless_adapters({}), 1);
  assert.equal(j1.commands.gg_test_wireless_restart_1({}), 1);
  assert.equal(kubejsGlobal.stored(j1.global, 'ggTestWirelessQueue'), 'wireless_adapters,wireless_restart_1');
  const phase1 = () => j1.lines.includes('GGTEST|wireless_restart|PHASE1|DONE');
  assert.ok(simRun(sim, j1, 6000, phase1), 'phase 1 ends: ' + j1.lines.slice(-5).join(' / '));
  assert.ok(j1.lines.indexOf('GGTEST|wireless_adapters|DONE') < j1.lines.indexOf('GGTEST|wireless_restart|PHASE1|DONE'), 'the adapters test first');
  assert.equal(kubejsGlobal.stored(j1.global, 'ggTestWirelessQueue'), '', 'both left the queue');
  // @restart: the stop saves the persistent data with the world; a new JVM starts on it and GTM checks the loaded multiblocks again
  const bytes = writeNbt(sim.server.persistentData);
  Object.values(sim.levels).forEach((l) => l.machines.forEach((m) => { if (m.reload) m.reload(); }));
  const j2 = jvm({ overlays: files, clock: sim.clock, disk: sim.disk });
  simServer(sim, j2, readNbt(bytes));
  simRun(sim, j2, 300);
  assert.equal(j2.commands.gg_test_wireless_restart_2({}), 1);
  assert.ok(simRun(sim, j2, 3000, () => j2.lines.includes('GGTEST|wireless_restart|DONE')), 'phase 2 ends: ' + j2.lines.slice(-5).join(' / '));
  assert.equal(kubejsGlobal.stored(j2.global, 'ggTestWirelessQueue'), '');
  const print = restoredPrint(j2.lines);
  assert.ok(print && print.now === print.saved, 'RESTORED compared a well-formed fingerprint: ' + JSON.stringify(print));
  const all = j1.lines.concat(j2.lines).filter((l) => l.startsWith('GGTEST|'));
  if (process.env.GG_SHOW_SIM) console.log(all.join('\n'));
  assert.deepEqual(all.filter((l) => /\|(FAIL|ERROR)(\||$)/.test(l)), []);
  const passed = (scope, name) => all.some((l) => l.startsWith('GGTEST|' + scope + '|' + name + '|PASS'));
  for (const name of ['LEGACY', 'PLACED', 'CLASSIFY', 'CHARGER_OLD_PATH', 'CHARGER_EMPTY', 'CHARGER_PARTIAL', 'CHARGER_NEAR_FULL', 'CHARGER_DISABLED',
    'BUFFER_FILL', 'BUFFER_DRAIN', 'BANK']) assert.ok(passed('wireless_adapters', name), 'adapters ' + name);
  for (const name of ['PLACED', 'BEFORE', 'SYNTHETIC', 'SAVED', 'RESTORED', 'AUTOMATIC']) assert.ok(passed('wireless_restart', name), 'restart ' + name);
  // the only errors logged: the legacy check's deliberate conversion
  assert.ok(j1.errors.length > 0 && j1.errors.every((e) => /the list of wireless blocks/.test(e)), j1.errors.join(' / '));
  assert.deepEqual(j2.errors, []);
  // left clean: no machine in either band, no key of the network or the test, the force-loading released
  assert.equal(sim.levels['minecraft:overworld'].machines.size + sim.levels['gcyr:luna'].machines.size, 0);
  for (const k of ['grindless_wireless_blocks', 'grindless_wireless_stored', 'grindless_wireless_blocks_legacy', 'gg_test_wireless_restart']) {
    assert.equal(sim.server.persistentData.contains(k), false, k);
  }
  assert.equal(sim.commands.filter((c) => c.startsWith('forceload remove')).length, 3, 'the adapters test\'s band and phase 2\'s two');
});
// The restart fixture's phases on their own: what the native run of e3fb14d (20261026-002755-both-a1c) could not show. There, restart_1
// stored its phase in `global` as a number, read it back wrapped, compared it with a number literal and returned on every tick: its
// request NOTE and then nothing, no failure, until the bench's 180 s restart barrier expired.
const RESTART_SCRIPTS = ['gg_test_wireless_adapters.js', 'gg_test_wireless_restart.js'].map((f) => path.join(OVERLAY, f));
const passed = (lines, scope, name) => lines.some((l) => l.startsWith('GGTEST|' + scope + '|' + name + '|PASS'));
const failed = (lines) => lines.filter((l) => l.startsWith('GGTEST|') && /\|(FAIL|ERROR)(\||$)/.test(l));
// RESTORED's fingerprints, now and saved, when both are well formed (the first version printed `hash NaN-NaN (saved NaN-NaN)`, equal for
// any list: this Rhino's charCodeAt returns a java.lang.Character, NaN in arithmetic)
function restoredPrint(lines) {
  const m = /fingerprint (\d+:\d+-\d+) \(saved (\d+:\d+-\d+), both well formed: true\)/.exec(lines.find((l) => l.startsWith('GGTEST|wireless_restart|RESTORED|')) || '');
  return m ? { now: m[1], saved: m[2] } : null;
}

// phase 1 in one sandbox, the bench's @restart (persistent data through NbtIo bytes, the multiblocks checked again), phase 2 in another
function restartAround(sim, j1, phase2Ticks = 3000) {
  const bytes = writeNbt(sim.server.persistentData);
  Object.values(sim.levels).forEach((l) => l.machines.forEach((m) => { if (m.reload) m.reload(); }));
  const j2 = jvm({ overlays: RESTART_SCRIPTS, clock: sim.clock, disk: sim.disk });
  simServer(sim, j2, readNbt(bytes));
  simRun(sim, j2, 300);
  assert.equal(j2.commands.gg_test_wireless_restart_2({}), 1);
  assert.ok(simRun(sim, j2, phase2Ticks, () => j2.lines.includes('GGTEST|wireless_restart|DONE')), 'phase 2 ends: ' + j2.lines.slice(-3).join(' / '));
  return j2;
}

test('kubejs global stand-in: a number stored in global does not come back as that number; booleans and strings do (KubeJS 2001.6.5 + its Rhino)', () => {
  const g = kubejsGlobal();
  g.mode = 1;
  g.flag = true;
  g.queue = 'wireless_restart_1';
  assert.notStrictEqual(g.mode, 1, 'Interpreter#doShallowEquals: a wrapped java.lang.Double is not the literal 1');
  assert.equal(String(g.mode), '1.0', 'Double#toString');
  assert.equal(g.flag, true, 'ScriptRuntime#shallowEq unwraps a Boolean');
  assert.equal(String(g.queue), 'wireless_restart_1');
  assert.equal(g.missing, undefined);
  assert.equal(kubejsGlobal.stored(g, 'mode'), 1);
});

test('restart_1 starts on its own (no adapter test before it), and the restart\'s phase 2 still proves the cold start', () => {
  const sim = simWorld();
  const j1 = jvm({ overlays: RESTART_SCRIPTS, clock: sim.clock, disk: sim.disk });
  simServer(sim, j1, new CompoundTag());
  simRun(sim, j1, 40);
  assert.equal(j1.commands.gg_test_wireless_restart_1({}), 1);
  assert.equal(kubejsGlobal.stored(j1.global, 'ggTestWirelessRestartRequest1'), true, 'the request is a boolean');
  assert.ok(simRun(sim, j1, 2000, () => j1.lines.includes('GGTEST|wireless_restart|PHASE1|DONE')), 'phase 1 ends: ' + j1.lines.slice(-3).join(' / '));
  for (const name of ['PLACED', 'BEFORE', 'SYNTHETIC', 'SAVED']) assert.ok(passed(j1.lines, 'wireless_restart', name), name);
  assert.equal(kubejsGlobal.stored(j1.global, 'ggTestWirelessQueue'), '');
  assert.equal(kubejsGlobal.stored(j1.global, 'ggTestWirelessRestartRequest1'), false, 'taken');
  const j2 = restartAround(sim, j1);
  for (const name of ['RESTORED', 'AUTOMATIC']) assert.ok(passed(j2.lines, 'wireless_restart', name), name);
  const print = restoredPrint(j2.lines);
  assert.ok(print && print.now === print.saved, 'RESTORED compared a well-formed fingerprint: ' + JSON.stringify(print));
  assert.deepEqual(failed(j1.lines.concat(j2.lines)), []);
  assert.equal(sim.levels['minecraft:overworld'].machines.size + sim.levels['gcyr:luna'].machines.size, 0, 'left clean');
});

test('restart_1 that never gets its turn fails in 120 s with the queue it saw, ends phase 1, and phase 2 reports it and cleans up', () => {
  const sim = simWorld();
  const j1 = jvm({ overlays: RESTART_SCRIPTS, clock: sim.clock, disk: sim.disk });
  simServer(sim, j1, new CompoundTag());
  simRun(sim, j1, 40);
  // a wireless test asked for earlier that never ends (it holds the head of the queue)
  j1.global.ggTestWirelessQueue = 'wireless_energy';
  assert.equal(j1.commands.gg_test_wireless_restart_1({}), 1);
  const asked = sim.clock.now;
  assert.ok(simRun(sim, j1, 3000, () => j1.lines.includes('GGTEST|wireless_restart|PHASE1|DONE')), 'phase 1 ends instead of waiting forever');
  const waited = sim.clock.now - asked;
  assert.ok(waited > 120000 && waited <= 121000, 'it gave up after its 120 s, inside the bench\'s 180 s restart barrier (' + waited + ' ms)');
  const turn = failed(j1.lines);
  assert.equal(turn.length, 1);
  assert.match(turn[0], /^GGTEST\|wireless_restart\|TURN\|FAIL\|phase 1 was asked for and had no turn on the band in 120 s: the queue is \[wireless_energy, wireless_restart_1\]$/);
  assert.equal(kubejsGlobal.stored(j1.global, 'ggTestWirelessQueue'), 'wireless_energy', 'it left the queue');
  assert.equal(kubejsGlobal.stored(j1.global, 'ggTestWirelessRestartRequest1'), false);
  const rec = sim.server.persistentData.getCompound('gg_test_wireless_restart');
  assert.equal(rec.getBoolean('ok'), false);
  assert.match(rec.getString('reason'), /no turn on the band in 120 s/);
  // phase 2, as before: the record says phase 1 did not finish; it cleans up and ends
  const j2 = restartAround(sim, j1);
  const reported = failed(j2.lines);
  assert.equal(reported.length, 1);
  assert.match(reported[0], /^GGTEST\|wireless_restart\|RESTORED\|FAIL\|phase 1 did not finish: phase 1 was asked for and had no turn on the band in 120 s/);
  assert.ok(!passed(j2.lines, 'wireless_restart', 'AUTOMATIC'), 'nothing to prove without phase 1');
  assert.equal(sim.server.persistentData.contains('gg_test_wireless_restart'), false, 'the record is removed');
  assert.equal(kubejsGlobal.stored(j2.global, 'ggTestWirelessQueue'), '');
});
test('this Rhino\'s String#charCodeAt is modelled: a java.lang.Character, NaN in arithmetic, in the sandbox only', () => {
  const j = jvm();
  assert.ok(Number.isNaN(vm.runInContext("'{'.charCodeAt(0) * 131 + 7", j.sandbox)), 'NativeString Id_charCodeAt returns the char');
  assert.equal(vm.runInContext("String('{'.charCodeAt(0))", j.sandbox), '{');
  assert.equal(vm.runInContext("'{\"a\"}'.indexOf('a') + 1", j.sandbox), 3, 'indexOf still answers a number');
  assert.equal('{'.charCodeAt(0), 123, 'the test\'s own realm keeps the real charCodeAt');
});

test('RESTORED compares the list\'s content: one entry changed across the restart (same length and count) fails it', () => {
  const sim = simWorld();
  const j1 = jvm({ overlays: RESTART_SCRIPTS, clock: sim.clock, disk: sim.disk });
  simServer(sim, j1, new CompoundTag());
  simRun(sim, j1, 40);
  assert.equal(j1.commands.gg_test_wireless_restart_1({}), 1);
  assert.ok(simRun(sim, j1, 2000, () => j1.lines.includes('GGTEST|wireless_restart|PHASE1|DONE')));
  // between the save and the next start the last synthetic cover changes its kind (dynamo <-> energy: the JSON keeps its length)
  const list = sim.server.persistentData.getList('grindless_wireless_blocks', 10);
  const last = list.getCompound(list.size() - 1);
  last.putString('ck', last.getString('ck') === 'dynamo' ? 'energy' : 'dynamo');
  const j2 = restartAround(sim, j1);
  const restored = j2.lines.find((l) => l.startsWith('GGTEST|wireless_restart|RESTORED|')) || '';
  assert.match(restored, /^GGTEST\|wireless_restart\|RESTORED\|FAIL\|/, 'the changed entry is caught');
  const m = /fingerprint (\d+):(\d+-\d+) \(saved (\d+):(\d+-\d+), both well formed: true\)/.exec(restored);
  assert.ok(m && m[1] === m[3] && m[2] !== m[4], 'same length, another fingerprint: ' + restored.slice(0, 420));
  assert.ok(passed(j2.lines, 'wireless_restart', 'AUTOMATIC'), 'the endpoints still work');
});

// ---------------------------------------------------------------- the LuV tier (package LuV-A4)
// The table's sixth row: the LuV SMES cell (wound in the HTS magnet works, so no assembler recipe), LuV hatches at 2, 4, 16 and 64 A and
// LuV covers, with the same mechanism and invariants as LV-IV.

const TABLES = path.join(PACK, 'kubejs', 'data', 'grindless', 'tables');
const TABLE = JSON.parse(fs.readFileSync(path.join(TABLES, 'wireless_energy.json'), 'utf8'));
const HTS = JSON.parse(fs.readFileSync(path.join(TABLES, 'hts_magnet_works.json'), 'utf8'));
const LUV = 6;
// GTM 7.5.3's reference batteries (GTItems: their electric items' max charge; the dump's electric.json has the same)
const BATTERY_EU = {
  'gtceu:lv_lithium_battery': 120000, 'gtceu:mv_lithium_battery': 420000, 'gtceu:hv_lithium_battery': 1800000,
  'gtceu:ev_vanadium_battery': 10240000, 'gtceu:iv_vanadium_battery': 40960000, 'gtceu:luv_vanadium_battery': 163840000, 'gtceu:zpm_naquadria_battery': 655360000,
  'gtceu:uv_naquadria_battery': 2621440000,
};
const SMES = 'grindless:luv_smes_cell';
const SMES_EU = 983040000;
// a GTM 7.5.3 registry dump of the pack (gg_dump.js), when the session that made it left it on this machine
const DUMP_DIR = [
  process.env.GG_DUMP_DIR,
  'C:/Users/EzequielC/.copilot/session-state/52ba6327-e548-48e7-aa57-41c2373d41c2/files/test-runs/power-quests-1/results/server/kubejs-exported',
].filter(Boolean).find((p) => fs.existsSync(path.join(p, 'items.json')));
const dumpJson = (name) => JSON.parse(fs.readFileSync(path.join(DUMP_DIR, name), 'utf8'));
const STARTUP_REL = 'kubejs/startup_scripts/grindless/lv/wireless_energy.js';
let staticRun = null;
const packRun = () => staticRun || (staticRun = runPackScripts(PACK));

test('LuV wireless table: six rows LV to LuV, each cell six of its tier\'s reference battery; the LuV cell is made in the HTS magnet works', () => {
  assert.deepEqual(TABLE.tiers.map((r) => [r.tier, r.name]), [[1, 'lv'], [2, 'mv'], [3, 'hv'], [4, 'ev'], [5, 'iv'], [6, 'luv'], [7, 'zpm'], [8, 'uv'], [9, 'uhv'], [10, 'uev'], [11, 'uiv'], [12, 'uxv'], [13, 'opv'], [14, 'max']]);
  for (const r of TABLE.tiers) {
    assert.equal(r.capacity, (r.referenceCount || 6) * BATTERY_EU[r.referenceBattery], r.name + ': ' + (r.referenceCount || 6) + ' x ' + r.referenceBattery);
    if (r.cellMadeBy) continue;
    assert.match(String(r.batteries), /^#gtceu:batteries\//, r.name + ': an assembler cell takes the tier\'s batteries');
    assert.match(String(r.frame), /^gtceu:[a-z_]+_frame$/, r.name + ': and a frame');
  }
  const luv = TABLE.tiers[5];
  assert.equal(luv.cell, SMES);
  assert.equal(luv.capacity, SMES_EU);
  assert.equal(luv.referenceBattery, 'gtceu:luv_vanadium_battery');
  assert.equal(luv.cellMadeBy, 'gtceu:hts_magnet_works');
  assert.equal(luv.texture, 'grindless:block/wireless/smes_cell_luv');
  assert.deepEqual([luv.emitter, luv.sensor, luv.signalParts, luv.link, luv.plate, luv.wire],
    ['gtceu:luv_emitter', 'gtceu:luv_sensor', 1, 'gtceu:quantum_star', 'gtceu:rhodium_plated_palladium_plate', 'niobium_titanium']);
  assert.equal(TABLE.tiers.filter((r) => r.cellMadeBy).length, 9, 'only the LuV, ZPM, UV, UHV, UEV, UIV, UXV, OpV and MAX cells are made elsewhere');
  assert.ok(TABLE._how_it_is_used.some((l) => /cellMadeBy/.test(l)), 'the table documents cellMadeBy');
  // the HTS magnet works' circuit 2 makes exactly this cell
  const smes = HTS.recipes.find((r) => r.name === 'luv_smes_cell');
  assert.ok(smes, 'tables/hts_magnet_works.json has its luv_smes_cell entry');
  assert.deepEqual(smes.itemsOut, [{ id: luv.cell, count: 1 }]);
  assert.equal(smes.circuit, 2);
  assert.equal(HTS.recipes.filter((r) => r.itemsOut.some((o) => o.id === SMES)).length, 1);
  if (!DUMP_DIR) return;
  const electric = dumpJson('electric.json');
  for (const r of TABLE.tiers) {
    const bat = electric.items.find((x) => x.id === r.referenceBattery);
    assert.ok(bat && bat.capacity * (r.referenceCount || 6) === r.capacity, r.name + ': electric.json ' + JSON.stringify(bat));
  }
  const tags = dumpJson('tags.json').item;
  for (const r of TABLE.tiers.filter((x) => x.batteries)) assert.ok(tags[r.batteries.slice(1)], r.batteries + ' is a tag');
});

test('LuV wireless registrations: the startup script registers 8 hatches, a cell and 2 covers per table row (static stand-in)', () => {
  const N = TABLE.tiers.length;
  const run = packRun();
  const ours = (m) => m.file === STARTUP_REL;
  const hatches = [...run.registry.machines.values()].filter((m) => /_wireless_(energy|dynamo)_hatch(_\d+a)?$/.test(m.id));
  assert.equal(hatches.length, N * TABLE.hatchAmps.length * 2);
  assert.ok(hatches.every(ours), 'all of them from lv/wireless_energy.js');
  for (const t of TABLE.tiers) for (const kind of ['energy', 'dynamo']) for (const a of TABLE.hatchAmps) {
    const id = `gtceu:${t.name}_wireless_${kind}_hatch${a === 2 ? '' : '_' + a + 'a'}`;
    assert.ok(run.registry.machines.has(id), id);
  }
  const cells = [...run.registry.blocks.values()].filter((b) => ours(b));
  assert.deepEqual(cells.map((b) => b.id), TABLE.tiers.map((r) => r.cell));
  assert.ok(run.registry.items.has(SMES), 'the SMES cell has its block item');
  const covers = [...run.registry.items.values()].filter((i) => ours(i) && /_wireless_(energy|dynamo)_cover$/.test(i.id)).map((i) => i.id);
  assert.equal(covers.length, 2 * N);
  for (const t of TABLE.tiers) for (const kind of ['energy', 'dynamo']) assert.ok(covers.includes(`grindless:${t.name}_wireless_${kind}_cover`), t.name + ' ' + kind);
  assert.deepEqual(run.errors.filter((e) => /wireless/.test(e.file)), [], 'the wireless scripts load cleanly');
  // the same from the startup object the server script reads
  const { W } = jvm();
  assert.equal(W.hatchIds.length, N * TABLE.hatchAmps.length * 2);
  assert.equal(W.cellIds.length, N);
  assert.equal(W.coverList.length, 2 * N);
  assert.deepEqual(plain(W.tiers), TABLE.tiers.map((r) => r.tier));
  assert.equal(W.tierNames[LUV], 'luv');
  assert.equal(W.tierLabels[LUV], 'LuV');
  assert.deepEqual(plain(W.cells[SMES]), { tier: LUV, capacity: SMES_EU, madeBy: 'gtceu:hts_magnet_works' });
  assert.equal(W.cells['grindless:iv_capacitor_cell'].madeBy, null);
  assert.deepEqual(plain(W.hatches['gtceu:luv_wireless_dynamo_hatch_64a']), { kind: 'dynamo', tier: LUV, amps: 64 });
  assert.equal(W.covers['grindless:wireless_energy_cover.luv'].item, 'grindless:luv_wireless_energy_cover');
  assert.equal(W.coverItems['grindless:luv_wireless_dynamo_cover'].def, 'grindless:wireless_dynamo_cover.luv');
  // the tower takes the SMES cell in all 32 slots, like any cell
  const desc = W.towerSpec.symbols.C;
  assert.ok(JSON.stringify(desc).includes(SMES), 'the tower\'s cell slot takes the SMES cell');
});

test('LuV wireless recipes: no assembler recipe for the SMES cell; the LuV hatches and covers at 30,720 EU/t with GTM 7.5.3 parts', () => {
  const { W } = jvm();
  assert.equal(W.recipes.filter((r) => r.output === SMES).length, 0, 'the SMES cell is not made in the assembler');
  assert.ok(!W.recipes.some((r) => /luv_capacitor_cell|luv_smes_cell/.test(r.id)));
  // every other cell has its one assembler recipe; the tower, 5 cells, 8 hatches and 2 covers per row
  for (const r of TABLE.tiers.filter((x) => !x.cellMadeBy)) assert.equal(W.recipes.filter((x) => x.output === r.cell).length, 1, r.cell);
  assert.equal(W.recipes.length, 1 + 5 + TABLE.tiers.length * (TABLE.hatchAmps.length * 2 + 2));
  const luv = W.recipes.filter((r) => /^gtceu:luv_wireless_|^grindless:luv_wireless_/.test(r.output));
  assert.equal(luv.length, 10);
  for (const r of luv) {
    assert.equal(r.eut, 30720, r.id + ' at VA[LuV]');
    assert.match(r.id, /^grindless:assembler\/luv_wireless_/);
  }
  const by = (out) => W.recipes.find((r) => r.output === out);
  assert.deepEqual(plain(by('gtceu:luv_wireless_energy_hatch').inputs), ['1x gtceu:luv_sensor', '1x gtceu:luv_energy_input_hatch', '2x #gtceu:circuits/luv', '1x gtceu:quantum_star']);
  assert.deepEqual(plain(by('gtceu:luv_wireless_dynamo_hatch').inputs), ['1x gtceu:luv_emitter', '1x gtceu:luv_energy_output_hatch', '2x #gtceu:circuits/luv', '1x gtceu:quantum_star']);
  assert.deepEqual(plain(by('gtceu:luv_wireless_energy_hatch_4a').inputs), ['1x gtceu:luv_wireless_energy_hatch', '2x gtceu:niobium_titanium_quadruple_wire', '2x gtceu:rhodium_plated_palladium_plate']);
  assert.deepEqual(plain(by('gtceu:luv_wireless_dynamo_hatch_16a').inputs), ['1x gtceu:luv_wireless_dynamo_hatch_4a', '2x gtceu:niobium_titanium_octal_wire', '4x gtceu:rhodium_plated_palladium_plate']);
  assert.deepEqual(plain(by('gtceu:luv_wireless_energy_hatch_64a').inputs), ['1x gtceu:luv_wireless_energy_hatch_16a', '2x gtceu:niobium_titanium_hex_wire', '6x gtceu:rhodium_plated_palladium_plate']);
  assert.deepEqual(plain(by('grindless:luv_wireless_energy_cover').inputs), ['1x gtceu:luv_sensor', '1x gtceu:rhodium_plated_palladium_plate', '1x #gtceu:circuits/luv', '1x gtceu:quantum_star']);
  assert.deepEqual(plain(by('grindless:luv_wireless_dynamo_cover').inputs), ['1x gtceu:luv_emitter', '1x gtceu:rhodium_plated_palladium_plate', '1x #gtceu:circuits/luv', '1x gtceu:quantum_star']);
  // the whole pack in the static stand-in: the cell's only recipe is the magnet works' circuit 2
  const docs = packRun().docs.recipes.recipes;
  const making = docs.filter((r) => JSON.stringify((r.j || {}).outputs || r.j || {}).includes('"' + SMES + '"'));
  assert.deepEqual(making.map((r) => [r.i, r.t]), [['grindless:magnet_winding/luv_smes_cell', 'gtceu:magnet_winding']]);
  for (const r of luv) assert.ok(docs.some((d) => d.i === r.id && d.t === 'gtceu:assembler'), r.id + ' in the static recipes');
  if (!DUMP_DIR) return;
  // every part of GTM's in GTM 7.5.3's registry, every tag in its tags
  const items = new Set(dumpJson('items.json').items.map((x) => (typeof x === 'string' ? x : x.id)));
  const tags = dumpJson('tags.json').item;
  for (const r of luv) {
    for (const input of r.inputs) {
      const id = input.replace(/^\d+x /, '');
      if (id.startsWith('#')) assert.ok(tags[id.slice(1)], id + ' is a tag');
      else if (!/^gtceu:luv_wireless_/.test(id)) assert.ok(items.has(id), id + ' is registered');
    }
  }
  assert.ok(!items.has('gtceu:rhodium_plated_palladium_frame'), 'GTM has no LuV hull frame: the SMES row needs none');
});

// every id a row of the table names (and the ids it derives: GTM's hatches of the tier, the wire's quadruple / octal / hex wires), exact,
// against GTM 7.5.3's registry: GTM's and vanilla's ids in the dump's items (and nothing taken for a fluid), ours in the static stand-in
function rowIds(r) {
  // OpV-W's cell is made in GTM's own tiered assembler (gtceu:opv_assembler): GTM's id, not one the pack registers
  const gtmMaker = r.cellMadeBy === `gtceu:${r.name}_assembler` ? r.cellMadeBy : null;
  const gtm = [r.referenceBattery, /^grindless:/.test(String(r.emitter)) ? null : r.emitter, /^grindless:/.test(String(r.sensor)) ? null : r.sensor, /^grindless:/.test(String(r.link)) ? null : r.link, /^grindless:/.test(String(r.plate)) ? null : r.plate, r.frame, `gtceu:${r.name}_energy_input_hatch`, `gtceu:${r.name}_energy_output_hatch`,
    ...['quadruple', 'octal', 'hex'].map((w) => `gtceu:${r.wire}_${w}_wire`), gtmMaker].filter((id) => id !== null && id !== undefined);
  // UHV-A9's link is ours (the nuclear clock, uhv/foundation.js), newer than the dump; so are UEV-W's emitter, sensor and node (uev/foundation.js)
  const ours = [r.cell, gtmMaker ? null : r.cellMadeBy, ...[r.emitter, r.sensor, r.link, r.plate].filter((id) => /^grindless:/.test(String(id)))].filter(Boolean);
  return { gtm, ours };
}

test('LuV wireless ids: every id of the table\'s rows, the LuV row first, is GTM 7.5.3\'s exact id or one the pack registers', () => {
  const luv = rowIds(TABLE.tiers[5]);
  assert.deepEqual(luv.gtm, ['gtceu:luv_vanadium_battery', 'gtceu:luv_emitter', 'gtceu:luv_sensor', 'gtceu:quantum_star', 'gtceu:rhodium_plated_palladium_plate',
    'gtceu:luv_energy_input_hatch', 'gtceu:luv_energy_output_hatch', 'gtceu:niobium_titanium_quadruple_wire', 'gtceu:niobium_titanium_octal_wire',
    'gtceu:niobium_titanium_hex_wire']);
  assert.deepEqual(luv.ours, [SMES, 'gtceu:hts_magnet_works']);
  const run = packRun();
  for (const r of TABLE.tiers) {
    const { gtm, ours } = rowIds(r);
    for (const id of ours) assert.ok(run.registry.items.has(id) || run.registry.machines.has(id), r.name + ': ' + id + ' is registered by the pack');
    for (const id of gtm) assert.match(id, /^(gtceu|minecraft):[a-z0-9_]+$/, r.name + ': ' + id);
    if (r.batteries) assert.match(r.batteries, /^#gtceu:batteries\/[a-z]+$/);
  }
  if (!DUMP_DIR) return;
  const doc = dumpJson('items.json');
  const items = new Set(doc.items.map((x) => (typeof x === 'string' ? x : x.id)));
  const fluids = new Set((doc.fluids || []).map((x) => (typeof x === 'string' ? x : x.id)));
  for (const r of TABLE.tiers) {
    for (const id of rowIds(r).gtm.filter((x) => !/lay_superhydride|metallic_hydrogen|rhea|pasta_strand|chain_strand|horizon_strand|^gtceu:(uev|uiv|uxv|opv|max)_/.test(x))) {
      assert.ok(items.has(id), r.name + ': ' + id + ' is not an item of GTM 7.5.3\'s registry (exact id)');
      assert.ok(!fluids.has(id), r.name + ': ' + id + ' is a fluid, not an item');
    }
  }
});

test('LuV wireless names and textures: en_us and es_es for every LuV block and item (GTM\'s LuV colour), and the textures they point at', () => {
  const { lang } = packRun();
  const ids = [];
  for (const kind of ['energy', 'dynamo']) for (const a of TABLE.hatchAmps) ids.push(`block.gtceu.luv_wireless_${kind}_hatch${a === 2 ? '' : '_' + a + 'a'}`);
  ids.push('item.grindless.luv_wireless_energy_cover', 'item.grindless.luv_wireless_dynamo_cover');
  for (const l of ['en_us', 'es_es']) {
    for (const k of ids) assert.match(String(lang[l][k]), /^\u00a7dLuV |\u00a7d.* LuV( de \d+ A)?$/, l + ' ' + k);
    assert.ok(lang[l]['block.grindless.luv_smes_cell'], l + ' names the SMES cell');
    assert.ok(lang[l]['tooltip.grindless.wireless_cell.made_by'], l + ': the made-by tooltip');
    assert.ok(lang[l]['emi.grindless.info.capacitor_cells.2'], l + ': the EMI page\'s SMES line');
  }
  assert.equal(lang.en_us['block.grindless.luv_smes_cell'], 'LuV SMES Cell');
  assert.equal(lang.en_us['block.gtceu.luv_wireless_energy_hatch_64a'], '\u00a7dLuV 64A Wireless Energy Hatch');
  const tex = path.join(PACK, 'kubejs', 'assets', 'grindless', 'textures');
  for (const r of TABLE.tiers) {
    const cell = r.texture ? String(r.texture).replace(/^grindless:/, '') : 'block/wireless/capacitor_cell_' + r.name;
    assert.ok(fs.existsSync(path.join(tex, cell + '.png')), r.name + ': ' + cell);
    for (const kind of ['energy', 'dynamo']) {
      assert.ok(fs.existsSync(path.join(tex, 'item', 'wireless', `${kind}_cover_${r.name}.png`)), r.name + ' ' + kind + ' cover item');
      assert.ok(fs.existsSync(path.join(tex, 'block', 'cover', `wireless_${kind}_cover_${r.name}.png`)), r.name + ' ' + kind + ' cover face');
    }
  }
  const page = (f) => JSON.parse(fs.readFileSync(path.join(PACK, 'kubejs', 'assets', 'emi', 'recipe', 'additions', 'grindless', f), 'utf8'));
  for (const r of TABLE.tiers) assert.ok(page('capacitor_cells.json').stacks.includes('item:' + r.cell), r.cell + ' on the cells\' EMI page');
  for (const c of TABLE.tiers.flatMap((r) => ['energy', 'dynamo'].map((k) => `item:grindless:${r.name}_wireless_${k}_cover`))) {
    assert.ok(page('wireless_covers.json').stacks.includes(c), c + ' on the covers\' EMI page');
  }
});

// the settlement at LuV: towers of SMES cells (and IV cells) in the Overworld band of LuV-A4, hatches in a row in front of them
const LX = 15392;
function luvWorld() {
  const earth = new Level('minecraft:overworld');
  const levels = { 'minecraft:overworld': earth, 'gcyr:luna': new Level('gcyr:luna') };
  // a formed tower at (x, 100, z) whose cells stand in its 32 slots (8 high, 4 deep); `cells` lists them by id
  const tower = (x, z, cells) => {
    const at = cells.map((id, i) => {
      const p = new Pos(x, 101 + (i % 8), z + 1 + Math.floor(i / 8));
      earth.put(p.x, p.y, p.z, id);
      return p;
    });
    const t = { formed: true, at, isFormed() { return this.formed; }, getLevel: () => earth,
      getMultiblockState: () => ({ cache: at, getCache: () => ({ iterator: () => iterator(at) }) }) };
    earth.put(x, 100, z, 'gtceu:wireless_energy_tower', t);
    return t;
  };
  const hatch = (x, id, capacity, stored = 0) => earth.put(x, 100, 40, id, coverable({ energyContainer: new Container(PLAIN, capacity, stored) }, 0, 0));
  return { levels, earth, tower, hatch };
}
const cells = (n, id) => Array.from({ length: n }, () => id);
const IV_CELL = 'grindless:iv_capacitor_cell';
const IV_EU = 245760000;

test('LuV wireless jump: LuV only when every formed tower holds LuV cells; above the network\'s tier a LuV hatch gets nothing, IV ones are filled', () => {
  const { W, errors } = jvm();
  const w = luvWorld();
  const server = serverOf(w);
  const smesTower = w.tower(LX, 0, cells(32, SMES));
  w.tower(LX + 8, 0, cells(4, IV_CELL));
  const luv2 = w.hatch(LX + 16, 'gtceu:luv_wireless_energy_hatch', 32768 * 16 * 2);
  const iv2 = w.hatch(LX + 18, 'gtceu:iv_wireless_energy_hatch', 8192 * 16 * 2);
  const iv64 = w.hatch(LX + 20, 'gtceu:iv_wireless_energy_hatch_64a', 8192 * 16 * 64);
  for (const x of [LX, LX + 8]) assert.ok(W.track(w.earth, new Pos(x, 100, 0)), 'tower at ' + x);
  for (const x of [LX + 16, LX + 18, LX + 20]) assert.ok(W.track(w.earth, new Pos(x, 100, 40)), 'hatch at ' + x);
  W.paused = true;
  W.setStored(server, 10000000000);
  // two towers: the SMES one and an IV one; the network is IV (the weakest cell of every formed tower)
  const st = W.settle(server);
  assert.equal(st.up, true);
  assert.equal(st.towers, 2);
  assert.equal(st.tier, 5);
  assert.equal(st.capacity, 32 * SMES_EU + 4 * IV_EU);
  assert.equal(st.skippedAbove, 1, 'the LuV hatch is above the network\'s tier');
  assert.equal(luv2.energyContainer.getEnergyStored(), 0, 'and gets nothing');
  assert.equal(iv2.energyContainer.getEnergyStored(), 163840, 'the IV 2 A hatch filled: V x 2 x 10 ticks (its rated amperage per window)');
  assert.equal(iv64.energyContainer.getEnergyStored(), 5242880, 'the IV 64 A hatch filled: V x 64 x 10 ticks');
  assert.equal(st.out, 163840 + 5242880);
  assert.equal(W.stored(server), 10000000000 - st.out);
  const above = W.readout(server, LUV, true);
  assert.equal(above.key, 'message.grindless.wireless.above_tier');
  assert.deepEqual(plain(above.args), ['LuV', 'IV'], 'its readout says why, in GTM\'s names');
  assert.equal(W.readout(server, 5, true).key, 'message.grindless.wireless.readout');
  // the IV tower broken: the network jumps to LuV and the LuV hatch is filled
  w.earth.blocks.delete((LX + 8) + ',100,0');
  w.earth.machines.delete((LX + 8) + ',100,0');
  const jump = W.settle(server);
  assert.equal(jump.forgotten, 1, 'the broken tower is forgotten');
  assert.equal(jump.towers, 1);
  assert.equal(jump.tier, LUV);
  assert.equal(jump.capacity, 32 * SMES_EU, '31,457,280,000 EU: past an int');
  assert.equal(jump.skippedAbove, 0);
  assert.equal(luv2.energyContainer.getEnergyStored(), 655360, 'the LuV 2 A hatch filled: V x 2 x 10 ticks');
  assert.equal(jump.out, 655360 + (262144 - 163840) + (8388608 - 5242880), 'and the IV hatches top up their buffers');
  const reading = W.readout(server, LUV, true);
  assert.equal(reading.key, 'message.grindless.wireless.readout');
  assert.equal(reading.args[0], 'LuV');
  // a mixed tower: one IV cell among the SMES cells and the tower (so the network) is IV again; replaced, LuV
  luv2.energyContainer.setEnergyStored(0);
  w.earth.put(smesTower.at[5].x, smesTower.at[5].y, smesTower.at[5].z, IV_CELL);
  const mixed = W.settle(server);
  assert.equal(mixed.tier, 5);
  assert.equal(mixed.capacity, 31 * SMES_EU + IV_EU);
  assert.equal(luv2.energyContainer.getEnergyStored(), 0);
  const entry = W.tracked(server).find((e) => e.k === 'tower');
  assert.deepEqual([entry.t, entry.n, entry.c], [5, 32, 31 * SMES_EU + IV_EU], 'the recorded tower follows its weakest cell');
  w.earth.put(smesTower.at[5].x, smesTower.at[5].y, smesTower.at[5].z, SMES);
  const back = W.settle(server);
  assert.equal(back.tier, LUV);
  assert.equal(luv2.energyContainer.getEnergyStored(), 655360);
  assert.deepEqual(plain(Object.keys(W.faults)), []);
  assert.deepEqual(errors, []);
});

test('LuV wireless dynamo: a 64 A LuV dynamo hatch puts 19/20 of what it gives into the network, in whole multiples of 20 EU', () => {
  const { W, errors } = jvm();
  const w = luvWorld();
  const server = serverOf(w);
  w.tower(LX, 0, cells(32, SMES));
  const buffer = 32768 * 64 * 64;
  assert.equal(buffer, 134217728, 'GTM\'s dynamo hatch: V x 64 x A');
  const dyn = w.hatch(LX + 16, 'gtceu:luv_wireless_dynamo_hatch_64a', buffer, buffer);
  const in64 = w.hatch(LX + 18, 'gtceu:luv_wireless_energy_hatch_64a', 32768 * 16 * 64);
  W.track(w.earth, new Pos(LX, 100, 0));
  W.track(w.earth, new Pos(LX + 16, 100, 40));
  W.paused = true;
  W.setStored(server, 0);
  const st = W.settle(server);
  assert.equal(st.drained, 20971520, 'a whole multiple of 20: the rated V x 64 x 10 ticks of one window');
  assert.equal(st.in, 19922944);
  assert.equal(st.in * 20, st.drained * 19, 'exactly 19/20');
  assert.equal(st.lost, st.drained - st.in);
  assert.equal(dyn.energyContainer.getEnergyStored(), buffer - 20971520, 'the rest waits for the next windows');
  assert.equal(W.stored(server), 19922944);
  // a remainder under 20 waits until it makes 20
  dyn.energyContainer.setEnergyStored(8);
  assert.equal(W.settle(server).drained, 0);
  dyn.energyContainer.setEnergyStored(20);
  const next = W.settle(server);
  assert.deepEqual([next.drained, next.in, next.lost], [20, 19, 1]);
  // a 64 A LuV energy hatch takes at most V x 64 x 10 ticks in one settlement, and no more than the store holds
  W.track(w.earth, new Pos(LX + 18, 100, 40));
  const fill = W.settle(server);
  assert.equal(in64.energyContainer.getEnergyStored(), 19922963);
  assert.equal(fill.out, 19922963);
  assert.equal(W.stored(server), 0);
  assert.equal(W.totals.in, 19922944 + 19);
  assert.deepEqual(errors, []);
});

test('LuV wireless: a 32-SMES-cell tower\'s capacity (past an int) and a store past an int survive the registry and a cold restart', () => {
  const big = { k: 'tower', d: 'minecraft:overworld', x: LX, y: 100, z: 0, f: true, c: 32 * SMES_EU, t: LUV, n: 32 };
  assert.ok(big.c > 2147483647);
  const tag = R.toTag(big);
  assert.equal(tag.getTagType('c'), 4, 'a long');
  assert.deepEqual(plain(R.fromTag(tag)), plain(R.canon(big)));
  // the cold restart: tracked and settled in one JVM, persistent data through NbtIo's bytes, read by a second JVM
  const w = luvWorld();
  w.tower(LX, 0, cells(32, SMES));
  const pd1 = new CompoundTag();
  const server1 = serverOf(w, pd1);
  const j1 = jvm();
  j1.W.track(w.earth, new Pos(LX, 100, 0));
  j1.W.setStored(server1, 30000000000);
  j1.W.paused = true;
  const before = j1.W.settle(server1);
  assert.equal(before.capacity, 31457280000);
  const bytes = writeNbt(pd1);
  const j2 = jvm();
  const server2 = serverOf(w, readNbt(bytes));
  assert.deepEqual(plain(j2.W.tracked(server2)), [plain(R.canon(big))], 'the tower as recorded, its capacity a long');
  assert.equal(j2.W.stored(server2), 30000000000);
  // its chunk unloaded: the recorded tower still counts, at LuV
  w.earth.loaded = false;
  j2.W.paused = true;
  const st = j2.W.settle(server2);
  assert.deepEqual([st.up, st.tier, st.capacity, st.towers], [true, LUV, 31457280000, 1]);
  assert.equal(j2.W.stored(server2), 30000000000);
  assert.deepEqual(j1.errors.concat(j2.errors), []);
});