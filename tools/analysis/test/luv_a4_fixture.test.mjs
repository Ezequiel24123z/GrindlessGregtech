// The native fixture of package LuV-A4 (tools/test/overlay/kubejs/server_scripts/gg_test_luv_a4.js), checked without the game:
//   - it compiles (vm.Script);
//   - its plan (global.ggTestLuvA4Plan: every block it places, every fill and force-load, in the run's order) stays inside its band
//     (AGENTS.md, "HTS magnet works and LuV wireless (LuV-A4)": the Overworld X 15360-15423, Z 0-63, Y 98-112 and gcyr:overworld_orbit
//     X 15392-15423, Z 0-63, Y 98-112), the magnet works stays in X 15360-15391 and the towers and the LuV machines in X 15392-15423,
//     every structure it builds matches the pattern lib/patterns.js describes (blocks, frames, parts and their limits) at each stage;
//   - every item, block and fluid id it uses (placed, stocked, expected, derived from the network) is in a native dump's items.json
//     exactly (its `items` and `fluids`: GG_ITEMS_DUMP, by default the power-quests-1 run's), or, new since that dump, registered by the
//     pack's own startup scripts (fired here with recorders: KubeJS items and blocks, GTM machines with their tiers, GTM materials with
//     their forms); with no dump on the machine, against the ids taken from it (NATIVE_ITEMS / NATIVE_FLUIDS);
//   - the whole fixture runs in a simulated server: the pack's own startup scripts (patterns, the wireless network with its LuV row, the
//     LuV foundation, the magnet works, the generator array), the network's server script and libraries and the magnet works' recipe
//     script, in one sandbox, with stand-ins for GTM's machines that copy GTM 7.5.3's rules (EnergyContainerList,
//     WorkableElectricMultiblockMachine#getMaxVoltage / #getOverclockVoltage, the non-perfect overclock, RecipeLogic's waits and
//     suspension, ElectricItem). Every check passes, the band is left empty and released, the network's persistent data is put back
//     exactly as it was, the queue is left; a request with no turn fails TURN and ends; without the LuV row only its own checks fail.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { makeAny } from '../lib/kubejs_static.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const PACK = path.join(ROOT, 'pack');
const KJS = path.join(PACK, 'kubejs');
const FIXTURE = path.join(ROOT, 'tools', 'test', 'overlay', 'kubejs', 'server_scripts', 'gg_test_luv_a4.js');
const STARTUP = ['lib/patterns.js', 'lib/generators.js', 'lib/parallel_hatch.js', 'lv/wireless_energy.js', 'luv/foundation.js', 'luv/hts_magnet_works.js',
  'power/generator_array.js'].map((f) => path.join(KJS, 'startup_scripts', 'grindless', f));
const SERVER = ['lib/wireless_registry.js', 'lib/wireless_adapters.js', 'lv/wireless_energy.js', 'luv/hts_magnet_works.js']
  .map((f) => path.join(KJS, 'server_scripts', 'grindless', f));

const EARTH = 'minecraft:overworld';
const ORBIT = 'gcyr:overworld_orbit';
const BANDS = {
  [EARTH]: { x0: 15360, x1: 15423, z0: 0, z1: 63, y0: 98, y1: 112 },
  [ORBIT]: { x0: 15392, x1: 15423, z0: 0, z1: 63, y0: 98, y1: 112 },
};
const inBand = (dim, x, y, z) => { const b = BANDS[dim]; return !!b && x >= b.x0 && x <= b.x1 && z >= b.z0 && z <= b.z1 && y >= b.y0 && y <= b.y1; };

const V = [8, 32, 128, 512, 2048, 8192, 32768, 131072, 524288, 2097152, 8388608, 33554432, 134217728, 536870912, 2147483648];
const VA = V.map((v) => Math.floor(v * 15 / 16));
const tierAtLeast = (v) => { let t = 0; while (t < V.length - 1 && V[t] < v) t++; return t; };
const tierAtMost = (v) => { let t = 0; while (t < V.length - 1 && V[t + 1] <= v) t++; return t; };

// GTM's tier names (GTValues.VN): the network's readout uses them through W.tierLabels
const VN = ['ULV', 'LV', 'MV', 'HV', 'EV', 'IV', 'LuV', 'ZPM', 'UV', 'UHV', 'UEV', 'UIV', 'UXV', 'OpV', 'MAX'];

// The native dump the ids are checked against (gg_dump.js's items.json: every registered item, block item and fluid of a real server),
// and the ids of GTM 7.5.3 and vanilla the fixture uses, as that dump has them (2026-10-26, power-quests-1); with no dump on this
// machine the test checks against this list instead. The pack's own new ids are checked against its registrations, not the dump.
const ITEMS_DUMP = process.env.GG_ITEMS_DUMP ||
  'C:\\Users\\EzequielC\\.copilot\\session-state\\52ba6327-e548-48e7-aa57-41c2373d41c2\\files\\test-runs\\power-quests-1\\results\\server\\kubejs-exported\\items.json';
const NATIVE_ITEMS = ['gtceu:hv_input_bus', 'gtceu:hv_output_bus', 'gtceu:hv_input_hatch', 'gtceu:lv_output_hatch', 'gtceu:luv_macerator',
  'gtceu:luv_battery_buffer_4x', 'gtceu:luv_vanadium_battery', 'gtceu:superconducting_coil', 'gtceu:programmed_circuit', 'gtceu:frostproof_machine_casing',
  'gtceu:stainless_steel_gearbox', 'gtceu:ptfe_pipe_casing', 'gtceu:laminated_glass', 'gtceu:tungsten_steel_frame', 'gtceu:solid_machine_casing',
  'gtceu:steel_frame', 'gtceu:steel_gearbox', 'gtceu:steel_pipe_casing', 'gtceu:niobium_titanium_foil', 'gtceu:luv_machine_hull',
  'gtceu:mercury_barium_calcium_cuprate_single_wire', 'gtceu:hsss_frame', 'gtceu:hsss_ring', 'gtceu:titanium_plate',
  'minecraft:air', 'minecraft:smooth_stone', 'minecraft:iron_ingot', 'minecraft:glass'];
const NATIVE_FLUIDS = ['gtceu:trinium', 'gtceu:epoxy', 'gtceu:liquid_helium', 'gtceu:steam'];
// GTM's machines the simulated registry answers for
const GTM_MACHINES = ['gtceu:hv_input_bus', 'gtceu:hv_output_bus', 'gtceu:hv_input_hatch', 'gtceu:lv_output_hatch', 'gtceu:luv_macerator', 'gtceu:luv_battery_buffer_4x'];

// ---------------------------------------------------------------- NBT stand-ins (net.minecraft.nbt, 1.20.1; as wireless_network.test.mjs)

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
  putInt(k, v) { if (!Number.isInteger(v)) throw new Error('putInt: ' + v); this.map.set(k, new IntTag(v)); }
  putLong(k, v) { if (!Number.isSafeInteger(v)) throw new Error('putLong: ' + v); this.map.set(k, new LongTag(v)); }
  putBoolean(k, v) { this.map.set(k, new ByteTag(v ? 1 : 0)); }
  get(k) { return this.map.has(k) ? this.map.get(k) : null; }
  getTagType(k) { return this.map.has(k) ? this.map.get(k).id : 0; }
  contains(k, type) { if (type === undefined) return this.map.has(k); const id = this.getTagType(k); return id === type || (type === 99 && id >= 1 && id <= 6); }
  getString(k) { const t = this.map.get(k); return t && t.id === 8 ? t.v : ''; }
  getInt(k) { const t = this.map.get(k); return t && (t.id === 1 || t.id === 3) ? t.v : t && t.id === 4 ? Number(BigInt.asIntN(32, t.v)) : 0; }
  getLong(k) { const t = this.map.get(k); return t && (t.id === 1 || t.id === 3) ? t.v : t && t.id === 4 ? Number(t.v) : 0; }
  getBoolean(k) { const t = this.map.get(k); return !!(t && t.id === 1 && t.v !== 0); }
  getList(k, type) { const t = this.map.get(k); return t && t.id === 9 && (t.type === type || t.size() === 0) ? t : new ListTag(); }
  getCompound(k) { const t = this.map.get(k); return t && t.id === 10 ? t : new CompoundTag(); }
  remove(k) { this.map.delete(k); }
  copy() { const c = new CompoundTag(); this.map.forEach((t, k) => c.map.set(k, t.copy())); return c; }
}
// a tag's content as plain data, to compare two compounds
const dumpTag = (t) => (t === null ? null : t.id === 10 ? Object.fromEntries([...t.map].map(([k, v]) => [k, dumpTag(v)]))
  : t.id === 9 ? t.items.map(dumpTag) : t.id === 4 ? 'L' + t.v : t.v);

// KubeJS 2001.6.5's `global`: a Java HashMap; a stored number or string comes back as a wrapped Java object (wireless_network.test.mjs)
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
const storedIn = (g, key) => g[STORED].get(key);

