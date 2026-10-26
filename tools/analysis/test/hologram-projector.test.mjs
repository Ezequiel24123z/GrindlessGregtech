// Local tests of the Hologram Projector's build report (pack/kubejs/server_scripts/grindless/steam/hologram_projector.js), without
// Minecraft: the production script runs in a Node vm with small stand-ins for the KubeJS globals and for the GTM, Minecraft, Forge
// and Gregtech Terminals classes it loads, and builds a fake multiblock in a fake world through its own run() and report().
//
// The fake pattern (one aisle, the controller facing north, rows going up):
//   row 0   X  K  P     X: a casing or a hatch, K: the controller, P: only a hatch (minimum 1)
//   row 1   C  C  C     C: a casing (the same simple predicate as X's casing, so one option group)
//   row 2   C  A  C     A: must stay air
//
// Run: node tools/analysis/test/run.mjs. The script's arrays come from the vm's realm: they are copied with Array.from
// before a deep comparison.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const scriptPath = path.resolve(here, '..', '..', '..', 'pack', 'kubejs', 'server_scripts', 'grindless', 'steam', 'hologram_projector.js');
const source = fs.readFileSync(scriptPath, 'utf8');

const COMPLETE = 'message.grindless.projector.complete';
const BLOCKED = 'message.grindless.projector.blocked';
const PARTS = 'message.grindless.projector.parts';
const NEEDS = 'message.grindless.projector.needs';
const PLACED = 'message.grindless.projector.placed';

// ---------------------------------------------------------------- Minecraft stand-ins
const posKey = (pos) => `${pos.getX()},${pos.getY()},${pos.getZ()}`;

class BlockPos {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  getX() { return this.x; }

  getY() { return this.y; }

  getZ() { return this.z; }

  toString() { return `BlockPos{x=${this.x}, y=${this.y}, z=${this.z}}`; }
}

class ResourceLocation {
  constructor(id) { this.id = String(id); }

  toString() { return this.id; }
}

class IMachineBlock {}
class IMultiController {}

const descr = (kind, id) => `${kind}.${id.replace(':', '.')}`;

class Block {
  constructor(id, { air = false, replaceable = false } = {}) {
    this.id = id;
    this.air = air;
    this.replaceable = replaceable;
  }

  asItem() {
    const id = this.air ? 'minecraft:air' : this.id;
    return { id, getDescriptionId: () => descr('item', id) };
  }

  getDescriptionId() { return descr('block', this.id); }
}

class MachineBlock extends IMachineBlock {
  constructor(id, tier) {
    super();
    this.id = id;
    this.tier = tier;
    this.air = false;
    this.replaceable = false;
  }

  asItem() { return { id: this.id, getDescriptionId: () => descr('item', this.id) }; }

  getDescriptionId() { return descr('block', this.id); }

  getDefinition() { return { getTier: () => this.tier }; }
}

class State {
  constructor(block) { this.block = block; }

  getBlock() { return this.block; }

  isAir() { return this.block.air; }

  canBeReplaced() { return this.block.air || this.block.replaceable; }

  getSoundType() { return { getPlaceSound: () => 'place' }; }

  toString() { return `Block{${this.block.id}}`; }
}

const AIR = new Block('minecraft:air', { air: true });
const DIRT = new Block('minecraft:dirt');
const SNOW = new Block('minecraft:snow', { replaceable: true });
const CASING = new Block('gtceu:steam_machine_casing');
const HATCH = new MachineBlock('gtceu:steam_input_hatch', 0);
const CONTROLLER = new MachineBlock('gtceu:test_battery', 0);
const BLOCKS = Object.fromEntries([AIR, DIRT, SNOW, CASING, HATCH, CONTROLLER].map((b) => [b.id, b]));

class JList {
  constructor(a) { this.a = a; }

  size() { return this.a.length; }

  get(i) { return this.a[i]; }
}

