// UIV-B1 (docs/eras/uiv.md "B1. Travel: the relay seed, the jump and the platforms"), no game needed. The pack's scripts run in the stand-in
// of lib/kubejs_static.mjs. T1 is gg_test_uiv_travel (tools/test/overlay/kubejs/server_scripts/gg_test_uiv_travel.js).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const pack = path.join(root, 'pack');
const kube = path.join(pack, 'kubejs');
const data = path.join(kube, 'data', 'grindless');
const run = runPackScripts(pack);
const plain = (x) => JSON.parse(JSON.stringify(x, (k, v) => (typeof v === 'function' ? undefined : v)));
const S = plain(run.global.grindless.starshot);
const T = plain(run.global.grindless.uivTravel);
const recipes = run.docs.recipes.recipes;
const table = (name) => JSON.parse(fs.readFileSync(path.join(data, 'tables', name), 'utf8'));
const read = (...p) => fs.readFileSync(path.join(kube, ...p), 'utf8');
const row = (name) => S.recipes.find((r) => r.name === name);
const recOf = (r) => recipes.find((x) => x.i === r.recipeId);
const circuitOf = (r) => r.j.inputs.item.filter((i) => i.content.type === 'gtceu:circuit').map((i) => i.content.configuration);
const dimsOf = (r) => (r.j.recipeConditions || []).filter((c) => c.type === 'dimension').map((c) => c.dimension);
const VA_UV = 491520;

test('the stand-in runs the travel scripts without errors', () => {
  const errs = run.errors.filter((e) => /travel|starshot/.test(String(e.file)) && /uiv|starshot/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(S.clashes, []);
  assert.deepEqual(S.skipped, []);
});

test('the three items are registered here, with textures, names and tooltips', () => {
  for (const id of ['relay_seed', 'launched_relay_seed', 'ergosphere_probe']) {
    assert.ok(run.registry.items.has('grindless:' + id), id);
    assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'item', id + '.png')), id + ' texture');
  }
  assert.deepEqual(T.items, ['grindless:relay_seed', 'grindless:launched_relay_seed', 'grindless:ergosphere_probe']);
  const lang = read('client_scripts', 'grindless', 'uiv_travel_lang.js');
  assert.match(lang, /ClientEvents\.lang\('en_us'/);
  for (const id of ['relay_seed', 'launched_relay_seed', 'ergosphere_probe']) assert.ok(lang.includes(`['${id}',`), id);
});

test('starshot rows: starchip c3 and c4, launch c2 at the Moon; the older rows and circuits are unchanged', () => {
  const seed = row('relay_seed');
  assert.equal(seed.type, 'starchip');
  assert.equal(seed.circuit, 3);
  assert.deepEqual(seed.itemsIn, [{ id: 'grindless:starchip', count: 1 }, { id: 'grindless:degenerate_pellet', count: 1 }, { id: 'grindless:exotic_matter_cell', count: 1 }]);
  assert.deepEqual(seed.itemsOut, [{ id: 'grindless:relay_seed', count: 1 }]);
  const probe = row('ergosphere_probe');
  assert.equal(probe.type, 'starchip');
  assert.equal(probe.circuit, 4);
  assert.deepEqual(probe.itemsIn, [{ id: 'grindless:starchip', count: 1 }, { id: 'grindless:rad_hard_controller', count: 1 }]);
  assert.deepEqual(probe.itemsOut, [{ id: 'grindless:ergosphere_probe', count: 1 }]);
  const launch = row('relay_seed_launch');
  assert.equal(launch.type, 'laser_sail_launch');
  assert.equal(launch.circuit, 2);
  assert.deepEqual(dimsOf(recOf(launch)), ['gcyr:luna']);
  assert.deepEqual(launch.itemsIn, [{ id: 'grindless:relay_seed', count: 1 }]);
  assert.deepEqual(launch.itemsOut, [{ id: 'grindless:launched_relay_seed', count: 1 }]);
  // the launch module wears as starshot_probe's does
  const older = row('starshot_probe');
  assert.deepEqual(launch.chancedIn, older.chancedIn);
  assert.deepEqual(launch.chancedOut, older.chancedOut);
  assert.equal(launch.eut, older.eut);
  assert.equal(launch.amps, older.amps);
  for (const r of [seed, probe, launch]) {
    assert.ok(r.eut <= VA_UV && Number.isInteger(r.duration), r.name);
    assert.deepEqual(circuitOf(recOf(r)), [r.circuit], r.name);
  }
  assert.deepEqual(S.recipes.filter((r) => r.type === 'starchip').map((r) => r.circuit), [1, 2, 3, 4]);
  assert.deepEqual(S.recipes.filter((r) => r.type === 'laser_sail_launch').map((r) => r.circuit), [1, 2]);
  assert.equal(row('starchip').circuit, 1);
  assert.equal(row('sailcraft').circuit, 2);
  // the rad-hard controller, the pellet and the cell have their F1 makers (A10, UEV, UHV)
  for (const id of ['grindless:rad_hard_controller', 'grindless:degenerate_pellet', 'grindless:exotic_matter_cell']) {
    assert.ok(run.registry.items.has(id), id);
  }
});

const PLACES = { rx_j1856: [700000, 'rx_j1856'], psr_j0437: [3000000, 'psr_j0437'], cygnus_x1: [10000000, 'cygnus_x1'] };
const DIM = (k) => `grindless:${k}_orbit`;
const readJson = (...p) => JSON.parse(fs.readFileSync(path.join(...p), 'utf8'));

