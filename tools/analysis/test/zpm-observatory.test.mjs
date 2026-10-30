// ZPM's survey network (package ZPM-A9), no game needed: the pack's scripts run in the stand-in of lib/kubejs_static.mjs.
//   startup: three recipe types, three machines with valid patterns; server: the six recipes (one circuit each per type, the telescope in
//   Earth orbit only), the casing and controller recipes; the F1 ids un-hidden; text and textures.
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
const OB = plain(run.global.grindless.zpmObservatory);
const recipes = run.docs.recipes.recipes;
const byId = (id) => recipes.find((r) => r.i === id);
const MACHINES = ['neutrino_observatory', 'deep_space_network', 'kuiper_survey_telescope'];
const TYPES = ['neutrino_detection', 'telemetry_decoding', 'kuiper_survey'];
const circuitOf = (r) => r.j.inputs.item.filter((i) => i.content.type === 'gtceu:circuit').map((i) => i.content.configuration);

test('the stand-in runs the observatory scripts without errors', () => {
  const errs = run.errors.filter((e) => /zpm.observatory/.test(String(e.file)) && !/UV energy hatch/.test(String(e.message)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(OB.skipped, [], 'no recipe skipped for an unknown id');
  assert.deepEqual(OB.clashes, [], 'no recipe clashes in the lookup');
});

test('registration: three recipe types and three machines on them', () => {
  TYPES.forEach((t, i) => {
    assert.ok(run.registry.recipeTypes.has('gtceu:' + t), t);
    const m = run.registry.machines.get('gtceu:' + MACHINES[i]);
    assert.ok(m, MACHINES[i] + ' registered');
    assert.deepEqual(m.recipeTypes, ['gtceu:' + t]);
  });
});

test('the patterns: one controller in the front slice, uniform size, a symbol for every cell', () => {
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
    const lim = Object.fromEntries(s.symbols.X.options.filter((o) => o.kind === 'part').map((o) => [o.ability, o.limits]));
    assert.deepEqual(lim.energy_input, { min: 1, max: 2 });
    assert.ok(lim.input_bus && lim.output_bus, name + ' has input and output buses');
  }
});

test('the seven recipes: one circuit per type slot, ZPM VA, whole numbers, Earth orbit only for the telescope and UIV-B3\'s timing row', () => {
  assert.equal(OB.recipes.length, 8); // UIV-B3 adds j0437_pulse_timed (circuit 5), UXV-B4 vela_glitch_timing (telemetry_decoding circuit 6)
  for (const p of OB.recipes) {
    const r = byId(p.recipeId);
    assert.ok(r, p.recipeId + ' added');
    assert.equal(r.t, 'gtceu:' + p.type);
    assert.deepEqual(circuitOf(r), [p.circuit]);
    assert.equal(p.eut, 122880);
    assert.ok(Number.isInteger(p.duration) && p.duration > 0);
    assert.equal(/overworld_orbit/.test(JSON.stringify(r.j)), p.type === 'kuiper_survey' || p.name === 'j0437_pulse_timed', p.name + ' dimension');
  }
});

test('the telescope uses the CVD diamond plate; the catalogue is kept; the recordings are decoded', () => {
  assert.match(JSON.stringify(byId('grindless:kuiper_survey/kuiper_target_list').j.inputs.item), /cvd_diamond_plate/);
  assert.match(JSON.stringify(byId('grindless:neutrino_detection/multimessenger_catalogue').j.inputs.item), /gravitational_wave_catalogue/);
  assert.deepEqual(OB.decodes, ['grindless:telemetry_decoding/neptune_flyby_data', 'grindless:telemetry_decoding/triton_flyby_data']);
  for (const id of OB.decodes) assert.ok(byId(id), id);
});

test('the casing and the controllers have recipes', () => {
  assert.ok(recipes.some((r) => /photomultiplier_casing/.test(r.i)), 'casing recipe');
  for (const m of MACHINES) assert.ok(byId('grindless:assembly_line/' + m), m + ' crafting recipe');
});

test('the UV hatch is re-added under its own id with the survey as a kept input', () => {
  const s = fs.readFileSync(path.join(pack, 'kubejs', 'server_scripts', 'grindless', 'zpm', 'observatory.js'), 'utf8');
  assert.ok(s.includes("'gtceu:assembly_line/energy_hatch_uv'"));
  assert.match(s, /notConsumable\(SURVEY\)/);
});

test('the F1 ids are un-hidden and their obtain rule is gone', () => {
  const hidden = fs.readFileSync(path.join(pack, 'kubejs', 'data', 'grindless', 'tables', 'hidden_until.json'), 'utf8');
  for (const id of ['solar_core_survey', 'multimessenger_catalogue', 'neptune_flyby_data', 'triton_flyby_data', 'pluto_kuiper_chart', 'kuiper_target_list', 'photomultiplier_casing']) {
    assert.ok(!hidden.includes(`"grindless:${id}"`), id + ' not hidden');
  }
  const obtain = fs.readFileSync(path.join(root, 'tools', 'analysis', 'tiers', 'obtain.json'), 'utf8');
  assert.ok(!/ZPM \(A9\)/.test(obtain), 'the ZPM-F1 (A9) rule is deleted');
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
  assert.match(fs.readFileSync(path.join(root, 'tools', 'assets', 'README.md'), 'utf8'), /Build-ZPMObservatoryTextures\.ps1/);
});