// GTM's SimplePredicate: its candidates, its limits and its raw test
function simple(blocks, { min = -1, max = -1, test: rawTest = null } = {}) {
  const ids = new Set(blocks.map((b) => b.id));
  return {
    type: 'blocks',
    minCount: min,
    maxCount: max,
    minLayerCount: -1,
    maxLayerCount: -1,
    candidates: { get: () => blocks.map((b) => ({ getBlockState: () => new State(b) })) },
    predicate: { test: rawTest || ((ws) => ids.has(ws.state.getBlock().id)) },
  };
}

// GTM's TraceabilityPredicate
function traceable({ limited = [], common = [], controller = false, air = false } = {}) {
  return { isController: controller, isAny: () => false, isAir: () => air, limited: new JList(limited), common: new JList(common) };
}

const CASING_SP = simple([CASING]);
const X = traceable({ limited: [simple([HATCH], { min: 0 })], common: [CASING_SP] });
const C = traceable({ common: [CASING_SP] });
const P = traceable({ limited: [simple([HATCH], { min: 1 })] });
const K = traceable({ controller: true });
const A = traceable({ common: [simple([], { test: (ws) => ws.state.isAir() })], air: true });
const PATTERN = {
  aisleRepetitions: [[1, 1]],
  structureDir: ['LEFT', 'UP', 'FRONT'],
  matches: [[[X, K, P], [C, C, C], [C, A, C]]],
  center: [1, 0, 0, 0, 0],
};

// where the cells land with the controller at CTRL facing north: LEFT is west, so the first char is east of the controller
const CTRL = [0, 64, 0];
const at = (dx, dy) => `${CTRL[0] + dx},${CTRL[1] + dy},${CTRL[2]}`;
const CELLS = {
  X: at(1, 0), P: at(-1, 0),
  C1: at(1, 1), C2: at(0, 1), C3: at(-1, 1),
  C4: at(1, 2), A: at(0, 2), C5: at(-1, 2),
};
const DEFAULT_CELLS = ['X', 'C1', 'C2', 'C3', 'C4', 'C5'];

class Controller extends IMultiController {
  self() { return this; }

  getDefinition() { return { getId: () => 'gtceu:test_battery', getDescriptionId: () => 'block.gtceu.test_battery' }; }

  getFrontFacing() { return 'north'; }

  getUpwardsFacing() { return 'north'; }

  isFlipped() { return false; }

  isFormed() { return false; }

  getPattern() { return PATTERN; }
}

class Level {
  constructor() {
    this.blocks = new Map([[CTRL.join(','), CONTROLLER]]);
    this.controller = new Controller();
    this.unloaded = new Set();
    this.occupied = new Set();
  }

  put(cell, block) { this.blocks.set(CELLS[cell], block); }

  blockAt(cell) { return (this.blocks.get(CELLS[cell]) || AIR).id; }

  getBlockState(pos) { return new State(this.blocks.get(posKey(pos)) || AIR); }

  setBlock(pos, state) {
    this.blocks.set(posKey(pos), state.getBlock());
    return true;
  }

  isUnobstructed(state, pos) { return !this.occupied.has(posKey(pos)); }

  playSound() {}
}

class MultiblockState {
  constructor(level) {
    this.level = level;
    this.state = null;
  }

  clean() {}

  update(pos) {
    if (this.level.unloaded.has(posKey(pos))) return false;
    this.state = this.level.getBlockState(pos);
    return true;
  }
}