test('planets.json, orbits.json: three new places, own pair tags; older ids unchanged; stations.json does not grow', () => {
  const p = table('planets.json').planets;
  for (const k of Object.keys(PLACES)) {
    assert.deepEqual(p[k].dimensions, [DIM(k)], k);
    assert.equal(p[k].pairTag, k);
    assert.ok(p[k].name.en_us, k);
  }
  const olderTags = Object.entries(p).filter(([k]) => !PLACES[k]).map(([, v]) => v.pairTag);
  for (const k of Object.keys(PLACES)) assert.ok(!olderTags.includes(p[k].pairTag), k + ' pair tag is its own');
  assert.equal(p.sirius.pairTag, 'sirius');
  assert.deepEqual(p.barnard.dimensions, ['grindless:barnard_b', 'grindless:barnard_b_orbit']);
  const o = table('orbits.json').dimensions;
  assert.equal(o.indexOf('grindless:sirius_b_orbit'), 17, 'older orbits keep their order');
  // UXV-B1's Vela and Cas A orbits follow the three UIV places
  assert.deepEqual(o.slice(18, 18 + Object.keys(PLACES).length), Object.keys(PLACES).map(DIM));
  assert.equal(new Set(o).size, o.length);
  assert.ok(!o.slice(0, 18 + Object.keys(PLACES).length).some((x) => /black_hole/.test(x)), 'no black_hole_orbit among the UIV places');
  const more = table('stations.json').more;
  assert.equal(more.length, 8);
  assert.ok(!JSON.stringify(more).includes('uiv') && !more.some((m) => Object.keys(PLACES).some((k) => m.orbit === DIM(k))), 'UIV has no station');
  assert.equal(Object.keys(table('places.json').surfaces).length, 10, 'no surface place');
});

test('sunlight.json: three rows (RX 0, PSR 0, Cygnus 0.6), era uiv, always', () => {
  const d = table('sunlight.json').dimensions;
  assert.equal(d[DIM('rx_j1856')].factor, 0);
  assert.equal(d[DIM('psr_j0437')].factor, 0);
  assert.equal(d[DIM('cygnus_x1')].factor, 0.6);
  for (const k of Object.keys(PLACES)) {
    assert.equal(d[DIM(k)].when, 'always', k);
    assert.equal(d[DIM(k)].era, 'uiv', k);
    assert.match(d[DIM(k)].note, /^UIV-B1:/, k);
  }
  assert.equal(d['grindless:sirius_b_orbit'].factor, 5.6);
});

test('the datapack: dimension, planet (tier 11, no air, no gravity) and sky of each place; the figures of S0-3', () => {
  for (const [k, [temp]] of Object.entries(PLACES)) {
    assert.deepEqual(readJson(data, 'dimension', `${k}_orbit.json`), { type: 'gcyr:space', generator: { type: 'gcyr:space' } }, k);
    const pl = readJson(data, 'gcyr', 'planets', `${k}_orbit.json`);
    assert.equal(pl.rocket_tier, 11, k);
    assert.equal(pl.temperature, temp, k);
    assert.equal(pl.world, DIM(k));
    assert.equal(pl.orbit_world, DIM(k));
    assert.equal(pl.translation, `level.grindless.${k}_orbit`);
    assert.equal(pl.solar_system, `grindless:${k}`);
    assert.equal(pl.gravity, 0);
    assert.equal(pl.has_atmosphere, false);
    assert.equal(pl.has_oxygen, false);
    assert.equal(readJson(kube, 'assets', 'grindless', 'gcyr', 'planet_assets', 'sky_renderers', `${k}_orbit.json`).world, DIM(k), k + ' sky');
  }
  // no rocket offers a tier 11 place: UEV's tier 10 is the highest rocket, UIV's places are jump-only
  for (const f of fs.readdirSync(path.join(data, 'gcyr', 'planets'))) {
    const pl = readJson(data, 'gcyr', 'planets', f);
    if (pl.rocket_tier === 11) assert.ok(Object.keys(PLACES).some((k) => f === `${k}_orbit.json`), f);
  }
  assert.ok(!fs.existsSync(path.join(data, 'dimension', 'black_hole_orbit.json')));
});