// ---------------------------------------------------------------- small game stand-ins

class RL { constructor(id) { this.id = String(id); } toString() { return this.id; } }
class Pos {
  constructor(x, y, z) { this.x = x; this.y = y; this.z = z; }
  getX() { return this.x; }
  getY() { return this.y; }
  getZ() { return this.z; }
}
const key = (x, y, z) => x + ',' + y + ',' + z;
const SIDES = Object.fromEntries(['down', 'up', 'north', 'south', 'west', 'east'].map((n) => [n, { name: n, getName: () => n }]));
const Direction = { byName: (n) => SIDES[n] || null, values: () => Object.values(SIDES), UP: SIDES.up };
const text = (k, ...args) => {
  const t = { key: k, args: args.map(String), getString: () => k, getContents: () => ({ getKey: () => k, getArgs: () => args.map(String) }) };
  t.gold = t.aqua = t.red = t.gray = t.darkGray = () => t;
  return t;
};
const list = (a) => ({ a, size: () => a.length, get: (i) => a[i], iterator() { let i = 0; return { hasNext: () => i < a.length, next: () => a[i++] }; } });
class AL {
  constructor(c) {
    this.a = Array.isArray(c) ? c.slice() : c && Array.isArray(c.a) ? c.a.slice() : c && typeof c.size === 'function' ? Array.from({ length: c.size() }, (_, i) => c.get(i)) : [];
  }
  size() { return this.a.length; }
  get(i) { return this.a[i]; }
  add(x) { this.a.push(x); return true; }
}

// ElectricItem#charge / #discharge as GTM 7.5.3 (wireless_network.test.mjs)
function electric({ max, charge = 0, tier = 1, transfer = V[tier] }) {
  return {
    max, value: charge, tier, transfer,
    getCharge() { return this.value; },
    getMaxCharge() { return this.max; },
    getTier() { return this.tier; },
    getTransferLimit() { return this.transfer; },
    canProvideChargeExternally() { return true; },
    charge(amount, chargerTier, ignoreTransferLimit, simulate) {
      if (chargerTier < this.tier || amount <= 0) return 0;
      if (!ignoreTransferLimit) amount = Math.min(amount, this.transfer);
      const got = Math.min(amount, this.max - this.value);
      if (!simulate) this.value += got;
      return got;
    },
    discharge(amount, chargerTier, ignoreTransferLimit, externally, simulate) {
      if (chargerTier < this.tier || amount <= 0) return 0;
      if (!ignoreTransferLimit) amount = Math.min(amount, this.transfer);
      const got = Math.min(amount, this.value);
      if (!simulate) this.value -= got;
      return got;
    },
  };
}
const BATTERIES = { 'gtceu:luv_vanadium_battery': { max: 163840000, tier: 6 } };

// item and fluid stacks
const EMPTY = { id: 'minecraft:air', count: 0, isEmpty: () => true, getCount: () => 0, getItem: () => ({ id: 'minecraft:air' }), shrink() {} };
function stackOf(id, count = 1, extra = {}) {
  const b = BATTERIES[id];
  const s = { id, count, isEmpty() { return this.count <= 0; }, getCount() { return this.count; }, getItem: () => ({ id }), shrink(n) { this.count -= n; }, ...extra };
  if (b) s.e = electric({ max: b.max, tier: b.tier });
  return s;
}
const FLUID_EMPTY = { isEmpty: () => true, getAmount: () => 0, getFluid: () => ({ id: 'minecraft:empty' }) };
const fluidStack = (id, amount) => ({ id, amount, isEmpty: () => amount <= 0, getAmount: () => amount, getFluid: () => ({ id }) });

class Inventory {
  constructor(n) { this.slots = Array.from({ length: n }, () => EMPTY); }
  getSlots() { return this.slots.length; }
  getStackInSlot(i) { return this.slots[i]; }
  setStackInSlot(i, s) { this.slots[i] = s && !s.isEmpty() ? stackOf(s.id, s.getCount(), s.circuit ? { circuit: s.circuit } : {}) : EMPTY; if (s && s.e) this.slots[i].e = s.e; }
  insertItem(i, s, simulate) {
    const cur = this.slots[i];
    if (s.isEmpty()) return EMPTY;
    if (!cur.isEmpty() && cur.id !== s.id) return s;
    const room = 64 - (cur.isEmpty() ? 0 : cur.count);
    const n = Math.min(room, s.count);
    if (!simulate && n > 0) this.slots[i] = stackOf(s.id, (cur.isEmpty() ? 0 : cur.count) + n);
    return s.count - n > 0 ? stackOf(s.id, s.count - n) : EMPTY;
  }
  counts() { const c = {}; this.slots.forEach((s) => { if (!s.isEmpty()) c[s.id] = (c[s.id] || 0) + s.count; }); return c; }
  take(id, n) { for (const s of this.slots) if (!s.isEmpty() && s.id === id && n > 0) { const k = Math.min(n, s.count); s.count -= k; n -= k; } this.slots = this.slots.map((s) => (s.isEmpty() ? EMPTY : s)); }
  add(id, n) { for (let i = 0; i < this.slots.length && n > 0; i++) { const r = this.insertItem(i, stackOf(id, n), false); n = r.isEmpty() ? 0 : r.count; } return n === 0; }
}
class Tank {
  constructor() { this.stack = FLUID_EMPTY; }
  getFluidInTank() { return this.stack; }
  setFluidInTank(i, fs) { this.stack = fs && !fs.isEmpty() ? fluidStack(fs.id, fs.getAmount()) : FLUID_EMPTY; }
}

// ---------------------------------------------------------------- structures (lib/patterns.js's plain data, read independently of the fixture)

// every cell of a description, its controller at p facing north (slices back -> front go south -> north, columns left -> right go east -> west)
function cellsOf(desc, p) {
  let ctrl = null;
  desc.slices.forEach((rows, si) => rows.forEach((row, ri) => [...row].forEach((ch, ci) => { if (desc.symbols[ch] && desc.symbols[ch].kind === 'controller') ctrl = { si, ri, ci }; })));
  const out = [];
  desc.slices.forEach((rows, si) => rows.forEach((row, ri) => [...row].forEach((ch, ci) => {
    if (ch !== ' ') out.push({ x: p.x - (ci - ctrl.ci), y: p.y + (ri - ctrl.ri), z: p.z - (si - ctrl.si), si, ri, ci, sym: desc.symbols[ch] });
  })));
  return out;
}

// the part ability of a block id: the wireless hatches from the network's object, GTM's buses and hatches by GTM's names
function abilityOf(id, W) {
  const h = W.hatches[id];
  if (h) return h.kind === 'hatch' ? 'energy_input' : 'energy_output';
  if (/^gtceu:[a-z]+_input_bus$/.test(id)) return 'input_bus';
  if (/^gtceu:[a-z]+_output_bus$/.test(id)) return 'output_bus';
  if (/^gtceu:[a-z]+_input_hatch$/.test(id)) return 'input_hatch';
  if (/^gtceu:[a-z]+_output_hatch$/.test(id)) return 'output_hatch';
  if (/^gtceu:[a-z]+_parallel_hatch$/.test(id)) return 'parallel_hatch';
  return null;
}

function accepts(sym, id, W) {
  if (sym.kind === 'blocks') return sym.blocks.includes(id);
  if (sym.kind === 'frames') return sym.materials.some((m) => id === 'gtceu:' + m + '_frame');
  if (sym.kind === 'part') return abilityOf(id, W) === sym.ability;
  if (sym.kind === 'oneOf') return sym.options.some((o) => accepts(o, id, W));
  if (sym.kind === 'air') return id === 'minecraft:air';
  return true;
}

// why the structure at p would not form (GTM's predicates and their global limits); [] when it would
function structureProblems(desc, p, blockAt, W) {
  const problems = [];
  const counts = new Map();
  for (const c of cellsOf(desc, p)) {
    if (c.sym.kind === 'controller') continue;
    const id = blockAt(c.x, c.y, c.z);
    if (!accepts(c.sym, id, W)) { problems.push(key(c.x, c.y, c.z) + ' ' + id + ' does not fit ' + c.sym.kind); continue; }
    const hit = (c.sym.kind === 'oneOf' ? c.sym.options : [c.sym]).find((o) => accepts(o, id, W));
    if (hit && hit.limits) counts.set(hit, (counts.get(hit) || 0) + 1);
  }
  for (const sym of Object.values(desc.symbols)) {
    for (const o of sym.kind === 'oneOf' ? sym.options : [sym]) {
      if (!o.limits) continue;
      const n = counts.get(o) || 0;
      const what = (o.ability || (o.blocks || []).join('|')) + ' x' + n;
      if (o.limits.exact != null && n !== o.limits.exact) problems.push(what + ', exactly ' + o.limits.exact);
      if (o.limits.min != null && n < o.limits.min) problems.push(what + ', at least ' + o.limits.min);
      if (o.limits.max != null && n > o.limits.max) problems.push(what + ', at most ' + o.limits.max);
    }
  }
  return problems;
}

