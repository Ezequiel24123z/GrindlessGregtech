// ZPM's Saturn science machines (package ZPM-B4), no game needed: the pack's scripts run in the stand-in of lib/kubejs_static.mjs.
//   startup: two recipe types, two machines with valid patterns; server: three machine recipes (Saturn orbit only, one circuit each),
//   the cartridge assembler recipes, crafting and copy recipes; the F1 ids un-hidden; text and textures.
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
const SC = plain(run.global.grindless.zpmSaturnScience);
const recipes = run.docs.recipes.recipes;
const byId = (id) => recipes.find((r) => r.i === id);
const MACHINES = ['plume_sampler', 'ring_seismometer'];
const TYPES = ['plume_sampling', 'kronoseismology'];
const circuitOf = (r) => r.j.inputs.item.filter((i) => i.content.type === 'gtceu:circuit').map((i) => i.content.configuration);

test('the stand-in runs the saturn science scripts without errors', () => {
  const errs = run.errors.filter((e) => /saturn_science/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(SC.skipped, [], 'no recipe skipped for an unknown id');
  assert.deepEqual(SC.clashes, [], 'no recipe clashes in the lookup');
});

test('registration: two recipe types and two machines on them', () => {
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

test('the three machine recipes: Saturn orbit only, one circuit per type slot, ZPM VA, whole numbers', () => {
  assert.equal(SC.recipes.length, 3);
  const seen = new Set();
  for (const p of SC.recipes) {
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

test('outputs fit the consumers: brine, nanograins, interior model, Uranus chart', () => {
  const sample = JSON.stringify(byId('grindless:plume_sampling/plume_sample').j.outputs);
  assert.match(sample, /enceladus_brine/);
  assert.match(sample, /silica_nanograins/);
  assert.match(JSON.stringify(byId('grindless:kronoseismology/saturn_interior_model').j.outputs), /saturn_interior_model/);
  assert.match(JSON.stringify(byId('grindless:kronoseismology/uranus_transfer_chart').j.outputs), /uranus_transfer_chart/);
  const model = JSON.stringify(byId('grindless:kronoseismology/saturn_interior_model').j.inputs);
  assert.match(model, /saturn_transfer_chart/);
});

test('the cartridge has an Earth bootstrap and an aerogel path; machines and copies have crafting recipes', () => {
  assert.ok(byId('grindless:assembler/aerogel_cartridge'), 'aerogel cartridge');
  assert.ok(byId('grindless:assembler/aerogel_cartridge_first'), 'first cartridge from silica dust');
  for (const m of MACHINES) assert.ok(byId('grindless:crafting/' + m), m + ' crafting recipe');
  assert.ok(byId('grindless:crafting/saturn_interior_model_copy'));
  assert.ok(byId('grindless:crafting/uranus_transfer_chart_copy'));
});

test('the F1 ids are un-hidden and their obtain rule is gone', () => {
  const hidden = fs.readFileSync(path.join(pack, 'kubejs', 'data', 'grindless', 'tables', 'hidden_until.json'), 'utf8');
  for (const id of ['grindless:silica_nanograins', 'enceladus_brine', 'grindless:aerogel_cartridge', 'grindless:saturn_interior_model', 'grindless:uranus_transfer_chart']) {
    assert.ok(!hidden.includes(`"${id}"`), id + ' not hidden');
  }
  const obtain = fs.readFileSync(path.join(root, 'tools', 'analysis', 'tiers', 'obtain.json'), 'utf8');
  assert.ok(!/ZPM \(B4\)/.test(obtain), 'the ZPM-F1 (B4) rule is deleted');
});

test('every new name and tooltip has en_us and es_es text, and the textures exist', () => {
  const en = run.lang.en_us || {};
  const es = run.lang.es_es || {};
  const keys = [];
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
  assert.match(fs.readFileSync(path.join(root, 'tools', 'assets', 'README.md'), 'utf8'), /Build-ZPMSaturnScienceTextures\.ps1/);
});