test('the three jump rows, the relay pairs and the platform table', () => {
  const rows = table('gate.json').types.warp_gate.recipes.filter((r) => /^UIV-B1:/.test(r._why || ''));
  assert.deepEqual(rows.map((r) => [r.name, r.circuit]), [['hold_rx_j1856', 4], ['hold_psr_j0437', 5], ['hold_cygnus_x1', 6]]);
  for (const r of rows) {
    assert.equal(r.eut, 31457280, r.name);
    assert.equal(r.duration, 1200, r.name);
    assert.equal(r.site, 'sirius_b_orbit', r.name);
    assert.deepEqual(r.itemsOut, [], r.name);
    assert.deepEqual(r.kept, [{ id: 'grindless:pulsar_navigation_chart', count: 1 }], r.name);
    assert.ok(r.itemsIn.some((i) => i.id === 'grindless:launched_relay_seed'), r.name);
  }
  assert.deepEqual(rows[2].itemsIn.map((i) => i.id).sort(), ['grindless:launched_relay_seed', 'grindless:neutronium_pellet', 'grindless:pulsar_navigation_solution']);
  const WG = plain(run.global.grindless.warpGate);
  assert.deepEqual(WG.skipped || [], []);
  assert.deepEqual(WG.clashes || [], []);
  for (const k of ['rx_j1856', 'psr_j0437', 'cygnus_x1']) {
    assert.ok((WG.pairs || []).some((p) => p.id === `grindless:transform/${k}_entangled_singularity` && p.tag === k), k + ' relay pair');
  }
  const seeds = (WG.pairs || []).map((p) => p.seed);
  assert.equal(new Set(seeds).size, seeds.length, 'one seed per pair');
  const gate = read('server_scripts', 'grindless', 'uhv', 'gate.js');
  assert.match(gate, /SITES\.cygnus_x1_orbit = \['grindless:cygnus_x1_orbit'\]/);
  const plat = table('relay_platforms.json');
  assert.deepEqual(plat.platforms.filter((p) => !p.source).map((p) => [p.place, p.jump, p.dimension]), [
    ['rx_j1856', 'hold_rx_j1856', 'grindless:rx_j1856_orbit'],
    ['psr_j0437', 'hold_psr_j0437', 'grindless:psr_j0437_orbit'],
    ['cygnus_x1', 'hold_cygnus_x1', 'grindless:cygnus_x1_orbit']]);
  assert.equal(plat.platforms.length, 13, 'UXV-B1 appends two rows with a source, OpV-F1 two more, MAX-F1 two more, XP-F1 four more');
  for (const p of plat.platforms.filter((x) => !x.source)) assert.ok(rows.some((r) => r.name === p.jump), p.place);
  assert.equal(plat.ring.machine, 'gtceu:warp_gate');
});

