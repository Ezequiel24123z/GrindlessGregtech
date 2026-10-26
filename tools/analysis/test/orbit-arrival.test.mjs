// Executes the INSTALLED production ServerEvents.tick handler with strict native-shaped stand-ins.
// These prove gates, public call/packet order, geometry and failures, NOT real client recovery or
// subsequent native onGround. Primary owns that affected native continuation and all fixtures.
// Run: <supplied node.exe> --test tools/analysis/test/orbit-arrival.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const KJS = path.join(ROOT, 'pack/kubejs');
const source = fs.readFileSync(path.join(KJS, 'server_scripts/grindless/luv/orbit_arrival.js'), 'utf8');
const orbitSource = fs.readFileSync(path.join(KJS, 'startup_scripts/grindless/lib/orbits.js'), 'utf8');
const orbits = JSON.parse(fs.readFileSync(path.join(KJS, 'data/grindless/tables/orbits.json'), 'utf8'));
const ORBIT = orbits.earth;
const ROCKET_ID = '00000000-0000-0000-0000-000000000042';

function harness({ mode = 'named', dimension = ORBIT, extraOrbits = [] } = {}) {
  const calls = [];
  const logs = [];
  const api = (object, named, srg, fn) => {
    object[mode === 'srg' && srg ? srg : named] = fn;
  };
  const invoke = (object, named, srg, ...args) => object[mode === 'srg' && srg ? srg : named](...args);
  const key = (x, y, z) => `${x},${y},${z}`;
  const keyOf = (pos) => key(pos.getX(), pos.getY(), pos.getZ());
  const list = (entries) => ({ size: () => entries.length, get: (n) => entries[n] });
  const resourceKey = (id) => ({ location: () => id });
  const Vec3 = { ZERO: Object.freeze({ x: 0, y: 0, z: 0 }) };
  const planet = (id = 'gcyr:earth', world = 'minecraft:overworld', orbit = ORBIT) => ({
    id, level: () => resourceKey(world), orbitWorld: () => resourceKey(orbit),
  });
  const earth = planet();

  class Tag {
    constructor() {
      this.entries = {};
      api(this, 'contains(java.lang.String,int)', 'm_128425_(java.lang.String,int)',
        (k, t) => this.entries[k]?.type === t);
      api(this, 'contains(java.lang.String)', 'm_128441_(java.lang.String)', (k) => k in this.entries);
      api(this, 'getInt(java.lang.String)', 'm_128451_(java.lang.String)',
        (k) => this.entries[k]?.value ?? 0); // Native missing-id -> 0 trap is deliberate.
      api(this, 'getCompound(java.lang.String)', 'm_128469_(java.lang.String)',
        (k) => this.entries[k]?.value ?? new Tag());
      api(this, 'getList(java.lang.String,int)', 'm_128437_(java.lang.String,int)', (k, t) => {
        assert.equal(t, 10, 'request COMPOUND element type, not LIST9');
        const values = this.entries[k]?.value ?? [];
        const result = { size: () => values.length };
        api(result, 'getCompound(int)', 'm_128728_(int)', (n) => values[n]);
        return result;
      });
    }
    put(k, type, value) { this.entries[k] = { type, value }; return this; }
    clone() {
      const copy = new Tag();
      for (const [k, { type, value }] of Object.entries(this.entries)) {
        copy.put(k, type, value instanceof Tag ? value.clone() :
          Array.isArray(value) ? value.map((v) => v.clone()) : value);
      }
      return copy;
    }
  }
  const control = ({ kind = 'gcyr:id_chip', id = 0, world = 'minecraft:overworld' } = {}) =>
    new Tag().put('Slot', 3, 0).put('id', 8, kind).put('Count', 1, 1).put('tag', 10,
      new Tag().put('gcyr:current_station', 3, id).put('gcyr:current_planet', 8, world));

  class Pos {
    constructor(x, y, z) { this.x = x; this.y = y; this.z = z; }
    getX() { return this.x; }
    getY() { return this.y; }
    getZ() { return this.z; }
  }
  class Bounds {
    constructor(minX, minY, minZ, maxX, maxY, maxZ) {
      Object.assign(this, { minX, minY, minZ, maxX, maxY, maxZ });
      api(this, 'move(double,double,double)', 'm_82386_(double,double,double)',
        (x, y, z) => new Bounds(minX + x, minY + y, minZ + z, maxX + x, maxY + y, maxZ + z));
    }
  }
  const intersects = (a, b) => a.minX < b.maxX && a.maxX > b.minX &&
    a.minY < b.maxY && a.maxY > b.minY && a.minZ < b.maxZ && a.maxZ > b.minZ;
  const border = (minX = -100, maxX = 100, minZ = -100, maxZ = 100) => ({
    getMinX: () => minX, getMaxX: () => maxX, getMinZ: () => minZ, getMaxZ: () => maxZ,
    isWithinBounds() { throw new Error('native AABB overlap is NOT full containment'); },
  });
  const blocks = new Map();
  for (let x = 0; x < 3; x++) for (let z = 0; z < 3; z++) blocks.set(key(x, 64, z), { top: 1 });
  const blockState = (entry) => {
    const state = { isAir: () => !entry };
    api(state,
      'getCollisionShape(net.minecraft.world.level.BlockGetter,net.minecraft.core.BlockPos,net.minecraft.world.phys.shapes.CollisionContext)',
      'm_60742_(net.minecraft.world.level.BlockGetter,net.minecraft.core.BlockPos,net.minecraft.world.phys.shapes.CollisionContext)',
      (_level, _pos, context) => {
        assert.equal(context.entity, rocket);
        const shape = { isEmpty: () => !entry || entry.empty === true };
        api(shape, 'max(net.minecraft.core.Direction$Axis)', 'm_83297_(net.minecraft.core.Direction$Axis)', (axis) => {
          assert.equal(axis, 'Y'); return entry.top;
        });
        return shape;
      });
    return state;
  };
  const chunks = {};
  api(chunks, 'move(net.minecraft.server.level.ServerPlayer)', 'm_8385_(net.minecraft.server.level.ServerPlayer)',
    (player) => calls.push(['chunkMove', player]));
  api(chunks,
    'broadcastAndSend(net.minecraft.world.entity.Entity,net.minecraft.network.protocol.Packet)',
    'm_8394_(net.minecraft.world.entity.Entity,net.minecraft.network.protocol.Packet)',
    (root, packet) => calls.push(['broadcast', root, packet]));
  const level = {
    dimension, worldBorder: border(), minHeight: -64, maxHeight: 700,
    getDimensionKey() { return resourceKey(this.dimension); },
    getWorldBorder() { return this.worldBorder; },
    getMinBuildHeight() { return this.minHeight; },
    getMaxBuildHeight() { return this.maxHeight; },
    getBlockState(pos) { return blockState(blocks.get(keyOf(pos))); },
    getChunkSource() { return chunks; },
  };
  api(level, 'getHeight(net.minecraft.world.level.levelgen.Heightmap$Types,int,int)',
    'm_6924_(net.minecraft.world.level.levelgen.Heightmap$Types,int,int)', (heightType, x, z) => {
      assert.equal(heightType, 'WORLD_SURFACE');
      calls.push(['height', x, z]);
      return Math.max(level.minHeight, ...Array.from(blocks.keys()).map((k) => k.split(',').map(Number))
        .filter(([bx, , bz]) => bx === x && bz === z).map(([, y]) => y + 1));
    });
  api(level, 'noCollision(net.minecraft.world.entity.Entity,net.minecraft.world.phys.AABB)',
    'm_45756_(net.minecraft.world.entity.Entity,net.minecraft.world.phys.AABB)', (entity, bounds) => {
      calls.push(['collision', entity, bounds]);
      return !Array.from(blocks.entries()).some(([k, entry]) => {
        const [x, y, z] = k.split(',').map(Number);
        return !entry.empty && intersects(bounds, new Bounds(x, y, z, x + 1, y + entry.top, z + 1));
      });
    });
  const position = (entity) => {
    api(entity, 'getX', 'm_20185_', () => entity.x);
    api(entity, 'getY', 'm_20186_', () => entity.y);
    api(entity, 'getZ', 'm_20189_', () => entity.z);
    api(entity, 'resetFallDistance', 'm_183634_', () => {
      calls.push(['resetFall', entity]); entity.fallDistance = 0;
    });
    api(entity, 'setDeltaMovement(net.minecraft.world.phys.Vec3)', 'm_20256_(net.minecraft.world.phys.Vec3)', (motion) => {
      assert.equal(motion, Vec3.ZERO, 'only the proven single-Vec3 ZERO overload is exposed');
      calls.push(['zeroMotion', entity, motion.x, motion.y, motion.z]);
      entity.motion = [motion.x, motion.y, motion.z];
    });
  };
  const nativeSeat = (root, rider) => {
    calls.push(['nativeSeat', rider]);
    rider.x = root.x + 1.5;
    rider.y = root.y + 4;
    rider.z = root.z + 1.5;
  };
  class Rocket {
    static ROCKET_STARTED = { nativeAccessor: true };
    constructor() {
      Object.assign(this, { x: 0, y: 600, z: 0, floorOffset: 0, started: false, fallDistance: 999,
        motion: [0, -0.5, 0], config: control(), entriesOverride: null, size: 1 });
      position(this);
      api(this, 'getStringUuid', 'm_20149_', () => ROCKET_ID);
      this.getLevel = () => level;
      api(this, 'getEntityData', 'm_20088_', () => {
        const data = {};
        api(data, 'get(net.minecraft.network.syncher.EntityDataAccessor)',
          'm_135370_(net.minecraft.network.syncher.EntityDataAccessor)', (accessor) => {
            assert.equal(accessor, Rocket.ROCKET_STARTED); return this.started;
          });
        return data;
      });
      api(this, 'getBoundingBox', 'm_20191_', () =>
        new Bounds(this.x, this.y + this.floorOffset, this.z, this.x + 3, this.y + 4, this.z + 3));
      api(this, 'saveWithoutId(net.minecraft.nbt.CompoundTag)', 'm_20240_(net.minecraft.nbt.CompoundTag)', (tag) => {
        assert.ok(tag instanceof Tag);
        calls.push(['save', this]);
        return tag.put('config', 10, new Tag().put('Size', 3, this.size).put('Items', 9,
          (this.entriesOverride ?? [this.config]).map((entry) => entry.clone())));
      });
      api(this, 'positionRider(net.minecraft.world.entity.Entity)', 'm_7332_(net.minecraft.world.entity.Entity)',
        (rider) => nativeSeat(this, rider));
      api(this, 'teleportToWithTicket(double,double,double)', 'm_20324_(double,double,double)', (x, y, z) => {
        calls.push(['rootTeleport', x, y, z]);
        if (this.moveFailure === 'before') throw new Error('ticket transport failed before mutation');
        this.x = x; this.y = y; this.z = z;
        for (const rider of players.filter((p) => p.vehicle === this)) nativeSeat(this, rider);
        if (this.moveFailure === 'after') throw new Error('ticket transport failed after mutation');
        if (this.moveFailure === 'wrongPosition') this.y++;
        if (this.moveFailure === 'dismount') players[0].vehicle = null;
      });
      api(this, 'getType', 'm_6095_', () => {
        const type = {};
        api(type, 'updateInterval', 'm_20682_', () => 3);
        api(type, 'trackDeltas', 'm_20683_', () => true);
        return type;
      });
      Object.defineProperty(this, 'onGround', {
        get: () => () => false,
        set: () => { throw new Error('must wait for genuine native collision'); },
      });
    }
  }
  const rocket = new Rocket();
  const makePlayer = () => {
    const player = { x: 0, y: 600, z: 0, age: 9000, vehicle: rocket, fallDistance: 999,
      motion: [0, -0.5, 0], getYaw: () => 12, getPitch: () => -5 };
    position(player);
    api(player, 'getVehicle', 'm_20202_', () => player.vehicle);
    api(player, 'getBoundingBox', 'm_20191_', () => new Bounds(
      player.x - 0.3, player.y, player.z - 0.3, player.x + 0.3, player.y + 1.8, player.z + 0.3));
    const connection = player.connection = {};
    api(connection, 'send(net.minecraft.network.protocol.Packet)', 'm_9829_(net.minecraft.network.protocol.Packet)',
      (packet) => { calls.push(['packet', player, packet]); });
    api(connection, 'teleport(double,double,double,float,float)', 'm_9774_(double,double,double,float,float)',
      (x, y, z, yaw, pitch) => {
        calls.push(['playerTeleport', player, x, y, z, yaw, pitch]);
        if (player.syncFailure) throw new Error('connection teleport failed');
        player.x = x; player.y = y; player.z = z;
        if (player.badSeatReadback) player.y++;
      });
    api(connection, 'resetPosition', 'm_9953_', () => calls.push(['baseline', player]));
    return player;
  };
  const players = [makePlayer()];
  const station = (p = earth, origin = new Pos(0, 63, 0)) => ({
    planet: p, origin, bounds: border(),
    orbitPlanet() { return this.planet; },
    border() { return this.bounds; },
  });
  const records = new Map([[0, station()]]);
  const holder = {
    'getStation(java.lang.Integer)'(boxed) {
      assert.equal(boxed.boxed, true, 'boxed Integer overload, not int-map lookup');
      calls.push(['station', boxed.value]);
      return records.get(boxed.value) ?? null;
    },
    'getStationWorldPos(int)'(id) {
      assert.equal(typeof id, 'number');
      calls.push(['origin', id]);
      return records.get(id)?.origin ?? null;
    },
    getStations() { throw new Error('no int-keyed map member access'); },
  };
  const Stack = {};
  api(Stack, 'of(net.minecraft.nbt.CompoundTag)', 'm_41712_(net.minecraft.nbt.CompoundTag)', (entry) => {
    calls.push(['stackOf']);
    return {
      isEmpty: () => entry.entries.Count?.value <= 0 || !entry.entries.id,
      getId: () => entry.entries.id.value,
      getNbt: () => entry.entries.tag?.value ?? null,
    };
  });
  const planetFrom = (stack, chip) => {
    calls.push([chip ? 'chipPlanet' : 'cardPlanet']);
    const raw = stack.getNbt().entries['gcyr:current_planet']?.value;
    return (chip ? ['minecraft:overworld', ORBIT] : ['gcyr:earth']).includes(raw) ? earth : null;
  };
  const stationFrom = (stack, chip) => {
    calls.push([chip ? 'chipStation' : 'cardStation']);
    return stack.getNbt().entries['gcyr:current_station']?.value ?? (chip ? null : 0);
  };
  class Pairing {
    constructor(l, entity, interval, trackDelta, broadcast) {
      calls.push(['pairConstructor', l, entity, interval, trackDelta]);
      assert.equal(l, level); assert.equal(entity, rocket);
      assert.equal(interval, 3); assert.equal(trackDelta, true);
      assert.equal(typeof broadcast, 'function');
      api(this, 'sendPairingData(net.minecraft.server.level.ServerPlayer,java.util.function.Consumer)',
        'm_289200_(net.minecraft.server.level.ServerPlayer,java.util.function.Consumer)', (player, consumer) => {
          calls.push(['pair', player]);
          for (const kind of ['nativeGcyrSpawnWithBlocksSeats', 'metadata', 'motion', 'passengers']) {
            consumer({ kind, root: rocket });
          }
        });
    }
    addPairing() { throw new Error('no second tracker/pair registration'); }
    sendChanges() { throw new Error('no ticking helper'); }
  }
  const classes = {
    'argent_matter.gcyr.common.entity.RocketEntity': Rocket,
    'net.minecraft.nbt.CompoundTag': Tag,
    'net.minecraft.world.item.ItemStack': Stack,
    'java.lang.Integer': { 'valueOf(int)': (value) => ({ boxed: true, value }) },
    'argent_matter.gcyr.common.item.PlanetIdChipBehaviour': {
      'getSpaceStationId(net.minecraft.world.item.ItemStack)': (stack) => stationFrom(stack, true),
      'getPlanetFromStack(net.minecraft.world.item.ItemStack)': (stack) => planetFrom(stack, true),
      'getSavedPosition(net.minecraft.world.item.ItemStack)'(stack) {
        calls.push(['savedPosition']);
        const raw = stack.getNbt().entries['gcyr:current_position'].value.entries;
        return { dimension: () => resourceKey(stack.getNbt().entries['gcyr:current_planet'].value),
          pos: () => new Pos(raw.X.value, raw.Y.value, raw.Z.value) };
      },
    },
    'argent_matter.gcyr.common.item.KeyCardBehaviour': {
      'getSavedStation(net.minecraft.world.item.ItemStack)': (stack) => stationFrom(stack, false),
      'getSavedPlanet(net.minecraft.world.item.ItemStack)': (stack) => planetFrom(stack, false),
    },
    'argent_matter.gcyr.common.data.GCYRItems': {
      ID_CHIP: { 'isIn(net.minecraft.world.item.ItemStack)': (stack) => stack.getId() === 'gcyr:id_chip' },
      KEYCARD: { 'isIn(net.minecraft.world.item.ItemStack)': (stack) => stack.getId() === 'gcyr:keycard' },
    },
    'argent_matter.gcyr.data.loader.PlanetData': {
      'getPlanetId(argent_matter.gcyr.api.space.planet.Planet)': (p) => p.id,
    },
    'argent_matter.gcyr.api.capability.GCYRCapabilityHelper': {
      'getSpaceStations(net.minecraft.server.level.ServerLevel)'(l) {
        assert.equal(l, level); return holder;
      },
    },
    'net.minecraft.core.BlockPos': Pos,
    'net.minecraft.world.level.levelgen.Heightmap$Types': { WORLD_SURFACE: 'WORLD_SURFACE' },
    'net.minecraft.world.phys.shapes.CollisionContext': {},
    'net.minecraft.core.Direction$Axis': { Y: 'Y' },
    'net.minecraft.world.phys.Vec3': Vec3,
    'net.minecraft.server.level.ServerEntity': Pairing,
    'net.minecraft.network.protocol.game.ClientboundMoveVehiclePacket': class {
      constructor(root) { this.kind = 'vehicleMove'; this.root = root; }
    },
    'net.minecraft.network.protocol.game.ClientboundTeleportEntityPacket': class {
      constructor(root) { this.kind = 'observerTeleport'; this.root = root; }
    },
  };
  api(classes['net.minecraft.world.phys.shapes.CollisionContext'],
    'of(net.minecraft.world.entity.Entity)', 'm_82750_(net.minecraft.world.entity.Entity)', (entity) => ({ entity }));
  const G = { readJsonTable: () => structuredClone(orbits) };
  let handler;
  const context = vm.createContext({
    global: { grindless: G },
    Java: { loadClass(name) { assert.ok(name in classes, `uncontracted class ${name}`); return classes[name]; } },
    ServerEvents: { tick(fn) { assert.equal(handler, undefined); handler = fn; } },
    console: { info: (m) => logs.push(['info', String(m)]), error: (m) => logs.push(['error', String(m)]) },
  });
  vm.runInContext(orbitSource, context);
  G.orbits.dimensions.push(...extraOrbits);
  vm.runInContext(source, context);
  assert.equal(typeof handler, 'function', 'a real production tick handler is installed');
  const server = { tick: 0, getTickCount() { return this.tick; }, getPlayers: () => list(players) };
  const tick = (n) => { server.tick = n; handler({ server }); };
  const dwell = (from = 0, through = 41, change = () => {}) => {
    for (let n = from; n <= through; n++) { change(n); tick(n); }
  };
  const of = (kind) => calls.filter(([name]) => name === kind);
  const errors = () => logs.filter(([kind]) => kind === 'error').map(([, message]) => message);
  const successes = () => logs.filter(([kind]) => kind === 'info').map(([, message]) => message);
  return { G, rocket, players, level, blocks, records, calls, logs, of, errors, successes,
    tick, dwell, Tag, Pos, Bounds, control, planet, earth, station, border, makePlayer, classes, invoke };
}

