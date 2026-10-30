// UV's Neptune orbit machines (package UV-B2), no game needed: the pack's scripts run in the stand-in of lib/kubejs_static.mjs.
//   startup: the triton_plume type, the deep siphon on ZPM's siphon type and the sampler, valid patterns; server: the Neptune rows (Neptune
//   orbit only, one circuit each in a type, UV VA), ZPM's Uranus rows untouched, the deuterium row, crafting; the only producers of the
//   Neptune gases and the Triton ice core; the ZPM siphon's veto keeps the same prefix; text and textures.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const pack = path.join(root, 'pack');
const run = runPackScripts(pack);
const plain = (x) => JSON.parse(JSON.stringify(x, (k, v) => (typeof v === 'function' ? undefined : v)));
const NE = plain(run.global.grindless.uvNeptune);
const recipes = run.docs.recipes.recipes;
const byId = (id) => recipes.find((r) => r.i === id);
const MACHINES = { neptune_deep_siphon: 'ice_giant_siphon', triton_geyser_sampler: 'triton_plume' };
const ORBIT = 'grindless:neptune_orbit';
const circuitOf = (r) => r.j.inputs.item.filter((i) => i.content.type === 'gtceu:circuit').map((i) => i.content.configuration);

test('the stand-in runs the neptune scripts without errors', () => {
  const errs = run.errors.filter((e) => /neptune|uranus/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(NE.skipped, [], 'no recipe skipped for an unknown id');
  assert.deepEqual(NE.clashes, [], 'no recipe clashes in the lookup');
});

test('registration: the triton_plume type, the two machines on their types', () => {
  assert.ok(run.registry.recipeTypes.has('gtceu:triton_plume'));
  assert.ok(run.registry.recipeTypes.has('gtceu:ice_giant_siphon'), 'ZPM still registers the shared siphon type');
  for (const [m, t] of Object.entries(MACHINES)) {
    const def = run.registry.machines.get('gtceu:' + m);
    assert.ok(def, m + ' registered');
    assert.deepEqual(def.recipeTypes, ['gtceu:' + t]);
  }
  assert.equal(NE.orbit, ORBIT);
  assert.equal(NE.siphonPrefix, 'ice_giant_siphon/neptune_');
});

test('the patterns: one controller in the front slice, uniform size, a symbol for every cell, UV parts', () => {
  for (const name of Object.keys(MACHINES)) {
    const s = run.docs.structures.structures['gtceu:' + name];
    assert.ok(s, name + ' described');
    const front = s.slices[s.slices.length - 1];
    assert.equal(front.join('').split('').filter((c) => c === 'S').length, 1, name + ' one controller');
    const height = s.slices[0].length;
    assert.ok(height <= 16 && s.slices.every((sl) => sl.length === height));
    const width = s.slices[0][0].length;
    assert.ok(s.slices.every((sl) => sl.every((row) => row.length === width)));
    for (const sl of s.slices) for (const row of sl) for (const c of row) assert.ok(c === ' ' || s.symbols[c], name + ' symbol ' + c);
    const x = s.symbols.X;
    assert.equal(x.kind, 'oneOf');
    const lim = Object.fromEntries(x.options.filter((o) => o.kind === 'part').map((o) => [o.ability, o.limits]));
    assert.deepEqual(lim.energy_input, { min: 1, max: 2 });
    assert.ok(lim.input_bus, name + ' has an input bus');
  }
});

test('the Neptune rows: Neptune orbit only, one circuit per type slot, UV VA; the deuterium row in the Saturn column', () => {
  const machine = NE.recipes.filter((p) => p.dim === ORBIT);
  assert.deepEqual(machine.map((p) => `${p.type}:${p.circuit}`).sort(),
    ['ice_giant_siphon:4', 'ice_giant_siphon:5', 'triton_plume:1', 'triton_plume:2']);
  for (const p of NE.recipes) {
    const r = byId(p.recipeId);
    assert.ok(r, p.recipeId + ' added');
    assert.equal(r.t, 'gtceu:' + p.type);
    assert.deepEqual(circuitOf(r), [p.circuit]);
    assert.ok(Number.isInteger(p.duration) && p.duration > 0);
    assert.match(JSON.stringify(r.j), new RegExp(p.dim), p.name + ' is dimension-locked');
    if (p.dim === ORBIT) assert.equal(p.eut, 491520);
    if (p.type === 'ice_giant_siphon') assert.ok(p.recipeId.startsWith('grindless:' + NE.siphonPrefix), p.name + ' carries the deep-siphon prefix');
  }
  const d = byId('grindless:cryogenic_isotope_separation/neptune_deuterium');
  assert.ok(d, 'deuterium row');
  assert.deepEqual(circuitOf(d), [4]);
  const column = recipes.filter((r) => r.t === 'gtceu:cryogenic_isotope_separation').flatMap(circuitOf);
  assert.equal(column.filter((c) => c === 4).length, 1, 'circuit 4 is free in the isotope column');
  const h = byId('grindless:cryogenic_isotope_separation/neptune_helium_three');
  assert.ok(h, 'helium-3 concentrate row');
  assert.deepEqual(circuitOf(h), [5]);
  assert.equal(column.filter((c) => c === 5).length, 1, 'circuit 5 is free in the isotope column');
});

test('ZPM\'s Uranus rows on the shared siphon type are unchanged (circuits 1-4, Uranus orbit, ZPM VA)', () => {
  const zpm = recipes.filter((r) => r.t === 'gtceu:ice_giant_siphon' && !r.i.startsWith('grindless:' + NE.siphonPrefix));
  assert.deepEqual(zpm.map((r) => r.i).sort(), ['grindless:ice_giant_siphon/atmosphere_sample', 'grindless:ice_giant_siphon/diamond_rain',
    'grindless:ice_giant_siphon/uranus_hydrogen', 'grindless:ice_giant_siphon/uranus_ices']);
  for (const r of zpm) {
    assert.match(JSON.stringify(r.j), /grindless:uranus_orbit/);
    assert.ok(!/neptune_orbit/.test(JSON.stringify(r.j)));
  }
  assert.deepEqual(zpm.flatMap(circuitOf).sort(), [1, 2, 3, 4]);
  const src = fs.readFileSync(path.join(pack, 'kubejs', 'startup_scripts', 'grindless', 'zpm', 'uranus.js'), 'utf8');
  assert.ok(src.includes(`'${NE.siphonPrefix}'`), 'the ZPM siphon vetoes the same prefix');
});

test('acceptance: Neptune helium and hydrogen only from the deep siphon, the Triton ice core only from the sampler', () => {
  const producers = (re) => recipes.filter((r) => re.test(JSON.stringify(r.j.outputs || {}))).map((r) => r.i).sort();
  assert.deepEqual(producers(/gtceu:neptune_helium/), ['grindless:ice_giant_siphon/neptune_deep_hydrogen']);
  assert.deepEqual(producers(/gtceu:neptune_hydrogen/), ['grindless:ice_giant_siphon/neptune_deep_hydrogen']);
  assert.deepEqual(producers(/grindless:triton_ice_core/), ['grindless:triton_plume/triton_geyser_ice_core']);
  assert.deepEqual(producers(/gtceu:triton_nitrogen/), ['grindless:triton_plume/triton_geyser_ice_core', 'grindless:triton_plume/triton_geyser_nitrogen']);
});

test('crafting of the two controllers', () => {
  for (const m of Object.keys(MACHINES)) assert.ok(byId('grindless:assembly_line/' + m), m + ' assembly line recipe');
});

test('every new name and tooltip has en_us and es_es text, and the reused overlays exist', () => {
  const en = run.lang.en_us || {};
  const es = run.lang.es_es || {};
  const keys = ['gtceu.triton_plume'];
  for (const m of Object.keys(MACHINES)) {
    keys.push('block.gtceu.' + m, `grindless.machine.${m}.no_voiding`);
    for (const i of [0]) keys.push(`grindless.machine.${m}.tooltip.${i}`);
  }
  for (const k of keys) {
    assert.ok(en[k] && en[k].length > 3, 'en_us ' + k);
    assert.ok(es[k] && es[k].length > 3, 'es_es ' + k);
    assert.notEqual(en[k], es[k], 'es_es ' + k + ' is translated');
  }
  for (const o of ['ice_giant_siphon', 'plume_sampler']) {
    const dir = path.join(pack, 'kubejs', 'assets', 'grindless', 'textures', 'block', 'multiblock', o);
    for (const f of ['overlay_front.png', 'overlay_front_active.png', 'overlay_front_active_emissive.png']) assert.ok(fs.existsSync(path.join(dir, f)), o + '/' + f);
  }
});