test('the jump rows have their EMI lines in en_us', () => {
  const lang = read('client_scripts', 'grindless', 'uiv_travel_lang.js');
  for (const n of ['hold_rx_j1856', 'hold_psr_j0437', 'hold_cygnus_x1']) {
    assert.ok(lang.includes(`'${n}'`), n);
  }
  assert.match(lang, /gtceu\.recipe\.' \+ [^\n]*|gtceu\.recipe\.grindless_warp_gate/);
});
// ---------------------------------------------------------------- AF-1 (issue #203): the relay places, no game needed
// The shared placer (server_scripts/grindless/lib/relay_platforms.js) and the transit (server uhv/gate.js) run in node:vm against a small fake world;
// the startup hooks (ringOf, saveRing, loadRings, finishRun) are the stand-in's own. T1 is gg_test_uiv_travel.

const LIB = ['server_scripts', 'grindless', 'lib', 'relay_platforms.js'];
const GATE_SERVER = ['server_scripts', 'grindless', 'uhv', 'gate.js'];
const PLAT = table('relay_platforms.json');
const SIRIUS = 'grindless:sirius_b_orbit';
const FAR = 'grindless:rx_j1856_orbit';
const R0 = run.global.grindless.relayPlatforms;
const WG0 = run.global.grindless.warpGate;
const HOME = { x: 35600, y: 100, z: 20 };

test('AF-1: one placer for every row; the old pollers and the c11 copy are gone; the gate hands completed runs to it', () => {
  const errs = run.errors.filter((e) => /relay_platforms|uhv[\\/]gate|kerr_sling|bulge_relay/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  for (const f of [['uiv', 'travel.js'], ['uxv', 'kerr_sling.js'], ['opv', 'bulge_relay.js']]) {
    const code = read('server_scripts', 'grindless', ...f);
    assert.ok(!/setblock|forceload|function plain|function plan|ServerEvents\.tick|opvBulgeHold|warpGate\.gates/.test(code), f.join('/'));
  }
  assert.ok(R0 && typeof R0.plan === 'function' && typeof R0.step === 'function' && typeof R0.place === 'function', 'lib published');
  assert.equal(WG0.onFinished, R0.onFinished);
  assert.equal(run.global.grindless.uivTravel.placed, R0.placed);
  assert.equal(run.global.grindless.uxvKerrSling.placed, R0.placed);
  assert.match(read('startup_scripts', 'grindless', 'uhv', 'gate.js'), /\.afterWorking\(function \(machine\) \{ finishRun\(machine\) \}\)/);
  assert.equal(PLAT.ring.selector, 'gtceu:data_stick', 'an existing item carries the coordinates');
  assert.equal(PLAT.ring.circuit, 2);
  assert.equal(PLAT.ring.floor, 'grindless:station_truss_casing', 'the floor is an existing block');
  const lang = read('client_scripts', 'grindless', 'uhv_gate_lang.js');
  for (const p of PLAT.platforms) assert.ok(lang.includes(`'grindless.relay_coordinates.${p.place}'`), p.place);
  for (const k of ['name', 'home']) assert.ok(lang.includes(`'grindless.relay_coordinates.${k}'`), k);
  for (const k of ['waking', 'no_ring']) assert.ok(lang.includes(`'grindless.warp_gate.${k}'`), k);
  const info = read('client_scripts', 'grindless', 'uhv_info_lang.js');
  assert.match(info, /emi\.grindless\.info\.warp_gate\.1', "[^"]*Relay Coordinates in its input bus/);
  assert.match(info, /emi\.grindless\.info\.warp_gate\.3', '[^\n]*ride home/);
});

test('AF-1: the placer plans every cell of the warp gate, the 88 frame posts included, and its three parts on the front wall', () => {
  const built = plain(R0.plan(PLAT.ring, { x: 64, y: 100, z: 64 }));
  const ids = built.cells.map((c) => c.id);
  assert.equal(ids.filter((id) => id === 'gtceu:tungsten_steel_frame').length, 88);
  assert.equal(ids.filter((id) => id === 'minecraft:air').length, 845);
  assert.ok(ids.every((id) => /^[a-z0-9_]+:[a-z0-9_/]+$/.test(id)), 'every cell has a block');
  assert.deepEqual([built.min, built.max], [{ x: 52, y: 99, z: 64 }, { x: 76, y: 107, z: 83 }]);
  assert.deepEqual(built.at, { energy: { x: 76, y: 99, z: 64 }, bus: { x: 71, y: 99, z: 64 }, out: { x: 70, y: 99, z: 64 } });
  const at = (p) => built.cells.find((c) => c.p.x === p.x && c.p.y === p.y && c.p.z === p.z).id;
  assert.equal(at(built.at.energy), PLAT.ring.energy);
  assert.equal(at(built.at.bus), PLAT.ring.inputBus);
  assert.equal(at(built.at.out), PLAT.ring.outputBus);
  assert.equal(at({ x: 71, y: 100, z: 64 }), 'gtceu:tungsten_steel_frame', 'a corner post');
});

test('AF-1: the placer knows every symbol kind lib/patterns.js emits (controller, air, any, blocks, frames, part, oneOf)', () => {
  const S = run.global.grindless.structures;
  S['test:af1_kinds'] = { slices: [['XXX', 'FPA', 'S#Y']], symbols: {
    S: { kind: 'controller' },
    X: { kind: 'oneOf', options: [{ kind: 'blocks', blocks: ['test:casing'] }, { kind: 'part', ability: 'energy_input' }, { kind: 'part', ability: 'input_bus' },
      { kind: 'part', ability: 'output_bus' }] },
    F: { kind: 'frames', materials: ['steel'] }, P: { kind: 'part', ability: 'input_bus' }, A: { kind: 'any' }, '#': { kind: 'air' },
    Y: { kind: 'blocks', blocks: ['minecraft:stone'] } } };
  S['test:af1_bad'] = { slices: [['XXX', 'Q  ', 'S  ']], symbols: { ...S['test:af1_kinds'].symbols, Q: { kind: 'mystery' } } };
  try {
    const built = plain(R0.plan({ ...PLAT.ring, machine: 'test:af1_kinds' }, { x: 0, y: 0, z: 0 }));
    const byPos = Object.fromEntries(built.cells.map((c) => [`${c.p.x},${c.p.y}`, c.id]));
    assert.deepEqual(byPos, { '0,-2': PLAT.ring.energy, '-1,-2': PLAT.ring.inputBus, '-2,-2': PLAT.ring.outputBus, '0,-1': 'gtceu:steel_frame',
      '-1,-1': PLAT.ring.inputBus, '-1,0': 'minecraft:air', '-2,0': 'minecraft:stone' });
    assert.throws(() => R0.plan({ ...PLAT.ring, machine: 'test:af1_bad' }, { x: 0, y: 0, z: 0 }), /unsupported structure symbol mystery/);
  } finally {
    delete S['test:af1_kinds'];
    delete S['test:af1_bad'];
  }
});

test('AF-1: only a run that reached its full duration reaches the placer (GTM also calls afterWorking when it interrupts one)', () => {
  const calls = [];
  const keep = WG0.onFinished;
  WG0.onFinished = (m, id) => calls.push(id);
  const mach = (progress, duration, id) => ({ getRecipeLogic: () => ({ getLastRecipe: () => (id ? { id } : null), getProgress: () => progress, getDuration: () => duration }) });
  try {
    WG0.finishRun(mach(1200, 1200, 'grindless:warp_gate/hold_rx_j1856'));
    WG0.finishRun(mach(600, 1200, 'grindless:warp_gate/hold_psr_j0437'));
    WG0.finishRun(mach(1, 1200, 'grindless:warp_gate/hold_psr_j0437'));
    WG0.finishRun(mach(0, 0, 'grindless:warp_gate/hold_cygnus_x1'));
    WG0.finishRun(mach(1200, 1200, null));
  } finally {
    WG0.onFinished = keep;
  }
  assert.deepEqual(calls, ['grindless:warp_gate/hold_rx_j1856']);
});

// ---- the fake world: blocks, GT machines (controller, buses, hatches), NBT, item stacks and players

function nbtOf(store) {
  return {
    contains: (k) => Object.hasOwn(store, k),
    getString: (k) => (Object.hasOwn(store, k) ? String(store[k]) : ''),
    putString: (k, v) => { store[k] = String(v); },
    getBoolean: (k) => store[k] === true,
    putBoolean: (k, v) => { store[k] = !!v; },
    remove: (k) => { delete store[k]; }
  };
}
class Compound {
  constructor() { this.m = {}; }
  putString(k, v) { this.m[k] = String(v); }
  getString(k) { return Object.hasOwn(this.m, k) ? this.m[k] : ''; }
  contains(k) { return Object.hasOwn(this.m, k); }
  put(k, v) { this.m[k] = v; }
}
class ListTag {
  constructor() { this.a = []; }
  add(v) { this.a.push(v); return true; }
}
const EMPTY = { isEmpty: () => true, getNbt: () => null, id: 'minecraft:air' };
const stackOf = (id, count, tag) => ({ id: String(id), count, tag: tag || null, isEmpty: () => false, getNbt() { return this.tag; } });
function invOf(n) {
  const s = new Array(n).fill(EMPTY);
  return { s, getSlots: () => n, getStackInSlot: (i) => s[i], setStackInSlot: (i, v) => { s[i] = v; } };
}

function makeWorld(store) {
  const w = { store, blocks: {}, machines: {}, cmds: [], tracked: [], popped: [], players: [], levels: {} };
  const key = (dim, x, y, z) => `${dim}|${x}|${y}|${z}`;
  w.key = key;
  w.level = (dim) => (w.levels[dim] ||= {
    dimension: dim,
    isLoaded: () => true,
    getChunk: () => null,
    getTime: () => 0,
    getServer: () => w.server,
    getBlock: (x, y, z) => ({ id: w.blocks[key(dim, x, y, z)] || 'minecraft:air' })
  });
  w.machine = (dim, p, id) => {
    const m = { dim, p, id, formed: true, status: 'IDLE', last: null, suspendAfter: false, enabled: [], parts: [], inv: invOf(16), circuit: invOf(1) };
    m.getDefinition = () => ({ getId: () => m.id });
    m.getPos = () => ({ getX: () => p.x, getY: () => p.y, getZ: () => p.z });
    m.isFormed = () => m.formed;
    m.getParts = () => m.parts;
    m.getInventory = () => m.inv;
    m.getCircuitInventory = () => m.circuit;
    m.getLevel = () => w.level(dim);
    m.getFrontFacing = () => 'NORTH';
    m.getRecipeLogic = () => ({
      isWorking: () => m.status === 'WORKING',
      isSuspend: () => m.status === 'SUSPEND',
      getLastRecipe: () => (m.last ? { id: m.last } : null),
      setWorkingEnabled: (on) => {
        m.enabled.push(on);
        if (!on && m.status === 'IDLE') m.status = 'SUSPEND';
        else if (on) { m.suspendAfter = false; if (m.status === 'SUSPEND') m.status = 'IDLE'; }
      },
      setSuspendAfterFinish: (on) => { m.suspendAfter = on; }
    });
    return m;
  };
  w.set = (dim, p, id) => {
    const k = key(dim, p.x, p.y, p.z);
    w.blocks[k] = id;
    if (!w.noMachines && /warp_gate$|_bus$|hatch/.test(id)) w.machines[k] = w.machine(dim, p, id);
    else delete w.machines[k];
    return w.machines[k];
  };
  w.server = {
    persistentData: nbtOf(store),
    tick: 0,
    getTickCount() { return this.tick; },
    getLevel: (d) => w.level(d),
    getPlayers: () => w.players,
    runCommandSilent: (c) => {
      w.cmds.push(c);
      const m = /^execute in (\S+) run setblock (-?\d+) (-?\d+) (-?\d+) (\S+?)(\[[^\]]*\])? replace$/.exec(c);
      if (m) w.set(m[1], { x: +m[2], y: +m[3], z: +m[4] }, m[5]);
      return 1;
    }
  };
  function Pos(x, y, z) { this.x = x; this.y = y; this.z = z; this.getX = () => x; this.getY = () => y; this.getZ = () => z; }
  w.classes = {
    'com.gregtechceu.gtceu.api.machine.MetaMachine': { getMachine: (level, p) => w.machines[key(level.dimension, p.x, p.y, p.z)] || null },
    'net.minecraft.core.BlockPos': Pos,
    'com.gregtechceu.gtceu.common.item.IntCircuitBehaviour': { stack: (n) => ({ circuit: n, isEmpty: () => false, getNbt: () => null }) },
    'net.minecraft.nbt.CompoundTag': Compound,
    'net.minecraft.nbt.ListTag': ListTag,
    'net.minecraft.nbt.StringTag': { valueOf: (s) => ({ s: String(s) }) },
    'net.minecraft.world.level.block.Block': { popResource: (level, p, st) => w.popped.push({ dim: level.dimension, x: p.x, y: p.y, z: p.z, st }) }
  };
  return w;
}

// one boot: a fresh global (a restart loses it) round the world's persistent data; `gate` also loads the server gate.js (the transit)
function boot(w, { gate = false, teams = null } = {}) {
  const ticks = [];
  const logs = [];
  const G = { grindless: { warpGate: WG0, structures: run.global.grindless.structures, patterns: run.global.grindless.patterns,
    readJsonTable: () => JSON.parse(JSON.stringify(PLAT)),
    teams: teams || undefined,
    wireless: { track: (level, p, who) => { w.tracked.push(`${level.dimension}|${p.x}|${p.y}|${p.z}`); (w.trackedFor ||= []).push(who); return { k: 'hatch' }; } } } };
  const ctx = vm.createContext({
    global: G,
    console: { info: (s) => logs.push(String(s)), error: (s) => logs.push('ERROR ' + s), log: (s) => logs.push(String(s)), warn: (s) => logs.push('WARN ' + s) },
    ServerEvents: { tick: (fn) => ticks.push(fn), recipes: () => {} },
    Java: { loadClass: (n) => w.classes[n] || {} },
    Item: { of: (id, count, tag) => stackOf(id, count === undefined ? 1 : count, tag), exists: () => true },
    Text: { translate: (k) => ({ key: k }) }
  });
  vm.runInContext(read(...LIB), ctx, { filename: 'relay_platforms.js' });
  if (gate) vm.runInContext(read(...GATE_SERVER), ctx, { filename: 'gate.js' });
  return {
    G, logs,
    R: G.grindless.relayPlatforms,
    T: () => WG0.transit,
    tick(n = 1) {
      for (let i = 0; i < n; i++) {
        w.server.tick++;
        ticks.forEach((fn) => fn({ server: w.server }));
      }
    }
  };
}

function playerOf(id, dim, x, y, z, store) {
  const p = { id, dim, x, y, z, calls: [], msgs: [], persistentData: store ? nbtOf(store) : undefined };
  p.getUuid = () => id;
  p.getLevel = () => ({ getDimension: () => p.dim });
  p.getX = () => p.x;
  p.getY = () => p.y;
  p.getZ = () => p.z;
  p.getYaw = () => 0;
  p.getPitch = () => 0;
  p.getName = () => ({ getString: () => id });
  p.teleportTo = (d, x2, y2, z2) => { p.calls.push(`${d}@${x2},${y2},${z2}`); p.dim = String(d); p.x = x2; p.y = y2; p.z = z2; };
  p.displayClientMessage = (c) => p.msgs.push(c.key);
  return p;
}

// a world where the c4 jump ring at Sirius B holds an input and an output bus (GTM formed it)
function jumpRing(w) {
  const ctl = w.set(SIRIUS, HOME, 'gtceu:warp_gate');
  const bin = w.set(SIRIUS, { x: HOME.x + 6, y: 99, z: HOME.z }, 'gtceu:uhv_input_bus');
  const bout = w.set(SIRIUS, { x: HOME.x + 5, y: 99, z: HOME.z }, 'gtceu:uhv_output_bus');
  ctl.parts = [bout, bin];
  return { ctl, bin, bout };
}
const HOME_RING = { dim: SIRIUS, ...HOME, fx: 0, fz: -1 };
const FAR_RING = { dim: FAR, x: 64, y: 100, z: 64, fx: 0, fz: -1 };
const errorsOf = (b) => b.logs.filter((l) => l.startsWith('ERROR'));

test('AF-1: a completed jump survives a restart in the queue, then places its platform once and gives the coordinates', () => {
  const store = {};
  const w = makeWorld(store);
  const { ctl, bout } = jumpRing(w);
  const b1 = boot(w);
  WG0.onFinished(ctl, 'grindless:warp_gate/hold_rx_j1856');
  assert.deepEqual(JSON.parse(store.grindless_relay_due), [{ p: 'rx_j1856', r: HOME_RING, t: 'server' }]);
  WG0.onFinished(ctl, 'grindless:warp_gate/sustain');
  assert.equal(JSON.parse(store.grindless_relay_due).length, 1, 'a sustain queues nothing');
  assert.equal(w.cmds.length, 0, 'nothing placed in the machine tick');
  // the restart: a new boot reads the queue back
  const b2 = boot(w);
  b2.tick(10);
  assert.deepEqual(errorsOf(b1).concat(errorsOf(b2)), []);
  assert.equal(store.uivPlatform_rx_j1856, `${FAR}@64,100,64`);
  assert.ok(!Object.hasOwn(store, 'grindless_relay_due'), 'the queue is empty');
  assert.equal(b2.R.placed.rx_j1856, true);
  assert.ok(Object.values(w.blocks).includes('gtceu:tungsten_steel_frame'), 'frame posts');
  assert.equal(w.blocks[w.key(FAR, 64, 100, 64)], 'gtceu:warp_gate');
  assert.ok(w.cmds.includes(`execute in ${FAR} run fill 52 98 64 76 98 83 ${PLAT.ring.floor} keep`), 'the floor');
  assert.ok(w.cmds.includes(`execute in ${FAR} run fill 52 99 64 76 107 83 minecraft:air replace`), 'the ring box cleared once');
  assert.ok(w.cmds.includes(`execute in ${FAR} run forceload add 48 64`) && w.cmds.includes(`execute in ${FAR} run forceload add 64 64`));
  assert.ok(!w.cmds.some((c) => /setblock \S+ \S+ \S+ minecraft:air/.test(c)), 'no air setblock');
  const far = w.machines[w.key(FAR, 64, 100, 64)];
  assert.equal(far.status, 'SUSPEND', 'the platform ring starts paused');
  const fbus = w.machines[w.key(FAR, 71, 99, 64)];
  assert.equal(fbus.inv.s[0].id, PLAT.ring.stock.id);
  assert.equal(fbus.inv.s[0].count, PLAT.ring.stock.count);
  assert.equal(fbus.circuit.s[0].circuit, 2);
  assert.deepEqual(plain(b2.R.coordinatesOf(fbus.inv.s[1])), HOME_RING, 'the way back');
  assert.equal(JSON.parse(fbus.inv.s[1].tag.m.display.m.Name).with[0].translate, 'grindless.relay_coordinates.home');
  assert.deepEqual(w.tracked.sort(), [`${FAR}|73|100|64`, `${FAR}|76|99|64`], 'both wireless hatches tracked');
  assert.equal(w.blocks[w.key(FAR, 76, 100, 64)], 'ae2:controller');
  assert.equal(w.blocks[w.key(FAR, 76, 101, 64)], 'ae2:drive');
  // the coordinates of the place in the jump ring's output bus
  assert.deepEqual(plain(b2.R.coordinatesOf(bout.inv.s[0])), FAR_RING);
  assert.equal(bout.inv.s[0].id, 'gtceu:data_stick');
  assert.equal(JSON.parse(bout.inv.s[0].tag.m.display.m.Name).with[0].translate, 'grindless.relay_coordinates.rx_j1856');
  // a repeated jump places nothing again and only gives the coordinates
  const n = w.cmds.length;
  WG0.onFinished(ctl, 'grindless:warp_gate/hold_rx_j1856');
  b2.tick(10);
  assert.equal(w.cmds.length, n, 'nothing placed again');
  assert.deepEqual(plain(b2.R.coordinatesOf(bout.inv.s[1])), FAR_RING);
  assert.ok(!Object.hasOwn(store, 'grindless_relay_due'));
});

test('FIX-RELAY: the platform hatches are tracked under the team of the player standing in the jump ring, kept in the queue across a restart; nobody in the ring is the server team', () => {
  const store = {};
  const w = makeWorld(store);
  const { ctl } = jumpRing(w);
  const teamOf = (p) => (p.id === 'alice' ? 'teamA' : 'teamB');
  const at = (id, dx, dim = SIRIUS) => playerOf(id, dim, HOME.x + 0.5 + dx, HOME.y, HOME.z + 7.5);
  w.players = [at('bob', 40), at('carol', 0, FAR), at('alice', 0)];
  boot(w, { teams: { ofPlayer: teamOf, ofMachine: () => 'teamZ' } });
  WG0.onFinished(ctl, 'grindless:warp_gate/hold_rx_j1856');
  assert.equal(JSON.parse(store.grindless_relay_due)[0].t, 'teamA', 'the jumping player, not the ring owner nor a player elsewhere');
  const b2 = boot(w);
  b2.tick(10);
  assert.deepEqual(errorsOf(b2), []);
  assert.deepEqual(w.trackedFor, ['teamA', 'teamA'], 'the energy hatch and the dynamo hatch, both the traveller\'s team');
  const s2 = {};
  const w2 = makeWorld(s2);
  const r2 = jumpRing(w2);
  w2.players = [at('bob', 40)];
  const b3 = boot(w2, { teams: { ofPlayer: teamOf, ofMachine: () => 'teamZ' } });
  WG0.onFinished(r2.ctl, 'grindless:warp_gate/hold_rx_j1856');
  b3.tick(10);
  assert.deepEqual(w2.trackedFor, ['server', 'server'], 'nobody in the ring builds a server platform');
});

test('AF-1: a source row is placed by the same placer with its uxv mark; a full bus drops the coordinates in front of the ring; a failure is retried', () => {
  const store = {};
  const w = makeWorld(store);
  const { bout, bin } = jumpRing(w);
  for (let i = 0; i < 16; i++) { bout.inv.s[i] = stackOf('minecraft:stone', 64); bin.inv.s[i] = stackOf('minecraft:stone', 64); }
  const b = boot(w);
  b.R.enqueue(w.server, 'vela_pulsar', HOME_RING);
  b.tick(10);
  assert.equal(store.uxvPlatform_vela_pulsar, 'grindless:vela_pulsar_orbit@64,100,64');
  assert.equal(w.blocks[w.key('grindless:vela_pulsar_orbit', 71, 100, 64)], 'gtceu:tungsten_steel_frame');
  assert.equal(w.popped.length, 1);
  assert.deepEqual([w.popped[0].dim, w.popped[0].x, w.popped[0].y, w.popped[0].z], [SIRIUS, HOME.x, HOME.y, HOME.z - 1]);
  assert.deepEqual(plain(b.R.coordinatesOf(w.popped[0].st)), { ...FAR_RING, dim: 'grindless:vela_pulsar_orbit' });
  // a placing that throws keeps its entry and waits RETRY ticks
  w.noMachines = true;
  const b2 = boot(w);
  b2.R.enqueue(w.server, 'cas_a', HOME_RING);
  b2.tick(10);
  assert.ok(!Object.hasOwn(store, 'uxvPlatform_cas_a'));
  assert.equal(JSON.parse(store.grindless_relay_due)[0].p, 'cas_a');
  assert.equal(errorsOf(b2).length, 1, b2.logs.join('\n'));
  w.noMachines = false;
  b2.tick(300);
  assert.ok(!Object.hasOwn(store, 'uxvPlatform_cas_a'), 'still waiting');
  b2.tick(300);
  assert.equal(store.uxvPlatform_cas_a, 'grindless:cas_a_remnant@64,100,64');
  assert.ok(!Object.hasOwn(store, 'grindless_relay_due'));
});

// the platform of the first scenario, placed through the queue, with GTM's forming of its ring (the input bus as a part)
function placedWorld() {
  const store = {};
  const w = makeWorld(store);
  const ring = jumpRing(w);
  const b = boot(w);
  WG0.onFinished(ring.ctl, 'grindless:warp_gate/hold_rx_j1856');
  b.tick(10);
  const far = w.machines[w.key(FAR, 64, 100, 64)];
  const fbus = w.machines[w.key(FAR, 71, 99, 64)];
  far.parts = [fbus];
  // the player at home: the coordinates into the input bus; the home ring is one the gate recorded (beforeWorking)
  ring.bin.inv.s[1] = ring.bout.inv.s[0];
  ring.bout.inv.s[0] = EMPTY;
  WG0.saveRing(w.server, HOME_RING);
  return { store, w, ...ring, far, fbus };
}
const centre = (r) => ({ x: r.x - r.fx * 7 + 0.5, z: r.z - r.fz * 7 + 0.5 });
const SUSTAIN = 'grindless:warp_gate/sustain';

test('AF-1: a holding ring with coordinates carries a player there; the paused platform wakes once when they step back in, and carries them home', () => {
  const { store, w, ctl, far } = placedWorld();
  const b = boot(w, { gate: true });
  const pd = {};
  const c = centre(HOME_RING);
  const a = playerOf('a', SIRIUS, c.x, 100, c.z, pd);
  w.players = [a];
  // a starved or paused sustain carries nobody
  ctl.status = 'WAITING';
  ctl.last = SUSTAIN;
  b.tick(10);
  assert.equal(a.calls.length, 0, 'a waiting sustain does not hold');
  ctl.status = 'WORKING';
  b.tick(10);
  assert.deepEqual(a.calls, [`${FAR}@64.5,100,71.5`]);
  assert.equal(pd.grindlessWarpMoved, true, 'the flag is kept with the player');
  assert.ok(store.grindless_warp_rings.includes(`${SIRIUS}|${HOME.x}|${HOME.y}|${HOME.z}|0|-1`));
  b.tick(10);
  assert.equal(a.calls.length, 1, 'no ping-pong');
  assert.equal(far.status, 'SUSPEND', 'arriving wakes nothing');
  a.y = 110;
  b.tick(10);
  assert.ok(!Object.hasOwn(pd, 'grindlessWarpMoved'), 'left every ring: the flag is cleared');
  a.y = 99;
  b.tick(10);
  assert.equal(far.status, 'IDLE', 'stepping in wakes the platform');
  assert.equal(far.suspendAfter, true, 'for one sustain');
  assert.deepEqual(a.msgs, ['grindless.warp_gate.waking']);
  assert.equal(a.calls.length, 1, 'not carried before it holds');
  b.tick(10);
  assert.equal(far.enabled.filter((x) => x === true).length, 1, 'woken once per stay');
  // GTM starts the sustain (one cell, the network's EU): the platform holds and its coordinates take the player home
  far.status = 'WORKING';
  far.last = SUSTAIN;
  b.tick(10);
  assert.deepEqual(a.calls, [`${FAR}@64.5,100,71.5`, `${SIRIUS}@${c.x},100,${c.z}`]);
  assert.equal(b.T().trips, 2);
  assert.equal(b.T().wakes, 1);
  assert.deepEqual(errorsOf(b), []);
});

test('AF-1: after a restart the rings and the trip flag come back from persistent data; nobody is sent back', () => {
  const { w, ctl } = placedWorld();
  ctl.status = 'WORKING';
  ctl.last = SUSTAIN;
  for (const k of Object.keys(WG0.gates)) delete WG0.gates[k];
  const b = boot(w, { gate: true });
  const c = centre(HOME_RING);
  const pd = { grindlessWarpMoved: true };
  const a = playerOf('a', SIRIUS, c.x, 100, c.z, pd);
  w.players = [a];
  b.tick(10);
  assert.ok(WG0.gates[`${SIRIUS}|${HOME.x}|${HOME.y}|${HOME.z}`], 'the home ring is known again');
  assert.equal(a.calls.length, 0, 'carried before the restart, not again');
  a.x += 30;
  b.tick(10);
  a.x -= 30;
  b.tick(10);
  assert.deepEqual(a.calls, [`${FAR}@64.5,100,71.5`]);
});

test('AF-1: coordinates that name no warp gate carry nobody; with no coordinates the choice is the first other holding ring, for several players at once', () => {
  const { w, ctl, bin } = placedWorld();
  ctl.status = 'WORKING';
  ctl.last = SUSTAIN;
  bin.inv.s[1] = stackOf('gtceu:data_stick', 1, (() => { const t = new Compound(); t.putString('grindless_relay', `${FAR}|0|100|0|0|-1`); return t; })());
  const b = boot(w, { gate: true });
  const c = centre(HOME_RING);
  const a = playerOf('a', SIRIUS, c.x, 100, c.z);
  w.players = [a];
  b.tick(10);
  assert.equal(a.calls.length, 0);
  assert.deepEqual(a.msgs, ['grindless.warp_gate.no_ring']);
  b.tick(10);
  assert.deepEqual(a.msgs, ['grindless.warp_gate.no_ring'], 'told once per stay');
  // three holding rings without coordinates: Earth orbit, Proxima b's orbit and Sirius B's orbit
  bin.inv.s[1] = EMPTY;
  const EARTH = { dim: 'gcyr:overworld_orbit', x: 100, y: 80, z: 10, fx: 0, fz: -1 };
  const PROX = { dim: 'grindless:proxima_b_orbit', x: 200, y: 80, z: 10, fx: 0, fz: -1 };
  for (const r of [EARTH, PROX]) {
    const m = w.set(r.dim, r, 'gtceu:warp_gate');
    m.status = 'WORKING';
    m.last = SUSTAIN;
    WG0.saveRing(w.server, r);
    WG0.gates[`${r.dim}|${r.x}|${r.y}|${r.z}`] = r;
  }
  a.x += 30;
  b.tick(10);
  a.x -= 30;
  const ce = centre(EARTH);
  const e = playerOf('e', EARTH.dim, ce.x, 80, ce.z);
  w.players = [a, e];
  b.tick(10);
  assert.deepEqual(a.calls, [`gcyr:overworld_orbit@${ce.x},80,${ce.z}`], 'Sirius -> the first other ring by key: Earth orbit');
  const cp = centre(PROX);
  assert.deepEqual(e.calls, [`grindless:proxima_b_orbit@${cp.x},80,${cp.z}`], 'Earth -> Proxima b, in the same step');
});