// ---------------------------------------------------------------- GTM's energy rules (7.5.3)

// EnergyContainerList.calculateVoltageAmperage
function foldVoltage(v, a) {
  const oddFactor = (n) => { while (n % 2 === 0 && n > 1) n /= 2; return n > 1; };
  const powerOfFour = (n) => n > 0 && (n & (n - 1)) === 0 && (n & 0x55555555) !== 0;
  if (v > 1 && a > 1) {
    if (oddFactor(a) || powerOfFour(a)) a = 1;
    else if (a % 4 === 0) { while (a > 4) a /= 4; v /= a; } else if (a === 2) v /= a;
    else a = 1;
  }
  return { v, a };
}

// an energy container as NotifiableEnergyContainer (changeEnergy exactly as GTM 7.5.3)
const PLAIN = 'com.gregtechceu.gtceu.api.machine.trait.NotifiableEnergyContainer';
const RECIPE_AMPS = 'com.gregtechceu.gtceu.api.machine.trait.RecipeAmperageEnergyContainer';
const BUFFER_TRAIT = 'com.gregtechceu.gtceu.common.machine.electric.BatteryBufferMachine$EnergyBatteryTrait';
class Container {
  constructor(name, capacity, { vin = 0, ain = 0, vout = 0, aout = 0 } = {}) { Object.assign(this, { name, capacity, vin, ain, vout, aout, stored: 0 }); }
  getClass() { return { getName: () => this.name, getSimpleName: () => this.name.split(/[.$]/).pop() }; }
  getEnergyStored() { return this.stored; }
  getEnergyCapacity() { return this.capacity; }
  setEnergyStored(v) { this.stored = v; }
  changeEnergy(add) {
    const old = this.getEnergyStored();
    let now = this.capacity - old < add ? this.capacity : old + add;
    if (now < 0) now = 0;
    this.setEnergyStored(now);
    return now - old;
  }
  getInputVoltage() { return this.vin; }
  getInputAmperage() { return this.ain; }
  getOutputVoltage() { return this.vout; }
  getOutputAmperage() { return this.aout; }
  checkOutputSubscription() {}
}

function energyList(containers) {
  let tin = 0; let tout = 0; let ain = 0; let aout = 0; let hi = 0;
  containers.forEach((c) => { tin += c.vin * c.ain; tout += c.vout * c.aout; ain += c.ain; aout += c.aout; if (c.vin > hi) hi = c.vin; });
  const num = containers.filter((c) => c.vin === hi).length;
  const i = foldVoltage(tin, ain);
  const o = foldVoltage(tout, aout);
  return {
    getInputVoltage: () => i.v, getInputAmperage: () => i.a, getOutputVoltage: () => o.v, getOutputAmperage: () => o.a,
    getHighestInputVoltage: () => hi, getNumHighestInputContainers: () => num,
    stored: () => containers.reduce((s, c) => s + c.stored, 0),
    drain: (n) => { for (const c of containers) { const k = Math.min(n, c.stored); c.stored -= k; n -= k; } },
  };
}

// OverclockingLogic NON_PERFECT_OVERCLOCK (GTRecipeModifiers.ELECTRIC_OVERCLOCK: getOverclockVoltage)
function overclock(eut, duration, ocVoltage) {
  let ocs = tierAtMost(ocVoltage) - tierAtLeast(eut);
  if (tierAtLeast(eut) === 0) ocs--;
  let e = eut;
  let d = duration;
  while (ocs-- > 0 && e * 4 <= ocVoltage && d > 1) { e *= 4; d = Math.max(1, Math.floor(d / 2)); }
  return { eut: e, duration: d };
}

// ---------------------------------------------------------------- machines

const MW_ID = 'gtceu:hts_magnet_works';
const ARRAY_ID = 'gtceu:generator_array';
const FLUID_CAP = { name: 'fluid' };
const ITEM_CAP = { name: 'item' };

function coverable(m) {
  m.covers = new Map();
  m.getCoverContainer = () => ({
    getCoverAtSide: (s) => m.covers.get(s.name) || null,
    placeCoverOnSide: (s, stack, def) => { m.covers.set(s.name, { coverDefinition: def, getClass: () => ({ getSimpleName: () => 'Marker' }) }); return true; },
  });
  return m;
}

function recipeLogic(m) {
  return {
    getStatus: () => m.st.status, getProgress: () => m.st.progress, getMaxProgress: () => m.st.duration, getDuration: () => m.st.duration,
    getLastRecipe: () => m.st.last, isActive: () => m.st.status === 'WORKING' || m.st.status === 'WAITING', updateTickSubscription() {},
    getFailureReasons: () => m.reasons.map((r) => text(r)),
  };
}
const idle = () => ({ status: 'IDLE', progress: 0, duration: 0, eut: 0, last: null, runAttempt: 0, runDelay: 0 });

function simple(id, extra) {
  return Object.assign({ id, getDefinition: () => ({ getId: () => id }) }, extra);
}

// a multiblock controller: GTM checks an unformed structure every 20 ticks, and a formed one again whenever one of its blocks changes
class Multi {
  constructor(sim, level, id, p) {
    Object.assign(this, { sim, level, id, p, formed: false, cache: null, next: sim.tick + 20, st: idle(), reasons: [] });
    this.cells = cellsOf(sim.G.structures[id], p);
    this.cellKeys = new Set(this.cells.map((c) => key(c.x, c.y, c.z)));
  }
  getDefinition() { return { getId: () => this.id }; }
  problems() { return structureProblems(this.sim.G.structures[this.id], this.p, (x, y, z) => this.level.blockAt(x, y, z), this.sim.W); }
  isFormed() { return this.formed; }
  checkPatternWithLock() { return this.problems().length === 0; }
  setFlipped() {}
  onStructureFormed() { this.formed = true; this.cache = this.cells.map((c) => new Pos(c.x, c.y, c.z)); }
  onStructureInvalid() { this.formed = false; this.cache = null; this.st = idle(); }
  getMultiblockState() { return { cache: this.cache, getCache: () => list(this.cache || []), isNeededFlip: () => false, error: this.problems().join('; ') }; }
  getLevel() { return this.level; }
  getRecipeLogic() { return recipeLogic(this); }
  setActiveRecipeType() {}
  parts() { return this.cells.filter((c) => c.sym.kind === 'oneOf').map((c) => this.level.machines.get(key(c.x, c.y, c.z))).filter(Boolean); }
  getParts() { return this.formed ? this.parts() : []; }
  blockChanged(k) {
    if (!this.formed || !this.cellKeys.has(k)) return;
    if (this.checkPatternWithLock()) this.onStructureFormed();
    else this.onStructureInvalid();
  }
  tick() {
    if (!this.formed && this.sim.tick >= this.next) {
      this.next = this.sim.tick + 20;
      if (this.checkPatternWithLock()) this.onStructureFormed();
    }
    if (this.formed) this.work();
  }
  work() {}
}

// the magnet works: WorkableElectricMultiblockMachine's voltage rules and RecipeLogic's runs, waits and suspension
class MagnetWorks extends Multi {
  energy() { return this.getParts().filter((m) => m.io === 'IN').map((m) => m.energyContainer); }
  getEnergyContainer() { return energyList(this.energy()); }
  getMaxVoltage() {
    const l = this.getEnergyContainer();
    const hi = l.getHighestInputVoltage();
    return l.getNumHighestInputContainers() > 1 ? V[Math.min(tierAtLeast(hi) + 1, V.length - 1)] : hi;
  }
  getOverclockVoltage() {
    const l = this.getEnergyContainer();
    return l.getInputAmperage() === 1 ? V[tierAtMost(l.getInputVoltage())] : l.getInputVoltage();
  }
  getCapabilitiesFlat(io, cap) {
    if (cap !== FLUID_CAP || io !== 'IN') return list([]);
    return list(this.getParts().filter((m) => m.tank && m.role === 'in').map((m) => ({ getContents: () => list([m.tank.stack]) })));
  }
  stock() {
    const items = {};
    const fluids = {};
    let circuit = 0;
    this.getParts().forEach((m) => {
      if (m.role === 'bus') {
        Object.entries(m.inv.counts()).forEach(([k, n]) => { items[k] = (items[k] || 0) + n; });
        const c = m.circuitInv.getStackInSlot(0);
        if (!c.isEmpty() && c.circuit) circuit = c.circuit;
      }
      if (m.tank && m.role === 'in' && !m.tank.stack.isEmpty()) fluids[m.tank.stack.id] = (fluids[m.tank.stack.id] || 0) + m.tank.stack.amount;
    });
    return { items, fluids, circuit };
  }
  work() {
    const s = this.st;
    if (s.status === 'SUSPEND') return;
    if (s.status === 'WORKING' || s.status === 'WAITING') {
      if (s.runDelay > 0) { s.runDelay--; return; }
      const l = this.getEnergyContainer();
      if (l.stored() >= s.eut) {
        l.drain(s.eut);
        s.status = 'WORKING';
        s.progress++;
      } else {
        s.status = 'WAITING';
        s.runAttempt = Math.min(5, s.runAttempt + 1);
        if (s.runAttempt === 5) { s.status = 'SUSPEND'; this.sim.suspended.push(this.id); }
        s.runDelay = s.runAttempt * 60;
      }
      if (s.progress >= s.duration) {
        const out = this.getParts().filter((m) => m.role === 'out');
        s.recipe.itemsOut.forEach((x) => { if (!out.some((m) => m.inv.add(x.id, x.count))) throw new Error('no room for ' + x.id); });
        this.st = Object.assign(idle(), { last: s.last });
      }
      return;
    }
    const have = this.stock();
    const r = this.sim.recipes.filter((x) => x.type === 'gtceu:magnet_winding').find((x) => x.circuit === have.circuit &&
      x.itemsIn.every((i) => (have.items[i.id] || 0) >= i.count) && x.fluidsIn.concat(x.notConsumed).every((f) => (have.fluids[f.id] || 0) >= f.amount));
    if (!r) return;
    // the modifier: GTRecipeModifiers.ELECTRIC_OVERCLOCK refuses a recipe above the machine's tier, then overclocks
    if (tierAtLeast(r.eut) > tierAtMost(this.getMaxVoltage())) { this.reasons = ['gtceu.recipe_modifier.insufficient_voltage']; return; }
    this.reasons = [];
    const oc = overclock(r.eut, r.duration, this.getOverclockVoltage());
    this.getParts().forEach((m) => {
      if (m.role === 'bus') r.itemsIn.forEach((i) => m.inv.take(i.id, i.count));
      if (m.tank && m.role === 'in') r.fluidsIn.forEach((f) => { if (m.tank.stack.id === f.id) m.tank.stack = fluidStack(f.id, m.tank.stack.amount - f.amount); });
    });
    this.st = { status: 'WORKING', progress: 0, duration: oc.duration, eut: oc.eut, recipe: r, last: { id: r.id, duration: oc.duration, eut: oc.eut }, runAttempt: 0, runDelay: 0 };
  }
}