for (const mode of ['named', 'srg']) {
  test(`${mode}: installed handler moves root straight down using actual bbox floor/native seats and syncs the existing mount`, () => {
    const h = harness({ mode });
    h.dwell(0, 40);
    assert.equal(h.of('save').length, 0, 'no huge inventory serialization before stall eligibility');
    assert.equal(h.of('rootTeleport').length, 0);
    h.players[0].age = 1; // Fixture rewinds local age: server tick, not age, is authoritative.
    h.tick(41);
    assert.equal(h.rocket.y, 65, 'Y64 full collision top -> bbox floor/root Y65, not station metadata Y63');
    assert.equal(h.players[0].y, 69, 'actual native seat, not a guessed rider offset in production');
    assert.equal(h.players[0].vehicle, h.rocket);
    assert.deepEqual(h.rocket.motion, [0, 0, 0]);
    assert.deepEqual(h.players[0].motion, [0, 0, 0]);
    assert.equal(h.rocket.fallDistance, 0);
    assert.equal(h.players[0].fallDistance, 0);
    assert.equal(h.rocket.onGround(), false, 'correction never fabricates native contact');
    assert.deepEqual(h.of('rootTeleport').map(([, ...p]) => p), [[0, 65, 0]]);
    assert.equal(h.of('save').length, 1);
    assert.equal(h.of('pairConstructor').length, 1);
    assert.equal(h.of('pair').length, 1);
    const packets = h.of('packet').map(([, , p]) => p.kind);
    assert.deepEqual(packets, ['nativeGcyrSpawnWithBlocksSeats', 'metadata', 'motion', 'passengers', 'vehicleMove']);
    const playerTeleport = h.of('playerTeleport')[0];
    assert.deepEqual(playerTeleport.slice(2), [1.5, 69, 1.5, 12, -5]);
    const events = h.calls.map(([kind]) => kind);
    assert.ok(events.indexOf('rootTeleport') < events.indexOf('pair'));
    assert.ok(events.indexOf('pair') < events.indexOf('playerTeleport'));
    assert.ok(events.indexOf('playerTeleport') < events.indexOf('chunkMove'));
    assert.ok(events.indexOf('chunkMove') < events.indexOf('baseline'));
    assert.equal(h.of('broadcast')[0][2].kind, 'observerTeleport');
    assert.deepEqual(h.errors(), []);
    assert.equal(h.successes().length, 1);
    const log = h.successes()[0];
    for (const field of [`SUCCESS dimension=${ORBIT} station=0 rocket=${ROCKET_ID}`,
      'stalledServerTicks=41', 'oldRoot=[0,600,0]', 'newRoot=[0,65,0]',
      'oldBBoxFloor=600', 'newBBoxFloor=65', `originalAssociation=1/1->${ROCKET_ID}`,
      `restoredAssociation=1/1->${ROCKET_ID}`, 'nativeLanding=unverified clientMount=unverified']) {
      assert.ok(log.includes(field), `missing native audit field ${field}`);
    }
    h.dwell(42, 200, () => { h.rocket.y = 600; });
    assert.equal(h.of('rootTeleport').length, 1, 'same stale client/hover state never relocates twice');
    assert.equal(h.of('save').length, 1);
    assert.equal(h.successes().length, 1);
  });
}

