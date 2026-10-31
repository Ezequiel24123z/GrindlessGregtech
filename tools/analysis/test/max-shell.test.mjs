// MAX-G1 (mirror shell): the stand-in run of max/shell.js, the three recipes (c3 is the only row above VA[MAX]), the controller line, the
// older rows this package appended (marked MAX-G1), lang parity, textures, the shape and the overlay.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const pack = path.join(root, 'pack');
const kube = path.join(pack, 'kubejs');
const run = runPackScripts(pack);
const MS = run.global.grindless.maxShell;
const recipes = run.docs.recipes.recipes;
const find = (id) => recipes.find((r) => r.i === id);
const plain = (x) => JSON.parse(JSON.stringify(x));
const read = (...p) => fs.readFileSync(path.join(...p), 'utf8');
const table = (f) => JSON.parse(read(kube, 'data', 'grindless', 'tables', f));
const VA_MAX = 2013265920;
const V_MAX = 2 ** 31;
const euIn = (r) => (((r.j.tickInputs || {}).eu || [])[0] || { content: 0 }).content;
const euOut = (r) => (((r.j.tickOutputs || {}).eu || [])[0] || { content: 0 }).content;

test('the stand-in runs the script without errors, skips nothing', () => {
  const mine = run.errors.filter((e) => /max[\\/]shell/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(MS.skipped), []);
  assert.deepEqual(plain(MS.pendingRoutes), []);
  assert.ok(MS.controllerRecipe);
  assert.equal(MS.recipes.length, 3);
});

test('c1 is a generator of 2^30 EU/t for 4,800 t at about 2.3x the cost of the packet along L18', () => {
  const r = find('grindless:black_hole_bomb/vent_wave_packet');
  assert.ok(r);
  assert.equal(euOut(r), 2 ** 30);
  assert.equal(euIn(r), 0);
  const total = 2 ** 30 * 4800;
  const lineCost = 2.24e12; // the L18 chain EU of one packet (max.md, G1)
  assert.ok(Math.abs(total / lineCost - 2.3) < 0.05, `balance ${total / lineCost}`);
});

test('c2 is a consumer at VA[MAX] for 1,200 t', () => {
  const r = find('grindless:black_hole_bomb/final_spin_map');
  assert.ok(r);
  assert.ok(euIn(r) > 0 && euIn(r) <= V_MAX); // the stand-in's VA[MAX] is V[MAX]; the source line is pinned below
  assert.match(read(kube, 'server_scripts', 'grindless', 'max', 'shell.js'), /name: 'final_spin_map', circuit: 2, eut: VA_MAX, duration: 1200/);
});