// the generator array in steam mode: 16 LV steam turbines at once, 640 mB each per 20-tick run, 32 EU/t each, paused when the dynamo is full
class GenArray extends Multi {
  work() {
    const dyn = this.getParts().find((m) => m.io === 'OUT');
    const input = this.getParts().find((m) => m.tank && m.role === 'in');
    const s = this.st;
    if (s.status === 'WORKING' || s.status === 'WAITING') {
      const c = dyn.energyContainer;
      if (c.capacity - c.stored >= 512) { c.stored += 512; s.progress++; s.status = 'WORKING'; } else s.status = 'WAITING';
      if (s.progress >= s.duration) this.st = Object.assign(idle(), { last: s.last });
      return;
    }
    if (!dyn || !input || input.tank.stack.isEmpty() || input.tank.stack.amount < 10240) return;
    input.tank.stack = fluidStack(input.tank.stack.id, input.tank.stack.amount - 10240);
    this.st = { status: 'WORKING', progress: 0, duration: 20, eut: 0, last: { id: 'gtceu:steam_turbine/steam', eutOut: 512, duration: 20 }, runAttempt: 0, runDelay: 0 };
  }
}

function makeMachine(sim, level, id, x, y, z) {
  const W = sim.W;
  const h = W.hatches[id];
  if (h) {
    const v = V[h.tier];
    const m = simple(id, { io: h.kind === 'hatch' ? 'IN' : 'OUT' });
    m.energyContainer = h.kind === 'hatch' ? new Container(PLAIN, v * 16 * h.amps, { vin: v, ain: h.amps }) : new Container(PLAIN, v * 64 * h.amps, { vout: v, aout: h.amps });
    return coverable(m);
  }
  if (id === 'gtceu:hv_input_bus') return simple(id, { role: 'bus', inv: new Inventory(16), circuitInv: new Inventory(1), getInventory() { return this.inv; }, getCircuitInventory() { return this.circuitInv; } });
  if (id === 'gtceu:hv_output_bus') return simple(id, { role: 'out', inv: new Inventory(16), getInventory() { return this.inv; } });
  if (id === 'gtceu:hv_input_hatch') return simple(id, { role: 'in', tank: new Tank() });
  if (id === 'gtceu:lv_output_hatch') return simple(id, { role: 'fluid_out', tank: new Tank() });
  const p = new Pos(x, y, z);
  if (id === MW_ID) return new MagnetWorks(sim, level, id, p);
  if (id === ARRAY_ID) return new GenArray(sim, level, id, p);
  if (id === W.towerId) return new Multi(sim, level, id, p);
  if (id === 'gtceu:luv_macerator') {
    const m = coverable(simple(id, { importItems: new Inventory(1), exportItems: new Inventory(1), st: idle(), reasons: [] }));
    m.energyContainer = new Container(RECIPE_AMPS, V[6] * 64, { vin: V[6], ain: 2 });
    m.getRecipeLogic = () => recipeLogic(m);
    m.tick = () => {
      const c = m.energyContainer;
      if (m.st.status === 'WORKING') {
        if (c.stored >= 2048) { c.stored -= 2048; m.st.progress++; } else return;
        if (m.st.progress >= 10) { m.exportItems.add('gtceu:iron_dust', 1); m.st = idle(); }
        return;
      }
      if ((m.importItems.counts()['minecraft:iron_ingot'] || 0) > 0 && c.stored >= 2048) {
        m.importItems.take('minecraft:iron_ingot', 1);
        m.st = Object.assign(idle(), { status: 'WORKING', duration: 10, last: { id: 'gtceu:macerator/macerate_iron_ingot', eut: 2048, duration: 10 } });
      }
    };
    return m;
  }
  if (id === 'gtceu:luv_battery_buffer_4x') {
    const inv = new Inventory(4);
    const m = coverable(simple(id, { getBatteryInventory: () => inv, getTier: () => 6, isWorkingEnabled: () => true, markDirty() {} }));
    const c = new Container(BUFFER_TRAIT, 0, { vin: V[6], ain: 8, vout: V[6], aout: 8 });
    c.getEnergyStored = () => inv.slots.reduce((s, st) => s + (st.e ? st.e.getCharge() : 0), 0);
    c.getEnergyCapacity = () => inv.slots.reduce((s, st) => s + (st.e ? st.e.getMaxCharge() : 0), 0);
    m.energyContainer = c;
    return m;
  }
  return null;
}

// ---------------------------------------------------------------- the simulated server

class SimLevel {
  constructor(sim, dim) { Object.assign(this, { sim, dimension: dim, blocks: new Map(), machines: new Map() }); }
  blockAt(x, y, z) { return this.blocks.get(key(x, y, z)) || 'minecraft:air'; }
  getBlock(a, b, c) {
    const id = typeof a === 'object' ? this.blockAt(a.getX(), a.getY(), a.getZ()) : this.blockAt(a, b, c);
    return { id, getId: () => id };
  }
  isLoaded() { return true; }
  isClientSide() { return false; }
  getChunk() { return null; }
  getEntitiesOfClass() { return list([]); }
  set(x, y, z, block) {
    const id = String(block).split('[')[0];
    const k = key(x, y, z);
    if (this.blockAt(x, y, z) === id) return 0;
    this.machines.delete(k);
    if (id === 'minecraft:air') this.blocks.delete(k);
    else this.blocks.set(k, id);
    const m = id === 'minecraft:air' ? null : makeMachine(this.sim, this, id, x, y, z);
    if (m) this.machines.set(k, m);
    [...this.machines.values()].forEach((mm) => { if (mm.blockChanged) mm.blockChanged(k); });
    return 1;
  }
}

function simCommand(sim, line) {
  const ex = /^execute in (\S+) run (.*)$/.exec(String(line));
  if (!ex) throw new Error('the simulated server has no command ' + line);
  const dim = ex[1];
  const level = sim.levels[dim];
  const a = ex[2].split(' ');
  sim.commands.push({ dim, text: ex[2] });
  if (a[0] === 'forceload') {
    const box = a.slice(2, 6).map(Number);
    const b = BANDS[dim];
    sim.forceloads.push({ dim, add: a[1] === 'add', inside: !!b && box[0] >= b.x0 && box[2] <= b.x1 && box[1] >= b.z0 && box[3] <= b.z1 });
    return 16;
  }
  if (a[0] === 'setblock') {
    const [x, y, z] = a.slice(1, 4).map(Number);
    if (!inBand(dim, x, y, z)) sim.outside.push(dim + ' ' + ex[2]);
    return level.set(x, y, z, a[4]);
  }
  if (a[0] === 'fill') {
    const [x0, y0, z0, x1, y1, z1] = a.slice(1, 7).map(Number);
    if (!inBand(dim, x0, y0, z0) || !inBand(dim, x1, y1, z1)) sim.outside.push(dim + ' ' + ex[2]);
    let n = 0;
    for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) n += level.set(x, y, z, a[7]);
    return n;
  }
  throw new Error('the simulated server has no command ' + ex[2]);
}