test('only shared orbit dimensions qualify; an enabled-test startup addition is read without production table changes', () => {
  for (const dimension of ['minecraft:overworld', 'gcyr:luna', 'grindless:io', 'other:orbit']) {
    const h = harness({ dimension });
    h.dwell();
    assert.equal(h.of('save').length, 0, dimension);
    assert.equal(h.of('rootTeleport').length, 0, dimension);
    assert.deepEqual(h.logs, [], dimension);
  }
  const h = harness({ dimension: 'test:disposable_orbit', extraOrbits: ['test:disposable_orbit'] });
  assert.ok(Array.from(h.G.orbitArrival.dimensions).includes('test:disposable_orbit'));
  h.dwell();
  assert.equal(h.of('save').length, 1, 'allowlist addition reaches actual target guard');
  assert.equal(h.of('rootTeleport').length, 0, 'wrong actual target still fails closed');
});

test('player rider and actual GCYR rocket required; active/unreadable launches and sub-550 positions are untouched', () => {
  for (const change of [
    (h) => { h.players.length = 0; },
    (h) => { h.players[0].vehicle = null; },
    (h) => { h.players[0].vehicle = {}; },
    (h) => { h.rocket.started = true; },
    (h) => { h.rocket.started = undefined; },
    (h) => { h.rocket.y = 549.999; },
    (h) => { h.rocket.y = NaN; },
  ]) {
    const h = harness(); change(h); h.dwell();
    assert.equal(h.of('save').length, 0);
    assert.equal(h.of('rootTeleport').length, 0);
    assert.deepEqual(h.rocket.motion, [0, -0.5, 0]);
    assert.equal(h.successes().length, 0);
  }
  const h = harness(); h.rocket.y = 550; h.dwell();
  assert.equal(h.of('rootTeleport').length, 1, 'inclusive threshold');
});