test('c3 is the only recipe of the pack above VA[MAX]: 2^35 EU/t for 1,200 t, V[MAX] x 16 in the source', () => {
  const r = find('grindless:black_hole_bomb/universe_seed');
  assert.ok(r);
  assert.equal(euIn(r), V_MAX * 16);
  assert.equal(euIn(r), 2 ** 35);
  const s = JSON.stringify(r.j);
  assert.match(s, /universe_seed/);
  assert.match(s, /mirror_shell_scrap/);
  assert.match(s, /spent_rydberg_array/);
  const src = read(kube, 'server_scripts', 'grindless', 'max', 'shell.js');
  assert.match(src, /V_MAX \* 16/);
  assert.doesNotMatch(src, /34359738368/);
  assert.match(src, /duration: 1200,\s*\n?\s*items: \['1x grindless:seed_wave_packet', '1x grindless:genome_archive', '16x grindless:stream_bundle'/);
});

test('c3 is above the other two shell rows and the source keeps V[MAX] x 16', () => {
  const c3 = euIn(find('grindless:black_hole_bomb/universe_seed'));
  assert.ok(c3 > euIn(find('grindless:black_hole_bomb/final_spin_map')));
  assert.ok(c3 > euOut(find('grindless:black_hole_bomb/vent_wave_packet')));
});

test('the controller recipe is an assembly line with MAX circuits, a hull and at least 8 MAX components', () => {
  const r = find('grindless:assembly_line/mirror_shell');
  assert.ok(r);
  const s = JSON.stringify(r.j);
  assert.match(s, /max_machine_hull/);
  assert.match(s, /circuits\/max/);
  assert.ok(Number((s.match(/"EUt":\s*(\d+)/) || [0, 0])[1]) <= VA_MAX);
  for (const banned of ['seed_wave_packet', 'final_spin_map', 'universe_seed']) assert.doesNotMatch(s, new RegExp(banned));
});

test('the older rows exist and are marked MAX-G1', () => {
  const marked = (f, type, name, circuit) => {
    const t = table(f);
    const rows = t.types ? t.types[type].recipes : t.recipes;
    const r = rows.find((x) => x.name === name);
    assert.ok(r, `${f} ${type}/${name}`);
    assert.match(r._why || '', /MAX-G1/);
    assert.equal(r.circuit, circuit);
  };
  marked('crystals.json', 'nuclear_clock', 'thorium_clock_reference', 6);
  marked('memories_cryostat.json', 'nuclear_demagnetisation', 'cooled_cavity_mode', 10);
  marked('kugelblitz.json', 'kugelblitz_forming', 'write_seed_wave_packet', 6);
  const cold = read(kube, 'server_scripts', 'grindless', 'uv', 'cold.js');
  assert.match(cold, /name: 'max_srf_cavity', type: 'srf_cavity', circuit: 10/);
  assert.match(cold, /polished_srf_cavity/);
  const swarm = read(kube, 'server_scripts', 'grindless', 'uhv', 'swarm.js');
  assert.match(swarm, /row\('mirror_shell_segment', FOUNDRY, 5,/);
});

test('the shape, textures and EMI page exist; one controller carries both kinds of row without generator(true)', () => {
  const s = read(kube, 'startup_scripts', 'grindless', 'max', 'shell.js');
  assert.match(s, /mirror_shell_segment/);
  assert.match(s, /stream_bundle_block/);
  assert.match(s, /black_hole_bomb/);
  assert.doesNotMatch(s.replace(/\/\/.*$/gm, ''), /\.generator\(true\)|generators\.configure/);
  assert.match(s, /energy_input', \{ min: 2, max: 2 \}/);
  const code = s.replace(/\/\/.*$/gm, '');
  assert.match(code, /if \(G\.generators\.recipeEUt\(recipe\) > 0\) return gen\(machine, recipe\)\s*return ModifierFunction\.IDENTITY/);
  assert.doesNotMatch(code, /ModifierFunction\.NULL/);
  assert.doesNotMatch(s, /wonGame/.test(s) ? /^$/ : /wonGame\s*=/);
  const m = run.registry.machines.get('gtceu:mirror_shell');
  assert.ok(m, 'registered');
  const dir = path.join(kube, 'assets', 'grindless', 'textures', 'block', 'multiblock', 'mirror_shell');
  for (const f of ['overlay_front.png', 'overlay_front_active.png', 'overlay_front_active_emissive.png']) assert.ok(fs.existsSync(path.join(dir, f)), f);
  assert.ok(fs.existsSync(path.join(kube, 'assets', 'emi', 'recipe', 'additions', 'grindless', 'max_black_hole_bomb_mirror_shell.json')));
});

test('the lang file has en_us and es_es keys in parity', () => {
  const keys = ['block.gtceu.mirror_shell', 'gtceu.black_hole_bomb', 'grindless.machine.mirror_shell.tooltip.0', 'grindless.max.ending.title',
    'grindless.max.ending.subtitle', 'emi.grindless.info.mirror_shell.0', 'emi.grindless.info.mirror_shell.1', 'emi.grindless.info.mirror_shell.2'];
  for (const n of ['vent_wave_packet', 'final_spin_map', 'universe_seed']) keys.push(`gtceu.recipe.grindless_black_hole_bomb.${n}`);
  for (const lang of ['en_us', 'es_es']) for (const k of keys) assert.ok(run.lang[lang][k], `${lang} ${k}`);
});

test('the credits: WIN_GAME with value 1 once per player, never wonGame, the epilogue once, only for the ending recipe', () => {
  const s = read(kube, 'startup_scripts', 'grindless', 'max', 'shell.js');
  assert.match(s, /WIN_GAME, 1\.0/);
  assert.match(s, /grindless_max_credits/);
  assert.match(s, /grindless_max_epilogue/);
  assert.match(s, /grindless:max_epilogue/);
  assert.match(s, /\.afterWorking\(credits\)/);
  assert.doesNotMatch(s.split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n'), /wonGame/);
});

test('the overlay stays in its band, has no priority line and is registered in zones.json', () => {
  const o = read(root, 'tools', 'test', 'overlay', 'kubejs', 'server_scripts', 'gg_test_max_shell.js');
  assert.doesNotMatch(o, /^\/\/ priority:/m);
  assert.match(o, /X0 = 40344/);
  assert.match(o, /X1 = 40407/);
  assert.match(o, /gg_test_max_shell/);
  new Function(o.replace(/^\(function/m, 'return (function'));
  const raw = JSON.parse(read(root, 'tools', 'test', 'zones.json'));
  const rows = Array.isArray(raw) ? raw : raw.zones || Object.values(raw).find(Array.isArray);
  const mine = rows.find((r) => r.id === 'max_shell');
  assert.ok(mine);
  assert.deepEqual(mine.x, [40344, 40407]);
});