const CLASSES = {
  'com.gregtechceu.gtceu.api.machine.MetaMachine': {
    getMachine: (level, pos) => (posKey(pos) === CTRL.join(',') ? level.controller : null),
  },
  'com.gregtechceu.gtceu.api.machine.feature.multiblock.IMultiController': IMultiController,
  'com.gregtechceu.gtceu.api.block.IMachineBlock': IMachineBlock,
  'com.gregtechceu.gtceu.api.pattern.MultiblockState': MultiblockState,
  'java.util.IdentityHashMap': class {
    constructor() { this.m = new Map(); }

    get(k) { return this.m.has(k) ? this.m.get(k) : null; }

    put(k, v) { this.m.set(k, v); }
  },
  'net.minecraft.world.phys.shapes.CollisionContext': { empty: () => ({}) },
  'net.minecraft.core.Direction': { UP: 'up' },
  'net.minecraftforge.registries.ForgeRegistries': {
    BLOCKS: { getKey: (b) => b.id, getValue: (rl) => BLOCKS[String(rl)] },
    ITEMS: { getKey: (item) => item.id },
  },
  'net.minecraftforge.common.util.BlockSnapshot': { create: () => ({ restore() {} }) },
  'net.minecraftforge.event.ForgeEventFactory': { onBlockPlace: () => false },
  'net.minecraft.sounds.SoundSource': { BLOCKS: 'blocks' },
  'com.gtceuterminal.common.compat.BlockPatternReflection': {
    getBlockMatches: (pattern) => pattern.matches,
    getCenterOffset: (pattern) => pattern.center,
  },
};

// ---------------------------------------------------------------- KubeJS stand-ins
class Component {
  constructor(key, args, literal) {
    this.key = key;
    this.args = args;
    this.literal = literal;
    this.color = null;
    this.siblings = [];
  }

  append(x) {
    this.siblings.push(x);
    return this;
  }

  // the text a player would read, with the keys in place of the translations
  flat() {
    const own = this.key === null ? this.literal : `${this.key}(${this.args.map((a) => (a instanceof Component ? a.flat() : String(a))).join(', ')})`;
    return own + this.siblings.map((s) => (s instanceof Component ? s.flat() : String(s))).join('');
  }
}
for (const color of ['gold', 'green', 'red', 'yellow', 'gray']) {
  Component.prototype[color] = function paint() {
    this.color = color;
    return this;
  };
}

const Text = {
  translate: (key, ...args) => new Component(key, args, null),
  of: (s) => new Component(null, [], String(s)),
};
const Item = { of: (id) => ({ getItem: () => ({ getDescriptionId: () => descr('item', String(id)) }) }) };

function loadProjector() {
  const errors = [];
  const context = {
    global: {},
    Java: {
      loadClass: (name) => {
        if (!(name in CLASSES)) throw new Error(`class not stubbed: ${name}`);
        return CLASSES[name];
      },
    },
    BlockPos,
    ResourceLocation,
    Text,
    Item,
    console: { info() {}, warn() {}, error: (m) => errors.push(String(m)) },
    BlockEvents: { rightClicked() {} },
    ServerEvents: { recipes() {} },
  };
  vm.createContext(context);
  new vm.Script(source, { filename: scriptPath }).runInContext(context);
  const projector = context.global.grindless && context.global.grindless.projector;
  assert.ok(projector, 'the script publishes global.grindless.projector');
  return { projector, errors };
}

function stack(id, n) {
  return {
    id,
    n,
    isEmpty() { return this.n <= 0; },
    getId() { return this.id; },
    getCount() { return this.n; },
    shrink(k) { this.n -= k; },
  };
}

// a vanilla Container's methods over a few slots, as the bench test's inventory
function inventory(items) {
  const slots = items.map(([id, n]) => stack(id, n));
  while (slots.length < 9) slots.push(stack('minecraft:air', 0));
  return {
    getContainerSize: () => slots.length,
    getItem: (i) => slots[i],
    setItem: (i, s) => { slots[i] = s; },
    setChanged() {},
    count: (id) => slots.filter((s) => s.id === id).reduce((n, s) => n + s.n, 0),
  };
}

const keysOf = (lines) => Array.from(lines, (l) => l.key);
const lineOf = (lines, key) => lines.find((l) => l.key === key);