test('actual descent and discontinuous observations reset the full server-time window; negative Motion alone does not', () => {
  for (const speed of [0.5, 0.00001]) {
    const h = harness(); h.dwell(0, 80, (n) => { h.rocket.y = 600 - n * speed; });
    assert.equal(h.of('save').length, 0);
    h.dwell(81, 120);
    assert.equal(h.of('rootTeleport').length, 0);
    h.tick(121);
    assert.equal(h.of('rootTeleport').length, 1);
  }
  const gap = harness(); gap.tick(0); gap.tick(100); gap.dwell(101, 140);
  assert.equal(gap.of('rootTeleport').length, 0);
  gap.tick(141); assert.equal(gap.of('rootTeleport').length, 1);
  const rewind = harness(); rewind.dwell(100, 139); rewind.dwell(1, 41);
  assert.equal(rewind.of('rootTeleport').length, 0);
  rewind.tick(42); assert.equal(rewind.of('rootTeleport').length, 1);
});

test('unmounting resets an unhandled dwell; repeated observations within one server tick do not advance it', () => {
  const h = harness(); h.dwell(0, 39);
  h.players[0].vehicle = null; h.tick(40);
  h.players[0].vehicle = h.rocket; h.dwell(41, 81);
  assert.equal(h.of('rootTeleport').length, 0);
  for (let i = 0; i < 100; i++) h.tick(81);
  assert.equal(h.of('rootTeleport').length, 0);
  h.tick(82); assert.equal(h.of('rootTeleport').length, 1);
});