// GT recipes as the scripts build them (event.recipes.gtceu.<type>(id): GTM saves ns:<type>/<path>), and GTM's shaped crafting
function recipeEvent(sim) {
  const parse = (s) => { const m = /^(\d+)x\s+(.*)$/.exec(String(s)); return m ? { id: m[2], count: Number(m[1]) } : { id: String(s), count: 1 }; };
  const gtceu = new Proxy({}, {
    get: (_, type) => (...args) => {
      if (type === 'shaped') {
        const c = { id: null, type: 'minecraft:crafting_shaped', output: String(args[0]) };
        sim.recipes.push(c);
        const cb = { id: (id) => { c.id = String(id); return cb; } };
        return cb;
      }
      const [ns, p] = String(args[0]).split(':');
      const r = { id: ns + ':' + type + '/' + p, type: 'gtceu:' + type, itemsIn: [], circuit: 0, fluidsIn: [], notConsumed: [], itemsOut: [], dataMap: {}, eut: 0, duration: 0 };
      sim.recipes.push(r);
      const b = new Proxy({}, {
        get: (__, m) => (...a) => {
          if (m === 'itemInputs') [].concat(...a).forEach((s) => r.itemsIn.push(parse(s)));
          else if (m === 'itemOutputs') [].concat(...a).forEach((s) => r.itemsOut.push(parse(s)));
          else if (m === 'circuit') r.circuit = Number(a[0]);
          else if (m === 'inputFluids') a.forEach((f) => r.fluidsIn.push({ id: f.id, amount: f.amount }));
          else if (m === 'notConsumableFluid') a.forEach((f) => r.notConsumed.push({ id: f.id, amount: f.amount }));
          else if (m === 'addDataString') r.dataMap[a[0]] = String(a[1]);
          else if (m === 'EUt') r.eut = Number(a[0]);
          else if (m === 'duration') r.duration = Number(a[0]);
          return b;
        },
      });
      return b;
    },
  });
  return { recipes: { gtceu } };
}

// a recorded GT recipe as GTM's GTRecipe: contents with chances (the circuit and the not-consumed fluid at chance 0), EU, data
function live(r) {
  const c = (chance) => ({ chance, maxChance: 10000 });
  const itemsIn = r.itemsIn.map((x) => ({ st: stackOf(x.id, x.count), c: c(10000) }));
  if (r.circuit) itemsIn.push({ st: stackOf('gtceu:programmed_circuit', 1, { circuit: r.circuit }), c: c(0) });
  const fluidsIn = r.fluidsIn.map((f) => ({ st: fluidStack(f.id, f.amount), c: c(10000) })).concat(r.notConsumed.map((f) => ({ st: fluidStack(f.id, f.amount), c: c(0) })));
  const io = { in: { item: itemsIn, fluid: fluidsIn }, out: { item: r.itemsOut.map((x) => ({ st: stackOf(x.id, x.count), c: c(10000) })), fluid: [] } };
  return Object.assign(r, {
    io,
    getInputContents: (cap) => list(io.in[cap.name].map((x) => x.c)),
    getOutputContents: (cap) => list(io.out[cap.name].map((x) => x.c)),
    data: { getString: (k) => r.dataMap[k] || '' },
  });
}

// The startup scripts' registrations, fired with recorders: KubeJS items and blocks (event.create(id)), GTM machines (event.create(name,
// kind) with .tiers(...): gtceu:<tier>_<name>, else gtceu:<name>) and GTM materials (gtceu:<name>_dust / _ingot, _rod with GENERATE_ROD,
// the fluid gtceu:<name> with liquid()). The patterns are recorded on the way (Pat.register runs inside the machine callbacks).
function chain(onCall) {
  const p = new Proxy(function () {}, {
    get: (_, k) => (k === Symbol.toPrimitive ? () => '' : typeof k === 'symbol' || k === 'then' ? undefined : (...a) => { if (onCall) onCall(String(k), a); return p; }),
    apply: () => p,
  });
  return p;
}
function fireRegistrations(callbacks) {
  const items = new Set();
  const fluids = new Set();
  const full = (id) => (String(id).indexOf(':') < 0 ? 'kubejs:' + id : String(id));
  const machines = [];
  const materials = [];
  for (const [type, fn] of callbacks) {
    if (type === 'startup:item' || type === 'startup:block') fn({ create: (id) => { items.add(full(id)); return chain(); } });
    else if (type === 'startup:fluid') fn({ create: (id) => { fluids.add(full(id)); return chain(); } });
    else if (type === 'gtceu:machine') {
      fn({ create: (name) => { const m = { name: String(name), tiers: null }; machines.push(m); return chain((k, a) => { if (k === 'tiers') m.tiers = a.map(Number); }); } });
    } else if (type === 'gtceu:material') {
      fn({ create: (name) => { const m = { name: String(name), calls: new Set(), flags: [] }; materials.push(m); return chain((k, a) => { m.calls.add(k); if (k === 'flags') m.flags.push(...a.map(String)); }); } });
    }
  }
  machines.forEach((m) => (m.tiers ? m.tiers.map((t) => 'gtceu:' + VN[t].toLowerCase() + '_' + m.name) : ['gtceu:' + m.name]).forEach((id) => items.add(id)));
  materials.forEach((m) => {
    if (m.calls.has('dust') || m.calls.has('ingot')) items.add('gtceu:' + m.name + '_dust');
    if (m.calls.has('ingot')) items.add('gtceu:' + m.name + '_ingot');
    if (m.flags.includes('GENERATE_ROD')) items.add('gtceu:' + m.name + '_rod');
    if (m.calls.has('liquid') || m.calls.has('fluid')) fluids.add('gtceu:' + m.name);
  });
  return { items, fluids };
}