function build(projector, level, inv) {
  const res = projector.build(level, new BlockPos(...CTRL), projector.containerSource(inv, null, false, null));
  assert.equal(res.ok, true, `the build read the pattern: ${res.error}`);
  return { res, lines: projector.report(res) };
}

// ---------------------------------------------------------------- tests
test('hologram_projector.js stays ES5 for Rhino (no const/let, arrow functions, templates or spread)', () => {
  const code = source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/'(?:\\.|[^'\\\n])*'/g, "''");
  assert.doesNotMatch(code, /\b(const|let|class)\b/);
  assert.doesNotMatch(code, /=>/);
  assert.doesNotMatch(code, /`/);
  assert.doesNotMatch(code, /\.\.\./);
});

test('nothing placed, nothing missing, but a default cell still blocked by dirt: the report does not say every default block is in place', () => {
  const { projector, errors } = loadProjector();
  const level = new Level();
  level.put('C2', DIRT);
  const inv = inventory([['gtceu:steam_machine_casing', 5], ['gtceu:steam_input_hatch', 2]]);

  // first click: the five free default cells are filled from the inventory, the dirt and the hatch cell stay
  const first = build(projector, level, inv);
  assert.equal(first.res.placedTotal, 5);
  assert.equal(first.res.missingTotal, 0);
  assert.equal(inv.count('gtceu:steam_machine_casing'), 0);
  assert.equal(inv.count('gtceu:steam_input_hatch'), 2, 'the hatches in the inventory are never used');
  assert.equal(level.blockAt('C2'), 'minecraft:dirt', 'the dirt is never broken');
  assert.equal(level.blockAt('P'), 'minecraft:air', 'the hatch-only cell is left empty');
  assert.deepEqual(keysOf(first.lines).slice(1), [PLACED, PARTS, NEEDS, BLOCKED]);

  // second click: the reviewed case (placedTotal 0, missingTotal 0, a default cell blocked)
  const second = build(projector, level, inv);
  assert.equal(second.res.placedTotal, 0);
  assert.equal(second.res.missingTotal, 0);
  assert.equal(second.res.blocked.length, 1);
  assert.equal(second.res.blocked[0].reason, 'wrong');
  assert.ok(!keysOf(second.lines).includes(COMPLETE), `no "${COMPLETE}" while a default cell is blocked: ${keysOf(second.lines).join(', ')}`);
  assert.equal(second.res.blocked[0].takesDefault, true, 'the dirt sits in a casing cell');
  assert.equal(projector.complete(second.res), false);
  assert.match(lineOf(second.lines, BLOCKED).flat(), /block\.minecraft\.dirt\(\), 0 65 0/, 'the dirt is listed with its position');
  assert.deepEqual(projector.summary(second.res).args, ['0', '0', '1', '1']);
  assert.deepEqual(errors, []);
});

test('every default cell filled and the hatch-only cell deliberately empty: the report says every default block is in place', () => {
  const { projector, errors } = loadProjector();
  const level = new Level();
  level.put('C2', DIRT);
  const inv = inventory([['gtceu:steam_machine_casing', 5]]);
  build(projector, level, inv);

  // the player clears the dirt and brings one more casing
  level.put('C2', AIR);
  inv.setItem(8, stack('gtceu:steam_machine_casing', 1));
  const third = build(projector, level, inv);
  assert.equal(third.res.placedTotal, 1);
  assert.ok(!keysOf(third.lines).includes(COMPLETE), 'a click that places blocks reports them, as before');

  const fourth = build(projector, level, inv);
  assert.equal(fourth.res.placedTotal, 0);
  assert.equal(fourth.res.missingTotal, 0);
  assert.equal(fourth.res.blocked.length, 0);
  assert.equal(fourth.res.parts.length, 1, 'the hatch-only cell is still listed for its part');
  assert.equal(level.blockAt('P'), 'minecraft:air');
  for (const cell of DEFAULT_CELLS) assert.equal(level.blockAt(cell), 'gtceu:steam_machine_casing', `${cell} holds its casing`);
  const complete = lineOf(fourth.lines, COMPLETE);
  assert.ok(complete, `"${COMPLETE}" when every default cell holds its block: ${keysOf(fourth.lines).join(', ')}`);
  assert.equal(complete.color, 'green');
  assert.deepEqual(keysOf(fourth.lines).slice(1), [PARTS, NEEDS, COMPLETE]);
  assert.equal(projector.complete(fourth.res), true);
  assert.deepEqual(errors, []);
});

test('a wrong block in the hatch-only cell and snow in the air cell do not stop the completion: they are not default cells', () => {
  const { projector } = loadProjector();
  const level = new Level();
  for (const cell of DEFAULT_CELLS) level.put(cell, CASING);
  level.put('P', DIRT);
  level.put('A', SNOW);
  const { res, lines } = build(projector, level, inventory([]));
  assert.equal(res.placedTotal, 0);
  assert.equal(res.missingTotal, 0);
  const blocked = Object.fromEntries(res.blocked.map((b) => [`${b.x},${b.y},${b.z}`, b]));
  assert.deepEqual(Object.keys(blocked).sort(), [CELLS.A, CELLS.P].sort());
  assert.deepEqual([blocked[CELLS.P].reason, blocked[CELLS.P].takesDefault], ['wrong', false]);
  assert.deepEqual([blocked[CELLS.A].reason, blocked[CELLS.A].takesDefault], ['air', false]);
  assert.equal(level.blockAt('P'), 'minecraft:dirt');
  assert.equal(level.blockAt('A'), 'minecraft:snow');
  assert.ok(keysOf(lines).includes(BLOCKED));
  assert.ok(keysOf(lines).includes(COMPLETE));
});

test('a default cell refused to the build (an entity in the way) or in an unloaded chunk is not complete either', () => {
  const { projector } = loadProjector();

  const crowded = new Level();
  for (const cell of DEFAULT_CELLS) if (cell !== 'C4') crowded.put(cell, CASING);
  crowded.occupied.add(CELLS.C4);
  const inv = inventory([['gtceu:steam_machine_casing', 1]]);
  const refused = build(projector, crowded, inv);
  assert.equal(refused.res.placedTotal, 0);
  assert.equal(refused.res.missingTotal, 0);
  assert.ok(!keysOf(refused.lines).includes(COMPLETE));
  assert.deepEqual(Array.from(refused.res.blocked, (b) => [b.reason, b.takesDefault]), [['entity', true]]);
  assert.equal(inv.count('gtceu:steam_machine_casing'), 1, 'nothing is taken for a block that was not placed');

  const far = new Level();
  for (const cell of DEFAULT_CELLS) if (cell !== 'C4') far.put(cell, CASING);
  far.unloaded.add(CELLS.C4);
  const unloaded = build(projector, far, inventory([]));
  assert.ok(!keysOf(unloaded.lines).includes(COMPLETE));
  assert.deepEqual(Array.from(unloaded.res.blocked, (b) => [b.reason, b.takesDefault]), [['unloaded', true]]);
});

test('complete() needs a readable result with nothing placed or missing and no blocked default cell', () => {
  const { projector } = loadProjector();
  const base = { ok: true, placedTotal: 0, missingTotal: 0, blocked: [] };
  assert.equal(projector.complete(base), true);
  assert.equal(projector.complete({ ...base, ok: false }), false);
  assert.equal(projector.complete({ ...base, placedTotal: 1 }), false);
  assert.equal(projector.complete({ ...base, missingTotal: 2 }), false);
  assert.equal(projector.complete({ ...base, blocked: [{ reason: 'wrong', takesDefault: true }] }), false);
  assert.equal(projector.complete({ ...base, blocked: [{ reason: 'wrong', takesDefault: false }, { reason: 'air', takesDefault: false }] }), true);
});
