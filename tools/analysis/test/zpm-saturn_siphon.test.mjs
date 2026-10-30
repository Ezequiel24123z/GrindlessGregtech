// ZPM's Saturn siphon (package ZPM-B2), no game needed: the pack's scripts run in the stand-in of lib/kubejs_static.mjs.
//   startup: three recipe types, three machines with valid patterns; server: the six recipes (one circuit each per type, Saturn orbit only),
//   the tools' and controllers' crafting recipes; the F1 ids un-hidden; text and textures.
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
const SS = plain(run.global.grindless.saturnSiphon);
const recipes = run.docs.recipes.recipes;
const byId = (id) => recipes.find((r) => r.i === id);
const MACHINES = ['gas_giant_siphon', 'isotope_column', 'ring_harvester'];
const TYPES = ['gas_giant_siphon', 'cryogenic_isotope_separation', 'ring_harvesting'];
const circuitOf = (r) => r.j.inputs.item.filter((i) => i.content.type === 'gtceu:circuit').map((i) => i.content.configuration);

test('the stand-in runs the saturn siphon scripts without errors', () => {
  const errs = run.errors.filter((e) => /saturn_siphon/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(SS.skipped, [], 'no recipe skipped for an unknown id');
  assert.deepEqual(SS.clashes, [], 'no recipe clashes in the lookup');
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
    assert.ok(lim.input_bus && lim.output_hatch, name + ' has input bus and output hatch');
  }
});

test('the six recipes: Saturn orbit only, one circuit per type slot, ZPM VA, whole numbers', () => {
  // UEV-A7 adds the boron-11 trifluoride row
  assert.equal(SS.recipes.length, 7);
  const seen = new Set();
  for (const p of SS.recipes) {
    const r = byId(p.recipeId);
    assert.ok(r, p.recipeId + ' added');
    assert.equal(r.t, 'gtceu:' + p.type);
    assert.deepEqual(circuitOf(r), [p.circuit]);
    assert.ok(!seen.has(p.type + p.circuit), 'circuit unique within its type');
    seen.add(p.type + p.circuit);
    assert.equal(p.eut, 122880);
    assert.ok(Number.isInteger(p.duration) && p.duration > 0);
    assert.match(JSON.stringify(r.j), /grindless:saturn_orbit/, p.name + ' is dimension-locked');
  }
});

test('the siphon needs the survey (not consumed) and a worn scoop head on every run', () => {
  for (const name of ['siphon_hydrogen_helium', 'siphon_ices']) {
    const r = byId('grindless:gas_giant_siphon/' + name);
    const text = JSON.stringify(r.j.inputs.item);
    assert.match(text, /jovian_atmosphere_survey/);
    assert.match(text, /scoop_head/);
  }
});

test('bulk deuterium and helium-3 come only from the isotope column', () => {
  const makers = (fluid) => recipes.filter((r) => r.j.outputs && JSON.stringify(r.j.outputs.fluid || []).includes(fluid)).map((r) => r.t);
  assert.ok(makers('gtceu:helium_3').includes('gtceu:cryogenic_isotope_separation'));
  assert.ok(makers('gtceu:deuterium').includes('gtceu:cryogenic_isotope_separation'));
  assert.ok(byId('grindless:cryogenic_isotope_separation/helium_three') && byId('grindless:cryogenic_isotope_separation/deuterium'));
});

test('tools and controllers have crafting or assembler recipes', () => {
  assert.ok(byId('grindless:scoop_head') || recipes.some((r) => /scoop_head/.test(r.i)), 'scoop head recipe');
  assert.ok(recipes.some((r) => /ring_sail_net/.test(r.i)), 'ring sail net recipe');
  for (const m of MACHINES) assert.ok(byId('grindless:assembly_line/' + m), m + ' crafting recipe');
  assert.ok(byId('grindless:distillery/ring_ice_melt'), 'ring ice has a use');
});

test('the F1 ids are un-hidden and their obtain rule is gone', () => {
  const hidden = fs.readFileSync(path.join(pack, 'kubejs', 'data', 'grindless', 'tables', 'hidden_until.json'), 'utf8');
  for (const id of ['saturn_helium', 'ring_ice', 'grindless:scoop_head', 'grindless:ring_sail_net', 'grindless:ring_ice_sample']) {
    assert.ok(!hidden.includes(`"${id}"`), id + ' not hidden');
  }
  const obtain = fs.readFileSync(path.join(root, 'tools', 'analysis', 'tiers', 'obtain.json'), 'utf8');
  assert.ok(!/ZPM \(B2\)/.test(obtain), 'the ZPM-F1 (B2) rule is deleted');
});

test('every new name and tooltip has en_us and es_es text, and the textures exist', () => {
  const en = run.lang.en_us || {};
  const es = run.lang.es_es || {};
  const keys = [];
  for (const m of MACHINES) {
    keys.push('block.gtceu.' + m);
    for (const i of [0]) keys.push(`grindless.machine.${m}.tooltip.${i}`);
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
  assert.match(fs.readFileSync(path.join(root, 'tools', 'assets', 'README.md'), 'utf8'), /Build-ZPMSaturnSiphonTextures\.ps1/);
});