test('target is read fresh only after stall: transient destination fields and an existing default record cannot authorize', () => {
  const h = harness(); h.dwell(0, 40);
  h.rocket.current_station = 0; // Native transient fields are intentionally not consulted.
  h.rocket.config.entries.tag.value.put('gcyr:current_station', 3, 7);
  h.dwell(41, 140);
  assert.deepEqual(h.of('station').map(([, id]) => id), [7]);
  assert.equal(h.of('rootTeleport').length, 0);
  assert.equal(h.errors().length, 1);
  assert.match(h.errors()[0], /selected station record does not exist/);
  assert.equal(h.successes().length, 0);
});

test('both real controls resolve their native namespaces; station ID0 is valid, without any owner registry', () => {
  for (const kind of ['gcyr:id_chip', 'gcyr:keycard']) {
    const h = harness();
    h.rocket.config = h.control({ kind, world: kind === 'gcyr:keycard' ? 'gcyr:earth' : 'minecraft:overworld' });
    h.dwell();
    assert.equal(h.of('rootTeleport').length, 1, kind);
    assert.equal(h.of(kind === 'gcyr:keycard' ? 'cardPlanet' : 'chipPlanet').length, 1);
  }
  for (const [kind, wrongNamespace] of [['gcyr:id_chip', 'gcyr:earth'], ['gcyr:keycard', 'minecraft:overworld']]) {
    const h = harness(); h.rocket.config = h.control({ kind, world: wrongNamespace }); h.dwell();
    assert.equal(h.of('rootTeleport').length, 0, `${kind} cannot reinterpret ${wrongNamespace}`);
  }
});

