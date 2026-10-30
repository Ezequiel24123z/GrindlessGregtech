// ZPM's Titan probes (package ZPM-B3), no game needed: the pack's scripts run in the stand-in of lib/kubejs_static.mjs.
//   startup: two recipe types, two machines with valid patterns, the recording item and the nitrile material; server: the machine recipes
//   (one circuit each per type, Saturn orbit only), the decode step in A9's network (circuit 4), the support and crafting recipes;
//   the F1 ids un-hidden; text and textures.
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
const ZT = plain(run.global.grindless.zpmTitanProbes);
const recipes = run.docs.recipes.recipes;
const byId = (id) => recipes.find((r) => r.i === id);
const MACHINES = ['entry_probe_bay', 'tholin_reformer'];
const TYPES = ['titan_entry', 'tholin_reforming'];
const circuitOf = (r) => r.j.inputs.item.filter((i) => i.content.type === 'gtceu:circuit').map((i) => i.content.configuration);

test('the stand-in runs the titan probe scripts without errors', () => {
  const errs = run.errors.filter((e) => /titan_probes/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(ZT.skipped, [], 'no recipe skipped for an unknown id');
  assert.deepEqual(ZT.clashes, [], 'no recipe clashes in the lookup');
});

test('registration: two recipe types, two machines on them, the recording item', () => {
  TYPES.forEach((t, i) => {
    assert.ok(run.registry.recipeTypes.has('gtceu:' + t), t);
    const m = run.registry.machines.get('gtceu:' + MACHINES[i]);
    assert.ok(m, MACHINES[i] + ' registered');
    assert.deepEqual(m.recipeTypes, ['gtceu:' + t]);
  });
  assert.ok(run.registry.items.has('grindless:titan_probe_recording'), 'recording item registered');
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

test('the six recipes: Saturn orbit only (the decode step is Earth), one circuit per type slot, ZPM VA', () => {
  assert.equal(ZT.recipes.length, 6);
  const seen = new Set();
  for (const p of ZT.recipes) {
    const r = byId(p.recipeId);
    assert.ok(r, p.recipeId + ' added');
    assert.equal(r.t, 'gtceu:' + p.type);
    assert.deepEqual(circuitOf(r), [p.circuit]);
    assert.ok(!seen.has(p.type + p.circuit), 'circuit unique within its type');
    seen.add(p.type + p.circuit);
    assert.equal(p.eut, 122880);
    assert.ok(Number.isInteger(p.duration) && p.duration > 0);
    if (p.type === 'telemetry_decoding') assert.doesNotMatch(JSON.stringify(r.j), /saturn_orbit/, 'the decode step runs on Earth');
    else assert.match(JSON.stringify(r.j), /grindless:saturn_orbit/, p.name + ' is dimension-locked');
  }
});

test('the decode step takes a free circuit of A9 (4) and the probe loop closes', () => {
  const decodes = recipes.filter((r) => r.t === 'gtceu:telemetry_decoding').map((r) => circuitOf(r)[0]).sort();
  // UIV-B3 adds circuit 5 (j0437_pulse_timed)
  // UXV-B4 adds circuit 6 (vela_glitch_timing)
  assert.deepEqual(decodes, [1, 2, 3, 4, 5, 6]);
  const d = byId('grindless:telemetry_decoding/titan_lake_sampler');
  assert.match(JSON.stringify(d.j.inputs.item), /titan_probe_recording/);
  assert.match(JSON.stringify(d.j.outputs.item), /lake_sampler/);
  assert.match(JSON.stringify(byId('grindless:titan_entry/haze_descent').j.outputs.item), /tholin/);
  assert.match(JSON.stringify(byId('grindless:titan_entry/lake_sampling').j.inputs.item), /lake_sampler/);
});

test('the reformer keeps hydrogen cyanide inside: no recipe outputs it', () => {
  for (const r of recipes.filter((x) => x.t === 'gtceu:tholin_reforming')) assert.doesNotMatch(JSON.stringify(r.j.outputs), /cyanide|hcn/);
});

test('the PICA heat shield has a use, the casing and the controllers have recipes', () => {
  const probe = byId('grindless:assembler/titan_entry_probe');
  assert.ok(probe && /pica_heat_shield/.test(JSON.stringify(probe.j.inputs.item)), 'probe assembler consumes the PICA shield');
  assert.ok(byId('grindless:assembler/probe_bay_casing'), 'casing recipe');
  for (const m of MACHINES) assert.ok(byId('grindless:assembly_line/' + m), m + ' crafting recipe');
});

test('the F1 ids are un-hidden and their obtain rule is gone', () => {
  const hidden = fs.readFileSync(path.join(pack, 'kubejs', 'data', 'grindless', 'tables', 'hidden_until.json'), 'utf8');
  for (const id of ['grindless:titan_entry_probe', 'grindless:lake_sampler', 'grindless:tholin', 'grindless:probe_bay_casing']) {
    assert.ok(!hidden.includes(`"${id}"`), id + ' not hidden');
  }
  const obtain = fs.readFileSync(path.join(root, 'tools', 'analysis', 'tiers', 'obtain.json'), 'utf8');
  assert.ok(!/ZPM \(B3\)/.test(obtain), 'the ZPM-F1 (B3) rule is deleted');
});

test('every new name and tooltip has en_us and es_es text, and the textures exist', () => {
  const en = run.lang.en_us || {};
  const es = run.lang.es_es || {};
  const keys = ['item.grindless.titan_probe_recording', 'material.gtceu.titan_nitriles', 'tooltip.grindless.titan_probe_recording.0',
    'tooltip.grindless.titan_probe_recording.1'];
  for (const m of MACHINES) {
    keys.push('block.gtceu.' + m);
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
  assert.ok(fs.existsSync(path.join(pack, 'kubejs', 'assets', 'grindless', 'textures', 'item', 'titan_probe_recording.png')), 'recording texture');
  assert.match(fs.readFileSync(path.join(root, 'tools', 'assets', 'README.md'), 'utf8'), /Build-ZPMTitanProbesTextures\.ps1/);
});
