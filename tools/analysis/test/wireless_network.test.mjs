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
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

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