test('a nonzero selected station uses its own native column, never existing station0 or a guessed grid stride', () => {
  const h = harness();
  h.rocket.config.entries.tag.value.put('gcyr:current_station', 3, 23);
  h.records.set(23, h.station(h.earth, new h.Pos(32, 63, 0)));
  h.rocket.x = 32;
  for (let x = 32; x < 35; x++) for (let z = 0; z < 3; z++) h.blocks.set(`${x},64,${z}`, { top: 1 });
  h.dwell();
  assert.deepEqual(h.of('station').map(([, id]) => id), [23]);
  assert.deepEqual(h.of('origin').map(([, id]) => id), [23]);
  assert.deepEqual(h.of('height').map(([, x, z]) => [x, z]), [[32, 0]]);
  assert.deepEqual(h.of('rootTeleport').map(([, ...p]) => p), [[32, 65, 0]]);
  assert.match(h.successes()[0], /station=23/);
});

test('missing/malformed/ambiguous actual slot/control/typed station never becomes successful station0', () => {
  const corruptions = [
    (h) => { h.rocket.size = 2; },
    (h) => { h.rocket.entriesOverride = []; },
    (h) => { h.rocket.entriesOverride = [h.control(), h.control()]; },
    (h) => { delete h.rocket.config.entries.Slot; },
    (h) => { h.rocket.config.put('Slot', 1, 0); },
    (h) => { h.rocket.config.put('Slot', 3, 1); },
    (h) => { delete h.rocket.config.entries.Count; },
    (h) => { h.rocket.config.put('Count', 1, 0); },
    (h) => { h.rocket.config.put('id', 8, 'minecraft:stick'); },
    (h) => { h.rocket.config.entries.tag.value.put('gcyr:current_station', 8, '0'); },
    (h) => { h.rocket.config.entries.tag.value.put('gcyr:current_station', 3, -1); },
    (h) => { delete h.rocket.config.entries.tag.value.entries['gcyr:current_station']; },
    (h) => { h.rocket.config.entries.tag.value.put('gcyr:current_planet', 3, 0); },
    (h) => {
      h.rocket.config = h.control({ kind: 'gcyr:keycard', world: 'gcyr:earth' });
      delete h.rocket.config.entries.tag.value.entries['gcyr:current_station'];
    },
    (h) => {
      h.classes['argent_matter.gcyr.common.data.GCYRItems'].ID_CHIP['isIn(net.minecraft.world.item.ItemStack)'] = () => false;
    },
  ];
  for (const corrupt of corruptions) {
    const h = harness(); corrupt(h); h.dwell(0, 120);
    assert.equal(h.of('rootTeleport').length, 0);
    assert.equal(h.of('save').length, 1);
    assert.equal(h.errors().length, 1, 'explicit/log-once failure, not a success-shaped default');
    assert.equal(h.successes().length, 0);
    assert.deepEqual(h.rocket.motion, [0, -0.5, 0]);
  }
});

