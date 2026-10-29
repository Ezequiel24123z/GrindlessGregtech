// ZPM's Uranus orbit machines (package ZPM-B5), no game needed: the pack's scripts run in the stand-in of lib/kubejs_static.mjs.
//   startup: three recipe types, three machines with valid patterns; server: the machine recipes (Uranus orbit only, one circuit each in a type),
//   the isotope column recipe, part recipes and crafting; the F1 ids un-hidden; text and textures.
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
const UR = plain(run.global.grindless.zpmUranus);
const recipes = run.docs.recipes.recipes;
const byId = (id) => recipes.find((r) => r.i === id);
const MACHINES = ['ice_giant_siphon', 'slurry_separator', 'flyby_probe_bay'];
const TYPES = ['ice_giant_siphon', 'slurry_separation', 'outer_flyby'];
const circuitOf = (r) => r.j.inputs.item.filter((i) => i.content.type === 'gtceu:circuit').map((i) => i.content.configuration);

test('the stand-in runs the uranus scripts without errors', () => {
  const errs = run.errors.filter((e) => /uranus/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(UR.skipped, [], 'no recipe skipped for an unknown id');
  assert.deepEqual(UR.clashes, [], 'no recipe clashes in the lookup');
});

test('registration: three recipe types and three machines on them', () => {
  TYPES.forEach((t, i) => {
    assert.ok(run.registry.recipeTypes.has('gtceu:' + t), t);
    const m = run.registry.machines.get('gtceu:' + MACHINES[i]);
    assert.ok(m, MACHINES[i] + ' registered');
    assert.deepEqual(m.recipeTypes, ['gtceu:' + t]);
  });
});

test('the patterns: one controller in the front slice, uniform size, a symbol for every cell, ZPM-legal parts', () => {
  for (const name of MACHINES) {
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

test('the machine recipes: Uranus orbit only, one circuit per type slot, ZPM VA, whole numbers', () => {
  const machine = UR.recipes.filter((p) => p.dim === 'grindless:uranus_orbit');
  assert.equal(machine.length, 7);
  const seen = new Set();
  for (const p of UR.recipes) {
    const r = byId(p.recipeId);
    assert.ok(r, p.recipeId + ' added');
    assert.equal(r.t, 'gtceu:' + p.type);
    assert.deepEqual(circuitOf(r), [p.circuit]);
    assert.ok(!seen.has(p.type + p.circuit), 'circuit unique within its type');
    seen.add(p.type + p.circuit);
    assert.equal(p.eut, 122880);
    assert.ok(Number.isInteger(p.duration) && p.duration > 0);
    if (p.dim) assert.match(JSON.stringify(r.j), new RegExp(p.dim), p.name + ' is dimension-locked');
  }
});

test('outputs fit the consumers: hydrogen, methane, slurry, seed, recordings, sample', () => {
  const out = (id) => JSON.stringify(byId(id).j.outputs);
  assert.match(out('grindless:ice_giant_siphon/uranus_hydrogen'), /uranus_hydrogen/);
  assert.match(out('grindless:ice_giant_siphon/uranus_ices'), /methane/);
  assert.match(out('grindless:ice_giant_siphon/diamond_rain'), /diamond_slurry/);
  assert.match(out('grindless:ice_giant_siphon/atmosphere_sample'), /ice_giant_atmosphere_sample/);
  assert.match(out('grindless:slurry_separation/slurry_decompression'), /ice_giant_diamond_seed/);
  assert.match(out('grindless:outer_flyby/neptune_flyby'), /neptune_probe_recording/);
  assert.match(out('grindless:outer_flyby/triton_flyby'), /triton_probe_recording/);
  assert.match(JSON.stringify(byId('grindless:ice_giant_siphon/uranus_hydrogen').j.inputs), /saturn_interior_model/);
});

test('support recipes: probe, casing, sample flask, machine crafting', () => {
  for (const id of ['grindless:assembler/neptune_flyby_probe', 'grindless:assembler/pressure_hull_casing', 'grindless:centrifuge/neptune_sample_flask']) {
    assert.ok(byId(id), id);
  }
  for (const m of MACHINES) assert.ok(byId('grindless:assembly_line/' + m), m + ' crafting recipe');
});

test('the F1 ids are un-hidden and their obtain rule is gone', () => {
  const hidden = fs.readFileSync(path.join(pack, 'kubejs', 'data', 'grindless', 'tables', 'hidden_until.json'), 'utf8');
  for (const id of ['uranus_hydrogen', 'diamond_slurry', 'grindless:ice_giant_atmosphere_sample', 'grindless:ice_giant_diamond_seed', 'grindless:neptune_flyby_probe',
    'grindless:neptune_sample', 'grindless:neptune_probe_recording', 'grindless:triton_probe_recording', 'grindless:pressure_hull_casing']) {
    assert.ok(!hidden.includes(`"${id}"`), id + ' not hidden');
  }
  const obtain = fs.readFileSync(path.join(root, 'tools', 'analysis', 'tiers', 'obtain.json'), 'utf8');
  assert.ok(!/ZPM \(B5\)/.test(obtain), 'the ZPM-F1 (B5) rule is deleted');
});

test('every new name and tooltip has en_us and es_es text, and the textures exist', () => {
  const en = run.lang.en_us || {};
  const es = run.lang.es_es || {};
  const keys = ['emi.grindless.info.pressure_hull_casing.0'];
  for (const m of MACHINES) {
    keys.push('block.gtceu.' + m, `grindless.machine.${m}.no_voiding`);
    for (const i of [0, 1, 2]) keys.push(`grindless.machine.${m}.tooltip.${i}`);
  }
  for (const t of TYPES) keys.push('gtceu.' + t);
  for (const k of keys) {
    assert.ok(en[k] && en[k].length > 3, 'en_us ' + k);
    assert.ok(es[k] && es[k].length > 3, 'es_es ' + k);
    assert.notEqual(en[k], es[k], 'es_es ' + k + ' is translated');
  }
  for (const m of MACHINES) {
    const dir = path.join(pack, 'kubejs', 'assets', 'grindless', 'textures', 'block', 'multiblock', m);
    for (const f of ['overlay_front.png', 'overlay_front_active.png', 'overlay_front_active_emissive.png']) assert.ok(fs.existsSync(path.join(dir, f)), m + '/' + f);
  }
  assert.match(fs.readFileSync(path.join(root, 'tools', 'assets', 'README.md'), 'utf8'), /Build-ZPMUranusTextures\.ps1/);
});