// one JVM: the pack's startup scripts (their GTM registrations absorbed, the patterns recorded), optionally the server scripts and the
// fixture, in one sandbox with the stand-ins above
function jvm({ server = true, fixture = true } = {}) {
  const sim = { tick: 0, clock: { now: 1000 }, levels: {}, recipes: [], commands: [], forceloads: [], outside: [], suspended: [], lines: [], errors: [], ticks: [], commandsMap: {}, clicks: [] };
  for (const d of [EARTH, ORBIT]) sim.levels[d] = new SimLevel(sim, d);
  const any = makeAny();
  const startupCallbacks = [];
  const GTRegistries = {
    MACHINES: { get: (rl) => sim.machineDef(String(rl.id)) },
    COVERS: { get: (rl) => (sim.W.covers[rl.id] ? { getId: () => rl.id } : null) },
    RECIPE_TYPES: { get: (rl) => (rl.id === 'gtceu:magnet_winding' ? { id: rl.id, registryName: rl.id } : null) },
  };
  const blocksWith = (kind) => list(Object.keys(sim.W.hatches).filter((id) => sim.W.hatches[id].kind === kind).map((id) => ({ id })));
  const classes = {
    'net.minecraft.nbt.CompoundTag': CompoundTag, 'net.minecraft.nbt.ListTag': ListTag, 'net.minecraft.nbt.StringTag': StringTag,
    'net.minecraft.resources.ResourceLocation': RL,
    'net.minecraft.core.BlockPos': Pos,
    'net.minecraft.core.Direction': Direction,
    'net.minecraft.world.phys.AABB': class { constructor(...a) { this.a = a; } },
    'net.minecraft.world.phys.Vec3': class { constructor(...a) { this.a = a; } },
    'net.minecraft.world.phys.BlockHitResult': class { constructor(vec, dir, pos) { this.dir = dir; this.pos = pos; } },
    'net.minecraft.world.InteractionHand': { MAIN_HAND: 'MAIN_HAND' },
    'net.minecraft.world.entity.item.ItemEntity': {},
    'net.minecraft.world.item.ItemStack': { EMPTY },
    'net.minecraft.core.registries.BuiltInRegistries': { BLOCK: { getKey: (b) => b.id, containsKey: (rl) => sim.blockIds.has(rl.id) } },
    'net.minecraftforge.common.util.FakePlayerFactory': { getMinecraft: (level) => sim.fakePlayer(level) },
    'net.minecraftforge.common.ForgeHooks': { onRightClickBlock: (fp, hand, pos, hit) => sim.click(fp, hand, pos, hit) },
    'net.minecraftforge.registries.ForgeRegistries': { ITEMS: { getKey: (i) => i.id }, FLUIDS: { getKey: (f) => f.id } },
    'net.minecraftforge.fluids.FluidStack': { EMPTY: FLUID_EMPTY },
    'java.util.ArrayList': AL,
    'java.util.UUID': {},
    'com.gregtechceu.gtceu.api.machine.MetaMachine': { getMachine: (level, pos) => level.machines.get(key(pos.getX(), pos.getY(), pos.getZ())) || null },
    'com.gregtechceu.gtceu.api.registry.GTRegistries': GTRegistries,
    'com.gregtechceu.gtceu.api.machine.multiblock.PartAbility': { INPUT_ENERGY: { getAllBlocks: () => blocksWith('hatch') }, OUTPUT_ENERGY: { getAllBlocks: () => blocksWith('dynamo') } },
    'com.gregtechceu.gtceu.api.capability.GTCapabilityHelper': { getElectricItem: (s) => s.e || null, getForgeEnergyItem: () => null },
    'com.gregtechceu.gtceu.api.capability.compat.FeCompat': { insertEu: () => 0 },
    'com.gregtechceu.gtceu.config.ConfigHolder': { INSTANCE: { compat: { energy: { nativeEUToFE: true } } } },
    'com.gregtechceu.gtceu.common.machine.electric.ChargerMachine': { AMPS_PER_ITEM: 4 },
    'com.gregtechceu.gtceu.common.machine.electric.BatteryBufferMachine': { AMPS_PER_BATTERY: 2 },
    'com.gregtechceu.gtceu.api.capability.ICoverable': { rayTraceCoverableSide: () => null },
    'com.gregtechceu.gtceu.utils.GTUtil': { getTierByVoltage: tierAtLeast },
    'com.gregtechceu.gtceu.utils.FormattingUtil': { formatNumbers: (n) => String(n) },
    'com.gregtechceu.gtceu.api.capability.recipe.IO': { IN: 'IN', OUT: 'OUT' },
    'com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability': { CAP: ITEM_CAP },
    'com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability': { CAP: FLUID_CAP },
    'com.gregtechceu.gtceu.api.recipe.RecipeHelper': {
      getInputItems: (r) => list(r.io.in.item.map((x) => x.st)), getOutputItems: (r) => list(r.io.out.item.map((x) => x.st)),
      getInputFluids: (r) => list(r.io.in.fluid.map((x) => x.st)), getOutputFluids: (r) => list(r.io.out.fluid.map((x) => x.st)),
      getRealEUtWithIO: (r) => (r.eutOut ? { isEmpty: () => false, isInput: () => false, getTotalEU: () => r.eutOut } : { isEmpty: () => !r.eut, isInput: () => true, getTotalEU: () => r.eut }),
      getRealEUt: (r) => ({ getTotalEU: () => r.eut || r.eutOut || 0 }),
    },
    'com.gregtechceu.gtceu.common.item.IntCircuitBehaviour': {
      stack: (n) => stackOf('gtceu:programmed_circuit', 1, { circuit: n }), isIntegratedCircuit: (s) => !!s.circuit, getCircuitConfiguration: (s) => s.circuit,
    },
  };
  const sandbox = {
    console: { info: (m) => sim.lines.push(String(m)), log() {}, warn() {}, error: (m) => sim.errors.push(String(m)) },
    JSON, Math, Number, String, Error, Array, Object, BigInt, Symbol,
    Date: { now: () => sim.clock.now },
    Java: { loadClass: (name) => (name in classes ? classes[name] : any) },
    GTValues: { V, VA, VN, VNF: VN, ULV: 0, LV: 1, MV: 2, HV: 3, EV: 4, IV: 5, LuV: 6, ZPM: 7, UV: 8 },
    Text: { translate: text, of: (s) => text(s), gray: (t) => t, darkGray: (t) => t },
    Item: { of: (id, count) => stackOf(String(id), count || 1), exists: (id) => !/undefined|null/.test(String(id)), empty: EMPTY },
    Fluid: { of: (id, amount) => ({ id: String(id), amount, getFluidStack: () => fluidStack(String(id), amount) }), exists: (id) => !/undefined|null/.test(String(id)) },
    NBTIO: { read: () => null },
    StartupEvents: { registry: (type, fn) => startupCallbacks.push(['startup:' + type, fn]) },
    ForgeModEvents: { onGenericEvent() {} },
    GTCEuStartupEvents: { registry: (type, fn) => startupCallbacks.push([type, fn]), materialModification() {} },
    GTMaterialFlags: new Proxy({}, { get: (_, k) => String(k) }),
    GTMaterialIconSet: any,
    GTRecipeTypes: { get: () => any },
    ServerEvents: { tick: (fn) => sim.ticks.push(fn), recipes: (fn) => fn(recipeEvent(sim)), customCommand: (name, fn) => { sim.commandsMap[name] = fn; } },
    BlockEvents: { rightClicked: (fn) => sim.clicks.push(fn), placed() {}, broken() {} },
    RotationState: any, GTBlocks: any, GuiTextures: any, FillDirection: any, GTSoundEntries: any, PartAbility: any, GTModelProperties: any, Predicates: any,
    FactoryBlockPattern: any, Block: any, GTMaterials: any, SoundType: any, GTRecipeModifiers: any, ModifierFunction: any, JsonIO: any,
  };
  sandbox.global = kubejsGlobal();
  sandbox.global.grindless = { tables: {}, readJsonTable: (p) => JSON.parse(fs.readFileSync(path.join(PACK, p), 'utf8')) };
  vm.createContext(sandbox);
  // this Rhino's String#charCodeAt answers a java.lang.Character, NaN in arithmetic (wireless_network.test.mjs)
  vm.runInContext(`(function () { var proto = ('').constructor.prototype; var charAt = proto.charAt;
    proto.charCodeAt = function (i) { var s = '' + this; var p = Math.trunc(Number(i)) || 0; if (p < 0 || p >= s.length) return NaN;
      var ch = charAt.call(s, p); return { valueOf: function () { return NaN; }, toString: function () { return ch; } }; }; })()`, sandbox);
  const runFile = (f) => vm.runInContext(fs.readFileSync(f, 'utf8'), sandbox, { filename: path.basename(f) });
  STARTUP.forEach(runFile);
  sim.registered = fireRegistrations(startupCallbacks);
  const G = sandbox.global.grindless;
  sim.G = G;
  sim.W = G.wireless;
  const W = sim.W;
  sim.blockIds = new Set([...W.cellIds]);
  const gtm = GTM_MACHINES;
  sim.machineDef = (id) => {
    const h = W.hatches[id];
    if (h) return { getTier: () => h.tier, getRecipeTypes: () => [], getId: () => id };
    if (id === MW_ID) return { getTier: () => 0, getRecipeTypes: () => [{ registryName: 'gtceu:magnet_winding' }], getId: () => id };
    if (id === W.towerId || id === ARRAY_ID || gtm.includes(id)) return { getTier: () => 0, getRecipeTypes: () => [], getId: () => id };
    return null;
  };
  sim.fakePlayer = (level) => ({
    level, hand: EMPTY, shift: false,
    setItemInHand(h, s) { this.hand = s; }, getMainHandItem() { return this.hand; }, setShiftKeyDown(b) { this.shift = b; }, isShiftKeyDown() { return this.shift; },
    setPositionAndRotation() {}, setStatusMessage(t) { this.status = t; }, getStringUuid: () => 'fake-player', isCreative: () => true,
  });
  sim.click = (fp, hand, pos, hit) => {
    let cancelled = false;
    const event = { player: fp, hand: 'MAIN_HAND', item: fp.hand, level: fp.level, block: { pos }, facing: hit.dir, cancel() { cancelled = true; } };
    sim.clicks.forEach((fn) => fn(event));
    return { isCanceled: () => cancelled };
  };
  const pd = new CompoundTag();
  sim.server = {
    persistentData: pd, tick: 0,
    getTickCount() { return this.tick; },
    getLevel: (d) => sim.levels[String(d)] || null,
    overworld: () => sim.levels[EARTH],
    runCommandSilent: (t) => simCommand(sim, t),
    getRecipeManager: () => ({
      byKey: (rl) => { const r = sim.recipes.find((x) => x.id === rl.id); return { isPresent: () => !!r, get: () => r }; },
      getAllRecipesFor: (type) => list(sim.recipes.filter((x) => x.type === type.id)),
    }),
  };
  Object.values(sim.levels).forEach((l) => { l.server = sim.server; });
  if (server) {
    SERVER.forEach(runFile);
    sim.recipes.forEach((r) => { if (r.type !== 'minecraft:crafting_shaped') live(r); });
  }
  if (fixture) runFile(FIXTURE);
  sim.run = (n, until) => {
    for (let i = 0; i < n; i++) {
      sim.tick++;
      sim.clock.now += 50;
      sim.server.tick++;
      Object.values(sim.levels).forEach((l) => [...l.machines.values()].forEach((m) => { if (m.tick) m.tick(); }));
      sim.ticks.forEach((fn) => fn({ server: sim.server }));
      if (until && until()) return true;
    }
    return false;
  };
  return { sim, G, W, global: sandbox.global, sandbox };
}

// ---------------------------------------------------------------- the tests

const MAIN = ['registry', 'mw_recipes', 'PLACED', 'MW_FORMED', 'TWO_HATCH', 'ORBIT', 'MULTI_AMP', 'SMES', 'JUMP', 'LUV_COVERS'];
const verdicts = (lines) => {
  const out = {};
  lines.filter((l) => l.startsWith('GGTEST|luv_a4|')).forEach((l) => { const f = l.split('|'); if (f[3] === 'PASS' || f[3] === 'FAIL') out[f[2]] = f[3]; });
  return out;
};
const failures = (lines) => lines.filter((l) => l.startsWith('GGTEST|luv_a4|') && /\|FAIL(\||$)/.test(l));
const done = (sim) => () => sim.lines.includes('GGTEST|luv_a4|DONE');