test('selected record must exist and match BOTH registered planet identity and the current orbit', () => {
  for (const change of [
    (h) => { h.records.clear(); },
    (h) => { h.records.get(0).planet = h.planet('other:earth', 'minecraft:overworld', ORBIT); },
    (h) => { h.records.get(0).planet = h.planet('gcyr:earth', 'minecraft:overworld', 'other:orbit'); },
    (h) => { h.records.get(0).planet.id = null; },
  ]) {
    const h = harness(); change(h); h.dwell(0, 100);
    assert.equal(h.of('rootTeleport').length, 0);
    assert.equal(h.errors().length, 1);
  }
});

test('saved-position chip overrides require typed XYZ and the exact orbit/selected native column, not origin metadata Y', () => {
  const setup = (h, world, x = 0) => {
    const tag = h.rocket.config.entries.tag.value;
    tag.put('gcyr:current_planet', 8, world);
    tag.put('gcyr:current_position', 10, new h.Tag().put('X', 3, x).put('Y', 3, 600).put('Z', 3, 0));
  };
  const compatible = harness(); setup(compatible, ORBIT); compatible.dwell();
  assert.equal(compatible.of('rootTeleport').length, 1);
  assert.equal(compatible.of('savedPosition').length, 1);
  for (const change of [
    (h) => setup(h, 'minecraft:overworld'),
    (h) => setup(h, ORBIT, 1),
    (h) => { setup(h, ORBIT); delete h.rocket.config.entries.tag.value.entries['gcyr:current_position'].value.entries.X; },
    (h) => { h.rocket.config.entries.tag.value.put('gcyr:current_position', 8, 'bad'); },
  ]) {
    const h = harness(); change(h); h.dwell();
    assert.equal(h.of('rootTeleport').length, 0);
    assert.equal(h.errors().length, 1);
  }
});

test('no deployed column, collisionless top, obstructed rocket/rider, outside-column or border overflow fail closed/log once', () => {
  for (const change of [
    (h) => h.blocks.clear(),
    (h) => h.blocks.set('0,66,0', { top: 1, empty: true }),
    (h) => h.blocks.set('1,66,0', { top: 1 }),
    (h) => h.blocks.set('1,70,1', { top: 1 }), // Native rider seat clearance only: root ends at69.
    (h) => { h.rocket.x = 1; },
    (h) => { h.records.get(0).bounds = h.border(-100, 2.9); }, // Overlaps, but not contained.
    (h) => { h.level.worldBorder = h.border(-100, 2.9); },
    (h) => { h.level.maxHeight = 69; }, // Root fits; whole native rider does not.
    (h) => h.blocks.set('0,64,0', { top: NaN }),
    (h) => h.blocks.set('0,650,0', { top: 1 }), // Assist must not lift the root.
  ]) {
    const h = harness(); change(h); h.dwell(0, 140);
    assert.equal(h.of('rootTeleport').length, 0);
    assert.equal(h.of('save').length, 1);
    assert.equal(h.errors().length, 1);
    assert.equal(h.successes().length, 0);
  }
});