test('gg_test_luv_a4.js compiles', () => {
  assert.doesNotThrow(() => new vm.Script(fs.readFileSync(FIXTURE, 'utf8'), { filename: 'gg_test_luv_a4.js' }));
});

test('its plan stays in its band and its sub-bands, builds what lib/patterns.js describes at every stage, and leaves both bands empty', () => {
  const { sim, W, global } = jvm({ server: false });
  const ops = Array.from(global.ggTestLuvA4Plan());
  assert.ok(ops.length > 300, 'the plan has ' + ops.length + ' operations');
  const world = { [EARTH]: new Map(), [ORBIT]: new Map() };
  const blockAt = (dim) => (x, y, z) => world[dim].get(key(x, y, z)) || 'minecraft:air';
  const controllers = { [EARTH]: [], [ORBIT]: [] };
  const problems = [];
  const marks = [];
  const desc = (id) => sim.G.structures[id];
  const energyParts = (p) => cellsOf(desc(MW_ID), p).filter((c) => c.sym.kind === 'oneOf').map((c) => blockAt(EARTH)(c.x, c.y, c.z))
    .filter((id) => abilityOf(id, W) === 'energy_input');
  const iv = W.hatchId('hatch', 5, 2);
  const want = {
    'swap:one': [iv], 'swap:two': [iv, iv], 'swap:multi': [W.hatchId('hatch', 5, 64), W.hatchId('hatch', 5, 64)],
    'swap:luv': [W.hatchId('hatch', 6, 2), W.hatchId('hatch', 6, 2)],
  };
  for (const o of ops) {
    if (!(o.dim in BANDS) && o.op !== 'mark') { problems.push('dimension ' + o.dim); continue; }
    if (o.op === 'forceload') {
      const b = BANDS[o.dim];
      if (o.x0 !== b.x0 || o.x1 !== b.x1 || o.z0 !== b.z0 || o.z1 !== b.z1) problems.push('forceload ' + JSON.stringify(o));
    } else if (o.op === 'fill') {
      if (!inBand(o.dim, o.x0, o.y0, o.z0) || !inBand(o.dim, o.x1, o.y1, o.z1)) problems.push('fill ' + JSON.stringify(o));
      for (let x = o.x0; x <= o.x1; x++) for (let y = o.y0; y <= o.y1; y++) for (let z = o.z0; z <= o.z1; z++) {
        if (o.block === 'minecraft:air') world[o.dim].delete(key(x, y, z));
        else world[o.dim].set(key(x, y, z), o.block);
      }
    } else if (o.op === 'set') {
      if (!inBand(o.dim, o.x, o.y, o.z)) problems.push('set ' + JSON.stringify(o));
      const id = o.block.split('[')[0];
      if (id === 'minecraft:air') world[o.dim].delete(key(o.x, o.y, o.z));
      else world[o.dim].set(key(o.x, o.y, o.z), id);
      if ([MW_ID, W.towerId, ARRAY_ID].includes(id)) controllers[o.dim].push({ id, p: new Pos(o.x, o.y, o.z) });
    } else if (o.op === 'mark') {
      marks.push(o.name);
      const check = (dim, c, valid, what) => {
        const pr = structureProblems(desc(c.id), c.p, blockAt(dim), W);
        if ((pr.length === 0) !== valid) problems.push(o.name + ': ' + what + ' ' + c.id + ' at ' + key(c.p.x, c.p.y, c.p.z) + (valid ? ' does not form: ' + pr.slice(0, 4).join('; ') : ' still forms'));
      };
      const mw = controllers[EARTH].find((c) => c.id === MW_ID);
      const towers = controllers[EARTH].filter((c) => c.id === W.towerId);
      if (o.name === 'built') {
        assert.ok(mw && towers.length === 2 && controllers[ORBIT].length === 1 && controllers[ORBIT][0].id === ARRAY_ID, 'the magnet works, two towers and the orbit array are built');
        check(EARTH, mw, true, 'the magnet works');
        towers.forEach((t) => check(EARTH, t, true, 'a tower'));
        check(ORBIT, controllers[ORBIT][0], true, 'the orbit array');
        const parts = cellsOf(desc(MW_ID), mw.p).filter((c) => c.sym.kind === 'oneOf').map((c) => blockAt(EARTH)(c.x, c.y, c.z))
          .filter((id) => id !== 'gtceu:frostproof_machine_casing').sort();
        assert.deepEqual(parts, [iv, iv, 'gtceu:hv_input_bus', 'gtceu:hv_input_hatch', 'gtceu:hv_input_hatch', 'gtceu:hv_input_hatch', 'gtceu:hv_output_bus'].sort());
        // the magnet works in X 15360-15391; the towers, the LuV machines in X 15392-15423
        cellsOf(desc(MW_ID), mw.p).forEach((c) => { if (c.x > 15391) problems.push('a magnet works cell at X ' + c.x); });
        towers.forEach((t) => cellsOf(desc(W.towerId), t.p).forEach((c) => { if (c.x < 15392) problems.push('a tower cell at X ' + c.x); }));
        const mwCells = new Set(cellsOf(desc(MW_ID), mw.p).map((c) => key(c.x, c.y, c.z)).concat([key(mw.p.x, mw.p.y, mw.p.z)]));
        [...world[EARTH].keys()].filter((k) => !mwCells.has(k) && world[EARTH].get(k) !== 'minecraft:smooth_stone')
          .forEach((k) => { if (Number(k.split(',')[0]) < 15392) problems.push('a block outside the magnet works at ' + k + ' in X < 15392'); });
      } else if (want[o.name]) {
        check(EARTH, mw, true, 'the magnet works');
        assert.deepEqual(energyParts(mw.p).sort(), want[o.name].slice().sort(), o.name + ': the magnet works\' energy parts');
      } else if (o.name === 'tower_a_broken') {
        check(EARTH, towers[0], false, 'tower A');
        check(EARTH, towers[1], true, 'tower B');
      } else if (o.name === 'cleared') {
        assert.equal(world[EARTH].size + world[ORBIT].size, 0, 'both bands are empty at the end');
      }
    }
  }
  assert.deepEqual(problems, []);
  assert.deepEqual(marks, ['built', 'swap:one', 'swap:two', 'swap:multi', 'swap:luv', 'tower_a_broken', 'cleared']);
  const fl = ops.filter((o) => o.op === 'forceload');
  for (const dim of [EARTH, ORBIT]) {
    const mine = fl.filter((o) => o.dim === dim);
    assert.ok(mine.length >= 2 && mine[0].add === true && mine[mine.length - 1].add === false, dim + ': force-loaded first, released last');
  }
});

test('every item, block and fluid id it uses is in the native dump exactly or, new since it, registered by the pack; its other ids check out', (t) => {
  const { sim, W, G, global } = jvm({ server: false });
  const MW = G.htsMagnetWorks;
  // the four LuV rows it checks; later eras' rows (UIV-A8's seeded_gdbco_growth) are another package's to prove
  const table = JSON.parse(fs.readFileSync(path.join(KJS, 'data', 'grindless', 'tables', 'hts_magnet_works.json'), 'utf8'));
  table.recipes = table.recipes.filter((r) => ['hts_coil', 'luv_smes_cell', 'coilgun_coil_casing', 'magnetic_bearing'].includes(r.name));
  // fluids: the recipes' consumed fluids (it stocks them), the cold-test charge, the orbit array's steam
  const fluids = new Set([MW.charge.id, 'gtceu:steam', ...table.recipes.flatMap((r) => r.fluidsIn.map((f) => f.id))]);
  // items and blocks: what it places (every stage of its plan), what it stocks and expects (the published recipes come from the table), what it
  // derives from the network (the LuV hatches and covers it checks, the cells it places) and the programmed circuit
  const items = new Set(['gtceu:programmed_circuit', ...table.recipes.flatMap((r) => [...r.itemsIn, ...r.itemsOut].map((x) => x.id))]);
  Array.from(global.ggTestLuvA4Plan()).forEach((o) => { if (o.block) items.add(o.block.split('[')[0]); });
  W.hatchKindList.forEach((kind) => W.hatchAmps.forEach((amps) => items.add(W.hatchId(kind, 6, amps))));
  W.coverKindList.forEach((kind) => items.add(W.coverItemId(kind, 6)));
  [5, 6].forEach((tier) => items.add(W.tierRow[tier].cell));
  // the ids written in the fixture: dimensions, the recipe type and recipe ids are checked apart; the rest are items or fluids
  const code = fs.readFileSync(FIXTURE, 'utf8').split('\n').map((l) => l.replace(/^\s*\/\/.*$/, '')).join('\n');
  const named = [...new Set([...code.matchAll(/'((?:gtceu|grindless|minecraft|gcyr):[a-z0-9_./]+)'/g)].map((m) => m[1]))].filter((id) => !/[_/]$/.test(id));
  // the controller's crafting recipe id (server_scripts/grindless/luv/hts_magnet_works.js publishes it; mw_recipes reads it live)
  const other = new Set([EARTH, ORBIT, MW.recipeType, 'grindless:assembly_line/hts_magnet_works']);
  named.forEach((id) => { if (!other.has(id)) (fluids.has(id) ? fluids : items).add(id); });
  assert.deepEqual(named.filter((id) => /[/.]/.test(id) && !other.has(id)), [], 'no other recipe or definition id is written in the fixture');
  assert.equal(MW.recipeType, 'gtceu:magnet_winding');

  const reg = sim.registered;
  const dump = fs.existsSync(ITEMS_DUMP) ? JSON.parse(fs.readFileSync(ITEMS_DUMP, 'utf8')) : null;
  if (!dump) t.diagnostic('no native dump at ' + ITEMS_DUMP + ' (GG_ITEMS_DUMP): checked against the ids taken from it');
  const dumpItems = new Set(dump ? dump.items : NATIVE_ITEMS);
  const dumpFluids = new Set(dump ? dump.fluids : NATIVE_FLUIDS);
  const missing = [...items].filter((id) => !dumpItems.has(id) && !reg.items.has(id)).map((id) => 'item ' + id)
    .concat([...fluids].filter((id) => !dumpFluids.has(id) && !reg.fluids.has(id)).map((id) => 'fluid ' + id)).sort();
  assert.deepEqual(missing, [], 'ids neither in the native dump nor registered by the pack');
  assert.ok(!fluids.has('gtceu:molten_trinium') && fluids.has('gtceu:trinium'), 'GTM\'s trinium fluid is gtceu:trinium');
  // the list kept for machines without the dump: exactly the ids the fixture uses that the pack does not register, all in the dump
  assert.deepEqual([...items].filter((id) => !reg.items.has(id)).sort(), NATIVE_ITEMS.slice().sort(), 'NATIVE_ITEMS');
  assert.deepEqual([...fluids].filter((id) => !reg.fluids.has(id)).sort(), NATIVE_FLUIDS.slice().sort(), 'NATIVE_FLUIDS');
  if (dump) {
    NATIVE_ITEMS.forEach((id) => assert.ok(dumpItems.has(id), id + ' in the dump\'s items'));
    NATIVE_FLUIDS.forEach((id) => assert.ok(dumpFluids.has(id), id + ' in the dump\'s fluids'));
    t.diagnostic('new since the dump, registered by the pack: ' + [...items].filter((id) => !dumpItems.has(id)).sort().join(', '));
  }
  // the dimension: GCYR 0.2.9's data/gcyr/dimension/overworld_orbit.json, Earth's orbit in the pack's planets table
  const planets = JSON.parse(fs.readFileSync(path.join(KJS, 'data', 'grindless', 'tables', 'planets.json'), 'utf8'));
  assert.ok(planets.planets.earth.dimensions.includes(ORBIT), 'planets.json counts ' + ORBIT + ' as Earth');
});
test('the whole fixture passes in a simulated server: every check, the band left empty and released, the network\'s data put back as it was', () => {
  const j = jvm();
  const { sim, W, G, global } = j;
  // a network that was there before the test (an entry in a world the simulation has not loaded, a store): put back exactly
  const pd = sim.server.persistentData;
  const R = G.wirelessRegistry;
  pd.put(W.blocksKey, R.write([R.canon({ k: 'hatch', d: 'minecraft:the_end', x: 0, y: 64, z: 0, t: 1, a: 2 })]));
  pd.putLong(W.storeKey, 123456);
  W.dropCache();
  const before = JSON.stringify(dumpTag(pd));
  sim.run(300);
  assert.equal(sim.commandsMap.gg_test_luv_a4({}), 1);
  assert.ok(sim.run(6000, done(sim)), 'DONE within 6,000 ticks: ' + sim.lines.slice(-4).join(' / '));
  const lines = sim.lines.filter((l) => l.startsWith('GGTEST|'));
  if (process.env.GG_SHOW_SIM) console.log(lines.join('\n'));
  assert.deepEqual(failures(lines), []);
  const v = verdicts(lines);
  MAIN.forEach((n) => assert.equal(v[n], 'PASS', n));
  assert.equal(JSON.stringify(dumpTag(pd)), before, 'the network\'s persistent data is as it was before the test');
  assert.deepEqual(sim.outside, [], 'no command outside the band');
  for (const dim of [EARTH, ORBIT]) {
    const mine = sim.forceloads.filter((f) => f.dim === dim);
    assert.ok(mine.every((f) => f.inside) && mine.length >= 2 && mine[mine.length - 1].add === false, dim + ' force-loaded inside its band and released');
    assert.equal(sim.levels[dim].blocks.size + sim.levels[dim].machines.size, 0, dim + ' left empty');
  }
  assert.deepEqual(sim.suspended, [], 'no multiblock suspended for lack of EU');
  assert.equal(storedIn(global, 'ggTestWirelessQueue'), '', 'the queue left');
  assert.equal(W.paused, false, 'the network not left paused');
  assert.deepEqual(sim.errors, []);
  const two = lines.find((l) => l.startsWith('GGTEST|luv_a4|TWO_HATCH|PASS'));
  assert.match(two, /getMaxVoltage 8192 \(want 8192\), c1 did not start/);
  assert.match(two, /getMaxVoltage 32768 \(want 32768\)/);
  assert.match(two, /12288000 EU given to the machine, want 12288000/);
  assert.match(lines.find((l) => l.startsWith('GGTEST|luv_a4|MULTI_AMP|PASS')), /getOverclockVoltage 524288 \(want 524288: 1048576 EU\/t of V x A folded by EnergyContainerList.calculateVoltageAmperage to 524288 V x 2 A\)/);
  assert.match(lines.find((l) => l.startsWith('GGTEST|luv_a4|SMES_overclock|')), /at 491520 EU\/t x 150 t .* as predicted true/);
  assert.match(lines.find((l) => l.startsWith('GGTEST|luv_a4|JUMP|PASS')), /readout message\.grindless\.wireless\.above_tier \[LuV, IV\]/);
});

test('without its turn on the wireless network it fails TURN in 120 s, every check says it was not reached, and it still ends with DONE', () => {
  const j = jvm();
  const { sim, global } = j;
  sim.run(300);
  global.ggTestWirelessQueue = 'wireless_energy';
  // the test holding the turn has the network paused: one that never had its turn leaves it so
  j.W.paused = true;
  assert.equal(sim.commandsMap.gg_test_luv_a4({}), 1);
  const asked = sim.clock.now;
  assert.ok(sim.run(3000, done(sim)), 'DONE');
  const waited = sim.clock.now - asked;
  assert.ok(waited > 120000 && waited <= 121000, 'gave up after 120 s (' + waited + ' ms)');
  const f = failures(sim.lines);
  assert.match(f[0], /^GGTEST\|luv_a4\|TURN\|FAIL\|asked for and had no turn on the wireless network in 120 s: the queue is \[wireless_energy, luv_a4\]$/);
  MAIN.forEach((n) => assert.ok(f.some((l) => l.startsWith('GGTEST|luv_a4|' + n + '|FAIL|not reached: no turn')), n));
  assert.equal(storedIn(global, 'ggTestWirelessQueue'), 'wireless_energy', 'it left the queue');
  assert.equal(storedIn(global, 'ggTestLuvA4Request'), false);
  assert.equal(sim.commands.length, 0, 'nothing touched');
  assert.equal(j.W.paused, true, 'the other test\'s pause left alone');
});

test('without the network\'s LuV row only its own checks fail: TWO_HATCH, ORBIT, MULTI_AMP and SMES still pass and the band is cleaned', () => {
  const { sim, W } = jvm();
  // the fixture reads the row when its run starts: as if the LuV tier were not registered
  delete W.tierRow[6];
  sim.run(300);
  assert.equal(sim.commandsMap.gg_test_luv_a4({}), 1);
  assert.ok(sim.run(6000, done(sim)), 'DONE');
  const v = verdicts(sim.lines);
  ['mw_recipes', 'PLACED', 'MW_FORMED', 'TWO_HATCH', 'ORBIT', 'MULTI_AMP', 'SMES'].forEach((n) => assert.equal(v[n], 'PASS', n + ': ' + failures(sim.lines).join(' / ')));
  ['registry', 'JUMP', 'LUV_COVERS'].forEach((n) => assert.equal(v[n], 'FAIL', n));
  assert.ok(sim.lines.some((l) => /^GGTEST\|luv_a4\|JUMP\|FAIL\|the wireless LuV tier is not there: no tier-6 row/.test(l)));
  for (const dim of [EARTH, ORBIT]) assert.equal(sim.levels[dim].blocks.size + sim.levels[dim].machines.size, 0, dim + ' left empty');
});