test('highest actual collision top and actual rocket bbox offset determine root placement; no platform is created', () => {
  const h = harness();
  h.blocks.set('0,66,0', { top: 0.5 });
  h.rocket.floorOffset = -2;
  const before = Array.from(h.blocks.entries());
  h.dwell();
  assert.equal(h.rocket.y, 68.5, 'surface66.5 minus bbox offset(-2)');
  assert.equal(h.rocket.y + h.rocket.floorOffset, 66.5);
  assert.deepEqual(Array.from(h.blocks.entries()), before, 'only read-only physical queries');
  assert.equal(h.successes().length, 1);
});

test('multiple native player riders share one serialization/relocation but each receives pairing, seat handshake and baselines', () => {
  const h = harness();
  h.players.push(h.makePlayer());
  h.dwell();
  assert.equal(h.of('save').length, 1);
  assert.equal(h.of('rootTeleport').length, 1);
  assert.equal(h.of('pairConstructor').length, 1);
  assert.equal(h.of('pair').length, 2);
  assert.equal(h.of('playerTeleport').length, 2);
  assert.equal(h.of('chunkMove').length, 2);
  assert.equal(h.of('baseline').length, 2);
  assert.ok(h.players.every((p) => p.vehicle === h.rocket && p.y === 69 && p.fallDistance === 0));
  assert.match(h.successes()[0], /originalAssociation=2\/2/);
});

test('runtime move failure never retries another alias; all partial/sync/readback failures log once, never success', () => {
  for (const failure of ['before', 'after', 'wrongPosition', 'dismount', 'connection', 'seatReadback']) {
    const h = harness();
    h.rocket.moveFailure = failure;
    if (failure === 'connection') h.players[0].syncFailure = true;
    if (failure === 'seatReadback') h.players[0].badSeatReadback = true;
    h.rocket['m_20324_(double,double,double)'] = () => {
      h.calls.push(['forbiddenAliasRetry']); throw new Error('must not retry mutation');
    };
    h.dwell(0, 140);
    assert.equal(h.of('rootTeleport').length, 1, failure);
    assert.equal(h.of('forbiddenAliasRetry').length, 0, failure);
    assert.equal(h.errors().length, 1, failure);
    assert.equal(h.successes().length, 0, failure);
  }
});

test('a genuinely later observed launch/dimension transition rearms, but relocation/rider loss/target change do not', () => {
  for (const departure of ['launch', 'dimension']) {
    const h = harness(); h.dwell();
    h.rocket.y = 600;
    if (departure === 'launch') h.rocket.started = true;
    else h.level.dimension = 'minecraft:overworld';
    h.tick(42);
    h.rocket.started = false; h.level.dimension = ORBIT;
    h.dwell(43, 83);
    assert.equal(h.of('rootTeleport').length, 1);
    h.tick(84);
    assert.equal(h.of('rootTeleport').length, 2);
    assert.equal(h.successes().length, 2);
  }
  const h = harness(); h.dwell();
  h.players[0].vehicle = null; h.tick(42);
  h.players[0].vehicle = h.rocket; h.rocket.y = 600;
  h.rocket.config.entries.tag.value.put('gcyr:current_station', 3, 123);
  h.dwell(43, 140);
  assert.equal(h.of('rootTeleport').length, 1);
  assert.equal(h.of('save').length, 1);
  assert.equal(h.successes().length, 1);
});

test('a missing named mutation selects its available pinned alias, but missing both methods produces ERROR once', () => {
  const h = harness();
  const move = h.rocket['teleportToWithTicket(double,double,double)'];
  delete h.rocket['teleportToWithTicket(double,double,double)'];
  h.rocket['m_20324_(double,double,double)'] = move;
  h.dwell();
  assert.equal(h.of('rootTeleport').length, 1);
  assert.equal(h.successes().length, 1);

  const missing = harness();
  delete missing.rocket['teleportToWithTicket(double,double,double)'];
  missing.dwell(0, 140);
  assert.equal(missing.of('rootTeleport').length, 0);
  assert.equal(missing.errors().length, 1);
  assert.match(missing.errors()[0], /missing public method: teleportToWithTicket/);
  assert.equal(missing.successes().length, 0);
});

test('production has no synthetic ground/tick, owner/access registry, thermal/physics bypass or reflection shortcuts', () => {
  assert.doesNotMatch(source, /\b(?:let|const)\b/);
  assert.doesNotMatch(source, /getClass|setClassFilter|setAccessible|\.onGround\s*=|\.setOnGround\s*\(/);
  assert.doesNotMatch(source, /(?:get|set)Owner|nearestStation|defaultStation|invulnerable|FIRE_RESISTANCE|setNoGravity|noPhysics/);
  assert.doesNotMatch(source, /stopRiding|startRiding|changeDimension|addPairing|sendChanges|\b(?:rocket|root|rider)\.tick\s*\(/);
  assert.doesNotMatch(source, /getStations\s*\(/);
});
